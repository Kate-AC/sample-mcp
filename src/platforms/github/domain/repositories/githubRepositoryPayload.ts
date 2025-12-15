export type GitHubPullRequestCommentPayload = {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  body: string;
  user: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    type: string;
  };
  created_at: string;
  updated_at: string;
};

export type GitHubRepositoryInfoPayload = {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  owner: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    url: string;
    html_url: string;
    type: string;
    site_admin: boolean;
  };
  html_url: string;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  clone_url: string;
  git_url: string;
  ssh_url: string;
  svn_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks_count: number;
  mirror_url: string | null;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: any | null;
  allow_forking: boolean;
  is_template: boolean;
  web_commit_signoff_required: boolean;
  topics: string[];
  visibility: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  permissions?: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  temp_clone_token?: string;
  allow_squash_merge: boolean;
  allow_merge_commit: boolean;
  allow_rebase_merge: boolean;
  allow_auto_merge: boolean;
  delete_branch_on_merge: boolean;
  allow_update_branch: boolean;
  use_squash_pr_title_as_default: boolean;
  squash_merge_commit_message: string;
  squash_merge_commit_title: string;
  merge_commit_message: string;
  merge_commit_title: string;
  custom_properties: Record<string, any>;
  organization?: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    url: string;
    html_url: string;
    type: string;
    site_admin: boolean;
  };
  network_count: number;
  subscribers_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
};

export type GitHubFileContentPayload = {
  content: string;
  encoding: string;
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
  url: string;
  download_url: string | null;
  git_url: string;
  html_url: string;
};

export type GitHubDirectoryItemPayload = {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
};

export type GitHubPullRequestPayload = {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  head: {
    ref: string;
    repo: {
      full_name: string;
    };
  };
  base: {
    ref: string;
    repo: {
      full_name: string;
    };
  };
  mergeable: boolean | null;
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  html_url: string;
};

export type GitHubPullRequestFilePayload = {
  sha: string;
  filename: string;
  status:
    | "added"
    | "modified"
    | "removed"
    | "renamed"
    | "copied"
    | "changed"
    | "unchanged";
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch: string | null;
};

export type GitHubPullRequestDiffPayload = {
  diff: string;
  pullRequestNumber: number;
  pullRequestTitle: string;
  baseRef: string;
  headRef: string;
};

export type GitHubCodeSearchItemPayload = {
  name: string;
  path: string;
  sha: string;
  url: string;
  git_url: string;
  html_url: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
  };
  score: number;
  text_matches?: Array<{
    object_url: string;
    object_type: string;
    property: string;
    fragment: string;
    matches: Array<{
      text: string;
      indices: number[];
    }>;
  }>;
};

export type GitHubCodeSearchPayload = {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubCodeSearchItemPayload[];
};

export type GitHubIssueSearchItemPayload = {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  pull_request?: {
    url: string;
    html_url: string;
  };
};

export type GitHubIssueSearchPayload = {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubIssueSearchItemPayload[];
};

export type GitHubLabelPayload = {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  description: string | null;
  default: boolean;
};

export type GitHubPullRequestListItemPayload = {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  draft: boolean;
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  head: {
    ref: string;
    repo: {
      full_name: string;
    };
  };
  base: {
    ref: string;
    repo: {
      full_name: string;
    };
  };
  html_url: string;
};
