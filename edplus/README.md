# Pumangol Academy

Site da Pumangol Academy: catálogo de cursos, inscrições, área do aluno e backoffice.

## Stack

- **Next.js 16** (App Router, server actions) + React 19
- **PostgreSQL 16** + **Drizzle ORM**
- **better-auth** (autenticação, recuperação de palavra-passe)
- **RabbitMQ** + **worker Bun** para o envio de emails (SMTP Microsoft 365)

## Arrancar em desenvolvimento

```bash
cp .env.example .env        # e preencher os valores
docker compose up -d        # PostgreSQL + RabbitMQ (painel em http://localhost:15672)
npm install
npm run db:migrate
npm run db:seed             # dados de exemplo (opcional)
npm run db:seed-admin       # utilizador administrador (opcional)
npm run dev                 # http://localhost:3000
bun run worker:dev          # worker de emails, noutro terminal
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` / `build` / `start` | Site Next.js |
| `npm run db:generate` | Gera uma migração a partir do schema Drizzle |
| `npm run db:migrate` | Aplica as migrações |
| `npm run db:studio` | Drizzle Studio |
| `bun run worker` | Worker de emails (contínuo) |
| `bun run worker:dev` | Worker com reinício automático |
| `bun run worker:daily` | Cria os lembretes e feedback de hoje e termina |

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `app/` | Páginas, server actions (`app/actions`), backoffice |
| `db/` | Schema Drizzle, consultas, seeds |
| `drizzle/` | Migrações SQL |
| `lib/` | Autenticação, emails (`lib/mail`) |
| `worker/` | Worker de emails (consumo do RabbitMQ, SMTP, tarefas diárias) |
| `docs/` | Documentação |

## Documentação

- [Emails: visão geral](docs/emails/README.md)
  - [Arquitectura](docs/emails/arquitectura.md): fluxo, filas, estados, retries, tarefas diárias
  - [Conceitos](docs/emails/conceitos.md): *dual write*, *Transactional Outbox*, deduplicação, idempotência, DLQ
  - [Ferramentas](docs/emails/ferramentas.md): RabbitMQ, `amqplib`, Nodemailer, Bun, variáveis de ambiente
  - [Operação](docs/emails/operacao.md): monitorizar, testar, reenviar falhados, limitações conhecidas
