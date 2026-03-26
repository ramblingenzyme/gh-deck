import { describe, it, expect } from "vitest";
import { parseQuery, matchesTokens, ciTokens, deploymentTokens } from "@/utils/queryFilter";
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

// ─── Bug 3: unknown filter keys must not silently pass ───────────────────────

describe("matchesTokens — unknown filter keys return false (bug fix)", () => {
  it("typo authr: does not match everything", () => {
    expect(matches(basePR, "authr:alice")).toBe(false);
  });

  it("stat: (not status:) does not match everything", () => {
    expect(matches(baseCI, "stat:success")).toBe(false);
  });

  it("unknown key with a non-matching value still returns false", () => {
    expect(matches(basePR, "xyz:whatever")).toBe(false);
  });

  it("unknown key does not override a valid token that would fail", () => {
    // repo:acme/api matches, xyz:foo should cause the whole query to fail
    expect(matches(basePR, "repo:acme/api xyz:foo")).toBe(false);
  });
});

// ─── Known filter keys still work ────────────────────────────────────────────

describe("matchesTokens — repo:", () => {
  it("matches exact repo", () => expect(matches(basePR, "repo:acme/api")).toBe(true));
  it("no match on different repo", () => expect(matches(basePR, "repo:acme/web")).toBe(false));
});

describe("matchesTokens — author:", () => {
  it("matches author", () => expect(matches(basePR, "author:alice")).toBe(true));
  it("no match on different author", () => expect(matches(basePR, "author:bob")).toBe(false));
  it("no match on item without author field", () =>
    expect(matches(baseIssue, "author:alice")).toBe(false));
});

describe("matchesTokens — assignee:", () => {
  it("matches assignee", () => expect(matches(baseIssue, "assignee:bob")).toBe(true));
  it("no match on item without assignee", () =>
    expect(matches(basePR, "assignee:bob")).toBe(false));
});

describe("matchesTokens — label:", () => {
  it("matches label present on item", () => expect(matches(basePR, "label:bug")).toBe(true));
  it("no match for absent label", () => expect(matches(basePR, "label:enhancement")).toBe(false));
});

describe("matchesTokens — is:", () => {
  it("is:draft matches draft PR", () =>
    expect(matches({ ...basePR, status: "draft" }, "is:draft")).toBe(true));
  it("is:draft does not match non-draft", () => expect(matches(basePR, "is:draft")).toBe(false));
  it("is:open matches open issue", () => expect(matches(baseIssue, "is:open")).toBe(true));
  it("is:closed matches closed issue", () =>
    expect(matches({ ...baseIssue, state: "closed" }, "is:closed")).toBe(true));
});

describe("matchesTokens — status:", () => {
  it("matches CI status", () => expect(matches(baseCI, "status:success")).toBe(true));
  it("no match on wrong status", () => expect(matches(baseCI, "status:failure")).toBe(false));
});

describe("matchesTokens — bare text search", () => {
  it("matches title substring", () => expect(matches(basePR, "feature")).toBe(true));
  it("no match for absent text", () => expect(matches(basePR, "unrelated")).toBe(false));
});

describe("matchesTokens — multiple tokens (AND logic)", () => {
  it("all tokens must match", () =>
    expect(matches(basePR, "repo:acme/api author:alice")).toBe(true));
  it("fails when any token does not match", () =>
    expect(matches(basePR, "repo:acme/api author:bob")).toBe(false));
});

describe("matchesTokens — empty query", () => {
  it("empty token list matches everything", () => {
    expect(matchesTokens(basePR, [])).toBe(true);
    expect(matchesTokens(baseIssue, [])).toBe(true);
  });
});

describe("matchesTokens — is: unknown value", () => {
  it("is:unknown returns false (unrecognised is: values do not pass through)", () => {
    expect(matches(basePR, "is:unknown")).toBe(false);
  });
});

describe("matchesTokens — is:pr / is:pull-request", () => {
  it("is:pr matches a PRItem", () => expect(matches(basePR, "is:pr")).toBe(true));
  it("is:pr does not match IssueItem", () => expect(matches(baseIssue, "is:pr")).toBe(false));
  it("is:pull-request matches a PRItem", () =>
    expect(matches(basePR, "is:pull-request")).toBe(true));
  it("is:pull-request does not match IssueItem", () =>
    expect(matches(baseIssue, "is:pull-request")).toBe(false));
});

describe("matchesTokens — is:issue", () => {
  it("is:issue matches an IssueItem", () => expect(matches(baseIssue, "is:issue")).toBe(true));
  it("is:issue does not match PRItem", () => expect(matches(basePR, "is:issue")).toBe(false));
});

describe("matchesTokens — branch: partial match", () => {
  const featureCI: CIItem = { ...baseCI, branch: "feature/foo", type: "ci" };
  it("substring match on branch", () => expect(matches(featureCI, "branch:feature")).toBe(true));
  it("no match for non-matching substring", () =>
    expect(matches(featureCI, "branch:hotfix")).toBe(false));
});

describe("matchesTokens — assignee: null", () => {
  const issueNoAssignee: IssueItem = { ...baseIssue, assignee: null, type: "issue" };
  it("does not match when assignee is null", () =>
    expect(matches(issueNoAssignee, "assignee:bob")).toBe(false));
});

describe("matchesTokens — label: on item with no labels field", () => {
  it("does not match CIItem (no labels field)", () =>
    expect(matches(baseCI, "label:bug")).toBe(false));
});

describe("parseQuery", () => {
  it("empty string returns []", () => expect(parseQuery("")).toEqual([]));
  it("leading/trailing spaces are trimmed", () =>
    expect(parseQuery("  repo:acme/api  ")).toEqual([{ key: "repo", value: "acme/api" }]));
});

// ─── PRItem new filters ───────────────────────────────────────────────────────

describe("matchesTokens — PR assignee:", () => {
  it("matches PR with assignee", () =>
    expect(matches({ ...basePR, assignee: "carol" }, "assignee:carol")).toBe(true));
  it("no match when assignee differs", () =>
    expect(matches({ ...basePR, assignee: "carol" }, "assignee:alice")).toBe(false));
  it("no match when PR has no assignee", () =>
    expect(matches(basePR, "assignee:alice")).toBe(false));
});

describe("matchesTokens — PR is:open / is:closed", () => {
  it("is:open matches open PR", () => expect(matches(basePR, "is:open")).toBe(true));
  it("is:closed matches closed PR", () =>
    expect(matches({ ...basePR, status: "closed" }, "is:closed")).toBe(true));
  it("is:open does not match closed PR", () =>
    expect(matches({ ...basePR, status: "closed" }, "is:open")).toBe(false));
});

// ─── CIItem triggered: ────────────────────────────────────────────────────────

describe("matchesTokens — triggered:", () => {
  it("matches CI trigger", () => expect(matches(baseCI, "triggered:push")).toBe(true));
  it("no match on wrong trigger", () => expect(matches(baseCI, "triggered:release")).toBe(false));
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

describe("matchesTokens — environment:", () => {
  it("exact match on environment", () =>
    expect(matches(baseDeployment, "environment:production")).toBe(true));
  it("no match on wrong environment", () =>
    expect(matches(baseDeployment, "environment:staging")).toBe(false));
});

describe("matchesTokens — creator:", () => {
  it("matches creator", () => expect(matches(baseDeployment, "creator:carol")).toBe(true));
  it("no match on wrong creator", () =>
    expect(matches(baseDeployment, "creator:alice")).toBe(false));
});

describe("matchesTokens — deployment ref:", () => {
  it("substring match on deployment ref", () =>
    expect(matches(baseDeployment, "ref:mai")).toBe(true));
  it("no match for non-matching ref", () =>
    expect(matches(baseDeployment, "ref:feature")).toBe(false));
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

describe("matchesTokens — issue repo: and label:", () => {
  it("repo: matches issue", () => expect(matches(baseIssue, "repo:acme/web")).toBe(true));
  it("label: matches issue label", () => expect(matches(baseIssue, "label:bug")).toBe(true));
  it("unknown key on issue returns false", () => expect(matches(baseIssue, "xyz:foo")).toBe(false));
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
  it("bare text matches issue title", () => expect(matches(baseIssue, "crash")).toBe(true));
  it("bare text matches CI name", () => expect(matches(baseCI, "ci")).toBe(true));
  it("bare text matches activity text", () => expect(matches(baseActivity, "commits")).toBe(true));
  it("bare text matches release tag", () => expect(matches(baseRelease, "v1.2.0")).toBe(true));
  it("bare text matches deployment environment", () =>
    expect(matches(baseDeployment, "production")).toBe(true));
});

// ─── ciTokens ─────────────────────────────────────────────────────────────────

describe("ciTokens", () => {
  it("server contains API-accepted keys (branch, status, triggered, actor)", () => {
    const { server } = ciTokens(parseQuery("branch:main status:success actor:alice repo:acme/api"));
    expect(server).toEqual([
      { key: "branch", value: "main" },
      { key: "status", value: "success" },
      { key: "actor", value: "alice" },
    ]);
  });

  it("client excludes server-only keys (actor) but keeps dual-purpose keys", () => {
    const { client } = ciTokens(parseQuery("branch:main status:success actor:alice repo:acme/api"));
    expect(client).toEqual([
      { key: "branch", value: "main" },
      { key: "status", value: "success" },
      { key: "repo", value: "acme/api" },
    ]);
  });

  it("bare text goes to client only", () => {
    const { server, client } = ciTokens(parseQuery("branch:main sometext"));
    expect(server).toEqual([{ key: "branch", value: "main" }]);
    expect(client).toEqual([
      { key: "branch", value: "main" },
      { key: "", value: "sometext" },
    ]);
  });

  it("empty query produces empty server and client", () => {
    const { server, client } = ciTokens(parseQuery(""));
    expect(server).toEqual([]);
    expect(client).toEqual([]);
  });
});

// ─── deploymentTokens ─────────────────────────────────────────────────────────

describe("deploymentTokens", () => {
  it("server contains API-accepted keys (ref, environment, sha, task)", () => {
    const { server } = deploymentTokens(parseQuery("environment:prod sha:abc status:success"));
    expect(server).toEqual([
      { key: "environment", value: "prod" },
      { key: "sha", value: "abc" },
    ]);
  });

  it("client excludes server-only keys (sha, task) but keeps dual-purpose keys", () => {
    const { client } = deploymentTokens(
      parseQuery("environment:prod sha:abc status:success task:deploy"),
    );
    expect(client).toEqual([
      { key: "environment", value: "prod" },
      { key: "status", value: "success" },
    ]);
  });

  it("empty query produces empty server and client", () => {
    const { server, client } = deploymentTokens(parseQuery(""));
    expect(server).toEqual([]);
    expect(client).toEqual([]);
  });
});
