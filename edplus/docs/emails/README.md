# Emails da Pumangol Academy

Documentação do sistema de envio de emails: como os emails nascem, como chegam ao
RabbitMQ, como o worker os envia e porque foi desenhado assim.

| Documento | Conteúdo |
|---|---|
| [Guia simples](guia-simples.md) | **Comece aqui.** Explicação sem jargão, passo a passo, com todas as funções e glossário |
| [Arquitectura](arquitectura.md) | Componentes, fluxo completo, filas, estados, tarefas diárias, retries |
| [Conceitos](conceitos.md) | *Dual write*, *Transactional Outbox*, deduplicação, idempotência, *at-least-once*, DLQ |
| [Ferramentas](ferramentas.md) | RabbitMQ, `amqplib`, PostgreSQL/Drizzle, Nodemailer, Bun, variáveis de ambiente |
| [Operação](operacao.md) | Arrancar, testar, monitorizar, reenviar falhados, limitações conhecidas |

## Resumo em 30 segundos

- Cada email é **primeiro gravado na BD** (tabela `email_jobs`) e só depois publicado no
  RabbitMQ. A mensagem na fila leva apenas o `jobId`.
- O **Next.js publica directamente** no RabbitMQ (biblioteca `amqplib`, só no servidor).
  Se o RabbitMQ estiver em baixo, o site continua a funcionar: o **worker** volta a
  publicar os jobs pendentes a cada 30 s (padrão *Transactional Outbox*).
- O **worker** (processo Bun separado) consome a fila, gera o email e envia-o por SMTP
  (Microsoft 365), no máximo 1 email a cada 2 s.
- Falhas de envio são repetidas após **1 min, 5 min, 30 min e 2 h**. À 5.ª falha o job
  fica `failed` na BD e a mensagem vai para a fila `academia.emails.failed`.
- Lembretes (início do curso) e pedidos de feedback (fim do curso) são criados pelo
  worker uma vez por dia, a partir das 8h de Luanda. A `dedupeKey` garante um só email
  de cada tipo por inscrição.

## Tipos de email

| Template | Quem cria | Quando | Prioridade |
|---|---|---|---|
| `password_reset` | Next (`lib/auth.ts`) | Pedido de recuperação de palavra-passe | `urgent` (10) |
| `enrollment_confirmation` | Next (`lib/mail/enrollment.ts`, via `app/actions/checkout.ts` e `app/actions/enrollments.ts`) | Pagamento confirmado ou inscrição num curso gratuito (na mesma transacção). Leva um comprovativo em PDF por inscrição | `normal` (4) |
| `course_reminder` | Worker (`worker/scheduled.ts`) | `startDate` entre hoje e hoje + 2 dias | `bulk` (0) |
| `course_feedback` | Worker (`worker/scheduled.ts`) | Fim do curso entre hoje − 7 e hoje − 1 | `bulk` (0) |

Os templates (HTML e texto) estão em `lib/mail/templates.ts` e o mapeamento
template → função em `lib/mail/jobs.ts`.

O comprovativo de inscrição (PDF A4) é gerado pelo worker em `worker/receipt-pdf.ts`
(PDFKit) a partir de `payload.receipts`, gravado no job pelo site. Com
`MAIL_DRY_RUN=true`, os PDFs ficam em `storage/mail-preview/` para revisão.
