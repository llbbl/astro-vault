---
title: Cloudflare Hyperdrive
tags: [cloudflare, hyperdrive, database, connection-pooling, caching, edge, workers]
---

# Cloudflare Hyperdrive

Cloudflare Hyperdrive is a database acceleration service that makes existing databases faster when accessed from Cloudflare Workers. Launched in 2023, Hyperdrive provides connection pooling, query caching, and regional read replicas to dramatically reduce database latency from the edge. For JavaScript/TypeScript developers using Cloudflare Workers, Hyperdrive turns slow database queries into fast edge-optimized operations.

## What is Hyperdrive?

**Hyperdrive** accelerates database access from the edge:

```
Without Hyperdrive:
Worker (Tokyo) → [200ms] → Database (US) → [200ms] → Worker
                         ↑ 400ms round trip

With Hyperdrive:
Worker (Tokyo) → [10ms] → Hyperdrive Cache (Tokyo) → Response
                         ↑ 10ms (cached query)

Worker (Tokyo) → [10ms] → Hyperdrive Pool → [200ms] → Database
                         ↑ Connection pooling (reused connections)
```

**Key Features:**
- **Connection pooling**: Reuse database connections
- **Query caching**: Cache frequent queries at the edge
- **Regional read replicas**: Route queries to nearest replica
- **Works with existing databases**: No schema changes needed
- **Supports**: PostgreSQL, MySQL, MongoDB (via wire protocol)

## Why Hyperdrive?

### 1. Faster Database Access from Edge

Traditional edge + database problem:

```
Problem:
Worker (Edge) → Database (Far away) → Slow (200-500ms)

Solution (Hyperdrive):
Worker (Edge) → Hyperdrive (Near) → Much faster (10-50ms)
```

### 2. Connection Pooling

Serverless functions create new connections:

```
Without Hyperdrive:
Request 1 → New connection (100ms)
Request 2 → New connection (100ms)
Request 3 → New connection (100ms)
↑ Slow + overwhelms database

With Hyperdrive:
Request 1 → Pooled connection (10ms)
Request 2 → Reused connection (1ms)
Request 3 → Reused connection (1ms)
↑ Fast + efficient
```

### 3. Query Caching

```
First request:
Worker → Hyperdrive → Database (200ms)
       → Cache result

Subsequent requests (same query):
Worker → Hyperdrive → Cached (10ms)
       → No database hit
```

### 4. Works with Any Database

No changes to your database:

```
Your existing:
- PostgreSQL on Neon, Supabase, RDS
- MySQL on PlanetScale, RDS
- MongoDB Atlas

Add Hyperdrive:
- Same connection string
- Instant acceleration
- No schema changes
```

## Using Hyperdrive with Cloudflare Workers

### Setup

```bash
# Install Wrangler
npm install -g wrangler

# Create Hyperdrive config
wrangler hyperdrive create my-hyperdrive \
  --connection-string="postgresql://user:pass@db.example.com:5432/mydb"

# Add to wrangler.toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "xxx-xxx-xxx"
```

### PostgreSQL with Hyperdrive

```typescript
// worker.ts
import { Client } from 'pg';

export interface Env {
  HYPERDRIVE: Hyperdrive;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Create client using Hyperdrive connection string
    const client = new Client({
      connectionString: env.HYPERDRIVE.connectionString,
    });

    await client.connect();

    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [
        'alice@example.com',
      ]);

      return Response.json(result.rows);
    } finally {
      await client.end();
    }
  },
};
```

### With Drizzle ORM

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './schema';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const sql = postgres(env.HYPERDRIVE.connectionString);
    const db = drizzle(sql);

    const allUsers = await db.select().from(users);

    return Response.json(allUsers);
  },
};
```

### With Prisma

```typescript
import { PrismaClient } from '@prisma/client/edge';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const prisma = new PrismaClient({
      datasourceUrl: env.HYPERDRIVE.connectionString,
    });

    const users = await prisma.user.findMany();

    await prisma.$disconnect();

    return Response.json(users);
  },
};
```

## Query Caching

### Automatic Caching

Hyperdrive automatically caches SELECT queries:

```typescript
// First request: queries database
const users = await client.query('SELECT * FROM users');
// 200ms

// Subsequent requests (within TTL): cached
const users = await client.query('SELECT * FROM users');
// 10ms (from cache)
```

### Cache Control

```typescript
// Bypass cache for fresh data
const result = await client.query({
  text: 'SELECT * FROM users WHERE id = $1',
  values: [userId],
  // Bypass Hyperdrive cache
  cachePolicy: 'no-cache',
});

// Short TTL for frequently changing data
const result = await client.query({
  text: 'SELECT * FROM posts ORDER BY created_at DESC LIMIT 10',
  cachePolicy: 'max-age=60', // Cache for 60 seconds
});
```

### Write Operations

Writes bypass cache and invalidate related cached queries:

```typescript
// Writes always go to database
await client.query('INSERT INTO users (name, email) VALUES ($1, $2)', [
  'Bob',
  'bob@example.com',
]);
// Invalidates cached SELECT queries for users table
```

## Connection Pooling

Hyperdrive maintains connection pools per region:

```
Tokyo Region:
[Pool] → Connections to database (reused)
  ↑
Workers in Tokyo

US Region:
[Pool] → Connections to database (reused)
  ↑
Workers in US
```

**Benefits:**
- Faster queries (no connection overhead)
- Reduced database load
- No connection limit issues

## Regional Read Replicas

Route queries to nearest replica:

```bash
# Configure read replicas
wrangler hyperdrive update my-hyperdrive \
  --read-replicas="us-east:postgresql://...,eu-west:postgresql://..."
```

```
Write:
Worker → Hyperdrive → Primary database (US)

Read (from Tokyo):
Worker → Hyperdrive → Replica (Tokyo)
       ↑ Much faster
```

## Performance Comparison

### Without Hyperdrive

```
Query: SELECT * FROM users WHERE id = ?

Cold connection: 100ms (TCP + auth)
Query execution: 50ms
Total: 150ms per request

100 requests = 100 connections = 15,000ms
```

### With Hyperdrive

```
Query: SELECT * FROM users WHERE id = ?

First request:
Connection pool: 10ms (reused)
Query execution: 50ms
Total: 60ms

Subsequent requests (cached):
Cache hit: 10ms

100 requests (90% cache hit):
- 10 database queries × 60ms = 600ms
- 90 cache hits × 10ms = 900ms
- Total: 1,500ms (10x faster!)
```

## Supported Databases

### PostgreSQL

Works with any PostgreSQL database:

- [Neon](/content/databases/neon)
- [Supabase](/content/databases/supabase)
- Amazon RDS
- Google Cloud SQL
- Azure Database

```typescript
const client = new Client({
  connectionString: env.HYPERDRIVE.connectionString,
});
```

### MySQL

Works with MySQL databases:

- [PlanetScale](/content/databases/planetscale)
- Amazon RDS
- Google Cloud SQL

```typescript
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(env.HYPERDRIVE.connectionString);
```

### MongoDB (Wire Protocol)

Experimental support:

```typescript
import { MongoClient } from 'mongodb';

const client = new MongoClient(env.HYPERDRIVE.connectionString);
```

## Configuration Options

```bash
# Create with custom settings
wrangler hyperdrive create my-hyperdrive \
  --connection-string="postgresql://..." \
  --max-pool-size=10 \
  --cache-ttl=300

# Update configuration
wrangler hyperdrive update my-hyperdrive \
  --max-pool-size=20

# List Hyperdrives
wrangler hyperdrive list

# Delete Hyperdrive
wrangler hyperdrive delete my-hyperdrive
```

### wrangler.toml

```toml
[[hyperdrive]]
binding = "DB"
id = "xxx-xxx-xxx"

[[hyperdrive]]
binding = "DB_READ_REPLICA"
id = "yyy-yyy-yyy"
```

## Best Practices

### 1. Use for Read-Heavy Workloads

```typescript
// ✓ Good - read-heavy (benefits from caching)
const posts = await client.query('SELECT * FROM posts ORDER BY created_at DESC LIMIT 100');

// Still good - writes work fine (just not cached)
await client.query('INSERT INTO posts (title, content) VALUES ($1, $2)', [title, content]);
```

### 2. Connection Management

```typescript
// ✓ Good - create client per request
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
    await client.connect();

    try {
      const result = await client.query('...');
      return Response.json(result.rows);
    } finally {
      await client.end(); // Always close
    }
  },
};
```

### 3. Use Prepared Statements

```typescript
// ✓ Good - prepared statement (faster + safer)
const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);

// ❌ Bad - string concatenation (slower + SQL injection risk)
const result = await client.query(`SELECT * FROM users WHERE id = ${userId}`);
```

### 4. Cache Invalidation

```typescript
// After write, subsequent reads get fresh data
await client.query('UPDATE users SET name = $1 WHERE id = $2', ['New Name', userId]);

// Next read gets updated data (cache automatically invalidated)
const user = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
```

## Pricing

**Beta Pricing (as of 2024):**
- Currently in beta with limited availability
- Pricing not yet announced
- Expected to be usage-based (queries, caching, bandwidth)

**Expected Model:**
- Per-query pricing
- Cache storage costs
- Data transfer costs

## Hyperdrive vs. Alternatives

| Feature | Hyperdrive | [Neon](/content/databases/neon) Pooler | [Supabase](/content/databases/supabase) Pooler |
|---------|------------|-----------------|-------------------|
| **Platform** | Cloudflare only | Any | Any |
| **Caching** | Yes | No | No |
| **Connection Pooling** | Yes | Yes | Yes |
| **Read Replicas** | Yes | No | Yes |
| **Works With** | Any database | Neon only | Supabase only |
| **Best For** | Edge workers | Neon apps | Supabase apps |

## Limitations

- **Beta**: Still in development
- **Cloudflare only**: Only works with Cloudflare Workers
- **Cache TTL**: Limited control over cache duration
- **Write latency**: Writes still go to origin database
- **MongoDB**: Experimental support

## When to Use Hyperdrive

**Use Hyperdrive when:**
- Using Cloudflare Workers
- Database is far from users
- Read-heavy workload (benefits from caching)
- Connection limits being hit
- Need faster edge database access

**Skip Hyperdrive when:**
- Not using Cloudflare Workers
- Database already at the edge ([Turso](/content/databases/turso), [D1](/content/databases/cloudflare-d1))
- Write-heavy workload
- Need strong consistency (caching adds eventual consistency)

## Key Takeaways

- **Database acceleration** for Cloudflare Workers
- **Connection pooling** + query caching + read replicas
- **10-20x faster** for read-heavy workloads
- **Works with existing databases** (PostgreSQL, MySQL, MongoDB)
- **No code changes** needed (just update connection string)
- **Cloudflare Workers only** (not standalone)
- **Beta** (pricing TBD)

## Related Topics

- [Cloudflare D1](/content/databases/cloudflare-d1) - Alternative SQLite at edge
- [Neon](/content/databases/neon) - Serverless Postgres with pooling
- [Supabase](/content/databases/supabase) - Postgres with connection pooler
- [Turso](/content/databases/turso) - Edge database alternative
- [Serverless & Edge](/content/runtimes/serverless-edge) - Cloudflare Workers overview

Hyperdrive is perfect for Cloudflare Workers applications that need to access traditional databases. It dramatically reduces latency through connection pooling and caching, making centralized databases feel fast from the edge. Use it when your Workers need to query PostgreSQL, MySQL, or MongoDB databases that aren't already at the edge.
