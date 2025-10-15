---
title: Tailwind CSS
tags: [tailwind, css, styling, utility-first, frontend, react, design-system]
---

# Tailwind CSS

Tailwind CSS is a utility-first CSS framework that has revolutionized how developers style web applications. Created by Adam Wathan in 2017, Tailwind allows you to build custom designs without leaving your HTML by composing pre-defined utility classes. By 2024, it has become the most popular CSS framework, used by companies like GitHub, NASA, and Shopify.

## What is Tailwind CSS?

Tailwind is a **utility-first** CSS framework, meaning instead of predefined components, you compose styles from single-purpose utility classes:

```html
<!-- Traditional CSS -->
<button class="primary-button">Save</button>

<style>
.primary-button {
  background-color: blue;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 600;
}
</style>

<!-- Tailwind CSS -->
<button class="bg-blue-500 text-white px-4 py-2 rounded font-semibold">
  Save
</button>
```

Each class does **one thing**:
- `bg-blue-500` - Background color
- `text-white` - Text color
- `px-4` - Horizontal padding
- `py-2` - Vertical padding
- `rounded` - Border radius
- `font-semibold` - Font weight

## Why Tailwind?

### 1. No Naming Fatigue

Traditional CSS requires naming everything:

```css
/* What do I call this? */
.user-card { }
.user-card-wrapper { }
.user-card-container { }
.user-card-inner { }
/* Am I using BEM? SMACSS? My own system? */
```

Tailwind eliminates naming:

```html
<div class="p-4 bg-white rounded-lg shadow">
  <!-- Just use utilities -->
</div>
```

### 2. No Context Switching

Traditional workflow:

```jsx
// 1. Write HTML
<div className="user-card">

// 2. Switch to CSS file
.user-card {
  padding: 1rem;
  /* Add styles */
}

// 3. Back to HTML...
```

Tailwind workflow:

```jsx
// Everything in one place
<div className="p-4 bg-white rounded-lg shadow">
  <!-- Done! -->
</div>
```

### 3. Tiny Production Bundles

Tailwind's **PurgeCSS** removes unused classes:

**Without Tailwind:**
```
Full CSS framework: 150KB - 500KB
You use: 10% of it
Ship: All 500KB
```

**With Tailwind:**
```
Full framework: ~3.5MB (all utilities)
You use: 100 classes
Ship: ~3-10KB (only what you use)
```

### 4. Consistent Design System

Tailwind provides a cohesive design system out of the box:

**Spacing scale** (4px increments):
```html
<div class="p-1">   <!-- 0.25rem = 4px -->
<div class="p-2">   <!-- 0.5rem = 8px -->
<div class="p-4">   <!-- 1rem = 16px -->
<div class="p-8">   <!-- 2rem = 32px -->
```

**Color palette** (50-900 scale):
```html
<div class="bg-blue-50">   <!-- Lightest -->
<div class="bg-blue-500">  <!-- Default -->
<div class="bg-blue-900">  <!-- Darkest -->
```

This prevents "magic numbers" and inconsistent designs.

### 5. Responsive Design Made Easy

Apply styles at specific breakpoints with prefixes:

```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!--
    Mobile: full width
    Tablet: half width
    Desktop: one-third width
  -->
</div>

<img
  class="block md:hidden"
  src="mobile.jpg"
  alt="Mobile view"
/>
<img
  class="hidden md:block"
  src="desktop.jpg"
  alt="Desktop view"
/>
```

**Breakpoints:**
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+
- `2xl:` - 1536px+

### 6. State Variants

Style hover, focus, active states easily:

```html
<button class="
  bg-blue-500
  hover:bg-blue-700
  active:bg-blue-800
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  disabled:opacity-50
">
  Save
</button>
```

## Installation

### With Vite ([React](/content/frameworks/react), Vue, etc.)

```bash
# Install Tailwind
npm install -D tailwindcss postcss autoprefixer

# Create config files
npx tailwindcss init -p
```

**tailwind.config.js:**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### With Next.js

```bash
npx create-next-app@latest my-app
# Choose "Yes" to Tailwind during setup
```

Or add to existing Next.js project:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Core Concepts

### Utility Classes

Every CSS property has utility classes:

**Layout:**
```html
<div class="flex justify-center items-center">
<div class="grid grid-cols-3 gap-4">
<div class="absolute top-0 right-0">
```

**Spacing:**
```html
<div class="p-4">        <!-- padding: 1rem -->
<div class="px-4 py-2">  <!-- padding-x: 1rem, padding-y: 0.5rem -->
<div class="mt-8 mb-4">  <!-- margin-top: 2rem, margin-bottom: 1rem -->
```

**Typography:**
```html
<h1 class="text-4xl font-bold text-gray-900">
<p class="text-base leading-relaxed text-gray-600">
```

**Sizing:**
```html
<div class="w-64 h-32">      <!-- width: 16rem, height: 8rem -->
<div class="w-1/2 h-screen">  <!-- width: 50%, height: 100vh -->
```

### Modifiers

Combine utilities with modifiers for states and breakpoints:

**Pseudo-classes:**
```html
<button class="hover:bg-blue-700 focus:ring-2 active:scale-95">
```

**Responsive:**
```html
<div class="text-base md:text-lg lg:text-xl">
```

**Dark mode:**
```html
<div class="bg-white dark:bg-gray-800 text-black dark:text-white">
```

**Combining modifiers:**
```html
<button class="md:hover:bg-blue-700 dark:md:hover:bg-blue-600">
  <!-- Hover on medium+ screens, different for dark mode -->
</button>
```

### Arbitrary Values

Use custom values when needed:

```html
<!-- Custom spacing -->
<div class="p-[13px]">

<!-- Custom colors -->
<div class="bg-[#1da1f2]">

<!-- Custom anything -->
<div class="grid-cols-[200px_1fr_100px]">
```

### Extracting Components

Avoid repetition with [React](/content/frameworks/react) components or `@apply`:

**React Component:**
```jsx
function Button({ children, variant = 'primary' }) {
  const baseStyles = "px-4 py-2 rounded font-semibold transition";
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  );
}
```

**Using @apply (CSS):**
```css
/* Use sparingly - defeats Tailwind's purpose */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700;
  }
}
```

## Common Patterns

### Card Component

```html
<div class="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
  <img
    class="w-full"
    src="image.jpg"
    alt="Card image"
  />
  <div class="px-6 py-4">
    <h2 class="font-bold text-xl mb-2 text-gray-800">
      Card Title
    </h2>
    <p class="text-gray-700 text-base">
      Card description goes here.
    </p>
  </div>
  <div class="px-6 pt-4 pb-2">
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Action
    </button>
  </div>
</div>
```

### Responsive Navigation

```html
<nav class="flex flex-col md:flex-row items-center justify-between p-4 bg-white shadow">
  <div class="text-2xl font-bold text-gray-800">
    Logo
  </div>

  <ul class="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
    <li>
      <a href="#" class="text-gray-600 hover:text-blue-500">
        Home
      </a>
    </li>
    <li>
      <a href="#" class="text-gray-600 hover:text-blue-500">
        About
      </a>
    </li>
    <li>
      <a href="#" class="text-gray-600 hover:text-blue-500">
        Contact
      </a>
    </li>
  </ul>
</nav>
```

### Form Input

```html
<div class="mb-4">
  <label
    for="email"
    class="block text-gray-700 text-sm font-bold mb-2"
  >
    Email
  </label>
  <input
    type="email"
    id="email"
    class="
      shadow
      appearance-none
      border
      rounded
      w-full
      py-2
      px-3
      text-gray-700
      leading-tight
      focus:outline-none
      focus:shadow-outline
      focus:border-blue-500
    "
    placeholder="you@example.com"
  />
</div>
```

## Customization

### Extending the Theme

**tailwind.config.js:**
```javascript
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
}
```

**Usage:**
```html
<div class="bg-brand-500 text-brand-50 p-128">
```

### Plugins

Extend Tailwind with official and community plugins:

```bash
npm install -D @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio
```

```javascript
// tailwind.config.js
export default {
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

**Typography plugin** (for blog content):
```html
<article class="prose lg:prose-xl">
  <!-- Automatic beautiful typography -->
  <h1>Title</h1>
  <p>Content...</p>
</article>
```

## Dark Mode

Enable dark mode in your config:

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // or 'media'
  // ...
}
```

**Class strategy** (manual toggle):
```html
<html class="dark">
  <div class="bg-white dark:bg-gray-900 text-black dark:text-white">
    Content
  </div>
</html>
```

**Media strategy** (respects system preference):
```html
<div class="bg-white dark:bg-gray-900">
  <!-- Automatically switches based on OS setting -->
</div>
```

**Toggle implementation:**
```jsx
function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <button onClick={() => setDark(!dark)}>
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
```

## Performance

### JIT (Just-In-Time) Mode

Tailwind v3+ uses JIT by default:

**Benefits:**
- Instant build times
- All variants enabled (no configuration needed)
- Arbitrary values support
- Smaller CSS in development

**How it works:**
```
You write: <div class="bg-blue-500">
JIT generates: .bg-blue-500 { background-color: #3b82f6; }
Only generates: Classes you actually use
```

### PurgeCSS

Production builds automatically remove unused classes:

```javascript
// tailwind.config.js
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  // Tailwind scans these files and removes unused classes
}
```

**Results:**
- Development: ~3.5MB (all utilities)
- Production: ~3-10KB (only what you use)

## Tailwind vs Alternatives

See [CSS Frameworks History](/content/css/css-frameworks-history) for more context.

| Approach | Example | Bundle Size | Learning Curve | Flexibility |
|----------|---------|-------------|----------------|-------------|
| **Tailwind** | `class="p-4 bg-blue-500"` | 3-10KB | Moderate | High |
| **Bootstrap** | `class="btn btn-primary"` | 150KB+ | Easy | Low |
| **[styled-components](/content/css/styled-components)** | `styled.div`` | 15KB+ | Moderate | High |
| **CSS Modules** | `className={styles.card}` | Varies | Easy | High |
| **Plain CSS** | `class="card"` | Varies | Easy | High |

## Common Criticisms & Rebuttals

### "The HTML is too verbose!"

**Criticism:**
```html
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
```

**Rebuttal:**
- Extract to components (React, Vue, etc.)
- See all styles at a glance
- No switching between files
- Easier to understand than custom class names

### "All Tailwind sites look the same!"

**Criticism:** "Bootstrap problem all over again"

**Rebuttal:**
- Tailwind is low-level utilities, not components
- Infinite customization possible
- Companies with distinct brands use Tailwind (GitHub, NASA, Laravel)
- Not like Bootstrap's opinionated components

### "It's just inline styles!"

**Criticism:** "Isn't this the same as `style="..."`?"

**Rebuttal:**
```html
<!-- Inline styles (bad) -->
<div style="padding: 1rem; background: blue;">
  ❌ No hover states
  ❌ No responsive design
  ❌ No reusable design tokens
  ❌ Hard to maintain
</div>

<!-- Tailwind (good) -->
<div class="p-4 bg-blue-500 hover:bg-blue-700 md:p-8">
  ✓ Hover/focus states
  ✓ Responsive design
  ✓ Consistent design system
  ✓ PurgeCSS optimizations
</div>
```

## Tailwind with React

Tailwind works great with [React](/content/frameworks/react):

### Basic Usage

```jsx
function Card({ title, description }) {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <div className="px-6 py-4">
        <h2 className="font-bold text-xl mb-2">{title}</h2>
        <p className="text-gray-700 text-base">{description}</p>
      </div>
    </div>
  );
}
```

### Conditional Classes

```jsx
import clsx from 'clsx'; // or 'classnames'

function Button({ primary, children }) {
  return (
    <button
      className={clsx(
        "px-4 py-2 rounded font-semibold",
        primary ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
      )}
    >
      {children}
    </button>
  );
}
```

### With TypeScript

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children
}) => {
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button className={`${variants[variant]} ${sizes[size]} rounded`}>
      {children}
    </button>
  );
};
```

## Component Libraries

Use pre-built components with Tailwind:

- **Headless UI** (official, unstyled components)
- **daisyUI** (component classes for Tailwind)
- **Flowbite** (component library)
- **Tailwind UI** (paid, official components)
- **shadcn/ui** (copy-paste components)

```jsx
// Headless UI example
import { Menu } from '@headlessui/react';

function Dropdown() {
  return (
    <Menu>
      <Menu.Button className="px-4 py-2 bg-blue-500 text-white rounded">
        Options
      </Menu.Button>
      <Menu.Items className="absolute mt-2 w-56 bg-white rounded-md shadow-lg">
        <Menu.Item>
          {({ active }) => (
            <a
              className={`${
                active ? 'bg-blue-500 text-white' : 'text-gray-900'
              } block px-4 py-2`}
              href="/account"
            >
              Account
            </a>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
```

## IntelliSense

Get autocomplete for Tailwind classes:

**VS Code Extension:**
```
Tailwind CSS IntelliSense
```

Features:
- Class name autocomplete
- Hover preview (shows actual CSS)
- Linting (warns about invalid classes)
- Color preview

## Best Practices

### 1. Use @apply Sparingly

```css
/* ❌ Don't do this (defeats Tailwind's purpose) */
@layer components {
  .card {
    @apply p-4 bg-white rounded shadow;
  }
  .button {
    @apply px-4 py-2 bg-blue-500 text-white;
  }
}

/* ✓ Do this (extract to components) */
```

```jsx
// ✓ Extract to React/Vue components instead
function Card({ children }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      {children}
    </div>
  );
}
```

### 2. Order Classes Logically

```html
<!-- ✓ Good: Grouped by type -->
<div class="
  flex items-center justify-between
  p-4 m-2
  bg-white text-gray-800
  rounded-lg shadow-md
  hover:shadow-lg
">

<!-- ❌ Bad: Random order -->
<div class="hover:shadow-lg flex bg-white p-4 items-center rounded-lg shadow-md text-gray-800 m-2 justify-between">
```

### 3. Use Container Component

```html
<div class="container mx-auto px-4">
  <!-- Content centered with padding -->
</div>
```

### 4. Leverage Design Tokens

```html
<!-- ✓ Good: Use design system -->
<div class="p-4 text-blue-500">

<!-- ❌ Bad: Arbitrary values everywhere -->
<div class="p-[17px] text-[#0088cc]">
```

## Tailwind v4 (2024)

The latest version brings major improvements:

**Rust-based compiler:**
- 10x faster builds
- Better performance

**CSS-first:**
- Configure in CSS, not JavaScript
- More intuitive

**Example:**
```css
/* @theme.css */
@import "tailwindcss";

@theme {
  --color-brand: #0066cc;
  --font-sans: Inter, sans-serif;
}
```

## Key Takeaways

- **Utility-first** approach eliminates naming and context switching
- **Tiny production bundles** (3-10KB) via PurgeCSS
- **Consistent design system** out of the box
- **Responsive** and **state variants** built-in
- **Highly customizable** via config
- **Works great** with [React](/content/frameworks/react), Vue, Svelte, etc.
- **Most popular CSS framework** in modern web development
- **Great DX** with IntelliSense and JIT mode

## Related Topics

- [CSS Frameworks History](/content/css/css-frameworks-history) - Evolution of CSS frameworks
- [styled-components](/content/css/styled-components) - CSS-in-JS alternative
- [React](/content/frameworks/react) - Most common framework used with Tailwind
- [JavaScript Frameworks](/content/frameworks/javascript-frameworks) - All work with Tailwind
- [TypeScript](/content/languages/typescript) - Type-safe component patterns with Tailwind

Tailwind CSS has become the standard for modern web development because it solves real problems: naming fatigue, context switching, and bloated CSS bundles. While it has a learning curve, the productivity gains and tiny bundle sizes make it worth the investment. Whether you're building a [React](/content/frameworks/react) app, a marketing site, or a complex web application, Tailwind provides the tools to create custom designs quickly and maintainably.
