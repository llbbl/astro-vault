---
title: Turso
tags: [turso, libsql, sqlite, edge, distributed, serverless, low-latency]
---

# Turso

Turso is an edge-hosted distributed database built on [LibSQL](/content/databases/libsql) (a fork of SQLite). Created in 2022, Turso brings SQLite's simplicity to the edge with global replication and low-latency reads. For JavaScript/TypeScript developers, Turso offers familiar SQL with automatic global distribution and sub-10ms query times from anywhere.

## What is Turso?

**Turso** is **SQLite at the edge**:

```typescript
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Execute SQL
const result = await db.execute('SELECT * FROM users WHERE email = ?', [
  'alice@example.com',
]);

console.log(result.rows);
```

**Key Features:**
- **Edge-hosted**: Replicas in 35+ regions worldwide
- **Low latency**: Sub-10ms queries globally
- **SQLite-compatible**: Use SQLite syntax
- **Serverless**: No servers to manage
- **Embedded replicas**: Query locally with remote sync
- **HTTP/WebSocket**: Works in any runtime (edge, serverless, browser)

## Why Turso?

### 1. Global Low Latency

```
Traditional Database:
User (Tokyo) → [5000km] → Database (US) → [5000km] → User
                         ↑ 100-200ms

Turso:
User (Tokyo) → [10km] → Turso Replica (Tokyo) → User
                        ↑ < 10ms
```

Data replicated to edge locations worldwide.

### 2. Works Everywhere

```typescript
// Node.js
import { createClient } from '@libsql/client';

// Cloudflare Workers
import { createClient } from '@libsql/client/web';

// Browser
import { createClient } from '@libsql/client/web';

// All use the same API
```

Works in any JavaScript runtime.

### 3. SQLite Simplicity

```sql
-- Familiar SQL
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');

SELECT * FROM users WHERE email = 'alice@example.com';
```

No complex database servers—just SQL.

### 4. Embedded + Sync

```typescript
// Local database with remote sync
import { createClient } from '@libsql/client';

const db = createClient({
  url: 'file:local.db', // Local SQLite file
  syncUrl: process.env.TURSO_DATABASE_URL, // Sync to Turso
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60, // Sync every 60 seconds
});

// Queries run locally (instant)
const users = await db.execute('SELECT * FROM users');

// Changes sync to Turso automatically
await db.execute('INSERT INTO users (name, email) VALUES (?, ?)', [
  'Bob',
  'bob@example.com',
]);
```

## Using Turso with TypeScript

### Setup

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create my-database

# Get connection info
turso db show my-database --url
turso db tokens create my-database
```

```bash
# Install client
pnpm add @libsql/client
```

### Basic Usage

```typescript
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Create table
await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
  )
`);

// Insert
const result = await db.execute({
  sql: 'INSERT INTO users (name, email) VALUES (?, ?)',
  args: ['Alice', 'alice@example.com'],
});

console.log('Inserted ID:', result.lastInsertRowid);

// Query
const users = await db.execute('SELECT * FROM users');
console.log(users.rows);

// Query with params
const user = await db.execute({
  sql: 'SELECT * FROM users WHERE email = ?',
  args: ['alice@example.com'],
});

console.log(user.rows[0]);
```

### Type-Safe Queries

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  created_at: number;
}

const result = await db.execute('SELECT * FROM users');

// Cast rows
const users = result.rows as unknown as User[];

users.forEach((user) => {
  console.log(user.name); // ✓ Type-safe
});
```

### Batch Operations

```typescript
// Execute multiple statements in a batch
const results = await db.batch([
  {
    sql: 'INSERT INTO users (name, email) VALUES (?, ?)',
    args: ['Alice', 'alice@example.com'],
  },
  {
    sql: 'INSERT INTO users (name, email) VALUES (?, ?)',
    args: ['Bob', 'bob@example.com'],
  },
  {
    sql: 'SELECT * FROM users',
    args: [],
  },
]);

console.log('Inserted users:', results[2].rows);
```

### Transactions

```typescript
async function transferFunds(fromId: number, toId: number, amount: number) {
  await db.execute('BEGIN');

  try {
    await db.execute({
      sql: 'UPDATE accounts SET balance = balance - ? WHERE user_id = ?',
      args: [amount, fromId],
    });

    await db.execute({
      sql: 'UPDATE accounts SET balance = balance + ? WHERE user_id = ?',
      args: [amount, toId],
    });

    await db.execute('COMMIT');
  } catch (error) {
    await db.execute('ROLLBACK');
    throw error;
  }
}
```

## Using Turso with Drizzle ORM

```bash
pnpm add drizzle-orm @libsql/client
pnpm add -D drizzle-kit
```

```typescript
// db/schema.ts
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});
```

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
```

```typescript
// app.ts
import { db } from './db';
import { users, posts } from './db/schema';
import { eq } from 'drizzle-orm';

// Insert
const newUser = await db.insert(users).values({
  name: 'Alice',
  email: 'alice@example.com',
}).returning();

// Query
const allUsers = await db.select().from(users);

// Query with relation
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true,
  },
});

// Update
await db.update(users)
  .set({ name: 'Alice Smith' })
  .where(eq(users.email, 'alice@example.com'));

// Delete
await db.delete(users)
  .where(eq(users.id, 123));
```

## Turso + Framework Integration

### With Next.js

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
```

```typescript
// app/api/users/route.ts
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  const allUsers = await db.select().from(users);
  return NextResponse.json(allUsers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newUser = await db.insert(users).values(body).returning();
  return NextResponse.json(newUser[0]);
}
```

### With Cloudflare Workers

```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';

export default {
  async fetch(request: Request, env: Env) {
    const client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });

    const db = drizzle(client);

    const users = await db.execute('SELECT * FROM users');

    return Response.json(users.rows);
  },
};
```

### With Astro

```typescript
// src/lib/db.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const client = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client);
```

```astro
---
// src/pages/users.astro
import { db } from '../lib/db';
import { users } from '../lib/schema';

const allUsers = await db.select().from(users);
---

<html>
  <body>
    <h1>Users</h1>
    <ul>
      {allUsers.map(user => (
        <li>{user.name} - {user.email}</li>
      ))}
    </ul>
  </body>
</html>
```

## Database Locations

Turso replicates to 35+ global locations:

```bash
# List available locations
turso db locations

# Create database in specific location
turso db create my-db --location lhr

# Add replica to another location
turso db replicate my-db nrt
```

**Locations include:**
- North America: iad, lax, sea, ord, dfw
- Europe: lhr, ams, fra, cdg, arn
- Asia: nrt, sin, hkg, syd
- South America: gru, scl
- And many more...

## Embedded Replicas

Run database locally with remote sync:

```typescript
import { createClient } from '@libsql/client';

const db = createClient({
  url: 'file:local.db', // Local SQLite
  syncUrl: process.env.TURSO_DATABASE_URL, // Remote Turso
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Manual sync
await db.sync();

// Or auto-sync
const db = createClient({
  url: 'file:local.db',
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60, // Sync every 60 seconds
});

// Queries run locally (instant)
const users = await db.execute('SELECT * FROM users');
```

**Benefits:**
- Instant reads (local database)
- Offline support
- Reduced API calls
- Lower latency

## Pricing

**Free Tier:**
- 9 GB total storage
- 1 billion row reads/month
- 25 million row writes/month
- 3 databases

**Scaler Plan ($29/month):**
- Pay-as-you-go beyond free tier
- $0.30/GB storage
- $0.90/billion row reads
- $4.50/billion row writes

**Example Cost:**
- Small app: Free
- Medium app (10M writes/mo): ~$0.45/month
- Large app (100M writes/mo): ~$4.50/month

## Turso vs. Other Databases

| Feature | Turso | [Cloudflare D1](/content/databases/cloudflare-d1) | [PostgreSQL](/content/databases/postgres) |
|---------|-------|----------|----------|
| **Type** | SQLite (edge) | SQLite (edge) | Relational |
| **Global** | Yes (35+ locations) | Yes (Cloudflare network) | Manual replication |
| **Latency** | < 10ms | < 1ms | 50-200ms |
| **Works In** | Any runtime | Cloudflare Workers only | Server-side |
| **Pricing** | Generous free tier | Generous free tier | By instance |
| **Best For** | Global apps | Cloudflare ecosystem | Complex queries |

## When to Use Turso

**Use Turso when:**
- Building global applications
- Need low latency worldwide
- Using edge runtimes (Cloudflare, Vercel Edge)
- Want SQLite simplicity with global scale
- Need offline-first capabilities

**Use PostgreSQL when:**
- Complex queries and joins
- Centralized single-region app
- Need PostgreSQL-specific features
- Large team with Postgres experience

## Best Practices

### 1. Use Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_author ON posts(author_id);
```

### 2. Batch Operations

```typescript
// ✓ Good - single batch
await db.batch([
  { sql: 'INSERT INTO users ...', args: [...] },
  { sql: 'INSERT INTO users ...', args: [...] },
]);

// ❌ Bad - multiple round trips
await db.execute('INSERT INTO users ...', [...]);
await db.execute('INSERT INTO users ...', [...]);
```

### 3. Use Embedded Replicas for Read-Heavy Apps

```typescript
const db = createClient({
  url: 'file:local.db',
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60,
});

// Reads are instant
const users = await db.execute('SELECT * FROM users');
```

## Key Takeaways

- **SQLite at the edge** with global replication
- **Sub-10ms latency** worldwide
- **Works anywhere**: Node.js, edge runtimes, browser
- **Embedded replicas** for offline-first apps
- **Generous free tier**: 1B reads, 25M writes/month
- **Use Drizzle ORM** for type safety
- **Best for** global, edge-deployed applications

## Related Topics

- [LibSQL](/content/databases/libsql) - Open-source fork of SQLite (Turso's foundation)
- [Cloudflare D1](/content/databases/cloudflare-d1) - Alternative edge SQLite
- [Databases Overview](/content/databases/databases-overview) - Compare all databases
- [Serverless & Edge](/content/runtimes/serverless-edge) - Deploy with edge databases
- [Bun](/content/runtimes/bun) - Runtime with built-in SQLite support

Turso brings SQLite's simplicity to the edge with global distribution. Its generous free tier and low latency make it perfect for modern edge-deployed applications. Use it when you need a fast, globally-distributed database without the complexity of managing infrastructure.
