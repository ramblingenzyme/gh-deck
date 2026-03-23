# Plan: RTK Query `configApi` + Layout Persistence

## Context

The app manages column state in a local `useColumns` React hook. The goal is to replace it with an RTK Query `configApi` service. The RTK Query cache is the single source of truth — no separate reducer slice. Immer `produce` is used for collection mutations inside `queryFn`s.

**Storage concern separated cleanly:**

- A `layoutStorage` helper module owns all `localStorage` read/write — one place to change
- Endpoints use `queryFn` (bypass `baseQuery`) so each endpoint is self-contained
- `baseQuery` is a minimal placeholder pointing at the future API base URL
- Migrating to a backend = replace `queryFn` with `query` per endpoint + update `baseQuery`

---

## Architecture

```
store/
├── index.ts           — configureStore
├── layoutStorage.ts   — raw localStorage helpers (load / save)
└── configApi.ts       — RTK Query API: getLayout + 4 mutations via queryFn
                         Immer produce used for collection ops inside queryFns
```

---

## Implementation

### `src/store/layoutStorage.ts`

All `localStorage` access lives here.

```ts
import type { ColumnConfig } from "@/types";
import { DEFAULT_COLUMNS } from "@/constants";

const STORAGE_KEY = "gh-deck:layout";

export function loadLayout(): ColumnConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ColumnConfig[]) : DEFAULT_COLUMNS;
  } catch {
    return DEFAULT_COLUMNS;
  }
}

export function saveLayout(columns: ColumnConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
}
```

### `src/store/configApi.ts`

`mutateLayout` wraps `loadLayout` + Immer `produce` + `saveLayout` in one call. Each endpoint receives a plain array draft.

```ts
import { produce } from "immer";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

function mutateLayout(fn: (draft: ColumnConfig[]) => void): ColumnConfig[] {
  const next = produce(loadLayout(), fn);
  saveLayout(next);
  return next;
}
```

### `src/store/index.ts`

```ts
import { configureStore } from "@reduxjs/toolkit";
import { configApi } from "./configApi";

export const store = configureStore({
  reducer: { [configApi.reducerPath]: configApi.reducer },
  middleware: (getDefault) => getDefault().concat(configApi.middleware),
});
```

---

## Files Changed

| Action | Path                                                                 |
| ------ | -------------------------------------------------------------------- |
| Create | `src/store/layoutStorage.ts`                                         |
| Create | `src/store/configApi.ts`                                             |
| Create | `src/store/index.ts`                                                 |
| Modify | `src/main.tsx` — add `<Provider store={store}>`                      |
| Modify | `src/components/App.tsx` — replace `useColumns` with RTK Query hooks |
| Delete | `src/hooks/useColumns.ts`                                            |

---

## Backend migration path

1. Replace `layoutStorage.ts` and implement server endpoints
2. Per `configApi` endpoint: replace `queryFn` with `query` returning the appropriate path/method
3. Change `baseQuery` to `fetchBaseQuery({ baseUrl: '/api' })`
4. No component changes needed
