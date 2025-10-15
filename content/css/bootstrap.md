---
title: Bootstrap & Legacy CSS Frameworks
tags: [bootstrap, css, frameworks, legacy, foundation, bulma, semantic-ui, frontend]
---

# Bootstrap & Legacy CSS Frameworks

Before [Tailwind CSS](/content/css/tailwind) and utility-first frameworks dominated, component-based CSS frameworks like Bootstrap ruled the web. Created by Twitter in 2011, Bootstrap and its contemporaries provided pre-designed components and grid systems that revolutionized web development. While considered "legacy" by modern standards, these frameworks are still widely used and understanding them is valuable for maintaining existing projects and rapid prototyping.

## Bootstrap

**Created**: 2011 by Mark Otto and Jacob Thornton (Twitter)
**Current Version**: Bootstrap 5 (as of 2024)
**Philosophy**: Mobile-first, component-based CSS framework

### What is Bootstrap?

Bootstrap provides pre-designed components and a responsive grid system:

```html
<!DOCTYPE html>
<html>
<head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container">
    <div class="row">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Card Title</h5>
            <p class="card-text">Some quick example text.</p>
            <a href="#" class="btn btn-primary">Go somewhere</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

### The Grid System

Bootstrap's 12-column grid was revolutionary:

```html
<div class="container">
  <!-- Stack on mobile, 3 columns on desktop -->
  <div class="row">
    <div class="col-12 col-md-4">Column 1</div>
    <div class="col-12 col-md-4">Column 2</div>
    <div class="col-12 col-md-4">Column 3</div>
  </div>

  <!-- 2 columns, different widths -->
  <div class="row">
    <div class="col-8">Main content</div>
    <div class="col-4">Sidebar</div>
  </div>
</div>
```

**Breakpoints:**
- `xs` - Extra small (< 576px)
- `sm` - Small (≥ 576px)
- `md` - Medium (≥ 768px)
- `lg` - Large (≥ 992px)
- `xl` - Extra large (≥ 1200px)
- `xxl` - Extra extra large (≥ 1400px, Bootstrap 5)

### Common Components

**Buttons:**
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-info">Info</button>

<!-- Button sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Regular</button>
<button class="btn btn-primary btn-lg">Large</button>
```

**Navigation:**
```html
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Logo</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link active" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Features</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

**Cards:**
```html
<div class="card" style="width: 18rem;">
  <img src="..." class="card-img-top" alt="...">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <p class="card-text">Some quick example text to build on the card title.</p>
    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>
```

**Forms:**
```html
<form>
  <div class="mb-3">
    <label for="email" class="form-label">Email address</label>
    <input type="email" class="form-control" id="email">
  </div>
  <div class="mb-3">
    <label for="password" class="form-label">Password</label>
    <input type="password" class="form-control" id="password">
  </div>
  <div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="check">
    <label class="form-check-label" for="check">Remember me</label>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

**Modals:**
```html
<!-- Button trigger -->
<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
  Launch modal
</button>

<!-- Modal -->
<div class="modal fade" id="exampleModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Modal title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <p>Modal body text goes here.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>
```

### Utility Classes

Bootstrap 5 added utility classes (similar to [Tailwind](/content/css/tailwind)):

```html
<!-- Spacing -->
<div class="p-3">Padding 3</div>
<div class="mt-4">Margin top 4</div>
<div class="mb-2">Margin bottom 2</div>

<!-- Display -->
<div class="d-flex justify-content-center align-items-center">
  Centered content
</div>

<!-- Text -->
<p class="text-center text-primary fw-bold">
  Centered, blue, bold text
</p>

<!-- Colors -->
<div class="bg-primary text-white">Blue background</div>
<div class="bg-success text-white">Green background</div>
```

### Customization

**Using Sass:**
```scss
// custom.scss
@import "bootstrap/functions";
@import "bootstrap/variables";

// Override variables
$primary: #0066cc;
$secondary: #6c757d;

@import "bootstrap";
```

**Custom builds:**
```bash
npm install bootstrap sass

# Import only what you need
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/grid";
@import "bootstrap/scss/utilities";
```

### Bootstrap with React

```bash
npm install react-bootstrap bootstrap
```

```jsx
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Card style={{ width: '18rem' }}>
      <Card.Img variant="top" src="..." />
      <Card.Body>
        <Card.Title>Card Title</Card.Title>
        <Card.Text>
          Some quick example text.
        </Card.Text>
        <Button variant="primary">Go somewhere</Button>
      </Card.Body>
    </Card>
  );
}
```

### Why Bootstrap Was Popular

**2011-2019:**
1. **No alternatives**: Few CSS frameworks existed
2. **Responsive grid**: Revolutionary at the time
3. **Pre-designed components**: Saved development time
4. **Cross-browser compatibility**: Handled IE quirks
5. **Great documentation**: Easy to learn
6. **Large community**: Many themes and templates

### Why Bootstrap Declined

**2020+:**
1. **All sites look the same**: "Bootstrap-ish" became recognizable
2. **Heavy bundle size**: ~150-300KB unminified
3. **Hard to customize**: Overriding styles is tedious
4. **Utility-first won**: [Tailwind](/content/css/tailwind) offers more flexibility
5. **Modern CSS**: Flexbox and Grid make frameworks less necessary
6. **Component libraries**: Framework-specific alternatives emerged

### When to Still Use Bootstrap

**Good for:**
- Rapid prototyping
- Internal tools/admin panels
- Projects with tight deadlines
- Teams familiar with Bootstrap
- When you need pre-built components

**Not good for:**
- Custom designs
- Performance-critical apps
- Modern [React](/content/frameworks/react)/[Vue](/content/frameworks/vue) apps
- When bundle size matters

## Foundation

**Created**: 2011 by ZURB
**Philosophy**: Mobile-first, semantic, professional

Foundation was Bootstrap's main competitor:

```html
<div class="grid-container">
  <div class="grid-x grid-margin-x">
    <div class="cell small-12 medium-6 large-4">
      <div class="card">
        <div class="card-section">
          <h4>Card Title</h4>
          <p>Content goes here.</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Advantages over Bootstrap:**
- More semantic HTML
- Better for custom designs
- More flexible grid
- Better accessibility

**Why it didn't win:**
- Smaller community
- Fewer resources/themes
- More complex to learn

## Bulma

**Created**: 2016 by Jeremy Thomas
**Philosophy**: Modern, Flexbox-based, no JavaScript

```html
<div class="columns">
  <div class="column">
    <div class="card">
      <div class="card-content">
        <p class="title">Card title</p>
        <p class="subtitle">Card subtitle</p>
      </div>
      <footer class="card-footer">
        <a href="#" class="card-footer-item">Save</a>
        <a href="#" class="card-footer-item">Edit</a>
      </footer>
    </div>
  </div>
</div>
```

**Strengths:**
- Modern (Flexbox-based)
- No JavaScript required
- Clean class names
- Easy to learn

**Weaknesses:**
- Smaller ecosystem than Bootstrap
- Less IE support (by design)
- Fewer components

## Semantic UI

**Created**: 2014
**Philosophy**: Human-friendly HTML

```html
<div class="ui container">
  <div class="ui cards">
    <div class="card">
      <div class="content">
        <div class="header">Card Title</div>
        <div class="meta">Card meta</div>
        <div class="description">
          Card description
        </div>
      </div>
      <div class="extra content">
        <div class="ui two buttons">
          <div class="ui basic green button">Approve</div>
          <div class="ui basic red button">Reject</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Strengths:**
- Very readable HTML
- Rich component library
- Theming support

**Weaknesses:**
- Development slowed
- Larger bundle size
- jQuery dependency (older versions)

## Materialize

**Created**: 2014
**Philosophy**: Material Design implementation

```html
<div class="row">
  <div class="col s12 m6">
    <div class="card blue-grey darken-1">
      <div class="card-content white-text">
        <span class="card-title">Card Title</span>
        <p>I am a very simple card.</p>
      </div>
      <div class="card-action">
        <a href="#">Link</a>
        <a href="#">Link</a>
      </div>
    </div>
  </div>
</div>
```

**Strengths:**
- Material Design out of the box
- Rich components
- Animations included

**Weaknesses:**
- Development stalled
- jQuery dependency
- Large bundle

## Migration Strategies

### From Bootstrap to Tailwind

**Bootstrap:**
```html
<div class="container">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Title</h5>
      <p class="card-text">Text</p>
      <a href="#" class="btn btn-primary">Button</a>
    </div>
  </div>
</div>
```

**Tailwind:**
```html
<div class="max-w-7xl mx-auto px-4">
  <div class="bg-white rounded-lg shadow-md p-6">
    <h5 class="text-xl font-bold mb-2">Title</h5>
    <p class="text-gray-700 mb-4">Text</p>
    <a href="#" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
      Button
    </a>
  </div>
</div>
```

### Gradual Migration

1. **Add Tailwind** alongside Bootstrap
2. **Convert new components** to Tailwind
3. **Refactor old components** over time
4. **Remove Bootstrap** when done

## Comparison Table

| Framework | Released | Philosophy | Bundle Size | Active | Best For |
|-----------|----------|------------|-------------|--------|----------|
| **Bootstrap** | 2011 | Components | ~150KB | Yes | Prototyping |
| **Foundation** | 2011 | Professional | ~120KB | Limited | Custom design |
| **Bulma** | 2016 | Modern Flexbox | ~180KB | Yes | No-JS sites |
| **Semantic UI** | 2014 | Readable | ~280KB | Limited | Semantic HTML |
| **Materialize** | 2014 | Material Design | ~200KB | No | Material Design |
| **[Tailwind](/content/css/tailwind)** | 2017 | Utility-first | ~3-10KB | Yes | Everything |

## Key Takeaways

- **Bootstrap** dominated 2011-2019
- **Component frameworks** great for rapid prototyping
- **Heavy bundle sizes** compared to modern approaches
- **Still useful** for admin panels and quick projects
- **[Tailwind](/content/css/tailwind)** replaced them for most new projects
- **Migration is gradual** - can coexist with modern tools

## When to Use Legacy Frameworks

**Use Bootstrap if:**
- Rapid prototyping needed
- Building internal tools
- Team already knows it
- Don't need custom design

**Use [Tailwind](/content/css/tailwind) instead if:**
- Building custom design
- Performance matters
- Starting new project
- Want modern approach

## Learning Resources

### Bootstrap
- **Official Docs**: [getbootstrap.com](https://getbootstrap.com)
- **Bootstrap Examples**: Official example templates
- **Start Bootstrap**: Free themes

### Foundation
- **Official Docs**: [get.foundation](https://get.foundation)
- **Foundation Forum**: Community support

### Bulma
- **Official Docs**: [bulma.io](https://bulma.io)
- **Bulma Extensions**: Community plugins

## Related Topics

- [Tailwind CSS](/content/css/tailwind) - Modern utility-first alternative
- [CSS Frameworks History](/content/css/css-frameworks-history) - How we got here
- [styled-components](/content/css/styled-components) - CSS-in-JS approach
- [CSS Overview](/content/css/css-overview) - All CSS approaches
- [React](/content/frameworks/react) - Often paired with Bootstrap or Tailwind

Bootstrap and legacy CSS frameworks served their purpose well, revolutionizing web development in the 2010s. While [Tailwind CSS](/content/css/tailwind) has largely replaced them for new projects, understanding these frameworks is still valuable for maintaining existing codebases and appreciating how CSS frameworks evolved.
