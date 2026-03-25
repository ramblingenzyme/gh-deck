# PRCard: Replace Badges with Colored Border + Status Icon

## Context

PRCard currently shows text badges (MERGED, CLOSED, DRAFT, APPROVED) in the footer stats row, making the card cluttered, especially combined with the label list. The goal is to communicate PR status more cleanly via a colored left border (matching the existing CICard pattern) and a small colored icon inline with the PR number prefix — reducing visual noise while preserving status information at a glance.

## Changes

### 1. Add `PR_STATUS` config (`src/constants/index.ts`)

Add a config record mapping `PRStatus` → `{ icon: IconName }`, following the `CI_STATUS` / `DEPLOYMENT_STATUS` patterns already in this file:

```ts
import type { ..., PRStatus } from "@/types";

export const PR_STATUS: Record<PRStatus, { icon: IconName }> = {
  open:   { icon: 'circleDot' },
  draft:  { icon: 'pencil' },
  merged: { icon: 'gitMerge' },
  closed: { icon: 'x' },
};
```

### 2. Widen `CardTitle.prefix` to `ReactNode` (`src/components/ui/Card.tsx`)

`prefix` is currently `string`. Change to `React.ReactNode` and update the render:

```tsx
// before:
prefix?: string;
// …
{prefix ? `${prefix} ` : ""}

// after:
prefix?: React.ReactNode;
// …
{prefix != null && <>{prefix}{' '}</>}
```

This is backwards-compatible — existing string callers still work.

### 3. Refactor `PRCard` (`src/components/cards/PRCard.tsx`)

- Remove all badge `<span>` elements and the APPROVED condition
- Apply `className={styles[item.status]}` to `<Card>` for the left border (same pattern as CICard)
- Pass status icon as part of the `prefix` prop to `CardTitle`:

```tsx
const prStatus = PR_STATUS[item.status];

<Card repo={item.repo} age={item.age} className={styles[item.status]}>
  <CardTitle
    href={item.url}
    prefix={<><SvgIcon name={prStatus.icon} className={styles.statusIcon} />#{item.number}</>}
  >
    {item.title}
  </CardTitle>
  ...
```

### 4. Rewrite `PRCard.module.css`

Remove all badge classes. Add status classes (same structure as `CICard.module.css`) plus a `.statusIcon` rule:

```css
.open {
  --pr-color: var(--status-success);
}
.draft {
  --pr-color: var(--text-muted);
}
.merged {
  --pr-color: oklch(0.78 0.15 300);
}
.closed {
  --pr-color: var(--status-danger);
}

.open,
.draft,
.merged,
.closed {
  --card-border-left: var(--pr-color);
  border-left-width: 3px;
}

.statusIcon {
  color: var(--pr-color);
  margin-right: 4px;
}
```

## Files to modify

- `src/constants/index.ts` — add `PR_STATUS`
- `src/components/ui/Card.tsx` — widen `CardTitle.prefix` to `ReactNode`
- `src/components/cards/PRCard.tsx` — remove badges, add border class + status icon
- `src/components/cards/PRCard.module.css` — replace badge styles with status/border/icon styles

## Verification

1. `npm test` — all tests pass (no PRItem shape changes, just rendering)
2. `npm run build` — no TypeScript errors
3. `npm run dev` — visually confirm:
   - PRCards have colored left border matching status (green=open, gray=draft, purple=merged, red=closed)
   - Status icon appears inline before the PR number in the title link
   - No badge text anywhere on PR cards
   - Labels still render below the title
   - Review counts / comments still visible in footer stats
