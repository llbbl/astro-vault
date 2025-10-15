---
title: Svelte
tags: [svelte, javascript, typescript, framework, compiler, reactive, performance]
---

# Svelte

Svelte is a radical new approach to building user interfaces. Unlike traditional frameworks like [React](/content/frameworks/react) or [Vue](/content/frameworks/vue) that do most of their work in the browser, Svelte shifts that work into a compile step. Created by Rich Harris in 2016, Svelte compiles your code to highly efficient vanilla JavaScript at build time, resulting in faster apps with smaller bundles.

## What is Svelte?

Svelte is a **compiler**, not a framework with a runtime:

```svelte
<script>
  let count = 0;

  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Clicked {count} {count === 1 ? 'time' : 'times'}
</button>

<style>
  button {
    background: #ff3e00;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
```

This compiles to optimized vanilla JavaScript—no virtual DOM, no runtime overhead!

**Key Philosophy:**
- **Truly reactive**: No `setState` or hooks
- **Compile-time magic**: Framework logic runs at build time
- **Less code**: More concise than React or Vue
- **No virtual DOM**: Direct DOM manipulation

## Why Svelte?

### 1. No Virtual DOM

Svelte compiles to direct DOM updates:

```svelte
<!-- Svelte -->
<script>
  let name = 'world';
</script>

<h1>Hello {name}!</h1>
```

**Compiled output (simplified):**
```javascript
function update(name) {
  h1.textContent = `Hello ${name}!`;
}
```

**vs React (with virtual DOM):**
```jsx
function Component({ name }) {
  return <h1>Hello {name}!</h1>;
}
// Creates virtual DOM → diffs → updates real DOM
```

**Result**: Svelte is faster and uses less memory.

### 2. True Reactivity

No hooks, no `setState`—just assign:

```svelte
<script>
  let count = 0;

  // Reactive statement
  $: doubled = count * 2;

  // Reactive block
  $: {
    console.log(`Count is ${count}`);
    if (count > 10) {
      alert('Count is getting high!');
    }
  }

  function increment() {
    count += 1; // That's it! Svelte tracks this automatically
  }
</script>

<p>Count: {count}</p>
<p>Doubled: {doubled}</p>
<button on:click={increment}>+</button>
```

**Compare to React:**
```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const doubled = useMemo(() => count * 2, [count]);

  useEffect(() => {
    console.log(`Count is ${count}`);
    if (count > 10) {
      alert('Count is getting high!');
    }
  }, [count]);

  function increment() {
    setCount(count + 1);
  }

  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

Svelte requires much less code!

### 3. Smaller Bundle Sizes

**Hello World comparison:**
- **Svelte**: ~2 KB
- **Vue**: ~40 KB
- **React**: ~45 KB

**Real app (TodoMVC):**
- **Svelte**: ~7 KB
- **Vue**: ~54 KB
- **React**: ~110 KB

### 4. Scoped Styles Built-In

```svelte
<div class="card">
  <h2>Card Title</h2>
</div>

<style>
  /* Automatically scoped to this component */
  .card {
    padding: 1rem;
    background: white;
    border-radius: 8px;
  }

  h2 {
    color: #333;
  }
</style>
```

No need for CSS Modules, [styled-components](/content/css/styled-components), or BEM.

### 5. Built-In Animations

```svelte
<script>
  import { fade, fly, scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  let visible = true;
</script>

{#if visible}
  <div transition:fade>
    Fades in and out
  </div>
{/if}

<button in:fly={{ y: 200 }} out:fade>
  Flies in, fades out
</button>
```

## Template Syntax

### Conditionals

```svelte
<script>
  let user = { loggedIn: true, name: 'Alice' };
</script>

{#if user.loggedIn}
  <p>Welcome {user.name}!</p>
{:else}
  <p>Please log in</p>
{/if}
```

### Loops

```svelte
<script>
  let items = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
    { id: 3, name: 'Cherry' }
  ];
</script>

<ul>
  {#each items as item (item.id)}
    <li>{item.name}</li>
  {/each}
</ul>
```

### Await Blocks

```svelte
<script>
  async function getUsers() {
    const res = await fetch('/api/users');
    return res.json();
  }

  let promise = getUsers();
</script>

{#await promise}
  <p>Loading...</p>
{:then users}
  <ul>
    {#each users as user}
      <li>{user.name}</li>
    {/each}
  </ul>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

## Reactivity

### Reactive Declarations

```svelte
<script>
  let firstName = 'John';
  let lastName = 'Doe';

  // Automatically updates when firstName or lastName changes
  $: fullName = `${firstName} ${lastName}`;

  // Reactive block
  $: {
    console.log(`Full name: ${fullName}`);
    document.title = fullName;
  }

  // Multiple reactive statements
  $: greeting = `Hello, ${fullName}!`;
  $: uppercase = fullName.toUpperCase();
</script>

<input bind:value={firstName} />
<input bind:value={lastName} />
<p>{greeting}</p>
<p>{uppercase}</p>
```

### Reactive Arrays and Objects

```svelte
<script>
  let numbers = [1, 2, 3];

  function addNumber() {
    // ✓ Triggers reactivity
    numbers = [...numbers, numbers.length + 1];

    // ❌ Does NOT trigger reactivity
    // numbers.push(numbers.length + 1);
  }

  let user = { name: 'Alice', age: 25 };

  function updateAge() {
    // ✓ Triggers reactivity
    user = { ...user, age: user.age + 1 };

    // ❌ Does NOT trigger reactivity
    // user.age += 1;
  }
</script>
```

## Bindings

### Two-Way Binding

```svelte
<script>
  let name = '';
  let checked = false;
  let selected = '';
</script>

<!-- Text input -->
<input bind:value={name} />
<p>Hello {name}!</p>

<!-- Checkbox -->
<input type="checkbox" bind:checked />
<p>Checked: {checked}</p>

<!-- Select -->
<select bind:value={selected}>
  <option value="a">A</option>
  <option value="b">B</option>
</select>
<p>Selected: {selected}</p>
```

### Component Bindings

```svelte
<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  let childValue = '';
</script>

<Child bind:value={childValue} />
<p>Child value: {childValue}</p>

<!-- Child.svelte -->
<script>
  export let value = '';
</script>

<input bind:value />
```

## Props

```svelte
<!-- Card.svelte -->
<script>
  export let title;
  export let description = 'Default description'; // Optional with default
</script>

<div class="card">
  <h2>{title}</h2>
  <p>{description}</p>
</div>

<!-- Usage -->
<script>
  import Card from './Card.svelte';
</script>

<Card title="My Card" />
<Card title="Another Card" description="Custom description" />
```

## Events

### DOM Events

```svelte
<script>
  function handleClick() {
    alert('Clicked!');
  }

  function handleMouseMove(event) {
    console.log(`Mouse at ${event.clientX}, ${event.clientY}`);
  }
</script>

<button on:click={handleClick}>Click me</button>

<div on:mousemove={handleMouseMove}>
  Move mouse here
</div>

<!-- Inline -->
<button on:click={() => alert('Inline!')}>
  Click me
</button>

<!-- Event modifiers -->
<button on:click|preventDefault|stopPropagation={handleClick}>
  Click me
</button>
```

### Custom Events

```svelte
<!-- Child.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('message', {
      text: 'Hello from child'
    });
  }
</script>

<button on:click={handleClick}>
  Send message
</button>

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';

  function handleMessage(event) {
    console.log(event.detail.text);
  }
</script>

<Child on:message={handleMessage} />
```

## Stores (State Management)

Svelte has built-in state management:

```javascript
// stores.js
import { writable, readable, derived } from 'svelte/store';

// Writable store
export const count = writable(0);

// Readable store (value cannot be set from outside)
export const time = readable(new Date(), function start(set) {
  const interval = setInterval(() => {
    set(new Date());
  }, 1000);

  return function stop() {
    clearInterval(interval);
  };
});

// Derived store
export const doubled = derived(count, $count => $count * 2);
```

**Using stores:**
```svelte
<script>
  import { count, doubled } from './stores.js';

  // $ prefix auto-subscribes
  // Automatically unsubscribes when component is destroyed
</script>

<p>Count: {$count}</p>
<p>Doubled: {$doubled}</p>

<button on:click={() => $count += 1}>+</button>
<button on:click={() => count.set(0)}>Reset</button>
```

## SvelteKit (Full-Stack Framework)

SvelteKit is to Svelte what [Next.js](/content/frameworks/nextjs) is to React:

```svelte
<!-- src/routes/+page.svelte -->
<script>
  export let data;
</script>

<h1>Blog Posts</h1>
{#each data.posts as post}
  <article>
    <h2>{post.title}</h2>
    <p>{post.excerpt}</p>
  </article>
{/each}
```

```javascript
// src/routes/+page.server.js
export async function load() {
  const posts = await fetchPosts();
  return { posts };
}
```

**Features:**
- File-based routing
- Server-side rendering
- API routes
- Static site generation
- Built on Vite

## [TypeScript](/content/languages/typescript) Support

```svelte
<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
  }

  let users: User[] = [];
  let loading: boolean = true;

  async function fetchUsers(): Promise<void> {
    const response = await fetch('/api/users');
    users = await response.json();
    loading = false;
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else}
  <ul>
    {#each users as user (user.id)}
      <li>{user.name} - {user.email}</li>
    {/each}
  </ul>
{/if}
```

## Styling

### [Tailwind CSS](/content/css/tailwind)

```svelte
<button class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Click me
</button>
```

### Global Styles

```svelte
<!-- In +layout.svelte or app.html -->
<style>
  :global(body) {
    margin: 0;
    font-family: system-ui;
  }

  :global(.container) {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
```

## Svelte vs Alternatives

| Feature | Svelte | [React](/content/frameworks/react) | [Vue](/content/frameworks/vue) |
|---------|--------|-------|-----|
| **Type** | Compiler | Library | Framework |
| **Bundle Size** | ~2-7 KB | ~45-110 KB | ~40-54 KB |
| **Performance** | Excellent | Good | Good |
| **Learning Curve** | Gentle | Moderate | Gentle |
| **Syntax** | Templates | JSX | Templates |
| **Reactivity** | Built-in | Hooks | Built-in |
| **Ecosystem** | Growing | Huge | Large |

## Component Libraries

- **SvelteKit UI**: Component library for SvelteKit
- **Carbon Components Svelte**: IBM Carbon Design System
- **Svelte Material UI**: Material Design components
- **Skeleton**: UI toolkit for Svelte
- **Flowbite Svelte**: Tailwind component library

## Best Practices

### 1. Use Stores for Global State

```javascript
// ✓ Good - shared state
import { writable } from 'svelte/store';
export const user = writable(null);
```

### 2. Keep Components Small

```svelte
<!-- ✓ Good - small, focused -->
<script>
  import Header from './Header.svelte';
  import UserList from './UserList.svelte';
  import Footer from './Footer.svelte';
</script>

<Header />
<UserList />
<Footer />
```

### 3. Use Reactive Statements Wisely

```svelte
<script>
  let items = [...];

  // ✓ Good - simple derived value
  $: itemCount = items.length;

  // ❌ Bad - complex logic in reactive statement
  $: {
    items.forEach(item => {
      // Complex processing
    });
  }
</script>
```

## Learning Resources

### Official Resources
- **Svelte Tutorial**: [svelte.dev/tutorial](https://svelte.dev/tutorial)
- **Svelte Documentation**: [svelte.dev/docs](https://svelte.dev/docs)
- **SvelteKit Documentation**: [kit.svelte.dev](https://kit.svelte.dev)
- **Svelte Examples**: [svelte.dev/examples](https://svelte.dev/examples)

### Community
- **Svelte Discord**: Very active community
- **r/sveltejs**: Reddit community
- **Svelte Society**: Community-driven content
- **Svelte Radio**: Podcast

### Courses
- **Svelte Tutorial** - Official interactive tutorial (highly recommended!)
- **Svelte for Beginners** - freeCodeCamp
- **The Joy of Svelte** - Comprehensive course
- **SvelteKit Master Course** - Advanced SvelteKit

### YouTube Channels
- **Svelte Mastery**: Deep dives
- **Fireship**: Svelte in 100 seconds
- **Huntabyte**: SvelteKit tutorials
- **Web Dev Simplified**: Svelte crash course

## Key Takeaways

- **Compiler**, not a framework with runtime
- **No virtual DOM** for better performance
- **Smallest bundle sizes** of major frameworks
- **True reactivity** without hooks
- **Less code** than React or Vue
- **Built-in animations** and transitions
- **Scoped styles** by default
- **Great for performance-critical** applications

## Related Topics

- [React](/content/frameworks/react) - Compare approaches
- [Vue](/content/frameworks/vue) - Similar template syntax
- [JavaScript Frameworks](/content/frameworks/javascript-frameworks) - Framework comparison
- [TypeScript](/content/languages/typescript) - Type-safe Svelte
- [Tailwind CSS](/content/css/tailwind) - Popular styling choice
- [Astro](/content/frameworks/astro) - Can use Svelte components
- [Next.js](/content/frameworks/nextjs) - React's equivalent to SvelteKit

Svelte represents a paradigm shift in how we think about frameworks. By moving work to compile time, it achieves performance that runtime frameworks simply can't match while requiring less code and offering a better developer experience. If you're building a new project and bundle size or performance matters, Svelte should be on your radar.
