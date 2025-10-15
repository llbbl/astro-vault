---
title: Redis
tags: [redis, cache, key-value, in-memory, session, pubsub, realtime]
---

# Redis

Redis (Remote Dictionary Server) is an in-memory data structure store used as a database, cache, message broker, and queue. Created in 2009, Redis is known for extreme speed—capable of millions of operations per second. For JavaScript/TypeScript developers, Redis is essential for caching, session storage, real-time features, and rate limiting.

## What is Redis?

**Redis** is an **in-memory key-value store**:

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Set key-value
await redis.set('user:123', JSON.stringify({ name: 'Alice', age: 25 }));

// Get value
const data = await redis.get('user:123');
const user = JSON.parse(data);

// Set with expiration (TTL)
await redis.set('session:abc', 'user123', 'EX', 3600); // Expires in 1 hour

// Delete
await redis.del('user:123');
```

**Key Features:**
- **In-memory**: Extremely fast (microsecond latency)
- **Data structures**: Strings, lists, sets, hashes, sorted sets
- **Persistence**: Optional disk persistence
- **Pub/Sub**: Real-time messaging
- **Atomic operations**: Race-condition free
- **Clustering**: Horizontal scaling

## Why Redis?

### 1. Speed

Redis operates in-memory:

```
Database Query (Postgres):  ~5-50ms
Redis Cache:                ~0.1-1ms  (50x faster!)
```

### 2. Rich Data Structures

Beyond simple key-value:

```javascript
// String
await redis.set('counter', '0');
await redis.incr('counter'); // 1
await redis.decr('counter'); // 0

// List (ordered collection)
await redis.lpush('tasks', 'task1', 'task2', 'task3');
await redis.lrange('tasks', 0, -1); // ['task3', 'task2', 'task1']

// Set (unique values)
await redis.sadd('tags', 'javascript', 'typescript', 'redis');
await redis.smembers('tags'); // ['javascript', 'typescript', 'redis']

// Hash (object)
await redis.hset('user:123', 'name', 'Alice', 'age', '25');
await redis.hgetall('user:123'); // { name: 'Alice', age: '25' }

// Sorted Set (ranked values)
await redis.zadd('leaderboard', 100, 'alice', 75, 'bob', 90, 'charlie');
await redis.zrange('leaderboard', 0, -1, 'WITHSCORES');
// ['bob', '75', 'charlie', '90', 'alice', '100']
```

### 3. Pub/Sub (Real-Time Messaging)

```javascript
// Subscriber
const subscriber = new Redis();

subscriber.subscribe('notifications', (err, count) => {
  console.log(`Subscribed to ${count} channel(s)`);
});

subscriber.on('message', (channel, message) => {
  console.log(`Received on ${channel}:`, message);
});

// Publisher
const publisher = new Redis();
await publisher.publish('notifications', 'New message!');
```

### 4. Atomic Operations

Race-condition free operations:

```javascript
// Atomic increment (safe with multiple clients)
await redis.incr('page:views');

// Atomic decrement
await redis.decr('inventory:item123');

// Get and set atomically
const oldValue = await redis.getset('key', 'newValue');

// Set if not exists (lock)
const acquired = await redis.setnx('lock:resource', 'locked');
if (acquired) {
  // Got the lock
}
```

## Using Redis with TypeScript

### With ioredis (Recommended)

```bash
pnpm add ioredis
pnpm add -D @types/ioredis
```

```typescript
import Redis from 'ioredis';

// Connect
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: 'your-password',
  // Or use URL
  // url: process.env.REDIS_URL,
});

// Basic operations
await redis.set('key', 'value');
const value = await redis.get('key');

// With TypeScript types
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: '123',
  name: 'Alice',
  email: 'alice@example.com',
};

// Store JSON
await redis.set(`user:${user.id}`, JSON.stringify(user));

// Retrieve JSON
const data = await redis.get(`user:${user.id}`);
const retrievedUser: User = JSON.parse(data!);
```

### With node-redis

```bash
pnpm add redis
```

```typescript
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
});

await client.connect();

// Set/Get
await client.set('key', 'value');
const value = await client.get('key');

// JSON (requires RedisJSON module)
await client.json.set('user:123', '$', {
  name: 'Alice',
  age: 25,
});

const user = await client.json.get('user:123');
```

## Common Use Cases

### 1. Caching

```typescript
async function getUser(id: string): Promise<User> {
  const cacheKey = `user:${id}`;

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Cache miss - query database
  const user = await db.user.findUnique({ where: { id } });

  // Store in cache for 1 hour
  await redis.set(cacheKey, JSON.stringify(user), 'EX', 3600);

  return user;
}

// Invalidate cache on update
async function updateUser(id: string, data: Partial<User>) {
  const user = await db.user.update({ where: { id }, data });

  // Delete from cache
  await redis.del(`user:${id}`);

  return user;
}
```

### 2. Session Storage

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL);

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      secure: process.env.NODE_ENV === 'production',
    },
  })
);
```

### 3. Rate Limiting

```typescript
async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `rate_limit:${userId}`;
  const limit = 100; // 100 requests
  const window = 60; // per minute

  const current = await redis.incr(key);

  if (current === 1) {
    // First request - set expiration
    await redis.expire(key, window);
  }

  return current <= limit;
}

// Usage in API
app.get('/api/data', async (req, res) => {
  const allowed = await checkRateLimit(req.user.id);

  if (!allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Process request...
});
```

### 4. Job Queue (with BullMQ)

```bash
pnpm add bullmq
```

```typescript
import { Queue, Worker } from 'bullmq';

// Create queue
const emailQueue = new Queue('emails', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

// Add job
await emailQueue.add('send-welcome', {
  to: 'alice@example.com',
  subject: 'Welcome!',
  body: 'Welcome to our app!',
});

// Process jobs
const worker = new Worker(
  'emails',
  async (job) => {
    console.log('Processing job:', job.data);
    await sendEmail(job.data);
  },
  {
    connection: {
      host: 'localhost',
      port: 6379,
    },
  }
);
```

### 5. Leaderboard

```typescript
// Add score
await redis.zadd('leaderboard', 1250, 'alice');
await redis.zadd('leaderboard', 980, 'bob');
await redis.zadd('leaderboard', 1100, 'charlie');

// Get top 10
const topPlayers = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
// ['alice', '1250', 'charlie', '1100', 'bob', '980']

// Get user rank (0-indexed)
const rank = await redis.zrevrank('leaderboard', 'alice'); // 0 (1st place)

// Get user score
const score = await redis.zscore('leaderboard', 'alice'); // 1250

// Increment score
await redis.zincrby('leaderboard', 50, 'alice'); // 1300
```

### 6. Distributed Locking

```typescript
async function acquireLock(resource: string, ttl: number = 10): Promise<boolean> {
  const lockKey = `lock:${resource}`;
  const acquired = await redis.set(lockKey, 'locked', 'NX', 'EX', ttl);
  return acquired === 'OK';
}

async function releaseLock(resource: string): Promise<void> {
  await redis.del(`lock:${resource}`);
}

// Usage
async function processResource(id: string) {
  const locked = await acquireLock(id);

  if (!locked) {
    throw new Error('Resource is locked');
  }

  try {
    // Do work
    await doWork(id);
  } finally {
    await releaseLock(id);
  }
}
```

## Redis + Framework Integration

### With Next.js

```typescript
// lib/redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export default redis;
```

```typescript
// app/api/data/route.ts
import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET() {
  const cached = await redis.get('data');

  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }

  const data = await fetchData();
  await redis.set('data', JSON.stringify(data), 'EX', 300); // 5 minutes

  return NextResponse.json(data);
}
```

### With Node.js/Express

```typescript
import express from 'express';
import Redis from 'ioredis';

const app = express();
const redis = new Redis(process.env.REDIS_URL);

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `user:${id}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // Query database
  const user = await db.user.findUnique({ where: { id } });

  // Cache for 1 hour
  await redis.set(cacheKey, JSON.stringify(user), 'EX', 3600);

  res.json(user);
});

app.listen(3000);
```

## Redis Cloud Providers

### Upstash (Serverless Redis)

**Perfect for serverless/edge:**

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Works in edge runtimes (Cloudflare Workers, Vercel Edge)
await redis.set('key', 'value');
```

**Pricing:**
- Free: 10,000 commands/day
- Pay-as-you-go: $0.20 per 100K commands

### Redis Cloud (RedisLabs)

Official cloud offering:

**Pricing:**
- Free: 30 MB
- Paid: $7+/month

### AWS ElastiCache

Managed Redis on AWS:

**Pricing:**
- Starts at ~$15/month (t4g.micro)

## Performance Tips

### 1. Use Pipelining

```typescript
// ❌ Bad - multiple round trips
for (let i = 0; i < 1000; i++) {
  await redis.set(`key:${i}`, `value${i}`);
}

// ✓ Good - single round trip
const pipeline = redis.pipeline();
for (let i = 0; i < 1000; i++) {
  pipeline.set(`key:${i}`, `value${i}`);
}
await pipeline.exec();
```

### 2. Set Expiration

```typescript
// ✓ Good - prevent memory bloat
await redis.set('session:123', 'data', 'EX', 3600);

// ❌ Bad - stays in memory forever
await redis.set('session:123', 'data');
```

### 3. Use Appropriate Data Structures

```typescript
// ✓ Good - use hash for objects
await redis.hset('user:123', 'name', 'Alice', 'age', '25');

// ❌ Bad - storing as JSON string
await redis.set('user:123', JSON.stringify({ name: 'Alice', age: 25 }));
```

## Persistence Options

### RDB (Snapshotting)

Point-in-time snapshots:

```bash
# redis.conf
save 900 1      # Save after 900 seconds if 1 key changed
save 300 10     # Save after 300 seconds if 10 keys changed
save 60 10000   # Save after 60 seconds if 10000 keys changed
```

### AOF (Append-Only File)

Log every write operation:

```bash
# redis.conf
appendonly yes
appendfsync everysec  # Fsync every second
```

### Hybrid (RDB + AOF)

Best of both worlds (Redis 4.0+).

## Redis vs. Other Caches

| Feature | Redis | Memcached | In-Memory JS Object |
|---------|-------|-----------|---------------------|
| **Data Structures** | Rich | Key-value only | Any |
| **Persistence** | Optional | No | No |
| **Pub/Sub** | Yes | No | No |
| **Clustering** | Yes | Yes | No |
| **Atomic Ops** | Yes | Limited | No (race conditions) |
| **Best For** | Everything | Simple cache | Single process |

## Key Takeaways

- **In-memory** data store (extremely fast)
- **Rich data structures**: strings, lists, sets, hashes, sorted sets
- **Perfect for** caching, sessions, rate limiting, queues
- **Pub/Sub** for real-time messaging
- **Use ioredis** for TypeScript
- **Upstash** for serverless/edge deployments
- **Set expiration** to prevent memory bloat
- **Atomic operations** prevent race conditions

## Related Topics

- [Databases Overview](/content/databases/databases-overview) - Compare all database types
- [Postgres](/content/databases/postgres) - Primary database (use Redis for caching)
- [Node.js](/content/runtimes/nodejs) - Popular runtime for Redis
- [Serverless & Edge](/content/runtimes/serverless-edge) - Use Upstash for edge Redis

Redis is essential for modern web applications. Use it as a cache in front of your primary database to reduce latency by 50-100x. It's also perfect for sessions, rate limiting, real-time features, and job queues. For serverless deployments, use Upstash's HTTP-based Redis.
