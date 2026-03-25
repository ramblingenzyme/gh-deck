import type {
  PRItem,
  IssueItem,
  CIItem,
  ActivityItem,
  ReleaseItem,
  DeploymentItem,
  KnownItem,
} from "@/types";
import { getItemDisplayText } from "@/utils/getItemDisplayText";

/** Parse a GitHub-style query string into key:value tokens and bare terms. */
export function parseQuery(query: string): { key: string; value: string }[] {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const colon = token.indexOf(":");
      if (colon > 0) {
        return {
          key: token.slice(0, colon).toLowerCase(),
          value: token.slice(colon + 1).toLowerCase(),
        };
      }
      return { key: "", value: token.toLowerCase() };
    });
}

type Tokens = ReturnType<typeof parseQuery>;

function bareText(item: KnownItem, value: string): boolean {
  return getItemDisplayText(item).toLowerCase().includes(value);
}

function matchesPR(item: PRItem, tokens: Tokens): boolean {
  return tokens.every(({ key, value }) => {
    if (!key) return bareText(item, value);
    switch (key) {
      case "repo":
        return item.repo.toLowerCase() === value;
      case "author":
        return item.author.toLowerCase() === value;
      case "assignee":
        return item.assignee?.toLowerCase() === value;
      case "label":
        return item.labels.some((l) => l.name.toLowerCase() === value);
      case "is":
        if (value === "draft") return item.draft === true;
        if (value === "open") return item.state === "open";
        if (value === "closed") return item.state === "closed";
        if (value === "pr" || value === "pull-request") return true;
        return false;
      default:
        return false;
    }
  });
}

function matchesIssue(item: IssueItem, tokens: Tokens): boolean {
  return tokens.every(({ key, value }) => {
    if (!key) return bareText(item, value);
    switch (key) {
      case "repo":
        return item.repo.toLowerCase() === value;
      case "assignee":
        return item.assignee?.toLowerCase() === value;
      case "label":
        return item.labels.some((l) => l.name.toLowerCase() === value);
      case "is":
        if (value === "open") return item.state === "open";
        if (value === "closed") return item.state === "closed";
        if (value === "issue") return true;
        return false;
      default:
        return false;
    }
  });
}

function matchesCI(item: CIItem, tokens: Tokens): boolean {
  return tokens.every(({ key, value }) => {
    if (!key) return bareText(item, value);
    switch (key) {
      case "repo":
        return item.repo.toLowerCase() === value;
      case "status":
        return item.status.toLowerCase() === value;
      case "branch":
        return item.branch.toLowerCase().includes(value);
      case "triggered":
        return item.triggered.toLowerCase() === value;
      default:
        return false;
    }
  });
}

function matchesActivity(item: ActivityItem, tokens: Tokens): boolean {
  return tokens.every(({ key, value }) => {
    if (!key) return bareText(item, value);
    switch (key) {
      case "repo":
        return item.repo.toLowerCase() === value;
      case "ref":
        return item.ref?.toLowerCase().includes(value) ?? false;
      case "type":
        return item.kind.toLowerCase() === value;
      default:
        return false;
    }
  });
}

function matchesRelease(item: ReleaseItem, tokens: Tokens): boolean {
  return tokens.every(({ key, value }) => {
    if (!key) return bareText(item, value);
    switch (key) {
      case "repo":
        return item.repo.toLowerCase() === value;
      case "tag":
        return item.tag.toLowerCase() === value;
      case "is":
        if (value === "prerelease") return item.prerelease === true;
        return false;
      default:
        return false;
    }
  });
}

function matchesDeployment(item: DeploymentItem, tokens: Tokens): boolean {
  return tokens.every(({ key, value }) => {
    if (!key) return bareText(item, value);
    switch (key) {
      case "repo":
        return item.repo.toLowerCase() === value;
      case "status":
        return item.status.toLowerCase() === value;
      case "environment":
        return item.environment.toLowerCase() === value;
      case "creator":
        return item.creator.toLowerCase() === value;
      case "ref":
        return item.ref.toLowerCase().includes(value);
      default:
        return false;
    }
  });
}

// TODO: provide some UI guidance on supported tokens in column queries that are filtered client side
export function matchesTokens(item: KnownItem, tokens: Tokens): boolean {
  switch (item.type) {
    case "pr":
      return matchesPR(item, tokens);
    case "issue":
      return matchesIssue(item, tokens);
    case "ci":
      return matchesCI(item, tokens);
    case "activity":
      return matchesActivity(item, tokens);
    case "release":
      return matchesRelease(item, tokens);
    case "deployment":
      return matchesDeployment(item, tokens);
  }
}
