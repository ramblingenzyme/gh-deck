# ActivityCard: Icon in Title Prefix + Per-Kind Colors

## Context

ActivityCard was the sparsest card type — no icon in the title prefix (unlike all other card types), and a footer that was nearly empty when no ref was present. Also, `ACTIVITY_ICONS` was a flat `IconName` map while analogous constants (`CI_STATUS`, `DEPLOYMENT_STATUS`) include a human-readable label. This session added the title icon, upgraded the constant, and assigned distinct colors to all 9 activity kinds.

## Changes

### `src/constants/index.ts`

Replaced `ACTIVITY_ICONS: Record<ActivityType, IconName>` with `ACTIVITY_KINDS: Record<ActivityType, { icon: IconName; label: string }>`:

```ts
export const ACTIVITY_KINDS: Record<ActivityType, { icon: IconName; label: string }> = {
  commit: { icon: "gitCommit", label: "Commit" },
  comment: { icon: "comment", label: "Comment" },
  pr_opened: { icon: "gitMerge", label: "PR Opened" },
  pr_merged: { icon: "gitMerge", label: "PR Merged" },
  review: { icon: "eye", label: "Review" },
  issue_closed: { icon: "x", label: "Issue Closed" },
  branch_created: { icon: "gitBranch", label: "Branch" },
  fork: { icon: "gitFork", label: "Fork" },
  star: { icon: "star", label: "Starred" },
};
```

### `src/components/cards/ActivityCard.tsx`

- Use `ACTIVITY_KINDS` instead of `ACTIVITY_ICONS`
- Added `icon={kind.icon} iconTooltip={kind.label}` to `CardTitle`
- Footer only renders when `item.ref` is present (avoids empty footer)

### `src/components/cards/ActivityCard.module.css`

All 9 activity kinds get distinct colors spread across the hue wheel, all using `--card-title-icon-color` and `--card-border-left`:

| Kind           | Color  | Hue  |
| -------------- | ------ | ---- |
| issue_closed   | red    | ~0   |
| review         | orange | 30   |
| star           | yellow | ~60  |
| pr_opened      | green  | ~120 |
| commit         | mint   | 160  |
| comment        | cyan   | 200  |
| branch_created | indigo | 260  |
| fork           | pink   | 320  |
| pr_merged      | purple | 300  |
