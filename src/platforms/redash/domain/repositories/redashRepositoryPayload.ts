export type RedashQueryPayload = {
  id: number;
  name: string;
  description: string;
  query: string;
  query_hash: string;
  version: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  is_archived: boolean;
  is_draft: boolean;
  schedule: {
    interval: number;
    until: string | null;
    day_of_week: number | null;
    time: string | null;
  } | null;
  options: {
    parameters: Array<{
      name: string;
      title: string;
      type: string;
      value: any;
      global: boolean;
    }>;
  };
  data_source_id: number;
  latest_query_data_id: number | null;
  tags: string[];
  is_favorite: boolean;
  is_trashed: boolean;
  created_at: string;
  updated_at: string;
  retrieved_at: string | null;
};

export type RedashQueryResultPayload = {
  query_result: {
    id: number;
    query_hash: string;
    query: string;
    data: {
      columns: Array<{
        name: string;
        friendly_name: string;
        type: string;
      }>;
      rows: Array<Record<string, any>>;
    };
    data_source_id: number;
    runtime: number;
    retrieved_at: string;
  };
};

export type RedashJobPayload = {
  job: {
    id: string;
    status: number; // 1=PENDING, 2=STARTED, 3=SUCCESS, 4=FAILURE
    query_result_id?: number;
    error?: string;
  };
};

export type RedashExecuteSqlPayload = {
  columns: Array<{
    name: string;
    friendly_name: string;
    type: string;
  }>;
  rows: Array<Record<string, any>>;
  runtime: number;
  retrieved_at: string;
};

export type RedashDataSourcePayload = {
  id: number;
  name: string;
  type: string;
  syntax: string;
  paused: number;
  pause_reason: string | null;
  queue_name: string;
  scheduled_queue_name: string;
  options: Record<string, any>;
  groups: {
    [key: string]: boolean;
  };
  view_only: boolean;
};

export type RedashDashboardPayload = {
  id: number;
  slug: string;
  name: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  layout: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    i: string;
    widget: {
      id: number;
      width: number;
      options: Record<string, any>;
      visualization: {
        type: string;
        name: string;
        description: string;
        options: Record<string, any>;
        query: {
          id: number;
          name: string;
          query: string;
        };
      };
    };
  }>;
  dashboard_filters_enabled: boolean;
  is_archived: boolean;
  is_draft: boolean;
  tags: string[];
  is_favorite: boolean;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
};

export type RedashWidgetPayload = {
  id: number;
  width: number;
  options: Record<string, any>;
  visualization: {
    type: string;
    name: string;
    description: string;
    options: Record<string, any>;
    query: {
      id: number;
      name: string;
      query: string;
    };
  };
  text: string;
  created_at: string;
  updated_at: string;
};

export type RedashUserPayload = {
  id: number;
  name: string;
  email: string;
  profile_image_url: string;
  groups: number[];
  active_at: string;
  disabled_at: string | null;
  is_disabled: boolean;
  is_invitation_pending: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type RedashAlertPayload = {
  id: number;
  name: string;
  options: {
    column: string;
    op: string;
    value: number;
  };
  state: "unknown" | "ok" | "triggered";
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
  rearm: number;
  query: {
    id: number;
    name: string;
    query: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
};
