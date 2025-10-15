---
title: Node.js
tags: [nodejs, javascript, runtime, backend, server-side, npm, v8]
---

# Node.js

Node.js is a JavaScript runtime built on Chrome's V8 engine that allows you to run JavaScript on the server. Created by Ryan Dahl in 2009, Node.js revolutionized web development by enabling developers to use JavaScript for both frontend and backend code. It remains the most mature and widely-used JavaScript runtime for server-side development.

## What is Node.js?

Node.js is a **runtime environment** that executes JavaScript outside the browser:

```javascript
// server.js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js!');
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

Run with: `node server.js`

**Key Features:**
- **V8 Engine**: Same engine as Chrome
- **Event-driven**: Non-blocking I/O
- **Single-threaded**: Uses event loop for concurrency
- **npm**: Largest package ecosystem
- **Cross-platform**: Windows, macOS, Linux

## Why Node.js?

### 1. Massive Ecosystem (npm)

npm is the largest package registry in the world:

```bash
npm install express
npm install react
npm install lodash
```

**Stats:**
- 2.5+ million packages
- Billions of downloads per week
- Package for almost anything

### 2. JavaScript Everywhere

Use the same language for frontend and backend:

```javascript
// Shared code between frontend and backend
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Use in Node.js backend
const { validateEmail } = require('./validators');
if (!validateEmail(req.body.email)) {
  res.status(400).json({ error: 'Invalid email' });
}

// Use in React frontend
import { validateEmail } from './validators';
if (!validateEmail(email)) {
  setError('Invalid email');
}
```

### 3. Async/Non-blocking I/O

Handle many concurrent connections efficiently:

```javascript
const fs = require('fs').promises;

// Non-blocking file operations
async function readFiles() {
  try {
    const [file1, file2, file3] = await Promise.all([
      fs.readFile('file1.txt', 'utf8'),
      fs.readFile('file2.txt', 'utf8'),
      fs.readFile('file3.txt', 'utf8'),
    ]);
    console.log('All files read concurrently');
  } catch (error) {
    console.error(error);
  }
}
```

### 4. Industry Standard

Used by major companies:

- **Netflix**: Entire UI built on Node.js
- **LinkedIn**: Migrated from Ruby to Node.js
- **Uber**: Real-time platform
- **PayPal**: Backend services
- **NASA**: Mission control systems

### 5. Great for Real-time Applications

Perfect for WebSockets and real-time features:

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
```

## The Event Loop

Node.js uses a single-threaded event loop:

```javascript
console.log('1. Start');

setTimeout(() => {
  console.log('3. Timeout callback');
}, 0);

Promise.resolve().then(() => {
  console.log('2. Promise callback');
});

console.log('1. End');

// Output:
// 1. Start
// 1. End
// 2. Promise callback
// 3. Timeout callback
```

**How it works:**
1. Execute synchronous code
2. Process microtasks (Promises)
3. Process macrotasks (setTimeout, setInterval)
4. Repeat

## Core Modules

Node.js includes built-in modules:

### File System (fs)

```javascript
const fs = require('fs').promises;

// Read file
const content = await fs.readFile('file.txt', 'utf8');

// Write file
await fs.writeFile('output.txt', 'Hello World');

// Check if file exists
const exists = await fs.access('file.txt')
  .then(() => true)
  .catch(() => false);

// List directory
const files = await fs.readdir('./');
```

### HTTP/HTTPS

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello!' }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000);
```

### Path

```javascript
const path = require('path');

path.join('/users', 'john', 'documents');  // /users/john/documents
path.resolve('file.txt');  // Absolute path
path.extname('file.txt');  // .txt
path.basename('/path/to/file.txt');  // file.txt
path.dirname('/path/to/file.txt');  // /path/to
```

### OS

```javascript
const os = require('os');

os.platform();  // 'darwin', 'win32', 'linux'
os.cpus();      // CPU info
os.totalmem();  // Total memory
os.freemem();   // Free memory
os.homedir();   // Home directory
```

### Process

```javascript
// Environment variables
console.log(process.env.NODE_ENV);

// Command line arguments
console.log(process.argv);

// Exit
process.exit(0);

// Event handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});
```

## Package Management

### npm (Node Package Manager)

```bash
# Initialize project
npm init
npm init -y  # Skip questions

# Install packages
npm install express
npm install --save-dev nodemon
npm install -g typescript

# Install from package.json
npm install

# Update packages
npm update
npm outdated

# Remove packages
npm uninstall express

# Run scripts
npm run dev
npm test
```

### package.json

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0",
    "jest": "^29.0.0"
  }
}
```

### pnpm (Faster Alternative)

```bash
# Install pnpm
npm install -g pnpm

# Use like npm
pnpm install
pnpm add express
pnpm remove express
```

**Benefits:**
- 2-3x faster than npm
- Saves disk space (shared dependencies)
- Stricter dependency resolution

## Popular Node.js Frameworks

### Express

Minimal web framework:

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.post('/users', (req, res) => {
  const user = req.body;
  // Save user...
  res.status(201).json(user);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Fastify

High-performance alternative to Express:

```javascript
const fastify = require('fastify')();

fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

fastify.listen({ port: 3000 });
```

### NestJS

Enterprise framework with Angular-like structure:

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return ['user1', 'user2'];
  }
}
```

### Koa

From the Express team, uses async/await:

```javascript
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx) => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

## Working with Databases

### MongoDB (Mongoose)

```javascript
const mongoose = require('mongoose');

await mongoose.connect('mongodb://localhost/myapp');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  age: Number,
});

const User = mongoose.model('User', userSchema);

// Create
const user = await User.create({
  name: 'Alice',
  email: 'alice@example.com',
  age: 25,
});

// Find
const users = await User.find({ age: { $gt: 18 } });
const alice = await User.findOne({ email: 'alice@example.com' });

// Update
await User.updateOne({ _id: userId }, { age: 26 });

// Delete
await User.deleteOne({ _id: userId });
```

### PostgreSQL (Prisma)

```javascript
// schema.prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

// JavaScript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice',
  },
});

// Find
const users = await prisma.user.findMany({
  where: { email: { contains: 'example.com' } },
  include: { posts: true },
});

// Update
await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Alice Smith' },
});
```

## Environment Variables

```javascript
// .env
DATABASE_URL=postgresql://localhost/mydb
API_KEY=secret123
NODE_ENV=development

// Load with dotenv
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.API_KEY;
const isDev = process.env.NODE_ENV === 'development';
```

## Error Handling

### Try/Catch with Async/Await

```javascript
async function getUser(id) {
  try {
    const user = await database.findUser(id);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('User not found');
  }
}
```

### Express Error Middleware

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});
```

### Uncaught Errors

```javascript
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
```

## Testing

### Jest

```javascript
// sum.js
function sum(a, b) {
  return a + b;
}
module.exports = sum;

// sum.test.js
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('adds negative numbers', () => {
  expect(sum(-1, -2)).toBe(-3);
});
```

### Supertest (API Testing)

```javascript
const request = require('supertest');
const app = require('./app');

describe('GET /users', () => {
  it('responds with json', async () => {
    const response = await request(app)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveLength(2);
  });
});
```

## Performance Optimization

### Clustering

Use all CPU cores:

```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.id} died, restarting...`);
    cluster.fork();
  });
} else {
  // Worker process
  http.createServer((req, res) => {
    res.end('Hello from worker ' + cluster.worker.id);
  }).listen(3000);
}
```

### Caching

```javascript
const cache = new Map();

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  // Check cache
  if (cache.has(id)) {
    return res.json(cache.get(id));
  }

  // Fetch from database
  const user = await db.getUser(id);

  // Cache for 5 minutes
  cache.set(id, user);
  setTimeout(() => cache.delete(id), 5 * 60 * 1000);

  res.json(user);
});
```

### Compression

```javascript
const compression = require('compression');
const express = require('express');

const app = express();
app.use(compression());  // Gzip responses
```

## Node.js vs Alternatives

| Feature | Node.js | [Bun](/content/runtimes/bun) | [Deno](/content/runtimes/deno) |
|---------|---------|-----|------|
| **Engine** | V8 | JavaScriptCore | V8 |
| **Speed** | Good | Excellent | Good |
| **Maturity** | Very Mature | New | Moderate |
| **Ecosystem** | Huge (npm) | Growing | Moderate |
| **TypeScript** | Via ts-node | Native | Native |
| **Package Manager** | npm/pnpm/yarn | Built-in | URL imports |
| **Best For** | Production apps | Performance | TypeScript |

## Deployment

### Traditional Server

```bash
# Install Node.js on server
# Copy your code
# Install dependencies
npm install --production

# Start with PM2 (process manager)
npm install -g pm2
pm2 start app.js
pm2 startup  # Start on boot
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
```

### Cloud Platforms

- **Vercel**: `vercel deploy`
- **Heroku**: `git push heroku main`
- **AWS**: Elastic Beanstalk, Lambda
- **Google Cloud**: App Engine, Cloud Run
- **Azure**: App Service

## Common Pitfalls

### 1. Callback Hell

```javascript
// ❌ Bad - callback hell
fs.readFile('file1.txt', (err, data1) => {
  if (err) return console.error(err);
  fs.readFile('file2.txt', (err, data2) => {
    if (err) return console.error(err);
    fs.readFile('file3.txt', (err, data3) => {
      if (err) return console.error(err);
      console.log(data1, data2, data3);
    });
  });
});

// ✓ Good - async/await
try {
  const [data1, data2, data3] = await Promise.all([
    fs.promises.readFile('file1.txt'),
    fs.promises.readFile('file2.txt'),
    fs.promises.readFile('file3.txt'),
  ]);
  console.log(data1, data2, data3);
} catch (error) {
  console.error(error);
}
```

### 2. Blocking the Event Loop

```javascript
// ❌ Bad - blocks event loop
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

app.get('/fib/:n', (req, res) => {
  const result = fibonacci(Number(req.params.n));  // Blocks!
  res.json({ result });
});

// ✓ Good - offload to worker thread
const { Worker } = require('worker_threads');

app.get('/fib/:n', (req, res) => {
  const worker = new Worker('./fibonacci-worker.js');
  worker.postMessage(Number(req.params.n));
  worker.on('message', (result) => {
    res.json({ result });
  });
});
```

### 3. Not Handling Async Errors

```javascript
// ❌ Bad - unhandled promise rejection
app.get('/users', (req, res) => {
  database.getUsers()  // Returns promise
    .then(users => res.json(users));
  // Missing .catch()!
});

// ✓ Good - handle errors
app.get('/users', async (req, res, next) => {
  try {
    const users = await database.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});
```

## Key Takeaways

- **Most mature** JavaScript runtime
- **Huge ecosystem** with npm
- **Industry standard** for production
- **Event-driven** non-blocking I/O
- **Great for** real-time apps and APIs
- **Use pnpm** instead of npm for better performance
- **Consider alternatives** ([Bun](/content/runtimes/bun), [Deno](/content/runtimes/deno)) for new projects

## Related Topics

- [JavaScript Runtimes Overview](/content/runtimes/javascript-runtimes) - Compare all runtimes
- [Bun](/content/runtimes/bun) - Faster alternative to Node.js
- [Deno](/content/runtimes/deno) - Secure-by-default alternative
- [Serverless & Edge](/content/runtimes/serverless-edge) - Deploy Node.js serverlessly
- [TypeScript](/content/languages/typescript) - Add types to Node.js
- [Next.js](/content/frameworks/nextjs) - Full-stack framework using Node.js

Node.js revolutionized JavaScript development and remains the production-ready choice for server-side JavaScript. While newer runtimes like [Bun](/content/runtimes/bun) offer better performance, Node.js's maturity, ecosystem, and industry adoption make it the safe choice for most projects.
