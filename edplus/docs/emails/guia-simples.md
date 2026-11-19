# Guia simples: como funcionam os emails

Este guia explica o sistema de emails **sem assumir conhecimentos prévios**. Cada termo
técnico é explicado na primeira vez que aparece e está também no
[glossário](#glossário) no fim. Para o detalhe técnico, ver
[arquitectura.md](arquitectura.md) e [conceitos.md](conceitos.md).

## 1. A ideia em uma analogia

Pense numa **estação de correios**:

| No mundo real | No projecto |
|---|---|
| O cliente escreve a carta e entrega-a no balcão | O **site** (Next.js) decide que é preciso mandar um email |
| O funcionário regista a carta num **livro de registos** antes de fazer qualquer coisa | O site grava o email na tabela **`email_jobs`** da base de dados |
| Põe um **talão** com o número do registo no tapete rolante | O site publica uma **mensagem** com o `jobId` no **RabbitMQ** |
| O carteiro pega no talão, vai ao livro buscar a carta e entrega-a | O **worker** lê a mensagem, vai à BD buscar o email e envia-o por **SMTP** |
| O carteiro escreve "entregue" no livro | O worker marca o job como `sent` |
| Se a morada estiver fechada, volta a tentar mais tarde | Retry após 1 min, 5 min, 30 min, 2 h |
| Um supervisor revê o livro de meia em meia hora: "há cartas registadas que nunca foram para o tapete?" | O **relay** do worker, a cada 30 s, procura jobs com `publishedAt` vazio |

A regra mais importante: **o livro (BD) é a verdade**. O tapete (RabbitMQ) só serve
para avisar o carteiro depressa. Se um talão se perder, o supervisor encontra a carta
no livro e põe outro talão.

## 2. As peças

```
   SITE (Next.js)                      WORKER (Bun, 1 processo)
   ─────────────                       ────────────────────────
   "preciso de mandar                  ┌─ consumidor: lê a fila e envia
    um email"                          ├─ relay: republica o que ficou esquecido
        │                              ├─ tarefas diárias: lembretes e feedback
        │                              └─ /health: diz se está tudo bem
        ▼                                     ▲            │
   ┌──────────────┐   talão (jobId)   ┌───────┴──────┐     │ SMTP
   │ PostgreSQL   │ ─ ─ ─ ─ ─ ─ ─ ─ ▶ │  RabbitMQ    │     ▼
   │ email_jobs   │ ◀──── lê / actualiza ──────────── ┌──────────────┐
   │ (o "livro")  │                   │ (o "tapete") │ │Microsoft 365 │
   └──────────────┘                   └──────────────┘ └──────────────┘
```

| Peça | O que é, em palavras simples |
|---|---|
| **Site (Next.js)** | A aplicação web. Quando um aluno se inscreve ou pede para recuperar a palavra-passe, é aqui que nasce o pedido de email. |
| **PostgreSQL** | A base de dados. Guarda tudo de forma permanente. |
| **Tabela `email_jobs`** | Uma linha por email: para quem é, que template usa, em que estado está, quantas vezes se tentou. |
| **RabbitMQ** | Um "carteiro de mensagens" (*message broker*). Recebe mensagens de um programa e entrega-as a outro. Guarda-as até alguém as tratar. |
| **Worker** | Um programa à parte, sempre ligado, que envia os emails. Não serve páginas nem atende utilizadores. |
| **SMTP / Microsoft 365** | O protocolo e o serviço que realmente entregam o email na caixa do destinatário. Aceita no máximo **30 emails por minuto** por caixa. |

## 3. A viagem de um email, passo a passo

Exemplo: um aluno faz checkout de um curso.

### Passo 1: gravar no "livro"

```ts
await db.transaction(async (tx) => {
  // grava a inscrição...
  queued = await enqueueEmail({ template: "enrollment_confirmation", ... }, { tx });
});
```

- `db.transaction(...)`: tudo o que está lá dentro **acontece todo ou não acontece
  nada**. Se a inscrição falhar, o email também não fica gravado.
- `enqueueEmail(...)`: cria uma linha em `email_jobs` com `status = pending` ("à espera")
  e `publishedAt = null` ("ainda ninguém avisou o RabbitMQ").

É por isto que se chama ***Transactional Outbox***: o email é gravado numa "caixa de
saída" (*outbox*) **dentro da mesma transacção** do negócio.

### Passo 2: avisar o RabbitMQ

```ts
await dispatchEmails(queued);
```

- Envia ao RabbitMQ uma mensagem minúscula: `{ "jobId": "abc-123" }`. **Não** envia o
  conteúdo do email, só o número do registo.
- Espera que o RabbitMQ responda "recebi e guardei" (*publisher confirm*).
- Só depois preenche `publishedAt` na BD.
- Se o RabbitMQ estiver em baixo, **não dá erro ao aluno**: só escreve no log. O relay
  trata disso depois (passo 3).

### Passo 3: o relay (rede de segurança)

A cada 30 segundos, o worker corre `republishUnpublished()`:

1. `findUnpublished(100)`: procura até 100 jobs em `pending`, com `publishedAt` vazio
   e criados **há mais de 1 minuto**. O minuto de margem existe para não "roubar" o
   trabalho ao site, que normalmente publica em milissegundos.
2. Publica cada um no RabbitMQ.
3. `markPublished(...)`: preenche `publishedAt`.

**Relay** quer dizer "retransmissor": pega no que ficou na BD e passa-o para o RabbitMQ.

### Passo 4: o worker envia

Quando chega uma mensagem, o worker corre `handleMessage()`:

1. **`parseEmailMessage()`**: lê a mensagem. Se estiver estragada, deita-a fora.
2. **`claimJob()`**: "reserva" o job na BD:
   ```sql
   UPDATE email_jobs SET status = 'processing', attempts = attempts + 1
   WHERE id = 'abc-123' AND status = 'pending'
   ```
   Só funciona se o job ainda estiver `pending`. Se já foi enviado (`sent`) ou outro
   worker o apanhou primeiro, não devolve nada e a mensagem é ignorada. **É isto que
   impede a maioria dos duplicados.**
3. **`renderEmailJob()`**: monta o email (assunto, HTML, texto) a partir do template e
   dos dados (`payload`).
4. **`throttle()`**: espera, se for preciso, para garantir pelo menos 2 s entre emails
   (limite de 30/min do Microsoft 365).
5. **`sendMail()`**: envia por SMTP.
6. **`markSent()`**: marca o job como `sent` na BD.
7. **`ch.ack(msg)`**: diz ao RabbitMQ "tratei desta mensagem, podes apagá-la".

### Passo 5: se o envio falhar

1. **`markFailed()`**: volta a pôr o job em `pending` e guarda o erro em `lastError`.
   Na 5.ª tentativa marca `failed` (desistiu).
2. **`publishRetry()`**: põe a mensagem numa **fila de espera** (1 min, 5 min, 30 min ou
   2 h, conforme a tentativa).
3. **`ack`** da mensagem original.

As filas de espera **não têm ninguém a lê-las**. Cada uma tem um prazo de validade
(**TTL**). Quando a mensagem expira, o RabbitMQ devolve-a sozinho à fila principal
(**dead-letter**), e o worker volta a tentar. Assim há esperas sem código de
agendamento.

Depois de 5 falhas, **`publishFailed()`** manda a mensagem para
`academia.emails.failed`, só para consulta.

### Estados de um job

```
pending ──claimJob──▶ processing ──envio OK──▶ sent
   ▲                      │
   └──── falhou (<5) ─────┤
                          └── falhou (5.ª) ──▶ failed
```

| Estado | Significa |
|---|---|
| `pending` | À espera de ser enviado (primeira vez ou à espera de retry) |
| `processing` | Um worker está a enviá-lo agora |
| `sent` | Enviado com sucesso |
| `failed` | Desistiu depois de 5 tentativas |

## 4. O que pode correr mal e o que acontece

| Situação | Resultado | Porquê |
|---|---|---|
| RabbitMQ em baixo quando o site grava | ✅ Não se perde. Sai com até ~1,5 min de atraso | O relay encontra `publishedAt` vazio e publica |
| Publicou no RabbitMQ mas falhou a gravar `publishedAt` | ✅ Não duplica o email | O relay publica 2.ª vez; a 2.ª mensagem encontra o job já `sent` e é ignorada pelo `claimJob` |
| Checkout faz rollback | ✅ Nenhum email | O job estava dentro da transacção, também é desfeito |
| SMTP falha | ✅ Tenta de novo (1m, 5m, 30m, 2h) | `markFailed` + fila de retry |
| Worker cai **antes** de enviar | ✅ Não se perde | Sem `ack`, o RabbitMQ volta a entregar a mensagem |
| Worker envia e **cai antes de** `markSent` | ⚠️ **Email duplicado** | A mensagem volta; o job ainda está `processing`; o worker envia outra vez |
| Worker envia e **a BD falha** no `markSent` | ⚠️ **Email duplicado**, até 5 vezes | O erro é tratado como falha de envio e agenda retry |
| Worker envia e a BD falha no `markSent` **e** no `markFailed` | ⚠️ Pode repetir **sem limite** enquanto a BD estiver instável | Ver [limitação conhecida](#limitação-conhecida-duplicados-sem-limite) |

**Escolha consciente:** o sistema prefere **duplicar a perder**. O SMTP não permite
garantir "exactamente uma vez": não há forma de perguntar ao Microsoft 365 "já
enviaste este?". Por isso, quando há dúvida, envia de novo.

### Limitação conhecida: duplicados sem limite

O `claimJob` de uma mensagem reentregue (`redelivered`) aceita jobs em `processing`
mas **não verifica** se `attempts` já chegou a `maxAttempts`. Se a BD aceitar o
`UPDATE` do claim mas falhar nas escritas seguintes, o mesmo email pode sair várias
vezes, com 5 s de intervalo. É raro (a própria BD teria de estar instável), e
resolve-se acrescentando `attempts < maxAttempts` à condição do `claimJob`.

## 5. Quantos processos existem

**Um só processo** do worker, que faz 4 coisas ao mesmo tempo:

| Tarefa | Função | Frequência |
|---|---|---|
| Consumidor | `consumeForever()` → `handleMessage()` | Sempre, um email de cada vez |
| Relay | `republishUnpublished()` | A cada 30 s |
| Tarefas diárias | `runDailyTasks()` → `enqueueCourseEmails()` | Verifica a cada minuto, corre 1× por dia a partir das 8h (Luanda) |
| Saúde | `startHealthServer()` | Responde em `http://127.0.0.1:4100/health` |

### Porque não separar em vários processos (por agora)

- O que limita a velocidade é o **Microsoft 365 (30/min)**, não o worker. Mais
  processos não enviam mais depressa.
- O `throttle()` só controla o ritmo **dentro do próprio processo**. Com 2 workers,
  cada um enviaria 30/min, e o Microsoft 365 começaria a rejeitar ou bloquear a caixa.
- O resto já aguenta vários processos sem erros: o relay e as tarefas diárias podem
  repetir-se porque o `claimJob` e a `dedupeKey` evitam duplicados.

**Quando fará sentido separar:** se os emails urgentes (recuperação de palavra-passe)
começarem a ficar atrás de muitos lembretes. A solução é ter **duas caixas SMTP**
(ex.: uma para urgentes, outra para lotes), cada uma com a sua fila e o seu worker.

## 6. Todas as funções, uma a uma

### Lado do site: `lib/mail/queue.ts`

| Função | O que faz |
|---|---|
| `enqueueEmails(jobs, { tx })` | Grava vários emails em `email_jobs`. Ignora os que têm uma `dedupeKey` já existente. Sem `tx`, publica logo. Com `tx`, quem chama tem de chamar `dispatchEmails` depois do commit. |
| `enqueueEmail(job, { tx })` | O mesmo, para um só email. |
| `dispatchEmails(queued)` | Publica no RabbitMQ e marca `publishedAt`. Nunca dá erro: se falhar, o relay trata. |

### Ligação ao RabbitMQ: `lib/mail/rabbit.ts`

| Função | O que faz |
|---|---|
| `rabbitUrl()` | Lê `RABBITMQ_URL` e confirma que começa por `amqp://` ou `amqps://`. |
| `connectRabbit(nome)` | Abre uma ligação ao RabbitMQ, com um nome para aparecer na consola de gestão. |
| `assertEmailTopology(channel)` | Cria (se ainda não existirem) a exchange e as filas. Pode ser chamada muitas vezes sem problema. |
| `publishEmail(channel, jobId, prioridade)` | Publica `{ jobId }` na fila principal e espera a confirmação. |
| `publishRetry(channel, jobId, prioridade, tentativa)` | Põe a mensagem na fila de espera certa (1m/5m/30m/2h). |
| `publishFailed(channel, jobId, erro)` | Põe a mensagem na fila de falhados, com o erro num cabeçalho. |
| `parseEmailMessage(conteúdo)` | Lê a mensagem recebida. Devolve `null` se não for válida. |
| `getPublisherChannel()` | Devolve a ligação partilhada do site ao RabbitMQ (abre-a só na primeira vez). |

### Worker: acesso à BD, `worker/queue.ts`

| Função | O que faz |
|---|---|
| `claimJob(id, redelivered)` | Reserva o job (`pending` → `processing`) e soma 1 a `attempts`. Se a mensagem for reentregue, aceita também `processing`. |
| `markSent(job)` | Marca `sent` e a hora de envio. |
| `markFailed(job, erro, final)` | Marca `pending` (vai tentar outra vez) ou `failed` (desistiu), e guarda o erro. |
| `findUnpublished(limite)` | Lista os jobs que o site não conseguiu publicar (usado pelo relay). |
| `markPublished(ids)` | Preenche `publishedAt`. |
| `purgeSentJobs(dias)` | Apaga os `sent` com mais de N dias (90). |
| `jobStats()` | Conta quantos jobs há em cada estado (usado pelo `/health`). |

### Worker: processo principal, `worker/index.ts`

| Função | O que faz |
|---|---|
| `main()` | Arranca tudo: health, temporizadores, consumidor. Trata o desligar limpo (`SIGINT`/`SIGTERM`). |
| `consumeForever()` | Liga-se ao RabbitMQ e começa a consumir. Se a ligação cair, espera 5 s e volta a ligar. Para sempre. |
| `onMessage(ch, msg)` | Recebe cada mensagem e chama `handleMessage`. Se houver erro de BD ou RabbitMQ, devolve a mensagem à fila (`nack`). |
| `handleMessage(ch, msg)` | O coração do worker: reservar, montar, esperar, enviar, marcar, confirmar (passo 4). |
| `throttle()` | Garante pelo menos 2 s entre envios. |
| `republishUnpublished()` | O relay (passo 3). |
| `runDailyTasks()` | Corre as tarefas diárias uma vez por dia. |
| `queueDepths()` | Conta quantas mensagens há em cada fila (usado pelo `/health`). |
| `startHealthServer()` | Servidor HTTP interno com o estado do worker. |
| `every(ms, tarefa)` | Corre uma tarefa de X em X ms e regista erros sem parar o worker. |

### Worker: outros ficheiros

| Função | Ficheiro | O que faz |
|---|---|---|
| `enqueueCourseEmails()` | `worker/scheduled.ts` | Cria os lembretes (curso começa em ≤ 2 dias) e os pedidos de feedback (curso acabou há 1 a 7 dias), e limpa os antigos. |
| `sendMail(mensagem)` | `worker/mailer.ts` | Envia por SMTP. Com `MAIL_DRY_RUN=true`, só escreve no log. |
| `mailerConfigured()` | `worker/mailer.ts` | Diz se o SMTP está configurado. |
| `renderEmailJob(template, para, payload)` | `lib/mail/jobs.ts` | Transforma o template e os dados num email pronto (assunto, HTML, texto). |

## Glossário

| Termo | Explicação simples |
|---|---|
| **ack** (*acknowledgement*) | "Tratei desta mensagem, podes apagá-la." |
| **nack** | "Não consegui tratar." Com *requeue*, a mensagem volta à fila. |
| ***at-least-once*** ("pelo menos uma vez") | Garantia de que a mensagem chega, mas **pode chegar repetida**. É a garantia deste sistema. |
| ***at-most-once*** ("no máximo uma vez") | Nunca repete, mas pode perder. Não é o que usamos. |
| ***exactly-once*** ("exactamente uma vez") | O ideal. Não existe de ponta a ponta com SMTP. |
| **Broker** | Programa intermediário que recebe e entrega mensagens (o RabbitMQ). |
| **Canal** (*channel*) | Uma "conversa" dentro da ligação ao RabbitMQ. Uma ligação pode ter vários. |
| **Consumidor** (*consumer*) | Quem lê mensagens de uma fila (o worker). |
| **Publicar** (*publish*) | Enviar uma mensagem para o RabbitMQ. |
| ***Dead-letter*** | Mensagem "morta" (expirou ou foi rejeitada). O RabbitMQ pode reencaminhá-la para outro sítio. |
| **DLX** (*dead letter exchange*) | O sítio para onde vão as mensagens mortas. Aqui usa-se para devolver as mensagens de retry à fila principal. |
| **DLQ** (*dead letter queue*) | Fila onde ficam as mensagens que desistiram (`academia.emails.failed`). |
| ***Dedupe key*** | Etiqueta única que impede criar o mesmo email duas vezes (ex.: `course_reminder:<id da inscrição>`). |
| ***Dual write*** (escrita dupla) | O problema de escrever em dois sistemas (BD e RabbitMQ) sem garantia de que ambos ficam gravados. O outbox resolve-o. |
| **Exchange** | "Balcão de triagem" do RabbitMQ: recebe mensagens e decide para que fila vão, pela *routing key*. |
| ***Routing key*** | Etiqueta que a exchange usa para escolher a fila (aqui, `send`). |
| **Fila** (*queue*) | Lista de mensagens à espera de serem lidas. |
| **Fila quorum** | Tipo de fila do RabbitMQ copiada em vários servidores. Não se perde se um cair. |
| **Idempotente** | Fazer 1 vez ou 10 vezes dá o mesmo resultado. O `claimJob` torna o consumo quase idempotente. |
| ***Idempotent consumer*** | Consumidor que ignora mensagens repetidas (aqui, via `claimJob`). |
| **Job** | Uma linha de `email_jobs`: um email para enviar. |
| **Outbox** | "Caixa de saída" na BD: o email fica gravado aqui antes de ir para o RabbitMQ. |
| ***Payload*** | Os dados variáveis do email (nome do aluno, curso, link...). |
| ***Prefetch*** | Quantas mensagens o RabbitMQ entrega ao worker de uma vez. Aqui é 1. |
| **Prioridade** | Mensagens urgentes (reset de palavra-passe) passam à frente dos lotes. |
| ***Publisher confirms*** | O RabbitMQ confirma "recebi e guardei". Sem isto, uma mensagem podia perder-se em silêncio. |
| ***Redelivered*** | Marca que o RabbitMQ põe numa mensagem que já tinha entregue antes e não recebeu `ack`. |
| **Relay** | O processo que lê a outbox e publica o que ficou esquecido (`republishUnpublished`). |
| **Retry** / ***backoff*** | Tentar de novo, esperando cada vez mais (1m, 5m, 30m, 2h). |
| **SMTP** | O protocolo usado para enviar emails. |
| **Throttle** | Travão de velocidade: no máximo 1 email a cada 2 s. |
| **Transacção** | Conjunto de operações na BD que acontecem todas ou nenhuma. |
| **TTL** (*time to live*) | Prazo de validade de uma mensagem numa fila. |
| **Worker** | Programa em segundo plano que faz o trabalho pesado (enviar emails). |
