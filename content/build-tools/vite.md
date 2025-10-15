---
title: Vite - Next Generation Frontend Tooling
tags: [vite, build-tools, bundler, dev-server]
---

# Vite - Next Generation Frontend Tooling

Vite (French for "fast") is a modern build tool that provides an extremely fast development experience with instant server start and lightning-fast HMR.

## Why Vite?

### Instant Server Start
- **No bundling**: Serves source files over native ESM
- **On-demand compilation**: Only compiles files when requested
- **Cold start**: < 1 second regardless of project size

### Lightning Fast HMR
- **Instant updates**: Changes reflect in < 100ms
- **Precise invalidation**: Only affected modules reload
- **State preservation**: Component state maintained

### Optimized Production Builds
- **Rollup-based**: Uses Rollup for production bundling
- **Tree-shaking**: Removes unused code
- **Code splitting**: Automatic chunking
- **Asset optimization**: Minification, compression

## Installation

```bash
# Create new Vite project
pnpm create vite my-app

# Or add to existing project
pnpm add -D vite
```

## Configuration

### Basic Config (vite.config.ts)
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
});
```

### With React
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

### With Vue
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
```

### With Astro (Astro Vault)
```typescript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

## Development Server

### Start Dev Server
```bash
# Start on port 5173 (default)
pnpm vite

# Custom port
pnpm vite --port 3000

# Open browser automatically
pnpm vite --open

# Expose to network
pnpm vite --host
```

### Hot Module Replacement
```typescript
// HMR API (automatic for most frameworks)
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Handle module update
  });
}
```

## Production Build

### Build for Production
```bash
# Build optimized bundles
pnpm vite build

# Build and analyze
pnpm vite build --mode production

# Preview production build
pnpm vite preview
```

### Build Configuration
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

## Plugins

### Official Plugins
```bash
pnpm add -D @vitejs/plugin-react    # React
pnpm add -D @vitejs/plugin-vue      # Vue 3
pnpm add -D @vitejs/plugin-legacy   # Legacy browsers
```

### Popular Community Plugins
```bash
pnpm add -D vite-plugin-pwa         # PWA support
pnpm add -D vite-plugin-compression # Gzip/Brotli
pnpm add -D vite-imagetools         # Image optimization
```

### Creating Custom Plugin
```typescript
import type { Plugin } from 'vite';

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    transform(code, id) {
      if (id.endsWith('.custom')) {
        return {
          code: transformCode(code),
          map: null,
        };
      }
    },
  };
}
```

## Environment Variables

### .env Files
```bash
# .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
```

### Access in Code
```typescript
// Access with import.meta.env
const apiUrl = import.meta.env.VITE_API_URL;
const title = import.meta.env.VITE_APP_TITLE;

// TypeScript support
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
}
```

## Asset Handling

### Import Assets
```typescript
// Import as URL
import logo from './logo.svg';

// Import as raw string
import shader from './shader.glsl?raw';

// Import as web worker
import Worker from './worker?worker';
```

### Public Directory
```
public/
  favicon.ico
  robots.txt
  images/
    hero.jpg
```

```html
<!-- Reference public assets with / -->
<img src="/images/hero.jpg" alt="Hero" />
```

## CSS Processing

### CSS Modules
```css
/* styles.module.css */
.button {
  background: blue;
}
```

```typescript
import styles from './styles.module.css';

<button className={styles.button}>Click</button>
```

### PostCSS
```javascript
// postcss.config.js
export default {
  plugins: {
    autoprefixer: {},
    cssnano: {},
  },
};
```

### CSS Preprocessors
```bash
pnpm add -D sass           # .scss, .sass
pnpm add -D less           # .less
pnpm add -D stylus         # .styl
```

## Performance

### Bundle Analysis
```bash
pnpm vite build --mode production
```

### Build Stats
```typescript
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
    }),
  ],
});
```

## Optimization

### Code Splitting
```typescript
// Automatic code splitting
const Dashboard = lazy(() => import('./Dashboard'));
```

### Preloading
```typescript
// Preload module
const modulePromise = import('./heavy-module.js');
```

### Asset Inlining
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    assetsInlineLimit: 4096, // < 4kb inlined as base64
  },
});
```

## Migration from Webpack

### Key Differences
- No webpack.config.js needed
- Import paths use ES modules
- Assets handled differently
- Environment variables prefixed with VITE_

### Example Migration
```javascript
// webpack.config.js (before)
module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
};

// vite.config.ts (after)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()], // TypeScript supported out of the box
});
```

## Resources

- **Official Docs**: [vitejs.dev](https://vitejs.dev/)
- **GitHub**: [vitejs/vite](https://github.com/vitejs/vite)
- **Plugins**: [vitejs.dev/plugins](https://vitejs.dev/plugins/)
- **Awesome Vite**: [github.com/vitejs/awesome-vite](https://github.com/vitejs/awesome-vite)
