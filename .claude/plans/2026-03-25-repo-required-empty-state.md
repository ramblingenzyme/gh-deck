# Plan: Empty State for Columns Requiring Repo Selection

## Context

Columns of type `ci`, `releases`, `deployments`, and `security` require at least one repo to be configured. When a user adds one of these columns without any repos, the current "No results" empty state is unhelpful — it doesn't explain why or what to do. We want a special empty state that prompts the user to open settings and add repos.

## Approach

Add an `emptyState` prop to `BaseColumn` so specialized column components can inject a custom empty state. The multi-repo columns (`CIColumn`, `ReleasesColumn`, `DeploymentsColumn`, `SecurityColumn`) each pass a "No repos configured / Add repos in settings" prompt when `col.repos` is empty or missing. `BaseColumn` stays generic.

## Files to Modify

- `src/components/BaseColumn.tsx` — add optional `emptyState?: ReactNode` prop; use it in the empty state condition
- `src/components/BaseColumn.module.css` — add `.emptyStatePrompt` for the "add repos" CTA styling
- `src/components/columns/CIColumn.tsx` — pass `emptyState` when no repos
- `src/components/columns/ReleasesColumn.tsx` — same
- `src/components/columns/DeploymentsColumn.tsx` — same
- `src/components/columns/SecurityColumn.tsx` — same

## Implementation

### BaseColumn.tsx

Add prop and use it:

```tsx
interface BaseColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
  renderCard: (item: AnyItem) => ReactNode;
  accentClass?: string;
  emptyState?: ReactNode; // ← new
}
```

Replace the existing empty state render:

```tsx
{
  !isLoading &&
    !error &&
    data.length === 0 &&
    (emptyState ?? <p className={styles.emptyState}>No results</p>);
}
```

### BaseColumn.module.css

Add a new class for the CTA style empty state:

```css
.emptyStatePrompt {
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;

  p {
    margin: 0;
    font-size: var(--text-md);
    color: var(--text-ghost);
  }

  button {
    font-size: var(--text-sm);
    color: var(--color-accent);
    background: oklch(from var(--color-accent) l c h / 0.12);
    border: 1px solid oklch(from var(--color-accent) l c h / 0.25);
    border-radius: var(--radius-sm);
    padding: 3px 10px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: oklch(from var(--color-accent) l c h / 0.2);
    }
  }
}
```

### Multi-repo column components (CIColumn, ReleasesColumn, DeploymentsColumn, SecurityColumn)

Each gets a small wrapper. Example for `CIColumn`:

```tsx
import styles from "./BaseColumn.module.css";

export const CIColumn = ({ col, onRemove }: ColumnProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const noReposState = !col.repos?.length ? (
    <div className={styles.emptyStatePrompt}>
      <p>No repos configured</p>
      <button onClick={() => setSettingsOpen(true)}>Add repos in settings</button>
    </div>
  ) : undefined;

  return (
    <>
      <ColumnSettingsModal open={settingsOpen} col={col} onClose={() => setSettingsOpen(false)} />
      <BaseColumn
        accentClass={styles.accent}
        col={col}
        onRemove={onRemove}
        renderCard={(item) => <CICard key={item.id} item={item as CIItem} />}
        emptyState={noReposState}
      />
    </>
  );
};
```

Wait — this duplicates `ColumnSettingsModal` management. `BaseColumn` already handles this internally via `settingsOpen` state. The button should open the settings modal that's already inside `BaseColumn`.

**Revised approach**: Pass a callback `onOpenSettings` from `BaseColumn` into the `emptyState` render. Better: pass the setter as a prop into the empty state.

Actually the simplest approach: pass `emptyState` as a **function** `(onOpenSettings: () => void) => ReactNode` so the button can call back to BaseColumn's existing `setSettingsOpen`.

```tsx
// BaseColumn.tsx
interface BaseColumnProps {
  ...
  emptyState?: (onOpenSettings: () => void) => ReactNode;
}

// In render:
{!isLoading && !error && data.length === 0 && (
  emptyState ? emptyState(() => setSettingsOpen(true)) : <p className={styles.emptyState}>No results</p>
)}
```

In CIColumn (and the other three):

```tsx
export const CIColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <CICard key={item.id} item={item as CIItem} />}
    emptyState={
      !col.repos?.length
        ? (openSettings) => (
            <div className={styles.emptyStatePrompt}>
              <p>No repos configured</p>
              <button onClick={openSettings}>Add repos in settings</button>
            </div>
          )
        : undefined
    }
  />
);
```

The four multi-repo columns stay as arrow-function one-liners. `BaseColumn` stays generic with no knowledge of repo concepts.

## Verification

1. `npm run dev` — add a CI/Releases/Deployments/Security column with no repos → see "No repos configured" + button
2. Click button → ColumnSettingsModal opens
3. Add repos + save → normal data/loading/empty states work
4. PR/Issue columns with no results → still show generic "No results"
5. `npm test` — no failures
