# Refactor CardTitle: icon/iconTooltip props, icon outside link, centralised alignment

## Context

CardTitle currently takes `prefix?: ReactNode`, which each card fills with a Tooltip-wrapped SvgIcon (plus a bare `<span>` shim to make Tooltip's cloneElement work). This pushes the icon inside the `<a>` link, and duplicates `vertical-align: -0.1em` + margin in every card's CSS. The fix: promote the icon to first-class props on CardTitle, move it outside the link, and handle alignment once in Card.module.css.

---

## 1. `src/components/ui/Card.tsx`

Replace `prefix?: React.ReactNode` with `icon` + `iconTooltip`:

```tsx
import { SvgIcon, type IconName } from "./SvgIcon";
import { Tooltip } from "./Tooltip";

interface CardTitleProps {
  href: string;
  icon?: IconName;
  iconTooltip?: string;
  children: React.ReactNode;
}

export const CardTitle = ({ href, icon, iconTooltip, children }: CardTitleProps) => (
  <p className={cardStyles.cardTitle}>
    {icon &&
      (iconTooltip ? (
        <Tooltip text={iconTooltip} position="below">
          <span>
            <SvgIcon name={icon} className={cardStyles.titleIcon} />
          </span>
        </Tooltip>
      ) : (
        <SvgIcon name={icon} className={cardStyles.titleIcon} />
      ))}
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  </p>
);
```

The `<span>` wrapper around SvgIcon is required because Tooltip uses `cloneElement` to inject event handlers — SvgIcon doesn't forward them, but a plain `<span>` does.

## 2. `src/components/ui/Card.module.css`

Add `.titleIcon` — alignment handled once here, nowhere else:

```css
.titleIcon {
  vertical-align: -0.1em;
  margin-right: 3px;
}
```

---

## 3. Update each card

### PRCard (`src/components/cards/PRCard.tsx`)

- Remove `Tooltip` import (CardTitle handles it)
- Remove `prefix` variable; pass `icon` and `iconTooltip` directly
- Move `#{item.number}` into `children` (was part of prefix, now part of link text):

```tsx
<CardTitle href={item.url} icon={prStatus.icon} iconTooltip={item.status.toUpperCase()}>
  #{item.number} {item.title}
</CardTitle>
```

- Remove `statusIconWrap` class usage (was only needed for Tooltip shim)

### `PRCard.module.css`

- Remove `.statusIconWrap` and `.statusIcon` (alignment now in Card.module.css)

### IssueCard (`src/components/cards/IssueCard.tsx`)

Same transformation as PRCard:

```tsx
<CardTitle href={item.url} icon={issueStatus.icon} iconTooltip={item.state.toUpperCase()}>
  #{item.number} {item.title}
</CardTitle>
```

### `IssueCard.module.css`

- Remove `.statusIcon`

### CICard (`src/components/cards/CICard.tsx`)

```tsx
<CardTitle href={item.url} icon={status.icon} iconTooltip={status.label}>
  {item.name}
</CardTitle>
```

- Remove `Tooltip` import

### `CICard.module.css`

- Remove `.statusIcon`

### DeploymentCard (`src/components/cards/DeploymentCard.tsx`)

```tsx
<CardTitle href={item.url} icon={status.icon} iconTooltip={status.label}>
  {item.environment}
</CardTitle>
```

- Remove `Tooltip` import

### `DeploymentCard.module.css`

- Remove `.statusIcon` (if present)
- Also fix borders to use `--card-border-left` pattern (still pending from interrupted task):

```css
.success,
.failure,
.pending,
.in_progress,
.unknown {
  --card-border-left: var(--deploy-color);
  border-left-width: 3px;
}
```

### ReleaseCard (`src/components/cards/ReleaseCard.tsx`)

```tsx
<CardTitle href={item.url} icon="tag" iconTooltip={item.prerelease ? "PRE-RELEASE" : "STABLE"}>
  {item.tag}
</CardTitle>
```

- Remove `Tooltip`, `SvgIcon` imports
- Remove `prefix` variable

### `ReleaseCard.module.css`

- Remove `.tagIcon`

---

## Files to modify

- `src/components/ui/Card.tsx`
- `src/components/ui/Card.module.css`
- `src/components/cards/PRCard.tsx` + `PRCard.module.css`
- `src/components/cards/IssueCard.tsx` + `IssueCard.module.css`
- `src/components/cards/CICard.tsx` + `CICard.module.css`
- `src/components/cards/DeploymentCard.tsx` + `DeploymentCard.module.css`
- `src/components/cards/ReleaseCard.tsx` + `ReleaseCard.module.css`

## Verification

1. `npm test` — all tests pass
2. `npm run build` — no TypeScript errors
3. `npm run dev` — confirm icons appear outside the link hover underline, alignment is consistent across all card types, tooltips still work
