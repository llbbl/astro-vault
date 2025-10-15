---
title: Full-Text Search in Databases
tags: [search, full-text, postgresql, mysql, indexing]
---

# Full-Text Search in Databases

Full-text search is a database feature that enables fast, ranked text searching with linguistic awareness. It's 10-100x faster than LIKE queries and understands language concepts like stemming, stop words, and relevance ranking.

## How Full-Text Search Works

### Inverted Index

Instead of scanning documents, full-text search uses an inverted index:

```
Traditional table:
doc1 → "javascript async programming"
doc2 → "async functions in javascript"
doc3 → "python async programming"

Inverted index:
"javascript" → [doc1, doc2]
"async"      → [doc1, doc2, doc3]
"programming" → [doc1, doc3]
"functions"   → [doc2]
"python"      → [doc3]
```

**Lookup Process:**
```sql
-- Search for "javascript async"
1. Lookup "javascript" → [doc1, doc2]
2. Lookup "async"      → [doc1, doc2, doc3]
3. Intersection        → [doc1, doc2]
4. Rank by relevance   → doc2 (both terms in title), doc1
```

### Lexing and Stemming

Full-text search preprocesses text:

```
Input: "The developer is developing a JavaScript application"

1. Tokenization: ["The", "developer", "is", "developing", "a", "JavaScript", "application"]

2. Lowercasing: ["the", "developer", "is", "developing", "a", "javascript", "application"]

3. Stop word removal: ["developer", "developing", "javascript", "application"]

4. Stemming: ["develop", "develop", "javascript", "applic"]

Index: develop(2), javascript(1), applic(1)
```

## PostgreSQL Full-Text Search

### Setup
```sql
-- Add tsvector column for indexed search
ALTER TABLE articles
ADD COLUMN search_vector tsvector;

-- Create GIN index for fast lookups
CREATE INDEX idx_search_vector
ON articles USING GIN(search_vector);

-- Populate search vector
UPDATE articles
SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(tags, '')), 'C');
```

### Basic Search
```sql
-- Simple search
SELECT title, content
FROM articles
WHERE search_vector @@ to_tsquery('english', 'javascript');

-- Multiple terms (AND)
SELECT title, content
FROM articles
WHERE search_vector @@ to_tsquery('english', 'javascript & async');

-- Multiple terms (OR)
SELECT title, content
FROM articles
WHERE search_vector @@ to_tsquery('english', 'javascript | typescript');

-- Phrase search
SELECT title, content
FROM articles
WHERE search_vector @@ phraseto_tsquery('english', 'async function');
```

### Ranking Results
```sql
-- Rank by relevance
SELECT
  title,
  ts_rank(search_vector, query) as rank
FROM articles,
  to_tsquery('english', 'javascript & async') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 10;

-- Advanced ranking (prefer title matches)
SELECT
  title,
  ts_rank_cd(search_vector, query) as rank
FROM articles,
  to_tsquery('english', 'javascript') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

### Highlighting Results
```sql
-- Show matching snippets
SELECT
  title,
  ts_headline('english', content, query, 'MaxWords=20, MinWords=10') as snippet
FROM articles,
  to_tsquery('english', 'javascript') query
WHERE search_vector @@ query;

-- Output:
-- "Learn <b>JavaScript</b> async patterns and best practices..."
```

### Auto-Update with Triggers
```sql
-- Automatically update search_vector on insert/update
CREATE FUNCTION articles_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.tags, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_search_vector_trigger
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION articles_search_vector_update();
```

## MySQL Full-Text Search

### Setup (InnoDB)
```sql
-- Create full-text index
CREATE FULLTEXT INDEX idx_fulltext
ON articles(title, content);

-- Or add to existing table
ALTER TABLE articles
ADD FULLTEXT INDEX idx_fulltext(title, content);
```

### Basic Search
```sql
-- Natural language mode (default)
SELECT title, content,
  MATCH(title, content) AGAINST('javascript async') as relevance
FROM articles
WHERE MATCH(title, content) AGAINST('javascript async')
ORDER BY relevance DESC;

-- Boolean mode (AND, OR, NOT)
SELECT title, content
FROM articles
WHERE MATCH(title, content)
  AGAINST('+javascript +async' IN BOOLEAN MODE);

-- Exclude terms
SELECT title, content
FROM articles
WHERE MATCH(title, content)
  AGAINST('javascript -typescript' IN BOOLEAN MODE);

-- Phrase search
SELECT title, content
FROM articles
WHERE MATCH(title, content)
  AGAINST('"async function"' IN BOOLEAN MODE);
```

### Relevance Tuning
```sql
-- Minimum word length (default: 4)
-- In my.cnf:
-- ft_min_word_len = 3

-- Stop words configuration
-- Custom stop words list
SET GLOBAL innodb_ft_user_stopword_table = 'mydb/my_stopwords';
```

## SQLite Full-Text Search (FTS5)

### Setup
```sql
-- Create FTS5 virtual table
CREATE VIRTUAL TABLE articles_fts USING fts5(
  title,
  content,
  tags,
  content='articles',
  content_rowid='id'
);

-- Populate from main table
INSERT INTO articles_fts(rowid, title, content, tags)
SELECT id, title, content, tags FROM articles;

-- Trigger to keep in sync
CREATE TRIGGER articles_ai AFTER INSERT ON articles BEGIN
  INSERT INTO articles_fts(rowid, title, content, tags)
  VALUES (NEW.id, NEW.title, NEW.content, NEW.tags);
END;

CREATE TRIGGER articles_au AFTER UPDATE ON articles BEGIN
  UPDATE articles_fts
  SET title = NEW.title, content = NEW.content, tags = NEW.tags
  WHERE rowid = NEW.id;
END;

CREATE TRIGGER articles_ad AFTER DELETE ON articles BEGIN
  DELETE FROM articles_fts WHERE rowid = OLD.id;
END;
```

### Search
```sql
-- Basic search
SELECT title, content
FROM articles_fts
WHERE articles_fts MATCH 'javascript';

-- Boolean operators
SELECT title, content
FROM articles_fts
WHERE articles_fts MATCH 'javascript AND async';

-- Phrase search
SELECT title, content
FROM articles_fts
WHERE articles_fts MATCH '"async function"';

-- Column-specific search
SELECT title, content
FROM articles_fts
WHERE articles_fts MATCH 'title:javascript';

-- With ranking
SELECT
  articles.title,
  articles.content,
  bm25(articles_fts) as rank
FROM articles_fts
JOIN articles ON articles.id = articles_fts.rowid
WHERE articles_fts MATCH 'javascript'
ORDER BY rank;
```

## Performance Comparison

### Benchmark (1 million documents)

| Method | Query Time | Index Size | Setup |
|--------|------------|------------|-------|
| LIKE '%term%' | 2000ms | 0 MB | None |
| PostgreSQL FTS | 10ms | 50 MB | GIN index |
| MySQL FTS | 15ms | 40 MB | FULLTEXT index |
| SQLite FTS5 | 12ms | 45 MB | Virtual table |

### Indexing Time

| Database | Initial Index | Incremental Update |
|----------|---------------|-------------------|
| PostgreSQL | 30s (1M docs) | 10ms per doc |
| MySQL | 45s (1M docs) | 15ms per doc |
| SQLite | 25s (1M docs) | 8ms per doc |

## Advanced Features

### Fuzzy Matching (PostgreSQL)
```sql
-- Using pg_trgm extension
CREATE EXTENSION pg_trgm;

CREATE INDEX idx_trigram ON articles USING GIN (content gin_trgm_ops);

-- Similarity search
SELECT title, similarity(content, 'javascrpt') as sim
FROM articles
WHERE content % 'javascrpt'  -- Finds "javascript" despite typo
ORDER BY sim DESC;
```

### Custom Dictionaries (PostgreSQL)
```sql
-- Create custom dictionary for tech terms
CREATE TEXT SEARCH DICTIONARY tech_dict (
  TEMPLATE = synonym,
  SYNONYMS = tech_synonyms
);

-- tech_synonyms file:
-- js → javascript
-- ts → typescript
-- py → python

-- Use in configuration
CREATE TEXT SEARCH CONFIGURATION tech_english (COPY = english);
ALTER TEXT SEARCH CONFIGURATION tech_english
  ALTER MAPPING FOR asciiword WITH tech_dict, english_stem;
```

### Boosting Fields
```sql
-- PostgreSQL: Weight title 4x, content 1x
UPDATE articles
SET search_vector =
  setweight(to_tsvector('english', title), 'A') ||  -- Weight: 1.0
  setweight(to_tsvector('english', content), 'D');  -- Weight: 0.1

-- Ranks title matches much higher
```

## Limitations of Full-Text Search

### 1. Language Understanding
```sql
-- Doesn't understand synonyms
-- Search "car" won't find "automobile", "vehicle"

-- Doesn't understand concepts
-- Search "deploy application" won't find "push to production"
```

### 2. No Semantic Understanding
```sql
-- Can't understand user intent
-- "best laptop for programming" → searches for exact words
-- Doesn't know "best" implies ranking, "for" is just a preposition
```

### 3. Exact Text Matching
```sql
-- Finds documents with the words, not the meaning
-- "python programming" finds docs with both words
-- But "learn python" might be more relevant even without "programming"
```

### 4. No Cross-Language Search
```sql
-- English stemmer doesn't help with other languages
-- Need separate configurations for each language
```

### 5. Complex Ranking
```sql
-- Ranking is based on term frequency and document length
-- Can't incorporate:
--   - User behavior (clicks, time on page)
--   - Document popularity
--   - Freshness
--   - Business logic
```

## When to Use Full-Text Search

### ✅ Good Use Cases
- **Documentation sites**: Search API references, guides
- **Blog search**: Find articles by keywords
- **E-commerce**: Basic product search
- **Internal tools**: Employee directory, knowledge base
- **Content management**: Find pages, articles

### ❌ When to Consider Alternatives
- **Natural language**: "how do I deploy my app?" → Use semantic search
- **Typo tolerance**: Heavy misspellings → Use Algolia/Elasticsearch
- **Multi-language**: Global sites → Use dedicated search service
- **Complex ranking**: ML-based relevance → Use Elasticsearch or semantic search
- **Scale**: Billions of documents → Use distributed search

## Full-Text vs Semantic Search

| Feature | Full-Text | Semantic |
|---------|-----------|----------|
| Speed | 10-20ms | 50-100ms |
| Understanding | Keywords | Meaning |
| Typos | Limited | Better |
| Synonyms | Manual | Automatic |
| Setup | Built-in | Requires ML model |
| Resource usage | Low | Medium |

### Hybrid Approach
```sql
-- Combine both for best results
WITH fulltext_results AS (
  SELECT id, ts_rank(search_vector, query) * 2 as score
  FROM articles
  WHERE search_vector @@ to_tsquery('javascript')
),
semantic_results AS (
  SELECT id, vector_distance_cos(embedding, query_vector) as score
  FROM articles
  ORDER BY score DESC
  LIMIT 20
)
SELECT articles.*, (COALESCE(f.score, 0) + COALESCE(s.score, 0)) as final_score
FROM articles
LEFT JOIN fulltext_results f ON articles.id = f.id
LEFT JOIN semantic_results s ON articles.id = s.id
WHERE f.id IS NOT NULL OR s.id IS NOT NULL
ORDER BY final_score DESC;
```

## Resources

- **PostgreSQL FTS**: [postgresql.org/docs/current/textsearch](https://www.postgresql.org/docs/current/textsearch.html)
- **MySQL FTS**: [dev.mysql.com/doc/refman/fulltext-search](https://dev.mysql.com/doc/refman/8.0/en/fulltext-search.html)
- **SQLite FTS5**: [sqlite.org/fts5](https://www.sqlite.org/fts5.html)
- **Full-Text Search Explained**: [blog.crunchydata.com/postgres-full-text-search](https://www.crunchydata.com/blog/postgres-full-text-search-a-search-engine-in-a-database)
