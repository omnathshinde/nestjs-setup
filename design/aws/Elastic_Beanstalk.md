Here’s a full analysis of **AWS Elastic Beanstalk** for deploying your NestJS app.

![Image](https://images.openai.com/static-rsc-4/GLu9453v2Sw_eMrqCRLVyzmXzxkIqXWVIjwTWwO9h5VV5UP55u0n-4kdXHamAW6NWXZLsIIphrvWwn9ognKp50gZPIHT3vqw5zt2EAN-HhkPbScDYQ6JCgZPGj_Pcj5X7OYXHY2nGi-AS73RvUNma0E0QRb6j-LFzFLdU4vs7oqdbQ-daCn2O5uxU7HSJo-U?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/c9wNJXDfWrHyWoe3wsjwXqbHPz3_SnZdJjKCQywC_t9zwx18CH35nt4SRyQmC0J887f-U_1FbnRPt9iR0aNxts7Qtk0Mp_SB50HiJnZApf2bVIoB91sHj6nmSFfx9NXOtlR7K1EQiHjrxc-c6XGU3YOasOWYGfAvGKJJ3OTBBnIMn24tm3LOeomaDR6JBmam?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/R4YjpvD870GXYReGpmE7AF2Qx9wdDVzBvQGrZAjWYyvGg7TJ1mbB_ig4UShtj5as_usw3trNKkIkJlvMu5dPYt4NpAED9LuqlN661_eZLEz_oLflPvqVFtRasXP1JBzvbcVKSPZb4VJPAQl2jPQVwYnPk_ETq__KwE9UOf2TuOBLljezP-4teyrT6wP1-V9I?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/niJ5oBoN8CPzINztmZrzrrGPYVa6MHMVF1jJPKfv1mUrEn82G0qzJ0rd6O6ZEOA8MkUqUcalXpiHQ1KCvbYVc6bHs5A6IBhJ1pnnS6ACtnNFXK-XGR_FAzuDiuBAwWG5wHLp4vMYzICpQkQK5H64FW-5WzgtObt0NZCgApYbWR3Jn9j3DUnms7aidBo-IAQt?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/nk3sQEgjutrUor2OsH34tfCicAjKHwe17qdjv_jX4Oft6hiLLvKtyhO2CJv-qjBpAer5Et70T9Wjw4D0fdoOK6EizMkRkJKNPlGQ3XSAV5a0zxqCLwg4mlc0_EuxS-0O5-tuVcUm8AA2kO_HQjjwcv2RCf7xy8sl6V3Ty6mNsYtD9tSKQobo9Rs03zJXFZ5X?purpose=fullsize)

# 4. AWS Elastic Beanstalk

---

# What is it?

**AWS Elastic Beanstalk** is AWS’s **Platform as a Service (PaaS)**.

You upload your app code.

AWS automatically creates:

- Amazon EC2
- Elastic Load Balancing
- Amazon EC2 Auto Scaling
- Amazon CloudWatch

Architecture:

```text id="u8y0hz"
User
  |
  v
Elastic Load Balancer
  |
  v
EC2 Instance
  |
  v
NestJS App
```

It is basically:

```text id="0edzmx"
EC2 + automation
```

---

# How deployment works

Step 1:

Package app:

```bash id="2wul7m"
zip app.zip
```

---

Step 2:

Upload to Beanstalk

```text id="lxx7ys"
AWS deploys automatically
```

---

Step 3:

It creates:

```text id="cq1wr2"
EC2
Load Balancer
Autoscaling
Monitoring
```

No manual infra setup.

---

# What Beanstalk manages

| Managed by AWS   | You manage  |
| ---------------- | ----------- |
| EC2 provisioning | app code    |
| load balancer    | env vars    |
| autoscaling      | app config  |
| health checks    | deployments |

So less DevOps than EC2.

---

# Pricing

Important:

Beanstalk itself = **free**

You pay for underlying resources.

---

## Example

1 x `t3.small`

```text id="wkllmv"
EC2 = $15
```

---

ALB:

```text id="qf3yks"
~$20
```

---

Storage:

Amazon EBS (Elastic Block Store)

```text id="bx5s34"
~$2
```

---

Total:

```text id="6zv2f2"
~$37/month
```

Exactly like EC2.

---

# Performance

| Metric     | Beanstalk |
| ---------- | --------- |
| cold start | none ✅   |
| latency    | good ✅   |
| throughput | good ✅   |

Same as EC2 underneath.

---

# Scaling

Uses:

Amazon EC2 Auto Scaling

Example:

```text id="61vt0u"
2 instances
↓
traffic spike
↓
10 instances
```

Works well.

But slower than Lambda.

---

# Deployment options

Supports:

- rolling
- rolling with extra batch
- immutable
- blue/green

Example:

```text id="a7pbmj"
deploy v2
keep v1 alive
switch traffic
```

Nice for safer deploys.

---

# Pros

| Benefit              | Why               |
| -------------------- | ----------------- |
| easy deployment      | simple            |
| less DevOps          | AWS manages infra |
| supports Node/NestJS | native            |
| autoscaling          | built in          |
| easy rollback        | one click         |

Great for beginners.

---

# Cons

| Problem           | Why                    |
| ----------------- | ---------------------- |
| still EC2         | always running         |
| still pay monthly | idle cost              |
| less flexibility  | opinionated            |
| older AWS service | not most modern        |
| hidden complexity | troubleshooting harder |

---

# DevOps needed

Less than EC2, but still need:

- app config
- environment vars
- logs
- instance sizing
- security groups

Not fully serverless.

---

# Best use cases

Use when:

✅ simple monolith
✅ lift-and-shift migration
✅ want quick deployment
✅ small team

Examples:

- legacy Node app
- simple API
- internal tools

---

# Why not chosen for your Todo app?

Your architecture:

```text id="l62kcq"
NestJS
DynamoDB
notifications
event-driven
```

av
You want:

- pay per use
- burst handling
- serverless

Beanstalk gives:

```text id="4nblcb"
always-on EC2
```

Meaning:

Even when traffic is zero:

```text id="bh9m2q"
still paying
```

Wasteful ❌

---

# Comparison

| Feature           | Beanstalk | Lambda |
| ----------------- | --------- | ------ |
| serverless        | ❌        | ✅     |
| pay per request   | ❌        | ✅     |
| server management | partial   | none   |
| idle cost         | yes       | none   |

Lambda wins.

---

# Recommendation

For your Todo app:

❌ do not use **AWS Elastic Beanstalk**

Because:

- not truly serverless
- still EC2-based
- higher idle cost
- not aligned with your event-driven design

Better:

```text id="bmeq5n"
API -> Lambda
DB -> DynamoDB
Events -> EventBridge
Notify -> Lambda
```

That’s cleaner, cheaper, and more scalable.
