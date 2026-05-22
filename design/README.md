# Todos App

For a **notification/reminder system** in a Todo app using NestJS + Amazon DynamoDB on Amazon Web Services, there are several architectures depending on **scale**, **delivery guarantees**, **cost**, and **complexity**.

Since you want **scalable + performance optimized**, here are the main approaches:

---

## 1. Polling Scheduler (Cron-based) — simplest

### Architecture

```text
NestJS Cron Job (every 1 min)
   -> query DynamoDB for due reminders
   -> send notification
   -> mark as sent
```

### AWS services

- Amazon DynamoDB
- Amazon ECS / Amazon EC2
- NestJS `@Cron()`

### Pros

✅ Easy to build
✅ Fast MVP
✅ Cheap initially

### Cons

❌ Not scalable after millions of reminders
❌ Expensive scans on DynamoDB
❌ Risk of duplicate sends
❌ Latency depends on cron interval

### Use when

- <100k reminders/day

---

## 2. DynamoDB TTL + Streams + Lambda (event-driven)

### Architecture

```text
Todo item
   -> reminderAt stored as TTL
TTL expires
   -> DynamoDB Stream
   -> Lambda triggered
   -> send notification
```

### AWS services

- Amazon DynamoDB TTL
- AWS Lambda
- Amazon SNS

### Pros

✅ Fully serverless
✅ Highly scalable
✅ Low maintenance

### Cons

❌ TTL timing is **not exact** (can delay minutes/hours)
❌ Bad for strict reminder timing

### Use when

- “remind roughly around time” is acceptable

---

# 3. SQS Delayed Queue / Message per reminder ⭐ good

### Architecture

```text
Create reminder
   -> push message to SQS with DelaySeconds
When delay ends
   -> Lambda/Nest consumer
   -> send notification
```

### AWS

- Amazon SQS
- AWS Lambda

### Pros

✅ Very scalable
✅ Exactly timed (within seconds)
✅ Cheap

### Cons

❌ SQS max delay = **15 minutes**
So not usable for reminders 1 day later directly.

### Workaround

Use:

- short-term queue (<15 min)
- long-term stored elsewhere

---

# 4. EventBridge Scheduler ⭐ AWS recommended

### Architecture

```text
Create reminder
   -> create EventBridge schedule per reminder
At exact time
   -> Lambda/Nest endpoint
   -> send notification
```

AWS service:

- Amazon EventBridge Scheduler

### Pros

✅ Serverless
✅ Exact timing
✅ Massive scale (millions)
✅ no polling
✅ built for this

### Cons

❌ schedule per reminder (management needed)
❌ cost at very high volume

### Best for

**Most todo apps**
(what I’d choose)

---

# 5. Hybrid: DynamoDB + EventBridge Scheduler ⭐⭐⭐ best

Architecture:

```text
User creates reminder
   -> store in DynamoDB
   -> create EventBridge schedule
Event fires
   -> Lambda
   -> send push/email/SMS
   -> update DynamoDB status
```

### Pros

✅ exact timing
✅ source of truth in DynamoDB
✅ scalable
✅ retries possible
✅ easy auditing

### Cons

Slightly more setup

### Recommended

**YES — best architecture**

---

# 6. Kafka / Event streaming (overkill)

Use:

- Amazon MSK

Pros:

- ultra scale

Cons:

- too complex for todo app

Not recommended unless:

- > 100M reminders/day

---

# My recommended design for your stack

```text
NestJS API
   |
   |-- store todo in DynamoDB
   |
   |-- create EventBridge Scheduler job
            |
            v
        Lambda
            |
            +--> SNS / FCM / Email
            |
            +--> update DynamoDB status
```

---

## DynamoDB schema suggestion

```json
PK: USER#123
SK: TODO#456

title
reminderAt
status
notificationSent
scheduleId
```

GSI:

```text
GSI1PK = reminder_status
GSI1SK = reminderAt
```

---

# Retry handling

Use:

- Lambda retry
- DLQ with Amazon SQS
- idempotency key (`todoId + reminderAt`)

---

# Push notifications

Use:

- Firebase Cloud Messaging for mobile
  or
- Amazon SNS

---

# Cost comparison

| Approach    | Cost     | Scale     | Accuracy     |
| ----------- | -------- | --------- | ------------ |
| Cron        | low      | low       | minute       |
| TTL         | very low | high      | poor         |
| SQS         | low      | high      | great (<15m) |
| EventBridge | medium   | very high | exact        |
| Hybrid      | medium   | best      | exact        |

---

# Final recommendation

Use:

✅ Amazon DynamoDB as source of truth
✅ Amazon EventBridge Scheduler per reminder
✅ AWS Lambda for delivery
✅ Amazon SQS DLQ for failures
✅ Firebase Cloud Messaging / Amazon SNS to notify

That’s the most scalable and production-grade approach.

If you want, I can also draw the **AWS architecture diagram** for this.
