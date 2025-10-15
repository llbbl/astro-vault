---
title: Vitest - Modern Testing Framework
tags: [vitest, testing, typescript, unit-testing]
---

# Vitest - Modern Testing Framework

Astro Vault uses [Vitest](https://vitest.dev/) for fast, modern unit testing with TypeScript support and browser mode for React components.

## Why Vitest?

### Speed
- **Instant feedback**: Tests run in milliseconds
- **Watch mode**: Re-run tests on file changes
- **Parallel execution**: Tests run concurrently
- **Smart re-runs**: Only retest changed files

### Modern Features
- **Native ESM**: No configuration needed
- **TypeScript**: First-class TypeScript support
- **Browser mode**: Test in real browsers
- **JSX/TSX**: React component testing
- **Vite integration**: Uses Vite's transformation pipeline

### Developer Experience
- **Jest-compatible API**: Easy migration from Jest
- **UI mode**: Visual test runner
- **Coverage**: Built-in code coverage
- **Snapshot testing**: Update snapshots easily

## Configuration

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.*',
        '**/dist/**',
      ],
    },
  },
});
```

### package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Writing Tests

### Basic Test
```typescript
import { describe, it, expect } from 'vitest';

describe('math utilities', () => {
  it('should add two numbers', () => {
    expect(1 + 1).toBe(2);
  });

  it('should multiply numbers', () => {
    expect(2 * 3).toBe(6);
  });
});
```

### Async Tests
```typescript
import { describe, it, expect } from 'vitest';

describe('API calls', () => {
  it('should fetch data', async () => {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();

    expect(data).toBeDefined();
    expect(data.status).toBe('success');
  });
});
```

### Parameterized Tests
```typescript
import { describe, it, expect } from 'vitest';

describe.each([
  { a: 1, b: 1, expected: 2 },
  { a: 2, b: 2, expected: 4 },
  { a: 3, b: 3, expected: 6 },
])('add($a, $b)', ({ a, b, expected }) => {
  it(`should return ${expected}`, () => {
    expect(a + b).toBe(expected);
  });
});
```

## Testing React Components

### Component Test
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Search } from '../components/Search';

describe('Search component', () => {
  it('should render search input', () => {
    render(<Search />);

    const input = screen.getByPlaceholderText('Search documentation...');
    expect(input).toBeInTheDocument();
  });

  it('should show results on typing', async () => {
    const { user } = render(<Search />);
    const input = screen.getByPlaceholderText('Search documentation...');

    await user.type(input, 'test query');

    expect(input).toHaveValue('test query');
  });
});
```

### User Interactions
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

describe('ThemeSwitcher', () => {
  it('should change theme on click', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    const button = screen.getByRole('button', { name: /theme/i });
    await user.click(button);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('light');
    });
  });
});
```

### Component Snapshots
```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DocsToc } from '../components/DocsToc';

describe('DocsToc', () => {
  it('should match snapshot', () => {
    const { container } = render(
      <DocsToc headings={[
        { depth: 1, text: 'Title', id: 'title' },
        { depth: 2, text: 'Subtitle', id: 'subtitle' },
      ]} />
    );

    expect(container).toMatchSnapshot();
  });
});
```

## Mocking

### Mock Functions
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('callback functions', () => {
  it('should call callback', () => {
    const callback = vi.fn();
    const button = { onClick: callback };

    button.onClick();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

### Mock Modules
```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('@logan/libsql-search', () => ({
  searchArticles: vi.fn().mockResolvedValue([
    { title: 'Test Article', slug: 'test-article' }
  ]),
}));

import { searchArticles } from '@logan/libsql-search';

describe('search', () => {
  it('should return mocked results', async () => {
    const results = await searchArticles('query');

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Test Article');
  });
});
```

### Mock API Calls
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('API calls', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should fetch search results', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });

    const response = await fetch('/api/search.json?q=test');
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith('/api/search.json?q=test');
    expect(data.results).toEqual([]);
  });
});
```

## Coverage

### Running Coverage
```bash
# Run tests with coverage
pnpm test:coverage

# Open coverage report
open coverage/index.html
```

### Coverage Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.*',
        '**/dist/**',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### Coverage Badge
```markdown
![Coverage](https://img.shields.io/badge/coverage-85%25-green)
```

## Browser Mode

### Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: true,
    },
  },
});
```

### Browser Tests
```typescript
import { describe, it, expect } from 'vitest';
import { page } from '@vitest/browser/context';

describe('browser interactions', () => {
  it('should render page', async () => {
    await page.goto('http://localhost:4321');

    const title = await page.title();
    expect(title).toBe('Astro Vault');
  });

  it('should perform search', async () => {
    await page.goto('http://localhost:4321');
    await page.fill('input[type="text"]', 'test query');
    await page.press('input[type="text"]', 'Enter');

    await page.waitForSelector('.search-results');
    const results = await page.$$('.search-result');

    expect(results.length).toBeGreaterThan(0);
  });
});
```

## Watch Mode

### Running in Watch Mode
```bash
# Start watch mode
pnpm test

# Watch specific file
pnpm test src/components/Search.test.tsx

# Watch files matching pattern
pnpm test --grep="search"
```

### Watch Mode Commands
```
› Press a to rerun all tests
› Press f to rerun only failed tests
› Press u to update snapshots
› Press p to filter by filename
› Press t to filter by test name
› Press q to quit
```

## UI Mode

### Starting UI Mode
```bash
# Start UI mode
pnpm test:ui

# Open in browser
open http://localhost:51204/__vitest__/
```

### UI Features
- **Visual test runner**: See all tests in browser
- **Interactive**: Click to run/debug specific tests
- **Real-time**: Updates on file changes
- **Code coverage**: Visual coverage overlay
- **Console output**: See logs for each test

## Testing Best Practices

### Arrange-Act-Assert
```typescript
it('should calculate total', () => {
  // Arrange
  const items = [
    { price: 10, quantity: 2 },
    { price: 20, quantity: 1 },
  ];

  // Act
  const total = calculateTotal(items);

  // Assert
  expect(total).toBe(40);
});
```

### Test Isolation
```typescript
import { describe, it, beforeEach, afterEach } from 'vitest';

describe('user auth', () => {
  let user: User;

  beforeEach(() => {
    user = createUser();
  });

  afterEach(() => {
    user.logout();
  });

  it('should login', () => {
    user.login('test@example.com', 'password');
    expect(user.isAuthenticated).toBe(true);
  });
});
```

### Descriptive Tests
```typescript
// ❌ Bad - unclear what it tests
it('should work', () => {
  expect(add(1, 1)).toBe(2);
});

// ✅ Good - clear intent
it('should add two positive numbers', () => {
  expect(add(1, 1)).toBe(2);
});
```

## TypeScript Support

### Type-Safe Matchers
```typescript
import { describe, it, expect } from 'vitest';

interface User {
  name: string;
  email: string;
}

describe('type safety', () => {
  it('should have type-safe assertions', () => {
    const user: User = {
      name: 'John',
      email: 'john@example.com',
    };

    expect(user).toHaveProperty('name');
    expect(user.name).toBeTypeOf('string');
    expect(user.email).toMatch(/@/);
  });
});
```

### Custom Matchers
```typescript
import { expect } from 'vitest';

interface CustomMatchers<R = unknown> {
  toBeValidEmail(): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`,
    };
  },
});

// Usage
expect('test@example.com').toBeValidEmail();
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Migration from Jest

### API Compatibility
Vitest is mostly Jest-compatible:

```typescript
// Jest
import { describe, it, expect } from '@jest/globals';

// Vitest (same API)
import { describe, it, expect } from 'vitest';
```

### Migration Steps
1. Replace Jest with Vitest:
```bash
pnpm remove jest @types/jest
pnpm add -D vitest @vitest/ui
```

2. Update scripts in package.json:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

3. Create vitest.config.ts (optional if using defaults)

4. Update imports in test files

## Resources

- **Official Docs**: [vitest.dev](https://vitest.dev/)
- **GitHub**: [vitest-dev/vitest](https://github.com/vitest-dev/vitest)
- **Testing Library**: [testing-library.com](https://testing-library.com/)
- **API Reference**: [vitest.dev/api](https://vitest.dev/api/)
- **Examples**: [vitest.dev/guide](https://vitest.dev/guide/)
