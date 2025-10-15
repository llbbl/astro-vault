---
title: React
tags: [react, javascript, typescript, frontend, frameworks, ui, components, hooks]
---

# React

React is a JavaScript library for building user interfaces, created by Facebook (now Meta) in 2013. It has become the most popular choice for building modern web applications and is widely adopted across the industry. React's component-based architecture and declarative programming model have influenced the entire frontend ecosystem.

## What is React?

React is a **library** (not a full framework) focused on building UI components. Its core philosophy is simple: break your UI into reusable components that manage their own state and compose them to build complex interfaces.

```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}

function App() {
  return (
    <div>
      <Welcome name="Alice" />
      <Welcome name="Bob" />
    </div>
  );
}
```

## Why React?

### Component-Based Architecture

React encourages building applications as a tree of components. Each component is a self-contained piece of UI with its own logic and styling:

```jsx
function UserCard({ user }) {
  return (
    <div className="card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
}
```

### Declarative UI

Instead of imperatively manipulating the DOM, you describe what the UI should look like for any given state:

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.completed ? '✓' : '○'} {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

### Virtual DOM

React uses a virtual representation of the DOM to efficiently update only what changed:

1. State changes in your component
2. React creates a new virtual DOM tree
3. React compares (diffs) with previous virtual DOM
4. React updates only the changed parts in the real DOM

This makes React fast without requiring manual DOM optimization.

### Huge Ecosystem

React's popularity has created a massive ecosystem:

- **UI Libraries**: Material-UI, Chakra UI, Ant Design, shadcn/ui
- **State Management**: Redux, Zustand, Jotai, MobX
- **Routing**: React Router, TanStack Router
- **Forms**: React Hook Form, Formik
- **Data Fetching**: TanStack Query, SWR, Apollo Client
- **Testing**: React Testing Library, Jest
- **Styling**: [Tailwind CSS](/content/css/tailwind), [styled-components](/content/css/styled-components), CSS Modules, Emotion

## Core Concepts

### JSX

JSX is a syntax extension that lets you write HTML-like code in JavaScript:

```jsx
const element = (
  <div className="container">
    <h1>Welcome to React</h1>
    <p>This is JSX - it looks like HTML but it's JavaScript!</p>
  </div>
);
```

Under the hood, JSX compiles to JavaScript function calls:

```javascript
const element = React.createElement(
  'div',
  { className: 'container' },
  React.createElement('h1', null, 'Welcome to React'),
  React.createElement('p', null, 'This is JSX - it looks like HTML but it\'s JavaScript!')
);
```

### Components

Two types of components:

**Function Components** (modern standard):
```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

**Class Components** (legacy, still supported):
```jsx
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}
```

### Props

Props (properties) let you pass data from parent to child components:

```jsx
function Article({ title, author, content }) {
  return (
    <article>
      <h1>{title}</h1>
      <p className="author">By {author}</p>
      <div>{content}</div>
    </article>
  );
}

// Usage
<Article
  title="Learning React"
  author="Alice"
  content="React is awesome!"
/>
```

### State

State is data that changes over time within a component:

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### Hooks

Hooks let you use state and other React features in function components:

**useState** - Manage local state:
```jsx
const [count, setCount] = useState(0);
```

**useEffect** - Side effects (data fetching, subscriptions):
```jsx
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);  // Re-run when count changes
```

**useContext** - Access context values:
```jsx
const theme = useContext(ThemeContext);
```

**useMemo** - Memoize expensive computations:
```jsx
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.value - b.value);
}, [items]);
```

**useCallback** - Memoize callback functions:
```jsx
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);
```

**Custom Hooks** - Reuse stateful logic:
```jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

## React with TypeScript

React has excellent [TypeScript](/content/languages/typescript) support. Typing your components prevents bugs and improves developer experience:

```typescript
interface UserProps {
  name: string;
  age: number;
  email?: string;  // Optional
}

function User({ name, age, email }: UserProps) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
      {email && <p>Email: {email}</p>}
    </div>
  );
}

// Typed state
const [users, setUsers] = useState<UserProps[]>([]);

// Typed events
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  console.log('Clicked!', event.currentTarget);
}
```

## React Patterns

### Composition

Build complex UIs from simple components:

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}

function CardHeader({ children }) {
  return <div className="card-header">{children}</div>;
}

function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
}

// Usage
<Card>
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardBody>
    <p>Content goes here</p>
  </CardBody>
</Card>
```

### Render Props

Pass a function as a prop to share code:

```jsx
function Mouse({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      {render(position)}
    </div>
  );
}

// Usage
<Mouse render={({ x, y }) => (
  <p>Mouse at ({x}, {y})</p>
)} />
```

### Higher-Order Components (HOC)

A function that takes a component and returns a new component:

```jsx
function withLoading(Component) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) return <p>Loading...</p>;
    return <Component {...props} />;
  };
}

const UserListWithLoading = withLoading(UserList);
```

## React Frameworks & Meta-Frameworks

While React is a library, several frameworks build on top of it to provide full application features:

### Next.js (Most Popular)

Full-stack React framework with server-side rendering, static generation, and API routes:

```jsx
// pages/index.js
export default function Home({ posts }) {
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  );
}

// Server-side data fetching
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  return { props: { posts } };
}
```

### Remix

Modern full-stack framework focused on web fundamentals and progressive enhancement.

### Gatsby

Static site generator for React, great for content-heavy sites and blogs.

### Expo

Framework for building React Native mobile apps with a fantastic developer experience.

## Styling React Components

React is unopinionated about styling. Popular approaches:

### CSS Modules

```jsx
import styles from './Button.module.css';

function Button({ children }) {
  return <button className={styles.button}>{children}</button>;
}
```

### [Tailwind CSS](/content/css/tailwind)

Utility-first CSS framework:

```jsx
function Button({ children }) {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      {children}
    </button>
  );
}
```

### [styled-components](/content/css/styled-components)

CSS-in-JS with tagged template literals:

```jsx
import styled from 'styled-components';

const Button = styled.button`
  background: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;

  &:hover {
    background: darkblue;
  }
`;
```

## State Management

### Built-in: Context + useReducer

```jsx
const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return [...state, action.item];
    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.id);
    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}
```

### External Libraries

- **Redux**: Predictable state container (older, still widely used)
- **Zustand**: Simple, minimal state management
- **Jotai**: Atomic state management
- **MobX**: Reactive state management
- **TanStack Query**: Server state management (caching, sync)

## Performance Optimization

### React.memo

Prevent unnecessary re-renders:

```jsx
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // Only re-renders if `data` changes
  return <div>{/* expensive rendering */}</div>;
});
```

### useMemo & useCallback

Memoize values and functions:

```jsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### Code Splitting

Load components only when needed:

```jsx
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Testing React Components

### React Testing Library

Focus on testing user behavior, not implementation details:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('increments counter', () => {
  render(<Counter />);

  const button = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(button);

  expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
});
```

## React vs Other Frameworks

See the [JavaScript Frameworks](/content/frameworks/javascript-frameworks) article for a detailed comparison, but here's a quick overview:

| Framework | Learning Curve | Performance | Size | Ecosystem | Best For |
|-----------|----------------|-------------|------|-----------|----------|
| React | Moderate | Good | Medium | Huge | Large apps, teams |
| Vue | Gentle | Good | Small | Large | Gradual adoption |
| Svelte | Gentle | Excellent | Very Small | Growing | Performance-critical |
| Angular | Steep | Good | Large | Large | Enterprise apps |
| Solid | Moderate | Excellent | Small | Small | Performance-first |

## When to Use React

**Choose React when:**
- Building a complex, interactive web application
- You need a huge ecosystem of libraries and tools
- Team experience matters (React has the most developers)
- Using [TypeScript](/content/languages/typescript) for type safety
- You want flexibility in architecture choices
- SEO matters (use Next.js)
- Building a mobile app (React Native)

**Consider alternatives when:**
- Building a simple website (consider vanilla JS or a lighter framework)
- You want a true all-in-one framework (consider Angular)
- Performance is critical and bundle size matters (consider Svelte)
- You prefer opinionated structure (consider Angular or SvelteKit)

## Learning Path

### 1. Fundamentals

- JavaScript/[TypeScript](/content/languages/typescript) basics
- ES6+ features (arrow functions, destructuring, spread operator)
- Array methods (map, filter, reduce)

### 2. Core React

- JSX syntax
- Components and props
- State with useState
- Effects with useEffect
- Lists and keys
- Forms and controlled components

### 3. Advanced Concepts

- Context API
- Custom hooks
- Performance optimization
- Error boundaries
- Suspense and lazy loading

### 4. Ecosystem

- React Router for routing
- TanStack Query for data fetching
- Styling solution ([Tailwind](/content/css/tailwind), [styled-components](/content/css/styled-components))
- Form library (React Hook Form)
- Testing (React Testing Library)

### 5. Build a Framework

Learn a meta-framework like Next.js or Remix for production apps.

## Resources

- **Official Docs**: [react.dev](https://react.dev) - Recently updated, excellent
- **React Beta Docs**: New interactive tutorials
- **freeCodeCamp**: Free React course
- **Epic React**: Kent C. Dodds' comprehensive course (paid)
- **JavaScript Mastery**: YouTube tutorials
- **React Patterns**: reactpatterns.com

## The Future of React

React continues to evolve with new features:

### React Server Components

Server-side rendering of components without client-side JavaScript:

```jsx
// This runs on the server only
async function UserList() {
  const users = await db.users.findMany();
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### Concurrent Rendering

Better handling of expensive renders and async operations with features like:
- `useTransition` - Mark updates as non-urgent
- `useDeferredValue` - Defer updating non-critical UI
- `<Suspense>` - Declarative loading states

### Improved Dev Tools

Better debugging, profiling, and development experience.

## Key Takeaways

- React is a library for building component-based UIs
- Declarative programming model makes code predictable
- Huge ecosystem with solutions for every need
- Excellent [TypeScript](/content/languages/typescript) support
- Powers some of the world's largest applications (Facebook, Instagram, Netflix, Airbnb)
- Strong community and abundant learning resources
- Can be used for web (React), mobile (React Native), and even VR (React 360)

## Related Topics

- [JavaScript Frameworks](/content/frameworks/javascript-frameworks) - Compare React with Vue, Svelte, and others
- [TypeScript](/content/languages/typescript) - Add type safety to React
- [Tailwind CSS](/content/css/tailwind) - Popular styling solution for React
- [styled-components](/content/css/styled-components) - CSS-in-JS for React
- [CSS Frameworks History](/content/css/css-frameworks-history) - Evolution of styling approaches

React's combination of simplicity, performance, and flexibility has made it the go-to choice for modern web development. While it has a learning curve, the investment pays off with a powerful toolkit for building any kind of user interface.
