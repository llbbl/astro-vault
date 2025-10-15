---
title: esbuild - The Extreme Speed Bundler
tags: [esbuild, bundler, go, performance]
---

# esbuild

esbuild is an extremely fast JavaScript bundler and minifier written in Go. It's 10-100x faster than traditional bundlers and is used by Vite, Remix, and many other modern tools.

## Key Features

- **Extreme Speed**: 10-100x faster than webpack
- **Go-based**: Native compilation for performance
- **Built-in Features**: TypeScript, JSX, minification included
- **Simple API**: Easy to use and configure
- **Tree Shaking**: Automatic dead code elimination

## Installation

```bash
pnpm add -D esbuild
```

## Basic Usage

### CLI
```bash
# Bundle single file
esbuild src/index.ts --bundle --outfile=dist/bundle.js

# Watch mode
esbuild src/index.ts --bundle --watch --outfile=dist/bundle.js

# Minify
esbuild src/index.ts --bundle --minify --outfile=dist/bundle.min.js
```

### Build API
```javascript
import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  minify: true,
  sourcemap: true,
});
```

## Configuration

### TypeScript Support
```javascript
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
  },
});
```

### React/JSX
```javascript
await esbuild.build({
  entryPoints: ['src/App.jsx'],
  bundle: true,
  outfile: 'dist/app.js',
  loader: {
    '.jsx': 'jsx',
  },
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
});
```

### Multiple Entry Points
```javascript
await esbuild.build({
  entryPoints: ['src/app.ts', 'src/worker.ts'],
  bundle: true,
  outdir: 'dist',
  splitting: true,
  format: 'esm',
});
```

## Advanced Features

### Code Splitting
```javascript
await esbuild.build({
  entryPoints: ['src/home.tsx', 'src/about.tsx'],
  bundle: true,
  outdir: 'dist',
  splitting: true,
  format: 'esm',
});
```

### External Dependencies
```javascript
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  external: ['react', 'react-dom'],
});
```

### Environment Variables
```javascript
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.API_URL': '"https://api.example.com"',
  },
});
```

## Plugins

### CSS Plugin
```javascript
import { sassPlugin } from 'esbuild-sass-plugin';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  plugins: [sassPlugin()],
});
```

### Custom Plugin
```javascript
const myPlugin = {
  name: 'my-plugin',
  setup(build) {
    build.onResolve({ filter: /^custom:/ }, args => ({
      path: args.path,
      namespace: 'custom',
    }));

    build.onLoad({ filter: /.*/, namespace: 'custom' }, async (args) => ({
      contents: 'export default "custom content"',
      loader: 'js',
    }));
  },
};

await esbuild.build({
  plugins: [myPlugin],
});
```

## Watch Mode

```javascript
const ctx = await esbuild.context({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
});

await ctx.watch();
```

## Serve Mode

```javascript
const ctx = await esbuild.context({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
});

const { host, port } = await ctx.serve({
  servedir: 'public',
  port: 3000,
});

console.log(`Serving on http://${host}:${port}`);
```

## Performance Comparison

| Bundler | Time (1000 modules) |
|---------|---------------------|
| esbuild | 0.5s |
| Vite | 2s |
| Rollup | 10s |
| Webpack | 30s |

## Use Cases

### Development Builds
Perfect for fast development iterations:
```javascript
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  sourcemap: 'inline',
  watch: true,
});
```

### CI/CD Pipelines
Fast builds in continuous integration:
```bash
esbuild src/index.ts --bundle --minify --outfile=dist/bundle.js
```

### Library Bundling
Quick library builds:
```javascript
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  format: 'esm',
  external: ['react'],
});
```

## Limitations

- No HMR (Hot Module Replacement)
- Limited plugin ecosystem
- No built-in dev server with advanced features
- Basic code splitting

## Resources

- **Docs**: [esbuild.github.io](https://esbuild.github.io/)
- **GitHub**: [evanw/esbuild](https://github.com/evanw/esbuild)
- **Plugins**: [github.com/esbuild/community-plugins](https://github.com/esbuild/community-plugins)
