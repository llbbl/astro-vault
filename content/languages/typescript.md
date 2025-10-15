---
title: TypeScript
tags: [typescript, javascript, programming-languages, type-safety, frontend, backend]
---

# TypeScript

TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. Developed and maintained by Microsoft, it adds static type definitions to JavaScript, making code more predictable and easier to debug.

## What is TypeScript?

TypeScript is a **superset of JavaScript**, meaning any valid JavaScript code is also valid TypeScript code. It compiles down to plain JavaScript, which can run anywhere JavaScript runs: in browsers, on Node.js, or in any JavaScript engine.

The key addition is **static typing** - you can specify what type of values your variables, function parameters, and return values should be. This allows the TypeScript compiler to catch errors before your code even runs.

## Why Learn TypeScript?

### Type Safety

The primary benefit of TypeScript is catching errors during development rather than at runtime:

```typescript
function greet(name: string) {
  return `Hello, ${name}!`;
}

greet("Alice");  // ✓ Valid
greet(42);       // ✗ Error: Argument of type 'number' is not assignable to parameter of type 'string'
```

### Better IDE Support

TypeScript provides excellent autocomplete, refactoring tools, and inline documentation. Your editor knows exactly what properties and methods are available on each object.

### Scalability

TypeScript shines in larger codebases where type safety prevents bugs and makes refactoring safer. Many popular frameworks like [React](/content/frameworks/react), Angular, and Vue have first-class TypeScript support.

### Industry Adoption

Major companies use TypeScript for production applications:
- Microsoft (VS Code, Azure Portal)
- Google (Angular, Google Cloud Console)
- Airbnb, Slack, Stripe, and countless others

## Core Concepts

### Basic Types

```typescript
let isDone: boolean = false;
let age: number = 25;
let username: string = "Alice";
let list: number[] = [1, 2, 3];
let tuple: [string, number] = ["age", 25];
```

### Interfaces

Define the shape of objects:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean;  // Optional property
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};
```

### Type Inference

TypeScript is smart enough to infer types in many cases:

```typescript
let message = "Hello";  // TypeScript infers type 'string'
let count = 42;         // TypeScript infers type 'number'
```

### Generics

Create reusable components that work with multiple types:

```typescript
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("hello");
let output2 = identity<number>(42);
```

## TypeScript in Different Ecosystems

### Frontend Frameworks

TypeScript is widely used with modern [JavaScript frameworks](/content/frameworks/javascript-frameworks):

- **[React](/content/frameworks/react)**: Excellent TypeScript support with typed props and hooks
- **[Vue](/content/frameworks/vue)**: Vue 3 is written in TypeScript with full typing support
- **[Angular](/content/frameworks/angular)**: Built with TypeScript from the ground up
- **[Svelte](/content/frameworks/svelte)**: Growing TypeScript support
- **[Next.js](/content/frameworks/nextjs)**: Full-stack React framework with first-class TS support
- **[Astro](/content/frameworks/astro)**: Content-first framework with TypeScript support

### Backend Development

TypeScript works seamlessly with Node.js:

- **Express.js**: Type definitions available via `@types/express`
- **NestJS**: Built with TypeScript, inspired by Angular
- **tRPC**: End-to-end type safety between frontend and backend
- **Prisma**: Type-safe database ORM with excellent TypeScript integration

## Getting Started

### Installation

```bash
# Install TypeScript globally
npm install -g typescript

# Or use it in a project
npm install --save-dev typescript
```

### Basic Configuration

Create a `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Compile and Run

```bash
# Compile TypeScript to JavaScript
tsc app.ts

# Run with ts-node (development)
npx ts-node app.ts
```

## Common Patterns

### Union Types

A value can be one of several types:

```typescript
function printId(id: number | string) {
  console.log(`ID: ${id}`);
}

printId(101);      // ✓
printId("ABC123"); // ✓
```

### Type Guards

Narrow down types at runtime:

```typescript
function processValue(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase();
  } else {
    return value.toFixed(2);
  }
}
```

### Utility Types

TypeScript provides built-in utility types:

```typescript
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

// Make all properties optional
type PartialTodo = Partial<Todo>;

// Pick specific properties
type TodoPreview = Pick<Todo, "title" | "completed">;

// Make all properties readonly
type ReadonlyTodo = Readonly<Todo>;
```

## TypeScript vs JavaScript

| Aspect | JavaScript | TypeScript |
|--------|-----------|-----------|
| Type System | Dynamic | Static |
| Error Detection | Runtime | Compile-time |
| IDE Support | Basic | Advanced |
| Learning Curve | Lower | Moderate |
| Compilation | Not needed | Required |

## When to Use TypeScript

**Use TypeScript when:**
- Building large-scale applications
- Working in a team
- You want better IDE autocomplete and refactoring
- The project will be maintained long-term
- Using [React](/content/frameworks/react) or other modern frameworks

**Plain JavaScript might be better for:**
- Small scripts or prototypes
- Quick experiments
- Projects with minimal complexity
- When the team is unfamiliar with TypeScript

## Learning Resources

1. **Official Docs**: [typescriptlang.org](https://www.typescriptlang.org/)
2. **TypeScript Handbook**: Comprehensive guide covering all features
3. **Type Challenges**: Practice TypeScript with real-world scenarios
4. **DefinitelyTyped**: Community-maintained type definitions for JavaScript libraries

## Related Topics

- [JavaScript Frameworks](/content/frameworks/javascript-frameworks) - Most modern frameworks support TypeScript
- [React](/content/frameworks/react) - Using TypeScript with React
- [CSS Frameworks](/content/css/css-frameworks-history) - Styling TypeScript applications
- [Go](/content/languages/go) - Compiled, statically-typed alternative for backend
- [Python](/content/languages/python) - Dynamic typing with optional type hints
- [Rust](/content/languages/rust) - Systems programming with strong type safety
- [JavaScript Runtimes](/content/runtimes/javascript-runtimes) - Where TypeScript code runs

## Key Takeaways

- TypeScript adds static typing to JavaScript
- Catches errors during development, not runtime
- Provides excellent IDE support and autocomplete
- Scales well for large codebases and teams
- Works with all major frameworks and libraries
- The initial learning curve pays off in reduced bugs and better developer experience
