---
title: Biome - Fast Linting and Formatting
tags: [biome, linting, formatting, tooling]
---

# Biome - Fast Linting and Formatting

Astro Vault uses [Biome](https://biomejs.dev/) for code linting and formatting. Biome is a fast, modern toolchain that replaces ESLint, Prettier, and other JavaScript tooling with a single, performant tool written in Rust.

## Why Biome?

### Speed
- **100x faster** than ESLint + Prettier
- **Rust-based**: Compiled to native code, not JavaScript
- **Incremental linting**: Only checks changed files
- **Parallel processing**: Uses all CPU cores

### Single Tool
- **Linting**: Catches bugs and code smells
- **Formatting**: Opinionated code formatting
- **Import sorting**: Organizes imports automatically
- **No config conflicts**: One tool, one config

### Great DX
- **Fast feedback**: Results in milliseconds
- **Clear error messages**: Helpful diagnostics with context
- **Editor integration**: VS Code, Neovim, Zed, etc.
- **CI/CD ready**: Built for automation

## Configuration

### biome.json
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": [
      "node_modules",
      "dist",
      ".astro",
      "pnpm-lock.yaml"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "off"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "es5"
    }
  }
}
```

### Key Settings

**Formatter**
- `indentStyle: "tab"`: Use tabs (2 spaces equivalent)
- `lineWidth: 100`: Max line length
- `quoteStyle: "single"`: Single quotes for strings
- `semicolons: "always"`: Always use semicolons
- `trailingCommas: "es5"`: Trailing commas where valid

**Linter**
- `recommended: true`: All recommended rules enabled
- Custom overrides for specific rules
- Catches common bugs and anti-patterns

**Import Organization**
- Automatically sorts imports
- Groups by type (external, internal, relative)
- Removes unused imports

## Usage

### package.json Scripts
```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write ."
  }
}
```

### Commands

**Check for issues:**
```bash
pnpm lint
```

**Fix automatically:**
```bash
pnpm lint:fix
```

**Format only:**
```bash
pnpm format
```

## Linting Rules

### Enabled Rules

**Correctness**
- `noUnusedVariables`: Catch unused variables
- `noUndeclaredVariables`: Require variable declarations
- `useValidForDirection`: Prevent infinite loops
- `noInvalidConstructorSuper`: Validate constructor calls

**Security**
- `noDangerouslySetInnerHTML`: Prevent XSS vulnerabilities
- `noGlobalEval`: Disallow eval()

**Performance**
- `noAccumulatingSpread`: Avoid O(n²) spread operations
- `noDelete`: Discourage delete operator (performance)

**Style**
- `useConst`: Prefer const over let when possible
- `useSingleVarDeclarator`: One variable per declaration
- `useShorthandFunctionType`: Use arrow functions

### Custom Overrides
```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "off"  // Allow explicit any in TypeScript
      }
    }
  }
}
```

## Editor Integration

### VS Code
1. Install [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
2. Add to `.vscode/settings.json`:
```json
{
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

### Neovim
```lua
-- Using nvim-lspconfig
require('lspconfig').biome.setup{}

-- Using null-ls
local null_ls = require("null-ls")
null_ls.setup({
  sources = {
    null_ls.builtins.formatting.biome,
    null_ls.builtins.diagnostics.biome,
  },
})
```

### Zed
Biome is built-in to Zed editor. Enable in settings:
```json
{
  "formatter": "biome",
  "linter": "biome"
}
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Lint
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
```

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
pnpm lint:fix --no-errors-on-unmatched --changed
```

Or use [husky](https://typicode.github.io/husky/):
```bash
pnpm add -D husky
npx husky init
echo "pnpm lint:fix --changed" > .husky/pre-commit
```

## Migration from ESLint/Prettier

### Why Migrate?
- **10-100x faster** execution time
- **Single tool** instead of multiple configs
- **Better error messages** with context
- **Built-in import sorting**
- **No plugin conflicts**

### Migration Steps

1. **Remove old tools:**
```bash
pnpm remove eslint prettier eslint-config-prettier eslint-plugin-react
rm .eslintrc.json .prettierrc
```

2. **Install Biome:**
```bash
pnpm add -D @biomejs/biome
```

3. **Initialize config:**
```bash
pnpm biome init
```

4. **Update scripts:**
```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write ."
  }
}
```

5. **Run on entire codebase:**
```bash
pnpm lint:fix
```

## Performance Comparison

### Linting Speed
| Tool | Time (1000 files) | Relative Speed |
|------|-------------------|----------------|
| Biome | 0.5s | 100x |
| ESLint | 50s | 1x |

### Formatting Speed
| Tool | Time (1000 files) | Relative Speed |
|------|-------------------|----------------|
| Biome | 0.3s | 100x |
| Prettier | 30s | 1x |

*Benchmarks run on 2023 M2 MacBook Pro*

## Advanced Features

### Incremental Checking
Only check files that changed since last commit:
```bash
biome check --changed
```

### Staged Files Only
Check only Git staged files:
```bash
biome check --staged
```

### Watch Mode
Watch files and re-lint on changes:
```bash
biome check --watch
```

### Custom Ignore Patterns
```json
{
  "files": {
    "ignore": [
      "**/generated/**",
      "**/*.config.js",
      "scripts/legacy/**"
    ]
  }
}
```

## Troubleshooting

### Biome vs Prettier Differences
Some formatting differences exist:

**Line breaks in JSX:**
```jsx
// Prettier
<Component
  prop1="value"
  prop2="value"
/>

// Biome
<Component prop1="value" prop2="value" />
```

**Object formatting:**
```js
// Prettier
const obj = {
  a: 1,
  b: 2,
};

// Biome
const obj = { a: 1, b: 2 };
```

### Disable for Specific Lines
```typescript
// biome-ignore lint/suspicious/noExplicitAny: Legacy code
const data: any = getLegacyData();
```

### Ignore Entire File
```typescript
// biome-ignore-file
// Legacy code, will refactor later
```

## Resources

- **Official Website**: [biomejs.dev](https://biomejs.dev/)
- **GitHub**: [biomejs/biome](https://github.com/biomejs/biome)
- **VS Code Extension**: [Biome Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- **Configuration Reference**: [Biome Configuration](https://biomejs.dev/reference/configuration/)
- **Linter Rules**: [Rules Reference](https://biomejs.dev/linter/rules/)
