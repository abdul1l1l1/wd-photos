# WD Photo Album

An editable nine-frame photo album with owner-only GitHub synchronization.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Album frontend: `artifacts/wd-photo-album`
- GitHub sync routes and service: `artifacts/api-server/src/routes/album.ts` and `artifacts/api-server/src/lib/githubAlbum.ts`
- API contract: `lib/api-spec/openapi.yaml`
- Owner record: `lib/db/src/schema/album-owners.ts`

## Architecture decisions

- The public can view the album, but only the first signed-in owner can edit and sync it.
- Album metadata is stored in `album.json`; uploaded photos are committed under `images/` in `abdul1l1l1/wd-photos`.
- Browser local storage remains an offline fallback when GitHub synchronization fails.

## Product

- Public nine-photo gallery with lightbox viewing
- Owner editing for the title, photos, image URLs, and internal captions
- Automatic GitHub sync with saving, saved, and failure states

## User preferences

- Mirror every requested app code, design, and asset change to the `abdul1l1l1/wd-photos` GitHub repository before finishing the request.
- Every replacement gallery photo must receive a matching new title and a descriptive description.
- Detail-page related pictures must use separate image assets that are not among the nine main gallery photos.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
