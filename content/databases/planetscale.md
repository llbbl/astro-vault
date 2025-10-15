---
title: PlanetScale
tags: [planetscale, mysql, vitess, serverless, branching, database]
---

# PlanetScale

PlanetScale is a serverless MySQL platform built on Vitess (YouTube's database infrastructure). Created in 2018, PlanetScale brings Git-like workflows to databases with branching, non-blocking schema changes, and horizontal scaling. For JavaScript/TypeScript developers, PlanetScale offers MySQL compatibility with modern serverless features and a workflow designed for continuous deployment.

## What is PlanetScale?

**PlanetScale** is **serverless MySQL with database branching**:

```typescript
import { connect } from '@planetscale/database';

const conn = connect({
  url: process.env.DATABASE_URL,
});

const results = await conn.execute('SELECT * FROM users WHERE email = ?', [
  'alice@example.com',
]);

console.log(results.rows);
```

**Key Features:**
- **MySQL-compatible**: Use any MySQL tool/library
- **Database branching**: Create database branches like Git
- **Non-blocking schema changes**: Deploy without downtime
- **Serverless**: Auto-scaling, pay-per-use
- **Horizontal scaling**: Powered by Vitess
- **Connection pooling**: Built-in (no separate pooler needed)

## Why PlanetScale?

### 1. Database Branching

Create database branches like Git:

```bash
# Create development branch from main
pscale branch create my-database dev

# Each PR gets its own database
pscale branch create my-database pr-123

# Delete when done
pscale branch delete my-database pr-123
```

```
main branch: production data
   ↓
dev branch: development data (instant copy)
   ↓
pr-123 branch: preview data (instant copy)
```

Perfect for preview deployments!

### 2. Non-Blocking Schema Changes

Deploy schema changes without downtime:

```bash
# Create schema branch
pscale branch create my-database add-column

# Make changes
pscale shell my-database add-column
> ALTER TABLE users ADD COLUMN phone VARCHAR(20);

# Create deploy request
pscale deploy-request create my-database add-column

# Review and deploy (zero downtime)
pscale deploy-request deploy my-database 1
```

Schema changes apply without locking tables.

### 3. Serverless MySQL

```
Low traffic:
[Small compute] ← Minimal resources

High traffic:
[Large compute] ← Auto-scales

No traffic:
[Connection pooler] ← Maintains connections
```

Pay only for what you use.

### 4. Vitess-Powered

Built on Vitess (YouTube's database infrastructure):

- Horizontal sharding
- Connection pooling
- Query rewriting
- Automatic failover

## Using PlanetScale with TypeScript

### Setup

```bash
# Sign up at https://planetscale.com
# Create database
pscale database create my-database --region us-east

# Get connection string
pscale connect my-database main

# Or use dashboard to get connection string
```

### With @planetscale/database (Recommended for Serverless)

```bash
pnpm add @planetscale/database
```

```typescript
import { connect } from '@planetscale/database';

const conn = connect({
  url: process.env.DATABASE_URL,
});

// Query
const results = await conn.execute(
  'SELECT * FROM users WHERE email = ?',
  ['alice@example.com']
);

console.log(results.rows);

// Insert
const insertResult = await conn.execute(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['Alice', 'alice@example.com']
);

console.log('Inserted ID:', insertResult.insertId);

// Transaction
const tx = await conn.transaction();

try {
  await tx.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [100, 1]);
  await tx.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [100, 2]);

  await tx.commit();
} catch (error) {
  await tx.rollback();
  throw error;
}
```

### With Prisma

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

```prisma
// prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma" // Required for PlanetScale
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())

  @@index([email])
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String   @db.Text
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())

  @@index([authorId])
}
```

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create user
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

**Important**: Use `relationMode = "prisma"` because PlanetScale doesn't support foreign key constraints (Vitess limitation).

### With mysql2

```bash
pnpm add mysql2
```

```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool(process.env.DATABASE_URL!);

// Query
const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
  'alice@example.com',
]);

console.log(rows);

// Insert
const [result] = await pool.query(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['Bob', 'bob@example.com']
);

console.log('Inserted ID:', result.insertId);
```

## Database Branching Workflow

### Development Workflow

```bash
# 1. Create dev branch
pscale branch create my-database dev

# 2. Get connection string for dev branch
pscale connect my-database dev

# 3. Make schema changes
pscale shell my-database dev
> CREATE TABLE posts (
>   id VARCHAR(36) PRIMARY KEY,
>   title VARCHAR(255),
>   content TEXT
> );

# 4. Test in development

# 5. Create deploy request
pscale deploy-request create my-database dev

# 6. Deploy to main (zero downtime)
pscale deploy-request deploy my-database 1
```

### Preview Deployment Workflow

```bash
# In CI/CD (GitHub Actions, etc.)
- name: Create preview branch
  run: |
    BRANCH_NAME="pr-${{ github.event.pull_request.number }}"
    pscale branch create my-database $BRANCH_NAME --from main
    DATABASE_URL=$(pscale connect my-database $BRANCH_NAME --format url)
    echo "DATABASE_URL=$DATABASE_URL" >> $GITHUB_ENV

# Deploy preview with its own database
# Delete branch when PR is merged/closed
```

## PlanetScale + Framework Integration

### With Next.js

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
```

```typescript
// app/api/users/route.ts
import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

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

## Schema Changes (Deploy Requests)

### Create Deploy Request

```bash
# 1. Create schema branch
pscale branch create my-database add-phone-column

# 2. Connect to branch
pscale shell my-database add-phone-column

# 3. Make changes
> ALTER TABLE users ADD COLUMN phone VARCHAR(20);

# 4. Create deploy request
pscale deploy-request create my-database add-phone-column

# 5. Review diff in dashboard

# 6. Deploy (zero downtime)
pscale deploy-request deploy my-database 1
```

### Safe Schema Changes

PlanetScale enables non-blocking schema changes:

```sql
-- Add column (safe)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Add index (safe)
CREATE INDEX idx_users_email ON users(email);

-- Remove column (requires multiple deploys)
-- 1. Stop using the column in code
-- 2. Deploy code changes
-- 3. Remove column via deploy request
ALTER TABLE users DROP COLUMN old_column;
```

## Pricing

**Hobby Plan (Free):**
- 5 GB storage
- 1 billion rows reads/month
- 10 million rows writes/month
- 1 production branch
- 1 development branch

**Scaler Plan ($29/month):**
- 10 GB storage included
- 100 billion rows reads/month
- 50 million rows writes/month
- Production branches
- Unlimited development branches
- Deploy requests
- Query insights

**Example Cost:**
- Small app: Free
- Medium app (20 GB, 200B reads, 100M writes): ~$50/month
- Large app (100 GB, 1T reads, 500M writes): ~$200/month

## PlanetScale vs. Other Databases

| Feature | PlanetScale | [Neon](/content/databases/neon) | Traditional MySQL |
|---------|-------------|------|-------------------|
| **Database** | MySQL | PostgreSQL | MySQL |
| **Branching** | Yes | Yes | Manual |
| **Serverless** | Yes | Yes | No |
| **Schema Changes** | Non-blocking | Standard | Blocking |
| **Horizontal Scale** | Yes (Vitess) | Limited | Manual sharding |
| **Free Tier** | 5 GB | 0.5 GB | None |
| **Best For** | MySQL apps | Postgres apps | Traditional hosting |

## Limitations

- **No foreign key constraints**: Vitess limitation (use `relationMode = "prisma"`)
- **No triggers**: Not supported by Vitess
- **No stored procedures**: Not supported
- **No full-text search**: Use external search service
- **Read-heavy**: Write scaling more limited than reads

## Best Practices

### 1. Use Indexes

```sql
-- Add indexes for foreign keys (since no FK constraints)
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at);
```

### 2. Use Prisma's relationMode

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma" // Enforces referential integrity in Prisma
}
```

### 3. Use Branches for Testing

```bash
# Test migrations on branch first
pscale branch create my-database test-migration
pscale shell my-database test-migration
> -- Test your migration here

# If successful, deploy to main
pscale deploy-request create my-database test-migration
```

### 4. Use Connection Pooling

```typescript
// @planetscale/database has built-in pooling
// No additional pooler needed

import { connect } from '@planetscale/database';
const conn = connect({ url: process.env.DATABASE_URL });
```

## Key Takeaways

- **Serverless MySQL** with database branching
- **Non-blocking schema changes** (zero downtime deploys)
- **Powered by Vitess** (YouTube's database infrastructure)
- **Generous free tier**: 5 GB, 1B reads, 10M writes/month
- **No foreign key constraints** (use `relationMode = "prisma"`)
- **Perfect for**: MySQL apps with preview deployments
- **Best workflow**: Branch for every PR

## Related Topics

- [MySQL](https://www.mysql.com/) - Database technology behind PlanetScale
- [Neon](/content/databases/neon) - Alternative for PostgreSQL
- [Databases Overview](/content/databases/databases-overview) - Compare all databases
- [Next.js](/content/frameworks/nextjs) - Popular framework for PlanetScale apps
- [Prisma](https://www.prisma.io/) - Recommended ORM for PlanetScale

PlanetScale is the best choice for MySQL applications needing modern serverless features and database branching. Its workflow is designed for continuous deployment, making it perfect for teams using preview deployments. Use it when you need MySQL with Git-like database workflows.
