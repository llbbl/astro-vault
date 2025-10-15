---
title: Astro
tags: [astro, framework, static-site, islands, performance, multi-framework, content, ssg]
---

# Astro

Astro is a modern web framework designed for building content-focused websites with exceptional performance. Created by Fred K. Schott and the Astro team, it pioneered the "islands architecture" that ships zero JavaScript by default and allows you to use [React](/content/frameworks/react), Vue, Svelte, and other frameworks together in the same project.

## What is Astro?

Astro is a **content-first framework** that generates static HTML with minimal JavaScript:

```astro
---
// Component script (runs on server)
const title = "Welcome to Astro";
const items = ["Fast", "Flexible", "Content-focused"];
---

<html>
  <head>
    <title>{title}</title>
  </head>
  <body>
    <h1>{title}</h1>
    <ul>
      {items.map(item => <li>{item}</li>)}
    </ul>
  </body>
</html>

<style>
  h1 {
    color: #0066cc;
  }
</style>
```

**Key Philosophy:**
- **Zero JS by default**: Ship HTML and CSS only
- **Islands architecture**: Hydrate interactive components only when needed
- **Framework agnostic**: Use React, Vue, Svelte, or plain HTML
- **Content first**: Built for blogs, documentation, marketing sites

## Why Astro?

### 1. Ships Zero JavaScript by Default

Unlike traditional frameworks, Astro sends pure HTML:

```astro
---
const posts = await fetchPosts();
---

<div>
  {posts.map(post => (
    <article>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
    </article>
  ))}
</div>

<!-- This ships as plain HTML - no React/Vue runtime! -->
```

**Result:**
- Faster page loads
- Better SEO
- Improved Core Web Vitals
- Works without JavaScript enabled

### 2. Islands Architecture

Add interactivity only where needed:

```astro
---
import Header from '../components/Header.astro';
import Counter from '../components/Counter.jsx'; // React component
import Newsletter from '../components/Newsletter.vue'; // Vue component
---

<!-- Static HTML (no JS) -->
<Header />

<!-- Interactive island (hydrates) -->
<Counter client:load />

<!-- Another interactive island -->
<Newsletter client:visible />
```

**Client directives:**
- `client:load` - Hydrate on page load
- `client:idle` - Hydrate when browser is idle
- `client:visible` - Hydrate when scrolled into view
- `client:media` - Hydrate based on media query
- `client:only` - Skip server rendering

### 3. Use Any Framework

Mix and match frameworks in the same project:

```astro
---
import ReactButton from './ReactButton.jsx';
import VueCounter from './VueCounter.vue';
import SvelteCard from './SvelteCard.svelte';
import SolidDropdown from './SolidDropdown.tsx';
---

<div>
  <!-- React component -->
  <ReactButton client:load />

  <!-- Vue component -->
  <VueCounter client:visible />

  <!-- Svelte component -->
  <SvelteCard client:idle />

  <!-- Solid component -->
  <SolidDropdown client:load />
</div>
```

This is unique to Astro - no other framework allows this!

### 4. Built-in Optimizations

**Image Optimization:**
```astro
---
import { Image } from 'astro:assets';
import hero from '../images/hero.jpg';
---

<Image src={hero} alt="Hero" />
<!-- Automatic optimization, responsive images, lazy loading -->
```

**Asset Bundling:**
```astro
<script>
  // Automatically bundled and optimized
  import { doSomething } from './utils';
  doSomething();
</script>

<style>
  /* Scoped to this component */
  .title {
    color: blue;
  }
</style>
```

### 5. Excellent Developer Experience

**TypeScript support:**
```astro
---
interface Props {
  title: string;
  count: number;
}

const { title, count } = Astro.props as Props;
---

<h1>{title}</h1>
<p>Count: {count}</p>
```

**Hot module replacement:**
- Changes appear instantly
- No page refresh needed
- State preservation

**Vite-powered:**
- Lightning-fast dev server
- Optimized production builds
- Modern build pipeline

## File Structure

```
my-astro-project/
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   └── Button.jsx (React)
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   └── blog/
│   │       ├── [slug].astro
│   │       └── index.astro
│   └── styles/
│       └── global.css
├── public/
│   └── favicon.ico
└── astro.config.mjs
```

## Pages and Routing

File-based routing like [Next.js](/content/frameworks/nextjs):

```
src/pages/
  index.astro           → /
  about.astro           → /about
  blog/
    index.astro         → /blog
    [slug].astro        → /blog/:slug
  products/
    [id].astro          → /products/:id
```

**Dynamic Routes:**
```astro
---
// src/pages/blog/[slug].astro
export async function getStaticPaths() {
  const posts = await fetchPosts();

  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
---

<article>
  <h1>{post.title}</h1>
  <div set:html={post.content} />
</article>
```

## Layouts

Reusable page templates:

```astro
---
// src/layouts/Layout.astro
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{title}</title>
  </head>
  <body>
    <header>
      <nav>...</nav>
    </header>
    <main>
      <slot />
    </main>
    <footer>...</footer>
  </body>
</html>
```

**Using the layout:**
```astro
---
// src/pages/about.astro
import Layout from '../layouts/Layout.astro';
---

<Layout title="About Us">
  <h1>About Our Company</h1>
  <p>We build amazing things!</p>
</Layout>
```

## Content Collections

Manage content with type safety:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { blog };
```

**Markdown content:**
```markdown
---
# src/content/blog/first-post.md
title: My First Post
description: This is my first blog post
pubDate: 2024-01-15
author: Alice
tags: [astro, web-dev]
---

# Hello World

This is my first post!
```

**Query content:**
```astro
---
import { getCollection } from 'astro:content';

const posts = await getCollection('blog');
---

<ul>
  {posts.map(post => (
    <li>
      <a href={`/blog/${post.slug}`}>
        {post.data.title}
      </a>
    </li>
  ))}
</ul>
```

## Integrations

Extend Astro with integrations:

```bash
# Add React
npx astro add react

# Add Tailwind
npx astro add tailwind

# Add MDX
npx astro add mdx
```

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [react(), tailwind(), mdx()],
});
```

**Popular integrations:**
- **@astrojs/react** - Use React components
- **@astrojs/vue** - Use Vue components
- **@astrojs/svelte** - Use Svelte components
- **@astrojs/tailwind** - [Tailwind CSS](/content/css/tailwind)
- **@astrojs/mdx** - MDX support
- **@astrojs/sitemap** - Generate sitemap
- **@astrojs/rss** - RSS feed

## Server-Side Rendering (SSR)

Astro supports SSR for dynamic pages:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
});
```

**API Routes:**
```typescript
// src/pages/api/users.ts
export async function GET({ params, request }) {
  const users = await db.users.findMany();
  return new Response(JSON.stringify(users), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST({ request }) {
  const data = await request.json();
  const user = await db.users.create({ data });

  return new Response(JSON.stringify(user), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

**Dynamic Pages:**
```astro
---
// src/pages/user/[id].astro
const { id } = Astro.params;
const user = await db.users.findUnique({ where: { id } });
---

<h1>{user.name}</h1>
<p>{user.email}</p>
```

## Partial Hydration Example

```astro
---
// src/pages/index.astro
import Header from '../components/Header.astro'; // Static
import Hero from '../components/Hero.astro'; // Static
import InteractiveDemo from '../components/InteractiveDemo.jsx'; // React
import Newsletter from '../components/Newsletter.vue'; // Vue
import Footer from '../components/Footer.astro'; // Static
---

<html>
  <body>
    <!-- Static HTML - no JS -->
    <Header />
    <Hero />

    <!-- Interactive React component - hydrates on load -->
    <InteractiveDemo client:load />

    <!-- Interactive Vue component - hydrates when visible -->
    <Newsletter client:visible />

    <!-- Static HTML - no JS -->
    <Footer />
  </body>
</html>
```

**Result:**
- Header, Hero, Footer: Plain HTML (0 KB JS)
- InteractiveDemo: React bundle + component (~50 KB)
- Newsletter: Vue bundle + component (~30 KB)
- Total: ~80 KB instead of ~200+ KB for full SPA

## Markdown and MDX

**Markdown:**
```markdown
---
# src/pages/blog/post.md
title: My Post
---

# Hello

This is a blog post written in Markdown.
```

**MDX (Markdown + Components):**
```mdx
---
# src/pages/blog/advanced.mdx
title: Advanced Post
---

import Counter from '../../components/Counter.jsx';

# Interactive Blog Post

Here's some content with an embedded component:

<Counter client:load />

More content here!
```

## Styling

Multiple styling options:

### Scoped Styles

```astro
<div class="card">
  <h2>Card Title</h2>
</div>

<style>
  /* Scoped to this component */
  .card {
    padding: 1rem;
    background: white;
    border-radius: 8px;
  }
</style>
```

### Global Styles

```astro
<style is:global>
  /* Global styles */
  body {
    margin: 0;
    font-family: system-ui;
  }
</style>
```

### [Tailwind CSS](/content/css/tailwind)

```bash
npx astro add tailwind
```

```astro
<div class="p-4 bg-white rounded-lg shadow">
  <h2 class="text-xl font-bold">Card</h2>
</div>
```

### CSS Modules

```astro
---
import styles from './Card.module.css';
---

<div class={styles.card}>
  <h2 class={styles.title}>Card</h2>
</div>
```

## Deployment

### Static Sites

```bash
npm run build
# Output: dist/
```

Deploy to:
- **Netlify**
- **Vercel**
- **Cloudflare Pages**
- **GitHub Pages**
- **Any static host**

### SSR

Deploy with Node.js adapter:

```bash
npm run build
node ./dist/server/entry.mjs
```

Deploy to:
- **Vercel**
- **Netlify**
- **Cloudflare Workers** (with adapter)
- **Deno Deploy**
- **Any Node.js host**

## Performance Comparison

**Traditional SPA ([React](/content/frameworks/react) only):**
```
Initial bundle: 150KB
Time to Interactive: 3s
```

**[Next.js](/content/frameworks/nextjs) with SSR:**
```
Initial bundle: 100KB
Time to Interactive: 2s
```

**Astro with Islands:**
```
Initial bundle: 10KB (just critical JS)
Time to Interactive: 0.5s
```

## Astro vs Alternatives

| Feature | Astro | [Next.js](/content/frameworks/nextjs) | Gatsby | Remix |
|---------|-------|--------|--------|-------|
| **Default JS** | Zero | Hydrates all | Hydrates all | Hydrates all |
| **Multi-framework** | Yes | No (React only) | No (React only) | No (React only) |
| **Content Focus** | Excellent | Good | Excellent | Fair |
| **SSR** | Optional | Built-in | No (SSG only) | Built-in |
| **Learning Curve** | Gentle | Moderate | Moderate | Moderate |
| **Performance** | Excellent | Good | Good | Excellent |

## When to Use Astro

**Perfect for:**
- Blogs and content sites
- Documentation
- Marketing websites
- Portfolio sites
- Landing pages
- Any content-heavy site

**Not ideal for:**
- Highly interactive apps (use [React](/content/frameworks/react) or [Next.js](/content/frameworks/nextjs))
- Real-time dashboards
- Complex SPAs
- Apps requiring lots of client-side state

## Astro with React

```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import ReactCounter from '../components/Counter.jsx';
---

<Layout title="Home">
  <h1>Welcome</h1>

  <!-- This React component hydrates on load -->
  <ReactCounter client:load initialCount={0} />
</Layout>
```

```jsx
// src/components/Counter.jsx
import { useState } from 'react';

export default function Counter({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

## View Transitions

Built-in page transitions:

```astro
---
// src/layouts/Layout.astro
import { ViewTransitions } from 'astro:transitions';
---

<html>
  <head>
    <ViewTransitions />
  </head>
  <body>
    <slot />
  </body>
</html>
```

Smooth transitions between pages without full reload!

## Best Practices

### 1. Use Islands Sparingly

```astro
<!-- ✓ Good - only interactive parts hydrate -->
<article>
  <h1>{post.title}</h1>
  <div set:html={post.content} />
  <Comments client:visible /> <!-- Only this hydrates -->
</article>

<!-- ❌ Bad - entire page hydrates -->
<ReactPage client:load>
  <h1>{post.title}</h1>
  <div>{post.content}</div>
</ReactPage>
```

### 2. Defer Non-Critical JS

```astro
<!-- Load when visible -->
<Newsletter client:visible />

<!-- Load when idle -->
<Analytics client:idle />

<!-- Load on mobile only -->
<MobileMenu client:media="(max-width: 768px)" />
```

### 3. Optimize Images

```astro
---
import { Image } from 'astro:assets';
import hero from '../assets/hero.jpg';
---

<Image src={hero} alt="Hero" />
```

### 4. Use Content Collections

```typescript
// Type-safe content management
const posts = await getCollection('blog', ({ data }) => {
  return data.draft !== true;
});
```

## Learning Resources

### Official Resources
- **Astro Documentation**: [docs.astro.build](https://docs.astro.build)
- **Astro Tutorial**: Interactive getting started guide
- **Astro Themes**: [astro.build/themes](https://astro.build/themes)
- **Astro Examples**: Official example projects

### Community
- **Astro Discord**: Very active community
- **Astro Blog**: Official blog with updates
- **Astro YouTube**: Video tutorials
- **GitHub Discussions**: Q&A and discussions

### Courses
- **Astro Crash Course** - Traversy Media
- **Build Modern Websites with Astro** - Kevin Powell
- **Astro Web Framework Course** - freeCodeCamp

## Key Takeaways

- **Zero JavaScript by default** for maximum performance
- **Islands architecture** for partial hydration
- **Multi-framework** support (React, Vue, Svelte together)
- **Content-first** design perfect for blogs and docs
- **Excellent DX** with TypeScript, Vite, and hot reloading
- **Built-in optimizations** for images and assets
- **Flexible deployment** (static or SSR)
- **Best choice** for content-heavy websites

## Related Topics

- [React](/content/frameworks/react) - Use React components in Astro
- [Next.js](/content/frameworks/nextjs) - Alternative full-stack React framework
- [JavaScript Frameworks](/content/frameworks/javascript-frameworks) - Framework comparison
- [Tailwind CSS](/content/css/tailwind) - Popular styling choice for Astro
- [TypeScript](/content/languages/typescript) - Type-safe Astro development
- [JavaScript Runtimes](/content/runtimes/javascript-runtimes) - Where Astro runs

Astro has revolutionized how we build content-focused websites by shipping zero JavaScript by default while still allowing interactive components when needed. If you're building a blog, documentation site, or marketing website, Astro provides unmatched performance and developer experience. Its islands architecture is the future of web development for content-heavy sites.
