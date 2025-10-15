---
title: Next.js
tags: [nextjs, react, framework, full-stack, ssr, ssg, vercel, typescript]
---

# Next.js

Next.js is a full-stack [React](/content/frameworks/react) framework created by Vercel that has become the de facto standard for building production React applications. It provides server-side rendering, static site generation, API routes, and an exceptional developer experience out of the box.

## What is Next.js?

Next.js extends [React](/content/frameworks/react) with powerful features for building modern web applications:

```jsx
// pages/index.js - A simple Next.js page
export default function Home() {
  return (
    <div>
      <h1>Welcome to Next.js</h1>
      <p>The React Framework for Production</p>
    </div>
  );
}
```

**Key Philosophy:**
- **Hybrid rendering**: Choose SSR, SSG, or client-side per page
- **File-based routing**: No router configuration needed
- **API routes**: Build backend endpoints alongside frontend
- **Optimizations**: Image, font, and script optimizations built-in

## Why Next.js?

### 1. File-Based Routing

No need to configure routes - the file system is your router:

```
pages/
  index.js          → /
  about.js          → /about
  blog/
    index.js        → /blog
    [slug].js       → /blog/:slug
  api/
    users.js        → /api/users
```

```jsx
// pages/blog/[slug].js
import { useRouter } from 'next/router';

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;

  return <h1>Blog Post: {slug}</h1>;
}
```

### 2. Multiple Rendering Strategies

Choose the best rendering method for each page:

**Static Generation (SSG):**
```jsx
// Pre-rendered at build time
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data } };
}

export default function Page({ data }) {
  return <div>{data}</div>;
}
```

**Server-Side Rendering (SSR):**
```jsx
// Rendered on each request
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}

export default function Page({ data }) {
  return <div>{data}</div>;
}
```

**Client-Side:**
```jsx
// Rendered in browser (like regular React)
import { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{data}</div>;
}
```

**Incremental Static Regeneration (ISR):**
```jsx
// Rebuild static pages in background
export async function getStaticProps() {
  const data = await fetchData();

  return {
    props: { data },
    revalidate: 60, // Re-generate page every 60 seconds
  };
}
```

### 3. API Routes

Build full-stack apps with backend endpoints:

```javascript
// pages/api/users.js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const users = await db.users.findMany();
    res.status(200).json(users);
  } else if (req.method === 'POST') {
    const user = await db.users.create({
      data: req.body,
    });
    res.status(201).json(user);
  }
}
```

**Usage from frontend:**
```jsx
// pages/users.js
export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 4. Built-in Optimizations

**Image Optimization:**
```jsx
import Image from 'next/image';

export default function Profile() {
  return (
    <Image
      src="/profile.jpg"
      alt="Profile"
      width={500}
      height={500}
      // Automatic optimization, lazy loading, responsive images
    />
  );
}
```

**Font Optimization:**
```jsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function MyApp({ Component, pageProps }) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
}
```

**Script Optimization:**
```jsx
import Script from 'next/script';

export default function Home() {
  return (
    <>
      <Script
        src="https://analytics.example.com/script.js"
        strategy="lazyOnload"
      />
      <h1>Home</h1>
    </>
  );
}
```

### 5. TypeScript Support

Excellent [TypeScript](/content/languages/typescript) support out of the box:

```typescript
// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface User {
  id: number;
  name: string;
  email: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User[]>
) {
  const users = await db.users.findMany();
  res.status(200).json(users);
}
```

```typescript
// pages/index.tsx
import type { GetStaticProps } from 'next';

interface HomeProps {
  users: User[];
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const users = await fetchUsers();
  return { props: { users } };
};

export default function Home({ users }: HomeProps) {
  return <div>...</div>;
}
```

## App Router vs Pages Router

Next.js 13+ introduced the **App Router** (alongside the classic Pages Router):

### Pages Router (Traditional)

```
pages/
  index.js
  about.js
  blog/
    [slug].js
```

### App Router (Modern)

```
app/
  page.js           → /
  about/
    page.js         → /about
  blog/
    [slug]/
      page.js       → /blog/:slug
  layout.js         → Shared layout
```

**App Router Features:**
- React Server Components
- Streaming
- Nested layouts
- Better data fetching
- Improved performance

**Example App Router:**
```jsx
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <nav>Navigation</nav>
        {children}
        <footer>Footer</footer>
      </body>
    </html>
  );
}

// app/page.js
export default function Home() {
  return <h1>Home Page</h1>;
}

// app/blog/page.js
export default function Blog() {
  return <h1>Blog</h1>;
}
```

## React Server Components

App Router supports Server Components by default:

```jsx
// app/users/page.js (Server Component)
async function getUsers() {
  const res = await fetch('https://api.example.com/users');
  return res.json();
}

export default async function Users() {
  const users = await getUsers();

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**Benefits:**
- Fetch data directly in components
- Smaller client bundle (no JS for server components)
- Better performance
- Direct database access

**Client Components:**
```jsx
'use client'; // Mark as client component

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## Data Fetching Patterns

### Server Components (App Router)

```jsx
// Fetch in component
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store', // SSR (always fresh)
    // OR
    next: { revalidate: 60 }, // ISR (revalidate every 60s)
  });

  return <div>{data}</div>;
}
```

### getStaticProps (Pages Router)

```jsx
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();

  return {
    props: { posts },
    revalidate: 60, // ISR
  };
}
```

### Client-Side with SWR

```jsx
import useSWR from 'swr';

function Profile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>Hello {data.name}!</div>;
}
```

## Styling in Next.js

Next.js supports multiple styling approaches:

### CSS Modules

```jsx
// components/Button.module.css
.button {
  background: blue;
  color: white;
}

// components/Button.js
import styles from './Button.module.css';

export default function Button() {
  return <button className={styles.button}>Click</button>;
}
```

### [Tailwind CSS](/content/css/tailwind)

```jsx
// Automatically configured with create-next-app
export default function Button() {
  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded">
      Click
    </button>
  );
}
```

### [styled-components](/content/css/styled-components)

```jsx
import styled from 'styled-components';

const Button = styled.button`
  background: blue;
  color: white;
`;

export default function Page() {
  return <Button>Click</Button>;
}
```

### Global CSS

```css
/* styles/globals.css */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

```jsx
// pages/_app.js
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Vercel is built by the Next.js team and provides:
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Preview deployments for PRs
- Analytics
- Edge functions

### Self-Hosting

```bash
# Build
npm run build

# Start production server
npm start
```

Can deploy to:
- Docker containers
- [Node.js](/content/runtimes/javascript-runtimes) servers
- AWS, Google Cloud, Azure
- Any platform supporting Node.js

### Static Export

```bash
# next.config.js
module.exports = {
  output: 'export',
};

# Build static site
npm run build
```

Deploy to any static host (Netlify, Cloudflare Pages, etc.)

## Middleware

Run code before requests complete:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add custom header
  const response = NextResponse.next();
  response.headers.set('x-custom-header', 'value');
  return response;
}

export const config = {
  matcher: '/dashboard/:path*',
};
```

**Use cases:**
- Authentication
- Redirects
- Rewriting URLs
- Setting headers
- A/B testing
- Geolocation

## Environment Variables

```bash
# .env.local
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.example.com
```

```javascript
// Server-side only
const dbUrl = process.env.DATABASE_URL;

// Available in browser (prefix with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Performance Features

### Automatic Code Splitting

Each page only loads the code it needs:

```jsx
// pages/home.js loads Home.js bundle
// pages/about.js loads About.js bundle
```

### Dynamic Imports

```jsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable server-rendering
});

export default function Page() {
  return <HeavyComponent />;
}
```

### Prefetching

```jsx
import Link from 'next/link';

// Automatically prefetches linked pages
<Link href="/about">
  <a>About</a>
</Link>
```

## Common Patterns

### Layout Component

```jsx
// components/Layout.js
export default function Layout({ children }) {
  return (
    <div>
      <header>
        <nav>...</nav>
      </header>
      <main>{children}</main>
      <footer>...</footer>
    </div>
  );
}

// pages/_app.js
import Layout from '../components/Layout';

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
```

### Protected Routes

```jsx
// components/ProtectedRoute.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return children;
}
```

### API Route with Database

```typescript
// pages/api/posts.ts
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const posts = await prisma.post.findMany({
      include: { author: true },
    });
    res.status(200).json(posts);
  } else if (req.method === 'POST') {
    const post = await prisma.post.create({
      data: req.body,
    });
    res.status(201).json(post);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

## Next.js vs Alternatives

| Feature | Next.js | [Astro](/content/frameworks/astro) | Remix | Gatsby |
|---------|---------|---------|-------|--------|
| **Framework** | React | Multi-framework | React | React |
| **Rendering** | SSR/SSG/ISR | SSG + Islands | SSR | SSG |
| **Data Fetching** | Multiple methods | Top-level | Loaders/Actions | GraphQL |
| **Learning Curve** | Moderate | Gentle | Moderate | Moderate |
| **Use Case** | Full-stack apps | Content sites | Web apps | Static sites |
| **Performance** | Good | Excellent | Excellent | Good |

## Best Practices

### 1. Use ISR for Content Sites

```jsx
export async function getStaticProps() {
  const posts = await fetchPosts();

  return {
    props: { posts },
    revalidate: 3600, // Revalidate every hour
  };
}
```

### 2. Optimize Images

```jsx
import Image from 'next/image';

// ✓ Good
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Load immediately
/>

// ❌ Bad
<img src="/hero.jpg" alt="Hero" />
```

### 3. Use Environment Variables

```javascript
// ✓ Good - Server-side
const secret = process.env.API_SECRET;

// ✓ Good - Client-side (explicitly public)
const publicUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ Bad - Secrets in client code
const secret = process.env.NEXT_PUBLIC_API_SECRET; // Exposed!
```

### 4. Implement Loading States

```jsx
export default function Page() {
  const { data, isLoading } = useSWR('/api/data', fetcher);

  if (isLoading) return <Skeleton />;
  return <Content data={data} />;
}
```

## Learning Resources

### Official Resources
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Learn Next.js**: Interactive tutorial
- **Next.js Examples**: [github.com/vercel/next.js/tree/canary/examples](https://github.com/vercel/next.js/tree/canary/examples)

### Video Courses
- **Next.js 13 Course** - Lee Robinson (Vercel)
- **Mastering Next.js** - Maximilian Schwarzmüller
- **Next.js Conf**: Annual conference with talks

### Community
- **Next.js Discord**: Active community
- **r/nextjs**: Reddit community
- **GitHub Discussions**: Official discussions

### Example Projects
- **Next.js Commerce**: E-commerce template
- **Next.js Blog**: Blog starter
- **Taxonomy**: Modern app starter with App Router

## Key Takeaways

- **Full-stack React framework** with routing, SSR, and API routes
- **Multiple rendering strategies**: SSG, SSR, ISR, client-side
- **File-based routing** eliminates router configuration
- **Built-in optimizations** for images, fonts, and scripts
- **Excellent TypeScript support**
- **App Router** with Server Components is the future
- **Best deployed to Vercel** but works anywhere
- **Industry standard** for production React apps

## Related Topics

- [React](/content/frameworks/react) - Next.js is built on React
- [JavaScript Frameworks](/content/frameworks/javascript-frameworks) - Compare with other frameworks
- [TypeScript](/content/languages/typescript) - Type-safe Next.js development
- [Tailwind CSS](/content/css/tailwind) - Most popular styling choice
- [Astro](/content/frameworks/astro) - Alternative for content-heavy sites
- [JavaScript Runtimes](/content/runtimes/javascript-runtimes) - Understanding Node.js and edge runtimes

Next.js has become the standard for building production React applications because it solves real problems: routing, data fetching, performance optimization, and deployment. Whether you're building a blog, e-commerce site, or complex web application, Next.js provides the tools and flexibility you need while maintaining excellent developer experience.
