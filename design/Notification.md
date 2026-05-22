# Scalable Reminder Notification System for Todo App

## Stack: NestJS + DynamoDB + AWS EventBridge + Lambda + SNS + SQS

---

## 1. Goal

Build a reminder system for a Todo app that is:

- highly scalable
- fault tolerant
- cost optimized
- low latency
- serverless (servers managed by the cloud)
- easy to maintain
- horizontally scalable

Supports:

- millions of users
- millions of reminders/day
- exact-time notifications

---

## 2. High-Level Architecture

```text
Client
   |
   v
NestJS API
   |
   +-----------------------+
   |                       |
   v                       v
DynamoDB               Outbox Event
   |                       |
   |                       v
   |                 Scheduler Worker
   |                       |
   |                       v
   |               EventBridge Scheduler
   |                       |
   +-----------------------+
                           |
                           v
                       AWS Lambda
                           |
          +----------------+----------------+
          |                                 |
          v                                 v
        SNS                              SQS DLQ
          |
    +-----+------+
    |            |
 Push         Email/SMS
```

---

## Alternative Architectures Considered

| Architecture                       | How it works                                                                 | Pros                                        | Cons                                                        | Why not chosen                             |
| ---------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------ |
| **Cron Polling**                   | Background job scans DynamoDB every minute for due reminders                 | simple, easy MVP                            | expensive scans, high latency, duplicate risk, poor scaling | does not scale well beyond small workloads |
| **SQS Delay Queue**                | push reminder into :contentReference[oaicite:0]{index=0} with `DelaySeconds` | cheap, simple, accurate timing              | max delay = 15 minutes only                                 | cannot support reminders hours/days ahead  |
| **DynamoDB TTL + Streams**         | store reminder as TTL; expiry triggers :contentReference[oaicite:1]{index=1} | fully serverless, very cheap                | TTL is not exact (minutes to hours delay)                   | bad for exact reminder delivery            |
| **Redis Delayed Queue**            | use sorted sets in :contentReference[oaicite:2]{index=2} and worker polls    | fast, low latency                           | infra management, memory cost, failover complexity          | adds operational burden                    |
| **Kafka Scheduler**                | events scheduled/processed using :contentReference[oaicite:3]{index=3}       | ultra scalable                              | very complex, expensive                                     | overkill for todo app                      |
| **Step Functions Wait**            | one workflow waits until reminder time                                       | easy orchestration                          | costly at scale, workflow limits                            | too expensive for millions                 |
| **EventBridge Scheduler (Chosen)** | one managed schedule per reminder                                            | exact timing, serverless, scalable, low ops | moderate cost, schedule management needed                   | best balance of scale, cost, reliability   |

---

## Why EventBridge Scheduler was chosen

It provides the best balance of:

✅ exact-time delivery  
✅ serverless architecture  
✅ zero polling  
✅ very high scalability  
✅ low operational overhead  
✅ predictable cost

This makes it the best fit for a production-grade Todo reminder system.

---

## 4. Database Design

Using: Amazon DynamoDB

## Table

```json
PK: USER#{userId}
SK: TODO#{todoId}

{
  "title": "Buy milk",
  "reminderAt": "2026-05-21T10:00:00Z",
  "status": "PENDING",
  "scheduleId": "reminder_todo123",
  "notificationStatus": "NOT_SENT",
  "version": 1,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## GSI (Global Secondary Index)

```text
GSI1PK = STATUS#PENDING
GSI1SK = reminderAt
```

Purpose:

- repair jobs
- backfill
- operational visibility

---

## 5. Scheduler Pattern

Using:
Amazon EventBridge Scheduler

When reminder created:

```text
CreateSchedule(
  scheduleId = reminder_{todoId},
  triggerAt = reminderAt
)
```

Benefits:

- exact time
- fully managed
- millions supported
- low maintenance
- predictable cost

## Scheduler Options Comparison

Choosing a scheduler depends on these factors:

- exact timing accuracy
- max delay supported
- scalability
- operational complexity
- cost
- fault tolerance
- update/delete flexibility
- latency
- maintenance overhead

---

| Scheduler                                                     | Timing Accuracy     | Max Delay   | Scale     | Cost        | Performance | Operational Complexity | Drawbacks                          | Best Use Case                     |
| ------------------------------------------------------------- | ------------------- | ----------- | --------- | ----------- | ----------- | ---------------------- | ---------------------------------- | --------------------------------- |
| **EventBridge Scheduler** (chosen)                            | excellent (seconds) | unlimited   | very high | medium      | excellent   | low                    | per-schedule cost, regional        | exact reminders                   |
| **SQS Delay Queue** :contentReference[oaicite:0]{index=0}     | excellent           | 15 min only | very high | low         | excellent   | low                    | cannot schedule days/months        | short delays                      |
| **DynamoDB TTL + Streams**                                    | poor                | unlimited   | very high | very low    | good        | low                    | not exact, can delay minutes/hours | approximate reminders             |
| **Cron Polling**                                              | medium              | unlimited   | low       | medium-high | poor        | medium                 | expensive scans, wasted compute    | MVP(Minimum Viable Product.) only |
| **Redis Delayed Queue** :contentReference[oaicite:1]{index=1} | excellent           | unlimited   | medium    | medium-high | excellent   | high                   | infra management                   | ultra-low latency                 |
| **Step Functions Wait** :contentReference[oaicite:2]{index=2} | excellent           | 1 year      | medium    | high        | good        | medium                 | expensive at scale                 | workflow orchestration            |
| **Kafka Delay Pattern** :contentReference[oaicite:3]{index=3} | excellent           | unlimited   | massive   | high        | excellent   | very high              | overkill, complex                  | event platforms                   |

---

## Why EventBridge Scheduler wins

| Factor      | Reason                              |
| ----------- | ----------------------------------- |
| Accuracy    | triggers at exact reminder time     |
| Delay       | supports minutes to years           |
| Scaling     | handles millions of schedules       |
| Reliability | AWS managed retries                 |
| Maintenance | no worker servers                   |
| Cost        | cheaper than always-running workers |
| Simplicity  | easiest production-ready design     |

---

## Cost vs Performance Summary

| Option         | Monthly Cost | Performance | Recommended                 |
| -------------- | ------------ | ----------- | --------------------------- |
| Cron           | medium-high  | poor        | no                          |
| SQS            | low          | excellent   | only short delays           |
| TTL            | very low     | medium      | no for exact timing         |
| Redis          | medium-high  | excellent   | only if already using Redis |
| Step Functions | high         | good        | no                          |
| EventBridge    | medium       | excellent   | yes ✅                      |

---

<!-- ## 6. Outbox Pattern

Problem:
dual write failure


Bad:

```text
save todo
create schedule
```

If second fails → data corruption

Solution:

Transaction:

```text
1. save todo
2. save outbox event
```

Worker:

```text
reads outbox
creates schedule
marks complete
```

Benefits:

- retryable
- consistent
- safe

--- -->

## 6. Outbox Pattern

### Problem: Dual Write Failure

When a user creates a reminder, the system must write to **two different systems**:

1. save Todo in :contentReference[oaicite:0]{index=0}
2. create reminder schedule in :contentReference[oaicite:1]{index=1}

Naive implementation:

```text
save todo
create schedule
```

---

### Failure scenario

Example:

User creates:

```json
{
	"title": "Buy milk",
	"reminderAt": "10:00 AM"
}
```

System executes:

```text
1. save todo in DynamoDB      ✅ success
2. create EventBridge schedule ❌ fails (network timeout)
```

Now database says:

```text
todo exists
```

But scheduler says:

```text
no schedule exists
```

Result:

❌ user never gets reminder  
❌ system state becomes inconsistent

This is called **dual write failure**.

---

## Solution: Outbox Pattern

Instead of writing directly to EventBridge, store an **event request** in the database.

Transaction:

```text
1. save todo
2. save outbox event
```

Both succeed or both fail.

Example:

### Todo record

```json
{
	"PK": "USER#123",
	"SK": "TODO#1",
	"title": "Buy milk"
}
```

### Outbox record

```json
{
	"eventType": "CREATE_SCHEDULE",
	"todoId": "1",
	"status": "PENDING"
}
```

Because both are saved in one DynamoDB transaction:

- no partial writes
- no data corruption

---

## Worker flow

Background worker continuously checks outbox:

```text
find status = PENDING
```

Then:

```text
create EventBridge schedule
mark outbox COMPLETE
```

Flow:

```text
User
 |
NestJS API
 |
DynamoDB Transaction
 |---- save todo
 |---- save outbox event
 |
Outbox Worker
 |
Create EventBridge Schedule
 |
Mark COMPLETE
```

---

## If EventBridge fails?

Example:

```text
create schedule ❌ timeout
```

Outbox remains:

```text
status = PENDING
```

Worker retries automatically later.

Nothing is lost.

---

## Benefits

| Benefit    | Why it matters                         |
| ---------- | -------------------------------------- |
| Retryable  | failed schedules can be retried        |
| Consistent | DB and scheduler stay in sync          |
| Durable    | events survive app crashes             |
| Auditable  | easy to track failed/successful events |
| Safe       | no lost reminders                      |

---

## Why this is needed

Because DynamoDB transactions **cannot include external AWS services** like EventBridge.

Only DB operations are transactional.

So we store the **intent** first:

```text
"I need to create a schedule"
```

That intent is the **outbox event**.

## 7. Idempotency

Problem:
Lambda may execute twice.

Solution:

```text
IDEMP#{todoId}_{reminderAt}
```

Store in DynamoDB TTL table.

Pseudo:

```ts
if exists -> skip
else -> send
```

Prevents duplicate notifications.

---

## 8. Failure Handling

### Lambda Retry

- automatic:
- 2 retries

---

### DLQ

- Use:
- Amazon SQS
- If all retries fail:

```text
send to dead-letter queue
```

Later:
manual or automatic replay

---

## 9. Notification Delivery

Use SNS topic.

```text
Lambda
   -> SNS
      -> Push
      -> SMS
      -> Email
```

Benefits:

- Lambda knows every provider
- decoupled
- easy to add new channels

## Why use SNS?

Without :contentReference[oaicite:1]{index=1}:

```text
Lambda -> Push
Lambda -> SMS
Lambda -> Email
```

Problems:

- tightly coupled
- harder to maintain
- adding channels requires code changes
- one channel failure can affect others

With SNS:

```text
Lambda -> SNS -> Push / SMS / Email
```

Benefits:

- decoupled architecture
- fanout to multiple channels
- independent retries per channel
- easy to add new notification channels
- better long-term scalability

---

## 10. Timezone Strategy

Always store UTC:

```text
2026-05-20T14:00:00Z
```

Store separately:

```text
userTimezone = Asia/Kolkata
```

Convert only on frontend.

Never store local time.

---

## 11. Cost Analysis

Assumption:

- 10M reminders/month
- each reminder creates:
    - 1 schedule
    - 1 Lambda execution
    - ~3 DynamoDB writes
    - 1 SNS publish
- region pricing varies (approximate only)

---

## Cost Breakdown

| Service                                   | Usage           | Estimated Monthly Cost | Notes                                   |
| ----------------------------------------- | --------------- | ---------------------- | --------------------------------------- |
| :contentReference[oaicite:0]{index=0}     | ~30M writes     | $35–$70                | todo create, status update, idempotency |
| :contentReference[oaicite:1]{index=1}     | 10M schedules   | ~$150                  | biggest predictable cost                |
| :contentReference[oaicite:2]{index=2}     | 10M invocations | ~$20                   | 128MB, ~200ms                           |
| :contentReference[oaicite:3]{index=3}     | 10M publishes   | $10–$500+              | depends heavily on channel              |
| :contentReference[oaicite:4]{index=4} DLQ | low traffic     | <$5                    | only failed messages                    |
| :contentReference[oaicite:5]{index=5}     | logs + metrics  | $10–$50                | depends on log volume                   |

---

## SNS Channel Cost Comparison

| Channel           | Cost     | Notes                                                   |
| ----------------- | -------- | ------------------------------------------------------- |
| Push notification | very low | cheapest                                                |
| Email             | low      | usually cheap via :contentReference[oaicite:6]{index=6} |
| SMS               | high     | most expensive                                          |
| Webhook           | very low | almost free                                             |

---

## Total Estimate

| Scenario     | Monthly Cost |
| ------------ | ------------ |
| Push only    | ~$220–$280   |
| Push + Email | ~$250–$350   |
| Heavy SMS    | $1000+       |

---

## Biggest Cost Drivers

| Service         | Cost Impact |
| --------------- | ----------- |
| EventBridge     | high        |
| SMS             | very high   |
| CloudWatch logs | medium      |
| DynamoDB        | medium      |
| Lambda          | low         |

---

## Cost Optimization Tips

| Optimization                 | Savings                 |
| ---------------------------- | ----------------------- |
| Use push instead of SMS      | huge                    |
| keep Lambda <200ms           | lower compute cost      |
| compress logs                | lower CloudWatch bill   |
| DynamoDB On-Demand initially | avoids overprovisioning |
| use TTL on idempotency table | reduces storage         |
| batch writes where possible  | fewer requests          |

---

## Expected Unit Cost

Approx per reminder:

```text
~ $0.00002 to $0.00003
```

Meaning:

```text
1 million reminders ≈ $20–$30
```

excluding SMS.

## 12. Performance Optimization

---

## Avoid scans

Never:

```ts
scan();
```

Always:

- PK query
- GSI query

---

## Batch writes

Use:

```ts
BatchWriteItem;
```

For:

- migrations
- imports

---

## Connection reuse

NestJS:

```ts
singleton AWS clients
```

Avoid recreating SDK clients.

---

## Lambda memory tuning

- start: 128MB
- benchmark: 128 / 256 / 512
- choose cheapest fastest.

---

## cold start reduction

Use:

- provisioned concurrency (if needed)

Only for critical paths.

---

## compress payloads

avoid large event payloads

send:

```json
{
	"todoId": "123"
}
```

not full object.

---

## 13. Scaling

### NestJS

Deploy on: ECS Fargate or EKS
Autoscale:
CPU > 60%

---

## DynamoDB

Use: On-Demand initially
Later: Provisioned + autoscaling

---

## Lambda

Set reserved concurrency: to avoid throttling
Example: 500

---

## SNS

scales automatically

---

## EventBridge

already managed
no scaling needed

---

## 14. Disaster Recovery

Run repair job every hour:

Query:

```text
status=PENDING
```

Find:
missing schedules
Recreate them.
This saves outages.

---

## 15. Monitoring

Use:
Amazon CloudWatch

Track:

- reminders_created
- reminders_sent
- send_failures
- duplicate_skipped
- DLQ_count
- scheduler_failures
- latency_ms

Alerts:

- DLQ > 0
- success < 99.9%

---

## 16. Security

IAM least privilege.
NestJS:

- PutItem
- UpdateItem

Lambda:

- SNS Publish
- Dynamo Update

---

## 17. Deleting Reminder

must:
1 delete EventBridge schedule
2 update DB

otherwise:
ghost notifications

---

## 18. Update Reminder

must:
1 delete old schedule
2 create new schedule
3 update DB

transactional workflow required.

---

## 19. Multi-Region Future

Phase 1:

- single region

Phase 2:

- DynamoDB Global Tables
- backup region

Needed only at huge scale.

---

## Use

✅ NestJS API  
✅ DynamoDB single-table design  
✅ Outbox pattern  
✅ EventBridge Scheduler  
✅ Lambda worker  
✅ SNS fanout  
✅ SQS DLQ  
✅ CloudWatch monitoring

This architecture scales from:

```text
10 users
to
100 million users
```

without redesign.

---
