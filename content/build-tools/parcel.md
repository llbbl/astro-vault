---
title: Parcel - The Zero Configuration Bundler
tags: [parcel, bundler, zero-config]
---

# Parcel

Parcel is a zero-configuration web application bundler that "just works" out of the box. It automatically detects dependencies, transforms files, and optimizes output without any configuration needed.

## Key Features

- **Zero Config**: Works out of the box, no configuration required
- **Fast**: Multi-core processing, filesystem cache
- **Built-in Transforms**: TypeScript, JSX, CSS, images all supported
- **Hot Reloading**: Fast HMR without configuration
- **Code Splitting**: Automatic dynamic import splitting
- **Tree Shaking**: Removes unused code automatically

## Installation

```bash
pnpm add -D parcel
```

## Basic Usage

### HTML Entry Point
```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./index.tsx"></script>
  </body>
</html>
```

### package.json Scripts
```json
{
  "scripts": {
    "dev": "parcel index.html",
    "build": "parcel build index.html"
  }
}
```

### Start Development
```bash
pnpm dev
```

That's it! No configuration needed.

## Automatic Transforms

### TypeScript
Just use `.ts` or `.tsx` files:
```typescript
// app.ts - automatically compiled
const greeting: string = 'Hello, Parcel!';
console.log(greeting);
```

### React/JSX
Just use `.jsx` or `.tsx` files:
```jsx
// App.jsx - automatically transformed
export default function App() {
  return <h1>Hello, Parcel!</h1>;
}
```

### CSS/SCSS
Just import CSS or SCSS:
```css
/* styles.scss - automatically compiled */
$primary: #3b82f6;

.button {
  background: $primary;
}
```

```javascript
// Automatically processed
import './styles.scss';
```

### Images
Just import images:
```javascript
import logo from './logo.png';

// Parcel automatically:
// - Optimizes the image
// - Generates the URL
// - Includes it in the bundle
```

## Code Splitting

### Dynamic Imports
```javascript
// Automatic code splitting
const Dashboard = lazy(() => import('./Dashboard'));

// Parcel automatically:
// - Creates separate bundle
// - Adds preload hints
// - Handles dependencies
```

## Production Build

```bash
# Build optimized bundles
pnpm build

# Output to custom directory
parcel build index.html --dist-dir build

# Disable source maps
parcel build index.html --no-source-maps
```

## Configuration (Optional)

### .parcelrc
Only needed for advanced customization:

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.svg": ["@parcel/transformer-svg-react"]
  }
}
```

### package.json
```json
{
  "source": "src/index.html",
  "browserslist": "> 0.5%, last 2 versions, not dead"
}
```

## Environment Variables

### .env File
```bash
# .env
API_URL=https://api.example.com
APP_NAME=My App
```

### Access in Code
```javascript
// Automatically available
const apiUrl = process.env.API_URL;
const appName = process.env.APP_NAME;
```

## Caching

Parcel uses aggressive caching:

```bash
# Clear cache if needed
rm -rf .parcel-cache
```

## Multi-Page Apps

```json
{
  "scripts": {
    "dev": "parcel src/*.html",
    "build": "parcel build src/*.html"
  }
}
```

## Library Mode

```json
{
  "source": "src/index.ts",
  "main": "dist/main.js",
  "module": "dist/module.js",
  "targets": {
    "main": {
      "includeNodeModules": true
    },
    "module": {
      "includeNodeModules": false
    }
  }
}
```

## Performance

### Build Speed
| Project Size | Build Time |
|--------------|------------|
| Small | ~1s |
| Medium | ~5s |
| Large | ~15s |

### Features
- Multi-core compilation
- Persistent filesystem cache
- Lazy compilation in dev mode

## Comparison

| Feature | Parcel | Vite | Webpack |
|---------|--------|------|---------|
| Config | Zero | Minimal | Required |
| Speed | Fast | Fastest | Slow |
| HMR | Yes | Yes | Yes |
| Learning Curve | Easy | Easy | Hard |

## Use Cases

### Quick Prototypes
Perfect for getting started fast:
```bash
# Initialize and start
pnpm init
pnpm add -D parcel
echo '<script src="./index.ts"></script>' > index.html
pnpm parcel index.html
```

### Small Projects
Ideal for projects that don't need complex build configuration:
- Landing pages
- Simple web apps
- Demos and examples

### Learning
Great for beginners learning web development:
- No configuration barrier
- Focus on code, not tooling
- Modern features out of the box

## Limitations

- Less flexible than Webpack
- Smaller plugin ecosystem
- Some advanced features require configuration
- Not optimized for very large projects

## Migration

### From Webpack
1. Remove webpack.config.js
2. Install Parcel
3. Update scripts in package.json
4. Run `pnpm dev`

Most projects "just work" without changes.

### From Create React App
```bash
# Remove CRA
pnpm remove react-scripts

# Install Parcel
pnpm add -D parcel

# Update package.json
{
  "scripts": {
    "dev": "parcel public/index.html",
    "build": "parcel build public/index.html"
  }
}
```

## Resources

- **Docs**: [parceljs.org](https://parceljs.org/)
- **GitHub**: [parcel-bundler/parcel](https://github.com/parcel-bundler/parcel)
- **Plugins**: [parceljs.org/plugins](https://parceljs.org/plugins/)
