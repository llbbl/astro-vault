---
title: MongoDB
tags: [mongodb, nosql, database, document, json, mongoose, flexible-schema]
---

# MongoDB

MongoDB is the world's most popular NoSQL database. Created in 2009, it stores data as flexible JSON-like documents instead of rigid tables. For JavaScript/TypeScript developers, MongoDB feels natural because it works directly with JavaScript objects, making it easy to store and query data without complex ORM mappings.

## What is MongoDB?

**MongoDB** is a **document database** that stores data as JSON-like documents:

```javascript
// MongoDB document (similar to JavaScript object)
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "Alice",
  "email": "alice@example.com",
  "age": 25,
  "posts": [
    { "title": "First Post", "likes": 10 },
    { "title": "Second Post", "likes": 25 }
  ],
  "createdAt": ISODate("2024-01-15T10:30:00Z")
}
```

**Key Features:**
- **Flexible schema**: No rigid table structure
- **Document-oriented**: Store data as JSON-like documents
- **Horizontal scaling**: Sharding for massive datasets
- **Rich queries**: Complex queries and aggregations
- **Indexes**: Fast lookups on any field

## Why MongoDB?

### 1. Flexible Schema

No need to define schema upfront:

```javascript
// Different users can have different fields
db.users.insertMany([
  {
    name: 'Alice',
    email: 'alice@example.com',
    age: 25,
  },
  {
    name: 'Bob',
    email: 'bob@example.com',
    // No age field - totally fine
    phone: '555-1234',
  },
]);
```

### 2. Nested Data

Store related data together:

```javascript
// User with embedded posts
{
  "_id": ObjectId("..."),
  "name": "Alice",
  "email": "alice@example.com",
  "posts": [
    {
      "title": "My First Post",
      "content": "Hello World",
      "tags": ["javascript", "tutorial"],
      "createdAt": ISODate("2024-01-15")
    },
    {
      "title": "Learning MongoDB",
      "content": "NoSQL is great",
      "tags": ["mongodb", "nosql"],
      "createdAt": ISODate("2024-01-16")
    }
  ]
}
```

No joins needed - everything is in one document!

### 3. Native JavaScript Integration

Works directly with JavaScript objects:

```javascript
// JavaScript object
const user = {
  name: 'Alice',
  email: 'alice@example.com',
  posts: [],
};

// Insert directly into MongoDB
await db.collection('users').insertOne(user);

// Query returns JavaScript objects
const foundUser = await db.collection('users').findOne({ name: 'Alice' });
console.log(foundUser.email); // 'alice@example.com'
```

## Using MongoDB with TypeScript

### With Mongoose (Recommended)

**Mongoose** is the most popular MongoDB ODM (Object Document Mapper):

```bash
pnpm add mongoose
```

```typescript
import mongoose from 'mongoose';

// Connect
await mongoose.connect(process.env.MONGODB_URI);

// Define schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number,
  posts: [{
    title: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

// Create model
const User = mongoose.model('User', userSchema);

// Create user
const user = new User({
  name: 'Alice',
  email: 'alice@example.com',
  age: 25,
});
await user.save();

// Or use create
const user2 = await User.create({
  name: 'Bob',
  email: 'bob@example.com',
});

// Query
const users = await User.find({ age: { $gte: 18 } });
const alice = await User.findOne({ email: 'alice@example.com' });

// Update
await User.updateOne(
  { email: 'alice@example.com' },
  { $set: { age: 26 } }
);

// Delete
await User.deleteOne({ email: 'alice@example.com' });
```

### With TypeScript Types

```typescript
interface IUser {
  name: string;
  email: string;
  age?: number;
  posts: {
    title: string;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number,
  posts: [{
    title: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>('User', userSchema);

// Type-safe!
const user = await User.findOne({ email: 'alice@example.com' });
console.log(user?.name); // TypeScript knows this is a string
```

### With Native MongoDB Driver

```typescript
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

const db = client.db('myapp');
const users = db.collection<IUser>('users');

// Insert
const result = await users.insertOne({
  name: 'Alice',
  email: 'alice@example.com',
  age: 25,
  posts: [],
  createdAt: new Date(),
});

console.log(result.insertedId);

// Find
const user = await users.findOne({ email: 'alice@example.com' });

// Find many
const allUsers = await users.find({ age: { $gte: 18 } }).toArray();

// Update
await users.updateOne(
  { email: 'alice@example.com' },
  { $set: { age: 26 } }
);

// Delete
await users.deleteOne({ email: 'alice@example.com' });
```

## Query Operators

### Comparison

```javascript
// Greater than
db.users.find({ age: { $gt: 18 } });

// Greater than or equal
db.users.find({ age: { $gte: 18 } });

// Less than
db.users.find({ age: { $lt: 65 } });

// In array
db.users.find({ status: { $in: ['active', 'pending'] } });

// Not equal
db.users.find({ status: { $ne: 'deleted' } });
```

### Logical

```javascript
// AND
db.users.find({
  age: { $gte: 18 },
  status: 'active',
});

// OR
db.users.find({
  $or: [
    { age: { $lt: 18 } },
    { status: 'inactive' },
  ],
});

// NOT
db.users.find({ age: { $not: { $gte: 18 } } });
```

### Array Operators

```javascript
// Array contains
db.users.find({ tags: 'javascript' });

// Array size
db.users.find({ tags: { $size: 3 } });

// All elements match
db.users.find({ tags: { $all: ['javascript', 'typescript'] } });

// Element match
db.posts.find({
  comments: {
    $elemMatch: { author: 'Alice', likes: { $gte: 10 } },
  },
});
```

## Aggregation Pipeline

Powerful data processing:

```javascript
// Group and count
const result = await User.aggregate([
  { $match: { status: 'active' } },
  { $group: {
    _id: '$age',
    count: { $sum: 1 },
    avgPosts: { $avg: { $size: '$posts' } },
  }},
  { $sort: { count: -1 } },
  { $limit: 10 },
]);

// Lookup (join)
const usersWithPosts = await User.aggregate([
  {
    $lookup: {
      from: 'posts',
      localField: '_id',
      foreignField: 'authorId',
      as: 'posts',
    },
  },
]);

// Project (select fields)
const users = await User.aggregate([
  { $project: {
    name: 1,
    email: 1,
    postCount: { $size: '$posts' },
  }},
]);
```

## Indexing

```javascript
// Create index
await User.collection.createIndex({ email: 1 }); // 1 = ascending

// Compound index
await User.collection.createIndex({ age: 1, name: 1 });

// Unique index
await User.collection.createIndex({ email: 1 }, { unique: true });

// Text index (for search)
await User.collection.createIndex({ name: 'text', bio: 'text' });

// Search with text index
const results = await User.find({
  $text: { $search: 'alice developer' },
});
```

## Common Patterns

### User Authentication

```typescript
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Register
const passwordHash = await bcrypt.hash(password, 10);
const user = await User.create({
  email,
  passwordHash,
});

// Login
const user = await User.findOne({ email });
if (user && await bcrypt.compare(password, user.passwordHash)) {
  // Valid login
}
```

### Pagination

```typescript
// Offset pagination
const page = 1;
const pageSize = 20;

const posts = await Post.find()
  .sort({ createdAt: -1 })
  .skip((page - 1) * pageSize)
  .limit(pageSize);

const total = await Post.countDocuments();

// Cursor pagination (better for large datasets)
const posts = await Post.find({ _id: { $gt: lastPostId } })
  .sort({ _id: 1 })
  .limit(20);
```

### Relationships

**Embedded (one-to-few):**

```typescript
// User has few posts - embed them
const userSchema = new mongoose.Schema({
  name: String,
  posts: [{
    title: String,
    content: String,
  }],
});
```

**Referenced (one-to-many):**

```typescript
// User has many posts - reference them
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// Populate (join)
const posts = await Post.find().populate('authorId');
console.log(posts[0].authorId.name); // User name
```

## MongoDB + Framework Integration

### With Next.js

```typescript
// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

```typescript
// app/api/users/route.ts
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectToDatabase();
  const users = await User.find();
  return NextResponse.json(users);
}
```

### With Node.js/Express

```typescript
import express from 'express';
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGODB_URI);

const app = express();
app.use(express.json());

app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

app.listen(3000);
```

## MongoDB Atlas (Cloud)

**MongoDB Atlas** is the official cloud offering:

```bash
# Connection string
mongodb+srv://username:password@cluster.mongodb.net/mydb
```

**Features:**
- Free tier (512 MB)
- Auto-scaling
- Backups
- Monitoring
- Global clusters

**Pricing:**
- **Free**: M0 (512 MB)
- **Shared**: M2/M5 ($9-25/month)
- **Dedicated**: M10+ ($57+/month)

## MongoDB vs. PostgreSQL

| Feature | MongoDB | [PostgreSQL](/content/databases/postgres) |
|---------|---------|----------|
| **Type** | NoSQL Document | Relational SQL |
| **Schema** | Flexible | Strict |
| **Joins** | Limited | Powerful |
| **Transactions** | Yes (v4+) | Yes (ACID) |
| **Scalability** | Horizontal | Vertical + Horizontal |
| **JSON** | Native | JSONB |
| **Best For** | Flexible data | Structured data |

**When to use MongoDB:**
- Rapid development
- Flexible/changing schema
- Hierarchical data
- High write throughput

**When to use PostgreSQL:**
- Complex queries and joins
- Strong consistency
- ACID guarantees
- Structured data

## Performance Tips

### 1. Use Indexes

```javascript
// Create indexes on frequently queried fields
await User.collection.createIndex({ email: 1 });
await Post.collection.createIndex({ authorId: 1, createdAt: -1 });
```

### 2. Select Only Needed Fields

```javascript
// ✓ Good - select only needed fields
const users = await User.find().select('name email');

// ❌ Bad - fetches everything
const users = await User.find();
```

### 3. Use Lean Queries

```javascript
// ✓ Good - returns plain JavaScript object (faster)
const users = await User.find().lean();

// ❌ Bad - returns Mongoose document (slower)
const users = await User.find();
```

### 4. Limit Results

```javascript
// ✓ Good - limit results
const users = await User.find().limit(100);

// ❌ Bad - fetches everything
const users = await User.find();
```

## Key Takeaways

- **Most popular NoSQL database**
- **Flexible schema** - great for rapid development
- **Document-oriented** - store data as JSON
- **Use Mongoose** for TypeScript support
- **MongoDB Atlas** for cloud hosting (free tier available)
- **Choose MongoDB** for flexible schemas, rapid iteration
- **Choose PostgreSQL** for complex queries, strong consistency

## Related Topics

- [PostgreSQL](/content/databases/postgres) - Relational alternative
- [Firebase](/content/databases/firebase) - Alternative NoSQL with real-time features
- [Databases Overview](/content/databases/databases-overview) - Compare all database types
- [Node.js](/content/runtimes/nodejs) - Popular runtime for MongoDB
- [TypeScript](/content/languages/typescript) - Type-safe MongoDB queries

MongoDB is excellent for rapid development when your data model is still evolving. Its flexible schema and native JavaScript integration make it a natural fit for JavaScript/TypeScript developers. Use Mongoose for the best developer experience, and MongoDB Atlas for easy cloud hosting.
