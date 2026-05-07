# Agent Guide — @contentful/vercel-nextjs-toolkit

## What This Repo Does
A small Next.js helper library for Contentful customers hosting on Vercel. Provides route handlers that activate [Next.js Draft Mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode) using Vercel's Protection Bypass for Automation feature — enabling content editors to preview unpublished content via Contentful's content preview integration.

Companion to the Contentful Vercel Marketplace App.

## Ownership
`@contentful/team-marketplace` (full, sole owner)

## Structure

```
lib/
├── app-router/handlers/enable-draft.ts    # Next.js App Router route handler
├── pages-router/handlers/enable-draft.ts  # Next.js Pages Router API route handler
├── utils/
│   ├── vercelJwt.ts                       # JWT parsing + bypass token validation
│   └── url.ts                             # URL parsing + redirect construction
└── types.ts                               # VercelJwt interface
```

## Published as Two Subpath Exports

```typescript
// App Router (Next.js 13+ app/ directory)
import { enableDraftHandler } from '@contentful/vercel-nextjs-toolkit/app-router'

// Pages Router (Next.js pages/ directory)
import { enableDraftHandler } from '@contentful/vercel-nextjs-toolkit/pages-router'
```

## Sharp Edges & Invariants

- **Dual export format** — `dist/app-router.js` (ESM) + `dist/app-router.cjs` (CJS), and same for pages-router. Both must be present in any release.
- **No production dependencies** — this is a zero-dependency library. Do not add runtime dependencies without very strong justification; consumers install it as a lightweight helper.
- **Two environment variables drive token validation**:
  - `VERCEL_AUTOMATION_BYPASS_SECRET` — primary (for Vercel Pro/Enterprise accounts)
  - `CONTENTFUL_PREVIEW_SECRET` — fallback (for hobby accounts without Vercel bypass)
  - `NODE_ENV=development` enables a relaxed bypass for local development
- **Next.js is a peer dependency** — supports `^14 || ^15 || ^16`. Do not move it to `dependencies`.
- **Vitest, not Jest** — tests use Vitest. Do not introduce Jest.
- **Publishes to GitHub Packages** — `npm.pkg.github.com`, public access under `@contentful` scope.

## Never / Always

- **Never** add a runtime dependency — keep this library zero-dependency.
- **Never** manually bump the version — semantic-release handles it on `main`.
- **Always** run `npm run build` before testing changes — both ESM and CJS outputs must build cleanly.
- **Always** add a test in `lib/**/*.spec.ts` for any new handler behavior or utility change.
