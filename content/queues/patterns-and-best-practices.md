---
title: Queue Patterns and Best Practices
tags: [queues, patterns, best-practices, architecture, reliability]
---

# Queue Patterns and Best Practices

Building reliable queue-based systems requires understanding common patterns, handling failures gracefully, and following best practices. This guide covers battle-tested patterns and lessons learned from production systems.

## Common Queue Patterns

### 1. Simple Queue (Job Queue)

The most basic pattern: producer adds jobs, worker processes them.

```typescript
// Producer: Add job
await queue.add('send-email', {
  to: 'user@example.com',
  subject: 'Welcome!',
  body: 'Thanks for signing up!',
});

// Worker: Process job
queue.process('send-email', async (job) => {
  const { to, subject, body } = job.data;
  await emailService.send(to, subject, body);
});
```

**When to use:**
- Background tasks in a single application
- Decoupling request/response from processing
- Simple asynchronous work

**Example use cases:**
- Email sending
- Image resizing
- Report generation
- Data cleanup

### 2. Pub/Sub (Fan-Out)

One event triggers multiple independent consumers.

```typescript
// Publisher: Emit event
await eventBus.publish('user.created', {
  userId: '123',
  email: 'user@example.com',
  name: 'John Doe',
});

// Subscriber 1: Send welcome email
eventBus.subscribe('user.created', async (event) => {
  await sendWelcomeEmail(event.email, event.name);
});

// Subscriber 2: Create Stripe customer
eventBus.subscribe('user.created', async (event) => {
  await stripe.customers.create({
    email: event.email,
    metadata: { userId: event.userId },
  });
});

// Subscriber 3: Track analytics
eventBus.subscribe('user.created', async (event) => {
  await analytics.track('User Signed Up', event);
});

// Subscriber 4: Notify Slack
eventBus.subscribe('user.created', async (event) => {
  await slack.notify(`New user: ${event.name} (${event.email})`);
});
```

**Benefits:**
- ✅ Loose coupling (subscribers don't know about each other)
- ✅ Easy to add new subscribers
- ✅ Failures isolated (one subscriber failing doesn't affect others)
- ✅ Scalable (each subscriber can scale independently)

**When to use:**
- Event-driven architectures
- Microservices
- Need multiple systems to react to same event
- Want to add functionality without changing producers

**Example use cases:**
- User lifecycle events (signup, upgrade, churn)
- Order processing (order created → notify, fulfill, invoice)
- Content publishing (publish article → index, notify, cache)

### 3. Pipeline (Chain of Stages)

Jobs pass through multiple sequential processing stages.

```typescript
// Stage 1: Upload video
await videoQueue.add('upload', {
  videoId: 'vid_123',
  url: 's3://bucket/raw/video.mp4',
});

// Stage 1 → Stage 2
videoQueue.process('upload', async (job) => {
  const { videoId, url } = job.data;

  // Upload to storage
  const uploadedUrl = await storage.upload(url);

  // Pass to next stage
  await videoQueue.add('transcode', {
    videoId,
    url: uploadedUrl,
  });
});

// Stage 2 → Stage 3
videoQueue.process('transcode', async (job) => {
  const { videoId, url } = job.data;

  // Transcode to multiple formats
  const formats = await transcoder.transcode(url, [
    '1080p', '720p', '480p', '360p'
  ]);

  // Pass to next stage
  await videoQueue.add('thumbnail', {
    videoId,
    formats,
  });
});

// Stage 3: Final processing
videoQueue.process('thumbnail', async (job) => {
  const { videoId, formats } = job.data;

  // Generate thumbnails
  await generateThumbnails(videoId, formats);

  // Mark video as ready
  await db.videos.update(videoId, { status: 'ready' });
});
```

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Each stage can scale independently
- ✅ Easy to debug (know which stage failed)
- ✅ Can retry individual stages

**When to use:**
- Multi-step processing with clear stages
- Different stages have different resource requirements
- Want to scale stages independently

**Example use cases:**
- Video/audio processing (upload → transcode → thumbnail → publish)
- Document processing (upload → OCR → extract → index)
- ETL pipelines (extract → transform → load)
- Order fulfillment (validate → charge → reserve → ship)

### 4. Priority Queue

Higher priority jobs processed first.

```typescript
// High priority: Paid users
await queue.add('process-video', {
  videoId: 'vid_123',
  userId: 'paid_user',
}, {
  priority: 10,  // Highest priority
});

// Medium priority: Trial users
await queue.add('process-video', {
  videoId: 'vid_456',
  userId: 'trial_user',
}, {
  priority: 5,
});

// Low priority: Free users or batch jobs
await queue.add('process-video', {
  videoId: 'vid_789',
  userId: 'free_user',
}, {
  priority: 1,
});

// Worker processes higher priority first
queue.process('process-video', async (job) => {
  await processVideo(job.data);
});
```

**When to use:**
- Different SLA tiers (paid vs free users)
- Urgent vs routine tasks
- Interactive vs batch processing

**Example use cases:**
- Customer support (premium → standard → basic)
- API rate limiting (paid → trial → free)
- Real-time vs batch analytics

### 5. Delayed Jobs

Schedule jobs to run in the future.

```typescript
// Send reminder in 3 days
await queue.add('send-reminder', {
  userId: 'user_123',
  type: 'trial-ending',
}, {
  delay: 3 * 24 * 60 * 60 * 1000,  // 3 days
});

// Follow-up email after purchase
await queue.add('follow-up', {
  orderId: 'order_456',
}, {
  delay: 7 * 24 * 60 * 60 * 1000,  // 7 days
});

// Worker processes when time comes
queue.process('send-reminder', async (job) => {
  const { userId, type } = job.data;
  await sendReminder(userId, type);
});
```

**When to use:**
- Time-based actions
- Drip campaigns
- Reminder systems
- Scheduled cleanups

**Example use cases:**
- Email drip campaigns
- Trial expiration reminders
- Abandoned cart reminders
- Subscription renewal notifications

### 6. Rate-Limited Queue

Control throughput to external APIs.

```typescript
// API allows 100 requests/minute
queue.process('call-api', {
  concurrency: 5,  // 5 workers
  limiter: {
    max: 100,       // 100 jobs
    duration: 60000, // per minute
  },
}, async (job) => {
  await externalAPI.call(job.data);
});

// Can add jobs freely
for (let i = 0; i < 10000; i++) {
  await queue.add('call-api', { id: i });
}

// Queue respects rate limit automatically
```

**When to use:**
- External API rate limits
- Database load management
- Respect downstream service capacity

**Example use cases:**
- Sending emails (SendGrid limits)
- SMS sending (Twilio limits)
- Social media APIs (Twitter, Instagram limits)
- Search indexing (Algolia limits)

### 7. Batch Processing

Process multiple items together for efficiency.

```typescript
// Collect jobs into batches
const batch: Array<JobData> = [];
const BATCH_SIZE = 100;

queue.process('process-item', async (job) => {
  batch.push(job.data);

  if (batch.length >= BATCH_SIZE) {
    // Process batch together
    await processBatch(batch);
    batch.length = 0;  // Clear batch
  }
});

// Or use a better approach with BullMQ groups
queue.process('process-items', async (job) => {
  // Job contains 100 items
  const items = job.data.items;
  await processBatch(items);
});

// Producer adds items in batches
const items = await getItemsToProcess();
const chunks = chunkArray(items, 100);

for (const chunk of chunks) {
  await queue.add('process-items', { items: chunk });
}
```

**When to use:**
- Database operations (bulk inserts)
- API calls (batch endpoints)
- Reduce overhead

**Example use cases:**
- Database bulk operations
- S3 multi-part uploads
- Email campaigns (batch API)
- Analytics event batching

### 8. Dead Letter Queue (DLQ)

Handle permanently failed jobs.

```typescript
// Main queue with retry logic
await queue.add('risky-operation', data, {
  attempts: 3,  // Try 3 times
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
});

// Worker processes job
queue.process('risky-operation', async (job) => {
  if (job.attemptsMade < 3) {
    // Might fail, will retry
    await riskyAPI.call(job.data);
  } else {
    // Final attempt failed
    // Move to DLQ for manual review
    await dlq.add('failed-risky-operation', {
      originalData: job.data,
      error: job.failedReason,
      attempts: job.attemptsMade,
    });
  }
});

// Monitor DLQ
dlq.on('completed', async (job) => {
  // Alert team
  await slack.notify(`Job failed permanently: ${job.id}`);
});
```

**When to use:**
- Operations that might fail permanently
- Need to investigate failures manually
- Can't lose jobs (financial, critical operations)

**Example use cases:**
- Payment processing
- Critical data sync
- Webhook delivery
- Third-party integrations

## Best Practices

### 1. Idempotency

Make jobs safe to retry.

```typescript
// ❌ Bad: Not idempotent
queue.process('charge-customer', async (job) => {
  const { customerId, amount } = job.data;

  // If this succeeds but job fails later, customer charged twice!
  await stripe.charges.create({
    customer: customerId,
    amount,
  });

  await db.orders.markAsPaid(job.data.orderId);
});
```

```typescript
// ✅ Good: Idempotent with idempotency key
queue.process('charge-customer', async (job) => {
  const { customerId, amount, orderId } = job.data;

  // Stripe deduplicates by idempotency key
  await stripe.charges.create({
    customer: customerId,
    amount,
    idempotency_key: `order_${orderId}`,
  });

  await db.orders.markAsPaid(orderId);
});

// If job retries, Stripe returns existing charge instead of creating new one
```

**Pattern: Check before acting**

```typescript
queue.process('send-welcome-email', async (job) => {
  const { userId } = job.data;

  // Check if already sent
  const alreadySent = await db.emails.exists({
    userId,
    type: 'welcome',
  });

  if (alreadySent) {
    console.log('Email already sent, skipping');
    return;
  }

  // Send email
  await emailService.send(userId, 'welcome');

  // Record that we sent it
  await db.emails.create({
    userId,
    type: 'welcome',
    sentAt: new Date(),
  });
});
```

### 2. Timeouts

Prevent jobs from hanging forever.

```typescript
// ❌ Bad: No timeout
queue.process('call-slow-api', async (job) => {
  // Might hang forever
  const response = await fetch(job.data.url);
  return await response.json();
});
```

```typescript
// ✅ Good: Timeout protection
queue.process('call-slow-api', async (job) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(job.data.url, {
      signal: controller.signal,
    });
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
});

// Or use job timeout in BullMQ
await queue.add('call-slow-api', data, {
  timeout: 30000,  // Kill job after 30s
});
```

### 3. Structured Logging

Log enough to debug failures.

```typescript
queue.process('process-order', async (job) => {
  const logger = createLogger({
    jobId: job.id,
    orderId: job.data.orderId,
  });

  logger.info('Starting order processing');

  try {
    logger.info('Charging payment');
    await chargePayment(job.data);

    logger.info('Updating inventory');
    await updateInventory(job.data);

    logger.info('Sending confirmation');
    await sendConfirmation(job.data);

    logger.info('Order processing complete');
  } catch (error) {
    logger.error('Order processing failed', {
      error: error.message,
      stack: error.stack,
      stage: 'payment',  // Which stage failed
    });
    throw error;
  }
});
```

### 4. Monitoring and Alerting

Know when things break.

```typescript
// Monitor queue health
queue.on('failed', (job, error) => {
  // Log to error tracking
  Sentry.captureException(error, {
    extra: {
      jobId: job.id,
      jobData: job.data,
      attempts: job.attemptsMade,
    },
  });

  // Alert if failure rate high
  const failureRate = await getFailureRate();
  if (failureRate > 0.1) {  // >10% failures
    await slack.alert('Queue failure rate high: ' + failureRate);
  }
});

// Monitor queue lag
setInterval(async () => {
  const waiting = await queue.getWaitingCount();
  const active = await queue.getActiveCount();

  if (waiting > 10000) {
    await slack.alert(`Queue backlog: ${waiting} jobs waiting`);
  }

  // Export metrics
  metrics.gauge('queue.waiting', waiting);
  metrics.gauge('queue.active', active);
}, 60000);
```

### 5. Graceful Shutdown

Don't lose jobs on deploy.

```typescript
// Handle shutdown signals
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');

  // Stop accepting new jobs
  await worker.close();

  // Wait for active jobs to finish (max 30s)
  const timeout = setTimeout(() => {
    console.log('Force shutdown after timeout');
    process.exit(1);
  }, 30000);

  // Wait for jobs to complete
  await worker.waitUntilReady();
  clearTimeout(timeout);

  console.log('All jobs completed, exiting');
  process.exit(0);
});
```

### 6. Backpressure

Don't overwhelm downstream systems.

```typescript
// ❌ Bad: Add millions of jobs instantly
const users = await db.users.getAll();  // 1M users
for (const user of users) {
  await queue.add('send-email', { userId: user.id });
}
// Queue explodes, Redis runs out of memory
```

```typescript
// ✅ Good: Add jobs in controlled batches
const users = await db.users.getAll();
const BATCH_SIZE = 1000;

for (let i = 0; i < users.length; i += BATCH_SIZE) {
  const batch = users.slice(i, i + BATCH_SIZE);

  await queue.addBulk(
    batch.map(user => ({
      name: 'send-email',
      data: { userId: user.id },
    }))
  );

  // Wait a bit between batches
  await sleep(100);
}
```

### 7. Job Data Size

Keep job data small.

```typescript
// ❌ Bad: Large data in job
await queue.add('process-video', {
  videoId: 'vid_123',
  videoData: largeBuffer,  // 100MB in Redis!
});
```

```typescript
// ✅ Good: Reference, fetch data in worker
await queue.add('process-video', {
  videoId: 'vid_123',
  s3Key: 's3://bucket/videos/vid_123.mp4',
});

queue.process('process-video', async (job) => {
  // Fetch from S3 in worker
  const videoData = await s3.getObject(job.data.s3Key);
  await processVideo(videoData);
});
```

### 8. Error Handling Strategies

Different strategies for different failure types.

```typescript
queue.process('api-call', async (job) => {
  try {
    return await externalAPI.call(job.data);
  } catch (error) {
    // Categorize error
    if (error.code === 'RATE_LIMITED') {
      // Retry after delay
      throw new Error('Rate limited, will retry');
    }

    if (error.code === 'AUTH_FAILED') {
      // Don't retry, alert immediately
      await slack.alert('API auth failed!');
      throw new Error('Auth failed, manual fix needed');
    }

    if (error.code === 'BAD_REQUEST') {
      // Data issue, don't retry
      await db.failedJobs.create({
        jobId: job.id,
        error: error.message,
        data: job.data,
      });
      // Don't throw - job is "complete" (failed gracefully)
      return;
    }

    // Unknown error, retry
    throw error;
  }
});
```

## Anti-Patterns (What Not to Do)

### ❌ 1. Querying State in Producer

```typescript
// ❌ Bad: Producer queries state
for (const userId of userIds) {
  const user = await db.users.findById(userId);  // 1000 queries!
  await queue.add('send-email', {
    email: user.email,
    name: user.name,
  });
}

// ✅ Good: Worker queries state
for (const userId of userIds) {
  await queue.add('send-email', { userId });  // Fast
}

queue.process('send-email', async (job) => {
  const user = await db.users.findById(job.data.userId);
  await sendEmail(user.email, user.name);
});
```

### ❌ 2. Infinite Retries

```typescript
// ❌ Bad: Retry forever
await queue.add('flaky-api', data, {
  attempts: Infinity,  // Never give up!
});

// ✅ Good: Reasonable retry limit
await queue.add('flaky-api', data, {
  attempts: 5,
  backoff: { type: 'exponential', delay: 2000 },
});
```

### ❌ 3. Blocking Workers

```typescript
// ❌ Bad: Blocking loop in worker
queue.process('monitor', async (job) => {
  while (true) {  // Blocks worker forever
    await checkStatus();
    await sleep(1000);
  }
});

// ✅ Good: Use recurring job
await queue.add('monitor', {}, {
  repeat: {
    every: 1000,  // Every second
  },
});

queue.process('monitor', async (job) => {
  await checkStatus();
  // Job completes, worker free for other jobs
});
```

### ❌ 4. Not Handling Poison Pills

```typescript
// ❌ Bad: Bad data crashes worker forever
queue.process('process-data', async (job) => {
  const result = JSON.parse(job.data.json);  // Throws on bad JSON
  // Worker crashes, restarts, crashes again...
});

// ✅ Good: Validate and handle bad data
queue.process('process-data', async (job) => {
  try {
    const result = JSON.parse(job.data.json);
    await processData(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Bad data, log and skip
      logger.error('Invalid JSON', { jobId: job.id, data: job.data });
      return;  // Don't retry
    }
    throw error;  // Other errors, retry
  }
});
```

## Key Takeaways

**Pattern Selection:**
- **Simple tasks** → Simple queue
- **Multiple reactions** → Pub/sub
- **Sequential stages** → Pipeline
- **User tiers** → Priority queue
- **Rate limits** → Rate-limited queue

**Reliability:**
- ✅ Make jobs idempotent
- ✅ Set timeouts
- ✅ Use structured logging
- ✅ Monitor and alert
- ✅ Graceful shutdown

**Performance:**
- ✅ Keep job data small
- ✅ Control backpressure
- ✅ Use appropriate concurrency
- ✅ Batch when possible

**Error Handling:**
- ✅ Retry transient failures
- ✅ Don't retry permanent failures
- ✅ Use dead letter queues
- ✅ Alert on critical failures

## Resources

- **Queue Patterns**: [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)
- **BullMQ Guide**: [docs.bullmq.io/guide](https://docs.bullmq.io/guide)
- **Reliability Patterns**: [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- **Microservices Patterns**: [microservices.io/patterns](https://microservices.io/patterns/index.html)
