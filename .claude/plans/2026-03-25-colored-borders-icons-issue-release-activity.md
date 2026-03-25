# Colored Left Borders & Status Icons for IssueCard, ReleaseCard, ActivityCard

## Context

PRCard already has colored left borders and a status icon in the title prefix. Three other card types have status/type information that isn't visually communicated: IssueCard (open/closed state), ReleaseCard (stable/prerelease), and ActivityCard (activity kind). This adds the same visual treatment to all three, following the established CSS pattern (`--card-border-left`, per-status class on Card).

---

## IssueCard

Same pattern as PRCard.

### `src/constants/index.ts`

Add `ISSUE_STATUS` config (import `IssueState`):

```ts
export const ISSUE_STATUS: Record<IssueState, { icon: IconName }> = {
  open: { icon: "issueOpen" },
  closed: { icon: "x" },
};
```

### `src/components/cards/IssueCard.tsx`

- Import `ISSUE_STATUS`, `SvgIcon`, `Tooltip`
- Apply `className={styles[item.state]}` to `<Card>`
- Swap `prefix={`#${item.number}`}` for ReactNode prefix with Tooltip-wrapped icon

### `src/components/cards/IssueCard.module.css`

```css
.open {
  --issue-color: var(--status-success);
}
.closed {
  --issue-color: var(--status-danger);
}

.open,
.closed {
  --card-border-left: var(--issue-color);
  border-left-width: 3px;
}
```

---

## ReleaseCard

Replace text "pre-release" badge with colored left border + `tag` icon in title prefix.

### `src/components/cards/ReleaseCard.tsx`

- Derive stability: `const stability = item.prerelease ? 'prerelease' : 'stable'`
- Apply `className={styles[stability]}` to `<Card>`
- Add icon prefix to `<CardTitle>` with tooltip
- Remove text "pre-release" badge

### `src/components/cards/ReleaseCard.module.css`

```css
.stable {
  --release-color: var(--status-success);
}
.prerelease {
  --release-color: var(--status-warning);
}

.stable,
.prerelease {
  --card-border-left: var(--release-color);
  border-left-width: 3px;
}
```

---

## ActivityCard

Color the footer kind icon and add a left border for high-signal activity types.

### `src/components/cards/ActivityCard.tsx`

- Apply `className={styles[item.kind]}` to `<Card>`
- Replace `<CardTypeIcon>` with `<SvgIcon className={styles.kindIcon} />`

### `src/components/cards/ActivityCard.module.css`

```css
.pr_opened {
  --activity-color: var(--status-success);
}
.pr_merged {
  --activity-color: oklch(0.78 0.15 300);
}
.issue_closed {
  --activity-color: var(--status-danger);
}
.star {
  --activity-color: var(--status-warning);
}

.pr_opened,
.pr_merged,
.issue_closed,
.star {
  --card-border-left: var(--activity-color);
  border-left-width: 3px;
}

.kindIcon {
  color: var(--activity-color, var(--text-muted));
}
```
