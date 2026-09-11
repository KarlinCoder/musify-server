# musify-server

Express 5 + TypeScript 7 backend that proxies Deezer via their private Pipe GraphQL API.

## Commands

- `pnpm dev` — watch mode via tsx
- `pnpm build` — tsc compile to `dist/`
- `pnpm start` — run compiled output

No lint, test, or format commands are configured.

## Module system

`"type": "commonjs"` in package.json. `tsconfig.json` uses `"module": "commonjs"` with `esModuleInterop: true`, so default imports from CJS packages (express, axios, etc.) work without issue.

## Structure

- `src/lib/` — external API clients (Deezer Pipe)
- `src/services/` — business logic
- `src/controllers/` — route handlers (empty, not yet implemented)
- `src/schemas/` — Zod validation schemas
- `src/helpers/` — utilities (`proxy.ts`, `import-as-text.ts`)
- `src/graphql/` — raw `.graphql` query files loaded at runtime via `importAsText()` (reads files with `fs.readFileSync`)
- `src/types/musify.d.ts` — global interfaces (no imports needed; ambient declarations)

## Deezer integration

- `DeezerPipeClient` (`src/lib/deezer-pipe-client.ts`) authenticates via ARL cookie → gets JWT → calls `pipe.deezer.com/api`
- `createDeezerPipeClient(arl, proxy?)` factory requires a non-empty ARL string; proxy (`AxiosProxyConfig`) is optional
- GraphQL queries are loaded as text strings via `importAsText()` and passed to `client.run()`
- Proxy config is in `src/helpers/proxy.ts` (hardcoded credentials — do not commit new secrets)

## Zod usage

Zod v4 is installed. Import as `import z from "zod"`.
