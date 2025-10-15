---
title: Why LibSQL for Documentation Sites
tags: [libsql, turso, documentation, search, cost-optimization]
---

# Why LibSQL for Documentation Sites

LibSQL with Turso provides an excellent sweet spot for documentation sites: semantic search capabilities, edge performance, minimal cost, and full data ownership. This article makes the case for why it's often the best choice over Algolia, Elasticsearch, or cloud search services.

## The Documentation Site Search Problem

### What Docs Sites Need

Documentation sites have specific search requirements:

```
✅ Must have:
- Fast search (<200ms acceptable)
- Semantic understanding ("how do I deploy?" finds "deployment guide")
- Works with natural language queries
- Low cost (docs sites rarely generate direct revenue)
- Easy to maintain (small teams)

❌ Don't need:
- Sub-10ms response times
- Real-time analytics dashboards
- Complex faceting
- 99.99% SLA
- Millions of queries per second
```

### Traditional Solutions Are Overkill

**Algolia**: $300-500/mo for modest traffic
```
- 500k searches/month = $300/mo
- Excellent, but expensive for a docs site
- Features you won't use: facets, geo-search, A/B testing
```

**Elasticsearch**: $200-1000/mo + ops burden
```
- Self-hosted: $50/mo VPS + your time
- Elastic Cloud: $200+/mo
- Complex setup, ongoing maintenance
```

**Cloud services**: $75-250/mo minimum
```
- AWS OpenSearch: $23/mo minimum (not production-ready)
- Azure Cognitive: $75/mo minimum
- Still requires ops knowledge
```

## The LibSQL Approach

### What Is LibSQL?

LibSQL is a fork of SQLite with modern features:
- Vector search (for embeddings)
- Edge replication (via Turso)
- HTTP API
- Embedded or cloud-hosted
- Compatible with SQLite

**Turso** is the hosted LibSQL service with edge replicas globally.

### Why It Works for Docs

```typescript
// Simple architecture
Content (Markdown)
  ↓ indexing script
LibSQL Database (Turso)
  ↓ query at runtime
Search Results (semantic)
```

**Key benefits:**
1. **Semantic search**: Full AI embeddings support
2. **One database**: Content + search in same place
3. **Edge performance**: Replicas near users
4. **Free tier**: 500MB storage, 1B row reads/month
5. **Simple ops**: No cluster management

## Cost Comparison

### Real Numbers (Documentation Site with 5,000 pages, 100k searches/month)

**LibSQL (Turso) - Free tier:**
```
Storage: 5,000 pages * 10KB = 50MB ✅ (under 500MB)
Queries: 100k searches * 2 queries = 200k reads ✅ (under 1B)
Cost: $0/month
```

**Algolia:**
```
Records: 5,000 pages = $2.50/mo
Searches: 100k searches = $100/mo
Total: $102.50/month
```

**AWS OpenSearch:**
```
Instance: t3.small.search = $23/mo
Storage: 1GB = $0.10/mo
Backups: ~$5/mo
Total: $28/month
+ Time to manage and maintain
```

**Elastic Cloud:**
```
Minimum tier: $95/month
```

### Scaling Costs

As traffic grows:

| Monthly Searches | LibSQL/Turso | Algolia | AWS OpenSearch |
|------------------|--------------|---------|----------------|
| 10k | $0 | $10 | $23 |
| 100k | $0 | $100 | $23 |
| 500k | $0 | $300 | $150 |
| 1M | $5-10 | $600 | $300 |
| 5M | $50-100 | $3,000 | $800 |

**Key insight**: For most docs sites (<1M searches/month), LibSQL is free or nearly free.

## Feature Comparison

### What You Get with LibSQL

**Semantic Search:**
```typescript
// Natural language queries work
query: "how do I make my app faster?"

// Finds semantically similar content
results: [
  "Performance Optimization Guide",
  "Caching Strategies",
  "Speed Improvements"
]

// Not just keyword matching
```

**Full SQL Power:**
```typescript
// Complex queries when needed
const results = await client.execute(`
  SELECT
    slug,
    title,
    vector_distance_cos(embedding, ?) as similarity
  FROM articles
  WHERE similarity > 0.7
    AND tags LIKE '%tutorial%'
    AND created_at > '2024-01-01'
  ORDER BY similarity DESC
  LIMIT 20
`, [queryEmbedding]);

// Combine vector search with traditional SQL
```

**Edge Performance:**
```
User in Tokyo → Turso Tokyo replica (20ms)
User in London → Turso London replica (15ms)
User in SF → Turso SF replica (10ms)

Algolia: 10-20ms globally ✓ (slightly faster)
Elasticsearch: 50-100ms from single region ✗
```

### What You Don't Get

**No built-in UI components:**
```typescript
// Algolia gives you InstantSearch
// LibSQL: you build your own (not hard)

// Example: Simple React search
function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query) {
      fetch(`/api/search?q=${query}`)
        .then(r => r.json())
        .then(data => setResults(data.results));
    }
  }, [query]);

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {results.map(r => <Result key={r.slug} {...r} />)}
    </>
  );
}
```

**No analytics dashboard:**
- Algolia: Built-in analytics (search terms, click rates)
- LibSQL: Roll your own or use Plausible/Fathom

**No hosted crawler:**
- Algolia: Can crawl your site automatically
- LibSQL: You index content from your build process

## Implementation Comparison

### Time to Working Search

**LibSQL (Astro Vault approach):**
```bash
# 1. Install dependencies (2 minutes)
pnpm add @logan/libsql-search @libsql/client

# 2. Set up database (5 minutes)
# Add TURSO_DB_URL and TURSO_AUTH_TOKEN to .env
pnpm db:init

# 3. Index content (3 minutes)
pnpm index

# 4. Add search UI (20 minutes)
# Copy Search.tsx component, add API route

# Total: ~30 minutes to working semantic search
```

**Algolia:**
```bash
# 1. Sign up, get API keys (5 minutes)
# 2. Install dependencies (2 minutes)
pnpm add algoliasearch react-instantsearch

# 3. Index content (10 minutes)
# Write script to send data to Algolia

# 4. Add search UI (15 minutes)
# Use InstantSearch components

# Total: ~30 minutes
```

**Elasticsearch:**
```bash
# 1. Provision server or sign up for Elastic Cloud (30 minutes)
# 2. Install and configure ES (60 minutes)
# 3. Set up mappings and index settings (30 minutes)
# 4. Write indexing script (30 minutes)
# 5. Build search API (30 minutes)
# 6. Create search UI (30 minutes)

# Total: 3-4 hours
```

**Winner**: LibSQL and Algolia tie for speed. Elasticsearch takes much longer.

## Performance

### Query Speed

**LibSQL with Turso (Astro Vault):**
```
Cold query (first time): 100-150ms
  - Generate embedding: 50-80ms (local model)
  - Vector search: 30-50ms
  - Network overhead: 20ms

Warm query (model cached): 50-100ms
  - Generate embedding: 20-40ms
  - Vector search: 20-30ms
  - Network overhead: 10-20ms

Hybrid (full-text + vector): 60-120ms
```

**Algolia:**
```
All queries: 5-20ms globally
  - Cached at edge
  - Highly optimized
  - No embedding generation
```

**Elasticsearch (single region):**
```
Simple query: 10-50ms
Vector search: 50-100ms
Complex aggregations: 100-500ms
```

**Analysis**:
- Algolia is fastest (keyword search)
- LibSQL is "fast enough" for docs (50-100ms acceptable)
- Elasticsearch varies widely by query complexity

### Scale Limits

**LibSQL/Turso:**
```
Documents: Up to 1M (practical limit)
Storage: 500MB free, unlimited paid ($0.23/GB)
Queries: 1B row reads/month free
Embedding dimensions: 768-1536 supported

Sweet spot: 10k-100k documents
```

**Algolia:**
```
Documents: Billions (if you can afford it)
Operations: 100k ops/sec on higher tiers
Records: 10k free, then $0.50/1k records

Sweet spot: 100k-10M documents
```

**Elasticsearch:**
```
Documents: Billions (with cluster)
Sharding: Horizontal scaling
Storage: Limited by disk space

Sweet spot: 1M+ documents
```

## Data Ownership

### LibSQL Advantages

**Full control:**
```typescript
// Your database, your data
// Export anytime
const allData = await client.execute('SELECT * FROM articles');
const json = JSON.stringify(allData.rows);
fs.writeFileSync('backup.json', json);

// Migrate to SQLite if needed
// Just copy the .db file
```

**Privacy:**
```typescript
// All content stays in your database
// Embeddings generated locally (optional)
// No third-party indexing your content

// vs Algolia: sends all content to their servers
// vs Elasticsearch Cloud: data on their infrastructure
```

**Compliance:**
```typescript
// GDPR, HIPAA, etc. - you control data location
// Turso: choose regions for replicas
// On-prem: run embedded LibSQL locally
```

## When LibSQL Is Perfect

### ✅ Ideal Use Cases

**Documentation Sites:**
```
- 1k-100k pages
- <1M searches/month
- Need semantic search
- Small team
- Limited budget

Examples: API docs, developer guides, knowledge bases
```

**Open Source Projects:**
```
- Free hosting important
- Community contributions
- Simple maintenance
- Full control over data

Examples: Framework docs, library documentation
```

**Internal Knowledge Bases:**
```
- Company docs
- Private data (can't send to Algolia)
- Budget-conscious
- Simple search needs

Examples: Engineering wikis, runbooks, process docs
```

**Personal/Small Business:**
```
- Blogs with technical content
- Learning platforms
- Portfolio sites
- Digital gardens
```

## When to Choose Alternatives

### Use Algolia Instead If:

- 🚀 Need <10ms search (critical UX requirement)
- 💰 Budget allows $500+/month
- 📊 Need built-in analytics dashboard
- 🎨 Want beautiful pre-built UI components
- 🔍 Search is core product feature (not just docs)
- 📈 High search volume (>5M/month) with budget

**Example**: SaaS product where search drives revenue

### Use Elasticsearch Instead If:

- 📦 Handling millions of documents
- 🎛️ Need complex aggregations and analytics
- 🔐 Strict compliance requires specific infrastructure
- 💪 Have DevOps team to manage clusters
- 🔧 Need fine-grained control over ranking algorithms
- 📊 Search + log analytics + dashboards in one

**Example**: Large enterprise with complex search requirements

### Use Cloud Provider Search If:

- ☁️ Deeply integrated with that cloud (AWS/Azure/GCP)
- 🏢 Enterprise with existing cloud relationship
- 💼 Budget for $200+/month managed service
- 🔒 Require specific cloud compliance certifications

**Example**: Company standardized on Azure, uses Azure Cognitive Search

## Real-World Example: Astro Vault

### Architecture

```
Content (Markdown files)
  ↓
Indexing Script (scripts/index-content.ts)
  ↓
Generate Embeddings (Xenova Transformers)
  ↓
Store in Turso (768D vectors)
  ↓
Search API (/api/search.json.ts)
  ↓
Client UI (Search.tsx)
```

### Stats

```
Pages: ~50 articles
Storage: ~5MB in database
Queries: <10k/month (docs site)
Response time: 80-120ms average
Cost: $0/month (free tier)

If this was Algolia:
- Records: 50 articles = free tier ✓
- Searches: 10k/month = $10/month
- Total: $10/month (100x more expensive)

If this was Elasticsearch:
- AWS OpenSearch: $23/month
- Self-hosted: $0 + ops burden
```

### Code Simplicity

**Indexing** (scripts/index-content.ts):
```typescript
import { indexContent, createTable } from '@logan/libsql-search';
import { getTursoClient } from '../src/lib/turso';

const client = getTursoClient();

// Create table with vector support
await createTable(client, 'articles', 768);

// Index all markdown files
await indexContent(client, 'articles', articles, 'local', 768);

// Done! Semantic search ready
```

**Searching** (src/pages/api/search.json.ts):
```typescript
import { searchArticles } from '@logan/libsql-search';

export async function GET({ request }) {
  const query = new URL(request.url).searchParams.get('q');
  const results = await searchArticles(
    client, 'articles', query, 'local', 10
  );
  return new Response(JSON.stringify({ results }));
}
```

**Total code**: ~150 lines including UI

## Migration Path

### Starting with LibSQL

```
Phase 1: Launch (Day 1)
- Use LibSQL with Turso free tier
- Simple, fast, semantic search
- Cost: $0/month

Phase 2: Growth (6-12 months)
- Traffic grows to 500k searches/month
- Still on Turso free tier or $5-10/month
- Cost: $0-10/month

Phase 3: Scale Decision (12-24 months)
- If >1M searches/month: evaluate alternatives
  Option A: Stay with LibSQL (still cheap)
  Option B: Migrate to Algolia (better UX, higher cost)
  Option C: Move to Elasticsearch (more control, ops burden)
```

### Easy Migration Later

```typescript
// Export from LibSQL
const articles = await client.execute('SELECT * FROM articles');

// Import to Algolia
const index = algoliaClient.initIndex('articles');
await index.saveObjects(articles.rows.map(r => ({
  objectID: r.slug,
  title: r.title,
  content: r.content,
})));

// Or to Elasticsearch
for (const article of articles.rows) {
  await esClient.index({
    index: 'articles',
    id: article.slug,
    body: article
  });
}

// Update search API to use new service
// UI code stays mostly the same
```

## Hybrid Approaches

### LibSQL + Algolia

```typescript
// Use LibSQL for semantic search
// Use Algolia for instant keyword search

async function search(query: string) {
  // If short query, use Algolia for instant results
  if (query.length < 10) {
    return await algoliaSearch(query);
  }

  // For natural language queries, use semantic search
  return await libsqlSemanticSearch(query);
}
```

### LibSQL + Caching

```typescript
// Cache popular queries in Redis/KV
const cached = await kv.get(`search:${query}`);
if (cached) return cached;

const results = await searchArticles(client, 'articles', query, 'local', 10);
await kv.set(`search:${query}`, results, { ex: 3600 }); // 1 hour

return results;
```

## Key Takeaways

### LibSQL is Perfect For:

1. **Documentation sites** with <100k pages
2. **Low to medium traffic** (<1M searches/month)
3. **Budget-conscious** projects (free or <$50/month)
4. **Semantic search** needs (natural language queries)
5. **Full data control** and privacy requirements
6. **Simple operations** (small teams, no DevOps)

### Trade-offs:

- ❌ Slower than Algolia (80ms vs 10ms) - acceptable for docs
- ❌ No built-in UI components - build your own
- ❌ No analytics dashboard - add separately if needed
- ❌ Limited scale - <1M documents practical limit

### Bottom Line:

For most documentation sites, LibSQL with Turso is the **Goldilocks solution**:
- Not too expensive (free or cheap)
- Not too slow (50-100ms is fine)
- Not too complex (simple setup)
- Just right for semantic search on a budget

**Start here**, scale to Algolia or Elasticsearch only if you hit real limits or have budget to spare.

## Resources

- **libsql-search Package**: [@logan/libsql-search on JSR](https://jsr.io/@logan/libsql-search)
- **Turso**: [turso.tech](https://turso.tech/)
- **LibSQL**: [github.com/tursodatabase/libsql](https://github.com/tursodatabase/libsql)
- **Astro Vault Source**: See this repo for complete implementation
- **Cost Calculator**: [turso.tech/pricing](https://turso.tech/pricing)
