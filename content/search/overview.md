---
title: Search Overview - From LIKE to Semantic Search
tags: [search, overview, full-text, semantic, getting-started]
---

# Search Overview - From LIKE to Semantic Search

Search has evolved dramatically over the decades, from simple string matching to AI-powered semantic understanding. This guide provides an overview of search technologies and helps you choose the right approach.

## The Evolution of Search

### Timeline

```
1970s: LIKE queries
  ↓
1990s: Full-text search (inverted indexes)
  ↓
2000s: Distributed search (Lucene, Elasticsearch)
  ↓
2010s: Cloud search services (Algolia, AWS)
  ↓
2020s: Semantic search (AI embeddings, vector databases)
```

### Key Milestones

**1970s - SQL LIKE Queries:**
```sql
SELECT * FROM articles WHERE content LIKE '%search term%';
```
- Simple substring matching
- Full table scans (slow)
- No relevance ranking
- Still common in small applications

**1990s - Full-Text Search:**
```sql
-- PostgreSQL
SELECT * FROM articles
WHERE to_tsvector(content) @@ to_tsquery('search term');
```
- Inverted indexes for speed (10-100x faster)
- Linguistic understanding (stemming, stop words)
- Relevance ranking (tf-idf)
- Built into modern databases

**2000s - Search Engines:**
```javascript
// Lucene/Elasticsearch
GET /articles/_search
{
  "query": {
    "match": { "content": "search term" }
  }
}
```
- Distributed, scalable
- Advanced features (facets, aggregations)
- Near-real-time indexing
- Powers most search today

**2010s - Cloud Services:**
```javascript
// Algolia
const { hits } = await index.search('search term');
```
- Hosted, managed services
- Global edge networks (<10ms)
- Developer-friendly APIs
- Pay-per-use pricing

**2020s - Semantic Search:**
```typescript
// Vector search
const embedding = await generateEmbedding('search term');
const results = await db.execute(`
  SELECT *, vector_distance_cos(embedding, ?) as similarity
  FROM articles
  ORDER BY similarity DESC
`, [embedding]);
```
- AI-powered understanding
- Meaning-based, not keyword-based
- Handles natural language
- Understands synonyms automatically

## Search Technology Comparison

### Quick Reference Table

| Technology | Speed | Setup | Cost | Semantic | Best For |
|------------|-------|-------|------|----------|----------|
| **LIKE queries** | Slow (2000ms) | Instant | Free | No | Dev/testing only |
| **Full-text** | Fast (10ms) | Easy | Free | No | Exact keywords |
| **Elasticsearch** | Fast (20ms) | Complex | $200+/mo | Optional | Large scale |
| **Algolia** | Fastest (5ms) | Easy | $100+/mo | No | SaaS products |
| **Semantic (LibSQL)** | Good (80ms) | Moderate | Free-$50/mo | Yes | Documentation |

### Detailed Comparison

#### LIKE Queries

```sql
SELECT * FROM articles WHERE title LIKE '%javascript%';
```

**How it works**: Scans every row, checks if substring exists

**Pros:**
- ✅ No setup required
- ✅ Available in all databases
- ✅ Simple to understand

**Cons:**
- ❌ Very slow (full table scan)
- ❌ No relevance ranking
- ❌ Can't use indexes with `%term%`
- ❌ No language understanding

**When to use**: Development/testing only, or tables with <100 rows

[Read more: Basic Text Search](/content/search/basic-queries)

#### Full-Text Search

```sql
-- PostgreSQL
SELECT title, ts_rank(search_vector, query) as rank
FROM articles
WHERE search_vector @@ to_tsquery('javascript')
ORDER BY rank DESC;
```

**How it works**: Pre-built inverted index, linguistic processing

**Pros:**
- ✅ 100-200x faster than LIKE
- ✅ Relevance ranking built-in
- ✅ Understands language (stemming)
- ✅ Built into databases (PostgreSQL, MySQL, SQLite)
- ✅ No extra infrastructure

**Cons:**
- ❌ Keyword-based only
- ❌ No synonym understanding
- ❌ Poor for natural language queries
- ❌ Setup required (indexes, triggers)

**When to use**: Keyword search in blogs, documentation, e-commerce

[Read more: Full-Text Search in Databases](/content/search/full-text-search)

#### Elasticsearch / OpenSearch

```javascript
const result = await client.search({
  index: 'articles',
  body: {
    query: {
      multi_match: {
        query: 'javascript async',
        fields: ['title^2', 'content']
      }
    }
  }
});
```

**How it works**: Distributed search engine with Lucene under the hood

**Pros:**
- ✅ Extremely powerful (complex queries, aggregations)
- ✅ Horizontally scalable
- ✅ Near-real-time indexing
- ✅ Vector search support (kNN)
- ✅ Rich ecosystem (Kibana, Logstash)

**Cons:**
- ❌ Complex setup and operations
- ❌ Expensive ($200-1000+/mo)
- ❌ Resource-intensive (4GB+ RAM)
- ❌ Overkill for small sites

**When to use**: Large scale (>1M documents), complex requirements, analytics

[Read more: Search Services Comparison](/content/search/search-services)

#### Algolia

```javascript
const { hits } = await index.search('javascript async', {
  attributesToRetrieve: ['title', 'url'],
  hitsPerPage: 10,
});
```

**How it works**: Hosted search-as-a-service with global CDN

**Pros:**
- ✅ Fastest search (<10ms globally)
- ✅ Easiest setup (30 minutes)
- ✅ Beautiful pre-built UI components
- ✅ Built-in analytics
- ✅ Zero ops burden

**Cons:**
- ❌ Expensive ($100-3000+/mo)
- ❌ Vendor lock-in
- ❌ No semantic search (keyword-based)
- ❌ Costs scale with usage

**When to use**: SaaS products where search is critical UX, budget available

[Read more: Search Services Comparison](/content/search/search-services)

#### Semantic Search (LibSQL/Embeddings)

```typescript
// Generate embedding for query
const queryEmbedding = await generateEmbedding(
  "how do I deploy my application?"
);

// Find similar documents
const results = await searchArticles(
  client, 'articles', query, 'local', 10
);

// Returns semantically similar results:
// - "Deployment guide for web apps"
// - "Pushing to production servers"
// - "CI/CD pipeline setup"
```

**How it works**: AI embeddings convert text to vectors, search by similarity

**Pros:**
- ✅ Understands meaning, not just keywords
- ✅ Natural language queries work
- ✅ Automatic synonym understanding
- ✅ Better typo tolerance
- ✅ Very affordable (free-$50/mo)

**Cons:**
- ❌ Slower (50-100ms)
- ❌ Requires embedding generation
- ❌ More complex than full-text
- ❌ Limited to ~1M documents

**When to use**: Documentation, knowledge bases, question answering

[Read more: Semantic Search](/content/search/semantic-search) | [AI Embeddings](/content/search/embeddings)

## Choosing the Right Search

### Decision Tree

```
Start here
  ↓
Is search critical to your product? (e.g., SaaS, e-commerce)
  ├─ Yes → Do you have budget ($500+/mo)?
  │   ├─ Yes → Algolia (best DX, fastest)
  │   └─ No → Elasticsearch (more work, cheaper)
  │
  └─ No → Is it a documentation/content site?
      ├─ Yes → Do you want semantic search?
      │   ├─ Yes → LibSQL with embeddings (Astro Vault approach)
      │   └─ No → Database full-text search (PostgreSQL FTS)
      │
      └─ No → Small database (<10k rows)?
          ├─ Yes → Database full-text search
          └─ No → Elasticsearch or Algolia
```

### By Use Case

**📝 Documentation Sites (this site):**
→ **LibSQL/Turso with semantic search**
- Natural language queries
- Low cost (free-$50/mo)
- Good enough performance (80ms)
- Full control over data

**🛒 E-commerce:**
→ **Algolia or Elasticsearch**
- Need faceted search (filters)
- Sub-second response critical
- Complex product catalogs

**🏢 Enterprise Search:**
→ **Elasticsearch or cloud provider search**
- Complex compliance requirements
- Millions of documents
- Advanced analytics needs

**🚀 SaaS Product:**
→ **Algolia**
- Search is core feature
- Need beautiful UI fast
- Can justify $300+/mo cost

**📱 Mobile App:**
→ **Algolia or Firebase**
- Global edge performance
- Simple API integration
- Built-in mobile SDKs

**💻 Internal Tools:**
→ **Database full-text search**
- Small team usage
- Simple keyword search
- No budget for external service

## Search Architecture Patterns

### Pattern 1: Simple Full-Text

```
User Query
  ↓
PostgreSQL FTS
  ↓
Ranked Results
```

**Best for**: Blogs, small sites, keyword search
**Example**: WordPress search, simple documentation

### Pattern 2: Hosted Service

```
User Query
  ↓
Algolia API
  ↓
Instant Results (<10ms)
```

**Best for**: SaaS, e-commerce, high-traffic sites
**Example**: Stripe docs, Shopify stores

### Pattern 3: Self-Hosted Elasticsearch

```
User Query
  ↓
API Server
  ↓
Elasticsearch Cluster
  ↓
Complex Results (facets, aggregations)
```

**Best for**: Large scale, complex queries, full control
**Example**: GitHub search, enterprise portals

### Pattern 4: Semantic Search (Astro Vault)

```
User Query
  ↓
Generate Embedding (Xenova)
  ↓
LibSQL Vector Search
  ↓
Semantic Results (meaning-based)
```

**Best for**: Documentation, knowledge bases, Q&A
**Example**: This site, internal wikis

### Pattern 5: Hybrid Search

```
User Query
  ↓
Full-Text Search (fast, keywords)
  ↓
Semantic Search (meaning)
  ↓
Merge & Re-rank
  ↓
Best of Both Worlds
```

**Best for**: Technical docs, complex content
**Example**: API documentation with code examples

## Performance Benchmarks

### Real-World Numbers (1 million documents)

| Operation | LIKE | Full-Text | Elasticsearch | Algolia | Semantic |
|-----------|------|-----------|---------------|---------|----------|
| **Single term** | 2000ms | 10ms | 15ms | 5ms | 80ms |
| **Multiple terms** | 3000ms | 15ms | 20ms | 8ms | 100ms |
| **Phrase** | 2500ms | 20ms | 25ms | 10ms | N/A |
| **Natural language** | N/A | Poor | Poor | Poor | 120ms |
| **Index size** | 0 MB | 50 MB | 200 MB | Hosted | 300 MB |
| **Setup time** | 0 min | 30 min | 4 hours | 30 min | 1 hour |

### Cost Benchmarks (100k searches/month, 10k docs)

| Solution | Monthly Cost | Notes |
|----------|--------------|-------|
| LIKE queries | $0 | Too slow for production |
| PostgreSQL FTS | $0 | Built into database |
| LibSQL/Turso | $0 | Free tier covers it |
| AWS OpenSearch | $23 | t3.small minimum |
| Azure Cognitive | $75 | Basic tier |
| Elastic Cloud | $95 | Starter tier |
| Algolia | $100 | 100k searches |

## Implementation Examples

### Full-Text Search (PostgreSQL)

```sql
-- 1. Add tsvector column
ALTER TABLE articles ADD COLUMN search_vector tsvector;

-- 2. Create GIN index
CREATE INDEX idx_search ON articles USING GIN(search_vector);

-- 3. Populate
UPDATE articles SET search_vector =
  setweight(to_tsvector('english', title), 'A') ||
  setweight(to_tsvector('english', content), 'B');

-- 4. Search
SELECT title, ts_rank(search_vector, query) as rank
FROM articles, to_tsquery('javascript & async') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

### Semantic Search (LibSQL)

```typescript
// 1. Install dependencies
import { indexContent, searchArticles } from '@logan/libsql-search';

// 2. Index content
await indexContent(client, 'articles', articles, 'local', 768);

// 3. Search
const results = await searchArticles(
  client, 'articles', query, 'local', 10
);
```

### Algolia

```typescript
// 1. Install
import algoliasearch from 'algoliasearch';

// 2. Initialize
const client = algoliasearch('APP_ID', 'API_KEY');
const index = client.initIndex('articles');

// 3. Index
await index.saveObjects(articles);

// 4. Search
const { hits } = await index.search(query);
```

## Cost-Performance Trade-offs

### Budget-Focused

```
Free: PostgreSQL FTS or LibSQL
  → Best for: Small sites, internal tools

$5-50/mo: LibSQL/Turso with semantic search
  → Best for: Documentation, knowledge bases

$50-200/mo: AWS OpenSearch (self-managed)
  → Best for: Medium scale, AWS-heavy

$100-500/mo: Algolia or Elastic Cloud
  → Best for: SaaS products, high traffic
```

### Performance-Focused

```
Fastest (5-10ms): Algolia
  → Trade-off: $$$, no semantic search

Fast (10-50ms): Elasticsearch, PostgreSQL FTS
  → Trade-off: Ops burden or setup time

Good (50-100ms): LibSQL semantic search
  → Trade-off: Semantic understanding > speed

Slow (2000ms+): LIKE queries
  → Trade-off: Don't use in production
```

## Migration Paths

### Growing from Small to Large

**Stage 1**: Start simple
```
Small site → PostgreSQL FTS
Cost: $0
Setup: 1 hour
```

**Stage 2**: Add semantic understanding
```
Growing docs → LibSQL semantic search
Cost: $0-10/mo
Setup: 2 hours
```

**Stage 3**: Scale up
```
High traffic → Algolia or Elasticsearch
Cost: $200-500/mo
Setup: 1-2 days to migrate
```

**Stage 4**: Enterprise scale
```
Millions of docs → Elasticsearch cluster
Cost: $1,000+/mo
Setup: Weeks, dedicated team
```

## Learning Path

### Recommended Reading Order

1. **[Basic Text Search](/content/search/basic-queries)**: Understand why LIKE queries don't work
2. **[Full-Text Search](/content/search/full-text-search)**: Learn about inverted indexes and ranking
3. **[Semantic Search](/content/search/semantic-search)**: Discover meaning-based search
4. **[AI Embeddings](/content/search/embeddings)**: Deep dive into how embeddings work
5. **[Search Services](/content/search/search-services)**: Compare Algolia, Elasticsearch, cloud services
6. **[Why LibSQL](/content/search/why-libsql)**: Understand the case for LibSQL in docs sites

### Hands-On Learning

**Beginner**: Add full-text search to a PostgreSQL table
**Intermediate**: Build a semantic search engine with LibSQL
**Advanced**: Set up Elasticsearch with vector search

## Key Takeaways

### Evolution Summary

```
LIKE → Full-Text → Cloud Services → Semantic Search
Slow   Fast         Fastest          Smartest
```

### Modern Approach

**For most documentation sites:**
1. Start with **LibSQL semantic search** (this site's approach)
2. Scale to **Algolia** if budget allows and traffic grows
3. Move to **Elasticsearch** only if you need complex features

**For SaaS products:**
1. Start with **Algolia** for speed and DX
2. Move to **Elasticsearch** if costs get too high or need more control

**For enterprise:**
1. Start with **Elasticsearch** or cloud provider search
2. Invest in proper cluster management and optimization

### The Right Choice

There is no "best" search solution - only the best solution for your specific needs:
- **Budget**: LibSQL, PostgreSQL FTS
- **Speed**: Algolia
- **Scale**: Elasticsearch
- **Semantic**: LibSQL with embeddings
- **Control**: Self-hosted Elasticsearch

**Most important**: Start simple, scale when you need to.

## Next Steps

Choose your path:
- **Learn more about full-text search** → [Full-Text Search](/content/search/full-text-search)
- **Understand semantic search** → [Semantic Search](/content/search/semantic-search)
- **Compare hosted services** → [Search Services](/content/search/search-services)
- **See why we use LibSQL** → [Why LibSQL](/content/search/why-libsql)
- **Deep dive into embeddings** → [AI Embeddings](/content/search/embeddings)

## Resources

- **PostgreSQL FTS**: [postgresql.org/docs/current/textsearch](https://www.postgresql.org/docs/current/textsearch.html)
- **Algolia Docs**: [algolia.com/doc](https://www.algolia.com/doc/)
- **Elasticsearch Guide**: [elastic.co/guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- **libsql-search**: [@logan/libsql-search on JSR](https://jsr.io/@logan/libsql-search)
- **Vector Search Explained**: [pinecone.io/learn/vector-database](https://www.pinecone.io/learn/vector-database/)
