# Fix: Table of Contents Smooth Scrolling

## Problem

When clicking on items in the right-side table of contents (TOC), the URL updates but the page doesn't scroll to the corresponding section. The browser's default anchor behavior is not working as expected.

## Solution

Added a click handler to the TOC links that:
1. Prevents the default anchor jump behavior
2. Uses `scrollIntoView()` with smooth scrolling
3. Updates the URL using `history.pushState()` without causing a page jump

## Changes

**File:** `src/components/DocsToc.tsx`

### Added Click Handler

```typescript
const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Update URL without jumping
    window.history.pushState(null, '', `#${id}`);
  }
};
```

### Updated Links

Changed from:
```tsx
<a
  href={`#${item.id}`}
  className={/* ... */}
>
  {item.text}
</a>
```

To:
```tsx
<a
  href={`#${item.id}`}
  onClick={(e) => handleClick(e, item.id)}
  className={/* ... */}
>
  {item.text}
</a>
```

## Testing

1. Start the dev server: `pnpm dev`
2. Navigate to any documentation page with multiple headings
3. Click on any item in the "On this page" table of contents on the right side
4. Verify that:
   - The page smoothly scrolls to the corresponding section
   - The URL updates to include the anchor (e.g., `#section-name`)
   - The active item in the TOC updates to highlight the current section

## Benefits

- **Better UX**: Smooth scrolling provides a more polished user experience
- **Maintains URL updates**: Still allows users to share links to specific sections
- **Works with intersection observer**: The existing active section highlighting still functions correctly
- **Browser history**: Users can use back/forward buttons to navigate between sections

## Browser Compatibility

- `scrollIntoView()` with smooth behavior: Supported in all modern browsers
- `history.pushState()`: Supported in all modern browsers
- No polyfills required for target browser support
