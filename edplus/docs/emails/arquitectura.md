# Arquitectura

## Componentes

```
┌──────────────────────┐        ┌──────────────────────────┐
│  Next.js (site)      │        │  Worker (Bun)            │
│  - checkout          │        │  - consome a fila        │
│  - reset password    │        │  - envia por SMTP        │
│                      │        │  - relay do outbox (30s) │
│  enqueueEmail()      │        │  - tarefas diárias (8h)  │
└───┬──────────────┬───┘        └──┬──────────┬─────────┬──┘
    │ 1. INSERT    │ 2. publish    │ consume  │ UPDATE  │ SMTP
    ▼              ▼               │          ▼         ▼
┌──────────┐   ┌───────────────────┴──┐  ┌──────────┐  ┌──────────────┐
│PostgreSQL│   │ RabbitMQ             │  │PostgreSQL│  │ Microsoft 365│
│email_jobs│   │ academia.emails ...  │  │email_jobs│  │ (SMTP 587)   │
└──────────┘   └──────────────────────┘  └──────────┘  └──────────────┘
```

| Componente | Ficheiros | Papel |
|---|---|---|
| Fila (lado do site) | `lib/mail/queue.ts` | `enqueueEmail(s)` grava em `email_jobs`; `dispatchEmails` publica no RabbitMQ |
| Ligação RabbitMQ | `lib/mail/rabbit.ts` | Topologia (exchange, filas), publicação com *publisher confirms*, ligação partilhada do Next |
| Templates | `lib/mail/jobs.ts`, `lib/mail/templates.ts` | Tipos de email, payloads, prioridades, geração do HTML/texto |
| Tabela | `db/schema/emails.ts`, `drizzle/0006_email_jobs.sql` | Outbox + estado + histórico de cada email |
| Worker | `worker/index.ts` | Consumo, retries, relay do outbox, tarefas diárias, `/health` |
| Acesso à BD do worker | `worker/queue.ts` | `claimJob`, `markSent`, `markFailed`, `findUnpublished`, limpeza |
| Tarefas diárias | `worker/scheduled.ts` | Lembretes, feedback, limpeza dos enviados |
| Anexos | `worker/receipt-pdf.ts` | Comprovativo de inscrição em PDF (PDFKit), um por inscrição |
| SMTP | `worker/mailer.ts` | Nodemailer (Microsoft 365, STARTTLS), modo `MAIL_DRY_RUN` |

## Fluxo de um email

### 1. Criação (site ou worker)

`enqueueEmails()` faz um `INSERT` em `email_jobs` com `status = pending` e
`publishedAt = null`. Jobs com `dedupeKey` já existente são ignorados
(`ON CONFLICT DO NOTHING`).

- **Sem transacção** (reset de palavra-passe, tarefas diárias): publica logo a seguir.
- **Com transacção** (`{ tx }`, checkout): o job é gravado na mesma transacção da
  inscrição e quem chama publica **depois do commit** com `dispatchEmails()`.

```ts
// app/actions/checkout.ts
await db.transaction(async (tx) => {
  // ... insere inscrições ...
  queuedEmails = await enqueueEmail({ ... }, { tx }); // só existe se houver commit
});
await dispatchEmails(queuedEmails);                   // publica depois do commit
```

### 2. Publicação no RabbitMQ

`dispatchEmails()` publica `{ "jobId": "<uuid>" }` na exchange `academia.emails`
(routing key `send`), espera a confirmação do broker e preenche `publishedAt`.

**Nunca lança erro**: se o RabbitMQ estiver indisponível, regista no log e o job fica
com `publishedAt = null`.

### 3. Relay do outbox (worker, a cada 30 s)

`republishUnpublished()` procura até 100 jobs `pending`, com `publishedAt = null` e
criados **há mais de 1 minuto**, publica-os e marca-os como publicados. O minuto de
margem evita competir com o Next, que normalmente publica em milissegundos.

A consulta usa o índice parcial `email_jobs_unpublished_idx`
(`WHERE published_at IS NULL`), que está quase sempre vazio. Por isso a verificação
é praticamente gratuita.

### 4. Consumo e envio (worker)

1. `prefetch(1)`: um email de cada vez. O ritmo é limitado pelo SMTP, não pelo RabbitMQ.
2. `claimJob()`: `UPDATE ... SET status = 'processing', attempts = attempts + 1
   WHERE id = $1 AND status = 'pending'`. Se não devolver linha (já enviado, falhado,
   noutro worker ou apagado), faz `ack` e ignora.
3. `renderEmailJob()` gera o email a partir do template e do `payload`.
4. `throttle()`: pelo menos `MAIL_MIN_INTERVAL_MS` (2 s) entre envios. O Microsoft 365
   aceita no máximo 30 mensagens/min por caixa.
5. `sendMail()`, depois `markSent()` e `ack`.

### 5. Falhas e retries

Se o envio falhar, `markFailed()` devolve o job a `pending` (ou `failed`, na última
tentativa), a mensagem é publicada numa **fila de retry** e a original recebe `ack`.

| Tentativa falhada | Fila | Nova tentativa após |
|---|---|---|
| 1.ª | `academia.emails.retry.1m` | 1 min |
| 2.ª | `academia.emails.retry.5m` | 5 min |
| 3.ª | `academia.emails.retry.30m` | 30 min |
| 4.ª | `academia.emails.retry.2h` | 2 h |
| 5.ª (`maxAttempts = 5`) | `academia.emails.failed` | não há, `status = failed` |

As filas de retry **não têm consumidor**. Têm `x-message-ttl` e uma *dead-letter
exchange* que aponta para `academia.emails`: quando a mensagem expira, o próprio
RabbitMQ devolve-a à fila principal. Não há código de agendamento.

Se o erro for de infraestrutura (BD ou RabbitMQ em baixo durante o processamento), a
mensagem recebe `nack` com requeue e é reentregue.

## Topologia RabbitMQ

Criada de forma idempotente por `assertEmailTopology()`, tanto no Next como no worker.

| Nome | Tipo | Detalhe |
|---|---|---|
| `academia.emails` | exchange `direct` | Durável |
| `academia.emails` | fila quorum | Ligada à exchange pela routing key `send`. Consumida pelo worker |
| `academia.emails.retry.{1m,5m,30m,2h}` | filas quorum | TTL + dead-letter para `academia.emails` (`at-least-once`, `reject-publish`) |
| `academia.emails.failed` | fila quorum | *Dead letter queue* para inspecção. **Sem consumidor** |

O nome base é configurável com `RABBITMQ_EMAIL_QUEUE`. As mensagens são persistentes e
têm prioridade: nas filas quorum, prioridade > 4 é tratada como alta, por isso o reset
de palavra-passe passa à frente dos lembretes.

## Tabela `email_jobs`

| Coluna | Significado |
|---|---|
| `id` | UUID. É o que viaja na mensagem |
| `template`, `to`, `payload` | O que enviar e para quem. O email é gerado no momento do envio |
| `status` | `pending`, `processing`, `sent` ou `failed` |
| `priority` | Prioridade da mensagem no RabbitMQ |
| `attempts`, `max_attempts` | Tentativas feitas / máximo (5) |
| `published_at` | Quando foi confirmado pelo RabbitMQ. `null` = por publicar (outbox) |
| `sent_at`, `last_error` | Resultado |
| `dedupe_key` | `UNIQUE`. Impede duplicados (ex.: `course_reminder:<enrollmentId>`) |
| `created_at` | Criação |

### Estados

```
          INSERT
            │
            ▼
        ┌────────┐  claimJob   ┌────────────┐  envio OK  ┌──────┐
        │pending │────────────▶│ processing │───────────▶│ sent │
        └────────┘             └────────────┘            └──────┘
            ▲                        │ falha
            │  tentativas < 5        │
            └────────────────────────┤
                                     │ tentativas = 5
                                     ▼
                                 ┌────────┐
                                 │ failed │
                                 └────────┘
```

## Tarefas diárias

`runDailyTasks()` é verificada a cada minuto, mas só corre **uma vez por dia**, a partir
de `WORKER_DAILY_HOUR` (8h, fuso `Africa/Luanda`). O controlo `lastDailyRun` vive só em
memória: se o worker reiniciar, a tarefa volta a correr. Isso não causa duplicados
graças à `dedupeKey`.

| Tarefa | Regra | `dedupeKey` |
|---|---|---|
| Lembrete | Cursos `published` com `startDate` entre **hoje** e **hoje + 2** | `course_reminder:<enrollmentId>` |
| Feedback | Cursos `published` com `coalesce(endDate, startDate)` entre **hoje − 7** e **hoje − 1** | `course_feedback:<enrollmentId>` |
| Limpeza | Apaga jobs `sent` com mais de 90 dias | — |

As duas regras são **independentes**: um curso com o início nos próximos 2 dias e o fim
no passado cumpre as duas e recebe os dois emails (ver
[limitações conhecidas](operacao.md#limitações-conhecidas)).

## Carga na base de dados

Por email há cerca de 4 escritas simples pela chave primária: `INSERT`, `publishedAt`,
`processing` e `sent`. Com o tecto de 30 emails/min imposto pelo SMTP, isto dá no
máximo cerca de 2 escritas por segundo. O relay do outbox faz 2 consultas por minuto a
um índice parcial quase vazio. **A carga é desprezável.**

O único ponto a vigiar é o crescimento da tabela: os `sent` são apagados aos 90 dias,
mas os `failed` não.

## Porque esta arquitectura

| Abordagem | Problema |
|---|---|
| Só RabbitMQ | Perde atomicidade com a BD (*dual write*), deduplicação, histórico e tolerância a falhas do broker |
| Só BD (worker a consultar `email_jobs` com `FOR UPDATE SKIP LOCKED`) | Funciona e é mais simples, mas retry, backoff e prioridade ficam em código próprio, com consultas constantes |
| SMTP directo no Next | Pedidos lentos, falhas do SMTP chegam ao utilizador, sem retry nem controlo do limite de 30/min |
| **Outbox + RabbitMQ (actual)** | Mais peças, mas cada uma faz aquilo em que é boa |

**A BD (`email_jobs`) dá correcção:** atomicidade com a inscrição, o site não depende do
broker, deduplicação, estado e histórico consultáveis por SQL.

**O RabbitMQ dá transporte:** entrega imediata (push), retry com backoff por TTL e
dead-letter, prioridade, vários workers com reentrega automática. Além disso, já faz
parte da infraestrutura da Pumangol.

Com o volume actual, só a BD seria suficiente. O RabbitMQ não se justifica por
desempenho, mas por já existir, dar retry e prioridade prontos e preparar o
crescimento. O que **não** se deve retirar é a tabela `email_jobs`.

Os conceitos estão explicados em [conceitos.md](conceitos.md).
