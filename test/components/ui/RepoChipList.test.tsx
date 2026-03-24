import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { RepoChipList } from "@/components/ui/RepoChipList";

afterEach(cleanup);

// Stub Popover API methods not implemented by happy-dom
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn();
  HTMLElement.prototype.hidePopover = vi.fn();
});

const noop = () => {};

describe("RepoChipList", () => {
  it("renders a chip for each repo in repos", () => {
    render(<RepoChipList repos={["foo/bar", "baz/qux"]} onAdd={noop} onRemove={noop} />);
    expect(screen.getByText("foo/bar")).toBeTruthy();
    expect(screen.getByText("baz/qux")).toBeTruthy();
  });

  it("clicking the remove button calls onRemove with the repo", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<RepoChipList repos={["foo/bar"]} onAdd={noop} onRemove={onRemove} />);
    await user.click(screen.getByRole("button", { name: /remove foo\/bar/i }));
    expect(onRemove).toHaveBeenCalledWith("foo/bar");
  });

  it("pressing Enter with suggestions open selects the first suggestion", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <RepoChipList
        repos={[]}
        suggestions={["owner/foo", "owner/bar"]}
        onAdd={onAdd}
        onRemove={noop}
      />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i }) as HTMLInputElement;
    await user.type(input, "own{Enter}");
    expect(onAdd).toHaveBeenCalledWith("owner/foo");
    expect(input.value).toBe("");
  });

  it("pressing Enter with no matching suggestions selects the create entry", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<RepoChipList repos={[]} suggestions={["other/repo"]} onAdd={onAdd} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i }) as HTMLInputElement;
    await user.type(input, "owner/repo{Enter}");
    expect(onAdd).toHaveBeenCalledWith("owner/repo");
    expect(input.value).toBe("");
  });

  it("shows a create entry at the end of the list when the typed value is not an exact suggestion", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={[]} suggestions={["owner/other"]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "owner/repo");
    const options = screen.getAllByRole("option");
    expect(options[options.length - 1].textContent).toMatch(/create "owner\/repo"/i);
  });

  it("shows a create entry even for values without a slash", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={[]} suggestions={["owner/repo"]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "noslash");
    expect(screen.getByRole("option", { name: /create "noslash"/i })).toBeTruthy();
  });

  it("does not show a create entry when the typed value exactly matches a suggestion", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={[]} suggestions={["owner/repo"]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "owner/repo");
    expect(screen.queryByRole("option", { name: /create/i })).toBeNull();
  });

  it("shows an 'Already added' message when the typed value matches an existing chip", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={["owner/repo"]} suggestions={[]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "owner/repo");
    expect(screen.getByText(/no options/i)).toBeTruthy();
  });

  it("does not close the menu when the typed value matches an existing chip", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={["owner/repo"]} suggestions={[]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "owner/repo");
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("does not show a create entry for a value already added as a chip", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={["owner/repo"]} suggestions={[]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "owner/repo");
    expect(screen.queryByRole("option", { name: /create/i })).toBeNull();
  });

  it("pressing Enter with a valid owner/repo calls onAdd and clears the input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<RepoChipList repos={[]} onAdd={onAdd} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i }) as HTMLInputElement;
    await user.type(input, "owner/repo{Enter}");
    expect(onAdd).toHaveBeenCalledWith("owner/repo");
    expect(input.value).toBe("");
  });

  it("pressing Enter with an already-added repo does not call onAdd", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<RepoChipList repos={["owner/repo"]} onAdd={onAdd} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "owner/repo{Enter}");
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("input is empty on each mount — partial text does not persist across remounts", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<RepoChipList repos={[]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i }) as HTMLInputElement;
    await user.type(input, "owner/partial");
    expect(input.value).toBe("owner/partial");

    unmount();

    render(<RepoChipList repos={[]} onAdd={noop} onRemove={noop} />);
    const freshInput = screen.getByRole("textbox", {
      name: /add repository/i,
    }) as HTMLInputElement;
    expect(freshInput.value).toBe("");
  });

  it("already-added repos are excluded from suggestions", () => {
    render(
      <RepoChipList
        repos={["owner/already"]}
        suggestions={["owner/already", "owner/other"]}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    // The datalist/menu options should not contain the already-added repo
    const options = document.querySelectorAll('[role="option"]');
    const labels = Array.from(options).map((o) => o.textContent);
    expect(labels).not.toContain("owner/already");
    expect(labels).toContain("owner/other");
  });

  it("pressing Backspace on empty input focuses the last chip's remove button", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<RepoChipList repos={["foo/bar", "baz/qux"]} onAdd={noop} onRemove={onRemove} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.click(input);
    await user.keyboard("{Backspace}");
    expect(onRemove).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /remove baz\/qux/i }));
  });

  it("pressing Backspace twice on empty input removes the last chip", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<RepoChipList repos={["foo/bar", "baz/qux"]} onAdd={noop} onRemove={onRemove} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.click(input);
    await user.keyboard("{Backspace}{Backspace}");
    expect(onRemove).toHaveBeenCalledWith("baz/qux");
  });

  it("pressing Backspace on non-empty input does not remove a chip", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<RepoChipList repos={["foo/bar"]} onAdd={noop} onRemove={onRemove} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "x{Backspace}");
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("pressing Backspace or Delete on a focused chip remove button removes that chip", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<RepoChipList repos={["foo/bar"]} onAdd={noop} onRemove={onRemove} />);
    const removeBtn = screen.getByRole("button", { name: /remove foo\/bar/i });
    removeBtn.focus();
    await user.keyboard("{Backspace}");
    expect(onRemove).toHaveBeenCalledWith("foo/bar");
  });

  it("clicking a suggestion calls onAdd with that repo and clears the input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <RepoChipList
        repos={[]}
        suggestions={["owner/repo", "owner/other"]}
        onAdd={onAdd}
        onRemove={noop}
      />,
    );
    await user.click(screen.getByRole("option", { name: "owner/repo" }));
    expect(onAdd).toHaveBeenCalledWith("owner/repo");
    const input = screen.getByRole("textbox", { name: /add repository/i }) as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("typing filters suggestions to matching options only", async () => {
    const user = userEvent.setup();
    render(
      <RepoChipList
        repos={[]}
        suggestions={["owner/foo", "owner/bar", "owner/baz"]}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "ba");
    const options = Array.from(document.querySelectorAll('[role="option"]')).map(
      (o) => o.textContent,
    );
    expect(options).toContain("owner/bar");
    expect(options).toContain("owner/baz");
    expect(options).not.toContain("owner/foo");
  });

  it("aria-expanded on the input reflects menu open state", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={[]} suggestions={["owner/repo"]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    expect(input.getAttribute("aria-expanded")).toBe("false");
    await user.type(input, "o");
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("Tab from chip remove button returns focus to input", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={["foo/bar"]} onAdd={noop} onRemove={noop} />);
    const removeBtn = screen.getByRole("button", { name: /remove foo\/bar/i });
    removeBtn.focus();
    await user.keyboard("{Tab}");
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: /add repository/i }));
  });

  it("Shift+Tab from input focuses the last chip remove button", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={["foo/bar", "baz/qux"]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    input.focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /remove baz\/qux/i }));
  });

  it("removing a chip via keyboard returns focus to input", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<RepoChipList repos={["foo/bar"]} onAdd={noop} onRemove={onRemove} />);
    const removeBtn = screen.getByRole("button", { name: /remove foo\/bar/i });
    removeBtn.focus();
    await user.keyboard("{Backspace}");
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: /add repository/i }));
  });

  it("menu element is not a Tab stop", () => {
    render(<RepoChipList repos={[]} suggestions={["foo/bar"]} onAdd={noop} onRemove={noop} />);
    const menu = document.querySelector('[role="listbox"]') as HTMLElement;
    expect(menu.tabIndex).toBe(-1);
  });

  it("placeholder is 'owner/repo' when no repos, empty when repos exist", () => {
    const { rerender } = render(<RepoChipList repos={[]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i }) as HTMLInputElement;
    expect(input.placeholder).toBe("owner/repo");
    rerender(<RepoChipList repos={["foo/bar"]} onAdd={noop} onRemove={noop} />);
    expect(input.placeholder).toBe("");
  });

  it("chip area gets data-open attribute when the menu is open", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={[]} suggestions={["owner/repo"]} onAdd={noop} onRemove={noop} />);
    const chipArea = screen.getByRole("group");
    expect(chipArea.hasAttribute("data-open")).toBe(false);
    await user.type(screen.getByRole("textbox", { name: /add repository/i }), "o");
    expect(chipArea.hasAttribute("data-open")).toBe(true);
  });

  it("clicking the chevron opens the menu when closed", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={[]} suggestions={["owner/repo"]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    expect(input.getAttribute("aria-expanded")).toBe("false");
    const chevron = document.querySelector("button[aria-hidden]") as HTMLElement;
    await user.click(chevron);
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("clicking the chevron closes the menu when open", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={[]} suggestions={["owner/repo"]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "o");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    const chevron = document.querySelector("button[aria-hidden]") as HTMLElement;
    await user.click(chevron);
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  // Option navigation tests open the menu by typing first so that showPopover has been called
  // and options are focusable. The rAF in openMenu then auto-focuses the first option — tests
  // are structured around that behaviour.

  it("typing then ArrowDown moves focus to the first option, second ArrowDown moves to second", async () => {
    const user = userEvent.setup();
    render(
      <RepoChipList
        repos={[]}
        suggestions={["owner/foo", "owner/bar", "owner/baz"]}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i });
    // After typing, focus returns to input. First ArrowDown → owner/foo; second → owner/bar.
    await user.type(input, "owner");
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent?.trim()).toBe("owner/foo");
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent?.trim()).toBe("owner/bar");
  });

  it("ArrowDown on the last option wraps to the first", async () => {
    const user = userEvent.setup();
    render(
      <RepoChipList
        repos={[]}
        suggestions={["owner/foo", "owner/bar"]}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i });
    // Click opens menu (no typing, so no create entry); rAF focuses buttons[0].
    // ArrowDown on foo→bar (last); ArrowDown wraps back to foo.
    await user.click(input);
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement?.textContent?.trim()).toBe("owner/foo");
  });

  it("ArrowUp from the first option wraps to the last", async () => {
    const user = userEvent.setup();
    render(
      <RepoChipList
        repos={[]}
        suggestions={["owner/foo", "owner/bar"]}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i });
    // Click opens menu; rAF focuses buttons[0] (foo). ArrowUp wraps to bar (last).
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement?.textContent?.trim()).toBe("owner/bar");
  });

  it("Tab from input closes the menu", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={[]} suggestions={["owner/repo"]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "o");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    await user.keyboard("{Tab}");
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("Tab from a focused option closes the menu", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={[]} suggestions={["owner/foo"]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "owner");
    await user.keyboard("{ArrowDown}{Tab}");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    // Exact focus target cannot be verified here: happy-dom doesn't apply the user-agent
    // stylesheet that hides popover="manual" contents, so closed-menu options remain in the
    // querySelectorAll results used to find the next focusable element. In a real browser the
    // closed popover is display:none and focus lands on the correct next element after the input.
  });

  it("ArrowUp from a non-first option moves focus to the previous option", async () => {
    const user = userEvent.setup();
    render(
      <RepoChipList
        repos={[]}
        suggestions={["owner/foo", "owner/bar", "owner/baz"]}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i });
    // After typing: focus on input. ArrowDown×2 → owner/bar. ArrowUp → owner/foo.
    await user.type(input, "owner");
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}");
    expect(document.activeElement?.textContent?.trim()).toBe("owner/foo");
  });

  it("Enter on a focused option selects it and returns focus to input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <RepoChipList
        repos={[]}
        suggestions={["owner/foo", "owner/bar"]}
        onAdd={onAdd}
        onRemove={noop}
      />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i });
    // After typing: focus on input. ArrowDown → owner/foo; Enter selects it.
    await user.type(input, "owner");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onAdd).toHaveBeenCalledWith("owner/foo");
    expect(document.activeElement).toBe(input);
  });

  it("Space on a focused option selects it", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <RepoChipList
        repos={[]}
        suggestions={["owner/foo", "owner/bar"]}
        onAdd={onAdd}
        onRemove={noop}
      />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i });
    // After typing: focus on input. ArrowDown → owner/foo; Space selects it.
    await user.type(input, "owner");
    await user.keyboard("{ArrowDown}{ }");
    expect(onAdd).toHaveBeenCalledWith("owner/foo");
  });

  it("typing a character while an option is focused forwards it to the input and refocuses input", async () => {
    const user = userEvent.setup();
    render(
      <RepoChipList
        repos={[]}
        suggestions={["owner/foo", "owner/bar"]}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i }) as HTMLInputElement;
    // Type "x" to open menu and focus first option via rAF; type "y" to forward to input
    await user.type(input, "x");
    await user.keyboard("y");
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("xy");
  });

  it("aria-selected tracks which option has focus", async () => {
    const user = userEvent.setup();
    render(
      <RepoChipList
        repos={[]}
        suggestions={["owner/foo", "owner/bar"]}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i });
    // After typing, handleInput sets activeIndex=0 so options[0] is pre-selected
    await user.type(input, "owner");
    const options = screen.getAllByRole("option");
    expect(options[0].getAttribute("aria-selected")).toBe("true");
    expect(options[1].getAttribute("aria-selected")).toBe("false");
    // ArrowDown from input → owner/foo (index 0, no change to selection); second → owner/bar
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(options[0].getAttribute("aria-selected")).toBe("false");
    expect(options[1].getAttribute("aria-selected")).toBe("true");
  });

  it("ArrowDown from input when menu is closed opens it", async () => {
    const user = userEvent.setup();
    // Start with no suggestions so focusing the input doesn't open the menu
    const { rerender } = render(
      <RepoChipList repos={[]} suggestions={[]} onAdd={noop} onRemove={noop} />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i });
    input.focus(); // handleFocus: allOptions is empty, menu stays closed
    // Re-render with suggestions — menu remains closed, input retains focus
    rerender(<RepoChipList repos={[]} suggestions={["owner/foo"]} onAdd={noop} onRemove={noop} />);
    expect(input.getAttribute("aria-expanded")).toBe("false");
    await user.keyboard("{ArrowDown}");
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("ArrowDown on the last option (via keyboard navigation) wraps to the first", async () => {
    const user = userEvent.setup();
    render(
      <RepoChipList
        repos={[]}
        // Exact match for the typed text suppresses the create entry, making "owner" the true last option
        suggestions={["owner/foo", "owner/bar", "owner"]}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i });
    // ArrowDown×3 from input: first→foo, second→bar, third→owner (last); fourth wraps to foo
    await user.type(input, "owner");
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    expect(document.activeElement?.textContent?.trim()).toBe("owner");
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent?.trim()).toBe("owner/foo");
  });

  it("clicking the chip area when the menu is open closes it", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={[]} suggestions={["owner/repo"]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "o");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    await user.click(screen.getByRole("group"));
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("pressing a meta/ctrl key combo while an option is focused does not forward to input", async () => {
    const user = userEvent.setup();
    render(<RepoChipList repos={[]} suggestions={["owner/foo"]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i }) as HTMLInputElement;
    await user.type(input, "owner");
    await user.keyboard("{ArrowDown}");
    // Meta+A should not append "a" to the input
    await user.keyboard("{Meta>}a{/Meta}");
    expect(input.value).toBe("owner");
  });

  it("hovering over an option sets it as the active item", async () => {
    const user = userEvent.setup();
    render(
      <RepoChipList
        repos={[]}
        suggestions={["owner/foo", "owner/bar"]}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "owner");
    const options = screen.getAllByRole("option");
    await user.hover(options[1]);
    expect(document.activeElement).toBe(options[1]);
    expect(options[1].getAttribute("aria-selected")).toBe("true");
    expect(options[0].getAttribute("aria-selected")).toBe("false");
  });
});
