# Operação

## Arrancar em desenvolvimento

```bash
docker compose up -d        # PostgreSQL + RabbitMQ
npm run db:migrate
npm run dev                 # site
bun run worker:dev          # worker (noutro terminal)
```

Sem credenciais SMTP, use `MAIL_DRY_RUN=true`: os emails aparecem no log do worker.

## Monitorizar

**Health do worker:** `GET http://127.0.0.1:4100/health`

```json
{
  "status": "ok",
  "rabbitConnected": true,
  "smtpConfigured": true,
  "lastDailyRun": "2026-09-25",
  "jobs": { "sent": 120, "pending": 2, "failed": 1 },
  "queues": { "academia.emails": 0, "academia.emails.retry.1m": 1, "academia.emails.failed": 1 }
}
```

Devolve `503` quando o worker não está ligado ao RabbitMQ.

**Consultas úteis:**

```sql
-- Falhados, com o erro
SELECT id, template, "to", attempts, last_error, created_at
FROM email_jobs WHERE status = 'failed' ORDER BY created_at DESC;

-- Por publicar há mais de 5 min (RabbitMQ ou worker com problemas)
SELECT count(*) FROM email_jobs
WHERE published_at IS NULL AND status = 'pending'
  AND created_at < now() - interval '5 minutes';

-- Presos em processing (worker caiu e a mensagem não foi reentregue)
SELECT id, template, "to", attempts FROM email_jobs WHERE status = 'processing';
```

## Reenviar emails falhados

O worker **não consome** a fila `academia.emails.failed`. Para reenviar, reponha o job
na BD e o relay do outbox publica-o em até 30 s:

```sql
UPDATE email_jobs
SET status = 'pending', attempts = 0, published_at = NULL, last_error = NULL
WHERE id = '<uuid>';
```

A mensagem antiga continua na fila `failed`. Pode ser apagada no painel do RabbitMQ
(*Purge*). A BD é a fonte da verdade.

## Testar lembretes e feedback

A tarefa diária corre às 8h de Luanda. Para forçar sem esperar:

```bash
bun run worker:daily
```

| Para testar | Datas do curso (curso `published`, com inscritos) |
|---|---|
| Só o lembrete | `startDate` = hoje, amanhã ou depois de amanhã |
| Só o feedback | `startDate` **e** `endDate` no passado, com o fim entre há 7 dias e ontem |
| Repetir um teste | Apagar o job: `DELETE FROM email_jobs WHERE dedupe_key = 'course_feedback:<enrollmentId>'` |

Se só mudar a `endDate` para o passado e a `startDate` estiver nos próximos 2 dias,
saem **os dois** emails (ver abaixo).

## Limitações conhecidas

1. **Lembrete e feedback independentes.** O lembrete só olha para a `startDate`. Um
   curso com o fim antes do início, ou já terminado mas com o início na janela, recebe
   os dois. Melhorias possíveis:
   - exigir `coalesce(endDate, startDate) >= hoje` no lembrete;
   - validar `endDate >= startDate` no formulário do backoffice.
2. **A fila `failed` acumula para sempre.** Não tem consumidor nem TTL. Opções:
   - definir `x-message-ttl`, ou aplicá-lo por *policy*, porque os argumentos das filas
     quorum não podem ser alterados sem recriar a fila;
   - deixar de publicar nela, já que a BD tem a mesma informação.
3. **Os jobs `failed` nunca são apagados.** Só os `sent` são limpos aos 90 dias.
   Convém acrescentar os `failed` antigos a `purgeSentJobs`.
4. **Duplicado raro.** Se o worker enviar o email e cair antes do `markSent`, a
   reentrega volta a enviá-lo. É o custo aceite do *at-least-once* (ver
   [conceitos](conceitos.md#b-no-consumo-idempotent-consumer-claimjob)).
5. **Não há reenvio no backoffice.** Hoje o reenvio é por SQL. Um botão "Reenviar"
   faria o mesmo `UPDATE`.
