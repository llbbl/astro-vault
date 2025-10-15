---
title: AI Embeddings - How They Work
tags: [embeddings, ai, transformers, xenova, machine-learning]
---

# AI Embeddings - How They Work

AI embeddings are numerical representations of text that capture semantic meaning. They power semantic search by converting words, sentences, or documents into vectors (arrays of numbers) that machines can compare mathematically.

## What Are Embeddings?

### The Core Concept

Embeddings map text to points in high-dimensional space where similar meanings are close together:

```javascript
// Text → Vector (simplified to 3 dimensions for visualization)
"cat"    → [0.8, 0.2, 0.1]
"kitten" → [0.7, 0.3, 0.2]  // Close to "cat"
"dog"    → [0.6, 0.4, 0.1]  // Close to "cat" (both animals)
"car"    → [0.1, 0.2, 0.9]  // Far from "cat"

// In reality: 384-1536 dimensions
"cat" → [0.23, -0.45, 0.67, ..., 0.12]  // 768 numbers
```

### Why Vectors?

Vectors enable mathematical operations on meaning:

```javascript
// Distance between concepts
distance("cat", "kitten") = 0.15  // Very similar
distance("cat", "car")    = 0.92  // Very different

// Semantic operations
king - man + woman ≈ queen
Paris - France + Germany ≈ Berlin
```

## How Embeddings Are Generated

### Transformer Models

Modern embeddings use transformer neural networks trained on billions of text examples:

```
Input: "The cat sat on the mat"

1. Tokenization:
   ["The", "cat", "sat", "on", "the", "mat"]

2. Token Embeddings:
   Each word → initial vector

3. Transformer Layers (attention):
   - "cat" looks at context: "The ___ sat on"
   - Understands "cat" is subject, "sat" is action
   - Updates embedding based on surrounding words

4. Pooling (averaging):
   Combine token embeddings → single sentence embedding

Output: [0.123, -0.456, 0.789, ..., 0.234]  // 768 dimensions
```

### Training Process

Embeddings are trained to bring similar texts together:

```
Training data pairs:
✅ "search engine" ↔ "how to find information"  (similar)
❌ "search engine" ↔ "cooking pasta"           (different)

Loss function pushes similar pairs together:
distance(similar_pair) → minimize
distance(different_pair) → maximize

After training on billions of examples:
- Model learns language patterns
- Captures semantic relationships
- Understands synonyms, concepts
```

## Xenova Transformers

### What Is It?

Xenova Transformers is a JavaScript port of Hugging Face's Transformers library. It runs transformer models entirely in the browser or Node.js, enabling local embedding generation without API calls.

**Key Features:**
- Pure JavaScript/TypeScript
- Runs in browser and Node.js
- Uses ONNX Runtime for performance
- No server or API required
- Privacy-friendly (all processing local)

### Installation

```bash
npm install @xenova/transformers
# or
pnpm add @xenova/transformers
```

### Basic Usage

```typescript
import { pipeline } from '@xenova/transformers';

// Load embedding model (downloads ~90MB on first run)
const embedder = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2'
);

// Generate embedding
const text = "How do I deploy a web application?";
const output = await embedder(text, {
  pooling: 'mean',      // Average token embeddings
  normalize: true       // Normalize to unit length
});

// Result: Float32Array of 384 dimensions
const embedding = Array.from(output.data);
console.log(embedding);
// [0.123, -0.456, 0.789, ..., 0.234]
```

### Popular Models

| Model | Dimensions | Size | Speed | Quality |
|-------|------------|------|-------|---------|
| all-MiniLM-L6-v2 | 384 | 90 MB | Fast | Good |
| all-mpnet-base-v2 | 768 | 420 MB | Medium | Better |
| bge-small-en-v1.5 | 384 | 133 MB | Fast | Excellent |
| bge-base-en-v1.5 | 768 | 436 MB | Medium | Excellent |

### Batch Processing

Process multiple texts efficiently:

```typescript
const embedder = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2'
);

const texts = [
  "How to deploy a web application?",
  "Debugging JavaScript errors",
  "Best practices for async code"
];

// Generate embeddings for all texts at once
const embeddings = await Promise.all(
  texts.map(text => embedder(text, {
    pooling: 'mean',
    normalize: true
  }))
);

// Use embeddings
embeddings.forEach((output, i) => {
  console.log(`Text ${i}: ${texts[i]}`);
  console.log(`Embedding: [${Array.from(output.data).slice(0, 3).join(', ')}, ...]`);
});
```

## How Astro Vault Uses Embeddings

### Indexing Content

```typescript
// scripts/index-content.ts
import { indexContent } from '@logan/libsql-search';
import { getTursoClient } from '../src/lib/turso';

const client = getTursoClient();

// Articles from markdown files
const articles = [
  {
    slug: 'deployment-guide',
    title: 'How to Deploy Web Applications',
    content: 'Step-by-step guide to deploying...',
    tags: ['deployment', 'devops'],
  },
  // ... more articles
];

// Generate embeddings and store in database
// Uses Xenova Transformers under the hood
await indexContent(
  client,
  'articles',           // Table name
  articles,             // Content to index
  'local',              // Embedding provider (Xenova)
  768                   // Embedding dimensions
);
```

**What happens:**
1. Each article's text is sent to Xenova Transformers
2. Model generates 768-dimensional embedding vector
3. Vector stored in LibSQL database alongside article text
4. Vector index created for fast similarity search

### Searching

```typescript
// src/pages/api/search.json.ts
import { searchArticles } from '@logan/libsql-search';

// User searches: "how do I push my app to production?"
const query = "how do I push my app to production?";

// 1. Convert query to embedding (Xenova)
// 2. Search database for similar vectors (LibSQL)
const results = await searchArticles(
  client,
  'articles',
  query,
  'local',    // Use Xenova for embedding
  10          // Return top 10 results
);

// Results ranked by similarity:
// [
//   { title: "Deploying to Production", similarity: 0.89 },
//   { title: "CI/CD Pipeline Setup", similarity: 0.82 },
//   { title: "Docker Deployment Guide", similarity: 0.78 }
// ]
```

## Embedding Model Architecture

### Transformer Components

```
Input: "JavaScript async programming"

┌─────────────────────────────────────┐
│ 1. Tokenization                     │
│    ["JavaScript", "async", "programming"] │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 2. Token Embeddings                 │
│    [vec₁, vec₂, vec₃]               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 3. Self-Attention Layers (x6-12)   │
│    - Each token attends to others   │
│    - Captures context relationships  │
│    - Updates embeddings iteratively  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 4. Pooling Layer                    │
│    - Mean pool token embeddings     │
│    - Produces single vector         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 5. Normalization                    │
│    - Scale to unit length           │
│    - Enables cosine similarity      │
└─────────────────────────────────────┘
              ↓
    [0.23, -0.45, ..., 0.67]  // 768D
```

### Self-Attention Mechanism

How models understand context:

```javascript
// Sentence: "The bank by the river is steep"
// Word: "bank"

// Without context:
"bank" → [financial institution OR river edge]

// With self-attention:
"bank" pays attention to:
  "river" (high weight: 0.8)
  "steep" (high weight: 0.6)
  "The"   (low weight: 0.1)

// Result: "bank" embedding emphasizes river edge meaning
// Different from "bank" in "I went to the bank to deposit money"
```

## Advanced: Model Fine-Tuning

### Why Fine-Tune?

Pre-trained models are general-purpose. Fine-tuning specializes them:

```javascript
// General model
query: "exception handling"
results: "error handling", "try-catch", "debugging"  // Good

// Fine-tuned for docs
query: "exception handling"
results: "error handling patterns", "exception hierarchy",
        "custom exceptions"  // Better - understands your domain
```

### Fine-Tuning Process

```typescript
// 1. Prepare training pairs (similar documents)
const trainingData = [
  {
    anchor: "How to deploy applications",
    positive: "Deployment guide for web apps",  // Similar
    negative: "Database query optimization"      // Different
  },
  // ... thousands more
];

// 2. Train with sentence-transformers library
// (Python, then export to ONNX for Xenova)
import { SentenceTransformer, losses } from 'sentence-transformers';

const model = new SentenceTransformer('all-MiniLM-L6-v2');
model.fit(trainingData, epochs=3, batchSize=16);

// 3. Export to ONNX format
model.save('custom-model', 'onnx');

// 4. Use in Xenova
const embedder = await pipeline(
  'feature-extraction',
  './custom-model'
);
```

## Embedding Providers Comparison

### Local (Xenova Transformers)

```typescript
// Astro Vault default
await indexContent(client, 'articles', articles, 'local', 768);
```

**Pros:**
- ✅ Free and unlimited
- ✅ Privacy-friendly (no data sent to APIs)
- ✅ No API keys required
- ✅ Works offline
- ✅ Consistent performance

**Cons:**
- ❌ Slower (100-200ms per embedding)
- ❌ Uses CPU/GPU resources
- ❌ Initial model download (~400MB)
- ❌ Lower quality than latest cloud models

### OpenAI

```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.embeddings.create({
  model: 'text-embedding-3-small',  // or text-embedding-3-large
  input: text,
});

const embedding = response.data[0].embedding;  // 1536 dimensions
```

**Pros:**
- ✅ High quality embeddings
- ✅ Fast API (20-50ms)
- ✅ No local compute needed
- ✅ Regularly improved

**Cons:**
- ❌ Costs money ($0.02 per 1M tokens)
- ❌ Privacy concerns (data sent to OpenAI)
- ❌ Requires API key
- ❌ Rate limits (3000 RPM)

### Google Gemini

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'embedding-001' });

const result = await model.embedContent(text);
const embedding = result.embedding.values;  // 768 dimensions
```

**Pros:**
- ✅ High quality embeddings
- ✅ Generous free tier
- ✅ Fast API
- ✅ Integrated with Google Cloud

**Cons:**
- ❌ Privacy concerns
- ❌ Requires API key
- ❌ Rate limits
- ❌ Smaller model selection

## Performance Considerations

### Model Size vs Speed vs Quality

```
Small models (384D):
- Size: ~90 MB
- Speed: 50ms per embedding
- Quality: Good for general search
- Use case: Documentation, blogs

Medium models (768D):
- Size: ~400 MB
- Speed: 150ms per embedding
- Quality: Better semantic understanding
- Use case: E-commerce, support docs

Large models (1536D):
- Size: API-only (OpenAI, Cohere)
- Speed: 20-50ms (API)
- Quality: Excellent
- Use case: Complex search, RAG applications
```

### Caching Strategies

```typescript
// Cache embeddings to avoid recomputation
import { LRUCache } from 'lru-cache';

const embeddingCache = new LRUCache<string, Float32Array>({
  max: 1000,  // Cache 1000 embeddings
});

async function getEmbedding(text: string) {
  const cached = embeddingCache.get(text);
  if (cached) return cached;

  const embedding = await embedder(text, {
    pooling: 'mean',
    normalize: true
  });

  embeddingCache.set(text, embedding.data);
  return embedding.data;
}
```

### Batch Processing for Speed

```typescript
// Process 100 articles
// ❌ Slow: Sequential
for (const article of articles) {
  await generateEmbedding(article.content);  // 100 * 150ms = 15s
}

// ✅ Fast: Batched
const batchSize = 10;
for (let i = 0; i < articles.length; i += batchSize) {
  const batch = articles.slice(i, i + batchSize);
  await Promise.all(
    batch.map(a => generateEmbedding(a.content))
  );  // 10 batches * 150ms = 1.5s
}
```

## Debugging Embeddings

### Visualizing Embeddings

```typescript
// Reduce 768D to 2D for visualization using t-SNE or UMAP
import { TSNE } from 'tsne-js';

const embeddings = [
  await generateEmbedding("JavaScript tutorial"),
  await generateEmbedding("Python tutorial"),
  await generateEmbedding("Web deployment"),
  // ... more
];

// Reduce to 2D
const tsne = new TSNE({ dim: 2, perplexity: 30 });
const points2D = tsne.fit(embeddings);

// Plot points - similar concepts cluster together
console.log(points2D);
// [[0.2, 0.8], [0.3, 0.7], [8.1, 9.2], ...]
//  JS tutorial  Py tutorial  Deployment
//  (close together)           (far away)
```

### Testing Similarity

```typescript
import { cosineSimilarity } from '@logan/libsql-search';

// Test if embeddings make sense
const tests = [
  ["cat", "kitten"],           // Should be high (>0.8)
  ["cat", "dog"],              // Should be medium (~0.6)
  ["cat", "car"],              // Should be low (<0.3)
  ["deploy", "deployment"],    // Should be very high (>0.9)
];

for (const [word1, word2] of tests) {
  const emb1 = await generateEmbedding(word1);
  const emb2 = await generateEmbedding(word2);
  const similarity = cosineSimilarity(emb1, emb2);
  console.log(`"${word1}" vs "${word2}": ${similarity.toFixed(2)}`);
}
```

## Use Cases

### ✅ Perfect For

**Semantic Search**: Find documents by meaning
```typescript
query: "how do I make my site faster?"
finds: "performance optimization", "speed improvements", "caching strategies"
```

**Recommendation Systems**: "More like this"
```typescript
article: "React Hooks Tutorial"
recommends: "Modern React Patterns", "State Management Guide", "Custom Hooks"
```

**Content Deduplication**: Find similar content
```typescript
checkDuplicate("Getting started with React",
                "React beginner's guide")
similarity: 0.92  // Likely duplicate
```

**Question Answering**: Match questions to answers
```typescript
question: "What's the difference between let and var?"
answer: "Variable scoping in JavaScript" (from knowledge base)
```

### ⚠️ Not Ideal For

**Exact Matching**: Use full-text search instead
```typescript
// Bad: Semantic search for exact strings
query: "React.useState"
// Good: Full-text search
WHERE function_name = 'React.useState'
```

**Numeric/Date Filtering**: Use database indexes
```typescript
// Bad: Embedding-based filtering
query: "articles from 2023"
// Good: SQL WHERE clause
WHERE created_at >= '2023-01-01'
```

**Very Large Scale**: Use specialized vector DBs
```typescript
// < 1M documents: LibSQL works great
// > 10M documents: Consider Pinecone, Weaviate, Qdrant
```

## Resources

- **Xenova Transformers**: [huggingface.co/docs/transformers.js](https://huggingface.co/docs/transformers.js)
- **Sentence Transformers**: [sbert.net](https://www.sbert.net/)
- **Transformer Models**: [huggingface.co/models](https://huggingface.co/models?pipeline_tag=sentence-similarity)
- **Embeddings Explained**: [openai.com/blog/introducing-text-and-code-embeddings](https://openai.com/blog/introducing-text-and-code-embeddings)
- **Vector Search Theory**: [pinecone.io/learn/vector-embeddings](https://www.pinecone.io/learn/vector-embeddings/)
