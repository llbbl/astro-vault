---
title: Marked - Markdown Processing
tags: [marked, markdown, parsing]
---

# Marked - Markdown Processing

Astro Vault uses [Marked](https://marked.js.org/) to parse and render Markdown content with custom extensions for enhanced documentation features.

## Why Marked?

### Performance
- **Fast parsing**: Compiles to HTML quickly
- **Lightweight**: Small bundle size (~50KB)
- **Stream support**: Process large documents
- **Browser & Node**: Works everywhere

### Flexibility
- **Custom renderers**: Override any HTML output
- **Extensions**: Add new syntax
- **Hooks**: Intercept parsing stages
- **Sanitization**: Built-in XSS protection

### Compliance
- **CommonMark**: Follows specification
- **GFM support**: GitHub Flavored Markdown
- **Backward compatible**: Stable API

## Configuration

### Basic Setup
```typescript
import { marked } from 'marked';

// Configure marked
marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const id = text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const titleAttr = title ? ` title="${title}"` : '';

      // Open external links in new tab
      if (href?.startsWith('http://') || href?.startsWith('https://')) {
        return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
      }

      // Internal links open in same tab
      return `<a href="${href}"${titleAttr}>${text}</a>`;
    }
  },
});

// Parse markdown
const html = marked.parse('# Hello World');
```

## Custom Renderers

### Heading IDs
Automatically add IDs to headings for anchor links:

```typescript
marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);

      // Generate slug from heading text
      const id = text
        .toLowerCase()
        .replace(/\s+/g, '-')           // spaces to hyphens
        .replace(/[^\w-]/g, '');        // remove special chars

      return `<h${depth} id="${id}">${text}</h${depth}>`;
    }
  }
});
```

Result:
```html
<h2 id="custom-renderers">Custom Renderers</h2>
```

### External Links
Open external links in new tab:

```typescript
marked.use({
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const titleAttr = title ? ` title="${title}"` : '';

      // Check if link is external
      const isExternal = href?.startsWith('http://') ||
                        href?.startsWith('https://');

      if (isExternal) {
        return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
      }

      return `<a href="${href}"${titleAttr}>${text}</a>`;
    }
  }
});
```

### Code Blocks
Add syntax highlighting classes:

```typescript
marked.use({
  renderer: {
    code({ text, lang }) {
      const language = lang || 'plaintext';
      return `<pre><code class="language-${language}">${text}</code></pre>`;
    }
  }
});
```

### Images
Add lazy loading and responsive classes:

```typescript
marked.use({
  renderer: {
    image({ href, title, text }) {
      const titleAttr = title ? ` title="${title}"` : '';
      return `<img src="${href}" alt="${text}"${titleAttr} loading="lazy" class="w-full h-auto rounded-lg" />`;
    }
  }
});
```

## Extensions

### GitHub Flavored Markdown
Enable GFM features:

```typescript
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

marked.use(
  gfmHeadingId(),
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);
```

### Table of Contents
Generate TOC from headings:

```typescript
const tokens = marked.lexer(markdown);
const headings = tokens
  .filter(token => token.type === 'heading')
  .map(token => ({
    depth: token.depth,
    text: token.text,
    id: token.text.toLowerCase().replace(/\s+/g, '-')
  }));

const toc = headings
  .map(h => `${'  '.repeat(h.depth - 1)}- [${h.text}](#${h.id})`)
  .join('\n');
```

### Frontmatter
Parse YAML frontmatter:

```typescript
function parseFrontmatter(markdown: string) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content: markdown };
  }

  const frontmatter = match[1]
    .split('\n')
    .reduce((acc, line) => {
      const [key, ...values] = line.split(':');
      if (key) {
        acc[key.trim()] = values.join(':').trim();
      }
      return acc;
    }, {} as Record<string, string>);

  const content = markdown.slice(match[0].length);

  return { frontmatter, content };
}

// Usage
const { frontmatter, content } = parseFrontmatter(markdown);
const html = marked.parse(content);
```

## Astro Integration

### Content Processing
```typescript
// src/pages/content/[...slug].astro
import { marked } from 'marked';
import { getArticleBySlug } from '@logan/libsql-search';

const { slug } = Astro.params;
const article = await getArticleBySlug(client, 'articles', slug);

// Configure marked
marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    }
  }
});

// Render markdown to HTML
const htmlContent = marked.parse(article.content);
```

### Frontmatter Extraction
```typescript
// scripts/index-content.ts
import fs from 'fs';
import path from 'path';

function extractFrontmatter(markdown: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);

  if (!match) {
    return { frontmatter: {}, content: markdown };
  }

  const lines = match[1].split('\n');
  const frontmatter: Record<string, any> = {};

  for (const line of lines) {
    const [key, ...values] = line.split(':');
    if (key) {
      const value = values.join(':').trim();

      // Parse arrays: tags: [tag1, tag2]
      if (value.startsWith('[') && value.endsWith(']')) {
        frontmatter[key.trim()] = value
          .slice(1, -1)
          .split(',')
          .map(v => v.trim());
      } else {
        frontmatter[key.trim()] = value;
      }
    }
  }

  const content = markdown.slice(match[0].length);

  return { frontmatter, content };
}
```

## Performance Optimization

### Caching
Cache parsed HTML to avoid re-parsing:

```typescript
const cache = new Map<string, string>();

function parseMarkdown(markdown: string): string {
  const hash = crypto.createHash('md5').update(markdown).digest('hex');

  if (cache.has(hash)) {
    return cache.get(hash)!;
  }

  const html = marked.parse(markdown);
  cache.set(hash, html);

  return html;
}
```

### Async Parsing
Parse large documents asynchronously:

```typescript
import { marked } from 'marked';

async function parseAsync(markdown: string): Promise<string> {
  return marked.parse(markdown, { async: true });
}
```

### Streaming
Process large documents in chunks:

```typescript
import { Lexer } from 'marked';

function* streamTokens(markdown: string) {
  const lexer = new Lexer();
  const tokens = lexer.lex(markdown);

  for (const token of tokens) {
    yield token;
  }
}

// Usage
for (const token of streamTokens(markdown)) {
  console.log(token);
}
```

## Security

### Sanitization
Prevent XSS attacks:

```typescript
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

function safeMarkdown(markdown: string): string {
  const html = marked.parse(markdown);
  return DOMPurify.sanitize(html);
}
```

### Disable HTML
Prevent raw HTML in markdown:

```typescript
marked.use({
  breaks: true,
  gfm: true,
  pedantic: false,
  sanitize: false,  // Use DOMPurify instead
  mangle: false,
  headerIds: true,
});
```

## Comparison with Other Parsers

| Feature | Marked | Remark | Markdown-it |
|---------|--------|--------|-------------|
| Speed | Fast | Slower | Medium |
| Size | ~50KB | ~200KB | ~100KB |
| Extensibility | Good | Excellent | Excellent |
| TypeScript | Yes | Yes | Yes |
| Async | Yes | Yes | Yes |
| Plugins | Some | Many | Many |

## Troubleshooting

### Heading IDs Not Working
Make sure to use `this.parser.parseInline()` for heading text:

```typescript
marked.use({
  renderer: {
    heading({ tokens, depth }) {
      // ✅ Correct
      const text = this.parser.parseInline(tokens);

      // ❌ Wrong - tokens is an array
      // const text = tokens;

      return `<h${depth}>${text}</h${depth}>`;
    }
  }
});
```

### Links Not Opening
Check that href is defined:

```typescript
link({ href, title, tokens }) {
  // Add null check
  if (!href) {
    return this.parser.parseInline(tokens);
  }

  // Continue with link logic
}
```

### Code Blocks Not Highlighting
Ensure language is properly escaped:

```typescript
code({ text, lang }) {
  const language = lang || 'plaintext';
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `<pre><code class="language-${language}">${escaped}</code></pre>`;
}
```

## Resources

- **Official Docs**: [marked.js.org](https://marked.js.org/)
- **GitHub**: [markedjs/marked](https://github.com/markedjs/marked)
- **NPM**: [@marked/marked](https://www.npmjs.com/package/marked)
- **Demo**: [marked.js.org/demo](https://marked.js.org/demo/)
- **Extensions**: [marked.js.org/extensions](https://marked.js.org/extensions/)
