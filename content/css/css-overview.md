---
title: CSS & Styling Overview
tags: [css, styling, frontend, tailwind, bootstrap, frameworks, design]
---

# CSS & Styling Overview

Styling web applications has evolved dramatically over the years, from plain CSS to sophisticated frameworks and build systems. Understanding the different approaches to CSS helps you make informed decisions about how to style your projects. This guide provides an overview of the CSS landscape and links to detailed articles on specific topics.

## Styling Approaches

### Traditional CSS

Plain CSS is still the foundation:

```css
/* Plain CSS */
.button {
  background: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
}

.button:hover {
  background: darkblue;
}
```

**Pros:**
- No build step required
- Universally supported
- Simple to understand

**Cons:**
- No variables (before CSS custom properties)
- Global namespace
- Hard to maintain at scale

### CSS Frameworks

Pre-built component libraries and utility classes:

**Component-based frameworks:**
- [Bootstrap](/content/css/bootstrap) - Most popular legacy framework
- Foundation - Alternative to Bootstrap
- Bulma - Modern CSS framework

**Utility-first frameworks:**
- [Tailwind CSS](/content/css/tailwind) - Modern standard
- UnoCSS - Faster Tailwind alternative

**→ See [CSS Frameworks History](/content/css/css-frameworks-history)** for the evolution of these approaches.

### CSS-in-JS

Write CSS in JavaScript:

- [styled-components](/content/css/styled-components) - React CSS-in-JS
- Emotion - Alternative to styled-components
- JSS - JSON-based styles

**→ See [styled-components](/content/css/styled-components)** for details on CSS-in-JS.

### CSS Modules

Scoped CSS with build tools:

```css
/* Button.module.css */
.button {
  background: blue;
}
```

```jsx
import styles from './Button.module.css';

<button className={styles.button}>Click</button>
```

## Popular Approaches by Use Case

### For [React](/content/frameworks/react) Projects

**Modern (2024+):**
- [Tailwind CSS](/content/css/tailwind) - Most popular choice
- CSS Modules - Built into [Next.js](/content/frameworks/nextjs)
- [styled-components](/content/css/styled-components) - For component libraries

**Legacy:**
- [Bootstrap](/content/css/bootstrap) - Older projects
- Sass/SCSS - Pre-2020 projects

### For [Vue](/content/frameworks/vue) Projects

- [Tailwind CSS](/content/css/tailwind) - Growing in popularity
- Scoped styles - Built into Vue
- Vuetify - Material Design framework
- Quasar - Full-featured UI framework

### For [Angular](/content/frameworks/angular) Projects

- [Tailwind CSS](/content/css/tailwind) - Modern choice
- Angular Material - Official Material Design
- Component styles - Built-in scoping
- Sass/SCSS - Traditional choice

### For [Svelte](/content/frameworks/svelte) Projects

- [Tailwind CSS](/content/css/tailwind) - Common choice
- Scoped styles - Built into Svelte
- SvelteKit UI - Component library

### For Content Sites ([Astro](/content/frameworks/astro), etc.)

- [Tailwind CSS](/content/css/tailwind) - Fast development
- Plain CSS - When simplicity matters
- [Bootstrap](/content/css/bootstrap) - For rapid prototyping

## In-Depth Guides

### Frameworks & Libraries

**Modern:**
- **[Tailwind CSS](/content/css/tailwind)** - Utility-first CSS framework
  - Most popular modern approach
  - Tiny production bundles
  - Great developer experience

**Legacy:**
- **[Bootstrap](/content/css/bootstrap)** - Component framework
  - Dominated 2010s
  - Still used in many projects
  - Good for rapid prototyping

**History:**
- **[CSS Frameworks History](/content/css/css-frameworks-history)** - Evolution of CSS
  - From Bootstrap to Tailwind
  - Why utility-first won
  - Timeline of major shifts

### CSS-in-JS Libraries

- **[styled-components](/content/css/styled-components)** - Write CSS in JS
  - Dynamic styling with props
  - Scoped to components
  - Popular in React ecosystem

## Current Trends (2024-2025)

### 1. Tailwind Dominance

[Tailwind CSS](/content/css/tailwind) has become the default choice:

```html
<button class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Click me
</button>
```

**Why it won:**
- Faster development
- Smaller bundles (after purge)
- No naming fatigue
- Great DX with IntelliSense

### 2. Zero-Runtime CSS-in-JS

Compile-time CSS-in-JS alternatives:

- **vanilla-extract** - Type-safe CSS
- **Linaria** - Zero-runtime CSS-in-JS
- **Panda CSS** - Zero-runtime utility framework

**Benefits:**
- No runtime overhead
- Better performance
- Type safety
- Smaller bundles

### 3. Native CSS Features

Modern CSS has built-in features that frameworks used to provide:

**CSS Variables:**
```css
:root {
  --primary-color: #0066cc;
  --spacing: 1rem;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing);
}
```

**CSS Nesting (2023+):**
```css
.card {
  padding: 1rem;

  & h2 {
    color: #333;
  }

  &:hover {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
}
```

**Container Queries (2023+):**
```css
@container (min-width: 700px) {
  .card {
    display: grid;
  }
}
```

## Choosing a Styling Approach

### For New Projects

**Recommended (2024):**
1. **[Tailwind CSS](/content/css/tailwind)** - Best all-around choice
   - Fast development
   - Small bundles
   - Great ecosystem

2. **CSS Modules** - If you prefer traditional CSS
   - Scoped styles
   - No new syntax to learn
   - Built into most frameworks

### For Existing Projects

**If using:**
- **[Bootstrap](/content/css/bootstrap)**: Consider migrating to [Tailwind](/content/css/tailwind) for better performance
- **[styled-components](/content/css/styled-components)**: Stay if working well, consider zero-runtime alternatives for new components
- **Sass/SCSS**: Can coexist with [Tailwind](/content/css/tailwind)

### Decision Matrix

| Approach | Bundle Size | DX | Performance | Learning Curve |
|----------|-------------|-----|-------------|----------------|
| **[Tailwind](/content/css/tailwind)** | Small (3-10KB) | Excellent | Excellent | Moderate |
| **CSS Modules** | Minimal | Good | Excellent | Easy |
| **[styled-components](/content/css/styled-components)** | Medium (16KB) | Excellent | Good | Moderate |
| **[Bootstrap](/content/css/bootstrap)** | Large (150KB+) | Good | Fair | Easy |
| **Plain CSS** | Minimal | Fair | Excellent | Easy |

## Preprocessors

### Sass/SCSS

Still widely used for legacy projects:

```scss
$primary-color: #0066cc;

.button {
  background: $primary-color;
  padding: 1rem;

  &:hover {
    background: darken($primary-color, 10%);
  }
}
```

**When to use:**
- Legacy projects
- When variables and nesting are needed (before native CSS support)
- Teams familiar with Sass

### Less

Similar to Sass, less popular:

```less
@primary-color: #0066cc;

.button {
  background: @primary-color;
  padding: 1rem;

  &:hover {
    background: darken(@primary-color, 10%);
  }
}
```

## Build Tools

### PostCSS

CSS transformation tool used by most modern frameworks:

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**What it does:**
- Adds vendor prefixes
- Transforms modern CSS to older syntax
- Enables plugins like Tailwind
- Optimizes and minifies CSS

### Lightning CSS

Rust-based CSS processor (faster than PostCSS):

- Extremely fast
- Built-in transformations
- Used by some modern frameworks

## Design Systems

### Component Libraries

**React:**
- Material-UI (MUI)
- Chakra UI
- Ant Design
- shadcn/ui (with [Tailwind](/content/css/tailwind))

**Vue:**
- Vuetify
- Quasar
- PrimeVue

**Angular:**
- Angular Material
- PrimeNG

**Framework-agnostic:**
- DaisyUI (Tailwind components)
- Flowbite (Tailwind components)

### Custom Design Systems

Many companies build their own:

```css
/* Design tokens */
:root {
  /* Colors */
  --color-primary: #0066cc;
  --color-secondary: #6c757d;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;

  /* Typography */
  --font-sans: system-ui, sans-serif;
  --font-mono: 'Courier New', monospace;
}
```

## Best Practices

### 1. Use a Design System

Don't reinvent spacing, colors, etc:

```css
/* ✓ Good - consistent */
.button {
  padding: var(--space-md);
  background: var(--color-primary);
}

/* ❌ Bad - magic numbers */
.button {
  padding: 13px 17px;
  background: #0065cb;
}
```

### 2. Scope Styles

Prevent naming conflicts:

- Use CSS Modules
- Use [styled-components](/content/css/styled-components)
- Use [Tailwind](/content/css/tailwind) utilities
- Use BEM naming convention

### 3. Optimize for Production

- Remove unused CSS
- Minify CSS files
- Use critical CSS
- Lazy load non-critical styles

### 4. Mobile-First

Write styles for mobile, then add desktop:

```css
/* Mobile first */
.container {
  padding: 1rem;
}

/* Desktop */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

## Learning Resources

### General CSS
- **MDN Web Docs**: Comprehensive CSS reference
- **CSS-Tricks**: Tutorials and guides
- **Can I Use**: Browser compatibility

### Specific Topics
- [CSS Frameworks History](/content/css/css-frameworks-history)
- [Tailwind CSS](/content/css/tailwind)
- [Bootstrap](/content/css/bootstrap)
- [styled-components](/content/css/styled-components)

## Key Takeaways

- **[Tailwind CSS](/content/css/tailwind)** is the modern standard for most projects
- **CSS Modules** are great for traditional CSS lovers
- **[Bootstrap](/content/css/bootstrap)** is legacy but still useful for prototypes
- **[styled-components](/content/css/styled-components)** are being replaced by zero-runtime alternatives
- **Native CSS** is getting powerful (variables, nesting, container queries)
- **Choose based on project needs**, not just popularity

## Related Topics

- [Tailwind CSS](/content/css/tailwind) - Utility-first framework
- [Bootstrap](/content/css/bootstrap) - Component framework
- [CSS Frameworks History](/content/css/css-frameworks-history) - How we got here
- [styled-components](/content/css/styled-components) - CSS-in-JS
- [React](/content/frameworks/react) - Often paired with Tailwind or styled-components
- [Next.js](/content/frameworks/nextjs) - Has built-in CSS Modules support

The CSS landscape has evolved from simple stylesheets to sophisticated build systems and frameworks. While options abound, most modern projects converge on Tailwind CSS for its developer experience and performance. Understanding the history and trade-offs helps you choose the right approach for your project.
