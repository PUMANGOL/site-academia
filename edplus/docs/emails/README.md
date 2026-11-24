# Emails da Academia Pumangol

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

## Identidade visual

Os emails, o comprovativo em PDF e os relatórios em Excel seguem o manual de normas
gráficas da Academia Pumangol. Os clientes de email ignoram variáveis CSS e quase todas
as *web fonts*, por isso as cores estão escritas por extenso no código:

| Elemento | Valor | Utilização |
|---|---|---|
| Midnight Green | `#07525D` | Títulos, links, nome da Academia no rodapé, cabeçalho das tabelas do Excel (texto branco) |
| Verde | `#75A63D` | Filetes e marcadores de lista. Nunca em texto pequeno sobre branco; texto sobre este verde é `#043138`, nunca branco |
| Verde escuro "Pumangol" | `#00764A` | Botão dos emails, com texto branco |
| Vermelho | `#BE1622` | Só pequenos apontamentos (hoje não é usado) |
| Tipografia dos emails | `Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif` | A Montserrat só aparece nos clientes que carregam *web fonts*; os restantes usam Helvetica ou Arial |
| Tipografia do PDF | Helvetica (embutida no PDFKit) | Comprovativo de inscrição |
| Tipografia do Excel | Calibri (tipo de letra do próprio Excel) | Relatórios; as larguras das colunas estão afinadas para este tipo de letra |

Logótipo (só os ficheiros oficiais, sem recolorir, recortar ou esticar):

- **Emails e Excel**: `public/assets/img/email/logo.png` (496×139 px), versão a cores sem
  assinatura, redimensionada a partir de `public/assets/img/academia/logo-color-compact.png`.
  Nos emails vai embutida como anexo inline, com 220 px de largura e altura automática.
- **Comprovativo em PDF**: `public/assets/img/logo.png` (1149×428 px), versão a cores com a
  assinatura "Cria futuro.", igual a `public/assets/img/academia/logo-color.png`.
- A largura e a altura indicadas no código respeitam a proporção do ficheiro (1149:322 sem
  assinatura, 1149:428 com assinatura). Em fundo branco usa-se a versão a cores; em fundo
  Midnight Green, a versão negativa (`public/assets/img/academia/logo-white-compact.png`).
