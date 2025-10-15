---
title: Basic Text Search - Before Full-Text Search
tags: [search, sql, databases, like-queries]
---

# Basic Text Search - Before Full-Text Search

Before full-text search capabilities were built into databases, searching text meant using basic SQL pattern matching. This approach had significant limitations that made it unsuitable for real search applications.

## The LIKE Operator

### Basic Pattern Matching
```sql
-- Find articles with "javascript" anywhere in title
SELECT * FROM articles
WHERE title LIKE '%javascript%';

-- Case-insensitive (PostgreSQL)
SELECT * FROM articles
WHERE title ILIKE '%javascript%';

-- Case-insensitive (MySQL)
SELECT * FROM articles
WHERE LOWER(title) LIKE LOWER('%javascript%');
```

### Multiple Terms
```sql
-- Find articles with both "javascript" AND "async"
SELECT * FROM articles
WHERE title LIKE '%javascript%'
  AND title LIKE '%async%';

-- Find articles with "javascript" OR "typescript"
SELECT * FROM articles
WHERE title LIKE '%javascript%'
   OR title LIKE '%typescript%';
```

## Why LIKE Queries Sucked

### 1. Performance
**Cannot Use Indexes**
```sql
-- This query does a full table scan
SELECT * FROM articles
WHERE content LIKE '%search term%';

-- Even with an index on content, it's not used
CREATE INDEX idx_content ON articles(content);
-- Index is useless for %term% patterns
```

**O(n) Complexity**
- Every query scans every row
- No way to optimize
- Gets slower as data grows

### 2. No Relevance Ranking
```sql
-- Returns results in insertion order, not relevance
SELECT * FROM articles
WHERE content LIKE '%javascript%';

-- No way to know which results are most relevant
```

All results are equal - no concept of:
- Term frequency
- Document importance
- Match quality

### 3. Poor Matching
**Exact Substrings Only**
```sql
-- Finds "running"
SELECT * FROM articles WHERE content LIKE '%running%';

-- Does NOT find "run", "runs", "ran"
```

**No Stemming**
- `LIKE '%run%'` won't match "running", "runs", "ran"
- Must search for every variant manually

**No Stop Words**
- Searches "the", "and", "or" waste resources
- No way to exclude common words

### 4. No Multi-Field Search
```sql
-- Searching multiple columns is verbose
SELECT * FROM articles
WHERE title LIKE '%javascript%'
   OR content LIKE '%javascript%'
   OR tags LIKE '%javascript%';

-- No way to weight fields differently
```

### 5. Complex Queries Are Impossible
```sql
-- Phrase search is clunky
WHERE content LIKE '%async function%'

-- Proximity search? Not possible
-- "javascript" within 5 words of "async"? Can't do it

-- Fuzzy matching? Nope
-- Synonyms? Manual only
```

## Real-World Problems

### E-commerce Search
```sql
-- User searches "laptop computer"
SELECT * FROM products
WHERE name LIKE '%laptop%'
  AND name LIKE '%computer%';

-- Problems:
-- - Product "laptop" excluded (doesn't contain "computer")
-- - Results not ranked by relevance
-- - Slow on 1M+ products
-- - Can't boost popular items
```

### Documentation Search
```sql
-- User searches "how to deploy application"
SELECT * FROM docs
WHERE content LIKE '%how%'
  AND content LIKE '%deploy%'
  AND content LIKE '%application%';

-- Problems:
-- - Matches "how", "to", "deploy" literally
-- - Doesn't match "deployment", "deploying"
-- - No concept of document relevance
-- - Extremely slow
```

### Blog Search
```sql
-- User searches "react hooks tutorial"
SELECT * FROM posts
WHERE title LIKE '%react%'
  AND content LIKE '%hooks%'
  AND content LIKE '%tutorial%';

-- Problems:
-- - Doesn't understand "react" is more important than "tutorial"
-- - Can't boost newer posts
-- - No way to search tags efficiently
-- - Full table scan on every search
```

## Workarounds (All Bad)

### Pre-computing Search Columns
```sql
-- Concatenate searchable fields
ALTER TABLE articles
ADD COLUMN search_text TEXT;

UPDATE articles
SET search_text = LOWER(title || ' ' || content || ' ' || tags);

-- Still requires full scan
SELECT * FROM articles
WHERE search_text LIKE '%javascript%';
```

### Multiple LIKE Clauses
```sql
-- Try to be smart with OR conditions
SELECT * FROM articles
WHERE content LIKE '%javascript%'
   OR content LIKE '%Java Script%'
   OR content LIKE '%js%'
   OR content LIKE '%JS%';

-- Verbose, slow, still no ranking
```

### Application-Side Filtering
```javascript
// Fetch everything, filter in application
const articles = await db.query('SELECT * FROM articles');
const results = articles.filter(a =>
  a.content.toLowerCase().includes(searchTerm.toLowerCase())
);

// Even worse - transfers all data!
```

### Regular Expressions
```sql
-- PostgreSQL regex
SELECT * FROM articles
WHERE content ~ 'javascript|typescript';

-- Still slow, no ranking, complex syntax
```

## Performance Impact

### Benchmark (1 million rows)

| Operation | Time | Notes |
|-----------|------|-------|
| `LIKE '%term%'` | 2000ms | Full table scan |
| `LIKE 'term%'` | 50ms | Can use index (prefix only) |
| Full-text search | 10ms | Indexed, ranked |
| Semantic search | 50ms | Vector index, relevance |

### Why So Slow?
```sql
-- PostgreSQL EXPLAIN
EXPLAIN SELECT * FROM articles WHERE content LIKE '%javascript%';

-- Result:
-- Seq Scan on articles  (cost=0.00..10000.00 rows=100)
--   Filter: (content ~~ '%javascript%'::text)

-- Sequential scan = reads every row
-- No index usage possible
```

## The Index Problem

### Prefix Indexes Work
```sql
-- This CAN use an index
SELECT * FROM articles
WHERE title LIKE 'javascript%';

-- Index scan, fast!
```

### Suffix/Infix Indexes Don't
```sql
-- This CANNOT use an index
SELECT * FROM articles
WHERE title LIKE '%javascript%';

-- Full table scan, slow!
```

### Why?
B-tree indexes store data in sorted order:
```
'a'
'aa'
'aaa'
'javascript'
'javascriptcore'
```

- Prefix search: Start at 'javascript', read sequentially
- Suffix search: Would need to check every entry

## When LIKE Actually Works

### Autocomplete (Prefix Search)
```sql
-- Fast with index
SELECT name FROM users
WHERE name LIKE 'joh%'
LIMIT 10;

-- Works because:
-- 1. Prefix search can use index
-- 2. LIMIT reduces rows scanned
-- 3. Small result set
```

### Exact Matching
```sql
-- Use = instead of LIKE
SELECT * FROM articles
WHERE slug = 'how-to-deploy';

-- Fast with unique index
```

### Very Small Tables
```sql
-- 100 rows? LIKE is fine
SELECT * FROM settings
WHERE key LIKE '%cache%';

-- Fast enough, don't overcomplicate
```

## Migration Path

### From LIKE to Full-Text
```sql
-- Before
SELECT * FROM articles
WHERE content LIKE '%javascript%';

-- After (PostgreSQL)
SELECT * FROM articles
WHERE to_tsvector(content) @@ to_tsquery('javascript');

-- After (MySQL)
SELECT * FROM articles
WHERE MATCH(content) AGAINST('javascript');
```

### From LIKE to Semantic
```sql
-- Before
SELECT * FROM articles
WHERE content LIKE '%how to deploy%';

-- After (with embeddings)
SELECT *, vector_distance_cos(embedding, query_vector) as similarity
FROM articles
ORDER BY similarity
LIMIT 10;
```

## Key Takeaways

### LIKE Problems
1. **Performance**: Full table scans, O(n) complexity
2. **No relevance**: Results not ranked
3. **Poor matching**: Exact substrings only
4. **No stemming**: Can't match word variants
5. **Complex queries**: Impossible or very slow

### When LIKE Is OK
- Small tables (< 1000 rows)
- Prefix search with index
- Exact matching
- Internal tools with low usage

### Better Alternatives
- **Full-text search**: For keyword search (10-100x faster)
- **Semantic search**: For natural language (more relevant)
- **Dedicated search**: Algolia, Elasticsearch for complex needs

## Evolution of Search

```
1970s: LIKE queries (slow, no ranking)
     ↓
1990s: Full-text search (fast, ranked)
     ↓
2000s: Elasticsearch (distributed, scalable)
     ↓
2020s: Semantic search (AI, understands meaning)
```

## Conclusion

LIKE queries were a necessary evil before full-text search existed. They're slow, can't be indexed properly, provide no ranking, and don't understand language. Modern databases have built-in full-text search, and AI-powered semantic search is becoming standard for user-facing search.

**Rule of thumb**: If you're using `LIKE '%term%'` for search in production, you're probably doing it wrong.

## Resources

- **PostgreSQL Full-Text**: [postgresql.org/docs/current/textsearch](https://www.postgresql.org/docs/current/textsearch.html)
- **MySQL Full-Text**: [dev.mysql.com/doc/refman/fulltext-search](https://dev.mysql.com/doc/refman/8.0/en/fulltext-search.html)
- **Query Performance**: [use-the-index-luke.com](https://use-the-index-luke.com/)
