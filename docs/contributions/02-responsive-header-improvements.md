# Responsive Header Improvements

## Overview

This document details the responsive design improvements made to the header component (`DocsHeader.astro`) to ensure proper display and functionality across all screen sizes, from mobile (320px) to desktop (1920px+).

## Problem Statement

The original header had several responsive issues:
1. Search bar overflowing and wrapping at various breakpoints (484px, 530px, 654px, 764px)
2. Logo text taking up too much space on mobile
3. GitHub link text consuming valuable horizontal space
4. Inconsistent spacing and padding across breakpoints
5. Elements not properly shrinking or adapting to smaller viewports

## Solution: Mobile-First Responsive Strategy

### 1. Icon-Only UI on Mobile

**Strategy**: Convert text-heavy elements to icons on mobile devices to maximize available space.

#### Search Button
```astro
<div class="w-10 sm:w-auto sm:max-w-[180px] md:w-[200px] lg:w-[240px] xl:w-[280px] md:ml-4 md:max-w-none shrink-0">
  <Search client:load />
</div>
```

**Key Changes**:
- Mobile (`< 640px`): Fixed 40px width (`w-10`) - icon only
- Small (`>= 640px`): Auto width with 180px max
- Medium (`>= 768px`): Fixed 200px width
- Large (`>= 1024px`): Fixed 240px width
- XL (`>= 1280px`): Fixed 280px width
- Added `shrink-0` to prevent flex shrinking

#### Search Component Button (Search.tsx)
```tsx
<button
  type="button"
  onClick={() => setOpen(true)}
  className="relative w-full h-10 flex items-center justify-center sm:justify-start px-2 py-2 text-left text-sm bg-muted/50 border border-input rounded-lg hover:bg-muted transition-colors sm:px-3 sm:pl-10"
  aria-label="Search"
>
  <svg
    className="h-4 w-4 text-muted-foreground sm:absolute sm:left-3 sm:top-1/2 sm:-translate-y-1/2"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
  <span class="text-muted-foreground truncate hidden sm:inline">
    {placeholder}
  </span>
  <kbd class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
    <span class="text-xs">⌘</span>K
  </kbd>
</button>
```

**Key Features**:
- Mobile: Center-aligned icon only
- Desktop: Left-aligned with search text and ⌘K indicator
- Icon positioned absolutely on desktop to allow proper spacing
- Placeholder text hidden on mobile (`hidden sm:inline`)
- ⌘K indicator only visible on large screens (`hidden lg:flex`)

#### Logo Text
```astro
<a href="/" class="flex items-center gap-2 font-semibold shrink-0">
  <div class="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background font-mono text-sm">
    A
  </div>
  <span class="font-sans hidden sm:inline">Astro Vault</span>
</a>
```

**Key Changes**:
- Logo "A" always visible
- Text "Astro Vault" hidden on mobile (`hidden sm:inline`)
- Added `shrink-0` to prevent flex shrinking

#### GitHub Link
```astro
<a
  href="https://github.com/llbbl/semantic-docs"
  class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 p-2"
  aria-label="GitHub"
  target="_blank"
  rel="noopener noreferrer"
>
  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
</a>
```

**Key Changes**:
- Replaced text "GitHub" with GitHub icon
- Fixed size: 36px × 36px (`h-9 w-9`)
- Added proper `aria-label` for accessibility
- Icon-only design works at all screen sizes

### 2. Header Container Adjustments

```astro
<header class="sticky top-0 z-40 w-full border-b border-header-border bg-header text-header-foreground backdrop-blur">
  <div class="mx-auto w-full max-w-full">
    <div class="flex h-14 items-center px-2 sm:px-4 lg:px-6 relative">
      <!-- Header content -->
    </div>
  </div>
</header>
```

**Key Changes**:
- Reduced z-index from `z-50` to `z-40` (allows theme dropdown at higher z-index)
- Removed `overflow-x-hidden` (was blocking dropdown visibility)
- Progressive padding: `px-2` → `sm:px-4` → `lg:px-6`
- Fixed height: `h-14` (56px)
- Added `relative` positioning for proper stacking context

### 3. Flex Layout Strategy

```astro
<div class="flex h-14 items-center px-2 sm:px-4 lg:px-6 relative">
  <!-- Logo (shrink-0) -->
  <a href="/" class="flex items-center gap-2 font-semibold shrink-0">
    <!-- Logo content -->
  </a>

  <!-- Search (shrink-0, responsive widths) -->
  <div class="w-10 sm:w-auto sm:max-w-[180px] md:w-[200px] lg:w-[240px] xl:w-[280px] md:ml-4 md:max-w-none shrink-0">
    <Search client:load />
  </div>

  <!-- Spacer (flex-1, allows left elements to push right elements) -->
  <div class="flex-1" />

  <!-- Theme Switcher (shrink-0) -->
  <div class="shrink-0">
    <ThemeSwitcher client:load />
  </div>

  <!-- GitHub (shrink-0) -->
  <a class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 p-2">
    <!-- GitHub icon -->
  </a>
</div>
```

**Key Principles**:
1. All UI elements have `shrink-0` to prevent unwanted compression
2. Spacer (`flex-1`) pushes right-aligned elements to the right
3. Each element has defined widths or natural sizing
4. Responsive widths on search container only

### 4. Breakpoint Strategy

| Breakpoint | Width | Search Width | Logo Text | Padding | Notes |
|------------|-------|--------------|-----------|---------|-------|
| `< 640px` | Mobile | 40px (icon) | Hidden | `px-2` | Minimal UI |
| `>= 640px` | Small | Auto (max 180px) | Visible | `px-4` | Search expands |
| `>= 768px` | Medium | 200px | Visible | `px-4` | Fixed search width |
| `>= 1024px` | Large | 240px | Visible | `px-6` | More space |
| `>= 1280px` | XL | 280px | Visible | `px-6` | Full width |

### 5. Z-Index Hierarchy

Final z-index layering (from bottom to top):
```
z-10  - Article content
z-20  - Sidebar/TOC
z-40  - Header (reduced from z-50)
z-50  - Dialog/Modal (search dialog)
z-60  - Dropdown backdrop (theme switcher)
z-70  - Dropdown content (theme switcher)
```

**Why This Matters**:
- Header must be below dialogs (search modal)
- Header must be below theme switcher dropdown
- Prevents UI elements from blocking each other

## Testing Checklist

When implementing these changes, test at these critical breakpoints:

- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone X/11/12/13)
- [ ] 414px (iPhone Plus models)
- [ ] 484px (small landscape)
- [ ] 530px (tablet portrait edge case)
- [ ] 640px (Tailwind `sm` breakpoint)
- [ ] 654px (user-reported issue)
- [ ] 764px (user-reported issue)
- [ ] 768px (Tailwind `md` breakpoint, iPad portrait)
- [ ] 1024px (Tailwind `lg` breakpoint, iPad landscape)
- [ ] 1280px (Tailwind `xl` breakpoint)
- [ ] 1920px (Full HD desktop)

## Common Pitfalls to Avoid

1. **Don't use `overflow-x-hidden` on header**: Blocks dropdown visibility
2. **Don't forget `shrink-0`**: Without it, flex items compress unpredictably
3. **Don't use fixed widths without breakpoints**: Mobile needs different sizing
4. **Don't skip middle breakpoints**: Issues often appear at non-standard sizes (484px, 654px, etc.)
5. **Don't ignore icon-only mobile patterns**: Text consumes too much horizontal space

## Accessibility Considerations

1. **Icon-only buttons**: Always include `aria-label` attributes
2. **Hidden text**: Use `hidden sm:inline` instead of `display: none` to maintain semantic HTML
3. **Decorative icons**: Add `aria-hidden="true"` to prevent screen reader announcement
4. **Interactive elements**: Ensure minimum touch target size (44px × 44px recommended, 40px minimum)

## Related Files

- `/Users/loganlindquist/Web/astro-vault/src/components/DocsHeader.astro` - Main header component
- `/Users/loganlindquist/Web/astro-vault/src/components/Search.tsx` - Search button with responsive behavior
- `/Users/loganlindquist/Web/astro-vault/src/components/ThemeSwitcher.tsx` - Theme dropdown with adjusted z-index

## Additional Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Tailwind CSS Flexbox](https://tailwindcss.com/docs/flex)
- [MDN: Mobile-First CSS](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)
