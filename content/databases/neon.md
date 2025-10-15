---
title: Neon
tags: [neon, postgres, postgresql, serverless, branching, autoscaling]
---

# Neon

Neon is a serverless [PostgreSQL](/content/databases/postgres) platform with instant branching, autoscaling, and a generous free tier. Created in 2021, Neon separates storage from compute, enabling features impossible in traditional Postgres like database branching (similar to Git branches) and scale-to-zero. For JavaScript/TypeScript developers, Neon offers familiar Postgres with modern serverless features.

## What is Neon?

**Neon** is **serverless PostgreSQL**:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Works exactly like PostgreSQL
const result = await pool.query('SELECT * FROM users WHERE email = $1', [
  'alice@example.com',
]);

console.log(result.rows[0]);
```

**Key Features:**
- **Serverless**: Auto-scaling, scale-to-zero
- **Branching**: Create database branches like Git
- **Instant provisioning**: New databases in seconds
- **PostgreSQL-compatible**: Use any Postgres tool
- **Free tier**: 0.5 GB storage, no credit card
- **Point-in-time recovery**: Restore to any moment

## Why Neon?

### 1. Database Branching

Create database copies instantly (like Git branches):

```bash
# Create branch from main
neon branches create --name dev

# Each PR gets its own database!
neon branches create --name pr-123

# Delete when done
neon branches delete pr-123
```

```
main branch: production data
   ↓
dev branch: development data (instant copy)
   ↓
pr-123 branch: preview data (instant copy)
```

Perfect for:
- Preview deployments
- Testing migrations
- Development environments

### 2. Serverless (Scale-to-Zero)

```
No traffic:
[Compute] ← OFF (no cost)
[Storage] ← Still accessible

Traffic arrives:
[Compute] ← Auto-starts (< 1s)
[Storage] ← Data served

High traffic:
[Compute] ← Auto-scales
[Storage] ← Data served
```

Pay only for actual usage.

### 3. Instant Provisioning

```bash
# Traditional Postgres: 5-10 minutes
aws rds create-db-instance ...

# Neon: < 1 second
neon projects create
```

### 4. Full PostgreSQL Compatibility

```typescript
// Use any Postgres tool/library
import { PrismaClient } from '@prisma/client';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Pool } from 'pg';

// All work with Neon
```

## Using Neon with TypeScript

### Setup

```bash
# Sign up at https://neon.tech
# Get connection string from dashboard

# Set environment variable
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### With Prisma (Recommended)

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
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}
```

```bash
# Create migration
npx prisma migrate dev --name init

# Generate client
npx prisma generate
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

### With Drizzle ORM

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

```typescript
// db/schema.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});
```

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

```typescript
// app.ts
import { db } from './db';
import { users, posts } from './db/schema';

// Insert
const newUser = await db.insert(users).values({
  name: 'Alice',
  email: 'alice@example.com',
}).returning();

// Query
const allUsers = await db.select().from(users);
```

### With node-postgres (Raw SQL)

```bash
pnpm add pg
pnpm add -D @types/pg
```

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
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

console.log(newUser.rows[0]);
```

## Database Branching

### Create Branches

```bash
# Install Neon CLI
npm install -g neonctl

# Login
neonctl auth

# Create branch
neonctl branches create --name staging

# List branches
neonctl branches list

# Delete branch
neonctl branches delete staging
```

### Branching Workflow

**Development:**

```bash
# Main branch = production
DATABASE_URL=postgresql://...main...

# Create dev branch
neonctl branches create --name dev

# Use dev branch
DATABASE_URL=postgresql://...dev...
```

**Preview Deployments:**

```bash
# In CI/CD (GitHub Actions, etc.)
- name: Create preview database
  run: |
    BRANCH_NAME="pr-${{ github.event.pull_request.number }}"
    neonctl branches create --name $BRANCH_NAME
    DATABASE_URL=$(neonctl connection-string $BRANCH_NAME)
    echo "DATABASE_URL=$DATABASE_URL" >> $GITHUB_ENV
```

```typescript
// Deploy preview with its own database
// Vercel, Netlify, etc. get unique DATABASE_URL per PR
```

## Neon + Framework Integration

### With Next.js

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent multiple instances in development
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

### With Vercel

Neon integrates seamlessly with Vercel:

```bash
# Install Vercel + Neon integration
# https://vercel.com/integrations/neon

# Automatic:
# - DATABASE_URL set in environment
# - Branch databases for preview deployments
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

## Autoscaling

Neon automatically scales compute:

```
Low traffic:
[0.25 CU] ← Minimal resources

Medium traffic:
[1 CU] ← Scales up

High traffic:
[4 CU] ← Maximum scale

No traffic:
[0 CU] ← Scale to zero (free tier only)
```

**CU** = Compute Unit (0.25 vCPU + 1 GB RAM)

## Connection Pooling

Neon provides built-in connection pooling:

```
Your App → Neon Pooler → Neon Database
            ↑
         Handles connection management
```

```typescript
// Pooled connection (recommended for serverless)
const pooledUrl = 'postgresql://...?sslmode=require&pooler=true';

// Direct connection (for long-running apps)
const directUrl = 'postgresql://...?sslmode=require';
```

## Pricing

**Free Tier:**
- 0.5 GB storage
- 1 project
- 10 branches
- Scale to zero (unlimited compute hours)
- Always free, no credit card

**Pro Plan ($19/month):**
- 10 GB included storage
- Unlimited projects
- Unlimited branches
- Auto-scaling compute
- Point-in-time recovery

**Example Cost:**
- Small app (free tier): $0/month
- Medium app (10 GB, 100 compute hours): ~$19/month
- Large app (50 GB, 500 compute hours): ~$50/month

## Neon vs. Other Postgres Providers

| Feature | Neon | [Supabase](/content/databases/supabase) | AWS RDS |
|---------|------|----------|---------|
| **Serverless** | Yes | Partially | No |
| **Branching** | Yes | No | Manual |
| **Scale-to-zero** | Yes (free tier) | No | No |
| **Free Tier** | 0.5 GB | 500 MB | None |
| **Auth/Storage** | No | Yes | No |
| **Provisioning** | Instant | Instant | 5-10 min |
| **Best For** | Serverless apps | Full backend | Enterprise |

## Best Practices

### 1. Use Connection Pooling

```typescript
// ✓ Good - pooled connection
DATABASE_URL=postgresql://...?pooler=true

// For serverless (Vercel, Netlify, etc.)
```

### 2. Use Branches for Testing

```bash
# Create branch for migration testing
neonctl branches create --name migration-test

# Test migration on branch
DATABASE_URL=postgresql://...migration-test... npm run migrate

# If good, apply to main
DATABASE_URL=postgresql://...main... npm run migrate
```

### 3. Enable Auto-Suspend

```bash
# In Neon dashboard:
# Settings → Compute → Auto-suspend after inactivity
# Set to 5 minutes for free tier
```

### 4. Use Read Replicas

```typescript
// Write to primary
const writePool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Read from replica (lower load on primary)
const readPool = new Pool({
  connectionString: process.env.DATABASE_READ_URL,
});
```

## Limitations

- **Cold starts**: After scale-to-zero, first query slower (~1s)
- **Free tier**: 0.5 GB storage limit
- **Compute limits**: Free tier scales to 0, Pro scales to 4 CU
- **Region selection**: Limited regions compared to AWS RDS

## Key Takeaways

- **Serverless PostgreSQL** with auto-scaling
- **Database branching** for preview deployments
- **Scale-to-zero** on free tier (unlimited compute hours)
- **Instant provisioning** (< 1 second)
- **Full PostgreSQL compatibility**
- **Generous free tier**: 0.5 GB storage, no credit card
- **Perfect for**: Serverless apps, Vercel/Netlify, preview environments

## Related Topics

- [PostgreSQL](/content/databases/postgres) - Database technology behind Neon
- [Supabase](/content/databases/supabase) - Alternative Postgres provider with auth/storage
- [Databases Overview](/content/databases/databases-overview) - Compare all databases
- [Next.js](/content/frameworks/nextjs) - Popular framework for Neon apps
- [Vercel](https://vercel.com) - Deployment platform with Neon integration

Neon is the best choice for serverless PostgreSQL applications. Its database branching feature is game-changing for preview deployments, and the generous free tier makes it perfect for side projects. Use it with Vercel for the best developer experience.
