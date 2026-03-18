import { describe, it, expect, beforeEach } from "vitest";
import { produce } from "immer";
import type { ColumnConfig } from "@/types";
import {
  applyAdd,
  applyRemove,
  applyMoveLeft,
  applyMoveRight,
  applyUpdateQuery,
} from "./layoutMutations";

function apply(cols: ColumnConfig[], fn: (d: ColumnConfig[]) => void): ColumnConfig[] {
  return produce(cols, fn);
}

let cols: ColumnConfig[];

beforeEach(() => {
  cols = [
    { id: "a", type: "notifications", title: "Inbox" },
    { id: "b", type: "prs", title: "PRs" },
    { id: "c", type: "ci", title: "CI" },
  ];
});

describe("applyAdd", () => {
  it("appends a new column", () => {
    const result = apply(cols, (d) => applyAdd(d, "d", "issues", "Issues"));
    expect(result).toHaveLength(4);
    expect(result[3]).toEqual({ id: "d", type: "issues", title: "Issues" });
  });

  it("includes query when provided", () => {
    const result = apply(cols, (d) => applyAdd(d, "d", "prs", "My PRs", "author:me"));
    expect(result[3]).toEqual({ id: "d", type: "prs", title: "My PRs", query: "author:me" });
  });

  it("does not mutate the original array", () => {
    apply(cols, (d) => applyAdd(d, "d", "issues", "Issues"));
    expect(cols).toHaveLength(3);
  });
});

describe("applyRemove", () => {
  it("removes the column with the given id", () => {
    const result = apply(cols, (d) => applyRemove(d, "b"));
    expect(result).toHaveLength(2);
    expect(result.find((c) => c.id === "b")).toBeUndefined();
  });

  it("preserves order of remaining columns", () => {
    const result = apply(cols, (d) => applyRemove(d, "b"));
    expect(result.map((c) => c.id)).toEqual(["a", "c"]);
  });

  it("is a no-op when id does not exist", () => {
    const result = apply(cols, (d) => applyRemove(d, "nonexistent"));
    expect(result.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });
});

describe("applyMoveLeft", () => {
  it("moves a column one position to the left", () => {
    const result = apply(cols, (d) => applyMoveLeft(d, "b"));
    expect(result.map((c) => c.id)).toEqual(["b", "a", "c"]);
  });

  it("does not move the first column", () => {
    const result = apply(cols, (d) => applyMoveLeft(d, "a"));
    expect(result.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("preserves all column data after move", () => {
    const result = apply(cols, (d) => applyMoveLeft(d, "b"));
    expect(result[0]).toEqual({ id: "b", type: "prs", title: "PRs" });
    expect(result[1]).toEqual({ id: "a", type: "notifications", title: "Inbox" });
  });

  it("produces no duplicate ids", () => {
    const result = apply(cols, (d) => applyMoveLeft(d, "b"));
    const ids = result.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("applyMoveRight", () => {
  it("moves a column one position to the right", () => {
    const result = apply(cols, (d) => applyMoveRight(d, "b"));
    expect(result.map((c) => c.id)).toEqual(["a", "c", "b"]);
  });

  it("does not move the last column", () => {
    const result = apply(cols, (d) => applyMoveRight(d, "c"));
    expect(result.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("preserves all column data after move", () => {
    const result = apply(cols, (d) => applyMoveRight(d, "b"));
    expect(result[1]).toEqual({ id: "c", type: "ci", title: "CI" });
    expect(result[2]).toEqual({ id: "b", type: "prs", title: "PRs" });
  });

  it("produces no duplicate ids", () => {
    const result = apply(cols, (d) => applyMoveRight(d, "b"));
    const ids = result.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("applyUpdateQuery", () => {
  it("sets the query on the matching column", () => {
    const result = apply(cols, (d) => applyUpdateQuery(d, "b", "author:me"));
    expect(result.find((c) => c.id === "b")?.query).toBe("author:me");
  });

  it("clears query when empty string is given", () => {
    const withQuery = apply(cols, (d) => applyUpdateQuery(d, "b", "author:me"));
    const result = apply(withQuery, (d) => applyUpdateQuery(d, "b", ""));
    expect(result.find((c) => c.id === "b")?.query).toBeUndefined();
  });

  it("is a no-op when id does not exist", () => {
    const result = apply(cols, (d) => applyUpdateQuery(d, "nonexistent", "foo"));
    expect(result).toEqual(cols);
  });
});
