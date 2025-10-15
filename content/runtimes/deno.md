---
title: Deno
tags: [deno, javascript, typescript, runtime, security, modern, web-standards]
---

# Deno

Deno is a secure runtime for JavaScript and [TypeScript](/content/languages/typescript) created by Ryan Dahl, the original creator of [Node.js](/content/runtimes/nodejs). Released in 2020, Deno was built to address the design mistakes Dahl identified in Node.js after a decade of experience. Deno emphasizes security, modern JavaScript, and developer experience while remaining compatible with Node.js packages.

## What is Deno?

Deno is a **secure-by-default** JavaScript/TypeScript runtime:

```typescript
// server.ts - TypeScript works natively!
Deno.serve((req: Request) => {
  return new Response("Hello from Deno!");
});

console.log("Server running on http://localhost:8000");
```

Run with: `deno run --allow-net server.ts`

**Key Features:**
- **Security-first**: Explicit permissions required
- **Native TypeScript**: No configuration needed
- **Web standard APIs**: fetch, URL, etc. built-in
- **No package.json**: URL imports instead
- **Single executable**: Includes formatter, linter, test runner
- **Node.js compatible**: Can use npm packages

## Why Deno?

### 1. Security by Default

Deno requires explicit permission for everything:

```bash
# ❌ This will fail - no permissions
deno run server.ts

# ✓ Grant network access
deno run --allow-net server.ts

# ✓ Grant file read access
deno run --allow-read server.ts

# ✓ Grant multiple permissions
deno run --allow-net --allow-read --allow-write server.ts

# ✓ Grant all permissions (like Node.js)
deno run -A server.ts
```

**Permission types:**
- `--allow-read`: File system read
- `--allow-write`: File system write
- `--allow-net`: Network access
- `--allow-env`: Environment variables
- `--allow-run`: Spawn subprocesses
- `--allow-all` / `-A`: All permissions

### 2. No package.json or node_modules

Import directly from URLs:

```typescript
// Import from URL
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { assertEquals } from "https://deno.land/std@0.200.0/testing/asserts.ts";

// Import from npm (Deno 1.28+)
import express from "npm:express@4";
```

**Advantages:**
- No `node_modules` folder
- Explicit versioning in imports
- Code is cached locally
- No package manager needed (but available)

### 3. Native TypeScript

Zero configuration needed:

```typescript
// types.ts - just works!
interface User {
  id: number;
  name: string;
  email: string;
}

export async function getUser(id: number): Promise<User> {
  const response = await fetch(`https://api.example.com/users/${id}`);
  return response.json();
}

const user = await getUser(1);
console.log(user.name);
```

Run: `deno run --allow-net types.ts`

### 4. Built-in Tools

Everything included:

```bash
# Format code
deno fmt

# Lint code
deno lint

# Run tests
deno test

# Bundle code
deno bundle

# Compile to executable
deno compile server.ts

# Install scripts globally
deno install --allow-net --allow-read https://deno.land/std/http/file_server.ts

# Documentation generator
deno doc
```

### 5. Web Standard APIs

Uses modern Web APIs:

```typescript
// Fetch API (built-in)
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

// URL API
const url = new URL('https://example.com/path?query=value');
console.log(url.searchParams.get('query'));

// FormData
const formData = new FormData();
formData.append('name', 'Alice');
```

## HTTP Server

### Basic Server

```typescript
Deno.serve((req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === '/') {
    return new Response('Home page');
  }

  if (url.pathname === '/api/users') {
    return Response.json({ users: ['Alice', 'Bob'] });
  }

  return new Response('Not Found', { status: 404 });
});
```

### Custom Port

```typescript
Deno.serve({ port: 3000 }, (req) => {
  return new Response('Hello on port 3000');
});
```

### With Router

```typescript
import { Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();

router
  .get('/', (ctx) => {
    ctx.response.body = 'Home';
  })
  .get('/users/:id', (ctx) => {
    ctx.response.body = `User ${ctx.params.id}`;
  })
  .post('/users', async (ctx) => {
    const body = await ctx.request.body().value;
    ctx.response.body = { created: body };
  });
```

## File System

### Reading Files

```typescript
// Read as text
const text = await Deno.readTextFile('file.txt');

// Read as bytes
const data = await Deno.readFile('file.txt');

// Read directory
for await (const entry of Deno.readDir('./')) {
  console.log(entry.name, entry.isFile, entry.isDirectory);
}

// File info
const fileInfo = await Deno.stat('file.txt');
console.log(fileInfo.size, fileInfo.mtime);
```

### Writing Files

```typescript
// Write text file
await Deno.writeTextFile('output.txt', 'Hello World');

// Write bytes
const encoder = new TextEncoder();
await Deno.writeFile('output.txt', encoder.encode('Hello'));

// Append to file
await Deno.writeTextFile('log.txt', 'New line\n', { append: true });
```

### File Operations

```typescript
// Copy file
await Deno.copyFile('source.txt', 'dest.txt');

// Remove file
await Deno.remove('file.txt');

// Remove directory (recursive)
await Deno.remove('directory', { recursive: true });

// Create directory
await Deno.mkdir('new-directory', { recursive: true });
```

## URL Imports

### Importing Modules

```typescript
// Standard library
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { parse } from "https://deno.land/std@0.200.0/flags/mod.ts";

// Third-party modules (from deno.land/x)
import { Application } from "https://deno.land/x/oak@v12.0.0/mod.ts";

// From GitHub
import { foo } from "https://raw.githubusercontent.com/user/repo/main/mod.ts";

// From npm
import express from "npm:express@4";
import React from "npm:react@18";
```

### Import Maps

Use import maps to simplify imports:

```json
// import_map.json
{
  "imports": {
    "std/": "https://deno.land/std@0.200.0/",
    "oak": "https://deno.land/x/oak@v12.0.0/mod.ts",
    "react": "npm:react@18"
  }
}
```

```typescript
// Use short names
import { serve } from "std/http/server.ts";
import { Application } from "oak";
import React from "react";
```

Run with: `deno run --import-map=import_map.json server.ts`

### deno.json Configuration

```json
{
  "imports": {
    "std/": "https://deno.land/std@0.200.0/",
    "@/": "./src/"
  },
  "tasks": {
    "dev": "deno run --watch --allow-net server.ts",
    "start": "deno run --allow-net server.ts"
  },
  "fmt": {
    "useTabs": false,
    "lineWidth": 100
  },
  "lint": {
    "rules": {
      "tags": ["recommended"]
    }
  }
}
```

## Testing

Built-in test runner:

```typescript
// math_test.ts
import { assertEquals, assertThrows } from "https://deno.land/std@0.200.0/testing/asserts.ts";

Deno.test("addition", () => {
  assertEquals(2 + 2, 4);
});

Deno.test("subtraction", () => {
  assertEquals(5 - 3, 2);
});

Deno.test("async test", async () => {
  const result = await fetchData();
  assertEquals(result.status, "ok");
});

Deno.test("error test", () => {
  assertThrows(
    () => {
      throw new Error("Error!");
    },
    Error,
    "Error!"
  );
});
```

Run tests: `deno test`

### Test Options

```bash
# Run specific test file
deno test math_test.ts

# Watch mode
deno test --watch

# Coverage
deno test --coverage=cov_profile
deno coverage cov_profile

# Filter tests
deno test --filter "addition"
```

## npm Compatibility

Deno can use npm packages:

```typescript
// Import from npm:
import express from "npm:express@4";
import React from "npm:react@18";
import { PrismaClient } from "npm:@prisma/client";

// Use like normal
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Express in Deno!');
});

app.listen(3000);
```

### Node.js Compatibility Layer

```typescript
// Import Node.js built-ins
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

// Use Node.js APIs
const data = readFileSync('file.txt', 'utf8');
const server = createServer((req, res) => {
  res.end('Hello');
});
```

## Database Support

### PostgreSQL

```typescript
import { Client } from "https://deno.land/x/postgres/mod.ts";

const client = new Client({
  user: "user",
  database: "test",
  hostname: "localhost",
  port: 5432,
});

await client.connect();

const result = await client.queryArray("SELECT * FROM users");
console.log(result.rows);

await client.end();
```

### SQLite

```typescript
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("test.db");

db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT
  )
`);

db.query("INSERT INTO users (name, email) VALUES (?, ?)", ["Alice", "alice@example.com"]);

const users = db.query("SELECT * FROM users");
for (const [id, name, email] of users) {
  console.log({ id, name, email });
}

db.close();
```

### MongoDB

```typescript
import { MongoClient } from "npm:mongodb@6";

const client = new MongoClient("mongodb://localhost:27017");
await client.connect();

const db = client.db("mydb");
const users = db.collection("users");

await users.insertOne({ name: "Alice", email: "alice@example.com" });

const allUsers = await users.find({}).toArray();
console.log(allUsers);
```

## Environment Variables

```bash
# .env
DATABASE_URL=postgresql://localhost/mydb
API_KEY=secret123
```

```typescript
// Load .env file
import "https://deno.land/std@0.200.0/dotenv/load.ts";

// Access variables
const dbUrl = Deno.env.get("DATABASE_URL");
const apiKey = Deno.env.get("API_KEY");

// Or set programmatically
Deno.env.set("KEY", "value");
```

## Frameworks

### Oak (Express-like)

```typescript
import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();

router
  .get('/', (ctx) => {
    ctx.response.body = 'Home';
  })
  .get('/users/:id', (ctx) => {
    ctx.response.body = `User ${ctx.params.id}`;
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 3000 });
```

### Fresh (Full-stack framework)

```bash
# Create Fresh app
deno run -A -r https://fresh.deno.dev
cd my-app
deno task start
```

```typescript
// routes/index.tsx
import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div>
        <h1>Welcome to Fresh!</h1>
      </div>
    </>
  );
}
```

## WebAssembly

Run WebAssembly in Deno:

```typescript
const wasmCode = await Deno.readFile("./add.wasm");
const wasmModule = new WebAssembly.Module(wasmCode);
const wasmInstance = new WebAssembly.Instance(wasmModule);

const add = wasmInstance.exports.add as (a: number, b: number) => number;
console.log(add(5, 3)); // 8
```

## Deployment

### Deno Deploy

```bash
# Install deployctl
deno install --allow-all --no-check -r -f https://deno.land/x/deploy/deployctl.ts

# Deploy
deployctl deploy --project=my-project server.ts
```

Or use GitHub integration for automatic deployments.

### Docker

```dockerfile
FROM denoland/deno:1.38.0

WORKDIR /app

# Cache dependencies
COPY deps.ts .
RUN deno cache deps.ts

# Copy application
COPY . .
RUN deno cache server.ts

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-env", "server.ts"]
```

### Traditional Server

```bash
# Compile to executable
deno compile --allow-net --output server server.ts

# Upload and run
./server
```

## Deno vs Node.js vs Bun

| Feature | Deno | [Node.js](/content/runtimes/nodejs) | [Bun](/content/runtimes/bun) |
|---------|------|---------|-----|
| **Security** | Permissions required | Full access | Full access |
| **TypeScript** | Native | Via ts-node | Native |
| **Package Manager** | URL imports | npm | Built-in (fast) |
| **Std Library** | Excellent | Good | Good |
| **Ecosystem** | Growing | Huge | Growing |
| **Performance** | Good | Good | Excellent |
| **Node Compat** | Yes (via npm:) | Native | Yes |
| **Best For** | Security, TypeScript | Production | Performance |

## Migrating from Node.js

### Step 1: Install Deno

```bash
curl -fsSL https://deno.land/install.sh | sh
```

### Step 2: Convert Imports

```typescript
// Node.js
const express = require('express');
const fs = require('fs');

// Deno
import express from "npm:express@4";
import { readFile } from "node:fs/promises";

// Or use Deno APIs
import { readTextFile } from "https://deno.land/std/fs/mod.ts";
```

### Step 3: Update File Operations

```typescript
// Node.js
const fs = require('fs').promises;
await fs.readFile('file.txt', 'utf8');

// Deno
await Deno.readTextFile('file.txt');
```

### Step 4: Add Permissions

```bash
# Node.js
node server.js

# Deno
deno run --allow-net --allow-read server.ts
```

## Best Practices

### 1. Pin Versions in URLs

```typescript
// ✓ Good - pinned version
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";

// ❌ Bad - unpinned (breaks when updated)
import { serve } from "https://deno.land/std/http/server.ts";
```

### 2. Use deps.ts for Centralized Imports

```typescript
// deps.ts
export { serve } from "https://deno.land/std@0.200.0/http/server.ts";
export { Application } from "https://deno.land/x/oak@v12.0.0/mod.ts";

// server.ts
import { serve, Application } from "./deps.ts";
```

### 3. Minimize Permissions

```bash
# ✓ Good - only what's needed
deno run --allow-net=:8000 --allow-read=./public server.ts

# ❌ Bad - too permissive
deno run -A server.ts
```

### 4. Use deno.json for Configuration

```json
{
  "tasks": {
    "dev": "deno run --watch --allow-net server.ts",
    "start": "deno run --allow-net server.ts",
    "test": "deno test --allow-net"
  }
}
```

Run: `deno task dev`

## Key Takeaways

- **Security-first** with explicit permissions
- **Native TypeScript** with zero configuration
- **No package.json** or node_modules (URL imports)
- **Built-in tooling** (formatter, linter, test runner)
- **Web standard APIs** (fetch, URL, etc.)
- **npm compatible** for existing packages
- **Great for** TypeScript projects and security-conscious apps

## Related Topics

- [Node.js](/content/runtimes/nodejs) - Original JavaScript runtime
- [Bun](/content/runtimes/bun) - Performance-focused alternative
- [JavaScript Runtimes Overview](/content/runtimes/javascript-runtimes) - Compare all runtimes
- [TypeScript](/content/languages/typescript) - Works natively in Deno
- [Serverless & Edge](/content/runtimes/serverless-edge) - Deploy Deno to the edge

Deno represents a modern, secure approach to JavaScript runtimes. While its ecosystem is smaller than Node.js, its focus on security, TypeScript, and web standards makes it an excellent choice for new projects, especially those prioritizing type safety and security.
