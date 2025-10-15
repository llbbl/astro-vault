---
title: Databases Overview
tags: [databases, sql, nosql, postgres, mongodb, redis, data, storage]
---

# Databases Overview

Choosing the right database is critical for modern applications. This guide explores different database types, technologies, and cloud vendors to help you make informed decisions for your JavaScript/TypeScript projects.

## Database Categories

### Relational Databases (SQL)

**What they are:**
- Structured data in tables with rows and columns
- Relationships between tables using foreign keys
- ACID guarantees (Atomicity, Consistency, Isolation, Durability)
- Strong consistency
- SQL query language

**Best for:**
- Transactional applications (e-commerce, banking)
- Complex queries and joins
- Data integrity requirements
- Traditional business applications

**Technologies:**
- **[PostgreSQL](/content/databases/postgres)** - Most popular open-source relational database
- **[CockroachDB](/content/databases/cockroachdb)** - Distributed SQL with global scale
- MySQL/MariaDB - Widely used, simple to get started

### Document Databases (NoSQL)

**What they are:**
- Store data as JSON-like documents
- Flexible schema
- Horizontal scaling
- Eventually consistent (usually)

**Best for:**
- Rapid development with changing requirements
- Unstructured or semi-structured data
- High-volume read/write operations
- Content management systems

**Technologies:**
- **[MongoDB](/content/databases/mongodb)** - Most popular NoSQL database
- **[Firebase](/content/databases/firebase)** - Google's NoSQL with real-time features

### Key-Value Stores

**What they are:**
- Simple key-value pairs
- Extremely fast reads/writes
- In-memory or persistent
- Limited query capabilities

**Best for:**
- Caching
- Session storage
- Real-time analytics
- Rate limiting

**Technologies:**
- **[Redis](/content/databases/redis)** - In-memory data structure store

### Data Warehouses

**What they are:**
- Optimized for analytical queries
- Column-oriented storage
- Handle massive datasets
- Aggregation and reporting

**Best for:**
- Business intelligence
- Analytics and reporting
- Historical data analysis
- Large-scale aggregations

**Technologies:**
- **[BigQuery](/content/databases/bigquery)** - Google's serverless data warehouse

### Edge Databases

**What they are:**
- Run close to users (edge locations)
- Low latency
- Global distribution
- Optimized for serverless

**Best for:**
- Global applications
- Edge computing
- Serverless functions
- Low-latency requirements

**Technologies:**
- **[Turso](/content/databases/turso)** - Edge-hosted LibSQL (SQLite fork)
- **[LibSQL](/content/databases/libsql)** - Open-source SQLite fork

## Cloud Database Vendors

### PostgreSQL Providers

- **[Neon](/content/databases/neon)** - Serverless Postgres with branching
- **[Supabase](/content/databases/supabase)** - Postgres + Auth + Storage + Realtime
- Amazon RDS - Managed relational databases
- Google Cloud SQL - Managed PostgreSQL

### MySQL Providers

- **[PlanetScale](/content/databases/planetscale)** - Serverless MySQL with branching (vitess-based)
- Amazon RDS - Managed MySQL
- Google Cloud SQL - Managed MySQL

### SQLite at the Edge

- **[Cloudflare D1](/content/databases/cloudflare-d1)** - SQLite at Cloudflare's edge
- **[Turso](/content/databases/turso)** - LibSQL at the edge with replication

### MongoDB Providers

- MongoDB Atlas - Official cloud offering
- Amazon DocumentDB - AWS-managed MongoDB-compatible

### Database Acceleration

- **[Cloudflare Hyperdrive](/content/databases/hyperdrive)** - Connection pooling and caching for edge databases

## Database Comparison

| Database | Type | Best For | Consistency | Scale | Edge |
|----------|------|----------|-------------|-------|------|
| [Postgres](/content/databases/postgres) | SQL | General purpose | Strong | Vertical + Horizontal | No |
| [CockroachDB](/content/databases/cockroachdb) | SQL | Global scale | Strong | Horizontal | Yes |
| [MongoDB](/content/databases/mongodb) | NoSQL | Flexible schema | Eventual | Horizontal | No |
| [Firebase](/content/databases/firebase) | NoSQL | Real-time apps | Eventual | Horizontal | No |
| [Redis](/content/databases/redis) | Key-Value | Caching | Strong | Horizontal | No |
| [BigQuery](/content/databases/bigquery) | Data Warehouse | Analytics | Strong | Massive | No |
| [Turso](/content/databases/turso) | SQL (Edge) | Low latency | Eventual | Edge replication | Yes |
| [LibSQL](/content/databases/libsql) | SQL (Local) | Embedded/Local | Strong | Single instance | No |

## Choosing a Database

### For Web Applications

**Traditional (Centralized):**
```
User → Server → [Postgres/MongoDB] (Single Region)
```

**Best Choice:**
- **[Postgres](/content/databases/postgres)** via [Supabase](/content/databases/supabase) or [Neon](/content/databases/neon)
- Strong consistency, ACID guarantees
- Rich ecosystem, mature tooling
- Full-text search, JSON support

### For Global Applications

**Edge (Distributed):**
```
User (Tokyo) → Edge Server (Tokyo) → [Turso] (Replicated)
User (London) → Edge Server (London) → [Turso] (Replicated)
```

**Best Choice:**
- **[Turso](/content/databases/turso)** for SQL at the edge
- **[CockroachDB](/content/databases/cockroachdb)** for strong consistency globally
- Low latency worldwide
- Automatic replication

### For Real-Time Applications

**Best Choice:**
- **[Supabase](/content/databases/supabase)** - Postgres with real-time subscriptions
- **[Redis](/content/databases/redis)** - Pub/sub for messaging
- WebSocket support
- Live updates

### For Analytics

**Best Choice:**
- **[BigQuery](/content/databases/bigquery)** - Serverless data warehouse
- **Postgres** with TimescaleDB - Time-series data
- Column-oriented storage
- Complex aggregations

### For Caching

**Best Choice:**
- **[Redis](/content/databases/redis)** - In-memory cache
- Upstash - Serverless Redis
- Extremely fast reads
- TTL support

## Common Patterns

### SQL with ORM (TypeScript)

```typescript
// Prisma with Postgres
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const user = await prisma.user.create({
  data: {
    name: 'Alice',
    email: 'alice@example.com',
    posts: {
      create: [
        { title: 'My first post', content: 'Hello World' },
      ],
    },
  },
  include: {
    posts: true,
  },
});
```

### NoSQL (MongoDB)

```typescript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

const db = client.db('myapp');
const users = db.collection('users');

const user = await users.insertOne({
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date(),
});
```

### Key-Value (Redis)

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Set with expiration
await redis.set('session:123', JSON.stringify(userData), 'EX', 3600);

// Get
const data = await redis.get('session:123');
const user = JSON.parse(data);
```

### Edge SQL (Turso)

```typescript
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const users = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
```

## Database Vendors by Use Case

### Startup/Side Project (Low Cost)

1. **[Supabase](/content/databases/supabase)** - Free tier, auth included, generous limits
2. **[Neon](/content/databases/neon)** - Free tier, serverless Postgres
3. **[Turso](/content/databases/turso)** - Free tier, edge database
4. **[PlanetScale](/content/databases/planetscale)** - Free tier, branching workflow

### Production Application

1. **[Supabase](/content/databases/supabase)** - $25/month, includes auth/storage
2. **[Neon](/content/databases/neon)** - Serverless Postgres, pay per use
3. **[PlanetScale](/content/databases/planetscale)** - Serverless MySQL, $29/month
4. Amazon RDS - Full control, higher management overhead

### Global/Multi-Region

1. **[Turso](/content/databases/turso)** - Edge replication, low latency
2. **[CockroachDB](/content/databases/cockroachdb)** - Distributed SQL
3. **[Cloudflare D1](/content/databases/cloudflare-d1)** - SQLite at the edge
4. MongoDB Atlas - Multi-region clusters

### Analytics/Data Warehouse

1. **[BigQuery](/content/databases/bigquery)** - Pay per query, serverless
2. Snowflake - Enterprise data warehouse
3. Amazon Redshift - AWS data warehouse
4. ClickHouse - Open-source OLAP

## Database + Runtime Combinations

### Node.js + Postgres

```typescript
// Using Prisma ORM
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Or raw queries with pg
import pg from 'pg';
const client = new pg.Client(process.env.DATABASE_URL);
await client.connect();
```

**Best Vendors:** [Neon](/content/databases/neon), [Supabase](/content/databases/supabase)

### Bun + SQLite

```typescript
import { Database } from 'bun:sqlite';

const db = new Database('mydb.sqlite');
const query = db.prepare('SELECT * FROM users WHERE id = ?');
const user = query.get(userId);
```

**Best Vendors:** Local SQLite, [Turso](/content/databases/turso)

### Deno + Postgres

```typescript
import { Client } from 'https://deno.land/x/postgres/mod.ts';

const client = new Client(Deno.env.get('DATABASE_URL'));
await client.connect();
```

**Best Vendors:** [Neon](/content/databases/neon), [Supabase](/content/databases/supabase)

### Edge Runtime + Edge Database

```typescript
// Cloudflare Workers + D1
export default {
  async fetch(request, env) {
    const result = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).all();

    return Response.json(result);
  },
};
```

**Best Vendors:** [Cloudflare D1](/content/databases/cloudflare-d1), [Turso](/content/databases/turso)

## Security Best Practices

### 1. Use Environment Variables

```typescript
// ✓ Good
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// ❌ Bad - hardcoded credentials
const db = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://user:password@host/db',
    },
  },
});
```

### 2. Parameterized Queries

```typescript
// ✓ Good - prevents SQL injection
const user = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

// ❌ Bad - vulnerable to SQL injection
const user = await db.execute(`SELECT * FROM users WHERE email = '${email}'`);
```

### 3. Connection Pooling

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
});

// Reuse connections
const result = await pool.query('SELECT * FROM users');
```

### 4. Read-Only Replicas

```typescript
// Write to primary
await primaryDb.execute('INSERT INTO users ...');

// Read from replica (lower load on primary)
const users = await replicaDb.execute('SELECT * FROM users');
```

## Performance Optimization

### Indexing

```sql
-- Create index on frequently queried columns
CREATE INDEX idx_users_email ON users(email);

-- Composite index for multiple columns
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);
```

### Query Optimization

```typescript
// ✓ Good - select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true },
});

// ❌ Bad - selects everything
const users = await prisma.user.findMany();
```

### Caching

```typescript
// Layer 1: Application cache (Redis)
let user = await redis.get(`user:${id}`);

if (!user) {
  // Layer 2: Database
  user = await db.user.findUnique({ where: { id } });
  await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);
}
```

## Database Technologies

- **[PostgreSQL](/content/databases/postgres)** - Industry-standard relational database
- **[MongoDB](/content/databases/mongodb)** - Popular NoSQL document database
- **[Firebase](/content/databases/firebase)** - Google's NoSQL with real-time and auth
- **[CockroachDB](/content/databases/cockroachdb)** - Distributed SQL for global scale
- **[Redis](/content/databases/redis)** - In-memory data structure store
- **[BigQuery](/content/databases/bigquery)** - Google's serverless data warehouse
- **[Turso](/content/databases/turso)** - Edge-hosted LibSQL database
- **[LibSQL](/content/databases/libsql)** - Open-source SQLite fork

## Cloud Vendors

- **[Neon](/content/databases/neon)** - Serverless Postgres with branching
- **[Cloudflare D1](/content/databases/cloudflare-d1)** - SQLite at the edge
- **[Cloudflare Hyperdrive](/content/databases/hyperdrive)** - Database acceleration for edge workers
- **[Supabase](/content/databases/supabase)** - Postgres + Backend-as-a-Service
- **[PlanetScale](/content/databases/planetscale)** - Serverless MySQL with branching

## Key Takeaways

- **PostgreSQL** is the safest default choice for most applications
- **NoSQL** (MongoDB) for flexible schemas and rapid iteration
- **Redis** for caching and real-time features
- **Edge databases** (Turso, D1) for global low-latency apps
- **BigQuery** for analytics and data warehousing
- Choose **serverless** (Neon, PlanetScale, Supabase) for auto-scaling and lower costs
- Use **ORMs** (Prisma, Drizzle) for type safety with TypeScript

## Related Topics

- [Node.js](/content/runtimes/nodejs) - Popular runtime for database applications
- [Bun](/content/runtimes/bun) - Fast runtime with built-in SQLite
- [TypeScript](/content/languages/typescript) - Type-safe database queries
- [Next.js](/content/frameworks/nextjs) - Full-stack framework with database integration
- [Serverless & Edge](/content/runtimes/serverless-edge) - Deploying with edge databases

The database you choose shapes your application's architecture, scalability, and performance. Start with PostgreSQL for most projects, consider edge databases for global applications, and use Redis for caching. Modern serverless providers like Neon and Supabase offer excellent developer experience with generous free tiers.
