# Feature: External Links Open in New Tab

## Problem

When users click on external links to official documentation (or any external resource) from article content, the link opens in the same tab, navigating away from the documentation site. This:
- Interrupts the user's reading flow
- Requires using the back button to return
- Can cause loss of scroll position
- Reduces discoverability of the documentation content

## Solution

Automatically detect external links (those starting with `http://` or `https://`) and add `target="_blank"` to open them in a new tab, while keeping internal wiki-style links opening in the same tab for seamless navigation.

Also adds `rel="noopener noreferrer"` for security when opening external links in new tabs.

## Changes

**File:** `src/pages/content/[...slug].astro`

### Enhanced Marked Configuration

Extended the existing marked renderer configuration to include a custom link renderer:

```typescript
// Configure marked to add IDs to headings and handle external links
marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
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
  }
});
```

## Behavior

### External Links
Links starting with `http://` or `https://`:
```markdown
[React Documentation](https://react.dev)
[MDN Web Docs](https://developer.mozilla.org)
```
- Open in new tab (`target="_blank"`)
- Include security attributes (`rel="noopener noreferrer"`)

### Internal Links
Relative links within the documentation:
```markdown
[React](/content/frameworks/react)
[TypeScript](/content/languages/typescript)
```
- Open in same tab (default behavior)
- Allow seamless wiki-style navigation

## Security

The `rel="noopener noreferrer"` attribute prevents security vulnerabilities when opening external links:
- **noopener**: Prevents the new page from accessing `window.opener`
- **noreferrer**: Prevents the browser from sending the referrer header

This protects against:
- Tabnabbing attacks
- Privacy leaks through referrer information

## Benefits

- **Better UX**: Users can reference external docs without losing their place
- **Improved Navigation**: Internal links navigate seamlessly within the site
- **Security**: Protects against common vulnerabilities
- **Expected Behavior**: Matches user expectations for documentation sites
- **No Configuration Needed**: Automatically applies to all markdown content

## Browser Compatibility

- `target="_blank"`: Supported in all browsers
- `rel="noopener noreferrer"`: Supported in all modern browsers
- Graceful degradation in older browsers

## Testing

1. Add external links to markdown content (e.g., `[Example](https://example.com)`)
2. Add internal links (e.g., `[Page](/content/folder/page)`)
3. Click external links - should open in new tab
4. Click internal links - should open in same tab
5. Verify `rel="noopener noreferrer"` is present on external links in HTML
6. Test middle-click behavior (should still work correctly)
