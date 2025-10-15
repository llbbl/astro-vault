---
title: BigQuery
tags: [bigquery, google-cloud, data-warehouse, analytics, sql, serverless, big-data]
---

# BigQuery

BigQuery is Google Cloud's serverless data warehouse designed for analytics and massive datasets. Created in 2010, BigQuery can analyze petabytes of data in seconds using standard SQL. For JavaScript/TypeScript developers, BigQuery is ideal for analytics, business intelligence, and processing large-scale data without managing infrastructure.

## What is BigQuery?

**BigQuery** is a **serverless data warehouse**:

```sql
-- Query billions of rows in seconds
SELECT
  user_id,
  COUNT(*) as event_count,
  SUM(revenue) as total_revenue
FROM `project.dataset.events`
WHERE DATE(event_timestamp) >= '2024-01-01'
GROUP BY user_id
HAVING total_revenue > 1000
ORDER BY total_revenue DESC
LIMIT 100;
```

**Key Features:**
- **Serverless**: No infrastructure to manage
- **Scalable**: Query petabytes of data
- **Standard SQL**: Familiar SQL syntax
- **Fast**: Parallel processing across thousands of machines
- **Pay per query**: Only pay for data processed

## Why BigQuery?

### 1. Massive Scale

Handle datasets that would crash traditional databases:

```sql
-- Analyze 10 billion rows in seconds
SELECT
  product_id,
  AVG(price) as avg_price,
  COUNT(*) as total_sales
FROM `bigquery-public-data.thelook_ecommerce.order_items`
GROUP BY product_id
ORDER BY total_sales DESC;
```

### 2. No Infrastructure

Zero server management:

- No provisioning
- Auto-scaling
- No maintenance
- No backups needed (handled automatically)

### 3. Built-in Machine Learning

```sql
-- Create ML model
CREATE MODEL `myproject.mydataset.user_churn_model`
OPTIONS(
  model_type='logistic_reg',
  labels=['churned']
) AS
SELECT
  user_id,
  total_purchases,
  avg_order_value,
  days_since_last_purchase,
  churned
FROM `myproject.mydataset.users`;

-- Predict
SELECT *
FROM ML.PREDICT(
  MODEL `myproject.mydataset.user_churn_model`,
  (SELECT * FROM `myproject.mydataset.new_users`)
);
```

### 4. Real-Time Analytics

```sql
-- Streaming inserts
-- Data available for queries immediately
```

## Using BigQuery with TypeScript

### With @google-cloud/bigquery

```bash
pnpm add @google-cloud/bigquery
```

```typescript
import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({
  projectId: 'your-project-id',
  keyFilename: './service-account-key.json',
});

// Simple query
const query = `
  SELECT
    name,
    email,
    created_at
  FROM \`myproject.mydataset.users\`
  WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  LIMIT 100
`;

const [rows] = await bigquery.query(query);
console.log('Users:', rows);

// Parameterized query (prevents SQL injection)
const queryWithParams = {
  query: `
    SELECT *
    FROM \`myproject.mydataset.users\`
    WHERE email = @email
  `,
  params: { email: 'alice@example.com' },
};

const [rows] = await bigquery.query(queryWithParams);
```

### Type-Safe Queries

```typescript
interface User {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
}

const query = `SELECT * FROM \`myproject.mydataset.users\` LIMIT 10`;
const [rows] = await bigquery.query<User>(query);

// TypeScript knows the shape
rows.forEach((user) => {
  console.log(user.name); // ✓ Type-safe
});
```

### Streaming Inserts

```typescript
async function insertUsers(users: User[]) {
  const dataset = bigquery.dataset('mydataset');
  const table = dataset.table('users');

  await table.insert(users);
  console.log(`Inserted ${users.length} rows`);
}

// Insert data
await insertUsers([
  {
    user_id: '123',
    name: 'Alice',
    email: 'alice@example.com',
    created_at: new Date().toISOString(),
  },
  {
    user_id: '456',
    name: 'Bob',
    email: 'bob@example.com',
    created_at: new Date().toISOString(),
  },
]);
```

### Loading Data from Files

```typescript
// Load CSV
async function loadCSV() {
  const [job] = await bigquery
    .dataset('mydataset')
    .table('users')
    .load('./users.csv', {
      sourceFormat: 'CSV',
      skipLeadingRows: 1,
      autodetect: true,
    });

  console.log(`Job ${job.id} completed`);
}

// Load JSON
async function loadJSON() {
  const [job] = await bigquery
    .dataset('mydataset')
    .table('events')
    .load('./events.json', {
      sourceFormat: 'NEWLINE_DELIMITED_JSON',
      autodetect: true,
    });

  console.log(`Job ${job.id} completed`);
}
```

## Common Patterns

### Event Analytics

```typescript
interface Event {
  event_id: string;
  user_id: string;
  event_type: string;
  event_timestamp: string;
  properties: Record<string, any>;
}

// Track events
async function trackEvent(event: Event) {
  const dataset = bigquery.dataset('analytics');
  const table = dataset.table('events');

  await table.insert([event]);
}

// Query events
const query = `
  SELECT
    event_type,
    COUNT(*) as count,
    COUNT(DISTINCT user_id) as unique_users
  FROM \`myproject.analytics.events\`
  WHERE DATE(event_timestamp) = CURRENT_DATE()
  GROUP BY event_type
  ORDER BY count DESC
`;

const [results] = await bigquery.query(query);
console.log('Today\'s events:', results);
```

### User Funnel Analysis

```sql
-- Conversion funnel
WITH funnel AS (
  SELECT
    user_id,
    MAX(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) as viewed,
    MAX(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END) as added_to_cart,
    MAX(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) as purchased
  FROM `myproject.analytics.events`
  WHERE DATE(event_timestamp) >= '2024-01-01'
  GROUP BY user_id
)
SELECT
  SUM(viewed) as total_views,
  SUM(added_to_cart) as total_adds,
  SUM(purchased) as total_purchases,
  ROUND(SUM(added_to_cart) / SUM(viewed) * 100, 2) as add_to_cart_rate,
  ROUND(SUM(purchased) / SUM(added_to_cart) * 100, 2) as purchase_rate
FROM funnel;
```

### Cohort Analysis

```sql
-- Monthly cohorts
SELECT
  DATE_TRUNC(first_purchase_date, MONTH) as cohort_month,
  DATE_DIFF(purchase_date, first_purchase_date, MONTH) as months_since_first,
  COUNT(DISTINCT user_id) as users,
  SUM(revenue) as total_revenue
FROM (
  SELECT
    user_id,
    purchase_date,
    MIN(purchase_date) OVER (PARTITION BY user_id) as first_purchase_date,
    revenue
  FROM `myproject.analytics.purchases`
)
GROUP BY cohort_month, months_since_first
ORDER BY cohort_month, months_since_first;
```

## BigQuery + Framework Integration

### With Next.js API Routes

```typescript
// app/api/analytics/route.ts
import { BigQuery } from '@google-cloud/bigquery';
import { NextResponse } from 'next/server';

const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || '2024-01-01';

  const query = `
    SELECT
      DATE(event_timestamp) as date,
      COUNT(*) as events,
      COUNT(DISTINCT user_id) as unique_users
    FROM \`${process.env.GCP_PROJECT_ID}.analytics.events\`
    WHERE DATE(event_timestamp) >= @startDate
    GROUP BY date
    ORDER BY date
  `;

  const [rows] = await bigquery.query({
    query,
    params: { startDate },
  });

  return NextResponse.json(rows);
}
```

### With Node.js/Express

```typescript
import express from 'express';
import { BigQuery } from '@google-cloud/bigquery';

const app = express();
const bigquery = new BigQuery();

app.get('/api/analytics', async (req, res) => {
  const query = `
    SELECT *
    FROM \`myproject.analytics.daily_stats\`
    WHERE date >= @startDate
    ORDER BY date DESC
    LIMIT 30
  `;

  const [rows] = await bigquery.query({
    query,
    params: { startDate: req.query.startDate },
  });

  res.json(rows);
});

app.listen(3000);
```

## Partitioning and Clustering

### Partitioned Tables

Improve performance and reduce costs:

```sql
-- Create partitioned table
CREATE TABLE `myproject.dataset.events` (
  event_id STRING,
  user_id STRING,
  event_type STRING,
  event_timestamp TIMESTAMP
)
PARTITION BY DATE(event_timestamp);

-- Query only recent data (scans less data = lower cost)
SELECT *
FROM `myproject.dataset.events`
WHERE DATE(event_timestamp) = '2024-01-15'
  AND event_type = 'purchase';
```

### Clustered Tables

```sql
-- Create clustered table
CREATE TABLE `myproject.dataset.events` (
  event_id STRING,
  user_id STRING,
  event_type STRING,
  event_timestamp TIMESTAMP
)
PARTITION BY DATE(event_timestamp)
CLUSTER BY user_id, event_type;

-- Queries on clustered columns are faster
SELECT *
FROM `myproject.dataset.events`
WHERE user_id = '12345'
  AND event_type = 'purchase';
```

## Cost Optimization

### 1. Query Only Needed Columns

```sql
-- ✓ Good - scans 3 columns
SELECT user_id, name, email
FROM `myproject.dataset.users`;

-- ❌ Bad - scans all columns
SELECT *
FROM `myproject.dataset.users`;
```

### 2. Use Partitioned Tables

```sql
-- ✓ Good - scans 1 day
SELECT *
FROM `myproject.dataset.events`
WHERE DATE(event_timestamp) = '2024-01-15';

-- ❌ Bad - scans entire table
SELECT *
FROM `myproject.dataset.events`
WHERE event_timestamp >= '2024-01-15 00:00:00'
  AND event_timestamp < '2024-01-16 00:00:00';
```

### 3. Use LIMIT for Exploration

```sql
-- ✓ Good for exploration
SELECT *
FROM `myproject.dataset.events`
LIMIT 100;
```

### 4. Materialize Results

```sql
-- Save expensive query results
CREATE TABLE `myproject.dataset.daily_aggregates` AS
SELECT
  DATE(event_timestamp) as date,
  event_type,
  COUNT(*) as count
FROM `myproject.dataset.events`
WHERE DATE(event_timestamp) >= '2024-01-01'
GROUP BY date, event_type;

-- Query pre-aggregated data (much cheaper)
SELECT * FROM `myproject.dataset.daily_aggregates`;
```

## Pricing

**Storage:**
- $0.02 per GB/month (active)
- $0.01 per GB/month (long-term, >90 days)

**Queries:**
- $6.25 per TB processed (on-demand)
- Flat rate: $2,400/month for 500 slots (predictable cost)

**Streaming Inserts:**
- $0.01 per 200 MB

**Example Cost:**
- 100 GB data: ~$2/month storage
- 1 TB query/month: ~$6.25/month
- **Total: ~$8-10/month**

**Free Tier:**
- 10 GB storage/month
- 1 TB queries/month
- Good for small projects!

## BigQuery vs. Traditional Databases

| Feature | BigQuery | [PostgreSQL](/content/databases/postgres) |
|---------|----------|----------|
| **Type** | Data Warehouse | OLTP Database |
| **Best For** | Analytics | Transactions |
| **Scale** | Petabytes | Terabytes |
| **Cost** | Pay per query | Pay for instance |
| **Speed (Analytics)** | Extremely fast | Slower |
| **Speed (Transactions)** | Not designed for this | Fast |
| **Setup** | Zero | Manual |

**Use BigQuery for:**
- Analytics and reporting
- Large-scale data processing
- Business intelligence
- Machine learning on large datasets

**Use PostgreSQL for:**
- Transactional applications
- Real-time updates
- Complex relationships
- ACID guarantees

## Best Practices

### 1. Use Schemas

```typescript
const schema = [
  { name: 'user_id', type: 'STRING', mode: 'REQUIRED' },
  { name: 'name', type: 'STRING', mode: 'NULLABLE' },
  { name: 'email', type: 'STRING', mode: 'REQUIRED' },
  { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
];

await bigquery.dataset('mydataset').table('users').create({ schema });
```

### 2. Batch Inserts

```typescript
// ✓ Good - batch inserts
const users = [...]; // 1000 users
await table.insert(users);

// ❌ Bad - individual inserts
for (const user of users) {
  await table.insert([user]); // Expensive!
}
```

### 3. Use Views

```sql
-- Create view for common query
CREATE VIEW `myproject.dataset.active_users` AS
SELECT *
FROM `myproject.dataset.users`
WHERE status = 'active'
  AND last_login >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY);

-- Query view
SELECT COUNT(*) FROM `myproject.dataset.active_users`;
```

## Key Takeaways

- **Serverless data warehouse** for analytics
- **Query petabytes** of data in seconds
- **Pay per query** ($6.25/TB processed)
- **Standard SQL** syntax
- **Built-in ML** for predictions
- **Free tier**: 1 TB queries/month
- **Use for** analytics, BI, big data
- **Not for** transactional applications

## Related Topics

- [Databases Overview](/content/databases/databases-overview) - Compare all database types
- [PostgreSQL](/content/databases/postgres) - Transactional database alternative
- [Node.js](/content/runtimes/nodejs) - Popular runtime for BigQuery clients
- [TypeScript](/content/languages/typescript) - Type-safe BigQuery queries

BigQuery is ideal for analytics and business intelligence on large datasets. Its serverless nature means zero infrastructure management, and its generous free tier makes it accessible for small projects. Use it alongside a transactional database like PostgreSQL for a complete data stack.
