# Contributing to @contentful/vercel-nextjs-toolkit

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | LTS/iron (`.nvmrc`) |
| npm | bundled with Node |

## Setup

```bash
git clone https://github.com/contentful/vercel-nextjs-toolkit.git
cd vercel-nextjs-toolkit
npm ci
```

## Running Tests

```bash
npm test
```

Tests use **Vitest**. Test files are co-located with source as `*.spec.ts`.

## Building

```bash
npm run build
```

Runs `tsc` (type check) then `vite build`. Output goes to `dist/`. Both ESM and CJS formats are built for `app-router` and `pages-router` subpaths.

## Code Conventions

- **TypeScript** throughout, strict mode
- **Zero runtime dependencies** — do not add any `dependencies` entries
- **Conventional Commits** — `feat:`, `fix:`, `chore:`, `docs:`
- `next` stays as a `peerDependency` — do not move it to `dependencies`
- Prettier runs automatically on staged files via Husky pre-commit hook

## Releasing

Releases are automated via semantic-release on `main`. Do not manually bump versions.

## Troubleshooting

**Build fails with type errors**
Ensure `next` types are available — run `npm ci` to confirm peer deps are installed correctly.

**Tests failing for JWT validation**
The JWT tests use real JWT fixtures. If the `_vercel_jwt` cookie shape changes, update `test/fixtures` and the `VercelJwt` type in `lib/types.ts`.
