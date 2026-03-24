import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/preact";
import { useRef } from "preact/hooks";
import { useChipKeyNav } from "@/components/ui/useChipKeyNav";

afterEach(cleanup);

interface FixtureProps {
  repos: string[];
  onRemove: (repo: string) => void;
  onLeaveField: () => void;
  onInputKeyDown?: (result: boolean) => void;
}

function Fixture({ repos, onRemove, onLeaveField, onInputKeyDown }: FixtureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const chipAreaRef = useRef<HTMLElement>(null);

  const { handleInputNavKeys, handleChipRemoveKeyDown } = useChipKeyNav({
    repoCount: repos.length,
    onRemove,
    inputRef,
    chipAreaRef,
    onLeaveField,
  });

  return (
    <div>
      <div ref={chipAreaRef as any} data-testid="chip-area">
        {repos.map((repo) => (
          <button
            key={repo}
            aria-label={`Remove ${repo}`}
            onKeyDown={(e) => handleChipRemoveKeyDown(e as any, repo)}
          >
            ×
          </button>
        ))}
      </div>
      <input
        ref={inputRef}
        aria-label="repo input"
        onKeyDown={(e) => {
          const result = handleInputNavKeys(e as any);
          onInputKeyDown?.(result);
        }}
      />
    </div>
  );
}

function fireKeyDown(element: Element, key: string, opts: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...opts });
  act(() => {
    element.dispatchEvent(event);
  });
  return event;
}

describe("useChipKeyNav — handleInputNavKeys", () => {
  it("Shift+Tab when repos exist focuses the last chip remove button and returns true", () => {
    const results: boolean[] = [];
    render(
      <Fixture
        repos={["foo/bar", "baz/qux"]}
        onRemove={vi.fn()}
        onLeaveField={vi.fn()}
        onInputKeyDown={(r) => results.push(r)}
      />,
    );
    const input = screen.getByRole("textbox", { name: /repo input/i });
    input.focus();
    fireKeyDown(input, "Tab", { shiftKey: true });
    expect(results[0]).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /remove baz\/qux/i }));
  });

  it("Shift+Tab when no repos returns false and does not prevent default", () => {
    const results: boolean[] = [];
    render(
      <Fixture
        repos={[]}
        onRemove={vi.fn()}
        onLeaveField={vi.fn()}
        onInputKeyDown={(r) => results.push(r)}
      />,
    );
    const input = screen.getByRole("textbox", { name: /repo input/i });
    input.focus();
    const event = fireKeyDown(input, "Tab", { shiftKey: true });
    expect(results[0]).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it("Backspace on empty input when repos exist focuses the last chip remove button and returns true", () => {
    const results: boolean[] = [];
    render(
      <Fixture
        repos={["foo/bar", "baz/qux"]}
        onRemove={vi.fn()}
        onLeaveField={vi.fn()}
        onInputKeyDown={(r) => results.push(r)}
      />,
    );
    const input = screen.getByRole("textbox", { name: /repo input/i }) as HTMLInputElement;
    input.focus();
    // input value is empty by default
    fireKeyDown(input, "Backspace");
    expect(results[0]).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /remove baz\/qux/i }));
  });

  it("Backspace on non-empty input returns false", () => {
    const results: boolean[] = [];
    render(
      <Fixture
        repos={["foo/bar"]}
        onRemove={vi.fn()}
        onLeaveField={vi.fn()}
        onInputKeyDown={(r) => results.push(r)}
      />,
    );
    const input = screen.getByRole("textbox", { name: /repo input/i }) as HTMLInputElement;
    input.focus();
    // set a non-empty value
    Object.defineProperty(input, "value", { value: "x", writable: true });
    fireKeyDown(input, "Backspace");
    expect(results[0]).toBe(false);
  });

  it("Backspace when no repos returns false", () => {
    const results: boolean[] = [];
    render(
      <Fixture
        repos={[]}
        onRemove={vi.fn()}
        onLeaveField={vi.fn()}
        onInputKeyDown={(r) => results.push(r)}
      />,
    );
    const input = screen.getByRole("textbox", { name: /repo input/i });
    input.focus();
    fireKeyDown(input, "Backspace");
    expect(results[0]).toBe(false);
  });

  it("other keys return false", () => {
    const results: boolean[] = [];
    render(
      <Fixture
        repos={["foo/bar"]}
        onRemove={vi.fn()}
        onLeaveField={vi.fn()}
        onInputKeyDown={(r) => results.push(r)}
      />,
    );
    const input = screen.getByRole("textbox", { name: /repo input/i });
    input.focus();
    fireKeyDown(input, "ArrowDown");
    expect(results[0]).toBe(false);
  });
});

describe("useChipKeyNav — handleChipRemoveKeyDown", () => {
  it("Tab on a non-last chip focuses the next chip's remove button", () => {
    render(
      <Fixture
        repos={["foo/bar", "baz/qux", "other/repo"]}
        onRemove={vi.fn()}
        onLeaveField={vi.fn()}
      />,
    );
    const firstBtn = screen.getByRole("button", { name: /remove foo\/bar/i });
    const secondBtn = screen.getByRole("button", { name: /remove baz\/qux/i });
    firstBtn.focus();
    fireKeyDown(firstBtn, "Tab");
    expect(document.activeElement).toBe(secondBtn);
  });

  it("Tab on the last chip focuses the input", () => {
    render(<Fixture repos={["foo/bar", "baz/qux"]} onRemove={vi.fn()} onLeaveField={vi.fn()} />);
    const lastBtn = screen.getByRole("button", { name: /remove baz\/qux/i });
    lastBtn.focus();
    fireKeyDown(lastBtn, "Tab");
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: /repo input/i }));
  });

  it("Shift+Tab on a chip that is not the first focuses the previous chip's remove button", () => {
    render(<Fixture repos={["foo/bar", "baz/qux"]} onRemove={vi.fn()} onLeaveField={vi.fn()} />);
    const firstBtn = screen.getByRole("button", { name: /remove foo\/bar/i });
    const secondBtn = screen.getByRole("button", { name: /remove baz\/qux/i });
    secondBtn.focus();
    fireKeyDown(secondBtn, "Tab", { shiftKey: true });
    expect(document.activeElement).toBe(firstBtn);
  });

  it("Shift+Tab on the first chip calls onLeaveField", () => {
    const onLeaveField = vi.fn();
    render(
      <Fixture repos={["foo/bar", "baz/qux"]} onRemove={vi.fn()} onLeaveField={onLeaveField} />,
    );
    const firstBtn = screen.getByRole("button", { name: /remove foo\/bar/i });
    firstBtn.focus();
    fireKeyDown(firstBtn, "Tab", { shiftKey: true });
    expect(onLeaveField).toHaveBeenCalledOnce();
  });

  it("Backspace calls onRemove with the repo and focuses the input", () => {
    const onRemove = vi.fn();
    render(<Fixture repos={["foo/bar"]} onRemove={onRemove} onLeaveField={vi.fn()} />);
    const btn = screen.getByRole("button", { name: /remove foo\/bar/i });
    btn.focus();
    fireKeyDown(btn, "Backspace");
    expect(onRemove).toHaveBeenCalledWith("foo/bar");
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: /repo input/i }));
  });

  it("Delete calls onRemove with the repo and focuses the input", () => {
    const onRemove = vi.fn();
    render(<Fixture repos={["foo/bar"]} onRemove={onRemove} onLeaveField={vi.fn()} />);
    const btn = screen.getByRole("button", { name: /remove foo\/bar/i });
    btn.focus();
    fireKeyDown(btn, "Delete");
    expect(onRemove).toHaveBeenCalledWith("foo/bar");
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: /repo input/i }));
  });
});
