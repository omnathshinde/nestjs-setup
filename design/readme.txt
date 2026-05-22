Todos App

1. Functional Requirements

Users can:
- signup/login
- create/update/delete todos
- set reminders
- receive notifications
- mark complete
- list/filter/search todos
- sync across devices

Non-Functional Requirements

- low latency (<100ms reads)
- high availability (99.9%+)
- scalable to millions
- fault tolerant
- cost optimized
- secure


Architecture

                Client (Web/Mobile)
                        |
                    API Gateway
                        |
                    NestJS API
                        |
      +-----------------+------------------+
      |                                    |
      v                                    v
 Authentication                       Todo Service
      |                                    |
      v                                    v
     JWT                               DynamoDB
                                           |
                     +---------------------+------------------+
                     |                                        |
                     v                                        v
                  Outbox  (solve dual write problem)       Search Index (optional)
                     |
                     v
            EventBridge Scheduler   
                     |
                     v
                 Lambda Worker
                     |
             +-------+--------------------------------------------+
             |                                                    |
             v                                                    v
            SNS                                        SQS DLQ (Dead Letter Queue) liek Lambda Fails, handling failures/exceptions
             |
      Push / Email / SMS
      (Skip if only mobile/desktop push.)


AWS Lambda is a serverless compute service.
- you upload code
- AWS runs it only when triggered
- no server management
- auto scales from 0 → millions of requestsa
- you pay only for execution time


Amazon Cognito
Amazn Cognito is a managed identity and access management service by Amazon Web Services (AWS). 
It enables developers to add secure user sign-up, sign-in, and authorization to web, mobile, and machine-to-machine applications without building their own authentication infrastructure. 
Cognito proocesses over 100 billion authentications per month and scales automatically with application demand



Validation should be clear in backend and fronted


Edge Case
- Useer should be select future date
- File Upload size should be less than 10mb 
- One task have multiple files
- What if user upload more than 10mb file 


Error handling
- Logging
- Server level handling error (like user creat update, delete, DB Error)
- Infra level handling errro (AWS server faills then how to handle it)

                    ┌────────────────────┐
                    │     Frontend       │
                    │ React / Mobile App │
                    └─────────┬──────────┘
                              │
                    Input Validation Layer
                              │
                              ▼
                    ┌────────────────────┐
                    │   API Gateway      │
                    │ rate limit/auth    │
                    └─────────┬──────────┘
                              │
                              ▼
                  ┌──────────────────────────┐
                  │      NestJS API          │
                  │ Global Error Handler     │
                  │ Validation Pipe          │
                  │ Business Errors          │
                  └──────┬─────────┬─────────┘
                         │         │
                         ▼         ▼
                   DynamoDB      S3 Upload
                         │         │
                         ▼         ▼
                      Outbox     Upload Events
                         │
                         ▼
                    EventBridge
                         │
                         ▼
                      Lambda
                         │
                         ▼
                        SQS
                         │
                         ▼
                   Notification
                         │
                         ▼
                    CloudWatch
                         │
                         ▼
                      Alerts


src/
├── app.module.ts
│
├── common/
│   ├── errors/
│   │   ├── app.error.ts
│   │   ├── validation.error.ts
│   │   ├── database.error.ts
│   │   ├── aws.error.ts
│   │   ├── notification.error.ts
│   │   └── business.error.ts
│   │
│   ├── filters/
│   │   └── global-exception.filter.ts
│   │
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   ├── timeout.interceptor.ts
│   │   └── tracing.interceptor.ts
│   │
│   ├── middleware/
│   │   ├── request-id.middleware.ts
│   │   └── auth.middleware.ts
│   │
│   ├── retry/
│   │   ├── retry.service.ts
│   │   └── circuit-breaker.ts
│   │
│   └── logger/
│       └── logger.service.ts
│
├── modules/
│   ├── todo/
│   ├── upload/
│   ├── notification/
│   └── auth/
│
├── infrastructure/
│   ├── aws/
│   │   ├── s3/
│   │   ├── sqs/
│   │   ├── eventbridge/
│   │   └── lambda/
│   │
│   ├── database/
│   │   └── dynamodb/
│   │
│   └── monitoring/
│       ├── cloudwatch.ts
│       └── sentry.ts
│
└── main.ts