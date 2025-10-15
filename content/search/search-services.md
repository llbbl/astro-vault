---
title: Search Services Comparison - Algolia, Elasticsearch, and Cloud Providers
tags: [search, algolia, elasticsearch, aws, azure, gcp, opensearch]
---

# Search Services Comparison

When building search functionality, you have many options beyond rolling your own. This guide compares hosted search services from Algolia, Elasticsearch, and the major cloud providers.

## Quick Comparison

| Service | Best For | Pricing | Setup Time | Performance |
|---------|----------|---------|------------|-------------|
| **Algolia** | SaaS products, fast setup | $1/10k searches | 30 min | Excellent |
| **Elasticsearch** | Complex queries, full control | Self-host or $95/mo | 2-4 hours | Excellent |
| **AWS OpenSearch** | AWS ecosystem | $23/mo minimum | 1-2 hours | Very Good |
| **Azure Cognitive** | Microsoft stack | $75/mo minimum | 1-2 hours | Very Good |
| **Google Cloud Search** | Enterprise only | Enterprise pricing | Complex | Good |
| **LibSQL (Astro Vault)** | Small docs sites | Free (Turso) | 30 min | Good |

## Algolia

### What Is It?

Hosted search-as-a-service designed for speed and developer experience. Used by Stripe, Twitch, Medium, and thousands of others.

**Key Features:**
- Typo tolerance built-in
- Faceted search
- Geo search
- Synonyms and custom ranking
- Real-time indexing
- Multi-language support
- InstantSearch UI components

### Setup

```javascript
// Install
npm install algoliasearch

// Index content
import algoliasearch from 'algoliasearch';

const client = algoliasearch('APP_ID', 'API_KEY');
const index = client.initIndex('articles');

// Add documents
await index.saveObjects([
  {
    objectID: '1',
    title: 'How to Deploy Web Applications',
    content: 'Step-by-step deployment guide...',
    tags: ['deployment', 'devops'],
  },
  // ... more
]);

// Search
const { hits } = await index.search('deploy web app');
console.log(hits);  // Ranked, highlighted results
```

### Pricing

```
Free Tier:
- 10,000 searches/month
- 10,000 records
- 100 operations/second

Standard:
- $1 per 1,000 searches
- $0.50 per 1,000 records

Growth:
- $0.60 per 1,000 searches (volume discount)
- Custom SLA
- Dedicated infrastructure

Example costs:
- Small blog (50k searches/mo): $40/mo
- Medium SaaS (500k searches/mo): $300/mo
- Large e-commerce (5M searches/mo): $3,000/mo
```

### Pros

- ✅ **Fastest setup**: Working in 30 minutes
- ✅ **Excellent performance**: <10ms response time
- ✅ **Great DX**: Intuitive API, official libraries for all languages
- ✅ **Zero ops**: No servers to manage
- ✅ **Built-in features**: Typo tolerance, synonyms, facets all included
- ✅ **InstantSearch**: Pre-built UI components
- ✅ **Analytics**: Built-in search analytics

### Cons

- ❌ **Expensive at scale**: Costs grow quickly with search volume
- ❌ **Vendor lock-in**: Hard to migrate away
- ❌ **Limited customization**: Can't modify core ranking algorithm
- ❌ **No semantic search**: Keyword-based only (unless you pre-compute embeddings)
- ❌ **Record limits**: Large datasets get expensive fast

### Best For

- **SaaS applications**: Where search is core feature
- **E-commerce**: Product search with facets
- **Documentation**: When budget allows ($500+/mo)
- **Fast time-to-market**: Need search working today

### Not Great For

- **High volume on budget**: >1M searches/month gets expensive
- **Semantic search**: No built-in AI/embeddings
- **Large datasets**: >1M records = high storage costs
- **Simple sites**: Overkill for basic docs

## Elasticsearch / OpenSearch

### What Is It?

Open-source search and analytics engine. Self-hosted or managed via Elastic Cloud. OpenSearch is AWS's fork after Elastic changed licensing.

**Key Features:**
- Full-text search with BM25 ranking
- Aggregations and analytics
- Vector search (kNN) for embeddings
- Geospatial search
- Log analytics (ELK stack)
- Machine learning features
- Highly scalable

### Setup

```bash
# Docker (development)
docker run -p 9200:9200 -e "discovery.type=single-node" \
  elasticsearch:8.11.0

# Or use Elastic Cloud / AWS OpenSearch
```

```javascript
// Install client
npm install @elastic/elasticsearch

// Index content
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200'
});

// Create index with mapping
await client.indices.create({
  index: 'articles',
  body: {
    mappings: {
      properties: {
        title: { type: 'text' },
        content: { type: 'text' },
        tags: { type: 'keyword' },
        embedding: {
          type: 'dense_vector',
          dims: 768,
          index: true,
          similarity: 'cosine'
        }
      }
    }
  }
});

// Index documents
await client.index({
  index: 'articles',
  id: '1',
  body: {
    title: 'How to Deploy Web Applications',
    content: 'Step-by-step deployment guide...',
    tags: ['deployment', 'devops'],
    embedding: [0.1, 0.2, ..., 0.9]  // 768D vector
  }
});

// Search
const result = await client.search({
  index: 'articles',
  body: {
    query: {
      multi_match: {
        query: 'deploy web app',
        fields: ['title^2', 'content']  // Boost title 2x
      }
    }
  }
});

console.log(result.hits.hits);
```

### Pricing

**Self-Hosted (EC2/VPS):**
```
Small (t3.medium): $35/mo
Medium (t3.large): $70/mo
Large (r6g.xlarge): $150/mo
+ Storage costs
+ Backup costs
+ Your time for ops
```

**Elastic Cloud:**
```
Starter: $95/mo (4GB RAM, 180GB storage)
Standard: $450/mo (32GB RAM, 1TB storage)
Enterprise: Custom pricing

Example costs:
- Small site: $95-200/mo
- Medium site: $300-600/mo
- Large site: $1,000-5,000/mo
```

**AWS OpenSearch:**
```
Small (t3.small): $23/mo + storage
Medium (t3.medium): $69/mo + storage
Large (r6g.xlarge): $190/mo + storage

Storage: $0.10/GB/month (standard)
```

### Pros

- ✅ **Full control**: Customize everything
- ✅ **Powerful queries**: Complex boolean, fuzzy, aggregations
- ✅ **Vector search**: Built-in kNN for semantic search
- ✅ **Scalable**: Handles billions of documents
- ✅ **Open source**: OpenSearch is fully open
- ✅ **Analytics**: Not just search, but insights
- ✅ **Ecosystem**: Kibana, Logstash, Beats

### Cons

- ❌ **Complex setup**: Requires DevOps knowledge
- ❌ **Operational overhead**: Need monitoring, backups, upgrades
- ❌ **Resource hungry**: Requires good hardware (4GB+ RAM minimum)
- ❌ **Slower development**: More configuration needed
- ❌ **Expensive managed**: Elastic Cloud costs add up
- ❌ **JVM overhead**: Memory management, garbage collection

### Best For

- **Complex search requirements**: Need advanced queries, aggregations
- **Large scale**: Millions of documents
- **Analytics**: Search + log analytics + dashboards
- **Semantic search**: When you need vector search at scale
- **Control matters**: Want to tune everything

### Not Great For

- **Small projects**: Overkill for <10k documents
- **Limited budget**: Minimum $100/mo managed, or DIY ops burden
- **Simple search**: Too complex if you just need basic search
- **Fast prototypes**: Takes days to set up properly

## Cloud Provider Search Services

### AWS OpenSearch Service

Amazon's managed OpenSearch (formerly Elasticsearch).

**Setup:**
```bash
aws opensearch create-domain \
  --domain-name my-docs \
  --engine-version OpenSearch_2.11 \
  --cluster-config InstanceType=t3.small.search,InstanceCount=1 \
  --ebs-options EBSEnabled=true,VolumeType=gp3,VolumeSize=20
```

**Pricing:**
- **Minimum**: ~$23/mo (t3.small + 10GB storage)
- **Production**: $200-500/mo (m6g.large cluster)
- **Enterprise**: $1,000+/mo (multi-AZ, large instances)

**Pros:**
- ✅ Integrates with AWS services (Lambda, S3, CloudWatch)
- ✅ Managed backups, upgrades, monitoring
- ✅ VPC integration for security
- ✅ Good for existing AWS infrastructure

**Cons:**
- ❌ AWS lock-in
- ❌ More expensive than self-hosted
- ❌ Still requires OpenSearch knowledge
- ❌ Slower updates than open-source

### Azure Cognitive Search

Microsoft's AI-powered search service.

**Setup:**
```bash
az search service create \
  --name my-search \
  --resource-group my-rg \
  --sku basic
```

```csharp
// .NET SDK
using Azure.Search.Documents;

var client = new SearchClient(
  new Uri("https://my-search.search.windows.net"),
  "articles",
  new AzureKeyCredential(apiKey)
);

// Search
var results = await client.SearchAsync<Article>("deploy web app");
```

**Pricing:**
- **Free**: 10k docs, 50 MB storage, 3 indexes
- **Basic**: $75/mo (100k docs, 2GB storage)
- **Standard S1**: $250/mo (15M docs, 25GB storage)
- **Standard S2**: $1,000/mo (60M docs, 100GB)

**Pros:**
- ✅ Built-in AI skills (OCR, entity extraction, key phrases)
- ✅ Semantic search with AI
- ✅ Integrates with Azure ecosystem
- ✅ Good .NET support

**Cons:**
- ❌ Microsoft ecosystem lock-in
- ❌ More expensive than alternatives
- ❌ Less flexible than Elasticsearch
- ❌ Smaller community

**Best For:**
- .NET applications
- Azure-heavy infrastructure
- Need built-in AI features
- Enterprise with Microsoft relationship

### Google Cloud Search

Enterprise search for Google Workspace and custom applications.

**Important**: Google Cloud Search is primarily for Google Workspace (Gmail, Drive, etc.). For custom app search, you'd typically use:
- **Vertex AI Search**: Google's newer offering for custom search
- **Firestore**: For smaller scale
- **Self-hosted Elasticsearch on GCE**

**Vertex AI Search Pricing:**
- **Per-search**: $2.50 per 1,000 searches
- **Indexed data**: $3 per GB/month
- **Minimum**: ~$50/mo for low traffic

**Pros:**
- ✅ Integrates with Google Cloud
- ✅ AI-powered ranking
- ✅ Good for large enterprises

**Cons:**
- ❌ Enterprise-focused pricing
- ❌ Complex setup
- ❌ Less documented than alternatives
- ❌ Smaller ecosystem

## Decision Matrix

### Choose Algolia If:

- ⚡ Speed is critical (<10ms required)
- 🚀 Need to launch quickly (days not weeks)
- 💰 Budget allows ($500+/mo)
- 🎨 Want beautiful pre-built UI components
- 📊 Need built-in analytics
- 🔍 Search volume < 1M/month

### Choose Elasticsearch/OpenSearch If:

- 🎛️ Need full control over ranking
- 📈 Have complex analytics requirements
- 🧠 Want vector/semantic search at scale
- 💪 Have DevOps resources
- 📦 Handling millions of documents
- 💵 Can manage infrastructure or pay $200+/mo

### Choose AWS OpenSearch If:

- ☁️ Already on AWS
- 🔐 Need VPC-private search
- 🔄 Integrate with other AWS services
- 💼 Want managed service without Elastic Cloud pricing

### Choose Azure Cognitive Search If:

- 🪟 .NET/Azure ecosystem
- 🤖 Need built-in AI features (OCR, entity extraction)
- 🏢 Enterprise Microsoft shop
- 💰 Budget for $250+/mo

### Choose LibSQL (like Astro Vault) If:

- 📝 Small documentation site (<10k pages)
- 🆓 Want free or cheap hosting
- 🧠 Need semantic search
- ⚡ Good enough performance (50-100ms)
- 🛠️ Want full control of data
- 🚀 Using Turso/edge databases

## Real-World Examples

### Documentation Sites

```
Stripe: Algolia ($$$) - Search is critical UX
React Docs: Algolia ($$) - Sponsored/partnered
Vue Docs: Algolia ($) - Lower volume
Astro Vault: LibSQL (Free) - Simple, semantic search
Rust Docs: Custom full-text - Full control
```

### E-commerce

```
Amazon: Custom Elasticsearch - Billions of products
Shopify: Algolia - Fast, faceted search
Small stores: Algolia or Elastic Cloud
```

### SaaS Products

```
GitHub: Elasticsearch - Complex code search
Notion: Algolia - Fast document search
Linear: Custom - Full control
```

## Cost Comparison (Real Numbers)

### Small Site (10k docs, 50k searches/month)

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| LibSQL/Turso | $0-5 | Free tier covers it |
| Algolia | $40 | 50k searches |
| AWS OpenSearch | $23 | t3.small.search |
| Elastic Cloud | $95 | Minimum tier |
| Azure Cognitive | $75 | Basic tier |

### Medium Site (50k docs, 500k searches/month)

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| LibSQL/Turso | $5-10 | Still on free tier |
| Algolia | $300 | 500k searches |
| AWS OpenSearch | $150 | m6g.large |
| Elastic Cloud | $300 | Standard tier |
| Azure Cognitive | $250 | Standard S1 |

### Large Site (500k docs, 5M searches/month)

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| LibSQL/Turso | $50-100 | High volume queries |
| Algolia | $3,000 | 5M searches |
| AWS OpenSearch | $800 | Large cluster |
| Elastic Cloud | $1,500 | High perf tier |
| Azure Cognitive | $1,000 | Standard S2 |

## Migration Considerations

### Moving Between Services

**From Algolia to Elasticsearch:**
- Export data via API
- Rebuild index in ES
- Update search UI (different response format)
- Re-implement custom ranking
- **Time**: 1-2 weeks

**From Elasticsearch to Algolia:**
- Export from ES via scroll API
- Batch upload to Algolia
- Configure synonyms, rankings
- Update search UI
- **Time**: 1 week

**From Either to LibSQL:**
- Extract documents
- Generate embeddings
- Index in LibSQL with libsql-search
- Build simple search UI
- **Time**: 2-3 days

## Hybrid Approaches

### Algolia + Embeddings

```typescript
// Pre-compute embeddings, store in Algolia as attributes
const embedding = await generateEmbedding(article.content);

await index.saveObject({
  objectID: article.id,
  title: article.title,
  content: article.content,
  // Store first 10 dims as custom ranking factors
  embed_0: embedding[0],
  embed_1: embedding[1],
  // ...
});

// Use for custom ranking or filtering
```

### Elasticsearch + Cloud Functions

```typescript
// Use ES for keyword search, cloud functions for semantic
const keywordResults = await elasticClient.search(...);
const semanticResults = await cloudFunction.search(...);

// Merge results
const merged = mergeAndRank(keywordResults, semanticResults);
```

## Key Takeaways

1. **Algolia**: Best DX, fastest setup, expensive at scale
2. **Elasticsearch**: Most powerful, requires ops, expensive managed
3. **AWS OpenSearch**: Good for AWS shops, cheaper than Elastic Cloud
4. **Azure Cognitive**: Best for .NET/Microsoft ecosystem
5. **LibSQL/Custom**: Best for small sites, full control, cheapest

**Most common choice**: Start with Algolia for speed, migrate to Elasticsearch if costs grow too high or need more control.

**Best for docs sites**: LibSQL (Astro Vault approach) or Algolia free tier.

**Best for scale**: Self-hosted Elasticsearch or AWS OpenSearch with caching.

## Resources

- **Algolia Docs**: [algolia.com/doc](https://www.algolia.com/doc/)
- **Elasticsearch Guide**: [elastic.co/guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- **AWS OpenSearch**: [docs.aws.amazon.com/opensearch-service](https://docs.aws.amazon.com/opensearch-service/)
- **Azure Cognitive Search**: [learn.microsoft.com/azure/search](https://learn.microsoft.com/en-us/azure/search/)
- **Search Service Comparison**: [db-engines.com/en/system/Algolia%3BElasticsearch](https://db-engines.com/en/system/Algolia%3BElasticsearch)
