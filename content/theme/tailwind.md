---
title: Tailwind CSS 4 - Modern Styling
tags: [tailwind, css, styling, design]
---

# Tailwind CSS 4 - Modern Styling

Astro Vault uses [Tailwind CSS 4](https://tailwindcss.com/), the latest version of the utility-first CSS framework. Tailwind 4 brings significant performance improvements and a streamlined configuration system.

## Why Tailwind CSS 4?

### Performance
- **Oxide engine**: 10x faster than Tailwind 3
- **Rust-based**: Native compilation for speed
- **Smaller output**: Optimized CSS generation
- **Faster HMR**: Instant updates during development

### Modern CSS
- **Native cascade layers**: Better specificity control
- **CSS variables**: Dynamic theming
- **Container queries**: Responsive components
- **Modern color spaces**: P3, oklch support

### Developer Experience
- **Zero config**: Works out of the box
- **Vite plugin**: First-class Vite integration
- **IntelliSense**: VS Code autocompletion
- **JIT mode**: Generate utilities on demand

## Configuration

### Tailwind CSS 4 Setup
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### Theme Configuration
```css
/* src/styles/global.css */
@import 'tailwindcss';

@theme {
  --color-primary: oklch(0.6 0.2 250);
  --color-secondary: oklch(0.7 0.15 200);
  --font-display: 'Inter Variable', sans-serif;
}
```

## Custom Themes

Astro Vault includes 6 pre-built themes using CSS variables:

```css
/* Dark Theme (default) */
:root {
  --color-bg: #0a0a0a;
  --color-text: #e5e5e5;
  --color-primary: #3b82f6;
  --color-sidebar-bg: #1a1a1a;
  --color-toc-bg: #141414;
}

/* Light Theme */
[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text: #171717;
  --color-primary: #2563eb;
  --color-sidebar-bg: #f5f5f5;
  --color-toc-bg: #fafafa;
}

/* Ocean Theme */
[data-theme="ocean"] {
  --color-bg: #0c1e2e;
  --color-text: #d0e7f5;
  --color-primary: #38bdf8;
  --color-sidebar-bg: #152a3e;
  --color-toc-bg: #0f2334;
}
```

## Utility Classes

### Layout
```html
<!-- Flex container -->
<div class="flex items-center justify-between gap-4">
  <span>Logo</span>
  <nav class="flex gap-2">...</nav>
</div>

<!-- Grid layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <article>...</article>
  <article>...</article>
  <article>...</article>
</div>

<!-- Container -->
<div class="container mx-auto px-4 max-w-7xl">
  <main>...</main>
</div>
```

### Typography
```html
<!-- Headings -->
<h1 class="text-4xl font-bold text-text">Title</h1>
<h2 class="text-3xl font-semibold text-text">Subtitle</h2>
<p class="text-base text-text-muted leading-relaxed">Body text</p>

<!-- Links -->
<a href="#" class="text-primary hover:opacity-80 underline">
  Link
</a>

<!-- Code -->
<code class="px-2 py-1 bg-gray-800 rounded text-sm font-mono">
  const x = 1;
</code>
```

### Colors
```html
<!-- Background colors -->
<div class="bg-bg">Default background</div>
<div class="bg-sidebar-bg">Sidebar background</div>
<div class="bg-primary">Primary color</div>

<!-- Text colors -->
<p class="text-text">Default text</p>
<p class="text-text-muted">Muted text</p>
<p class="text-primary">Primary text</p>

<!-- Border colors -->
<div class="border border-border">With border</div>
```

### Spacing
```html
<!-- Padding -->
<div class="p-4">Padding all sides</div>
<div class="px-6 py-4">Padding x and y</div>
<div class="pt-8 pb-4">Padding top and bottom</div>

<!-- Margin -->
<div class="m-4">Margin all sides</div>
<div class="mx-auto">Center horizontally</div>
<div class="mt-8 mb-4">Margin top and bottom</div>

<!-- Gap (for flex/grid) -->
<div class="flex gap-4">Flex with gap</div>
<div class="grid gap-6">Grid with gap</div>
```

### Responsive Design
```html
<!-- Mobile first -->
<div class="
  w-full          /* Mobile: full width */
  md:w-1/2        /* Tablet: half width */
  lg:w-1/3        /* Desktop: third width */
  xl:w-1/4        /* Large: quarter width */
">
  Responsive container
</div>

<!-- Hide/show at breakpoints -->
<div class="
  hidden          /* Hidden on mobile */
  md:block        /* Show on tablet+ */
">
  Desktop only
</div>
```

## Component Examples

### Header
```html
<header class="sticky top-0 z-50 bg-sidebar-bg border-b border-border">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <a href="/" class="text-xl font-bold text-text">
        Astro Vault
      </a>
      <nav class="flex gap-4">
        <a href="/docs" class="text-text hover:text-primary">
          Docs
        </a>
        <a href="/blog" class="text-text hover:text-primary">
          Blog
        </a>
      </nav>
    </div>
  </div>
</header>
```

### Card
```html
<article class="
  bg-sidebar-bg
  border border-border
  rounded-lg
  p-6
  hover:shadow-lg
  transition-shadow
">
  <h3 class="text-xl font-semibold text-text mb-2">
    Card Title
  </h3>
  <p class="text-text-muted leading-relaxed">
    Card description goes here.
  </p>
</article>
```

### Button
```html
<button class="
  px-4 py-2
  bg-primary
  text-white
  rounded-md
  font-medium
  hover:opacity-90
  active:scale-95
  transition-all
  focus:outline-none
  focus:ring-2
  focus:ring-primary
  focus:ring-offset-2
">
  Click me
</button>
```

## Resources

- **Official Docs**: [tailwindcss.com](https://tailwindcss.com/)
- **Tailwind 4 Beta**: [v4.tailwindcss.com](https://v4.tailwindcss.com/)
- **GitHub**: [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)
- **Playground**: [play.tailwindcss.com](https://play.tailwindcss.com/)
