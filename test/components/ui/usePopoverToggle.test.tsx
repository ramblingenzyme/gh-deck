import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/preact";
import { useRef } from "preact/hooks";
import { usePopoverToggle } from "@/components/ui/usePopoverToggle";

afterEach(cleanup);

beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn();
  HTMLElement.prototype.hidePopover = vi.fn();
});

interface FixtureProps {
  filteredCount: number;
}

function Fixture({ filteredCount }: FixtureProps) {
  const menuRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isOpen, open, close } = usePopoverToggle({ menuRef, anchorRef, inputRef, filteredCount });

  return (
    <div>
      <button ref={anchorRef as any} data-testid="anchor" onClick={open}>
        Toggle
      </button>
      <div ref={menuRef as any} data-testid="menu" popover="auto">
        Menu content
      </div>
      <input ref={inputRef} aria-label="repo input" />
      <output data-testid="state">{isOpen ? "open" : "closed"}</output>
      <button data-testid="open-btn" onClick={open}>
        Open
      </button>
      <button data-testid="close-btn" onClick={close}>
        Close
      </button>
    </div>
  );
}

function getState() {
  return screen.getByTestId("state").textContent;
}

describe("usePopoverToggle — open/close", () => {
  it("open() sets isOpen to true when filteredCount > 0", () => {
    render(<Fixture filteredCount={3} />);
    expect(getState()).toBe("closed");
    act(() => {
      screen.getByTestId("open-btn").click();
    });
    expect(getState()).toBe("open");
  });

  it("open() calls showPopover() on the menu element", () => {
    render(<Fixture filteredCount={3} />);
    act(() => {
      screen.getByTestId("open-btn").click();
    });
    const menu = screen.getByTestId("menu");
    expect(menu.showPopover).toHaveBeenCalled();
  });

  it("open() does nothing when filteredCount is 0", () => {
    render(<Fixture filteredCount={0} />);
    act(() => {
      screen.getByTestId("open-btn").click();
    });
    expect(getState()).toBe("closed");
    const menu = screen.getByTestId("menu");
    expect(menu.showPopover).not.toHaveBeenCalled();
  });

  it("close() sets isOpen to false", () => {
    render(<Fixture filteredCount={3} />);
    act(() => {
      screen.getByTestId("open-btn").click();
    });
    expect(getState()).toBe("open");
    act(() => {
      screen.getByTestId("close-btn").click();
    });
    expect(getState()).toBe("closed");
  });

  it("close() calls hidePopover() on the menu element", () => {
    render(<Fixture filteredCount={3} />);
    act(() => {
      screen.getByTestId("open-btn").click();
    });
    act(() => {
      screen.getByTestId("close-btn").click();
    });
    const menu = screen.getByTestId("menu");
    expect(menu.hidePopover).toHaveBeenCalled();
  });
});

describe("usePopoverToggle — auto-close", () => {
  it("closes automatically when filteredCount drops to 0 while open", () => {
    const { rerender } = render(<Fixture filteredCount={3} />);
    act(() => {
      screen.getByTestId("open-btn").click();
    });
    expect(getState()).toBe("open");
    act(() => {
      rerender(<Fixture filteredCount={0} />);
    });
    expect(getState()).toBe("closed");
  });
});

describe("usePopoverToggle — outside click", () => {
  it("clicking outside both anchor and menu closes the menu", () => {
    render(
      <div>
        <Fixture filteredCount={3} />
        <button data-testid="outside">Outside</button>
      </div>,
    );
    act(() => {
      screen.getByTestId("open-btn").click();
    });
    expect(getState()).toBe("open");
    act(() => {
      const event = new PointerEvent("pointerdown", { bubbles: true });
      screen.getByTestId("outside").dispatchEvent(event);
    });
    expect(getState()).toBe("closed");
  });

  it("clicking inside the anchor does not close the menu", () => {
    render(<Fixture filteredCount={3} />);
    act(() => {
      screen.getByTestId("open-btn").click();
    });
    expect(getState()).toBe("open");
    act(() => {
      const event = new PointerEvent("pointerdown", { bubbles: true });
      screen.getByTestId("anchor").dispatchEvent(event);
    });
    expect(getState()).toBe("open");
  });

  it("clicking inside the menu does not close the menu", () => {
    render(<Fixture filteredCount={3} />);
    act(() => {
      screen.getByTestId("open-btn").click();
    });
    expect(getState()).toBe("open");
    act(() => {
      const event = new PointerEvent("pointerdown", { bubbles: true });
      screen.getByTestId("menu").dispatchEvent(event);
    });
    expect(getState()).toBe("open");
  });
});

describe("usePopoverToggle — Escape key", () => {
  it("pressing Escape while :popover-open closes the menu and focuses the input", () => {
    render(<Fixture filteredCount={3} />);
    act(() => {
      screen.getByTestId("open-btn").click();
    });
    expect(getState()).toBe("open");

    const menu = screen.getByTestId("menu");
    // Stub matches so ":popover-open" returns true
    const originalMatches = menu.matches.bind(menu);
    menu.matches = (selector: string) =>
      selector === ":popover-open" ? true : originalMatches(selector);

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    });

    expect(getState()).toBe("closed");
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: /repo input/i }));
  });

  it("pressing Escape when menu is not open does nothing", () => {
    render(<Fixture filteredCount={3} />);
    expect(getState()).toBe("closed");

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    });

    expect(getState()).toBe("closed");
  });
});
