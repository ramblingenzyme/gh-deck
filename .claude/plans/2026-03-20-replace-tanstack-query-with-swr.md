# Replace @tanstack/preact-query with SWR

## Context

`@tanstack/preact-query` pulls in `@tanstack/query-core` as a peer dep. Together they contribute ~47 KB minified to the bundle. SWR v2 is ~14 KB minified — a ~33 KB saving on the current 115 KB JS bundle (~29% reduction).

The app only uses `useQuery` (no mutations, no infinite scroll, no devtools), making SWR a clean 1-to-1 replacement. No `QueryClientProvider` wrapper is needed with SWR (it uses a global cache by default).

## API mapping

| TanStack Query                                              | SWR equivalent                                               |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| `useQuery({ queryKey, queryFn, enabled, refetchInterval })` | `useSWR(enabled ? key : null, fetcher, { refreshInterval })` |
| `data, isLoading, isFetching, error`                        | `data, isLoading, isValidating, error`                       |
| `refetch()`                                                 | `mutate()`                                                   |
| `QueryClientProvider` + `QueryClient`                       | _(removed — no provider needed)_                             |

## Files changed

1. **`src/store/githubQueries.ts`** — Replaced all 6 `useQuery` hooks with `useSWR`. Changed import from `@tanstack/preact-query` to `swr`. Passed `null` as key when token absent (SWR's conditional fetching idiom). `refetchInterval` → `refreshInterval` option.

2. **`src/hooks/useColumnData.ts`** — Updated `toResult` helper to accept SWR's return shape (`isValidating` instead of `isFetching`, `mutate` instead of `refetch`), mapped back to `isFetching`/`refetch` on the returned `UseColumnDataResult` so callers were unchanged.

3. **`src/main.tsx`** — Removed `QueryClientProvider` and `QueryClient` import/usage; `render(<App />, root)` directly.

4. **`package.json`** — Removed `@tanstack/preact-query`, added `swr`.

5. **Test files** (`Column.test.tsx`, `Board.test.tsx`, `App.e2e.test.tsx`) — Removed `QueryClientProvider` wrappers from render helpers.

## Result

- Bundle: 115 KB → 95 KB minified (~17% reduction)
- All 113 tests pass
- No behaviour changes; polling interval preserved at 5 min
