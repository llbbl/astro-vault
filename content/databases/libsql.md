---
title: LibSQL
tags: [libsql, sqlite, fork, open-source, embedded, serverless, edge]
---

# LibSQL

LibSQL is an open-source fork of SQLite created in 2023. It extends SQLite with features designed for modern applications like edge computing, replication, and WebAssembly support. For JavaScript/TypeScript developers, LibSQL offers SQLite's simplicity with modern tooling and compatibility with edge runtimes. It's the foundation for [Turso](/content/databases/turso).

## What is LibSQL?

**LibSQL** is an **SQLite fork with modern features**:

```typescript
import { createClient } from '@libsql/client';

// Local SQLite file
const db = createClient({
  url: 'file:local.db',
});

// Execute SQL
const result = await db.execute('SELECT * FROM users WHERE email = ?', [
  'alice@example.com',
]);

console.log(result.rows);
```

**Key Features:**
- **SQLite-compatible**: Drop-in SQLite replacement
- **Modern APIs**: HTTP, WebSocket protocols
- **Edge-friendly**: Works in any JavaScript runtime
- **WebAssembly**: Runs in browsers
- **Replication**: Built-in synchronization support
- **Open-source**: Actively developed on GitHub

## Why LibSQL?

### 1. SQLite with Modern Features

LibSQL = SQLite + modern enhancements:

```
SQLite:
- Embedded database
- File-based
- ACID guarantees
- No network layer

LibSQL (adds):
- HTTP/WebSocket protocols
- WebAssembly support
- Replication
- Edge runtime compatibility
- Modern JavaScript APIs
```

### 2. Works Everywhere

```typescript
// Node.js
import { createClient } from '@libsql/client';

// Bun (built-in SQLite)
import { Database } from 'bun:sqlite';

// Browser (WebAssembly)
import { createClient } from '@libsql/client/web';

// Cloudflare Workers
import { createClient } from '@libsql/client/web';
```

### 3. Local or Remote

```typescript
// Local file
const local = createClient({
  url: 'file:local.db',
});

// Remote server
const remote = createClient({
  url: 'libsql://database.example.com',
  authToken: 'your-token',
});

// Embedded + Sync (local with remote backup)
const synced = createClient({
  url: 'file:local.db',
  syncUrl: 'libsql://database.example.com',
  authToken: 'your-token',
});
```

## Using LibSQL with TypeScript

### Local Database

```bash
pnpm add @libsql/client
```

```typescript
import { createClient } from '@libsql/client';

const db = createClient({
  url: 'file:local.db',
});

// Create table
await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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

console.log('Inserted row ID:', result.lastInsertRowid);

// Query
const users = await db.execute('SELECT * FROM users');
console.log(users.rows);

// Query with parameters
const user = await db.execute({
  sql: 'SELECT * FROM users WHERE email = ?',
  args: ['alice@example.com'],
});

console.log(user.rows[0]);
```

### In-Memory Database

```typescript
const db = createClient({
  url: ':memory:',
});

// Perfect for testing
await db.execute('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
await db.execute('INSERT INTO users (name) VALUES (?)', ['Alice']);

const users = await db.execute('SELECT * FROM users');
console.log(users.rows); // [{ id: 1, name: 'Alice' }]
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
const users = result.rows as unknown as User[];

users.forEach((user) => {
  console.log(user.name); // ✓ Type-safe
});
```

## Using with Bun

Bun has built-in SQLite support:

```typescript
import { Database } from 'bun:sqlite';

const db = new Database('mydb.sqlite');

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  )
`);

// Insert
const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
insert.run('Alice', 'alice@example.com');

// Query
const query = db.prepare('SELECT * FROM users WHERE email = ?');
const user = query.get('alice@example.com');

console.log(user);

// All rows
const allUsers = db.prepare('SELECT * FROM users').all();
console.log(allUsers);
```

## LibSQL with Drizzle ORM

```bash
pnpm add drizzle-orm @libsql/client
pnpm add -D drizzle-kit
```

```typescript
// schema.ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`),
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`),
});
```

```typescript
// db.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: 'file:local.db',
});

export const db = drizzle(client, { schema });
```

```typescript
// app.ts
import { db } from './db';
import { users, posts } from './schema';
import { eq } from 'drizzle-orm';

// Insert
const newUser = await db.insert(users).values({
  name: 'Alice',
  email: 'alice@example.com',
}).returning();

// Query
const allUsers = await db.select().from(users);

// Query with relations
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

## Common Patterns

### User Management

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  created_at: number;
}

async function createUser(name: string, email: string): Promise<User> {
  const result = await db.execute({
    sql: 'INSERT INTO users (name, email) VALUES (?, ?) RETURNING *',
    args: [name, email],
  });

  return result.rows[0] as unknown as User;
}

async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });

  return (result.rows[0] as unknown as User) || null;
}

async function updateUser(id: number, data: Partial<User>): Promise<void> {
  const updates: string[] = [];
  const args: any[] = [];

  if (data.name) {
    updates.push('name = ?');
    args.push(data.name);
  }

  if (data.email) {
    updates.push('email = ?');
    args.push(data.email);
  }

  args.push(id);

  await db.execute({
    sql: `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });
}
```

### Batch Operations

```typescript
// Insert multiple rows
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

console.log('All users:', results[2].rows);
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

## LibSQL + Framework Integration

### With Next.js

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: 'file:local.db',
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

### With Node.js/Express

```typescript
import express from 'express';
import { createClient } from '@libsql/client';

const app = express();
const db = createClient({ url: 'file:local.db' });

app.use(express.json());

app.get('/users', async (req, res) => {
  const result = await db.execute('SELECT * FROM users');
  res.json(result.rows);
});

app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  const result = await db.execute({
    sql: 'INSERT INTO users (name, email) VALUES (?, ?) RETURNING *',
    args: [name, email],
  });
  res.json(result.rows[0]);
});

app.listen(3000);
```

## Performance Optimization

### Indexes

```sql
-- Single column
CREATE INDEX idx_users_email ON users(email);

-- Composite index
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);

-- Unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
```

### Prepared Statements

```typescript
// Reuse prepared statement
const getUser = db.prepare('SELECT * FROM users WHERE email = ?');

// Execute multiple times (efficient)
const alice = await getUser.execute(['alice@example.com']);
const bob = await getUser.execute(['bob@example.com']);
```

### Analyze Queries

```sql
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE email = 'alice@example.com';
```

## LibSQL vs. SQLite vs. Turso

| Feature | LibSQL | SQLite | [Turso](/content/databases/turso) |
|---------|--------|--------|-------|
| **Type** | Embedded | Embedded | Edge-hosted |
| **API** | HTTP/WebSocket | C API | HTTP/WebSocket |
| **Replication** | Built-in | Manual | Automatic (global) |
| **Edge Compatible** | Yes | No | Yes |
| **Hosting** | Self-hosted | Self-hosted | Managed cloud |
| **Best For** | Local apps | Embedded apps | Global apps |

## LibSQL vs. PostgreSQL

| Feature | LibSQL | [PostgreSQL](/content/databases/postgres) |
|---------|--------|----------|
| **Architecture** | Embedded | Client-server |
| **Setup** | Zero config | Server required |
| **Concurrency** | Read-heavy | Read + write |
| **Data Size** | < 100 GB | Terabytes |
| **Use Case** | Local/edge | Centralized |

## When to Use LibSQL

**Use LibSQL when:**
- Building local-first applications
- Need embedded database (no server)
- Deploying to edge runtimes
- Want SQLite simplicity
- Building offline-first apps

**Use Turso when:**
- Need global distribution
- Want managed hosting
- Require automatic replication
- Building multi-user apps

**Use PostgreSQL when:**
- Complex queries and joins
- High write concurrency
- Large datasets (> 100 GB)
- Centralized architecture

## Best Practices

### 1. Use WAL Mode

```typescript
// Enable Write-Ahead Logging (better concurrency)
await db.execute('PRAGMA journal_mode = WAL');
```

### 2. Use Foreign Keys

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  author_id INTEGER NOT NULL,
  title TEXT,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Regular Vacuuming

```typescript
// Reclaim unused space
await db.execute('VACUUM');
```

### 4. Use Indexes

```sql
CREATE INDEX idx_posts_author ON posts(author_id);
```

## Key Takeaways

- **Open-source SQLite fork** with modern features
- **Edge-compatible**: Works in any JavaScript runtime
- **HTTP/WebSocket APIs** for modern apps
- **Replication support** for distributed setups
- **Powers Turso** (managed edge database)
- **Use Drizzle ORM** for type safety
- **Best for** local-first and edge applications

## Related Topics

- [Turso](/content/databases/turso) - Managed LibSQL hosting with global edge replication
- [SQLite](https://www.sqlite.org/) - Original SQLite database
- [Databases Overview](/content/databases/databases-overview) - Compare all databases
- [Bun](/content/runtimes/bun) - Runtime with built-in SQLite support
- [Cloudflare D1](/content/databases/cloudflare-d1) - Alternative edge SQLite

LibSQL brings SQLite into the modern era with features designed for edge computing and distributed applications. Use it directly for local-first apps, or use Turso for managed edge hosting with automatic global replication.
