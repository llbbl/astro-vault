---
title: PostgreSQL
tags: [postgres, postgresql, sql, database, relational, acid, orm, prisma]
---

# PostgreSQL

PostgreSQL (often called "Postgres") is the world's most advanced open-source relational database. Created in 1986, it's known for reliability, feature robustness, and standards compliance. For JavaScript/TypeScript developers, Postgres is often the default choice for production applications, offering powerful features like JSON support, full-text search, and strong consistency guarantees.

## What is PostgreSQL?

**PostgreSQL** is an **object-relational database** with ACID guarantees:

```sql
-- Create table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert data
INSERT INTO users (name, email)
VALUES ('Alice', 'alice@example.com');

-- Query data
SELECT * FROM users WHERE email = 'alice@example.com';
```

**Key Features:**
- **ACID compliant**: Reliable transactions
- **Advanced data types**: JSON, arrays, geometric, full-text search
- **Extensible**: Custom functions, operators, data types
- **Standards compliant**: SQL:2016 standard
- **Open source**: Free with permissive license (PostgreSQL License)

## Why PostgreSQL?

### 1. Rich Data Types

Beyond standard SQL types, Postgres has advanced types:

```sql
-- JSON/JSONB (binary JSON)
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT,
  metadata JSONB
);

INSERT INTO products (name, metadata)
VALUES ('Laptop', '{"brand": "Dell", "specs": {"ram": 16, "cpu": "i7"}}');

-- Query JSON
SELECT * FROM products
WHERE metadata->>'brand' = 'Dell';

SELECT * FROM products
WHERE metadata->'specs'->>'ram' = '16';
```

```sql
-- Arrays
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  tags TEXT[]
);

INSERT INTO posts (title, tags)
VALUES ('My Post', ARRAY['javascript', 'postgres', 'tutorial']);

-- Query arrays
SELECT * FROM posts
WHERE 'javascript' = ANY(tags);
```

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  role user_role DEFAULT 'user'
);
```

### 2. Full-Text Search (Built-in)

```sql
-- Add tsvector column
ALTER TABLE posts ADD COLUMN search_vector tsvector;

-- Create index
CREATE INDEX posts_search_idx ON posts USING GIN(search_vector);

-- Update search vector
UPDATE posts
SET search_vector = to_tsvector('english', title || ' ' || content);

-- Search
SELECT * FROM posts
WHERE search_vector @@ to_tsquery('english', 'javascript & tutorial');
```

### 3. Powerful Joins and Relations

```sql
-- Users and Posts (one-to-many)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT,
  content TEXT
);

-- Join query
SELECT users.name, posts.title
FROM users
JOIN posts ON posts.user_id = users.id
WHERE users.name = 'Alice';
```

### 4. Transactions

```sql
BEGIN;

INSERT INTO accounts (name, balance) VALUES ('Alice', 100);
INSERT INTO accounts (name, balance) VALUES ('Bob', 100);

UPDATE accounts SET balance = balance - 50 WHERE name = 'Alice';
UPDATE accounts SET balance = balance + 50 WHERE name = 'Bob';

COMMIT; -- All or nothing
```

If any statement fails, `ROLLBACK` undoes all changes.

## Using Postgres with TypeScript

### With Prisma (Recommended)

**Prisma** is the most popular ORM for TypeScript:

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}
```

```typescript
// app.ts
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
        { title: 'Second Post', content: 'Learning Prisma' },
      ],
    },
  },
  include: {
    posts: true,
  },
});

// Query with relations
const users = await prisma.user.findMany({
  where: {
    posts: {
      some: {
        title: {
          contains: 'Prisma',
        },
      },
    },
  },
  include: {
    posts: true,
  },
});

// Type-safe!
console.log(users[0].name); // ✓ TypeScript knows this is a string
```

**Advantages:**
- Type-safe queries
- Auto-completion
- Schema migrations
- Excellent TypeScript support

### With Drizzle ORM

**Drizzle** is a lighter, SQL-like ORM:

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

```typescript
// schema.ts
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});
```

```typescript
// app.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, posts } from './schema';

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

// Insert
const newUser = await db.insert(users).values({
  name: 'Alice',
  email: 'alice@example.com',
}).returning();

// Query
const allUsers = await db.select().from(users);

// Join
const usersWithPosts = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(posts.authorId, users.id));
```

**Advantages:**
- More SQL-like
- Lighter than Prisma
- Excellent performance

### With node-postgres (Raw SQL)

```bash
pnpm add pg
pnpm add -D @types/pg
```

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Query
const result = await pool.query('SELECT * FROM users WHERE email = $1', [
  'alice@example.com',
]);

console.log(result.rows[0]);

// Insert
const newUser = await pool.query(
  'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
  ['Bob', 'bob@example.com']
);

// Transaction
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO posts ...');
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

**Advantages:**
- Direct control
- No ORM overhead
- Full SQL power

## Common Patterns

### User Authentication

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

```typescript
import bcrypt from 'bcrypt';

// Register
const passwordHash = await bcrypt.hash(password, 10);
await prisma.user.create({
  data: {
    email,
    passwordHash,
  },
});

// Login
const user = await prisma.user.findUnique({
  where: { email },
});

if (user && await bcrypt.compare(password, user.passwordHash)) {
  // Valid login
}
```

### Pagination

```typescript
// Offset pagination
const page = 1;
const pageSize = 20;

const posts = await prisma.post.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: {
    createdAt: 'desc',
  },
});

// Cursor pagination (better for large datasets)
const posts = await prisma.post.findMany({
  take: 20,
  cursor: {
    id: lastPostId,
  },
  orderBy: {
    id: 'asc',
  },
});
```

### Aggregations

```typescript
// Count
const userCount = await prisma.user.count();

// Average
const avgPostCount = await prisma.post.groupBy({
  by: ['authorId'],
  _avg: {
    id: true,
  },
});

// Raw aggregation
const result = await prisma.$queryRaw`
  SELECT author_id, COUNT(*) as post_count
  FROM posts
  GROUP BY author_id
  HAVING COUNT(*) > 5
`;
```

## Performance Optimization

### Indexing

```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);

-- Unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Partial index
CREATE INDEX idx_active_users ON users(email) WHERE active = true;
```

### Query Optimization

```sql
-- Use EXPLAIN ANALYZE to understand query performance
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE author_id = 123
ORDER BY created_at DESC
LIMIT 20;
```

```typescript
// Select only needed columns
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    // Don't fetch password_hash
  },
});
```

### Connection Pooling

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Postgres + Framework Integration

### With Next.js

```typescript
// app/api/users/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await prisma.user.create({
    data: body,
  });
  return NextResponse.json(user);
}
```

### With Node.js/Express

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const user = await prisma.user.create({
    data: req.body,
  });
  res.json(user);
});

app.listen(3000);
```

## Cloud Postgres Providers

- **[Neon](/content/databases/neon)** - Serverless Postgres with branching ($0-19/month)
- **[Supabase](/content/databases/supabase)** - Postgres + Auth + Storage ($0-25/month)
- **[PlanetScale](/content/databases/planetscale)** - MySQL alternative (now has Postgres beta)
- Amazon RDS - Managed Postgres on AWS
- Google Cloud SQL - Managed Postgres on GCP
- Azure Database - Managed Postgres on Azure

## Postgres vs. Other Databases

| Feature | PostgreSQL | MongoDB | MySQL |
|---------|------------|---------|-------|
| **Type** | Relational SQL | NoSQL Document | Relational SQL |
| **Schema** | Strict | Flexible | Strict |
| **Transactions** | ACID | ACID (v4+) | ACID |
| **JSON Support** | Excellent (JSONB) | Native | Basic |
| **Full-Text Search** | Built-in | Built-in | Limited |
| **Scalability** | Vertical + Horizontal | Horizontal | Vertical |
| **Best For** | General purpose | Flexible schemas | Simple apps |

## Advanced Features

### Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own posts
CREATE POLICY user_posts ON posts
  FOR SELECT
  USING (author_id = current_user_id());

-- Policy: Users can only update their own posts
CREATE POLICY user_update_posts ON posts
  FOR UPDATE
  USING (author_id = current_user_id());
```

### Materialized Views

```sql
-- Create materialized view for expensive query
CREATE MATERIALIZED VIEW post_stats AS
SELECT
  author_id,
  COUNT(*) as post_count,
  AVG(LENGTH(content)) as avg_length
FROM posts
GROUP BY author_id;

-- Refresh when data changes
REFRESH MATERIALIZED VIEW post_stats;

-- Query the view (fast)
SELECT * FROM post_stats WHERE author_id = 123;
```

### Triggers

```sql
-- Update 'updated_at' automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

## Key Takeaways

- **Most popular** open-source relational database
- **ACID guarantees** for data integrity
- **Rich data types** including JSONB, arrays, enums
- **Built-in full-text search**
- **Excellent TypeScript support** via Prisma or Drizzle
- **Use Prisma** for best developer experience
- **Cloud options**: Neon (serverless), Supabase (BaaS)
- **Default choice** for most web applications

## Related Topics

- [Neon](/content/databases/neon) - Serverless Postgres provider
- [Supabase](/content/databases/supabase) - Postgres Backend-as-a-Service
- [Databases Overview](/content/databases/databases-overview) - Compare all database types
- [MongoDB](/content/databases/mongodb) - NoSQL alternative
- [Node.js](/content/runtimes/nodejs) - Popular runtime for Postgres apps
- [TypeScript](/content/languages/typescript) - Type-safe database queries

PostgreSQL is the gold standard for relational databases. Its combination of reliability, feature richness, and excellent TypeScript tooling makes it the default choice for most modern web applications. Use Prisma for the best developer experience, and consider Neon or Supabase for serverless deployment.
