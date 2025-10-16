# Feature: shadcn Command Search Dialog

## Overview

Replace the inline dropdown search with a centered modal dialog using shadcn/ui's Command component. This provides a better search experience with keyboard shortcuts (⌘K), larger results area, grouped results by category, and improved mobile responsiveness.

## Why This Change?

The original inline dropdown search had several limitations:
- Limited space for displaying search results
- No keyboard shortcut support
- Results appeared directly below input, causing page layout shifts
- Less prominent search experience

The Command dialog provides:
- Centered modal with more screen real estate
- ⌘K (Cmd+K) keyboard shortcut for quick access
- Results grouped by folder/category
- Position near top of page (20% from top) to minimize jumping when results populate
- Better mobile experience with full-width dialog

## Implementation Steps

### 1. Install Dependencies

```bash
pnpm add cmdk clsx tailwind-merge @radix-ui/react-dialog lucide-react
```

### 2. Add TypeScript Path Alias

Update `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Update `astro.config.mjs`:

```javascript
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // ... other config
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
```

### 3. Add Utility Function

Update `src/lib/utils.ts` to add the `cn` function:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 4. Create UI Components

Create `src/components/ui/dialog.tsx`:

```typescript
'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[20%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-0 gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[20%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[20%] sm:rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// Add other Dialog sub-components as needed (DialogHeader, DialogFooter, etc.)

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
};
```

Create `src/components/ui/command.tsx`:

```typescript
'use client';

import type { DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground',
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="relative flex items-center" cmdk-input-wrapper="">
    <svg
      className="absolute left-3 h-4 w-4 shrink-0 text-muted-foreground"
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
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-input bg-muted/50 px-3 py-2 pl-10 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:bg-background disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[500px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm text-muted-foreground"
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
};
```

### 5. Update Search Component

Replace the contents of `src/components/Search.tsx`:

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface SearchResult {
  id: number;
  title: string;
  slug: string;
  folder: string;
  tags: string[];
  distance: number;
}

interface SearchProps {
  placeholder?: string;
  maxResults?: number;
}

export default function Search({
  placeholder = 'Search articles...',
  maxResults = 10,
}: SearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle ⌘K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Debounced search function
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/search.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            limit: maxResults,
          }),
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [maxResults],
  );

  // Handle input changes with debouncing
  const handleValueChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (value.length >= 2) {
        searchTimeoutRef.current = setTimeout(() => {
          performSearch(value);
        }, 300);
      } else {
        setResults([]);
      }
    },
    [performSearch],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  // Group results by folder
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.folder]) {
        acc[result.folder] = [];
      }
      acc[result.folder].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>,
  );

  return (
    <>
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
        <span className="text-muted-foreground truncate hidden sm:inline">
          {placeholder}
        </span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={placeholder}
          value={query}
          onValueChange={handleValueChange}
        />
        <CommandList>
          {loading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          {error && (
            <div className="py-4 px-2 text-center text-sm text-destructive">
              {error}
            </div>
          )}
          {!loading && !error && query.length >= 2 && results.length === 0 && (
            <CommandEmpty>No results found for "{query}"</CommandEmpty>
          )}
          {!loading && !error && query.length < 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search...
            </div>
          )}
          {!loading &&
            !error &&
            Object.entries(groupedResults).map(([folder, folderResults]) => (
              <CommandGroup key={folder} heading={folder.toUpperCase()}>
                {folderResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => {
                      window.location.href = `/content/${result.slug}`;
                      setOpen(false);
                    }}
                    className="flex flex-col items-start gap-1 cursor-pointer"
                  >
                    <div className="font-medium text-sm">{result.title}</div>
                    {result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

## Key Features

- **⌘K Keyboard Shortcut**: Global keyboard shortcut to open search from anywhere
- **Search Button**: Shows icon only on mobile, full input on larger screens with ⌘K hint
- **Grouped Results**: Results automatically grouped by folder/category
- **Responsive**: Adapts to all screen sizes (icon-only on small screens)
- **Positioned at Top**: Dialog appears at 20% from top to minimize jumping when results load
- **Theme-Aware**: Uses CSS variables for colors, works with all theme variations
- **Debounced Search**: 300ms debounce to avoid excessive API calls
- **Accessible**: Proper ARIA labels and keyboard navigation

## Configuration Options

### Dialog Position

To adjust the dialog position, modify the `top-[20%]` class in `dialog.tsx`:

```typescript
className={cn(
  'fixed left-[50%] top-[20%] z-50 ...',
  // Change to top-[30%] or top-[15%] as needed
)}
```

### Dialog Width

To adjust the dialog width, modify the `max-w-2xl` class in `command.tsx`:

```typescript
<DialogContent className="overflow-hidden p-0 shadow-lg max-w-2xl">
  // Change to max-w-3xl, max-w-xl, etc.
</DialogContent>
```

### Results Limit

Adjust `maxResults` in the CommandList height:

```typescript
className={cn('max-h-[500px] overflow-y-auto overflow-x-hidden', className)}
// Increase to max-h-[600px] for more results
```

## Testing

1. Press ⌘K (or Ctrl+K on Windows) to open search
2. Type at least 2 characters
3. Verify results appear grouped by folder
4. Test on mobile - should show icon-only button
5. Test theme switching - all colors should adapt

## Notes

- The dialog z-index is 50, ensure header/nav elements are lower (z-40 or below)
- For best results, increase `maxResults` prop to 10-15 to take advantage of larger dialog
- The dialog position (20% from top) was chosen to minimize layout jumping when results populate
