---
title: Cloudflare D1
tags: [cloudflare, d1, sqlite, edge, serverless, workers]
---

# Cloudflare D1

Cloudflare D1 is SQLite running at the edge on Cloudflare's global network. Launched in 2022, D1 brings SQL databases to Cloudflare Workers with automatic global replication and sub-millisecond latency. For JavaScript/TypeScript developers using Cloudflare Workers, D1 offers familiar SQL with zero-configuration edge deployment.

## What is Cloudflare D1?

**D1** is **SQLite at Cloudflare's edge**:

```typescript
// worker.ts
export default {
  async fetch(request: Request, env: Env) {
    const { results } = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind('alice@example.com').all();

    return Response.json(results);
  },
};
```

**Key Features:**
- **Edge-hosted**: Runs in Cloudflare's 200+ locations
- **SQLite-based**: Familiar SQL syntax
- **Serverless**: No infrastructure to manage
- **Global replication**: Data replicated worldwide
- **Sub-millisecond latency**: Queries from nearest location
- **Works with Workers**: Tight integration with Cloudflare Workers

## Why Cloudflare D1?

### 1. Edge Performance

```
Traditional Database:
User (Tokyo) → [10,000km] → Database (US) → [10,000km] → User
                          ↑ 200-500ms

Cloudflare D1:
User (Tokyo) → [Local Edge] → D1 (Tokyo replica) → User
                              ↑ < 1ms
```

Queries execute at the edge, close to users.

### 2. Zero Configuration

```typescript
// No connection strings, no auth tokens
export default {
  async fetch(request: Request, env: Env) {
    // Just use env.DB
    const result = await env.DB.prepare('SELECT * FROM users').all();
    return Response.json(result);
  },
};
```

D1 is automatically available in your Worker.

### 3. SQLite Compatibility

```sql
-- Standard SQL
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');

SELECT * FROM users WHERE email = 'alice@example.com';
```

### 4. Global Replication

```
Write once → Replicated to 200+ edge locations automatically
```

No manual configuration needed.

## Using D1 with Cloudflare Workers

### Setup

```bash
# Create D1 database
wrangler d1 create my-database

# Add to wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxx-xxx-xxx"
```

### Create Tables

```bash
# Create schema file
cat > schema.sql << EOF
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX idx_posts_author ON posts(author_id);
EOF

# Execute schema
wrangler d1 execute my-database --file=schema.sql
```

### Query from Worker

```typescript
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Simple query
      const { results } = await env.DB.prepare('SELECT * FROM users').all();

      return Response.json(results);
    } catch (error) {
      return new Response('Error querying database', { status: 500 });
    }
  },
};
```

### Parameterized Queries

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    // ✓ Good - parameterized query (prevents SQL injection)
    const { results } = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).all();

    return Response.json(results);
  },
};
```

### Insert, Update, Delete

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'POST') {
      const body = await request.json();

      // Insert
      const result = await env.DB.prepare(
        'INSERT INTO users (name, email) VALUES (?, ?) RETURNING *'
      ).bind(body.name, body.email).first();

      return Response.json(result);
    }

    if (request.method === 'PUT') {
      const body = await request.json();

      // Update
      await env.DB.prepare(
        'UPDATE users SET name = ? WHERE id = ?'
      ).bind(body.name, body.id).run();

      return Response.json({ success: true });
    }

    if (request.method === 'DELETE') {
      const { id } = await request.json();

      // Delete
      await env.DB.prepare(
        'DELETE FROM users WHERE id = ?'
      ).bind(id).run();

      return Response.json({ success: true });
    }

    return new Response('Method not allowed', { status: 405 });
  },
};
```

## D1 API Methods

### `.all()` - Get All Rows

```typescript
const { results } = await env.DB.prepare('SELECT * FROM users').all();

// results = [{ id: 1, name: 'Alice', ... }, ...]
```

### `.first()` - Get First Row

```typescript
const user = await env.DB.prepare(
  'SELECT * FROM users WHERE id = ?'
).bind(123).first();

// user = { id: 123, name: 'Alice', ... } or null
```

### `.run()` - Execute Without Results

```typescript
const result = await env.DB.prepare(
  'INSERT INTO users (name, email) VALUES (?, ?)'
).bind('Bob', 'bob@example.com').run();

// result.meta.last_row_id = newly inserted ID
// result.meta.changes = number of rows affected
```

### `.raw()` - Get Raw Array

```typescript
const { results } = await env.DB.prepare('SELECT name, email FROM users').raw();

// results = [['Alice', 'alice@example.com'], ['Bob', 'bob@example.com']]
```

## Batch Operations

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const results = await env.DB.batch([
      env.DB.prepare('INSERT INTO users (name, email) VALUES (?, ?)').bind('Alice', 'alice@example.com'),
      env.DB.prepare('INSERT INTO users (name, email) VALUES (?, ?)').bind('Bob', 'bob@example.com'),
      env.DB.prepare('SELECT * FROM users'),
    ]);

    return Response.json(results);
  },
};
```

## Transactions

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      await env.DB.batch([
        env.DB.prepare('UPDATE accounts SET balance = balance - ? WHERE user_id = ?').bind(100, 1),
        env.DB.prepare('UPDATE accounts SET balance = balance + ? WHERE user_id = ?').bind(100, 2),
      ]);

      return Response.json({ success: true });
    } catch (error) {
      // Batch is atomic - all or nothing
      return Response.json({ error: 'Transaction failed' }, { status: 500 });
    }
  },
};
```

## D1 + Framework Integration

### With Hono (Cloudflare Workers Framework)

```bash
pnpm add hono
```

```typescript
import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/users', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM users').all();
  return c.json(results);
});

app.get('/users/:id', async (c) => {
  const id = c.req.param('id');
  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(id).first();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(user);
});

app.post('/users', async (c) => {
  const body = await c.req.json();
  const result = await c.env.DB.prepare(
    'INSERT INTO users (name, email) VALUES (?, ?) RETURNING *'
  ).bind(body.name, body.email).first();

  return c.json(result, 201);
});

export default app;
```

### With Drizzle ORM

```bash
pnpm add drizzle-orm
pnpm add -D drizzle-kit
```

```typescript
// schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});
```

```typescript
// worker.ts
import { drizzle } from 'drizzle-orm/d1';
import { users } from './schema';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const db = drizzle(env.DB);

    // Query
    const allUsers = await db.select().from(users);

    // Insert
    const newUser = await db.insert(users).values({
      name: 'Alice',
      email: 'alice@example.com',
      createdAt: new Date(),
    }).returning();

    return Response.json(newUser);
  },
};
```

## Local Development

```bash
# Run locally with wrangler
wrangler dev

# Execute SQL locally
wrangler d1 execute my-database --local --command="SELECT * FROM users"

# Seed local database
wrangler d1 execute my-database --local --file=seed.sql
```

## Migrations

```bash
# Create migration
cat > migrations/001_create_users.sql << EOF
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);
EOF

# Apply migration (production)
wrangler d1 execute my-database --file=migrations/001_create_users.sql

# Apply migration (local)
wrangler d1 execute my-database --local --file=migrations/001_create_users.sql
```

## Pricing

**Free Tier:**
- 5 GB storage per account
- 5 million read queries/day
- 100,000 write queries/day

**Paid:**
- $0.75/million reads after free tier
- $4.50/million writes after free tier

**Example Cost:**
- Small app (10M reads, 500K writes/month): Free
- Medium app (50M reads, 2M writes/month): ~$7/month
- Large app (500M reads, 20M writes/month): ~$110/month

## D1 vs. Other Edge Databases

| Feature | D1 | [Turso](/content/databases/turso) | [LibSQL](/content/databases/libsql) |
|---------|----|---------|----|
| **Platform** | Cloudflare only | Any runtime | Any runtime |
| **Latency** | < 1ms | < 10ms | Varies |
| **Setup** | Zero config | Requires keys | Local only |
| **Replication** | Automatic | Automatic | Manual |
| **Pricing** | Per query | Per query | Free (self-hosted) |
| **Best For** | Cloudflare ecosystem | Global apps | Local apps |

## Limitations

- **Cloudflare only**: Can only use with Cloudflare Workers
- **SQLite limits**: Single-writer (writes slower than reads)
- **No direct access**: Can't connect with standard SQL clients
- **Limited extensions**: Not all SQLite extensions available
- **Beta**: Still in development (as of 2024)

## Best Practices

### 1. Use Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_author ON posts(author_id);
```

### 2. Use Prepared Statements

```typescript
// ✓ Good - prepared statement (cached)
const stmt = env.DB.prepare('SELECT * FROM users WHERE email = ?');
const user1 = await stmt.bind('alice@example.com').first();
const user2 = await stmt.bind('bob@example.com').first();

// ❌ Bad - creates new statement each time
const user1 = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind('alice@example.com').first();
const user2 = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind('bob@example.com').first();
```

### 3. Batch Related Operations

```typescript
// ✓ Good - single batch
await env.DB.batch([
  env.DB.prepare('INSERT ...'),
  env.DB.prepare('INSERT ...'),
  env.DB.prepare('INSERT ...'),
]);

// ❌ Bad - multiple round trips
await env.DB.prepare('INSERT ...').run();
await env.DB.prepare('INSERT ...').run();
await env.DB.prepare('INSERT ...').run();
```

## Key Takeaways

- **SQLite at Cloudflare's edge** (200+ locations)
- **Sub-millisecond latency** globally
- **Zero configuration** (no connection strings)
- **Automatic global replication**
- **Generous free tier**: 5M reads, 100K writes/day
- **Cloudflare Workers only** (not standalone)
- **Best for**: Cloudflare Workers apps needing SQL

## Related Topics

- [Turso](/content/databases/turso) - Alternative edge SQLite (works anywhere)
- [LibSQL](/content/databases/libsql) - SQLite fork (D1's foundation)
- [Databases Overview](/content/databases/databases-overview) - Compare all databases
- [Serverless & Edge](/content/runtimes/serverless-edge) - Cloudflare Workers overview

Cloudflare D1 is perfect for Cloudflare Workers applications needing a SQL database. Its zero-configuration setup and sub-millisecond latency make it the easiest way to add persistent storage to edge functions. Use it when you're already on Cloudflare and need global SQL capabilities.
