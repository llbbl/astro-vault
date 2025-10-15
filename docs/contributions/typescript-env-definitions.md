# Feature: TypeScript Environment Variable Definitions

## Problem

When using environment variables in Astro with TypeScript, accessing them via `import.meta.env` results in TypeScript errors:
- No type safety for environment variables
- TypeScript doesn't recognize custom env variable names
- `import.meta.env.TURSO_DB_URL` shows as potentially undefined without proper types
- Developers lose autocomplete for environment variables

This was previously worked around by using `process.env` exclusively, but that doesn't work properly in Astro's dev environment which expects `import.meta.env`.

## Solution

Create a TypeScript declaration file (`src/env.d.ts`) that defines all environment variables used in the application. This provides:
- Type safety for environment variables
- Autocomplete in IDEs
- Clear documentation of what env vars the app uses
- Support for both `import.meta.env` (Astro) and `process.env` (scripts)

## Changes

**File:** `src/env.d.ts` (new file)

```typescript
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly TURSO_DB_URL?: string;
  readonly TURSO_AUTH_TOKEN?: string;
  readonly EMBEDDING_PROVIDER?: string;
  readonly GEMINI_API_KEY?: string;
  readonly OPENAI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**File:** `src/lib/turso.ts`

Updated to use `import.meta.env` with fallback to `process.env`:

```typescript
export function getTursoClient(): Client {
  if (!client) {
    const url = import.meta.env.TURSO_DB_URL || process.env.TURSO_DB_URL;
    const authToken =
      import.meta.env.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

    if (url && authToken) {
      // Use Turso remote database
      logger.info(`Using Turso database: ${url}`);
      client = createClient({ url, authToken });
    } else {
      // Fall back to local libSQL file (for CI/development)
      logger.warn('Turso credentials not found, using local libSQL database');
      client = createClient({ url: 'file:local.db' });
    }
  }

  return client;
}
```

## Benefits

- **Type Safety**: TypeScript knows about all environment variables
- **IDE Support**: Autocomplete for env vars in editors
- **Documentation**: Single source of truth for what env vars exist
- **No dotenv Dependency**: Uses Astro's built-in .env loading
- **Dual Environment Support**: Works in both Astro (import.meta.env) and Node scripts (process.env)
- **Cleaner Code**: No need for external environment loading libraries

## How It Works

1. **Astro Dev Server** (`pnpm dev`): Automatically loads `.env` files and exposes via `import.meta.env`
2. **Build Time**: Astro processes environment variables at build time
3. **Scripts** (`tsx --env-file=.env`): Falls back to `process.env` for standalone scripts
4. **TypeScript**: The `env.d.ts` file provides types for both environments

## Environment Variables

The following environment variables are defined:

### Required for Turso
- `TURSO_DB_URL`: Turso database URL (e.g., `libsql://your-db.turso.io`)
- `TURSO_AUTH_TOKEN`: Authentication token for Turso

### Optional
- `EMBEDDING_PROVIDER`: Embedding provider to use (`local`, `gemini`, or `openai`)
- `GEMINI_API_KEY`: API key for Google Gemini (if using Gemini provider)
- `OPENAI_API_KEY`: API key for OpenAI (if using OpenAI provider)

## Fallback Behavior

If Turso credentials are not set, the application automatically falls back to a local SQLite file (`local.db`), making it easy to:
- Run in CI without credentials
- Develop locally without cloud database
- Test the application in isolated environments

## Testing

1. Remove or rename `.env` file
2. Run `pnpm dev`
3. Verify TypeScript doesn't show errors on `import.meta.env.TURSO_DB_URL`
4. Verify autocomplete works for environment variables in IDE
5. Check that fallback to local.db works when credentials aren't set
6. Run `tsx --env-file=.env scripts/index-content.ts` to verify scripts work

## Related Files

- `.env` - Environment variable values (not committed to git)
- `src/lib/turso.ts` - Uses environment variables to configure database client
- `scripts/init-db.ts` - Initialization script using env vars
- `scripts/index-content.ts` - Indexing script using env vars
