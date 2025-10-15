---
title: Turbopack - Rust-Powered Bundler for Next.js
tags: [turbopack, bundler, rust, nextjs, vercel]
---

# Turbopack

Turbopack is a Rust-based successor to Webpack, built by Vercel for Next.js. It promises 700x faster updates than Webpack and 10x faster than Vite.

## Key Features

- **Rust-Based**: Written in Rust for maximum performance
- **Incremental Computation**: Only recomputes what changed
- **Next.js Integration**: Built specifically for Next.js 13+
- **Lazy Bundling**: Only bundles requested code
- **Fast HMR**: Updates in milliseconds

## Installation

Turbopack is built into Next.js 13+:

```bash
pnpm create next-app --use-turbo
```

## Usage

### Next.js Development
```bash
# Use Turbopack in development
next dev --turbo
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      // Turbopack options
    },
  },
};

module.exports = nextConfig;
```

## Configuration

### Resolve Aliases
```javascript
const nextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        '@': './src',
        '@components': './src/components',
      },
    },
  },
};
```

### Custom Loaders
```javascript
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};
```

## Performance Benchmarks

### HMR Speed (Vercel's Claims)
| Bundler | Update Time (large app) |
|---------|-------------------------|
| Turbopack | 10ms |
| Vite | 100ms |
| Webpack | 1000ms |

### Cold Start
| Bundler | Startup Time |
|---------|--------------|
| Turbopack | 1.5s |
| Vite | 2s |
| Webpack | 10s |

## Architecture

### Incremental Computation
Turbopack uses a function-level caching system:

```
File changed → Recompute affected functions → Update bundle
```

Only the minimum necessary work is done on each update.

### Lazy Bundling
Only bundles what's requested:

```
Request → Bundle required modules → Serve
```

## Comparison with Vite

| Feature | Turbopack | Vite |
|---------|-----------|------|
| Language | Rust | JavaScript |
| HMR Speed | ~10ms | ~100ms |
| Ecosystem | Limited | Extensive |
| Maturity | Early | Stable |
| Framework | Next.js only | Framework agnostic |

## Current Status (2025)

- **Stability**: Beta, recommended for Next.js development
- **Production**: Not yet recommended for production builds
- **Ecosystem**: Growing, limited plugins
- **Documentation**: Improving

## Use Cases

### Next.js Development
Perfect for large Next.js applications:
```bash
next dev --turbo
```

### Vercel Deployment
Optimized for Vercel platform:
```bash
# Vercel automatically uses Turbopack
vercel dev
```

## Limitations

- Next.js only (not framework-agnostic)
- Limited plugin ecosystem
- Early stage (breaking changes possible)
- Production builds still use Webpack

## Future Roadmap

- Production build support
- Framework-agnostic version
- Plugin API stabilization
- Community plugin ecosystem

## Resources

- **Docs**: [turbo.build/pack](https://turbo.build/pack)
- **GitHub**: [vercel/turbo](https://github.com/vercel/turbo)
- **Next.js**: [nextjs.org](https://nextjs.org/)
