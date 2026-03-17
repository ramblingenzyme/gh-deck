# Plan: Extract Shared Card Sub-components

## Context
Two JSX patterns are duplicated across card components and are worth extracting:

1. **`<CardTop>`** — `repo` + `age` header row, identical in all 5 cards.
2. **`<CardLabelList>`** — label chip list with dynamic CSS module key lookup, identical in `PRCard` and `IssueCard`.

## Changes

### `CardTop` component
Add to `Card.tsx` (co-located with `Card.module.css`):
```tsx
interface CardTopProps {
  repo: string;
  age: string;
}
export const CardTop = ({ repo, age }: CardTopProps) => (
  <div className={styles.cardTop}>
    <span className={styles.cardRepo}>{repo}</span>
    <span className={styles.cardAge}>{age}</span>
  </div>
);
```
Replace the `cardTop` div in: `PRCard`, `IssueCard`, `CICard`, `NotifCard`, `ActivityCard`.

### `CardLabelList` component
Add to `Card.tsx`:
```tsx
interface CardLabelListProps {
  labels: string[];
}
export const CardLabelList = ({ labels }: CardLabelListProps) => {
  if (labels.length === 0) return null;
  return (
    <div className={labelStyles.labelList}>
      {labels.map((l) => (
        <span key={l} className={`${labelStyles.label} ${labelStyles[l] ?? labelStyles.fallback}`}>{l}</span>
      ))}
    </div>
  );
};
```
`Card.tsx` will need to import `labelStyles from "./Label.module.css"`.
Replace the label list block in: `PRCard`, `IssueCard`.
Those two cards can then drop their own `labelStyles` import.

## Files to modify
- `src/components/cards/CardParts.tsx` — new file, exports `CardTop`; imports only `Card.module.css`
- `src/components/cards/LabelList.tsx` — new file, exports `LabelList`; imports only `Label.module.css`
- `src/components/cards/PRCard.tsx` — use `CardTop`, `LabelList`; drop `labelStyles` import
- `src/components/cards/IssueCard.tsx` — use `CardTop`, `LabelList`; drop `labelStyles` import
- `src/components/cards/CICard.tsx` — use `CardTop`
- `src/components/cards/NotifCard.tsx` — use `CardTop`
- `src/components/cards/ActivityCard.tsx` — use `CardTop`

## Verification
1. `npm run build` — zero errors
2. Grep `cardTop` in `cards/*.tsx` — zero results (all replaced by `<CardTop>`)
3. Grep `labelStyles` in `PRCard.tsx`, `IssueCard.tsx` — zero results

## Status: COMPLETED 2026-03-17
