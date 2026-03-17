import type { ColumnConfig } from "@/types";
import { DEFAULT_COLUMNS } from "@/constants";

const STORAGE_KEY = "gh-deck:layout";

export function loadLayout(): ColumnConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ColumnConfig[]) : DEFAULT_COLUMNS;
  } catch {
    return DEFAULT_COLUMNS;
  }
}

export function saveLayout(columns: ColumnConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
}
