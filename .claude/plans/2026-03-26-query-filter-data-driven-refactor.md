# Query Filter Data-Driven Refactor

## Context

`queryFilter.ts` previously encoded all filter knowledge in procedural switch statements, making it impossible to derive documentation from the code. The goal was to replace switch statements with a declarative `FilterMap` per item type, so filter behaviour and docs are defined in one place, and to expose the config for future in-UI help panels.

Along the way, we also added:

- `-key:value` negation support to exclude matching items
- Bare text search across all fields (via `textSearch` per filter map, replacing `getItemDisplayText`)
- README query syntax documentation tables

## Files Modified

- `src/utils/queryFilter.ts` — full refactor
- `src/demo/useDemoColumnData.ts` — switched to `matchesDemoTokens`
- `src/hooks/useColumnData.ts` — no functional change (cast update)
- `test/utils/queryFilter.test.ts` — updated for new API and added negation/text tests
- `README.md` — added query syntax section

## Design

### `FilterMap<T>`

```ts
interface FilterMap<T> {
  filters: Record<string, FilterDef<T>>;
  textSearch: (item: T) => (string | null | undefined)[];
}
```

`textSearch` returns the fields to OR-search when the query has no key (bare text).

### `FilterDef<T>`

Discriminated union on `scope`:

```ts
type FilterDef<T> =
  | { description: string; scope: "server" } // implicit passthrough
  | { description: string; scope: "client"; strategy: MatchStrategy<T> };
```

- `scope: 'server'` — token is sent to the GitHub API; client-side always returns `true`
- `scope: 'client'` — token is matched client-side using `strategy`

### `MatchStrategy<T>`

Tagged union of match behaviours:

| Kind          | Description                                                                              |
| ------------- | ---------------------------------------------------------------------------------------- |
| `exact`       | `get(item)?.toLowerCase() === value`                                                     |
| `substring`   | `get(item)?.toLowerCase().includes(value)`                                               |
| `array-some`  | any `{ name }` element matches                                                           |
| `flag`        | `value === flagValue && get(item)`                                                       |
| `status-enum` | value in `statusValues` matches `get(item)`, or value in `passthroughValues` always true |

### Negation

`parseQuery` now returns `{ key, value, negate }`. A leading `-` sets `negate: true`. `applyFilters` inverts the result for negated tokens. Server-scoped tokens always pass through regardless of negation.

### Token splitting

`ciTokens` / `deploymentTokens` use `splitTokens(tokens, filterMap)`:

- **server**: `scope === 'server'` tokens → passed as GitHub API params
- **client**: `scope === 'client'` tokens + bare text → used in `applyFilters`

### Two matching functions

- `matchesTokens(item: KnownItem, tokens)` — PR/Issue return `true` (GitHub Search API handles them); CI/Activity/Release/Deployment filter client-side
- `matchesDemoTokens(item: KnownItem, tokens)` — uses `DEMO_PR_FILTERS` / `DEMO_ISSUE_FILTERS` for demo mode; only use in `useDemoColumnData.ts`

### Docs surface

```ts
export const COLUMN_FILTERS = { ci, activity, release, deployment };
```

PR/Issue excluded — GitHub Search API syntax is open-ended and not enumerable. Future UI help panels can iterate `COLUMN_FILTERS[col.type].filters` to render a token reference.

## Key decisions

- `branch`, `triggered` (CI) and `environment`, `ref`, `sha`, `task` (Deployment) are `scope: 'server'` — no client-side strategies. Demo mode does not filter on these keys.
- `DEMO_PR_FILTERS` and `DEMO_ISSUE_FILTERS` exist for demo mode only. `PR_FILTERS` / `ISSUE_FILTERS` were removed — we don't enumerate all GitHub Search API tokens.
- `FilterDef<T>` is a discriminated union so TypeScript enforces that `scope: 'server'` has no `strategy` and `scope: 'client'` requires one.
