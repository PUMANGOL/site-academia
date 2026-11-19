# Ferramentas

| Ferramenta | Versão | Onde | Para quê |
|---|---|---|---|
| RabbitMQ | `rabbitmq:4-management-alpine` | `docker-compose.yml` | Transporte das mensagens, retries (TTL + DLX), prioridade |
| `amqplib` | ^2.0.1 | `lib/mail/rabbit.ts` | Cliente AMQP 0-9-1, usado pelo Next e pelo worker |
| PostgreSQL | 16 | `docker-compose.yml` | Tabela `email_jobs` (outbox, estado, histórico) |
| Drizzle ORM / drizzle-kit | ^0.45 / ^0.31 | `db/schema/emails.ts`, `drizzle/0006_email_jobs.sql` | Schema, migrações e consultas |
| Nodemailer | ^10 | `worker/mailer.ts` | Envio SMTP (Microsoft 365) |
| Bun | — | `worker/` | Runtime do worker (`Bun.serve` no `/health`, `--watch` em desenvolvimento) |
| Next.js | 16.3.4 | `app/`, `lib/auth.ts` | Cria e publica emails nas server actions e no better-auth |

## RabbitMQ e `amqplib` no Next

O `amqplib` está no `package.json` partilhado. No Next só é usado **no servidor**
(server actions, better-auth) e nunca vai para o browser.

- Cada processo do Next abre **uma** ligação (`connection_name = academia-site`),
  guardada em `globalThis.emailPublisher` e reaproveitada entre pedidos. Se cair, é
  recriada no pedido seguinte.
- Precisa do runtime **Node**. Não funciona no runtime Edge nem no middleware.
- O Next só **publica**. O worker (`connection_name = academia-worker`) é o único
  consumidor.

### Painel de gestão

Em desenvolvimento: http://localhost:15672, com o utilizador `academia`, a palavra-passe
`academia` e o vhost `academia`. Lá vê-se:
- a profundidade de cada fila (`academia.emails`, `retry.*`, `failed`);
- as ligações `academia-site` e `academia-worker`;
- as mensagens da DLQ, com o separador *Get messages* e o header `x-error`.

## Nodemailer e Microsoft 365

- `smtp.office365.com:587`, com STARTTLS obrigatório (`secure: false`,
  `requireTLS: true`).
- Pool com uma ligação (`pool: true`, `maxConnections: 1`).
- Limite do Microsoft 365: **30 mensagens/min por caixa**. O worker impõe 1 envio a
  cada `MAIL_MIN_INTERVAL_MS` (2 s).
- `MAIL_DRY_RUN=true`: gera o email completo mas só o escreve no log. É útil em
  desenvolvimento e testes.

## Variáveis de ambiente

| Variável | Omissão | Usada por | Descrição |
|---|---|---|---|
| `RABBITMQ_URL` | — (obrigatória) | Next, worker | `amqp://user:pass@host:5672/vhost` (`amqps://...:5671` com TLS) |
| `RABBITMQ_EMAIL_QUEUE` | `academia.emails` | Next, worker | Nome base da exchange e das filas |
| `SMTP_HOST`, `SMTP_PORT` | —, `587` | Worker | Servidor SMTP |
| `SMTP_USER`, `SMTP_PASSWORD` | — | Worker | Credenciais da caixa de envio |
| `MAIL_FROM` | `SMTP_USER` | Worker | Remetente (`"Pumangol Academy <no.reply@pumangol.co.ao>"`) |
| `FEEDBACK_URL` | página `/contact` | Worker | Link do formulário de feedback (ex.: Microsoft Forms) |
| `MAIL_DRY_RUN` | `false` | Worker | `true` = não envia, só escreve no log |
| `MAIL_MIN_INTERVAL_MS` | `2000` | Worker | Intervalo mínimo entre envios |
| `WORKER_DAILY_HOUR` | `8` | Worker | Hora (Africa/Luanda) das tarefas diárias |
| `WORKER_PORT` | `4100` | Worker | Porta do `http://127.0.0.1:<porta>/health` (`0` = desligado) |

Constantes definidas no código (e não por variável):

| Constante | Valor | Ficheiro |
|---|---|---|
| Intervalo do relay do outbox | 30 s | `worker/index.ts` (`OUTBOX_INTERVAL_MS`) |
| Idade mínima para republicar | 1 min | `worker/queue.ts` (`findUnpublished`) |
| Atrasos de retry | 1 min, 5 min, 30 min, 2 h | `lib/mail/rabbit.ts` (`RETRY_QUEUES`) |
| Tentativas máximas | 5 | `db/schema/emails.ts` (`max_attempts`) |
| Lembrete: dias antes do início | 2 | `worker/scheduled.ts` (`REMINDER_DAYS_BEFORE`) |
| Janela de feedback após o fim | 7 dias | `worker/scheduled.ts` (`FEEDBACK_WINDOW_DAYS`) |
| Retenção dos enviados | 90 dias | `worker/scheduled.ts` (`SENT_RETENTION_DAYS`) |
| Reconexão ao RabbitMQ | 5 s | `worker/index.ts` (`RECONNECT_DELAY_MS`) |

## Scripts

| Comando | O que faz |
|---|---|
| `docker compose up -d` | Arranca PostgreSQL e RabbitMQ |
| `npm run db:migrate` | Aplica as migrações (inclui `email_jobs`) |
| `npm run dev` | Site Next.js |
| `bun run worker` | Worker em modo contínuo |
| `bun run worker:dev` | Worker com reinício automático ao alterar ficheiros |
| `bun run worker:daily` | Cria os lembretes e feedback de hoje e termina |
