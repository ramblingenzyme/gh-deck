# Plan: Push CI filter fields to GitHub API

## Context

The CI column currently fetches the first page of workflow runs per repo (10 per repo, up to 5 repos) and filters client-side. This means filters only apply over a small result set. The `/repos/{owner}/{repo}/actions/runs` endpoint supports `actor`, `branch`, `event`, and `status` as query params, so these can be pushed server-side to filter over all results.

The client-side `matchesCI` currently supports `repo:`, `status:`, `branch:`, `triggered:`, and bare text. `triggered:` maps to the API's `event` param.

A new `actor:` field will also be supported (not currently in client-side filter at all).

## Files to modify

- `src/store/githubQueries.ts` — pass filter params to the API URL; update SWR cache key
- `src/utils/queryFilter.ts` — add `actor:` passthrough for CI; add `sha:` and `task:` passthrough for deployments
- `test/utils/queryFilter.test.ts` — add tests for new server-side passthrough fields
- `src/hooks/useColumnData.ts` — pass `tokens` to `useGetCIRuns` and `useGetDeployments`

## Implementation

### `buildParams` helper in `githubQueries.ts`

Private helper that maps token keys to API param names and returns a `URLSearchParams`:

```ts
function buildParams(tokens: Tokens, keyMap: Record<string, string>): URLSearchParams;
```

### `useGetCIRuns`

- Accept `tokens: Tokens` as a new parameter
- Map: `branch` → `branch`, `status` → `status`, `triggered` → `event`, `actor` → `actor`
- Use `new URL("https://api.github.com/repos/${repo}/actions/runs")`, copy params via `url.searchParams`, pass `url.pathname + url.search` to `githubFetch`
- SWR cache key: `["ci", repos, sessionId, params.toString()]`

### `useGetDeployments`

Same pattern. Map: `ref` → `ref`, `environment` → `environment`, `sha` → `sha`, `task` → `task`.

### `matchesCI` / `matchesDeployment` in `queryFilter.ts`

- Existing client-side matchers kept unchanged — `branch:`, `status:`, `triggered:` in CI; `ref:`, `environment:`, `status:`, `creator:` in deployments. These remain correct for demo mode and are redundant-but-harmless in real mode (server already filtered).
- New server-side-only keys that have no corresponding field on the item type: `actor:` (CI), `sha:` and `task:` (deployments) → explicit `return true` passthrough so they don't incorrectly exclude items.

### `Tokens` type

Exported from `queryFilter.ts` and reused in `githubQueries.ts`.

## Deployments API params

`/repos/{owner}/{repo}/deployments` supports `sha`, `ref`, `task`, `environment`.

- `ref:` and `environment:` already had client-side matchers → now also pushed server-side
- `sha:` and `task:` are new, server-side only

## Verification

- `npm test` — all 456 tests pass
- In the running app, add a CI column with `branch:main` and confirm the API request includes `?branch=main` (no explicit `per_page`, defaults to 30)
- Confirm results are not double-filtered client-side for those fields
