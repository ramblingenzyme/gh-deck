export type ColumnType = "prs" | "issues" | "ci" | "activity" | "releases" | "deployments";

export type CIStatus = "success" | "failure" | "running";
export type PRStatus = "open" | "draft" | "merged" | "closed";
export type IssueState = "open" | "closed";
export type CITrigger = string;
export type ActivityType =
  | "commit"
  | "comment"
  | "pr_opened"
  | "pr_merged"
  | "review"
  | "issue_closed"
  | "branch_created"
  | "fork"
  | "star";

export interface ColumnConfig {
  id: string;
  type: ColumnType;
  title: string;
  repos?: string[];
  query?: string;
}

export const REVIEW_COUNT_UNKNOWN = "?" as const;
export type ReviewCount = number | typeof REVIEW_COUNT_UNKNOWN;

export interface PRItem {
  type: "pr";
  id: number;
  title: string;
  repo: string;
  author: string;
  assignee: string | null;
  number: number;
  reviews: { approved: ReviewCount; requested: ReviewCount };
  comments: number;
  status: PRStatus;
  age: string;
  labels: Label[];
  url: string;
}

export interface IssueItem {
  type: "issue";
  id: number;
  title: string;
  repo: string;
  number: number;
  labels: Label[];
  assignee: string | null;
  comments: number;
  age: string;
  state: IssueState;
  url: string;
}

export interface CIItem {
  type: "ci";
  id: number;
  name: string;
  repo: string;
  branch: string;
  status: CIStatus;
  duration: string;
  age: string;
  triggered: CITrigger;
  url: string;
}

export interface ActivityItem {
  type: "activity";
  id: number;
  kind: ActivityType;
  text: string;
  repo: string;
  age: string;
  ref?: string;
  url: string;
}

export interface Label {
  name: string;
  color: string;
}

export type DeploymentStatus = "success" | "failure" | "pending" | "in_progress" | "unknown";

export interface ReleaseItem {
  type: "release";
  id: number;
  repo: string;
  tag: string;
  name: string;
  prerelease: boolean;
  age: string;
  url: string;
}

export interface DeploymentItem {
  type: "deployment";
  id: number;
  repo: string;
  environment: string;
  status: DeploymentStatus;
  ref: string;
  creator: string;
  age: string;
  url: string;
}

export type KnownItem = PRItem | IssueItem | CIItem | ActivityItem | ReleaseItem | DeploymentItem;

export type AnyItem = KnownItem | FallbackItem;

export interface FallbackItem {
  type: "fallback";
  id: number;
  title: string;
  repo: string;
  age: string;
  url: string;
  [key: string]: unknown;
}
