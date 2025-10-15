---
title: Firebase
tags: [firebase, firestore, realtime-database, nosql, google, auth, baas, backend]
---

# Firebase

Firebase is Google's Backend-as-a-Service (BaaS) platform that provides databases, authentication, hosting, cloud functions, and more. Created in 2011 and acquired by Google in 2014, Firebase is especially popular for mobile apps and real-time web applications. For JavaScript/TypeScript developers, Firebase offers instant backend functionality without managing servers.

## What is Firebase?

**Firebase** is a **comprehensive app platform** with multiple services:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Initialize Firebase
const app = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'myapp.firebaseapp.com',
  projectId: 'myapp',
});

// Use services
const db = getFirestore(app);
const auth = getAuth(app);

// Add document to Firestore
await addDoc(collection(db, 'users'), {
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date(),
});

// Sign in user
await signInWithEmailAndPassword(auth, email, password);
```

**Core Services:**
- **Firestore**: NoSQL document database
- **Realtime Database**: Real-time JSON database
- **Authentication**: User authentication
- **Cloud Functions**: Serverless backend code
- **Hosting**: Static file hosting
- **Storage**: File/image storage
- **Analytics**: App analytics

## Firebase Firestore

**Firestore** is Firebase's modern NoSQL database:

### Document Model

```javascript
// Firestore structure
myapp/
  users/
    user1/
      name: "Alice"
      email: "alice@example.com"
      posts/
        post1/
          title: "First Post"
          content: "Hello World"
```

### Basic Operations

```typescript
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

const db = getFirestore();

// Create (auto-generated ID)
const docRef = await addDoc(collection(db, 'users'), {
  name: 'Alice',
  email: 'alice@example.com',
  age: 25,
  createdAt: new Date(),
});

console.log('Document ID:', docRef.id);

// Create (custom ID)
await setDoc(doc(db, 'users', 'alice123'), {
  name: 'Alice',
  email: 'alice@example.com',
});

// Read single document
const docSnap = await getDoc(doc(db, 'users', docRef.id));
if (docSnap.exists()) {
  console.log(docSnap.data());
}

// Read collection
const querySnapshot = await getDocs(collection(db, 'users'));
querySnapshot.forEach((doc) => {
  console.log(doc.id, doc.data());
});

// Query
const q = query(collection(db, 'users'), where('age', '>=', 18));
const querySnapshot = await getDocs(q);

// Update
await updateDoc(doc(db, 'users', docRef.id), {
  age: 26,
});

// Delete
await deleteDoc(doc(db, 'users', docRef.id));
```

### Real-Time Updates

```typescript
import { onSnapshot } from 'firebase/firestore';

// Listen to document changes
const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
  console.log('Current data:', doc.data());
});

// Listen to collection changes
const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
  snapshot.forEach((doc) => {
    console.log('User:', doc.data());
  });
});

// Cleanup
unsubscribe();
```

### Queries

```typescript
import { query, where, orderBy, limit } from 'firebase/firestore';

// Simple query
const q = query(
  collection(db, 'users'),
  where('age', '>=', 18)
);

// Multiple conditions
const q = query(
  collection(db, 'users'),
  where('age', '>=', 18),
  where('status', '==', 'active')
);

// Ordering and limiting
const q = query(
  collection(db, 'posts'),
  orderBy('createdAt', 'desc'),
  limit(10)
);

// Range query
const q = query(
  collection(db, 'users'),
  where('age', '>=', 18),
  where('age', '<=', 65)
);

// Array contains
const q = query(
  collection(db, 'posts'),
  where('tags', 'array-contains', 'javascript')
);

// In query
const q = query(
  collection(db, 'users'),
  where('status', 'in', ['active', 'pending'])
);
```

## Firebase Authentication

Built-in authentication with multiple providers:

### Email/Password

```typescript
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const auth = getAuth();

// Sign up
const userCredential = await createUserWithEmailAndPassword(
  auth,
  'alice@example.com',
  'password123'
);
console.log('User:', userCredential.user);

// Sign in
const userCredential = await signInWithEmailAndPassword(
  auth,
  'alice@example.com',
  'password123'
);

// Sign out
await signOut(auth);

// Listen to auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Signed in:', user.uid);
  } else {
    console.log('Signed out');
  }
});
```

### Social Providers

```typescript
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Google Sign-In
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
console.log('User:', result.user);
```

**Supported Providers:**
- Email/Password
- Google
- Facebook
- Twitter
- GitHub
- Phone (SMS)
- Anonymous
- Custom (your own auth system)

### Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Anyone can read posts, but only authenticated users can create
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }
  }
}
```

## Using Firebase with TypeScript

### Type-Safe Firestore

```typescript
interface User {
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

// Type-safe collection reference
import { CollectionReference, DocumentData } from 'firebase/firestore';

const usersCollection = collection(db, 'users') as CollectionReference<User>;

// Add with types
await addDoc(usersCollection, {
  name: 'Alice',
  email: 'alice@example.com',
  age: 25,
  createdAt: new Date(),
});

// Query with types
const q = query(usersCollection, where('age', '>=', 18));
const snapshot = await getDocs(q);

snapshot.forEach((doc) => {
  const user = doc.data(); // TypeScript knows this is User
  console.log(user.name); // ✓ Type-safe
});
```

### Firebase Admin SDK (Server-Side)

```typescript
import admin from 'firebase-admin';

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
});

const db = admin.firestore();

// Server-side operations (bypass security rules)
const users = await db.collection('users').get();
users.forEach((doc) => {
  console.log(doc.id, doc.data());
});

// Verify ID token
const decodedToken = await admin.auth().verifyIdToken(idToken);
console.log('User ID:', decodedToken.uid);
```

## Firebase Cloud Functions

Serverless backend code:

```typescript
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

// HTTP function
export const helloWorld = onRequest((req, res) => {
  res.send('Hello from Firebase!');
});

// Firestore trigger
export const onUserCreated = onDocumentCreated('users/{userId}', (event) => {
  const userData = event.data?.data();
  console.log('New user:', userData);

  // Send welcome email, etc.
});

// Scheduled function
export const dailyCleanup = onSchedule('every day 00:00', async () => {
  // Clean up old data
});
```

## Firebase + Framework Integration

### With React

```tsx
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### With Next.js

```typescript
// app/api/users/route.ts
import admin from 'firebase-admin';
import { NextResponse } from 'next/server';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function GET() {
  const db = admin.firestore();
  const snapshot = await db.collection('users').get();
  const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(users);
}
```

## Firebase Hosting

Deploy static sites and web apps:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init hosting

# Deploy
firebase deploy --only hosting
```

```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Firebase Storage

Store and serve user-generated files:

```typescript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

// Upload file
const storageRef = ref(storage, `images/${file.name}`);
await uploadBytes(storageRef, file);

// Get download URL
const url = await getDownloadURL(storageRef);
console.log('File URL:', url);

// Upload from input
function handleFileUpload(event) {
  const file = event.target.files[0];
  const storageRef = ref(storage, `uploads/${file.name}`);

  uploadBytes(storageRef, file).then((snapshot) => {
    console.log('Uploaded!', snapshot);
  });
}
```

## Firebase Realtime Database vs. Firestore

| Feature | Firestore | Realtime Database |
|---------|-----------|-------------------|
| **Data Model** | Collections & Documents | JSON Tree |
| **Queries** | Rich queries | Limited queries |
| **Scaling** | Automatic | Manual sharding |
| **Offline** | Advanced | Basic |
| **Pricing** | Per operation | Per GB stored |
| **Best For** | New projects | Simple apps |

**Recommendation**: Use **Firestore** for new projects.

## Pricing

**Free Tier (Spark Plan):**
- 1 GB storage
- 50K reads/day
- 20K writes/day
- 20K deletes/day
- Authentication (unlimited)

**Pay-as-you-go (Blaze Plan):**
- $0.18 per GB stored
- $0.06 per 100K reads
- $0.18 per 100K writes
- $0.02 per 100K deletes

**Example Cost (10M reads/month):**
- Firestore: ~$6/month
- Hosting: Free (10 GB/month)
- Functions: $0.40 per million invocations

## Firebase vs. Supabase vs. MongoDB

| Feature | Firebase | [Supabase](/content/databases/supabase) | [MongoDB](/content/databases/mongodb) |
|---------|----------|----------|----------|
| **Type** | NoSQL | PostgreSQL (SQL) | NoSQL |
| **Real-time** | Yes | Yes | Change Streams |
| **Auth** | Built-in | Built-in | Third-party |
| **Storage** | Built-in | Built-in | GridFS |
| **Functions** | Built-in | Edge Functions | Atlas Functions |
| **Pricing** | Pay per use | $25/month | Atlas ($9+/month) |
| **Open Source** | No | Yes | Yes |

## Best Practices

### 1. Structure Data for Queries

```typescript
// ✓ Good - can query by status
{
  status: 'active',
  name: 'Alice',
}

// ❌ Bad - can't query nested object
{
  metadata: {
    status: 'active',
  },
}
```

### 2. Use Subcollections

```typescript
// ✓ Good - subcollections
users/{userId}/posts/{postId}

// Access
const postsRef = collection(db, 'users', userId, 'posts');
```

### 3. Batch Writes

```typescript
import { writeBatch } from 'firebase/firestore';

const batch = writeBatch(db);

batch.set(doc(db, 'users', 'alice'), { name: 'Alice' });
batch.set(doc(db, 'users', 'bob'), { name: 'Bob' });
batch.update(doc(db, 'stats', 'userCount'), { count: 2 });

await batch.commit();
```

### 4. Use Security Rules

```javascript
// Validate data structure
match /posts/{postId} {
  allow create: if request.auth != null
    && request.resource.data.title is string
    && request.resource.data.title.size() <= 100;
}
```

## Key Takeaways

- **Backend-as-a-Service** with database, auth, hosting, functions
- **Firestore**: NoSQL document database with real-time updates
- **Built-in authentication** with multiple providers
- **Cloud Functions** for serverless backend code
- **Great for** rapid development, mobile apps, real-time features
- **Free tier** is generous for side projects
- **Not open source** (vendor lock-in risk)

## Related Topics

- [Supabase](/content/databases/supabase) - Open-source Firebase alternative
- [MongoDB](/content/databases/mongodb) - Alternative NoSQL database
- [Databases Overview](/content/databases/databases-overview) - Compare all databases
- [React](/content/frameworks/react) - Popular framework for Firebase apps
- [Next.js](/content/frameworks/nextjs) - Full-stack framework with Firebase

Firebase is excellent for getting started quickly with real-time features and built-in authentication. Its generous free tier and comprehensive platform make it ideal for side projects and MVPs. However, consider Supabase if you prefer open-source or need SQL features.
