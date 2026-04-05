# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **HTTP client**: axios (for proxying upstream JSON API)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Anime/Film/Donghua API

Routes are defined in `artifacts/api-server/src/routes/anime.ts`.
The proxy layer is in `artifacts/api-server/src/lib/scraper.ts`.

All routes are under `/api/anime/` prefix. The API proxies data from:
`https://www.sankavollerei.com/anime/winbu/`

### Available API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/anime/docs` | Full API documentation |
| `GET /api/anime/home` | Homepage / latest anime |
| `GET /api/anime/search?q=...&page=1` | Search anime/film/series |
| `GET /api/anime/detail/anime/:slug` | Anime detail |
| `GET /api/anime/detail/series/:slug` | Series/live-action detail |
| `GET /api/anime/detail/film/:slug` | Film detail |
| `GET /api/anime/episode/:slug` | Episode download links |
| `GET /api/anime/server?post=...&nume=...&type=...` | Video embed URL |
| `GET /api/anime/animedonghua?page=1` | Donghua list |
| `GET /api/anime/film?page=1` | Film list |
| `GET /api/anime/series?page=1` | Series list |
| `GET /api/anime/tvshow?page=1` | TV show list |
| `GET /api/anime/others?page=1` | Others list |
| `GET /api/anime/all-anime?page=1` | All anime A-Z |
| `GET /api/anime/all-anime-reverse?page=1` | All anime Z-A |
| `GET /api/anime/genres` | All genres |
| `GET /api/anime/genre/:genre?page=1` | Anime by genre |
| `GET /api/anime/catalog` | Filtered catalog |
| `GET /api/anime/schedule?day=senin` | Schedule by day |
| `GET /api/anime/update?page=1` | Recent updates |
| `GET /api/anime/latest?page=1` | Latest anime |
| `GET /api/anime/ongoing?page=1` | Ongoing anime |
| `GET /api/anime/completed?page=1` | Completed anime |
| `GET /api/anime/popular?page=1` | Popular anime |
| `GET /api/anime/list?order=...&status=...&type=...` | Filtered list |

## Deployment

- GitHub Actions: `.github/workflows/deploy.yml` — auto-deploys to Vercel on push to `main`
- Vercel config: `vercel.json`
- Requires GitHub Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
