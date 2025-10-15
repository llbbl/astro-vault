---
title: CockroachDB
tags: [cockroachdb, distributed-sql, postgres, global, resilient, scalability]
---

# CockroachDB

CockroachDB is a distributed SQL database designed for global applications that never go down. Created in 2015, it combines the familiarity of PostgreSQL with the resilience and scale of cloud-native architecture. For JavaScript/TypeScript developers, CockroachDB offers PostgreSQL compatibility with automatic global distribution and fault tolerance.

## What is CockroachDB?

**CockroachDB** is a **distributed SQL database**:

```sql
-- Works like PostgreSQL
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  region VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (name, email, region)
VALUES ('Alice', 'alice@example.com', 'us-east');

SELECT * FROM users WHERE email = 'alice@example.com';
```

**Key Features:**
- **PostgreSQL-compatible**: Use existing Postgres tools
- **Distributed**: Data replicated across regions
- **Resilient**: Survives node, datacenter, or region failures
- **Strongly consistent**: ACID guarantees globally
- **Auto-sharding**: Scales horizontally automatically
- **Multi-region**: Deploy data close to users

## Why CockroachDB?

### 1. Global Distribution

```
                User (Tokyo)
                     ↓
              [Tokyo Replica]  ← Low latency read
                     ↓
              Automatic sync
                     ↓
         [US Replica] [EU Replica]
```

Single global database that feels local everywhere.

### 2. Survives Failures

```
[Node 1] [Node 2] [Node 3]  ← 3 replicas
    ↓        ↓        X       ← Node 3 dies
[Node 1] [Node 2]            ← Database stays online
```

Automatic failover, zero downtime.

### 3. PostgreSQL Compatibility

Use existing Postgres tools and libraries:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.COCKROACH_DATABASE_URL,
});

// Works just like Postgres
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### 4. Horizontal Scaling

Add nodes to scale:

```bash
# 3 nodes = handles X traffic
[Node 1] [Node 2] [Node 3]

# 6 nodes = handles 2X traffic
[Node 1] [Node 2] [Node 3] [Node 4] [Node 5] [Node 6]
```

## Using CockroachDB with TypeScript

### Connection Setup

```bash
pnpm add pg
pnpm add -D @types/pg
```

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Query
const result = await pool.query('SELECT * FROM users');
console.log(result.rows);
```

### With Prisma

```prisma
// prisma/schema.prisma
datasource db {
  provider = "cockroachdb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title     String
  content   String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String   @db.Uuid
  createdAt DateTime @default(now())
}
```

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create user with posts
const user = await prisma.user.create({
  data: {
    name: 'Alice',
    email: 'alice@example.com',
    posts: {
      create: [
        { title: 'First Post', content: 'Hello World' },
      ],
    },
  },
  include: {
    posts: true,
  },
});

console.log(user);
```

### With Drizzle ORM

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Insert
const newUser = await db.insert(users).values({
  name: 'Alice',
  email: 'alice@example.com',
}).returning();

// Query
const allUsers = await db.select().from(users);
```

## Multi-Region Setup

### Define Table Localities

```sql
-- Geo-partition users by region
ALTER TABLE users
  SET LOCALITY REGIONAL BY ROW AS region;

-- Insert data
INSERT INTO users (name, email, region)
VALUES
  ('Alice', 'alice@example.com', 'us-east'),
  ('Bob', 'bob@example.com', 'eu-west'),
  ('Charlie', 'charlie@example.com', 'ap-south');

-- Data automatically stored in appropriate region
```

### Multi-Region Patterns

**Global Table (replicated everywhere):**

```sql
-- Lookup table available everywhere
ALTER TABLE countries
  SET LOCALITY GLOBAL;
```

**Regional Table (pinned to region):**

```sql
-- GDPR data stays in EU
ALTER TABLE eu_users
  SET LOCALITY REGIONAL IN 'eu-west';
```

**Regional by Row (partitioned by column):**

```sql
-- Users stored in their home region
ALTER TABLE users
  SET LOCALITY REGIONAL BY ROW AS home_region;
```

## Common Patterns

### User Management

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  region: string;
  createdAt: Date;
}

async function createUser(name: string, email: string, region: string): Promise<User> {
  const result = await pool.query(
    'INSERT INTO users (name, email, region) VALUES ($1, $2, $3) RETURNING *',
    [name, email, region]
  );
  return result.rows[0];
}

async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}
```

### Transactions

```typescript
async function transferFunds(fromId: string, toId: string, amount: number) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Deduct from sender
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE user_id = $2',
      [amount, fromId]
    );

    // Add to receiver
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE user_id = $2',
      [amount, toId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## CockroachDB + Framework Integration

### With Next.js

```typescript
// lib/db.ts
import { Pool } from 'pg';

let pool: Pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}
```

```typescript
// app/api/users/route.ts
import { getPool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM users');
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const pool = getPool();

  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [body.name, body.email]
  );

  return NextResponse.json(result.rows[0]);
}
```

### With Node.js/Express

```typescript
import express from 'express';
import { Pool } from 'pg';

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(express.json());

app.get('/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users');
  res.json(result.rows);
});

app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );
  res.json(result.rows[0]);
});

app.listen(3000);
```

## Performance Optimization

### Indexing

```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);

-- Inverted index (for JSONB)
CREATE INVERTED INDEX idx_users_metadata ON users(metadata);
```

### Query Hints

```sql
-- Force index usage
SELECT * FROM users@idx_users_email WHERE email = 'alice@example.com';

-- Force specific join type
SELECT /*+ LOOKUP JOIN */ * FROM users
JOIN posts ON users.id = posts.author_id;
```

## Deployment Options

### CockroachDB Serverless (Recommended)

Managed cloud service:

```bash
# Connection string
postgresql://user:password@cluster-name.cockroachlabs.cloud:26257/defaultdb
```

**Pricing:**
- Free tier: 10 GiB storage, 50M RUs/month
- Pay-as-you-go: $1/GB storage, $2/1M RUs

### CockroachDB Dedicated

Dedicated clusters:

**Pricing:**
- Starts at ~$295/month (single region)
- Multi-region: ~$895/month+

### Self-Hosted

```bash
# Download CockroachDB
curl https://binaries.cockroachdb.com/cockroach-latest.linux-amd64.tgz | tar -xz

# Start node
./cockroach start --insecure --store=node1 --listen-addr=localhost:26257

# Create database
./cockroach sql --insecure -e 'CREATE DATABASE myapp'
```

## CockroachDB vs. Other Databases

| Feature | CockroachDB | [PostgreSQL](/content/databases/postgres) | [MongoDB](/content/databases/mongodb) |
|---------|-------------|----------|----------|
| **Type** | Distributed SQL | Single-node SQL | NoSQL |
| **Consistency** | Strong (global) | Strong (single node) | Eventual |
| **Multi-region** | Native | Manual replication | Atlas clusters |
| **Resilience** | Automatic failover | Manual failover | Replica sets |
| **Horizontal Scale** | Automatic | Manual sharding | Automatic |
| **Compatibility** | PostgreSQL | PostgreSQL | N/A |
| **Best For** | Global apps | Single region | Flexible schema |

## When to Use CockroachDB

**Use CockroachDB when:**
- Building global applications
- Need strong consistency across regions
- Require high availability (99.99%+)
- Want horizontal scaling without sharding complexity
- Already using PostgreSQL

**Use PostgreSQL when:**
- Single-region application
- Simpler deployment
- Cost-sensitive (CockroachDB is more expensive)

## Limitations

- More expensive than single-node Postgres
- Slightly higher latency than local Postgres
- Some Postgres features not supported (e.g., certain extensions)
- Learning curve for multi-region configuration

## Best Practices

### 1. Use UUIDs for Primary Keys

```sql
-- ✓ Good - distributed IDs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT
);

-- ❌ Bad - causes hotspots in distributed systems
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT
);
```

### 2. Partition by Region

```sql
-- ✓ Good - data stored locally
ALTER TABLE users
  SET LOCALITY REGIONAL BY ROW AS region;

-- Queries in the same region are fast
SELECT * FROM users WHERE region = 'us-east';
```

### 3. Use Connection Pooling

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Limit connections
  idleTimeoutMillis: 30000,
});
```

## Key Takeaways

- **Distributed SQL** with PostgreSQL compatibility
- **Global distribution** with strong consistency
- **Automatic failover** and resilience
- **Horizontal scaling** without manual sharding
- **Multi-region** with data locality
- **Use Prisma or Drizzle** for TypeScript
- **Best for** global applications requiring high availability
- **CockroachDB Serverless** has generous free tier

## Related Topics

- [PostgreSQL](/content/databases/postgres) - Single-node alternative
- [Databases Overview](/content/databases/databases-overview) - Compare all databases
- [Turso](/content/databases/turso) - Alternative edge database
- [Node.js](/content/runtimes/nodejs) - Popular runtime for CockroachDB
- [TypeScript](/content/languages/typescript) - Type-safe database queries

CockroachDB is ideal for building global applications that require strong consistency and high availability. Its PostgreSQL compatibility makes migration easy, and CockroachDB Serverless offers a generous free tier. Use it when you need your database to never go down and serve users worldwide with low latency.
