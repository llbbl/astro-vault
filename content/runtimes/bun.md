---
title: Bun
tags: [bun, javascript, runtime, fast, performance, typescript, bundler]
---

# Bun

Bun is an all-in-one JavaScript runtime, package manager, bundler, and test runner designed for speed. Created by Jarred Sumner in 2022, Bun aims to be a drop-in replacement for [Node.js](/content/runtimes/nodejs) while being significantly faster. Built with Zig and powered by JavaScriptCore (Safari's engine), Bun represents the cutting edge of JavaScript runtime performance.

## What is Bun?

Bun is a **fast, all-in-one toolkit** for JavaScript and [TypeScript](/content/languages/typescript):

```javascript
// server.ts - TypeScript works natively!
Bun.serve({
  port: 3000,
  fetch(request) {
    return new Response("Hello from Bun!");
  },
});

console.log("Server running on http://localhost:3000");
```

Run with: `bun server.ts` (no compilation needed!)

**Key Features:**
- **Extremely fast**: 3-10x faster than Node.js
- **Native TypeScript**: No configuration needed
- **Built-in bundler**: No webpack or esbuild needed
- **Built-in test runner**: No Jest needed
- **npm-compatible**: Works with existing packages
- **Web APIs**: fetch, Response, etc. built-in

## Why Bun?

### 1. Speed

Bun is **significantly faster** than [Node.js](/content/runtimes/nodejs):

**Starting a server:**
- Bun: ~10ms
- Node.js: ~30-50ms

**Package installation:**
- `bun install`: ~2 seconds (500 packages)
- `pnpm install`: ~15 seconds
- `npm install`: ~45 seconds

**HTTP requests/sec:**
- Bun: ~250,000
- Node.js: ~100,000

### 2. All-in-One

No need for separate tools:

```bash
# Node.js ecosystem
npm install          # Package manager
tsc                  # TypeScript compiler
webpack              # Bundler
jest                 # Test runner

# Bun - everything built-in
bun install          # Package manager
bun run file.ts      # TypeScript support
bun build           # Bundler
bun test            # Test runner
```

### 3. Native TypeScript

No configuration needed:

```typescript
// types.ts
interface User {
  id: number;
  name: string;
  email: string;
}

export const getUser = async (id: number): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

// Just run it!
// bun run types.ts
```

### 4. Web Standard APIs

Uses modern Web APIs instead of Node.js APIs:

```javascript
// Fetch API (built-in, no node-fetch needed)
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// Web Streams
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue('Hello ');
    controller.enqueue('World!');
    controller.close();
  },
});

// Response API
return new Response('Hello', {
  headers: { 'Content-Type': 'text/plain' },
});
```

### 5. Drop-in Replacement

Most Node.js code works in Bun:

```javascript
// Works in both Node.js and Bun
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000);
```

## HTTP Server

Bun's native server is much faster than Node.js:

```javascript
// Simple server
Bun.serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return new Response('Home page');
    }

    if (url.pathname === '/api/users') {
      return Response.json({ users: ['Alice', 'Bob'] });
    }

    return new Response('Not Found', { status: 404 });
  },
});
```

### With Routing

```javascript
Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);

    // JSON API
    if (url.pathname === '/api/users') {
      const users = await database.getUsers();
      return Response.json(users);
    }

    // File serving
    if (url.pathname === '/static/image.png') {
      const file = Bun.file('./public/image.png');
      return new Response(file);
    }

    // HTML
    return new Response(`
      <html>
        <body><h1>Welcome</h1></body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  },
});
```

### WebSocket Support

```javascript
Bun.serve({
  port: 3000,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return; // WebSocket upgraded
    }
    return new Response('HTTP response');
  },
  websocket: {
    message(ws, message) {
      console.log('Received:', message);
      ws.send('Echo: ' + message);
    },
    open(ws) {
      console.log('Client connected');
    },
    close(ws) {
      console.log('Client disconnected');
    },
  },
});
```

## File System

Bun has optimized file APIs:

```javascript
// Read file
const file = Bun.file('package.json');
const text = await file.text();
const json = await file.json();
const buffer = await file.arrayBuffer();

// Write file
await Bun.write('output.txt', 'Hello World');
await Bun.write('data.json', JSON.stringify({ key: 'value' }));

// Check if file exists
const exists = await Bun.file('file.txt').exists();

// File info
const file = Bun.file('file.txt');
console.log(file.size);
console.log(file.type);
```

### Streaming Files

```javascript
const file = Bun.file('large-file.txt');

// Stream to response
return new Response(file);

// Stream with transformation
const stream = file.stream();
const reader = stream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Process chunk
  console.log(value);
}
```

## Package Manager

Bun's package manager is **much faster** than npm:

```bash
# Install dependencies (from package.json)
bun install

# Add packages
bun add react
bun add -d typescript
bun add --global typescript

# Remove packages
bun remove react

# Update packages
bun update

# Run scripts
bun run dev
bun run build
```

### Lock File

Bun uses `bun.lockb` (binary format, faster than text):

```bash
# Regenerate lockfile
bun install --force

# No lockfile
bun install --no-save
```

### Workspaces

```json
// package.json
{
  "workspaces": ["packages/*"],
  "dependencies": {
    "react": "^18.0.0"
  }
}
```

```bash
# Install all workspace dependencies
bun install

# Run script in specific workspace
bun run --filter @myapp/web dev
```

## Bundler

Build-in bundler (no webpack needed):

```bash
# Bundle for browser
bun build ./src/index.tsx --outdir ./dist

# Bundle for Node.js
bun build ./src/server.ts --target node

# Minify
bun build ./src/index.tsx --minify --outfile bundle.js

# Watch mode
bun build ./src/index.tsx --watch
```

### Configuration

```javascript
// bunfig.toml
[build]
target = "browser"
minify = true
sourcemap = "external"
```

### Programmatic API

```javascript
const result = await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  target: 'browser',
  minify: true,
  splitting: true,
  sourcemap: 'external',
});

if (!result.success) {
  console.error('Build failed');
  for (const message of result.logs) {
    console.error(message);
  }
}
```

## Test Runner

Built-in test runner (no Jest needed):

```typescript
// math.test.ts
import { expect, test, describe } from 'bun:test';

describe('Math operations', () => {
  test('addition', () => {
    expect(2 + 2).toBe(4);
  });

  test('subtraction', () => {
    expect(5 - 3).toBe(2);
  });

  test('async test', async () => {
    const result = await fetchData();
    expect(result).toBeDefined();
  });
});
```

Run tests: `bun test`

### Mocking

```typescript
import { test, expect, mock } from 'bun:test';

test('mock function', () => {
  const mockFn = mock((a, b) => a + b);

  mockFn(1, 2);
  expect(mockFn).toHaveBeenCalledWith(1, 2);
  expect(mockFn).toHaveBeenCalledTimes(1);
});
```

### Snapshots

```typescript
import { test, expect } from 'bun:test';

test('snapshot', () => {
  const data = {
    user: 'Alice',
    age: 25,
  };

  expect(data).toMatchSnapshot();
});
```

## Database Support

### SQLite (Built-in)

```javascript
import { Database } from 'bun:sqlite';

const db = new Database('mydb.sqlite');

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT
  )
`);

// Insert
const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
insert.run('Alice', 'alice@example.com');

// Query
const query = db.prepare('SELECT * FROM users WHERE name = ?');
const user = query.get('Alice');

// All rows
const allUsers = db.prepare('SELECT * FROM users').all();
```

### PostgreSQL (with pg)

```javascript
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  user: 'user',
  password: 'password',
});

const result = await pool.query('SELECT * FROM users');
console.log(result.rows);
```

## Environment Variables

```javascript
// .env
DATABASE_URL=postgresql://localhost/mydb
API_KEY=secret123

// Access env vars (automatically loaded)
const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.API_KEY;

// Or use Bun.env
const dbUrl = Bun.env.DATABASE_URL;
```

## Using with Frameworks

### [React](/content/frameworks/react)

```bash
# Create React app with Vite
bun create vite my-app --template react-ts
cd my-app
bun install
bun run dev
```

### [Next.js](/content/frameworks/nextjs)

```bash
# Create Next.js app
bun create next-app my-app
cd my-app
bun install
bun run dev
```

### Express

```javascript
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Express on Bun!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

Run: `bun run server.js`

### Elysia (Bun-native framework)

```typescript
import { Elysia } from 'elysia';

new Elysia()
  .get('/', () => 'Hello Elysia')
  .get('/users/:id', ({ params }) => {
    return { id: params.id };
  })
  .post('/users', async ({ body }) => {
    // Type-safe body
    return { created: body };
  })
  .listen(3000);
```

## Bun vs Node.js

| Feature | Bun | [Node.js](/content/runtimes/nodejs) |
|---------|-----|---------|
| **Engine** | JavaScriptCore | V8 |
| **Speed** | Excellent (3x faster) | Good |
| **Startup Time** | ~10ms | ~30-50ms |
| **TypeScript** | Native | Via ts-node |
| **Package Install** | Very fast | Slow (npm) |
| **Bundler** | Built-in | Separate (webpack) |
| **Test Runner** | Built-in | Separate (Jest) |
| **Maturity** | New (2022) | Very mature (2009) |
| **Ecosystem** | npm-compatible | Native npm |
| **Production Ready** | Improving | Yes |
| **Best For** | Performance | Stability |

## Compatibility

### Works Great

- Most npm packages
- Express, Fastify
- React, Vue, Svelte
- Prisma, TypeORM
- Jest-compatible tests

### Limitations

- Some Node.js native modules (improving)
- Some packages that use Node.js internals
- Not all npm packages tested

## Deployment

### Docker

```dockerfile
FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

EXPOSE 3000
CMD ["bun", "run", "server.ts"]
```

### Fly.io

```toml
# fly.toml
[build]
  dockerfile = "Dockerfile"

[[services]]
  internal_port = 3000
  protocol = "tcp"
```

### Railway

```bash
# Railway automatically detects Bun
railway up
```

## Performance Tips

### 1. Use Bun.file for Static Files

```javascript
// ✓ Fast - uses system calls
const file = Bun.file('./public/image.png');
return new Response(file);

// ❌ Slower - reads entire file
const content = await fs.readFile('./public/image.png');
return new Response(content);
```

### 2. Use Bun.serve Instead of Express

```javascript
// ✓ Faster - native Bun server
Bun.serve({
  fetch(req) {
    return new Response('Hello');
  },
});

// ❌ Slower - Express adds overhead
app.listen(3000);
```

### 3. Use Built-in APIs

```javascript
// ✓ Fast - built-in
const response = await fetch(url);

// ❌ Slower - npm package
const axios = require('axios');
const response = await axios.get(url);
```

## Migration from Node.js

### Step 1: Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### Step 2: Replace npm/pnpm

```bash
# Remove node_modules and lock files
rm -rf node_modules package-lock.json

# Install with Bun
bun install
```

### Step 3: Update Scripts

```json
// package.json
{
  "scripts": {
    "dev": "bun run server.ts",
    "build": "bun build src/index.ts",
    "test": "bun test"
  }
}
```

### Step 4: Test

```bash
bun run dev
bun test
```

## Should You Use Bun?

### Use Bun if:

- **Starting a new project**
- **Performance is important**
- **You want TypeScript** without configuration
- **You're okay with newer tech**
- **Building APIs or tools**

### Stick with Node.js if:

- **Production-critical app**
- **Need maximum stability**
- **Using Node.js-specific packages**
- **Team isn't ready** for new tech
- **Enterprise environment**

## Key Takeaways

- **3-10x faster** than Node.js for many tasks
- **All-in-one** toolkit (runtime, bundler, test runner)
- **Native TypeScript** support
- **npm-compatible** but with faster package installation
- **Web standard APIs** (fetch, Response, etc.)
- **Still maturing** but production-ready for many use cases
- **Great for** new projects prioritizing performance

## Related Topics

- [Node.js](/content/runtimes/nodejs) - Mature alternative
- [Deno](/content/runtimes/deno) - Security-focused alternative
- [JavaScript Runtimes Overview](/content/runtimes/javascript-runtimes) - Compare all runtimes
- [TypeScript](/content/languages/typescript) - Works natively in Bun
- [React](/content/frameworks/react) - Build UIs with Bun
- [Next.js](/content/frameworks/nextjs) - Full-stack framework that works with Bun

Bun represents the future of JavaScript runtimes with its focus on speed and developer experience. While it's newer than Node.js, it's stable enough for production use in many scenarios. If you're starting a new project and prioritize performance, Bun is an excellent choice.
