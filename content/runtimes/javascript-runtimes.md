---
title: JavaScript Runtimes
tags: [javascript, typescript, node, bun, deno, runtime, v8, server-side, serverless, edge]
---

# JavaScript Runtimes

JavaScript was originally designed to run only in web browsers. Today, thanks to JavaScript runtimes, you can run JavaScript anywhere: on servers, mobile devices, embedded systems, and even at the edge of content delivery networks. Understanding these runtimes is crucial for modern JavaScript and [TypeScript](/content/languages/typescript) development.

## Runtime Deep Dives

For detailed information about specific runtimes, see:
- **[Node.js](/content/runtimes/nodejs)** - Industry-standard JavaScript runtime
- **[Bun](/content/runtimes/bun)** - Fast all-in-one toolkit
- **[Deno](/content/runtimes/deno)** - Secure-by-default runtime
- **[Serverless & Edge Computing](/content/runtimes/serverless-edge)** - Deploy functions globally

## What is a JavaScript Runtime?

A **runtime** is an environment that executes JavaScript code outside of a web browser. It provides:

1. **JavaScript Engine** - Parses and executes JavaScript code
2. **APIs** - Additional functionality (file system, networking, etc.)
3. **Event Loop** - Manages asynchronous operations
4. **Standard Library** - Built-in modules and utilities

```javascript
// Browser JavaScript
console.log(window.location.href);  // Browser API
localStorage.setItem('key', 'value');  // Browser API

// Server-side JavaScript (Node.js)
const fs = require('fs');  // File system API
const http = require('http');  // HTTP API
```

## JavaScript Engines

The engine is the core that actually executes JavaScript. Different runtimes use different engines:

### V8 (Chrome/Node.js/Deno/Bun)

Created by Google for Chrome, V8 is the most popular JavaScript engine:

- **Just-In-Time (JIT) compilation** - Compiles JavaScript to machine code at runtime
- **Garbage collection** - Automatic memory management
- **Optimization** - Profile-guided optimizations for hot code paths

**Used by:**
- Google Chrome
- Node.js
- Deno
- Bun
- Microsoft Edge (Chromium)

### SpiderMonkey (Firefox)

Mozilla's JavaScript engine, the original JavaScript engine:

- Powers Firefox browser
- Used in some embedded systems

### JavaScriptCore (Safari)

Apple's JavaScript engine:

- Powers Safari and all iOS browsers (iOS requirement)
- Used by Bun for some features
- Generally fast but different optimizations than V8

## Client-Side vs Server-Side

### Client-Side (Browser)

JavaScript runs in the user's browser:

```javascript
// Browser environment
document.getElementById('app').innerHTML = '<h1>Hello!</h1>';
fetch('/api/data').then(res => res.json());
window.addEventListener('click', handleClick);
```

**Characteristics:**
- Access to DOM (Document Object Model)
- Browser APIs (localStorage, fetch, etc.)
- Security sandbox (limited system access)
- Different browsers = different engines

### Server-Side (Node.js, etc.)

JavaScript runs on a server:

```javascript
// Node.js environment
const fs = require('fs');
const http = require('http');

http.createServer((req, res) => {
  const data = fs.readFileSync('./data.json');
  res.end(data);
}).listen(3000);
```

**Characteristics:**
- Access to file system
- Network APIs
- Database connections
- Full system access (be careful!)

## Major Runtimes

### Node.js

**Created**: 2009 by Ryan Dahl
**Engine**: V8
**Package Manager**: npm, pnpm, yarn

Node.js brought JavaScript to the server and kickstarted the modern JavaScript ecosystem.

```javascript
// Node.js HTTP server
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
});

server.listen(3000);
```

**Strengths:**
- Massive ecosystem (npm)
- Mature and stable
- Huge community
- Lots of learning resources
- Industry standard

**Considerations:**
- Slower than newer runtimes
- CommonJS vs ESM confusion
- Legacy baggage
- Some APIs are outdated

**Best For:**
- Production applications
- When ecosystem maturity matters
- Teams with Node.js experience
- [React](/content/frameworks/react) and other framework backends

**→ [Read the full Node.js guide](/content/runtimes/nodejs)**

### Bun

**Created**: 2022 by Jarred Sumner
**Engine**: JavaScriptCore
**Package Manager**: Built-in (npm-compatible)

Bun is an all-in-one runtime focused on speed:

```javascript
// Bun HTTP server
Bun.serve({
  port: 3000,
  fetch(request) {
    return new Response("Hello World!");
  },
});

// Built-in file reading
const file = Bun.file('./data.json');
const data = await file.json();

// Built-in bundler
await Bun.build({
  entrypoints: ['./index.ts'],
  outdir: './dist',
});
```

**Strengths:**
- **Extremely fast** (3x faster than Node.js in many benchmarks)
- Fast package installation
- Built-in bundler, transpiler, test runner
- Native TypeScript support
- Web API compatibility (fetch, Response, etc.)
- Drop-in Node.js replacement (mostly)

**Considerations:**
- Newer, less battle-tested
- Some Node.js APIs not implemented
- Smaller community
- Ecosystem still maturing

**Best For:**
- Development speed
- New projects
- Performance-critical applications
- TypeScript projects
- Developers wanting modern APIs

**→ [Read the full Bun guide](/content/runtimes/bun)**

### Deno

**Created**: 2018 by Ryan Dahl (Node.js creator)
**Engine**: V8
**Package Manager**: URL imports (no package.json)

Deno fixes many of Node.js's design mistakes:

```javascript
// Deno HTTP server
Deno.serve((req) => {
  return new Response("Hello World!");
});

// Permission-based security
// deno run --allow-net server.ts

// URL imports (no npm)
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";

// Built-in TypeScript support
const data: string = await Deno.readTextFile("./file.txt");
```

**Strengths:**
- Security-first (explicit permissions)
- Native TypeScript support
- Modern Web APIs (fetch, etc.)
- No package.json or node_modules
- Built-in tooling (formatter, linter, test runner)
- Backwards compatible with Node.js (npm compatibility layer)

**Considerations:**
- Smaller ecosystem than Node.js
- URL imports can be verbose
- Less adoption in production
- Different mental model

**Best For:**
- Security-sensitive applications
- TypeScript-first projects
- Developers who like Deno's approach
- Scripts and utilities

**→ [Read the full Deno guide](/content/runtimes/deno)**

## Runtime Comparison

| Feature | Node.js | Bun | Deno |
|---------|---------|-----|------|
| **Speed** | Good | Excellent | Good |
| **Package Install** | Slow | Very Fast | N/A (URL imports) |
| **TypeScript** | Via ts-node | Native | Native |
| **Package Manager** | npm/pnpm/yarn | Built-in | URL imports |
| **Compatibility** | Standard | Node-compatible | Node-compatible |
| **Security** | Full access | Full access | Permission-based |
| **Ecosystem** | Huge | Growing | Moderate |
| **Maturity** | Very mature | New | Moderate |
| **Best For** | Production | Speed/DX | TypeScript/Security |

## Serverless & Edge Runtimes

**→ [Read the full Serverless & Edge Computing guide](/content/runtimes/serverless-edge)**

### What is Serverless?

**Serverless** doesn't mean "no servers" - it means you don't manage servers. The cloud provider handles:

- Server provisioning
- Scaling (automatic)
- Maintenance
- Operating system updates

You just deploy functions:

```javascript
// AWS Lambda / Vercel Function
export default async function handler(req, res) {
  const data = await fetchData();
  res.json({ data });
}
```

**Characteristics:**
- Pay per invocation (not for idle time)
- Auto-scaling (0 to millions)
- Cold starts (first request is slower)
- Stateless (no persistent storage)

### AWS Lambda

**Runtime**: Node.js (and others)
**Provider**: Amazon Web Services

```javascript
// Lambda function
export const handler = async (event) => {
  const body = JSON.parse(event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
};
```

**Pros:**
- Massive scale
- Integrates with AWS ecosystem
- Battle-tested

**Cons:**
- Cold starts
- Vendor lock-in
- Complex pricing

### Cloudflare Workers

**Runtime**: V8 Isolates
**Provider**: Cloudflare

Cloudflare Workers run at the edge (close to users) using V8 isolates:

```javascript
// Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    return new Response('Hello World!');
  },
};

// Edge key-value storage
export default {
  async fetch(request, env) {
    const value = await env.MY_KV.get('key');
    return new Response(value);
  },
};
```

**V8 Isolates** are lightweight:
- Much faster cold starts than containers (< 1ms)
- Better isolation than shared processes
- Lower memory overhead than VMs or containers

**Pros:**
- Extremely fast cold starts
- Runs at the edge (low latency)
- Web standard APIs
- Great developer experience

**Cons:**
- Limited CPU time (50ms default)
- No file system
- Some Node.js APIs not available

### Vercel Edge Functions

**Runtime**: V8 Isolates (powered by Vercel Edge Runtime)
**Provider**: Vercel

Similar to Cloudflare Workers but integrated with Vercel:

```javascript
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  return new Response('Hello from the edge!');
}
```

### Deno Deploy

**Runtime**: Deno
**Provider**: Deno Land

Edge runtime using Deno:

```javascript
Deno.serve((req) => {
  return new Response("Hello from Deno Deploy!");
});
```

**Pros:**
- Deno's security model
- Native TypeScript
- Fast edge execution

## How Serverless Works

### Traditional Server

```
┌─────────────────┐
│  Your Server    │
│  ┌───────────┐  │
│  │   App     │  │ ← Always running
│  │ (Node.js) │  │ ← You manage OS, scaling
│  └───────────┘  │
└─────────────────┘
```

**Costs**: Pay 24/7, even when idle
**Scaling**: Manual
**Maintenance**: Your responsibility

### Serverless (AWS Lambda)

```
Request → ┌──────────────┐
         │  Container   │
         │ ┌──────────┐ │ ← Spun up on demand
         │ │ Function │ │ ← Killed when idle
         │ └──────────┘ │
         └──────────────┘
```

**Costs**: Pay per invocation
**Scaling**: Automatic
**Maintenance**: Provider handles it

**Cold Start**: First request slower (container startup)

### Edge (Cloudflare Workers)

```
Request → ┌──────────────┐
         │  V8 Isolate  │ ← Very fast startup
         │ ┌──────────┐ │ ← Runs close to user
         │ │ Function │ │ ← Multiple per process
         │ └──────────┘ │
         └──────────────┘
```

**Costs**: Pay per request
**Scaling**: Automatic
**Maintenance**: Provider handles it

**Cold Start**: Nearly instant (< 1ms)

## Edge Computing

### What is the Edge?

**The Edge** means running code geographically close to your users:

```
Traditional:
User (Tokyo) → [10,000 km] → Server (US West) → Database (US West)
                ↑ High latency

Edge:
User (Tokyo) → [100 km] → Edge Server (Tokyo) → Data (cached/replicated)
                ↑ Low latency
```

### Benefits

1. **Lower Latency**: Code runs close to users
2. **Better Performance**: Faster response times
3. **Global Scale**: Automatically distributed worldwide
4. **Resilience**: If one region fails, others continue

### Use Cases

**Good for Edge:**
- Static assets (CDN)
- API proxies
- A/B testing
- Authentication
- Redirects
- Header manipulation
- Simple business logic

**Not Good for Edge:**
- Heavy computation (CPU limits)
- Long-running processes (time limits)
- Direct database connections (use HTTP APIs)
- Large file processing

## Practical Example: Same Code, Different Runtimes

### Node.js Example

```javascript
// server.js
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const data = fs.readFileSync('./data.json');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(data);
});

server.listen(3000);
```

Run: `node server.js`

### Bun Example

```javascript
// server.ts
Bun.serve({
  port: 3000,
  async fetch(req) {
    const file = Bun.file('./data.json');
    return new Response(file);
  },
});
```

Run: `bun server.ts`

### Deno Example

```javascript
// server.ts
Deno.serve(async (req) => {
  const data = await Deno.readTextFile('./data.json');
  return new Response(data, {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

Run: `deno run --allow-read --allow-net server.ts`

### Cloudflare Workers Example

```javascript
// worker.js
export default {
  async fetch(request, env) {
    // No file system! Use KV storage or fetch from origin
    const data = await env.KV.get('data');
    return new Response(data);
  },
};
```

Deploy: `wrangler deploy`

## Choosing a Runtime

### For Development

**Bun**:
- Fastest package installation
- Best developer experience
- Native TypeScript support

**Node.js**:
- Most compatible with existing tools
- Largest ecosystem
- Most learning resources

**Deno**:
- Security-first
- Modern approach
- Clean architecture

### For Production

**Node.js**:
- Battle-tested
- Maximum compatibility
- Huge ecosystem
- Best for teams

**Bun**:
- Maximum performance
- Modern APIs
- If compatibility is confirmed

**Serverless/Edge**:
- Auto-scaling
- Pay-per-use
- Global distribution
- Cloudflare Workers / Vercel Edge

## Performance Benchmarks

**HTTP Server (requests/sec):**
```
Bun:      ~250,000
Deno:     ~130,000
Node.js:  ~100,000
```

**Package Installation (500 packages):**
```
Bun:      ~2 seconds
pnpm:     ~15 seconds
npm:      ~45 seconds
```

**Cold Start Time:**
```
V8 Isolate:     < 1ms
Container:      100-500ms
VM:             Several seconds
```

*Benchmarks vary by workload*

## Key Takeaways

- **JavaScript runtimes** let you run JavaScript outside browsers
- **Node.js** is the mature, industry-standard choice
- **Bun** offers the best performance and developer experience
- **Deno** prioritizes security and modern APIs
- **Serverless** means auto-scaling, pay-per-use functions
- **Edge runtimes** run code close to users for low latency
- **V8 Isolates** enable near-instant cold starts
- Choose based on your needs: compatibility (Node), speed (Bun), or security (Deno)

## Related Topics

- [TypeScript](/content/languages/typescript) - All modern runtimes support TypeScript
- [JavaScript Frameworks](/content/frameworks/javascript-frameworks) - Build UIs that run in these runtimes
- [React](/content/frameworks/react) - Can run server-side with these runtimes
- [Go](/content/languages/go) - Alternative for backend services
- [Python](/content/languages/python) - Another server-side language

The runtime you choose affects your application's performance, developer experience, and deployment options. Node.js remains the safe choice for production, but Bun and Deno offer compelling modern alternatives. For global, auto-scaling applications, edge runtimes like Cloudflare Workers provide unmatched performance and developer experience.
