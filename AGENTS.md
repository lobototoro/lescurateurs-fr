# Project Configuration

## Tech Stack
- **Framework**: TanStack Start (React Router SSR)
- **UI**: React 19, Radix UI, Tailwind CSS v4, shadcn
- **Styling**: Tailwind CSS v4, CSS Variables, Framer Motion
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth
- **Testing**: Vitest
- **Linting**: Biome
- **Package Manager**: pnpm

## Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests with coverage
- `pnpm lint` - Run Biome linting
- `pnpm check` - Run Biome checks (format, lint, and import sorting)
- `pnpm format` - Format code with Biome

## Git Operations
- **IMPORTANT**: NEVER commit or push changes without explicit user authorization
- Always ask for confirmation before running `git commit` or `git push`
- Do not create commits or push to remote unless the user explicitly requests it

## Testing Requirements
- **IMPORTANT**: Unit tests must achieve 80-100% line coverage before committing
- Run `pnpm test` to check coverage report
- If coverage is below 80%, add missing tests before committing

## Key Paths
- `src/` - Application source code
- `db/` - Database schema and migrations
- `lib/` - Utility functions and helpers
