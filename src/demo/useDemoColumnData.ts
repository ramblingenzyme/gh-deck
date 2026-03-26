import { useMemo } from "preact/hooks";
import type { ColumnConfig, KnownItem, AnyItem } from "@/types";
import type { UseColumnDataResult } from "@/hooks/useColumnData";
import { parseQuery, matchesDemoTokens } from "@/utils/queryFilter";
import {
  MOCK_PRS,
  MOCK_ISSUES,
  MOCK_CI,
  MOCK_ACTIVITY,
  MOCK_RELEASES,
  MOCK_DEPLOYMENTS,
} from "./mock";

const DEMO_DATA: Partial<Record<ColumnConfig["type"], AnyItem[]>> = {
  prs: MOCK_PRS,
  issues: MOCK_ISSUES,
  ci: MOCK_CI,
  activity: MOCK_ACTIVITY,
  releases: MOCK_RELEASES,
  deployments: MOCK_DEPLOYMENTS,
};

const noop = () => {};
const EMPTY: AnyItem[] = [];

export function useDemoColumnData(col: ColumnConfig): UseColumnDataResult {
  const tokens = useMemo(() => parseQuery(col.query ?? ""), [col.query]);
  const raw = DEMO_DATA[col.type] ?? EMPTY;
  const repos = col.repos;
  const data = useMemo(() => {
    let items = raw;
    if (repos && repos.length > 0)
      items = items.filter((item) => "repo" in item && repos.includes((item as KnownItem).repo));
    if (tokens.length) items = items.filter((item) => matchesDemoTokens(item as KnownItem, tokens));
    return items;
  }, [raw, repos, tokens]);
  return { data, isLoading: false, isFetching: false, error: null, warnings: [], refetch: noop };
}
