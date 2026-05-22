Here’s a full analysis of **Amazon EKS** for deploying your NestJS app.

![Image](https://images.openai.com/static-rsc-4/yEAXO--mPZ9mcmxGWuKUIM_MM4S4r-Z50-8ruGk-C1Q68gvGlNM67nVPjIf5gWtJtB2Ika6zMcF4TtviK20gDzrazR-ja55C_adasdGH45f4gLz9SsqxR_UM5FW8LNgD_Bil5LSSg19xU90-ixJX3K1JAcl1MVoZcXlLLuyFABFRxv7nUJW289qKFzVryyTp?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/nnXW1XtTaIBRKFxFY4QWXzEa6of1Q1E8Io4EpdIQ-L1U-NRyqtXUi0YzomdtIx2Ndkz8lLPPmaddRSr-h-eOFVR4PMB9JcX8x7GNCMroRhb_QQsk9pp7lal4bHHws_YyT0fF_e-6AHeVNhE_swO4xFL5e_uhGNHy8TgaAYpXjgcwc3M6Rm4vmNEghzuXk98B?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/qDx9Zpz8ZhY0y3p_iZVpY3YDb4EnzYdhq1q3j2N84W36pQY17EXE8gJwWcWpM0eeiZHUCoTFDEE40iAEo_juX3Or52uhngmgymgAeeGB2rbp8hyTm53kK3nCscHGyBilH0OlTKYVM-SWGfWTvbYNwnX-TLgmGBvJrt0uP3A5w3uxexXdy8geaqq32RWeRTcX?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/ASMZ2Z--4XvFHrkt_XqtVqCGxB1ybZkhCRsdNrP57Oy9rC5imzqyFb0UPuHonwF3wbItxOCQfuyTCdAztq57-ZMAxN-yoVE7uPVcUjOuGSDuRzta_ZaLSKqWEMxJIBIhg63p1UCEUR-iTcPpHT6j2pZb5HzH61Qo6j8OigDhWSYG-wO_k4HaClN_ohQIE8f0?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/oLcSd8f5pUHEGQwqJQMUuKaMOOhfBbP3SuN0nHCjxYlkCJDaY-2ySE5fi8-C7JhLjH623mwqjB3vIReSZfPpY2vzvsljS79ObEguv2TUftTl-ijefMv7BOskgZyUQ3cX3bD2zkxdqhywsdm__-G0ja6IaP1RIyos6Q9LPu3A7rJkJ0d6qmqDJHK9c8jAH5f_?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/43L4XK-5j484TxtylztVeihH3aVPJw8Oit0Wy9INWRj7zZL6_4OHXTdjoP5q0pjg3SbVsGpUR_N7OE7TCvoHq52oXbSDJB-4jyxeMNcfP1RUHhuXLE4geRDUZvgXNCxCsEqCsJCdjvbrBnEQjWbXhcZuNjSnW1kh4HE84VT8Xg9n7galDV15ehgYREgYj1tg?purpose=fullsize)

# 3. Amazon EKS (Kubernetes)

## What is it?

**Amazon EKS** is AWS’s **managed Kubernetes service**.

AWS manages:

- Kubernetes control plane

You manage:

- worker nodes
- pods
- deployments
- networking
- scaling rules

Architecture:

```text
User
  |
  v
Application Load Balancer
  |
  v
Kubernetes Ingress
  |
  v
Pods (NestJS)
```

---

# What is Kubernetes?

Kubernetes = container orchestrator.

It manages:

- deploy containers
- restart failed containers
- scale automatically
- service discovery
- rolling deployments

Example:

```text
Pod 1
Pod 2
Pod 3
```

If Pod 2 dies:

```text
Kubernetes creates new Pod automatically
```

---

# Main EKS components

### 1. Control Plane (managed by AWS)

Includes:

- API server
- scheduler
- etcd

AWS handles this.

Cost:

```text
~$0.10/hour
≈ $72/month
```

This is fixed.

Even if idle.

---

### 2. Worker Nodes

These run your pods.

Options:

#### Option A: EC2 nodes

```text
EC2 -> Kubernetes pods
```

You manage nodes.

---

#### Option B: AWS Fargate for EKS

```text
No node management
```

More expensive.

---

### 3. Pods

Your NestJS app runs inside pods.

Example:

```yaml
replicas: 3
```

Means:

```text
3 copies of app
```

---

# Deployment flow

1. Build Docker image
2. Push to Amazon ECR
3. Apply Kubernetes manifest

Example:

```bash
kubectl apply -f deployment.yaml
```

Kubernetes starts pods.

---

# Pricing

### A. Cluster fee

Fixed:

```text
$72/month
```

before anything runs.

Biggest downside.

---

### B. Worker nodes

Example:

2 × `t3.medium`

```text
~$60/month
```

---

### C. Load Balancer

Application Load Balancer

```text
~$20/month
```

---

### D. Storage

Amazon EBS

```text
~$5+
```

---

### Example total

Small setup:

```text
Cluster fee = $72
2 EC2      = $60
ALB        = $20
Storage    = $5
----------------
Total      = ~$157/month
```

Very expensive baseline.

---

# Performance

| Metric     | EKS          |
| ---------- | ------------ |
| cold start | none ✅      |
| latency    | excellent ✅ |
| throughput | excellent ✅ |
| scaling    | excellent ✅ |

Best performance.

---

# Scaling

Uses **Horizontal Pod Autoscaler (HPA)**.

Example:

```text
3 pods
CPU > 70%
↓
10 pods
```

Can also scale nodes via:

Cluster Autoscaler

Flow:

```text
Need more pods
↓
Need more servers
↓
add EC2 nodes
```

Very powerful.

---

# Pros

| Benefit                | Why                 |
| ---------------------- | ------------------- |
| enterprise-grade       | industry standard   |
| multi-cloud portable   | not AWS locked      |
| huge ecosystem         | Helm, operators     |
| excellent scaling      | best available      |
| supports many services | microservices ideal |

---

# Cons

| Problem                 | Why                |
| ----------------------- | ------------------ |
| expensive               | $72 base fee       |
| very complex            | many moving parts  |
| DevOps heavy            | needs expertise    |
| debugging harder        | pods/nodes/network |
| overkill for small apps | unnecessary        |

---

# DevOps needed

You need knowledge of:

- Kubernetes
- kubectl
- Helm
- ingress
- services
- networking
- RBAC
- secrets
- monitoring

Tools:

- [kubectl](https://kubernetes.io/docs/tasks/tools/?utm_source=chatgpt.com)
- [Helm](https://helm.sh/?utm_source=chatgpt.com)
- [Kubernetes Docs](https://kubernetes.io/docs/home/?utm_source=chatgpt.com)

Steep learning curve.

---

# Best use cases

Use EKS when:

✅ many microservices
✅ multi-team platform
✅ enterprise org
✅ multi-region workloads
✅ hybrid cloud
✅ need Kubernetes portability

Examples:

- fintech platform
- SaaS with 50+ services
- internal platform teams

---

# Why not chosen for your Todo app?

Your app:

- one NestJS backend
- DynamoDB
- notification workers
- moderate traffic

You do **not** need:

- Kubernetes operators
- service mesh
- cluster management

This:

```text
Todo App -> EKS
```

is like:

```text
using airplane to cross street
```

Overkill ❌

---

# Cost comparison

| Service     | Monthly |
| ----------- | ------: |
| AWS Lambda  |    $0–5 |
| AWS Fargate |   ~$40+ |
| Amazon EC2  |   ~$30+ |
| Amazon EKS  |  ~$150+ |

Clearly most expensive.

---

# Recommendation

For your current Todo app:

❌ EKS not recommended

Reasons:

- too complex
- expensive
- unnecessary
- slower team velocity

Choose:

```text
NestJS -> Lambda
DB -> DynamoDB
Events -> EventBridge
Notifications -> Lambda
```

That is cleaner and much cheaper.
