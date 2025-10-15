---
title: "@logan/logger - Flexible Logging Utility"
tags: [logger, logging, winston, console, typescript]
---

# @logan/logger

Flexible logging utility with automatic Winston detection and console fallback. Write logs once, use Winston if available, fallback to console if not.

## Features

- **Auto-detection**: Automatically uses Winston if installed, console otherwise
- **TypeScript**: Full type safety with TypeScript definitions
- **Zero config**: Works out of the box with sensible defaults
- **Lightweight**: Minimal dependencies
- **Log levels**: debug, info, warn, error support
- **Structured logging**: Support for metadata objects
- **Production ready**: Tested and used in production

## Installation

### NPM
```bash
npm install @logan/logger
```

### pnpm
```bash
pnpm add @logan/logger
```

### JSR
```bash
npx jsr add @logan/logger
```

## Quick Start

### Basic Logging
```typescript
import { logger } from '@logan/logger';

logger.info('Application started');
logger.warn('Low disk space');
logger.error('Failed to connect to database');
logger.debug('Request details', { method: 'GET', path: '/api/users' });
```

### With Winston (Automatic)
If Winston is installed, it's automatically used:

```bash
pnpm add winston
```

```typescript
import { logger } from '@logan/logger';

// Automatically uses Winston
logger.info('Using Winston logger');
logger.error('Error with Winston', { stack: error.stack });
```

### Without Winston (Console Fallback)
If Winston is not installed, logs to console:

```typescript
import { logger } from '@logan/logger';

// Automatically uses console
logger.info('Using console logger');
logger.warn('Warning with console');
```

## API Reference

### logger.info
Log informational messages.

```typescript
logger.info(message: string, metadata?: object): void
```

**Examples:**
```typescript
logger.info('Server started');
logger.info('User logged in', { userId: '123', email: 'user@example.com' });
```

### logger.warn
Log warning messages.

```typescript
logger.warn(message: string, metadata?: object): void
```

**Examples:**
```typescript
logger.warn('API rate limit approaching');
logger.warn('Deprecated function used', { function: 'oldMethod' });
```

### logger.error
Log error messages.

```typescript
logger.error(message: string, metadata?: object): void
```

**Examples:**
```typescript
logger.error('Database connection failed');
logger.error('Request failed', { error: error.message, stack: error.stack });
```

### logger.debug
Log debug messages (only in development).

```typescript
logger.debug(message: string, metadata?: object): void
```

**Examples:**
```typescript
logger.debug('Request received', { method: 'POST', body: requestBody });
logger.debug('Cache hit', { key: 'user:123', ttl: 300 });
```

## Log Levels

### Hierarchy
```
error > warn > info > debug
```

### Production Mode
In production (NODE_ENV=production), only error, warn, and info are logged. Debug logs are suppressed.

### Development Mode
In development, all log levels including debug are logged.

```typescript
// Development
logger.debug('This will be logged');

// Production
logger.debug('This will be suppressed');
```

## Winston Integration

### Automatic Detection
The logger automatically detects if Winston is available:

```typescript
// Implementation
let winstonLogger: any = null;

try {
  const winston = await import('winston');
  winstonLogger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });
} catch {
  // Winston not found, use console
}
```

### Custom Winston Config
If you want custom Winston configuration, import Winston directly:

```typescript
import winston from 'winston';
import { logger } from '@logan/logger';

// Custom Winston setup
const customLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Replace default logger (if needed)
// Note: @logan/logger uses its own instance
```

## Console Fallback

### Format
When using console fallback, logs are formatted with:

```
[LEVEL] Message { metadata }
```

**Examples:**
```
[logan-logger] [INFO] Server started
[logan-logger] [WARN] API rate limit approaching
[logan-logger] [ERROR] Database connection failed { code: 'ECONNREFUSED' }
```

### Implementation
```typescript
// Console fallback implementation
export const logger = {
  info(message: string, meta?: object) {
    console.log('[logan-logger] [INFO]', message, meta || '');
  },
  warn(message: string, meta?: object) {
    console.warn('[logan-logger] [WARN]', message, meta || '');
  },
  error(message: string, meta?: object) {
    console.error('[logan-logger] [ERROR]', message, meta || '');
  },
  debug(message: string, meta?: object) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[logan-logger] [DEBUG]', message, meta || '');
    }
  },
};
```

## Usage Patterns

### HTTP Request Logging
```typescript
import { logger } from '@logan/logger';

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info('HTTP request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
    });
  });

  next();
});
```

### Error Handling
```typescript
import { logger } from '@logan/logger';

try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    context: 'riskyOperation',
  });
  throw error;
}
```

### Database Operations
```typescript
import { logger } from '@logan/logger';

async function queryDatabase(sql: string) {
  logger.debug('Executing query', { sql });

  const start = Date.now();
  const result = await db.query(sql);
  const duration = Date.now() - start;

  logger.info('Query completed', {
    sql: sql.substring(0, 100),
    rows: result.rows.length,
    duration,
  });

  return result;
}
```

### API Calls
```typescript
import { logger } from '@logan/logger';

async function fetchData(url: string) {
  logger.debug('Fetching data', { url });

  try {
    const response = await fetch(url);

    logger.info('API call successful', {
      url,
      status: response.status,
      contentType: response.headers.get('content-type'),
    });

    return response.json();
  } catch (error) {
    logger.error('API call failed', {
      url,
      error: error.message,
    });
    throw error;
  }
}
```

### Background Jobs
```typescript
import { logger } from '@logan/logger';

async function processJob(job: Job) {
  logger.info('Job started', { jobId: job.id, type: job.type });

  try {
    await job.execute();

    logger.info('Job completed', {
      jobId: job.id,
      duration: job.duration,
    });
  } catch (error) {
    logger.error('Job failed', {
      jobId: job.id,
      error: error.message,
      attempts: job.attempts,
    });

    throw error;
  }
}
```

## Production Setup

### With Winston (Recommended)
```bash
pnpm add winston
```

```typescript
import { logger } from '@logan/logger';

// Automatically uses Winston with:
// - JSON format for parsing
// - Timestamp for each log
// - Console transport
// - File transport (if configured)

logger.info('Application started', { version: '1.0.0' });
```

### Log Files
To add file logging with Winston:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Add console in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### Log Rotation
```bash
pnpm add winston-daily-rotate-file
```

```typescript
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});
```

## TypeScript Support

### Type Definitions
```typescript
interface Logger {
  info(message: string, metadata?: object): void;
  warn(message: string, metadata?: object): void;
  error(message: string, metadata?: object): void;
  debug(message: string, metadata?: object): void;
}

declare const logger: Logger;
export { logger };
```

### Usage with Types
```typescript
import { logger } from '@logan/logger';

interface RequestMetadata {
  method: string;
  path: string;
  status: number;
  duration: number;
}

function logRequest(data: RequestMetadata): void {
  logger.info('HTTP request', data);
}
```

## Best Practices

### 1. Structured Logging
Always include relevant metadata:

```typescript
// ❌ Bad - minimal context
logger.error('Failed');

// ✅ Good - full context
logger.error('Database query failed', {
  query: sql,
  error: error.message,
  duration: elapsed,
  retries: attempts,
});
```

### 2. Appropriate Log Levels
Use the right level for each message:

```typescript
// debug - detailed info for debugging
logger.debug('Cache lookup', { key, hit: true });

// info - normal operations
logger.info('User logged in', { userId, timestamp });

// warn - potentially harmful situations
logger.warn('API rate limit reached', { endpoint, limit });

// error - error events
logger.error('Payment failed', { orderId, error });
```

### 3. Avoid Sensitive Data
Never log passwords, tokens, or PII:

```typescript
// ❌ Bad - leaks sensitive data
logger.info('User logged in', {
  email: user.email,
  password: user.password,  // Never log passwords!
});

// ✅ Good - only safe data
logger.info('User logged in', {
  userId: user.id,
  timestamp: Date.now(),
});
```

### 4. Performance Considerations
Avoid expensive operations in log statements:

```typescript
// ❌ Bad - expensive serialization
logger.debug('State', JSON.stringify(largeObject, null, 2));

// ✅ Good - only in debug mode
if (process.env.NODE_ENV !== 'production') {
  logger.debug('State', { keys: Object.keys(largeObject) });
}
```

## Comparison with Other Loggers

| Feature | @logan/logger | Winston | Pino | Bunyan |
|---------|---------------|---------|------|--------|
| Auto-detection | ✅ | ❌ | ❌ | ❌ |
| Zero config | ✅ | ❌ | ✅ | ❌ |
| Console fallback | ✅ | ❌ | ❌ | ❌ |
| Size | < 5KB | ~200KB | ~50KB | ~100KB |
| Speed | Fast | Fast | Fastest | Fast |
| TypeScript | ✅ | ✅ | ✅ | ✅ |

## Examples

### Express.js Middleware
```typescript
import express from 'express';
import { logger } from '@logan/logger';

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    logger.info('HTTP request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
    });
  });

  next();
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Express error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({ error: 'Internal server error' });
});

app.listen(3000, () => {
  logger.info('Server started', { port: 3000 });
});
```

### Astro API Route
```typescript
// src/pages/api/users.ts
import type { APIRoute } from 'astro';
import { logger } from '@logan/logger';

export const GET: APIRoute = async ({ request }) => {
  logger.info('API request', {
    endpoint: '/api/users',
    method: 'GET',
  });

  try {
    const users = await getUsers();

    logger.debug('Users fetched', { count: users.length });

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('Failed to fetch users', {
      error: error.message,
      stack: error.stack,
    });

    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### CLI Tool
```typescript
#!/usr/bin/env node
import { logger } from '@logan/logger';

async function main() {
  logger.info('CLI started');

  try {
    const result = await processFiles();

    logger.info('Processing complete', {
      filesProcessed: result.count,
      duration: result.duration,
    });

    process.exit(0);
  } catch (error) {
    logger.error('CLI failed', {
      error: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
}

main();
```

## Troubleshooting

### Logs not appearing
Check that you're using the correct log level:

```typescript
// Development - all levels
process.env.NODE_ENV = 'development';
logger.debug('This will appear');

// Production - info, warn, error only
process.env.NODE_ENV = 'production';
logger.debug('This will NOT appear');
logger.info('This will appear');
```

### Winston not detected
Ensure Winston is installed:

```bash
pnpm add winston
```

If still not working, check import:
```typescript
// Will use console fallback if Winston not found
import { logger } from '@logan/logger';
```

### TypeScript errors
Install type definitions:

```bash
pnpm add -D @types/node
```

## Resources

- **NPM**: [@logan/logger](https://www.npmjs.com/package/@logan/logger)
- **JSR**: [@logan/logger](https://jsr.io/@logan/logger)
- **Winston**: [github.com/winstonjs/winston](https://github.com/winstonjs/winston)
- **GitHub**: Create issues and contribute
