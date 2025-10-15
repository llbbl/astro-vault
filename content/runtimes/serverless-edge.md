---
title: Serverless & Edge Computing
tags: [serverless, edge, lambda, cloudflare-workers, vercel, aws, computing, functions]
---

# Serverless & Edge Computing

Serverless and edge computing have transformed how we deploy and scale web applications. Instead of managing servers, you write functions that automatically scale from zero to millions of users. Edge computing takes this further by running code geographically close to users for minimal latency. This guide explores how these technologies work and when to use them.

## What is Serverless?

**Serverless** doesn't mean "no servers"—it means you don't manage servers:

```javascript
// AWS Lambda / Vercel Function
export default async function handler(req, res) {
  const data = await fetchData();
  res.json({ data });
}
```

**Key Characteristics:**
- **No server management**: Provider handles infrastructure
- **Auto-scaling**: From 0 to millions automatically
- **Pay per use**: Only pay for execution time
- **Stateless**: Each invocation is independent
- **Cold starts**: First request slower (container startup)

## Traditional vs Serverless vs Edge

### Traditional Server

```
┌─────────────────┐
│  Your Server    │
│  ┌───────────┐  │
│  │   App     │  │ ← Always running
│  │ (Node.js) │  │ ← You manage OS, scaling
│  └───────────┘  │ ← Pay 24/7
└─────────────────┘
```

**Costs**: $10-500/month (always running)
**Scaling**: Manual
**Maintenance**: Your responsibility

### Serverless (AWS Lambda, Vercel)

```
Request → ┌──────────────┐
         │  Container   │
         │ ┌──────────┐ │ ← Spun up on demand
         │ │ Function │ │ ← Auto-scales
         │ └──────────┘ │ ← Killed when idle
         └──────────────┘
```

**Costs**: $0.20 per million requests
**Scaling**: Automatic (0 to ∞)
**Maintenance**: Provider handles it
**Cold Start**: 100-500ms

### Edge (Cloudflare Workers, Vercel Edge)

```
Request → ┌──────────────┐
         │  V8 Isolate  │ ← Extremely fast startup
         │ ┌──────────┐ │ ← Runs near user
         │ │ Function │ │ ← Multiple per process
         │ └──────────┘ │ ← Global distribution
         └──────────────┘
```

**Costs**: $0.50 per million requests
**Scaling**: Automatic (global)
**Maintenance**: Provider handles it
**Cold Start**: < 1ms

## Serverless Platforms

### AWS Lambda

**Provider**: Amazon Web Services
**Runtime**: [Node.js](/content/runtimes/nodejs), Python, Go, Java, .NET, etc.

```javascript
// lambda.js
export const handler = async (event) => {
  const body = JSON.parse(event.body);

  // Your logic here
  const result = await processData(body);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(result),
  };
};
```

**Deploy:**
```bash
# Using AWS CLI
aws lambda create-function \
  --function-name my-function \
  --runtime nodejs18.x \
  --handler lambda.handler \
  --zip-file fileb://function.zip
```

**Pricing:**
- **Free tier**: 1 million requests/month
- **After**: $0.20 per 1M requests
- **Memory**: $0.0000166667 per GB-second

**Limits:**
- **Timeout**: 15 minutes max
- **Memory**: 128 MB to 10 GB
- **Package size**: 50 MB (zipped), 250 MB (unzipped)

**Best for:**
- AWS ecosystem integration
- Long-running functions (up to 15 min)
- Complex compute tasks

### Vercel Functions

**Provider**: Vercel
**Runtime**: [Node.js](/content/runtimes/nodejs), [Go](/content/languages/go), [Python](/content/languages/python), Ruby

```javascript
// api/hello.js
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from Vercel!' });
}
```

**Deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**File-based routing:**
```
api/
  hello.js        → /api/hello
  users/
    [id].js       → /api/users/:id
    index.js      → /api/users
```

**Pricing:**
- **Hobby**: Free (100 GB-hours/month)
- **Pro**: $20/month (1000 GB-hours)
- **Enterprise**: Custom

**Limits:**
- **Timeout**: 10s (Hobby), 60s (Pro), 900s (Enterprise)
- **Memory**: 1 GB (Hobby), 3 GB (Pro)
- **Package size**: 50 MB

**Best for:**
- [Next.js](/content/frameworks/nextjs) apps
- Quick deployment
- JAMstack sites

### Netlify Functions

**Provider**: Netlify
**Runtime**: [Node.js](/content/runtimes/nodejs), [Go](/content/languages/go)

```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify!' }),
  };
};
```

**Deploy:**
```bash
# Netlify CLI
netlify deploy
```

**Pricing:**
- **Free**: 125k requests/month
- **Pro**: $19/month (2M requests)

**Best for:**
- Static sites with backend
- JAMstack architecture
- Simple APIs

## Edge Computing Platforms

### Cloudflare Workers

**Provider**: Cloudflare
**Runtime**: V8 Isolates (JavaScript, WebAssembly)
**Locations**: 200+ cities worldwide

```javascript
// worker.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/hello') {
      return new Response(JSON.stringify({
        message: 'Hello from the edge!',
        location: request.cf.city,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
```

**Key-Value Storage (KV):**
```javascript
export default {
  async fetch(request, env) {
    // Read from KV
    const value = await env.MY_KV.get('key');

    // Write to KV
    await env.MY_KV.put('key', 'value');

    return new Response(value);
  },
};
```

**Durable Objects (stateful):**
```javascript
export class Counter {
  constructor(state, env) {
    this.state = state;
  }

  async fetch(request) {
    let count = (await this.state.storage.get('count')) || 0;
    count++;
    await this.state.storage.put('count', count);

    return new Response(count.toString());
  }
}
```

**Pricing:**
- **Free**: 100k requests/day
- **Paid**: $5/month (10M requests)
- **KV**: $0.50 per million reads

**Limits:**
- **CPU time**: 50ms (free), 50ms+ (paid)
- **Memory**: 128 MB
- **Script size**: 1 MB

**Best for:**
- Global applications
- Low latency requirements
- API proxies and caching

### Vercel Edge Functions

**Provider**: Vercel
**Runtime**: V8 Isolates
**Locations**: Global edge network

```javascript
// middleware.ts
import { next } from '@vercel/edge';

export default function middleware(request: Request) {
  const url = new URL(request.url);

  // Redirect based on geo
  const country = request.geo?.country;
  if (country === 'US' && !url.pathname.startsWith('/us')) {
    return Response.redirect('/us' + url.pathname);
  }

  return next();
}
```

**Pricing:**
- **Hobby**: Free (100k invocations)
- **Pro**: $20/month (500k invocations)

**Limits:**
- **Timeout**: 25s
- **Memory**: 128 MB (streaming), 1-4 MB (non-streaming)

**Best for:**
- [Next.js](/content/frameworks/nextjs) middleware
- Authentication/authorization
- A/B testing

### Deno Deploy

**Provider**: Deno Land
**Runtime**: [Deno](/content/runtimes/deno)
**Locations**: 35+ regions

```typescript
// server.ts
Deno.serve((req: Request) => {
  return new Response("Hello from Deno Deploy!");
});
```

**Pricing:**
- **Free**: 100k requests/day
- **Pro**: $10/month (5M requests)

**Best for:**
- [Deno](/content/runtimes/deno) projects
- TypeScript-first apps
- Security-conscious deployments

## V8 Isolates Explained

Traditional serverless uses **containers**:

```
┌──────────────────┐
│   Container      │
│ ┌──────────────┐ │
│ │ Node.js      │ │ ← Entire runtime
│ │ ┌──────────┐ │ │
│ │ │ Function │ │ │ ← Your code
│ │ └──────────┘ │ │
│ └──────────────┘ │
└──────────────────┘
```

**Cold start**: 100-500ms

Edge uses **V8 Isolates**:

```
┌──────────────────┐
│   V8 Process     │
│ ┌────┐ ┌────┐   │
│ │Fn1 │ │Fn2 │   │ ← Lightweight isolates
│ └────┘ └────┘   │ ← Share V8 engine
│       ┌────┐    │
│       │Fn3 │    │
│       └────┘    │
└──────────────────┘
```

**Cold start**: < 1ms

**V8 Isolate Benefits:**
- Near-instant startup
- Lower memory overhead
- Better resource sharing
- Higher density (more functions per server)

## Use Cases

### API Endpoints

```javascript
// Serverless function
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const users = await db.users.findMany();
    res.json(users);
  } else if (req.method === 'POST') {
    const user = await db.users.create({
      data: req.body,
    });
    res.status(201).json(user);
  }
}
```

### Image Processing

```javascript
// Lambda function
import sharp from 'sharp';

export async function handler(event) {
  const imageBuffer = Buffer.from(event.body, 'base64');

  const resized = await sharp(imageBuffer)
    .resize(800, 600)
    .jpeg({ quality: 80 })
    .toBuffer();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'image/jpeg' },
    body: resized.toString('base64'),
    isBase64Encoded: true,
  };
}
```

### Authentication/Authorization

```javascript
// Edge function (middleware)
export default function middleware(request) {
  const token = request.cookies.get('auth-token');

  if (!token) {
    return Response.redirect('/login');
  }

  // Verify token...
  if (!isValid(token)) {
    return Response.redirect('/login');
  }

  return next();
}
```

### Webhooks

```javascript
// Handle GitHub webhooks
export async function handler(req) {
  const signature = req.headers['x-hub-signature-256'];

  // Verify signature
  if (!verifySignature(req.body, signature)) {
    return { statusCode: 401 };
  }

  const event = JSON.parse(req.body);

  // Process webhook
  if (event.action === 'opened') {
    await notifyTeam(event.pull_request);
  }

  return { statusCode: 200 };
}
```

### Scheduled Tasks (Cron)

```javascript
// Cloudflare Workers (cron trigger)
export default {
  async scheduled(event, env, ctx) {
    // Runs daily at midnight
    await cleanupOldData();
    await sendDailySummary();
  },
};
```

## Serverless Databases

### Planetscale (MySQL)

```javascript
import { connect } from '@planetscale/database';

const conn = connect({
  url: process.env.DATABASE_URL,
});

const results = await conn.execute('SELECT * FROM users WHERE id = ?', [userId]);
```

### Neon (PostgreSQL)

```javascript
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const users = await sql`SELECT * FROM users`;
```

### Cloudflare D1 (SQLite at the edge)

```javascript
export default {
  async fetch(request, env) {
    const results = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).all();

    return Response.json(results);
  },
};
```

## Cold Starts

**What is a cold start?**

When a function hasn't been called recently:
1. Provision compute resources
2. Download code
3. Initialize runtime
4. Execute function

**Typical cold start times:**

| Platform | Cold Start |
|----------|----------|
| AWS Lambda (Node.js) | 100-400ms |
| AWS Lambda (Python) | 200-500ms |
| Vercel Functions | 100-300ms |
| Cloudflare Workers | < 1ms |
| Vercel Edge | < 1ms |

**Reducing cold starts:**

1. **Keep functions warm** (periodic invocations)
2. **Reduce bundle size** (fewer dependencies)
3. **Use provisioned concurrency** (AWS)
4. **Choose edge computing** (near-instant)

## Cost Comparison

### Scenario: API handling 10M requests/month

**Traditional VPS:**
- Cost: $50-200/month
- Always running
- Manual scaling
- **Total**: ~$100/month

**AWS Lambda:**
- Requests: 10M × $0.20/1M = $2
- Compute: ~$10
- **Total**: ~$12/month

**Cloudflare Workers:**
- Requests: 10M × $0.50/1M = $5
- **Total**: ~$5/month

**Winner**: Serverless/Edge (10-20x cheaper)

### When Traditional Servers Win

- Constantly high traffic (> 100M requests/month)
- Long-running processes
- Predictable load
- Need persistent connections

## Best Practices

### 1. Keep Functions Small

```javascript
// ✓ Good - focused function
export async function getUser(req, res) {
  const user = await db.user.findUnique({
    where: { id: req.params.id },
  });
  res.json(user);
}

// ❌ Bad - too much in one function
export async function handler(req, res) {
  // Handles users, posts, comments, auth...
}
```

### 2. Optimize Cold Starts

```javascript
// ✓ Good - minimize imports
import { getUser } from './db';

// ❌ Bad - imports everything
import * as everything from 'huge-library';
```

### 3. Handle Timeouts

```javascript
// ✓ Good - set reasonable timeout
export async function handler(req, res) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const data = await fetch(url, { signal: controller.signal });
    res.json(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      res.status(504).json({ error: 'Timeout' });
    }
  } finally {
    clearTimeout(timeout);
  }
}
```

### 4. Use Edge for Static/Dynamic Hybrid

```javascript
// Edge function - check cache first
export default async function middleware(request) {
  const cache = caches.default;
  let response = await cache.match(request);

  if (!response) {
    // Cache miss - fetch from origin
    response = await fetch(request);
    await cache.put(request, response.clone());
  }

  return response;
}
```

## Deployment Examples

### AWS Lambda with Serverless Framework

```yaml
# serverless.yml
service: my-api

provider:
  name: aws
  runtime: nodejs18.x

functions:
  getUser:
    handler: handler.getUser
    events:
      - http:
          path: users/{id}
          method: get
```

Deploy: `serverless deploy`

### Vercel

```bash
# Just push to git
git push origin main

# Or use CLI
vercel
```

### Cloudflare Workers

```bash
# Install Wrangler
npm install -g wrangler

# Deploy
wrangler publish
```

## Key Takeaways

- **Serverless** = auto-scaling functions, pay-per-use
- **Edge** = serverless at global locations (< 1ms cold start)
- **V8 Isolates** enable near-instant startup
- **Best for** APIs, webhooks, scheduled tasks
- **Cheaper** than traditional servers for variable traffic
- **Choose edge** for global apps with low latency needs
- **Cold starts** are the main drawback (except edge)

## Related Topics

- [Node.js](/content/runtimes/nodejs) - Often used in serverless functions
- [Bun](/content/runtimes/bun) - Can be used in some serverless platforms
- [Deno](/content/runtimes/deno) - Powers Deno Deploy edge functions
- [JavaScript Runtimes Overview](/content/runtimes/javascript-runtimes) - Understanding runtime differences
- [Next.js](/content/frameworks/nextjs) - Works great with Vercel Functions/Edge

Serverless and edge computing have fundamentally changed how we deploy applications. For most modern web apps with variable traffic, serverless is cheaper and easier than managing traditional servers. Edge computing takes this further, providing global distribution with near-zero latency—perfect for APIs, authentication, and dynamic content delivery.
