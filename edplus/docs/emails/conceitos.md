# Conceitos

## Escrita dupla (*dual write problem*)

Uma operação de negócio precisa de escrever em **dois sistemas diferentes**, como uma
base de dados e um broker de mensagens. Não há uma transacção que abranja os dois, por
isso um pode ficar gravado e o outro não.

```ts
// Exemplo do que NÃO fazer
await db.transaction(async (tx) => {
  await tx.insert(enrollments)...   // escrita 1: PostgreSQL
  await rabbit.publish(email);      // escrita 2: RabbitMQ
});
```

| Falha | Resultado |
|---|---|
| Publica e depois a transacção faz rollback | Confirmação de uma inscrição **que não existe** |
| Faz commit e o processo cai antes de publicar | Inscrição feita e **email perdido** |
| Faz commit e o RabbitMQ está em baixo | Email perdido, ou erro mostrado ao aluno com a inscrição feita |

## *Transactional Outbox Pattern*

A solução para o *dual write*: escrever **só na BD**, na mesma transacção do negócio,
numa tabela "caixa de saída" (*outbox*). Um processo separado, o ***relay*** (ou
*message relay*), lê essa tabela e publica no broker.

**No projecto:**
- A *outbox* é a tabela `email_jobs`. `publishedAt = null` significa "por publicar".
- No checkout, o email é gravado com `enqueueEmail(..., { tx })`, dentro da transacção
  da inscrição.
- A publicação logo a seguir ao commit (`dispatchEmails`) é um atalho para o email sair
  depressa.
- A **garantia** vem do relay: `republishUnpublished()` no worker, a cada 30 s.

Uma variante mais sofisticada é o *Change Data Capture* (CDC, por exemplo Debezium),
que lê o log de transacções do PostgreSQL em vez de consultar a tabela. Para este
volume não se justifica.

## Entrega "pelo menos uma vez" (*at-least-once delivery*)

O RabbitMQ, com ack manual, garante que cada mensagem é entregue **pelo menos uma
vez**. Isso implica que **pode ser entregue mais de uma vez**: se o worker processa e
cai antes do `ack`, a mensagem é reentregue (`redelivered = true`).

As alternativas:
- *At-most-once* (auto-ack): nunca duplica, mas pode perder.
- *Exactly-once*: não existe de ponta a ponta com sistemas externos como o SMTP. Na
  prática consegue-se com *at-least-once* + consumidor idempotente.

## Idempotência e deduplicação

- **Idempotência** (*idempotency*): executar uma operação 1 ou N vezes dá o mesmo
  resultado.
- **Deduplicação** (*deduplication*): detectar e descartar repetições da mesma acção.
- ***Idempotency key* / *dedupe key***: identificador único da acção, usado para
  detectar a repetição.

**Onde há repetições no projecto:**
- A tarefa diária pode correr várias vezes no mesmo dia (reinício do worker,
  `worker:daily` manual).
- O RabbitMQ reentrega mensagens se o worker cair antes do `ack`.
- O relay pode publicar um job que o Next acabou de publicar (corrida).

**Como o projecto se protege, em duas camadas:**

### a) Na criação: `dedupeKey`

```ts
dedupeKey: `course_reminder:${row.enrollmentId}` // worker/scheduled.ts
```

A coluna `dedupe_key` é `UNIQUE` e o insert usa
`.onConflictDoNothing({ target: emailJobs.dedupeKey })`. Se a tarefa diária correr
cinco vezes, só o primeiro insert grava.

A chave junta o **tipo de email** e a **inscrição**. Por isso um lembrete e um
feedback da mesma inscrição **não** são duplicados um do outro.

O checkout e o reset de palavra-passe não usam `dedupeKey`:
- no checkout, só geram email os cursos inscritos de novo;
- no reset, cada pedido **deve** gerar um email novo, com um link novo.

### b) No consumo: *idempotent consumer* (`claimJob`)

```sql
UPDATE email_jobs SET status = 'processing', attempts = attempts + 1
WHERE id = $1 AND status = 'pending'
RETURNING *;
```

Só um worker consegue passar o job de `pending` para `processing`: a operação é atómica
no PostgreSQL. Uma mensagem duplicada não encontra o job em `pending` e é ignorada.

**Limite:** se o worker enviar o email e cair **antes** do `markSent`, a mensagem é
reentregue e `claimJob` aceita retomar um job em `processing`, por isso o email sai
duas vezes. Não há solução perfeita sem idempotência no SMTP. Um duplicado raro é
preferível a um email perdido.

## *Acknowledgement* (ack, nack)

- `ack`: o consumidor confirma que tratou a mensagem, e o RabbitMQ apaga-a.
- `nack` com `requeue: true`: devolve a mensagem à fila.
- `nack` com `requeue: false`: descarta a mensagem, ou manda-a para a dead-letter
  exchange, se estiver configurada.
- **Auto-ack** (`noAck: true`): a mensagem é considerada entregue assim que sai do
  broker. Se o processamento falhar, perde-se.

O worker usa **ack manual** e só confirma depois de enviar o email ou de agendar o
retry.

## *Publisher confirms*

O broker confirma ao publicador que recebeu e guardou a mensagem. Sem isto, um
`publish` pode "ter sucesso" e a mensagem nunca chegar. O projecto usa
`createConfirmChannel()` e `waitForConfirms()` em todas as publicações, e só marca
`publishedAt` depois da confirmação.

## *Dead letter exchange* (DLX) e *dead letter queue* (DLQ)

- **DLX**: exchange para onde o RabbitMQ reencaminha mensagens "mortas": expiradas por
  TTL, rejeitadas sem requeue, ou que excederam o limite da fila.
- **DLQ**: fila onde se estacionam mensagens que não puderam ser processadas, para
  inspecção.

**No projecto, com dois usos:**
- **Retry com backoff:** as filas `retry.*` têm TTL e DLX a apontar para a exchange
  principal. A mensagem "morre" por TTL e volta à fila principal. É assim que se
  implementa espera sem código de agendamento.
- **DLQ:** `academia.emails.failed` recebe os jobs que esgotaram as 5 tentativas. Não
  tem consumidor. A fonte da verdade para reenvios é a BD (`status = failed`).

## *Exponential backoff*

Aumentar o intervalo entre tentativas (1 min, 5 min, 30 min, 2 h), para não
sobrecarregar um serviço que está em baixo e dar-lhe tempo para recuperar.

## *Poison message*

Mensagem que falha sempre, por exemplo por um payload inválido. Com `nack` e requeue
sem limite, fica em loop infinito. O projecto evita isto de duas formas:
- limita as tentativas a `maxAttempts` e depois manda para a DLQ;
- descarta com `ack` as mensagens que não se conseguem interpretar.

## Filas quorum (*quorum queues*)

Tipo de fila do RabbitMQ replicada por um cluster (algoritmo Raft), durável e segura
para dados importantes. Suporta prioridade (normal / alta, com o limiar > 4) e limite
de entregas (`x-delivery-limit`). Os argumentos de uma fila quorum não podem ser
alterados depois de criada: é preciso apagá-la e recriá-la, ou usar *policies*.

## Onde se perdem mensagens sem outbox

Com o RabbitMQ bem configurado (ack manual, filas duráveis, mensagens persistentes,
DLX), uma falha **no consumo** não perde a mensagem. O risco está sobretudo **na
publicação**.

| Momento | Só RabbitMQ | Outbox + RabbitMQ |
|---|---|---|
| Publicação (broker em baixo, crash, rollback) | **Perde-se** ou fica inconsistente | Fica na BD e é republicado |
| Envio no worker (SMTP falha) | Não se perde (retry / DLQ) | Não se perde (retry + estado na BD) |
| Worker cai a meio | Reentregue (pode duplicar) | Reentregue; `claimJob` evita a maioria dos duplicados |
| Consultar ou reenviar falhas | Difícil (inspecção mensagem a mensagem) | SQL ou backoffice |

Configurações que **causam perdas**:
- auto-ack, ou `ack` antes de processar;
- `nack` sem requeue e sem DLX;
- filas não duráveis ou mensagens não persistentes;
- publicar sem *publisher confirms*;
- DLQ com TTL ou limite de tamanho, ou purgada.
