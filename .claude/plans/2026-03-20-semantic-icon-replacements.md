# Plan: Semantic Icon Replacements

## Status: Completed

## Context

The generic geometric icons (circle, bullseye, diamond, refresh) don't visually communicate what they represent. A user glancing at the "Pull Requests" column header sees a refresh arrow; the "Issues" column shows a bullseye. The goal is to replace these with purpose-built icons that are immediately recognizable by convention (bell = notifications, eye = review, git-commit node = commit activity, etc.), while keeping the existing hand-crafted SVG approach.

---

## New Icons Added

Seven new icon components in `src/components/ui/icons/`, all following the existing pattern (`interface Props { className?: string }`, `aria-hidden="true"`, `viewBox="0 0 16 16"`, stroke-based where possible):

| File | Name | Shape description | Style |
|------|------|-------------------|-------|
| `BellIcon.tsx` | `bell` | Dome with flat base + clapper arc | stroke |
| `GitMergeIcon.tsx` | `gitMerge` | 3 circles (top-left, bottom-left, right) connected by lines/curves forming a merge | stroke |
| `GitCommitIcon.tsx` | `gitCommit` | Circle at center with horizontal lines extending left and right (git log node) | stroke |
| `EyeIcon.tsx` | `eye` | Almond/lens outer path + inner circle pupil | stroke |
| `PlayIcon.tsx` | `play` | Right-pointing triangle | fill |
| `IssueOpenIcon.tsx` | `issueOpen` | Circle with vertical line + dot (exclamation mark inside circle) | stroke + fill dot |
| `TagIcon.tsx` | `tag` | Pentagon tag shape with a small hole circle | stroke |

---

## Removed Unused Icons

Three icons became unused after the mapping changes: `circle`, `bullseye`, `diamond`.

Files deleted:
- `src/components/ui/icons/CircleIcon.tsx`
- `src/components/ui/icons/BullseyeIcon.tsx`
- `src/components/ui/icons/DiamondIcon.tsx`

---

## Updated Mappings in `src/constants/index.ts`

```ts
COLUMN_TYPES:
  prs          → 'gitMerge'    (was 'refresh')
  issues       → 'issueOpen'   (was 'bullseye')
  ci           → 'play'        (was 'circleDot')
  notifications → 'bell'       (was 'at')
  activity     → 'gitCommit'   (was 'circle')

NOTIF_ICONS:
  review_requested → 'eye'     (was 'refresh')
  mention          → 'at'      (unchanged)
  assigned         → 'tag'     (was 'arrowRight')
  approved         → 'check'   (unchanged)
  comment          → 'comment' (unchanged)

ACTIVITY_ICONS:
  commit      → 'gitCommit'  (was 'circle')
  comment     → 'comment'    (was 'diamond')
  pr_opened   → 'gitMerge'   (was 'refresh')
  review      → 'eye'        (was 'diamond')
  issue_closed → 'x'         (unchanged)

CI_STATUS: no changes (check/x/circleDot all read correctly)
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/types/index.ts` | Added 7 new `IconName` values; removed `'circle'`, `'bullseye'`, `'diamond'` |
| `src/components/ui/SvgIcon.tsx` | Added 7 new imports + `ICON_MAP` entries; removed 3 deleted icons |
| `src/constants/index.ts` | Updated `COLUMN_TYPES`, `NOTIF_ICONS`, `ACTIVITY_ICONS` mappings |
| `src/components/ui/icons/` | Created 7 new files; deleted 3 old files |

`IssueCard.tsx` uses `arrowRight` directly (not via constants) — left as-is.
`ColumnHeader.tsx` uses `refresh` for the refresh button — left as-is.
`circleDot` stays for CI running status.
