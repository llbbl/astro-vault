---
title: "@logan/libsql-search - Semantic Search for LibSQL"
tags: [libsql, search, embeddings, vector-search, turso]
---

# @logan/libsql-search

Semantic vector search library for LibSQL and Turso databases. Add natural language search to your applications with automatic embedding generation and cosine similarity ranking.

## Features

- **Semantic search**: Natural language queries with vector embeddings
- **Multiple embedding providers**: Local (onnxruntime), Gemini, or OpenAI
- **LibSQL/Turso optimized**: Built specifically for LibSQL databases
- **TypeScript**: Full type safety with TypeScript definitions
- **Zero config**: Sensible defaults, works out of the box
- **Lightweight**: Minimal dependencies, small bundle size

## Installation

### NPM
```bash
npm install @logan/libsql-search @libsql/client
```

### pnpm
```bash
pnpm add @logan/libsql-search @libsql/client
```

### JSR
```bash
npx jsr add @logan/libsql-search
```

## Quick Start

### 1. Create Database Schema
```typescript
import { createClient } from '@libsql/client';
import { createTable } from '@logan/libsql-search';

const client = createClient({
  url: 'file:local.db'
});

// Create articles table with 768-dimension embeddings
await createTable(client, 'articles', 768);
```

### 2. Index Content
```typescript
import { indexContent } from '@logan/libsql-search';

const articles = [
  {
    title: 'Getting Started',
    content: 'Learn how to use libsql-search...',
    tags: ['tutorial', 'basics'],
  },
  {
    title: 'Advanced Features',
    content: 'Explore advanced search capabilities...',
    tags: ['advanced', 'features'],
  },
];

// Generate embeddings and insert into database
await indexContent(
  client,
  'articles',
  articles,
  'local',  // embedding provider
  768       // embedding dimension
);
```

### 3. Search Content
```typescript
import { searchArticles } from '@logan/libsql-search';

const results = await searchArticles(
  client,
  'articles',
  'how to get started',
  'local',
  10  // limit
);

console.log(results);
// [
//   {
//     title: 'Getting Started',
//     content: 'Learn how to use libsql-search...',
//     similarity: 0.89,
//     ...
//   },
//   ...
// ]
```

## API Reference

### createTable
Create a table with vector search support.

```typescript
function createTable(
  client: Client,
  tableName: string,
  dimension: number
): Promise<void>
```

**Parameters:**
- `client`: LibSQL client instance
- `tableName`: Name of the table to create
- `dimension`: Embedding dimension (768 for most models)

**Example:**
```typescript
await createTable(client, 'articles', 768);
```

**Generated Schema:**
```sql
CREATE TABLE IF NOT EXISTS articles (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  folder TEXT,
  tags TEXT,
  embedding F32_BLOB(768)
);

CREATE INDEX IF NOT EXISTS idx_articles_vector
ON articles (libsql_vector_idx(embedding));
```

### indexContent
Index content with automatic embedding generation.

```typescript
function indexContent(
  client: Client,
  tableName: string,
  articles: Article[],
  embeddingProvider: 'local' | 'gemini' | 'openai',
  dimension: number
): Promise<void>
```

**Parameters:**
- `client`: LibSQL client instance
- `tableName`: Table name to insert into
- `articles`: Array of articles to index
- `embeddingProvider`: Embedding provider to use
- `dimension`: Embedding dimension (768)

**Article Interface:**
```typescript
interface Article {
  slug: string;
  title: string;
  content: string;
  folder?: string;
  tags?: string[];
}
```

**Example:**
```typescript
await indexContent(
  client,
  'articles',
  [
    {
      slug: 'getting-started',
      title: 'Getting Started',
      content: 'Tutorial content...',
      folder: 'tutorials',
      tags: ['tutorial', 'basics'],
    }
  ],
  'local',
  768
);
```

### searchArticles
Perform semantic search on indexed content.

```typescript
function searchArticles(
  client: Client,
  tableName: string,
  query: string,
  embeddingProvider: 'local' | 'gemini' | 'openai',
  limit?: number
): Promise<SearchResult[]>
```

**Parameters:**
- `client`: LibSQL client instance
- `tableName`: Table name to search
- `query`: Natural language search query
- `embeddingProvider`: Embedding provider to use
- `limit`: Maximum number of results (default: 10)

**Returns:**
```typescript
interface SearchResult {
  slug: string;
  title: string;
  content: string;
  folder?: string;
  tags?: string;
  similarity: number;  // 0-1, higher is better
}
```

**Example:**
```typescript
const results = await searchArticles(
  client,
  'articles',
  'semantic search tutorial',
  'local',
  5
);

results.forEach(result => {
  console.log(`${result.title} (${(result.similarity * 100).toFixed(1)}%)`);
});
```

### getAllArticles
Retrieve all articles from the database.

```typescript
function getAllArticles(
  client: Client,
  tableName: string
): Promise<Article[]>
```

**Example:**
```typescript
const allArticles = await getAllArticles(client, 'articles');
console.log(`Total articles: ${allArticles.length}`);
```

### getArticleBySlug
Get a single article by its slug.

```typescript
function getArticleBySlug(
  client: Client,
  tableName: string,
  slug: string
): Promise<Article | null>
```

**Example:**
```typescript
const article = await getArticleBySlug(client, 'articles', 'getting-started');

if (article) {
  console.log(article.title);
}
```

### getArticlesByFolder
Get all articles in a specific folder.

```typescript
function getArticlesByFolder(
  client: Client,
  tableName: string,
  folder: string
): Promise<Article[]>
```

**Example:**
```typescript
const tutorials = await getArticlesByFolder(client, 'articles', 'tutorials');
console.log(`${tutorials.length} tutorials found`);
```

### getFolders
Get list of all unique folders.

```typescript
function getFolders(
  client: Client,
  tableName: string
): Promise<string[]>
```

**Example:**
```typescript
const folders = await getFolders(client, 'articles');
console.log('Folders:', folders);
// ['tutorials', 'guides', 'reference']
```

## Embedding Providers

### Local (onnxruntime)
Uses onnxruntime-node to run embeddings locally on CPU/GPU.

**Pros:**
- No API keys required
- No API rate limits
- Free forever
- Works offline
- Privacy-friendly (data stays local)

**Cons:**
- Slower than cloud providers
- Requires CPU/GPU resources
- Larger dependency size

**Setup:**
```typescript
import { indexContent } from '@logan/libsql-search';

await indexContent(
  client,
  'articles',
  articles,
  'local',  // provider
  768
);
```

### Gemini
Uses Google's Gemini API for embeddings.

**Pros:**
- Fast embedding generation
- High-quality embeddings
- Free tier available (1500 requests/day)

**Cons:**
- Requires API key
- Rate limits
- Network latency
- Data sent to Google

**Setup:**
```bash
# Set API key
export GEMINI_API_KEY=your_key_here
```

```typescript
await indexContent(
  client,
  'articles',
  articles,
  'gemini',
  768
);
```

### OpenAI
Uses OpenAI's text-embedding-3-small model.

**Pros:**
- Fast embedding generation
- High-quality embeddings
- Reliable API

**Cons:**
- Requires API key (paid)
- Rate limits
- Network latency
- Data sent to OpenAI

**Setup:**
```bash
# Set API key
export OPENAI_API_KEY=your_key_here
```

```typescript
await indexContent(
  client,
  'articles',
  articles,
  'openai',
  768
);
```

## Using with Turso

### Setup Turso Database
```bash
# Install Turso CLI
brew install tursodatabase/tap/turso

# Create database
turso db create my-search-db

# Get connection URL and token
turso db show my-search-db
```

### Connect to Turso
```typescript
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

### Index to Turso
```typescript
import { createTable, indexContent } from '@logan/libsql-search';

// Create schema
await createTable(client, 'articles', 768);

// Index content
await indexContent(client, 'articles', articles, 'local', 768);
```

### Search on Turso
```typescript
const results = await searchArticles(
  client,
  'articles',
  'search query',
  'local',
  10
);
```

## Performance

### Indexing Speed
| Provider | Articles/sec | Notes |
|----------|--------------|-------|
| Local | ~5-10 | CPU dependent |
| Gemini | ~20-50 | Network dependent |
| OpenAI | ~20-50 | Network dependent |

### Search Speed
| Database | Query time | Notes |
|----------|-----------|-------|
| Local libSQL | ~10-50ms | File system speed |
| Turso | ~50-200ms | Network latency |

### Optimization Tips

**1. Batch indexing:**
```typescript
// Index in batches of 100
const batchSize = 100;
for (let i = 0; i < articles.length; i += batchSize) {
  const batch = articles.slice(i, i + batchSize);
  await indexContent(client, 'articles', batch, 'local', 768);
}
```

**2. Cache embeddings:**
```typescript
const embeddingCache = new Map<string, number[]>();

function getCachedEmbedding(text: string): number[] | undefined {
  return embeddingCache.get(text);
}

function setCachedEmbedding(text: string, embedding: number[]): void {
  embeddingCache.set(text, embedding);
}
```

**3. Use indexes:**
```sql
-- Already created by createTable()
CREATE INDEX idx_articles_vector
ON articles (libsql_vector_idx(embedding));
```

## Advanced Usage

### Custom Table Schema
```typescript
// Create table with additional columns
await client.execute(`
  CREATE TABLE IF NOT EXISTS articles (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    folder TEXT,
    tags TEXT,
    author TEXT,
    created_at INTEGER,
    embedding F32_BLOB(768)
  )
`);
```

### Filtered Search
```typescript
// Search with SQL WHERE clause
const results = await client.execute({
  sql: `
    SELECT
      slug,
      title,
      content,
      vector_distance_cos(embedding, vector(?)) as similarity
    FROM articles
    WHERE folder = ?
    ORDER BY similarity
    LIMIT ?
  `,
  args: [queryEmbedding, 'tutorials', 10],
});
```

### Hybrid Search
Combine semantic search with full-text search:

```typescript
const results = await client.execute({
  sql: `
    SELECT
      slug,
      title,
      content,
      vector_distance_cos(embedding, vector(?)) as semantic_score,
      (title LIKE ? OR content LIKE ?) as text_match
    FROM articles
    WHERE text_match = 1
    ORDER BY semantic_score
    LIMIT ?
  `,
  args: [queryEmbedding, `%${query}%`, `%${query}%`, 10],
});
```

## TypeScript Types

```typescript
import type {
  Article,
  SearchResult,
  EmbeddingProvider,
} from '@logan/libsql-search';

interface Article {
  slug: string;
  title: string;
  content: string;
  folder?: string;
  tags?: string[];
}

interface SearchResult extends Article {
  similarity: number;
}

type EmbeddingProvider = 'local' | 'gemini' | 'openai';
```

## Examples

### Blog Search
```typescript
import { createClient } from '@libsql/client';
import {
  createTable,
  indexContent,
  searchArticles,
} from '@logan/libsql-search';

// Setup
const client = createClient({ url: 'file:blog.db' });
await createTable(client, 'posts', 768);

// Index blog posts
const posts = [
  {
    slug: 'first-post',
    title: 'My First Post',
    content: 'Welcome to my blog...',
    tags: ['intro', 'welcome'],
  },
  // ... more posts
];

await indexContent(client, 'posts', posts, 'local', 768);

// Search
const results = await searchArticles(
  client,
  'posts',
  'getting started with blogging',
  'local'
);
```

### Documentation Site
```typescript
// Index documentation pages
const docs = await fs.promises.readdir('./docs');

const articles = await Promise.all(
  docs.map(async (file) => {
    const content = await fs.promises.readFile(`./docs/${file}`, 'utf-8');
    const slug = file.replace('.md', '');

    return {
      slug,
      title: extractTitle(content),
      content,
      folder: path.dirname(file),
    };
  })
);

await indexContent(client, 'docs', articles, 'local', 768);
```

### Product Catalog
```typescript
interface Product {
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
}

const products: Product[] = [
  {
    slug: 'laptop-x1',
    name: 'Laptop X1',
    description: 'High-performance laptop with...',
    category: 'electronics',
    price: 999,
  },
  // ... more products
];

// Convert to Article format
const articles = products.map(p => ({
  slug: p.slug,
  title: p.name,
  content: p.description,
  folder: p.category,
}));

await indexContent(client, 'products', articles, 'local', 768);

// Search products
const results = await searchArticles(
  client,
  'products',
  'laptop for programming',
  'local'
);
```

## Troubleshooting

### "Module not found: onnxruntime-node"
Install onnxruntime-node for local embeddings:
```bash
pnpm add onnxruntime-node
```

### "API key not found"
Set environment variable for cloud providers:
```bash
export GEMINI_API_KEY=your_key
# or
export OPENAI_API_KEY=your_key
```

### "No results found"
Check that:
1. Content is indexed: `await getAllArticles(client, 'articles')`
2. Table exists: `await createTable(client, 'articles', 768)`
3. Embedding provider matches between indexing and search

### Slow search performance
1. Ensure vector index is created
2. Use Turso for edge-optimized searches
3. Limit result count
4. Cache frequently searched queries

## Resources

- **NPM**: [@logan/libsql-search](https://www.npmjs.com/package/@logan/libsql-search)
- **JSR**: [@logan/libsql-search](https://jsr.io/@logan/libsql-search)
- **GitHub**: Create issues and contribute
- **Turso Docs**: [docs.turso.tech](https://docs.turso.tech)
- **LibSQL**: [github.com/tursodatabase/libsql](https://github.com/tursodatabase/libsql)
