---
title: styled-components
tags: [styled-components, css-in-js, react, styling, frontend, javascript, typescript]
---

# styled-components

styled-components is a CSS-in-JS library that allows you to write actual CSS code to style your components. Created by Max Stoiber and Glen Maddern in 2016, it revolutionized how developers style [React](/content/frameworks/react) applications by bringing CSS into JavaScript, enabling dynamic styling, automatic scoping, and better developer experience.

## What is styled-components?

styled-components uses **tagged template literals** to style components:

```jsx
import styled from 'styled-components';

const Button = styled.button`
  background: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;

  &:hover {
    background: darkblue;
  }
`;

// Use it like a React component
function App() {
  return <Button>Click me</Button>;
}
```

The CSS is **automatically scoped** to the component, preventing naming conflicts and global style pollution.

## Why styled-components?

### 1. Automatic Critical CSS

Only the CSS for rendered components is included:

```jsx
const Button = styled.button`...`;
const Card = styled.div`...`;

// If you only render Button, only Button's CSS is included
function App() {
  return <Button>Click</Button>;
  // Card's CSS is not shipped to the browser
}
```

### 2. Dynamic Styling with Props

Style components based on props using JavaScript:

```jsx
const Button = styled.button`
  background: ${props => props.primary ? 'blue' : 'gray'};
  color: white;
  padding: ${props => props.large ? '15px 30px' : '10px 20px'};

  &:hover {
    background: ${props => props.primary ? 'darkblue' : 'darkgray'};
  }
`;

// Usage
<Button primary>Primary</Button>
<Button large>Large</Button>
<Button primary large>Primary Large</Button>
```

### 3. No Class Name Conflicts

Each component gets unique, auto-generated class names:

```jsx
const Title = styled.h1`
  color: red;
`;

// Renders as: <h1 class="sc-dkPtyc hYKbxQ">Hello</h1>
// "hYKbxQ" is auto-generated and unique
```

### 4. Better Developer Experience

Write real CSS with full feature support:

```jsx
const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  /* Nesting */
  & .title {
    font-size: 24px;
    font-weight: bold;
  }

  /* Pseudo-elements */
  &::before {
    content: '→';
    margin-right: 10px;
  }

  /* Media queries */
  @media (max-width: 768px) {
    padding: 10px;
  }
`;
```

### 5. Theming Support

Built-in theme support with Context API:

```jsx
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    primary: '#0066cc',
    secondary: '#6c757d',
    text: '#333',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <YourApp />
    </ThemeProvider>
  );
}

// Access theme in components
const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.medium};
`;
```

## Installation

```bash
npm install styled-components

# With TypeScript
npm install --save-dev @types/styled-components
```

## Basic Usage

### Simple Component

```jsx
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 32px;
  margin-bottom: 20px;
`;

function App() {
  return (
    <Container>
      <Title>Welcome</Title>
    </Container>
  );
}
```

### Extending Styles

Build new components from existing ones:

```jsx
const Button = styled.button`
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
`;

const PrimaryButton = styled(Button)`
  background: blue;
  color: white;

  &:hover {
    background: darkblue;
  }
`;

const SecondaryButton = styled(Button)`
  background: gray;
  color: white;

  &:hover {
    background: darkgray;
  }
`;
```

### Adapting Based on Props

```jsx
const Button = styled.button`
  background: ${props => {
    switch(props.variant) {
      case 'primary': return 'blue';
      case 'secondary': return 'gray';
      case 'danger': return 'red';
      default: return 'lightgray';
    }
  }};
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;

// Usage
<Button variant="primary">Save</Button>
<Button variant="danger">Delete</Button>
<Button disabled>Disabled</Button>
```

### Passing Props to DOM

Use transient props (prefixed with `$`) to avoid passing to DOM:

```jsx
// ❌ Warning: 'primary' is passed to DOM
const Button = styled.button`
  background: ${props => props.primary ? 'blue' : 'gray'};
`;

<Button primary>Click</Button>
// Renders: <button primary="true"> (invalid HTML attribute)

// ✓ Transient props (not passed to DOM)
const Button = styled.button`
  background: ${props => props.$primary ? 'blue' : 'gray'};
`;

<Button $primary>Click</Button>
// Renders: <button> (no invalid attribute)
```

## Advanced Patterns

### Styling Any Component

Style third-party or custom components:

```jsx
// Custom React component
function MyComponent({ className, children }) {
  return <div className={className}>{children}</div>;
}

// Style it
const StyledMyComponent = styled(MyComponent)`
  background: blue;
  color: white;
  padding: 20px;
`;
```

### Attaching Additional Props

```jsx
const Input = styled.input.attrs(props => ({
  type: props.type || 'text',
  size: props.size || '1em',
}))`
  border: 1px solid #ccc;
  padding: 0.5em;
  font-size: ${props => props.size};
`;

// Usage
<Input />                    // type="text"
<Input type="password" />    // type="password"
<Input size="1.5em" />       // Larger input
```

### Global Styles

```jsx
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <YourApp />
    </>
  );
}
```

### CSS Helper for Reusable Snippets

```jsx
import styled, { css } from 'styled-components';

const sharedStyles = css`
  padding: 10px;
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const Button = styled.button`
  ${sharedStyles}
  background: blue;
`;

const Card = styled.div`
  ${sharedStyles}
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;
```

### Animations

```jsx
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AnimatedDiv = styled.div`
  animation: ${fadeIn} 0.5s ease-in;
`;
```

## TypeScript Support

styled-components has excellent [TypeScript](/content/languages/typescript) support:

### Basic Typing

```typescript
import styled from 'styled-components';

interface ButtonProps {
  $primary?: boolean;
  $large?: boolean;
}

const Button = styled.button<ButtonProps>`
  background: ${props => props.$primary ? 'blue' : 'gray'};
  padding: ${props => props.$large ? '15px 30px' : '10px 20px'};
  color: white;
  border: none;
  border-radius: 4px;
`;

// Usage with type checking
<Button $primary $large>Click me</Button>
```

### Typed Theme

```typescript
// Define theme type
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
}

// Declare module to extend DefaultTheme
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

// Create theme
const theme: Theme = {
  colors: {
    primary: '#0066cc',
    secondary: '#6c757d',
    text: '#333',
    background: '#fff',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
};

// Now TypeScript knows your theme structure
const Button = styled.button`
  background: ${props => props.theme.colors.primary}; // Autocomplete!
  padding: ${props => props.theme.spacing.medium};
`;
```

## Theming

### Basic Theme

```jsx
import { ThemeProvider } from 'styled-components';

const lightTheme = {
  background: '#fff',
  text: '#000',
  primary: '#0066cc',
};

const darkTheme = {
  background: '#1a1a1a',
  text: '#fff',
  primary: '#3399ff',
};

function App() {
  const [theme, setTheme] = useState(lightTheme);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <button onClick={() => setTheme(theme === lightTheme ? darkTheme : lightTheme)}>
        Toggle Theme
      </button>
      <YourApp />
    </ThemeProvider>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    background: ${props => props.theme.background};
    color: ${props => props.theme.text};
  }
`;
```

### Accessing Theme

```jsx
const Card = styled.div`
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.primary};
`;

// Or use the useTheme hook
import { useTheme } from 'styled-components';

function MyComponent() {
  const theme = useTheme();

  return (
    <div style={{ color: theme.primary }}>
      Themed text
    </div>
  );
}
```

## Performance Considerations

### Runtime Overhead

styled-components parses CSS at runtime:

```jsx
// This happens at runtime in the browser
const Button = styled.button`
  background: blue;
`;
```

**Impact:**
- Slower than pre-compiled CSS
- Increases bundle size (~16KB gzipped)
- Serialization overhead

### Optimization Tips

**1. Use transient props:**
```jsx
// ✓ Good - doesn't re-parse styles
const Button = styled.button`
  background: ${props => props.$variant === 'primary' ? 'blue' : 'gray'};
`;

// ❌ Bad - re-parses on every variant change
const Button = styled.button`
  background: ${props => calculateComplexColor(props)};
`;
```

**2. Memoize expensive calculations:**
```jsx
const expensiveStyle = useMemo(() => {
  return calculateStyles(complexData);
}, [complexData]);

const Component = styled.div`
  ${expensiveStyle}
`;
```

**3. Use `css` helper for shared styles:**
```jsx
import styled, { css } from 'styled-components';

const sharedButtonStyles = css`
  padding: 10px;
  border-radius: 4px;
`;

const PrimaryButton = styled.button`
  ${sharedButtonStyles}
  background: blue;
`;
```

## styled-components vs Alternatives

See [CSS Frameworks History](/content/css/css-frameworks-history) for context.

| Approach | Bundle Size | Performance | DX | Type Safety | Runtime |
|----------|-------------|-------------|-----|-------------|---------|
| **styled-components** | ~16KB | Moderate | Excellent | Good | Yes |
| **Emotion** | ~11KB | Moderate | Excellent | Good | Yes |
| **[Tailwind](/content/css/tailwind)** | 3-10KB | Excellent | Good | N/A | No |
| **CSS Modules** | ~0KB | Excellent | Good | Limited | No |
| **vanilla-extract** | ~5KB | Excellent | Good | Excellent | No |

### When to Use styled-components

**Choose styled-components if:**
- Building component libraries
- Need dynamic theming
- Want full CSS features in JS
- Team prefers CSS-in-JS
- Using [React](/content/frameworks/react) (not framework-agnostic)

**Consider alternatives if:**
- Performance is critical ([Tailwind](/content/css/tailwind))
- Want zero runtime (vanilla-extract, Linaria)
- Need smaller bundle size (Emotion, [Tailwind](/content/css/tailwind))
- Building static sites (CSS Modules)

## Real-World Example

```jsx
import styled, { ThemeProvider } from 'styled-components';

// Theme
const theme = {
  colors: {
    primary: '#0066cc',
    secondary: '#6c757d',
    danger: '#dc3545',
    text: '#333',
    background: '#f8f9fa',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: '8px',
};

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const Card = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: 24px;
`;

const Button = styled.button`
  background: ${props => {
    if (props.$danger) return props.theme.colors.danger;
    if (props.$secondary) return props.theme.colors.secondary;
    return props.theme.colors.primary;
  }};
  color: white;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Component
function UserCard({ user }) {
  return (
    <Card>
      <Title>{user.name}</Title>
      <p>{user.email}</p>
      <div style={{ marginTop: '16px' }}>
        <Button>Edit</Button>
        <Button $secondary style={{ marginLeft: '8px' }}>
          View
        </Button>
        <Button $danger style={{ marginLeft: '8px' }}>
          Delete
        </Button>
      </div>
    </Card>
  );
}

// App
function App() {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <h1>Users</h1>
        {users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </Container>
    </ThemeProvider>
  );
}
```

## Migrating Away from styled-components

If performance is critical, consider migrating:

### To Tailwind

```jsx
// Before: styled-components
const Button = styled.button`
  background: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;

  &:hover {
    background: darkblue;
  }
`;

// After: Tailwind
function Button({ children }) {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white px-5 py-2 rounded">
      {children}
    </button>
  );
}
```

### To CSS Modules

```jsx
// Before: styled-components
const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
`;

// After: CSS Modules
import styles from './Card.module.css';

function Card({ children }) {
  return <div className={styles.card}>{children}</div>;
}
```

```css
/* Card.module.css */
.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
```

## Popular Alternatives

### Emotion

Very similar to styled-components, slightly smaller:

```jsx
import styled from '@emotion/styled';

const Button = styled.button`
  background: blue;
  color: white;
`;
```

### Linaria (Zero-Runtime)

CSS-in-JS that extracts to CSS at build time:

```jsx
import { styled } from '@linaria/react';

const Button = styled.button`
  background: blue;
  color: white;
`;
```

**Benefits:**
- No runtime overhead
- Smaller bundle size
- Better performance

## Key Takeaways

- **CSS-in-JS** brings styling into JavaScript
- **Automatic scoping** prevents naming conflicts
- **Dynamic styling** with props and theme
- **Full CSS features** (nesting, pseudo-classes, media queries)
- **Great DX** with syntax highlighting and autocomplete
- **Runtime overhead** compared to pre-compiled approaches
- **Still popular** for component libraries and complex theming
- **Being superseded** by [Tailwind](/content/css/tailwind) and zero-runtime alternatives

## Related Topics

- [React](/content/frameworks/react) - styled-components is primarily for React
- [CSS Frameworks History](/content/css/css-frameworks-history) - Evolution of styling approaches
- [Tailwind CSS](/content/css/tailwind) - Modern utility-first alternative
- [TypeScript](/content/languages/typescript) - Type-safe styled-components
- [JavaScript Frameworks](/content/frameworks/javascript-frameworks) - Frameworks that use CSS-in-JS

styled-components revolutionized React styling and remains a solid choice for component libraries and applications requiring dynamic theming. However, newer approaches like [Tailwind CSS](/content/css/tailwind) and zero-runtime CSS-in-JS libraries are gaining popularity due to better performance. Choose based on your project's specific needs: styled-components excels at dynamic theming and component libraries, while Tailwind offers superior performance and smaller bundles for most applications.
