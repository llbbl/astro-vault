# Tool: Duplicate Heading ID Checker

## Problem

When markdown headings are converted to HTML with auto-generated IDs, duplicate heading text creates duplicate IDs. This causes React to throw warnings about duplicate keys:

```
Encountered two children with the same key, `cloudflare-workers`.
Keys should be unique so that components maintain their identity across updates.
```

These errors occur in components like `DocsToc` that map over headings, where duplicate IDs result in duplicate React keys. While the application still works, these warnings:
- Clutter the console
- Can mask other important errors
- Indicate potential issues with component identity
- May cause unexpected behavior in React's reconciliation

## Solution

Created a shell script that detects duplicate heading IDs before they cause runtime errors. The script:
1. Scans all markdown files in the content directory
2. Extracts headings and converts them to IDs using the same logic as the marked renderer
3. Detects duplicates within each file
4. Reports which files have duplicate IDs and what those duplicates are

## Changes

**File:** `scripts/check-duplicate-headings.sh` (new file)

```bash
#!/bin/bash

# Check for duplicate heading IDs in markdown files

echo "Checking for duplicate heading IDs..."
echo

has_duplicates=false

for file in ./content/**/*.md; do
  # Extract headings and convert to IDs using the same logic as our marked renderer
  ids=$(grep "^##" "$file" | sed 's/^#* //' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-zA-Z0-9 -]//g' | tr ' ' '-')

  # Check for duplicates
  duplicates=$(echo "$ids" | sort | uniq -d)

  if [ -n "$duplicates" ]; then
    echo "❌ $file has duplicate heading IDs:"
    echo "$duplicates" | sed 's/^/   - /'
    echo
    has_duplicates=true
  fi
done

if [ "$has_duplicates" = false ]; then
  echo "✅ No duplicate heading IDs found!"
else
  echo "Fix the duplicate headings above to avoid React key errors."
fi
```

## Usage

Run the script from the project root:

```bash
./scripts/check-duplicate-headings.sh
```

**Example output with duplicates:**

```
Checking for duplicate heading IDs...

❌ ./content/runtimes/serverless-edge.md has duplicate heading IDs:
   - cloudflare-workers

❌ ./content/css/bootstrap.md has duplicate heading IDs:
   - bootstrap
   - foundation
   - bulma

Fix the duplicate headings above to avoid React key errors.
```

**Example output without duplicates:**

```
Checking for duplicate heading IDs...

✅ No duplicate heading IDs found!
```

## How It Works

The script replicates the ID generation logic from `src/pages/content/[...slug].astro`:

```typescript
// marked renderer
const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
```

Bash equivalent:
```bash
grep "^##" "$file" |           # Extract headings (##, ###, etc.)
  sed 's/^#* //' |             # Remove # markers
  tr '[:upper:]' '[:lower:]' | # Convert to lowercase
  sed 's/[^a-zA-Z0-9 -]//g' |  # Remove non-word characters except spaces and hyphens
  tr ' ' '-'                    # Replace spaces with hyphens
```

Then uses `sort | uniq -d` to find duplicates.

## Common Duplicate Patterns

### Pattern 1: Overview + Detail Sections

**Problem:**
```markdown
## PostgreSQL

### PostgreSQL
Details about PostgreSQL...
```

**Fix:** Make subsection more specific
```markdown
## PostgreSQL

### PostgreSQL Overview
Details about PostgreSQL...
```

### Pattern 2: Learning Resources

**Problem:**
```markdown
## Bootstrap
Framework details...

## Learning Resources

### Bootstrap
Links to Bootstrap docs...
```

**Fix:** Add context to second heading
```markdown
## Bootstrap
Framework details...

## Learning Resources

### Bootstrap Documentation
Links to Bootstrap docs...
```

### Pattern 3: Code Examples

**Problem:**
```markdown
## Major Runtimes

### Node.js
Description...

## Practical Examples

### Node.js
Code example...
```

**Fix:** Add "Example" suffix
```markdown
## Major Runtimes

### Node.js
Description...

## Practical Examples

### Node.js Example
Code example...
```

## Integration with CI/CD

Add to GitHub Actions workflow:

```yaml
name: Check Markdown

on: [push, pull_request]

jobs:
  check-headings:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for duplicate headings
        run: |
          chmod +x ./scripts/check-duplicate-headings.sh
          ./scripts/check-duplicate-headings.sh
```

## Benefits

- **Prevents React warnings**: Catches duplicate keys before deployment
- **Better developer experience**: Clean console without warning clutter
- **Easy to use**: Single command to check entire content directory
- **Fast**: Runs in milliseconds, suitable for pre-commit hooks
- **Consistent**: Uses same ID generation logic as the application
- **Educational**: Output shows exactly which headings need fixing

## Limitations

- Only checks within individual files (doesn't check for duplicates across files)
- Requires bash shell
- Assumes markdown files use `##` syntax for headings (not underline style)
- Glob pattern `./content/**/*.md` requires bash 4+ (use `find` for older bash)

## Testing

1. Create a markdown file with duplicate headings:
```markdown
## Test Section
### Example
Content here...

## Another Section
### Example
More content...
```

2. Run the script:
```bash
./scripts/check-duplicate-headings.sh
```

3. Verify it detects the duplicate "example" ID

4. Fix the duplicate by renaming one heading

5. Run again and verify it reports no duplicates

## Related Files

- `src/pages/content/[...slug].astro` - Uses marked renderer to generate heading IDs
- `src/components/DocsToc.tsx` - React component that creates keys from heading IDs
- `content/**/*.md` - All markdown files that are checked by this script
