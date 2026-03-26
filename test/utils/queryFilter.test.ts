import { describe, it, expect } from "vitest";
import {
  parseQuery,
  matchesTokens,
  matchesDemoTokens,
  ciTokens,
  deploymentTokens,
  COLUMN_FILTERS,
} from "@/utils/queryFilter";
import type { PRItem, IssueItem, CIItem, ActivityItem, ReleaseItem, DeploymentItem } from "@/types";

const basePR: PRItem = {
  type: "pr",
  id: 1,
  title: "Add feature",
  repo: "acme/api",
  author: "alice",
  assignee: null,
  number: 42,
  reviews: { approved: 1, requested: 0 },
  comments: 2,
  status: "open",
  age: "1h",
  labels: [
    { name: "bug", color: "d73a4a" },
    { name: "urgent", color: "fca5a5" },
  ],
  url: "https://github.com/acme/api/pull/42",
};

const baseIssue: IssueItem = {
  type: "issue",
  id: 2,
  title: "Fix crash",
  repo: "acme/web",
  number: 7,
  labels: [{ name: "bug", color: "d73a4a" }],
  assignee: "bob",
  comments: 0,
  age: "2d",
  state: "open",
  url: "https://github.com/acme/web/issues/7",
};

const baseCI: CIItem = {
  type: "ci",
  id: 3,
  name: "CI",
  repo: "acme/api",
  branch: "main",
  status: "success",
  duration: "1m",
  age: "30m",
  triggered: "push",
  url: "https://github.com/acme/api/actions/runs/3",
};

const baseActivity: ActivityItem = {
  type: "activity",
  id: 4,
  kind: "commit",
  text: "Pushed 2 commits to main",
  repo: "acme/api",
  age: "1h",
  ref: "abc1234",
  url: "https://github.com/acme/api/commit/abc1234",
};

const baseRelease: ReleaseItem = {
  type: "release",
  id: 5,
  repo: "acme/api",
  tag: "v1.2.0",
  name: "Release 1.2.0",
  prerelease: false,
  age: "1d",
  url: "https://github.com/acme/api/releases/tag/v1.2.0",
};

const baseDeployment: DeploymentItem = {
  type: "deployment",
  id: 6,
  repo: "acme/api",
  environment: "production",
  status: "success",
  ref: "main",
  creator: "carol",
  age: "2h",
  url: "https://github.com/acme/api/deployments",
};

function tokens(query: string) {
  return parseQuery(query);
}

function matches(item: Parameters<typeof matchesTokens>[0], query: string) {
  return matchesTokens(item, tokens(query));
}

// matchesDemoTokens handles all item types including PR and Issue
function matchesDemo(item: Parameters<typeof matchesDemoTokens>[0], query: string) {
  return matchesDemoTokens(item, tokens(query));
}

// ─── Bug 3: unknown filter keys must not silently pass ───────────────────────

describe("matchesDemoTokens — unknown filter keys return false (bug fix)", () => {
  it("typo authr: does not match everything", () => {
    expect(matchesDemo(basePR, "authr:alice")).toBe(false);
  });

  it("stat: (not status:) does not match everything", () => {
    expect(matchesDemo(baseCI, "stat:success")).toBe(false);
  });

  it("unknown key with a non-matching value still returns false", () => {
    expect(matchesDemo(basePR, "xyz:whatever")).toBe(false);
  });

  it("unknown key does not override a valid token that would fail", () => {
    // repo:acme/api matches, xyz:foo should cause the whole query to fail
    expect(matchesDemo(basePR, "repo:acme/api xyz:foo")).toBe(false);
  });
});

// ─── Known filter keys still work ────────────────────────────────────────────

describe("matchesDemoTokens — repo:", () => {
  it("matches exact repo", () => expect(matchesDemo(basePR, "repo:acme/api")).toBe(true));
  it("no match on different repo", () => expect(matchesDemo(basePR, "repo:acme/web")).toBe(false));
});

describe("matchesDemoTokens — author:", () => {
  it("matches author", () => expect(matchesDemo(basePR, "author:alice")).toBe(true));
  it("no match on different author", () => expect(matchesDemo(basePR, "author:bob")).toBe(false));
  it("no match on item without author field", () =>
    expect(matchesDemo(baseIssue, "author:alice")).toBe(false));
});

describe("matchesDemoTokens — assignee:", () => {
  it("matches assignee", () => expect(matchesDemo(baseIssue, "assignee:bob")).toBe(true));
  it("no match on item without assignee", () =>
    expect(matchesDemo(basePR, "assignee:bob")).toBe(false));
});

describe("matchesDemoTokens — label:", () => {
  it("matches label present on item", () => expect(matchesDemo(basePR, "label:bug")).toBe(true));
  it("no match for absent label", () =>
    expect(matchesDemo(basePR, "label:enhancement")).toBe(false));
});

describe("matchesDemoTokens — is:", () => {
  it("is:draft matches draft PR", () =>
    expect(matchesDemo({ ...basePR, status: "draft" }, "is:draft")).toBe(true));
  it("is:draft does not match non-draft", () =>
    expect(matchesDemo(basePR, "is:draft")).toBe(false));
  it("is:open matches open issue", () => expect(matchesDemo(baseIssue, "is:open")).toBe(true));
  it("is:closed matches closed issue", () =>
    expect(matchesDemo({ ...baseIssue, state: "closed" }, "is:closed")).toBe(true));
});

describe("matchesTokens — status:", () => {
  it("matches CI status", () => expect(matches(baseCI, "status:success")).toBe(true));
  it("no match on wrong status", () => expect(matches(baseCI, "status:failure")).toBe(false));
});

describe("matchesDemoTokens — bare text search", () => {
  it("matches title substring", () => expect(matchesDemo(basePR, "feature")).toBe(true));
  it("no match for absent text", () => expect(matchesDemo(basePR, "unrelated")).toBe(false));
});

describe("matchesDemoTokens — multiple tokens (AND logic)", () => {
  it("all tokens must match", () =>
    expect(matchesDemo(basePR, "repo:acme/api author:alice")).toBe(true));
  it("fails when any token does not match", () =>
    expect(matchesDemo(basePR, "repo:acme/api author:bob")).toBe(false));
});

describe("matchesDemoTokens — empty query", () => {
  it("empty token list matches everything", () => {
    expect(matchesDemoTokens(basePR, [])).toBe(true);
    expect(matchesDemoTokens(baseIssue, [])).toBe(true);
  });
});

describe("matchesDemoTokens — is: unknown value", () => {
  it("is:unknown returns false (unrecognised is: values do not pass through)", () => {
    expect(matchesDemo(basePR, "is:unknown")).toBe(false);
  });
});

describe("matchesDemoTokens — is:pr / is:pull-request", () => {
  it("is:pr matches a PRItem", () => expect(matchesDemo(basePR, "is:pr")).toBe(true));
  it("is:pr does not match IssueItem", () => expect(matchesDemo(baseIssue, "is:pr")).toBe(false));
  it("is:pull-request matches a PRItem", () =>
    expect(matchesDemo(basePR, "is:pull-request")).toBe(true));
  it("is:pull-request does not match IssueItem", () =>
    expect(matchesDemo(baseIssue, "is:pull-request")).toBe(false));
});

describe("matchesDemoTokens — is:issue", () => {
  it("is:issue matches an IssueItem", () => expect(matchesDemo(baseIssue, "is:issue")).toBe(true));
  it("is:issue does not match PRItem", () => expect(matchesDemo(basePR, "is:issue")).toBe(false));
});

describe("matchesTokens — branch: is server-side only, passes through client filter", () => {
  const featureCI: CIItem = { ...baseCI, branch: "feature/foo", type: "ci" };
  it("branch: passes through — handled server-side", () =>
    expect(matches(featureCI, "branch:feature")).toBe(true));
  it("branch: passes through even for non-matching value", () =>
    expect(matches(featureCI, "branch:hotfix")).toBe(true));
});

describe("matchesDemoTokens — assignee: null", () => {
  const issueNoAssignee: IssueItem = { ...baseIssue, assignee: null, type: "issue" };
  it("does not match when assignee is null", () =>
    expect(matchesDemo(issueNoAssignee, "assignee:bob")).toBe(false));
});

describe("matchesDemoTokens — label: on item with no labels field", () => {
  it("does not match CIItem (no labels field)", () =>
    expect(matchesDemo(baseCI, "label:bug")).toBe(false));
});

describe("parseQuery", () => {
  it("empty string returns []", () => expect(parseQuery("")).toEqual([]));
  it("leading/trailing spaces are trimmed", () =>
    expect(parseQuery("  repo:acme/api  ")).toEqual([
      { key: "repo", value: "acme/api", negate: false },
    ]));
  it("negated key:value token", () =>
    expect(parseQuery("-status:failure")).toEqual([
      { key: "status", value: "failure", negate: true },
    ]));
  it("negated bare text token", () =>
    expect(parseQuery("-bug")).toEqual([{ key: "", value: "bug", negate: true }]));
  it("mixed negated and normal tokens", () =>
    expect(parseQuery("repo:acme/api -status:failure")).toEqual([
      { key: "repo", value: "acme/api", negate: false },
      { key: "status", value: "failure", negate: true },
    ]));
});

// ─── PRItem new filters ───────────────────────────────────────────────────────

describe("matchesDemoTokens — PR assignee:", () => {
  it("matches PR with assignee", () =>
    expect(matchesDemo({ ...basePR, assignee: "carol" }, "assignee:carol")).toBe(true));
  it("no match when assignee differs", () =>
    expect(matchesDemo({ ...basePR, assignee: "carol" }, "assignee:alice")).toBe(false));
  it("no match when PR has no assignee", () =>
    expect(matchesDemo(basePR, "assignee:alice")).toBe(false));
});

describe("matchesDemoTokens — PR is:open / is:closed", () => {
  it("is:open matches open PR", () => expect(matchesDemo(basePR, "is:open")).toBe(true));
  it("is:closed matches closed PR", () =>
    expect(matchesDemo({ ...basePR, status: "closed" }, "is:closed")).toBe(true));
  it("is:open does not match closed PR", () =>
    expect(matchesDemo({ ...basePR, status: "closed" }, "is:open")).toBe(false));
});

// ─── CIItem triggered: ────────────────────────────────────────────────────────

describe("matchesTokens — triggered: is server-side only, passes through client filter", () => {
  it("triggered: passes through — handled server-side", () =>
    expect(matches(baseCI, "triggered:push")).toBe(true));
  it("triggered: passes through even for non-matching value", () =>
    expect(matches(baseCI, "triggered:release")).toBe(true));
});

// ─── ActivityItem ─────────────────────────────────────────────────────────────

describe("matchesTokens — activity ref:", () => {
  it("substring match on ref", () => expect(matches(baseActivity, "ref:abc")).toBe(true));
  it("no match for non-matching ref", () => expect(matches(baseActivity, "ref:xyz")).toBe(false));
  it("no match when ref is absent", () =>
    expect(matches({ ...baseActivity, ref: undefined }, "ref:abc")).toBe(false));
});

describe("matchesTokens — activity type:", () => {
  it("matches activity kind", () => expect(matches(baseActivity, "type:commit")).toBe(true));
  it("no match on wrong kind", () => expect(matches(baseActivity, "type:review")).toBe(false));
});

// ─── ReleaseItem ──────────────────────────────────────────────────────────────

describe("matchesTokens — tag:", () => {
  it("exact match on tag", () => expect(matches(baseRelease, "tag:v1.2.0")).toBe(true));
  it("no match on wrong tag", () => expect(matches(baseRelease, "tag:v1.0.0")).toBe(false));
});

describe("matchesTokens — is:prerelease", () => {
  it("is:prerelease matches prerelease", () =>
    expect(matches({ ...baseRelease, prerelease: true }, "is:prerelease")).toBe(true));
  it("is:prerelease does not match stable release", () =>
    expect(matches(baseRelease, "is:prerelease")).toBe(false));
});

// ─── DeploymentItem ───────────────────────────────────────────────────────────

describe("matchesTokens — environment: is server-side only, passes through client filter", () => {
  it("environment: passes through — handled server-side", () =>
    expect(matches(baseDeployment, "environment:production")).toBe(true));
  it("environment: passes through even for non-matching value", () =>
    expect(matches(baseDeployment, "environment:staging")).toBe(true));
});

describe("matchesTokens — creator:", () => {
  it("matches creator", () => expect(matches(baseDeployment, "creator:carol")).toBe(true));
  it("no match on wrong creator", () =>
    expect(matches(baseDeployment, "creator:alice")).toBe(false));
});

describe("matchesTokens — deployment ref: is server-side only, passes through client filter", () => {
  it("ref: passes through — handled server-side", () =>
    expect(matches(baseDeployment, "ref:mai")).toBe(true));
  it("ref: passes through even for non-matching value", () =>
    expect(matches(baseDeployment, "ref:feature")).toBe(true));
});

describe("matchesTokens — deployment status:", () => {
  it("matches deployment status", () =>
    expect(matches(baseDeployment, "status:success")).toBe(true));
  it("no match on wrong status", () =>
    expect(matches(baseDeployment, "status:failure")).toBe(false));
});

describe("matchesTokens — deployment repo:", () => {
  it("matches repo on deployment", () =>
    expect(matches(baseDeployment, "repo:acme/api")).toBe(true));
  it("unknown key on deployment returns false", () =>
    expect(matches(baseDeployment, "xyz:foo")).toBe(false));
});

describe("matchesTokens — deployment sha: and task: (server-side only)", () => {
  it("sha: passes through client filter — handled server-side", () =>
    expect(matches(baseDeployment, "sha:abc123")).toBe(true));
  it("task: passes through client filter — handled server-side", () =>
    expect(matches(baseDeployment, "task:deploy")).toBe(true));
  it("sha: combined with status: still applies status check", () =>
    expect(matches(baseDeployment, "sha:abc123 status:failure")).toBe(false));
});

describe("matchesTokens — release is: and unknown key", () => {
  it("is:unknown returns false for release", () =>
    expect(matches(baseRelease, "is:unknown")).toBe(false));
  it("unknown key on release returns false", () =>
    expect(matches(baseRelease, "xyz:foo")).toBe(false));
  it("repo: matches release", () => expect(matches(baseRelease, "repo:acme/api")).toBe(true));
});

describe("matchesDemoTokens — issue repo: and label:", () => {
  it("repo: matches issue", () => expect(matchesDemo(baseIssue, "repo:acme/web")).toBe(true));
  it("label: matches issue label", () => expect(matchesDemo(baseIssue, "label:bug")).toBe(true));
  it("unknown key on issue returns false", () =>
    expect(matchesDemo(baseIssue, "xyz:foo")).toBe(false));
});

describe("matchesTokens — CI repo:", () => {
  it("repo: matches CI item", () => expect(matches(baseCI, "repo:acme/api")).toBe(true));
  it("unknown key on CI returns false", () => expect(matches(baseCI, "xyz:foo")).toBe(false));
});

describe("matchesTokens — CI actor: (server-side only)", () => {
  it("actor: passes through client filter — handled server-side", () =>
    expect(matches(baseCI, "actor:anyone")).toBe(true));
  it("actor: combined with repo: still applies repo check", () =>
    expect(matches(baseCI, "repo:acme/api actor:anyone")).toBe(true));
});

describe("matchesTokens — activity repo: and unknown key", () => {
  it("repo: matches activity item", () =>
    expect(matches(baseActivity, "repo:acme/api")).toBe(true));
  it("unknown key on activity returns false", () =>
    expect(matches(baseActivity, "xyz:foo")).toBe(false));
});

describe("matchesTokens — bare text search on non-PR types", () => {
  it("bare text matches issue title", () => expect(matchesDemo(baseIssue, "crash")).toBe(true));
  it("bare text matches CI name", () => expect(matches(baseCI, "ci")).toBe(true));
  it("bare text matches CI branch", () => expect(matches(baseCI, "main")).toBe(true));
  it("bare text matches CI status", () => expect(matches(baseCI, "success")).toBe(true));
  it("bare text matches activity text", () => expect(matches(baseActivity, "commits")).toBe(true));
  it("bare text matches activity kind", () => expect(matches(baseActivity, "commit")).toBe(true));
  it("bare text matches release tag", () => expect(matches(baseRelease, "v1.2.0")).toBe(true));
  it("bare text matches release name", () => expect(matches(baseRelease, "release")).toBe(true));
  it("bare text matches deployment environment", () =>
    expect(matches(baseDeployment, "production")).toBe(true));
  it("bare text matches deployment creator", () =>
    expect(matches(baseDeployment, "carol")).toBe(true));
  it("bare text no match for absent text", () => expect(matches(baseCI, "unrelated")).toBe(false));
});

// ─── Negation ─────────────────────────────────────────────────────────────────

describe("matchesTokens — negation with - prefix", () => {
  it("-status:failure excludes failure items", () =>
    expect(matches({ ...baseCI, status: "failure" }, "-status:failure")).toBe(false));
  it("-status:failure keeps non-failure items", () =>
    expect(matches(baseCI, "-status:failure")).toBe(true));
  it("-repo:acme/api excludes matching repo", () =>
    expect(matches(baseCI, "-repo:acme/api")).toBe(false));
  it("-repo:acme/web keeps non-matching repo", () =>
    expect(matches(baseCI, "-repo:acme/web")).toBe(true));
  it("combined: repo filter and negated status", () =>
    expect(matches(baseCI, "repo:acme/api -status:failure")).toBe(true));
  it("combined: repo filter and negated status excludes when status matches", () =>
    expect(matches({ ...baseCI, status: "failure" }, "repo:acme/api -status:failure")).toBe(false));
  it("negated bare text excludes matching items", () => expect(matches(baseCI, "-ci")).toBe(false));
  it("negated bare text keeps non-matching items", () =>
    expect(matches(baseCI, "-unrelated")).toBe(true));
  it("negated label excludes matching label (demo)", () =>
    expect(matchesDemo(basePR, "-label:bug")).toBe(false));
  it("negated label keeps non-matching label (demo)", () =>
    expect(matchesDemo(basePR, "-label:enhancement")).toBe(true));
});

// ─── ciTokens ─────────────────────────────────────────────────────────────────

describe("ciTokens", () => {
  it("server contains server-scoped keys (branch, triggered, actor)", () => {
    const { server } = ciTokens(parseQuery("branch:main status:success actor:alice repo:acme/api"));
    expect(server).toEqual([
      { key: "branch", value: "main", negate: false },
      { key: "actor", value: "alice", negate: false },
    ]);
  });

  it("client contains client-scoped keys (status, repo) and excludes server keys", () => {
    const { client } = ciTokens(parseQuery("branch:main status:success actor:alice repo:acme/api"));
    expect(client).toEqual([
      { key: "status", value: "success", negate: false },
      { key: "repo", value: "acme/api", negate: false },
    ]);
  });

  it("bare text goes to client only", () => {
    const { server, client } = ciTokens(parseQuery("branch:main sometext"));
    expect(server).toEqual([{ key: "branch", value: "main", negate: false }]);
    expect(client).toEqual([{ key: "", value: "sometext", negate: false }]);
  });

  it("empty query produces empty server and client", () => {
    const { server, client } = ciTokens(parseQuery(""));
    expect(server).toEqual([]);
    expect(client).toEqual([]);
  });
});

// ─── deploymentTokens ─────────────────────────────────────────────────────────

describe("deploymentTokens", () => {
  it("server contains server-scoped keys (environment, ref, sha, task)", () => {
    const { server } = deploymentTokens(parseQuery("environment:prod sha:abc status:success"));
    expect(server).toEqual([
      { key: "environment", value: "prod", negate: false },
      { key: "sha", value: "abc", negate: false },
    ]);
  });

  it("client contains client-scoped keys (status) and excludes server keys", () => {
    const { client } = deploymentTokens(
      parseQuery("environment:prod sha:abc status:success task:deploy"),
    );
    expect(client).toEqual([{ key: "status", value: "success", negate: false }]);
  });

  it("empty query produces empty server and client", () => {
    const { server, client } = deploymentTokens(parseQuery(""));
    expect(server).toEqual([]);
    expect(client).toEqual([]);
  });
});
