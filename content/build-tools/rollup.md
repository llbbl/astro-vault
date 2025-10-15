---
title: Rollup - The Library Bundler
tags: [rollup, bundler, esm, libraries]
---

# Rollup

Rollup is a module bundler optimized for libraries and ES modules. It pioneered tree-shaking and produces clean, efficient bundles perfect for npm packages.

## Key Features

- **Tree Shaking**: Industry-leading dead code elimination
- **ES Modules**: Native ESM output
- **Clean Output**: Readable, minimal bundles
- **Plugin System**: Extensive plugin ecosystem
- **Multiple Formats**: ESM, CommonJS, UMD, IIFE

## Installation

```bash
pnpm add -D rollup
```

## Basic Configuration

```javascript
// rollup.config.js
export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
    },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
    },
  ],
};
```

## TypeScript Support

```bash
pnpm add -D @rollup/plugin-typescript
```

```javascript
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
  },
  plugins: [typescript()],
};
```

## Common Plugins

### Node Resolve
```bash
pnpm add -D @rollup/plugin-node-resolve
```

```javascript
import resolve from '@rollup/plugin-node-resolve';

export default {
  plugins: [resolve()],
};
```

### CommonJS
```bash
pnpm add -D @rollup/plugin-commonjs
```

```javascript
import commonjs from '@rollup/plugin-commonjs';

export default {
  plugins: [commonjs()],
};
```

### Terser (Minification)
```bash
pnpm add -D @rollup/plugin-terser
```

```javascript
import terser from '@rollup/plugin-terser';

export default {
  plugins: [terser()],
};
```

## Library Configuration

```javascript
export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm',
    },
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'MyLibrary',
    },
  ],
  external: ['react', 'react-dom'], // Don't bundle dependencies
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    terser(),
  ],
};
```

## Watch Mode

```bash
# Watch for changes
rollup -c --watch
```

```javascript
// rollup.config.js
export default {
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**',
  },
};
```

## Tree Shaking

Rollup automatically removes unused code:

```javascript
// utils.js
export function used() {
  return 'I am used';
}

export function unused() {
  return 'I am not used';
}

// index.js
import { used } from './utils';
console.log(used());

// Output: only `used()` is included
```

## Resources

- **Docs**: [rollupjs.org](https://rollupjs.org/)
- **GitHub**: [rollup/rollup](https://github.com/rollup/rollup)
- **Plugins**: [github.com/rollup/plugins](https://github.com/rollup/plugins)
