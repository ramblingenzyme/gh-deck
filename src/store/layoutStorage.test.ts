import { describe, it, expect, beforeEach } from 'vitest';
import { loadLayout, saveLayout } from './layoutStorage';
import { DEFAULT_COLUMNS } from '@/constants';
import type { ColumnConfig } from '@/types';

const STORAGE_KEY = 'gh-deck:layout';

beforeEach(() => {
  localStorage.clear();
});

describe('loadLayout', () => {
  it('returns DEFAULT_COLUMNS when localStorage is empty', () => {
    expect(loadLayout()).toEqual(DEFAULT_COLUMNS);
  });

  it('returns DEFAULT_COLUMNS when localStorage contains invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{{{');
    expect(loadLayout()).toEqual(DEFAULT_COLUMNS);
  });

  it('returns stored columns when valid JSON is present', () => {
    const cols: ColumnConfig[] = [{ id: 42, type: 'prs', title: 'My PRs' }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
    expect(loadLayout()).toEqual(cols);
  });
});

describe('saveLayout + loadLayout round-trip', () => {
  it('persists and restores a custom layout', () => {
    const cols: ColumnConfig[] = [
      { id: 10, type: 'ci', title: 'Build' },
      { id: 11, type: 'issues', title: 'Bugs' },
    ];
    saveLayout(cols);
    expect(loadLayout()).toEqual(cols);
  });

  it('last saveLayout call wins', () => {
    const first: ColumnConfig[] = [{ id: 1, type: 'prs', title: 'First' }];
    const second: ColumnConfig[] = [{ id: 2, type: 'activity', title: 'Second' }];
    saveLayout(first);
    saveLayout(second);
    expect(loadLayout()).toEqual(second);
  });
});
