import type { ColumnConfig, ColumnType } from "@/types";

export function applyAdd(
  d: ColumnConfig[],
  id: string,
  type: ColumnType,
  title: string,
  query?: string,
): void {
  d.push({ id, type, title, ...(query ? { query } : {}) });
}

export function applyRemove(d: ColumnConfig[], id: string): void {
  const i = d.findIndex((c) => c.id === id);
  if (i >= 0) d.splice(i, 1);
}

export function applyMoveLeft(d: ColumnConfig[], id: string): void {
  const i = d.findIndex((c) => c.id === id);
  if (i > 0) [d[i - 1], d[i]] = [d[i]!, d[i - 1]!];
}

export function applyMoveRight(d: ColumnConfig[], id: string): void {
  const i = d.findIndex((c) => c.id === id);
  if (i >= 0 && i < d.length - 1) [d[i], d[i + 1]] = [d[i + 1]!, d[i]!];
}

export function applyUpdateQuery(d: ColumnConfig[], id: string, query: string): void {
  const col = d.find((c) => c.id === id);
  if (col) col.query = query || undefined;
}
