# Fix RepoChipList: ARIA combobox compliance + test gaps

## Context

After reviewing the test suite against expected multi-select combobox UX, five gaps were identified:

1. `role="combobox"` missing from the input (implicit `textbox` is insufficient per ARIA 1.2)
2. `aria-activedescendant` not implemented — when the user types, `activeIndex` pre-selects option 0 but the input doesn't advertise this to screen readers
3. `aria-label` on the chip list (`<ul>`) is untested
4. Clicking the chip area when closed opens the menu — tested for chevron but not chip area
5. Selecting the create entry via ArrowDown → Enter — different code path from Enter-on-input

## ARIA model decision

The component uses a **hybrid focus model**:

- When typing: focus stays on the input, `activeIndex` tracks the pre-selected option
- When navigating with arrow keys: DOM focus moves to option buttons

Per MDN, `aria-activedescendant` is most useful in the "focus stays on input" model. The key gap is the typing case: the user types, `activeIndex=0`, `aria-selected=true` is set on the first option, but the input has no `aria-activedescendant` pointing to it — screen readers don't know anything is pre-selected.

We implement `aria-activedescendant` for the typing case and keep it in sync with `activeIndex` throughout. Option buttons get `id` attributes to make this possible.

## Files to modify

- `src/components/ui/RepoChipList.tsx`
- `test/components/ui/RepoChipList.test.tsx`

## Component changes (`RepoChipList.tsx`)

**1. Add `role="combobox"` to the input:**

```tsx
role = "combobox";
```

**2. Give each option button a stable `id` derived from its value:**

```tsx
id={`${menuId}-option-${cleanId(s)}`}
```

Using `cleanId(s)` (already imported) means the ID is based on the repo string, not the array index — IDs don't shift as the filter narrows.

**3. Set `aria-activedescendant` on the input:**

```tsx
aria-activedescendant={
  isOpen && activeIndex >= 0 ? `${menuId}-option-${cleanId(allOptions[activeIndex])}` : undefined
}
```

This advertises the pre-selected option when the user types. When focus moves to an option button (arrow key nav), `activeIndex` updates via `onFocus`, so `aria-activedescendant` stays in sync — no extra work needed.

## Test additions (`RepoChipList.test.tsx`)

**1. `role="combobox"` on the input:**

```ts
it("input has role combobox", () => {
  render(<RepoChipList repos={[]} onAdd={noop} onRemove={noop} />);
  expect(screen.getByRole("combobox", { name: /add repository/i })).toBeTruthy();
});
```

Note: all existing tests that use `getByRole("textbox", ...)` need updating to `"combobox"`.

**2. `aria-activedescendant` set after typing:**

```ts
it("aria-activedescendant points to the first option after typing", async () => {
  const user = userEvent.setup();
  render(<RepoChipList repos={[]} suggestions={["owner/foo", "owner/bar"]} onAdd={noop} onRemove={noop} />);
  const input = screen.getByRole("combobox", { name: /add repository/i });
  await user.type(input, "owner");
  const firstOption = screen.getAllByRole("option")[0];
  expect(input).toHaveAttribute("aria-activedescendant", firstOption.id);
});
```

**3. `aria-activedescendant` updates during arrow key navigation:**

```ts
it("aria-activedescendant updates as options are navigated with arrow keys", async () => {
  const user = userEvent.setup();
  render(<RepoChipList repos={[]} suggestions={["owner/foo", "owner/bar"]} onAdd={noop} onRemove={noop} />);
  const input = screen.getByRole("combobox", { name: /add repository/i });
  await user.type(input, "owner");
  await user.keyboard("{ArrowDown}{ArrowDown}");
  const options = screen.getAllByRole("option");
  expect(input).toHaveAttribute("aria-activedescendant", options[1].id);
});
```

**4. `aria-activedescendant` cleared when menu closes:**

```ts
it("aria-activedescendant is cleared when the menu closes", async () => {
  const user = userEvent.setup();
  render(<RepoChipList repos={[]} suggestions={["owner/foo"]} onAdd={noop} onRemove={noop} />);
  const input = screen.getByRole("combobox", { name: /add repository/i });
  await user.type(input, "owner");
  await user.keyboard("{Tab}");
  expect(input).not.toHaveAttribute("aria-activedescendant");
});
```

**5. `aria-label` on the chip list:**

```ts
it("chip list has accessible label", () => {
  render(<RepoChipList repos={["foo/bar"]} onAdd={noop} onRemove={noop} />);
  expect(screen.getByRole("list", { name: /repositories/i })).toBeTruthy();
});
```

**6. Clicking chip area when closed opens the menu:**

```ts
it("clicking the chip area when the menu is closed opens it", async () => {
  const user = userEvent.setup();
  render(<RepoChipList repos={[]} suggestions={["owner/repo"]} onAdd={noop} onRemove={noop} />);
  const input = screen.getByRole("combobox", { name: /add repository/i });
  expect(input).toHaveAttribute("aria-expanded", "false");
  await user.click(screen.getByRole("group"));
  expect(input).toHaveAttribute("aria-expanded", "true");
});
```

**7. Selecting the create entry via ArrowDown + Enter:**

```ts
it("navigating to the create entry and pressing Enter calls onAdd with the typed value", async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn();
  render(<RepoChipList repos={[]} suggestions={["owner/other"]} onAdd={onAdd} onRemove={noop} />);
  const input = screen.getByRole("combobox", { name: /add repository/i });
  await user.type(input, "owner/new");
  // create entry is last; "owner/other" is filtered out since it doesn't match "owner/new"
  // so there's only one option: the create entry at index 0
  await user.keyboard("{ArrowDown}{Enter}");
  expect(onAdd).toHaveBeenCalledWith("owner/new");
});
```

**8. Update all existing `getByRole("textbox", ...)` to `getByRole("combobox", ...)`**

## Verification

```bash
npm test -- test/components/ui/RepoChipList.test.tsx
```

All tests should pass. No other test files reference the `role="textbox"` query for this component.
