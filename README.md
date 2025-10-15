# Astro Vault

A curated collection of JavaScript and TypeScript reference articles covering modern web development technologies, frameworks, databases, and deployment strategies.

**Live site**: [vault.llbbl.com](https://vault.llbbl.com)

This vault serves as both a comprehensive learning resource and a reference implementation of the [semantic-docs](https://github.com/llbbl/semantic-docs) Astro theme, demonstrating semantic search capabilities powered by libSQL and vector embeddings.

## What's Inside

Astro Vault contains comprehensive documentation covering:

- 🎨 **CSS & Styling**: Tailwind, Bootstrap, styled-components, and CSS framework history
- 🔧 **Build Tools**: Vite, Webpack, Rollup, esbuild, Turbopack, and modern JavaScript tooling
- 🗄️ **Databases**: PostgreSQL, MongoDB, Redis, Turso, Supabase, and database best practices
- 🚀 **Deployment**: Docker, Kubernetes, Cloud Run, ECS, and container orchestration strategies
- ⚛️ **Frameworks**: React, Vue, Svelte, Angular, Next.js, Astro, and modern UI frameworks
- 💻 **Languages**: TypeScript, Go, Python, Rust, and language comparisons
- 📦 **Packages**: Documentation for @logan/libsql-search and @logan/logger (published on JSR and NPM)
- 🔍 **Search**: Full-text search, semantic search, AI embeddings, and search service comparisons
- 📬 **Queues**: Queue-based systems, BullMQ, RabbitMQ, Kafka, and messaging patterns
- ⚡ **Runtimes**: Node.js, Bun, Deno, and serverless/edge computing platforms
- 🎨 **Theme**: Documentation for the Astro Vault theme (Biome, Marked, Tailwind, Vitest)

## Features

Built with the [semantic-docs](https://github.com/llbbl/semantic-docs) Astro theme:

- 🔍 **Semantic Search** - AI-powered vector search understands meaning, not just keywords
- 📝 **Database-Powered** - Content stored in distributed libSQL database (Turso) for edge performance
- 🎨 **Multiple Themes** - Six built-in color themes (dark, light, ocean, forest, sunset, purple)
- 🆓 **Flexible Embeddings** - Choose local embeddings, Google Gemini, or OpenAI
- ⚡ **Server-Side Rendering** - Pre-rendered static pages with dynamic search API
- 📱 **Responsive Design** - Mobile-friendly with auto-generated table of contents
- 🚀 **Edge-Ready** - Fast global access with automatic replication via Turso

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- pnpm (recommended) or npm
- Turso account (optional - can use local database)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/llbbl/astro-vault.git
cd astro-vault

# Install dependencies
pnpm install

# Set up environment (optional - defaults to local database)
cp .env.example .env
# Edit .env with your Turso credentials if desired

# Initialize database and index content
pnpm db:init      # or pnpm db:init:local for local-only
pnpm index        # or pnpm index:local for local-only

# Start development server
pnpm dev
```

Visit `http://localhost:4321` to see the vault!

### Using Turso (Optional)

For edge-deployed semantic search, create a Turso account:

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Sign up and authenticate
turso auth signup

# Create a database
turso db create astro-vault

# Get credentials
turso db show astro-vault
```

Add credentials to `.env`:

```env
TURSO_DB_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
EMBEDDING_PROVIDER=local
```

## Project Structure

```
astro-vault/
├── content/                    # All documentation content
│   ├── build-tools/           # Vite, Webpack, Rollup, etc.
│   ├── css/                   # Tailwind, Bootstrap, styled-components
│   ├── databases/             # PostgreSQL, MongoDB, Redis, etc.
│   ├── deployment/            # Docker, Kubernetes, Cloud platforms
│   ├── frameworks/            # React, Vue, Svelte, etc.
│   ├── languages/             # TypeScript, Go, Python, Rust
│   ├── packages/              # @logan/* package documentation
│   ├── queues/                # Queue systems and patterns
│   ├── runtimes/              # Node.js, Bun, Deno
│   ├── search/                # Search technologies and comparisons
│   └── theme/                 # Theme package documentation
├── src/
│   ├── components/            # Astro and React components
│   ├── layouts/               # Page layouts
│   ├── lib/                   # Utilities and database client
│   ├── pages/                 # Routes and API endpoints
│   └── styles/                # Global styles
├── scripts/
│   ├── init-db.ts            # Database schema initialization
│   └── index-content.ts      # Content indexing with embeddings
└── public/                    # Static assets
```

## Development

### Commands

```bash
# Development
pnpm dev                # Start dev server
pnpm build             # Build for production
pnpm preview           # Preview production build

# Content Management
pnpm db:init           # Initialize Turso database
pnpm index             # Index content to Turso
pnpm db:init:local     # Initialize local database
pnpm index:local       # Index content locally

# Quality
pnpm lint              # Check code with Biome
pnpm lint:fix          # Auto-fix issues
pnpm format            # Format all files
pnpm test              # Run tests
```

### Adding Content

Create markdown files in `./content`:

```bash
mkdir -p content/my-topic
echo "# My Article\n\nContent here..." > content/my-topic/article.md
```

Front matter is optional:

```markdown
---
title: My Article Title
tags: [tag1, tag2]
---

# My Article Title

Content here...
```

After adding content:

```bash
pnpm index        # Re-index to update search
pnpm dev          # View changes
```

### Customization

**Change site title and description:**

Edit `src/layouts/DocsLayout.astro`:

```astro
const {
  title = 'Your Site Name',
  description = 'Your description',
} = Astro.props;
```

**Change embedding provider:**

```env
# Use Gemini (free tier: 1,500 requests/day)
EMBEDDING_PROVIDER=gemini
GEMINI_API_KEY=your-key

# Or OpenAI (paid)
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your-key
```

**Customize themes:**

Edit `src/styles/global.css` to modify or add color themes.

## Deployment

### Build for Production

```bash
# Index content (important!)
pnpm index

# Build site
pnpm build

# Preview
pnpm preview
```

### Deployment Platforms

**Vercel:**
```bash
vercel deploy
# Add environment variables in Vercel dashboard
```

**Netlify:**
```bash
netlify deploy --prod
# Add environment variables in Netlify dashboard
```

**Docker:**
```bash
docker compose up --build
# See docker-compose.yml and Dockerfile
```

**Coolify/Self-hosted:**
- Connect Git repository
- Set build command: `pnpm index && pnpm build`
- Set environment variables
- Deploy

## Search

The semantic search bar in the header provides intelligent content discovery:

- **Meaning-based**: Searches by concept, not just keywords
- **Natural language**: Ask questions like "how do I deploy my app?"
- **Context-aware**: Understands synonyms and related concepts
- **Real-time**: Results appear as you type
- **Smart ranking**: Most relevant articles first

Try searching for concepts rather than exact phrases! For example:
- "how to make my site faster" finds performance optimization articles
- "best laptop for coding" finds developer laptop recommendations
- "deploy application" finds deployment guides and CI/CD documentation

## Tech Stack

- **Framework**: [Astro](https://astro.build) 5
- **Search**: [@logan/libsql-search](https://jsr.io/@logan/libsql-search) (vector search library)
- **Database**: [Turso](https://turso.tech) (distributed libSQL/SQLite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) 4 (Oxide engine)
- **UI Components**: React islands for interactivity
- **Markdown**: Marked with custom renderers
- **Code Quality**: Biome (linting and formatting)
- **Testing**: Vitest with TypeScript
- **Embeddings**: Xenova Transformers (local), Google Gemini, or OpenAI

## Contributing

Contributions are welcome! Whether it's:

- Adding new articles or improving existing ones
- Fixing typos or broken links
- Suggesting new topics to cover
- Improving the documentation

Please open an issue or pull request on [GitHub](https://github.com/llbbl/astro-vault).

## About the Theme

This site is built with the [semantic-docs](https://github.com/llbbl/semantic-docs) Astro theme. If you want to build your own documentation site with semantic search:

1. Clone the theme: `git clone https://github.com/llbbl/semantic-docs.git`
2. Or use this vault as a reference implementation
3. Check out the [theme documentation](/content/theme/overview) in this vault

## Stay Connected

- 📧 [Subscribe to my blog](https://llbbl.blog/subscribe/) for updates and deep dives
- 💬 [Join the discussion on Bluesky](https://bsky.app/profile/llbbl.blog)
- ☕ [Support me on Ko-fi](https://ko-fi.com/llbbl)

## License

MIT - See [LICENSE](LICENSE) for details

## Credits

- Built with [semantic-docs](https://github.com/llbbl/semantic-docs) Astro theme
- Powered by [@logan/libsql-search](https://jsr.io/@logan/libsql-search)
- Hosted on [Coolify](https://coolify.io)
- Database by [Turso](https://turso.tech)
