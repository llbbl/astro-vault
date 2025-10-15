---
title: Supabase
tags: [supabase, postgres, postgresql, baas, auth, storage, realtime, backend]
---

# Supabase

Supabase is an open-source [Firebase](/content/databases/firebase) alternative built on [PostgreSQL](/content/databases/postgres). Created in 2020, Supabase provides a complete backend-as-a-service platform with database, authentication, storage, edge functions, and real-time subscriptions. For JavaScript/TypeScript developers, Supabase offers the power of PostgreSQL with the ease of Firebase.

## What is Supabase?

**Supabase** is **PostgreSQL + Backend-as-a-Service**:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Query database
const { data: users } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active');

// Sign up user
const { data, error } = await supabase.auth.signUp({
  email: 'alice@example.com',
  password: 'password123',
});

// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('avatar.png', file);
```

**Core Services:**
- **Database**: PostgreSQL with REST/GraphQL APIs
- **Auth**: Email, OAuth, magic links, phone auth
- **Storage**: File uploads and CDN
- **Realtime**: WebSocket subscriptions to database changes
- **Edge Functions**: Serverless Deno functions
- **Vector**: pgvector for AI/embeddings

## Why Supabase?

### 1. PostgreSQL Power + Firebase Ease

```
Firebase:
- NoSQL (Firestore)
- Easy to use
- Real-time
- Vendor lock-in

Supabase:
- PostgreSQL (SQL)
- Easy to use
- Real-time
- Open-source
```

Best of both worlds.

### 2. Built-in Authentication

```typescript
// Sign up
await supabase.auth.signUp({
  email: 'alice@example.com',
  password: 'password123',
});

// Sign in
await supabase.auth.signInWithPassword({
  email: 'alice@example.com',
  password: 'password123',
});

// OAuth
await supabase.auth.signInWithOAuth({
  provider: 'google',
});

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});
```

**Supported Providers:**
- Email/password
- Magic links
- Google, GitHub, GitLab, Bitbucket
- Apple, Facebook, Twitter, Discord
- Phone (SMS)
- SAML SSO (Enterprise)

### 3. Real-Time Subscriptions

```typescript
// Listen to INSERT events
const subscription = supabase
  .channel('public:users')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'users' },
    (payload) => {
      console.log('New user:', payload.new);
    }
  )
  .subscribe();

// Listen to all changes
const subscription = supabase
  .channel('public:posts')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => {
      console.log('Change:', payload);
    }
  )
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

### 4. Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can only read their own posts
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone can read public posts
CREATE POLICY "Public posts are readable"
  ON posts FOR SELECT
  USING (is_public = true);
```

## Using Supabase with TypeScript

### Setup

```bash
pnpm add @supabase/supabase-js
```

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Type-Safe Database

Generate types from your database schema:

```bash
# Install Supabase CLI
npm install -g supabase

# Generate types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
```

```typescript
import { Database } from '@/types/database.types';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Type-safe queries
const { data } = await supabase
  .from('users')
  .select('id, name, email')
  .eq('status', 'active');

// TypeScript knows the shape of `data`
```

### CRUD Operations

```typescript
// Create
const { data, error } = await supabase
  .from('users')
  .insert({
    name: 'Alice',
    email: 'alice@example.com',
  })
  .select();

// Read
const { data: users } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(10);

// Read single
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('email', 'alice@example.com')
  .single();

// Update
const { data, error } = await supabase
  .from('users')
  .update({ name: 'Alice Smith' })
  .eq('id', userId)
  .select();

// Delete
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId);

// Upsert (insert or update)
const { data, error } = await supabase
  .from('users')
  .upsert({
    id: userId,
    name: 'Alice',
    email: 'alice@example.com',
  });
```

### Joins and Relations

```typescript
// One-to-many join
const { data: users } = await supabase
  .from('users')
  .select(`
    id,
    name,
    posts (
      id,
      title,
      content
    )
  `);

// Result: [{ id: 1, name: 'Alice', posts: [{ id: 1, title: '...' }, ...] }]

// Many-to-many join
const { data: posts } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    post_tags (
      tag_id,
      tags (
        id,
        name
      )
    )
  `);
```

## Authentication

### Email/Password

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'alice@example.com',
  password: 'password123',
  options: {
    data: {
      name: 'Alice',
    },
  },
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'alice@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Reset password
await supabase.auth.resetPasswordForEmail('alice@example.com');
```

### OAuth

```typescript
// Sign in with Google
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://myapp.com/auth/callback',
  },
});

// Sign in with GitHub
await supabase.auth.signInWithOAuth({
  provider: 'github',
});
```

### Auth State

```typescript
// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user);
  }
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});
```

## Storage

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true,
  });

// Download file
const { data, error } = await supabase.storage
  .from('avatars')
  .download('avatar.png');

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('avatar.png');

console.log(data.publicUrl);

// List files
const { data, error } = await supabase.storage
  .from('avatars')
  .list('folder', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });

// Delete file
const { data, error } = await supabase.storage
  .from('avatars')
  .remove(['avatar.png']);
```

## Edge Functions

```typescript
// functions/hello/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { name } = await req.json();

  return new Response(
    JSON.stringify({ message: `Hello ${name}!` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

```bash
# Deploy
supabase functions deploy hello

# Invoke
supabase functions invoke hello --body '{"name":"Alice"}'
```

```typescript
// Call from client
const { data, error } = await supabase.functions.invoke('hello', {
  body: { name: 'Alice' },
});

console.log(data); // { message: 'Hello Alice!' }
```

## Supabase + Framework Integration

### With React

```tsx
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from('users').select('*');
      setUsers(data || []);
    }

    fetchUsers();

    // Subscribe to changes
    const subscription = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### With Next.js

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}
```

```typescript
// app/api/users/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: users } = await supabase.from('users').select('*');

  return NextResponse.json(users);
}
```

## Pricing

**Free Tier:**
- 500 MB database space
- 1 GB file storage
- 50,000 monthly active users
- 2 GB bandwidth
- Social OAuth providers
- Email support

**Pro Plan ($25/month):**
- 8 GB database space
- 100 GB file storage
- 100,000 monthly active users
- 50 GB bandwidth
- Daily backups (7 days retention)
- No project pausing

**Example Cost:**
- Small app: Free
- Medium app (10 GB database): $25/month
- Large app (50 GB database): ~$100/month

## Supabase vs. Other Platforms

| Feature | Supabase | [Firebase](/content/databases/firebase) | [Neon](/content/databases/neon) |
|---------|----------|----------|------|
| **Database** | PostgreSQL | NoSQL | PostgreSQL |
| **Auth** | Built-in | Built-in | No |
| **Storage** | Built-in | Built-in | No |
| **Realtime** | Yes | Yes | No |
| **Functions** | Deno | Node.js | No |
| **Open Source** | Yes | No | Partially |
| **Free Tier** | 500 MB | 1 GB | 500 MB |
| **Best For** | Full backend | Mobile apps | Serverless apps |

## Best Practices

### 1. Use Row-Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);
```

### 2. Use Server-Side Client for Admin

```typescript
// Server-side only (has admin access)
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Secret key
);

// Bypasses RLS
const { data } = await supabaseAdmin
  .from('users')
  .select('*');
```

### 3. Optimize Real-Time Subscriptions

```typescript
// ✓ Good - specific filter
const subscription = supabase
  .channel('posts')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'posts',
    filter: 'user_id=eq.123',
  }, handler)
  .subscribe();

// ❌ Bad - too broad
const subscription = supabase
  .channel('all-changes')
  .on('postgres_changes', { event: '*', schema: 'public' }, handler)
  .subscribe();
```

## Key Takeaways

- **PostgreSQL + Backend-as-a-Service**
- **Built-in auth, storage, realtime, functions**
- **Row-level security** for fine-grained access control
- **Real-time subscriptions** to database changes
- **Type-safe** with generated TypeScript types
- **Open-source** (no vendor lock-in)
- **Generous free tier**: 500 MB database, auth, storage
- **Best for**: Full-stack apps needing complete backend

## Related Topics

- [PostgreSQL](/content/databases/postgres) - Database technology behind Supabase
- [Firebase](/content/databases/firebase) - Alternative BaaS platform
- [Neon](/content/databases/neon) - Alternative serverless Postgres
- [Databases Overview](/content/databases/databases-overview) - Compare all databases
- [Next.js](/content/frameworks/nextjs) - Popular framework for Supabase apps

Supabase is the best open-source Firebase alternative. It combines PostgreSQL's power with Firebase's ease of use, plus authentication, storage, and real-time features. Use it when you need a complete backend solution with SQL capabilities.
