export type CustomField = {
  id: number;
  name: string;
  value: string;
};

export type RedmineIssuePayload = {
  id: number;
  project: {
    id: number;
    name: string;
  };
  tracker: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  priority: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    name: string;
  };
  assigned_to?: {
    id: number;
    name: string;
  };
  subject: string;
  description: string;
  start_date: string;
  due_date?: string;
  done_ratio: number;
  is_private: boolean;
  estimated_hours?: number;
  total_estimated_hours?: number;
  spent_hours?: number;
  total_spent_hours?: number;
  custom_fields: CustomField[];
  created_on: string;
  updated_on: string;
  closed_on?: string;
  parent?: {
    id: number;
  };
  children?: Array<{
    id: number;
    tracker: {
      id: number;
      name: string;
    };
    subject: string;
    status: {
      id: number;
      name: string;
    };
    priority: {
      id: number;
      name: string;
    };
    done_ratio: number;
  }>;
  relations: Array<{
    id: number;
    issue_id: number;
    issue_to_id: number;
    relation_type: string;
    delay?: number;
  }>;
  attachments: Array<{
    id: number;
    filename: string;
    filesize: number;
    content_type: string;
    description: string;
    content_url: string;
    thumbnail_url?: string;
    author: {
      id: number;
      name: string;
    };
    created_on: string;
  }>;
  watchers: Array<{
    id: number;
    name: string;
  }>;
  journals: Array<{
    id: number;
    user: {
      id: number;
      name: string;
    };
    notes: string;
    created_on: string;
    details: Array<{
      property: string;
      name: string;
      old_value: string;
      new_value: string;
    }>;
  }>;
};

export type RedmineProjectPayload = {
  id: number;
  name: string;
  identifier: string;
  description: string;
  homepage?: string;
  status: number;
  is_public: boolean;
  parent?: {
    id: number;
    name: string;
  };
  created_on: string;
  updated_on: string;
  trackers: Array<{
    id: number;
    name: string;
  }>;
  issue_categories: Array<{
    id: number;
    name: string;
    assigned_to?: {
      id: number;
      name: string;
    };
  }>;
  enabled_modules: Array<{
    id: number;
    name: string;
  }>;
  time_entry_activities: Array<{
    id: number;
    name: string;
  }>;
  custom_fields: CustomField[];
};

export type RedmineUserPayload = {
  id: number;
  login: string;
  firstname: string;
  lastname: string;
  mail: string;
  created_on: string;
  last_login_on?: string;
  api_key?: string;
  status: number;
  custom_fields: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  memberships: Array<{
    id: number;
    project: {
      id: number;
      name: string;
    };
    roles: Array<{
      id: number;
      name: string;
    }>;
  }>;
  groups: Array<{
    id: number;
    name: string;
  }>;
};

export type RedmineTimeEntryPayload = {
  id: number;
  project: {
    id: number;
    name: string;
  };
  issue?: {
    id: number;
    subject: string;
  };
  user: {
    id: number;
    name: string;
  };
  activity: {
    id: number;
    name: string;
  };
  hours: number;
  comments: string;
  spent_on: string;
  created_on: string;
  updated_on: string;
  custom_fields: CustomField[];
};

export type RedmineWikiPagePayload = {
  title: string;
  parent?: {
    title: string;
  };
  author: {
    id: number;
    name: string;
  };
  text: string;
  comments: string;
  version: number;
  created_on: string;
  updated_on: string;
  attachments: Array<{
    id: number;
    filename: string;
    filesize: number;
    content_type: string;
    description: string;
    content_url: string;
    author: {
      id: number;
      name: string;
    };
    created_on: string;
  }>;
};

export type RedmineVersionPayload = {
  id: number;
  project: {
    id: number;
    name: string;
  };
  name: string;
  description: string;
  status: "open" | "locked" | "closed";
  due_date?: string;
  sharing: "none" | "descendants" | "hierarchy" | "tree" | "system";
  created_on: string;
  updated_on: string;
  custom_fields: CustomField[];
};

export type RedmineQueryPayload = {
  id: number;
  name: string;
  is_public: boolean;
  project?: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
  };
  created_on: string;
  updated_on: string;
  sort_criteria: Array<{
    field: string;
    direction: "asc" | "desc";
  }>;
  filters: Record<
    string,
    {
      operator: string;
      values: string[];
    }
  >;
  column_names: string[];
  group_by?: string;
  totalable_names: string[];
};
