---

# LCFR - nextjs version

Beginning a tanstack start project.
In the future it will be a mobile-only webzine, but desktop displayed backoffice.

as of january 22, this project is only a playground for testing tanstack start versions and React new features.

It relies on supabase as a database, using drizzle as ORM, better-auth as authentication library.

Back office is a work in progress, though.

Feel free to look at the same project with nextjs as a framework [https://github.com/lobototoro/lescurateurs](https://github.com/lobototoro/lescurateurs)

# Getting Started

To run this application:

```bash
pnpm install
pnpm start
```

# Building For Production

To build this application for production:

```bash
pnpm build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The following scripts are available:

```bash
pnpm lint
pnpm format
pnpm check
```

## Shadcn

Add components using the latest version of [Shadcn](https://ui.shadcn.com/).

```bash
pnpx shadcn@latest add button
```

## History

First a project started with nextjs 15, now migrating to tan stack start.

- tailwind and shadcn blocks for styling
- better-auth with drizzle as an ORM using supabase

made with ❤️ on a mac.
