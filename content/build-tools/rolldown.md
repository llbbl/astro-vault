---
title: Rolldown - Rust Port of Rollup
tags: [rolldown, bundler, rust, rollup]
---

# Rolldown

Rolldown is a Rust port of Rollup being developed by the Vite team. It aims to provide Rollup's excellent bundling with esbuild-like performance.

## Key Features

- **Rollup Compatible**: Same API as Rollup
- **Rust Performance**: 10-100x faster than Rollup
- **Vite Integration**: Will replace Rollup in Vite
- **Plugin Compatibility**: Compatible with Rollup plugins
- **Tree Shaking**: Industry-leading dead code elimination

## Status (2025)

- **Development**: Active development, not production-ready
- **Vite**: Planned to replace Rollup in future Vite versions
- **API**: Following Rollup's API closely
- **Performance**: Showing promising benchmarks

## Installation

```bash
# Not yet published to npm
# Follow GitHub for updates
```

## Expected API

Based on Rollup compatibility:

```javascript
// rolldown.config.js
export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
  },
  plugins: [
    // Rollup plugins should work
  ],
};
```

## Performance Goals

| Operation | Rollup | Rolldown (Goal) |
|-----------|--------|-----------------|
| Build | 10s | 0.5s |
| Rebuild | 5s | 0.1s |
| Plugin Processing | 2s | 0.05s |

## Architecture

### Rust Core
- Fast parsing with SWC
- Parallel module processing
- Efficient tree-shaking

### Plugin Compatibility
- Napi bridge for JS plugins
- Native Rust plugins for performance
- Gradual migration path

## Comparison with Alternatives

| Feature | Rolldown | Rollup | esbuild |
|---------|----------|--------|---------|
| Speed | Fast | Slow | Fastest |
| Ecosystem | Growing | Excellent | Limited |
| Tree Shaking | Excellent | Excellent | Good |
| API | Rollup-like | Stable | Different |

## Use Cases

### Vite (Future)
Will power Vite production builds:
```javascript
// vite.config.ts (future)
export default {
  build: {
    rollupOptions: {
      // These will use Rolldown
    },
  },
};
```

### Library Bundling
Perfect for modern libraries:
```javascript
export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.esm.js', format: 'esm' },
    { file: 'dist/index.cjs.js', format: 'cjs' },
  ],
};
```

## Migration from Rollup

### Compatibility Layer
Rolldown aims for 100% Rollup compatibility:

```javascript
// Existing Rollup config should work as-is
import { rollup } from 'rolldown';

// Same API as Rollup
const bundle = await rollup({
  input: 'src/index.ts',
});
```

### Plugin Migration
Most Rollup plugins should work without changes:

```javascript
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  plugins: [
    resolve(),
    typescript(),
  ],
};
```

## Timeline

- **2024 Q4**: Alpha release
- **2025 Q1**: Beta release
- **2025 Q2**: Vite integration
- **2025 Q3**: Stable release

## Following Development

- **GitHub**: [rolldown-rs/rolldown](https://github.com/rolldown-rs/rolldown)
- **Discord**: Vite Discord server
- **Twitter**: Follow @youyuxi (Evan You)

## Benefits for Vite

### Unified Toolchain
Single tool for dev and prod:
- Dev: Vite's dev server
- Prod: Rolldown bundling

### Better Performance
Faster production builds:
- 10-100x faster than Rollup
- Reduced CI/CD times

### Plugin Compatibility
Use same plugins in dev and prod:
```javascript
// Same plugins work in both modes
export default {
  plugins: [myPlugin()],
};
```

## Resources

- **GitHub**: [rolldown-rs/rolldown](https://github.com/rolldown-rs/rolldown)
- **Rollup Docs**: [rollupjs.org](https://rollupjs.org/)
- **Vite**: [vitejs.dev](https://vitejs.dev/)
