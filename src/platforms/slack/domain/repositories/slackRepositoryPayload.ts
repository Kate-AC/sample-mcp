export type SlackChannelPayload = {
  channels: {
    id: string;
    name: string;
    is_channel: boolean;
    is_group: boolean;
    is_im: boolean;
    is_mpim: boolean;
    is_private: boolean;
    created: number;
    is_archived: boolean;
    is_general: boolean;
    unlinked: number;
    name_normalized: string;
    is_shared: boolean;
    parent_conversation?: string;
    creator: string;
    is_ext_shared: boolean;
    is_org_shared: boolean;
    shared_team_ids: string[];
    pending_shared: string[];
    pending_connected_team_ids: string[];
    is_pending_ext_shared: boolean;
    is_member: boolean;
    is_open: boolean;
    topic: {
      value: string;
      creator: string;
      last_set: number;
    };
    purpose: {
      value: string;
      creator: string;
      last_set: number;
    };
    previous_names: string[];
    num_members: number;
  }[];
};

export type SlackMessagePayload = {
  type: "message";
  subtype?: string;
  text: string;
  user: string;
  username?: string;
  bot_id?: string;
  attachments?: Array<{
    fallback: string;
    color?: string;
    pretext?: string;
    author_name?: string;
    author_link?: string;
    author_icon?: string;
    title?: string;
    title_link?: string;
    text?: string;
    fields?: Array<{
      title: string;
      value: string;
      short: boolean;
    }>;
    image_url?: string;
    thumb_url?: string;
    footer?: string;
    footer_icon?: string;
    ts: number;
  }>;
  blocks?: Array<{
    type: string;
    block_id?: string;
    text?: {
      type: string;
      text: string;
    };
  }>;
  ts: string;
  thread_ts?: string;
  reply_count?: number;
  replies?: Array<{
    user: string;
    ts: string;
  }>;
  latest_reply?: string;
  subscribed?: boolean;
  last_read?: string;
  parent_user_id?: string;
  edited?: {
    user: string;
    ts: string;
  };
  reactions?: Array<{
    name: string;
    users: string[];
    count: number;
  }>;
};

export type SlackUserPayload = {
  id: string;
  team_id: string;
  name: string;
  deleted: boolean;
  color?: string;
  real_name?: string;
  tz?: string;
  tz_label?: string;
  tz_offset?: number;
  profile: {
    title?: string;
    phone?: string;
    skype?: string;
    real_name: string;
    real_name_normalized: string;
    display_name?: string;
    display_name_normalized?: string;
    fields?: Record<
      string,
      {
        value: string;
        alt: string;
      }
    >;
    status_text?: string;
    status_emoji?: string;
    status_expiration?: number;
    avatar_hash?: string;
    always_active?: boolean;
    first_name?: string;
    last_name?: string;
    image_24?: string;
    image_32?: string;
    image_48?: string;
    image_72?: string;
    image_192?: string;
    image_512?: string;
    image_1024?: string;
    status_text_canonical?: string;
    team?: string;
  };
  is_admin?: boolean;
  is_owner?: boolean;
  is_primary_owner?: boolean;
  is_restricted?: boolean;
  is_ultra_restricted?: boolean;
  is_bot?: boolean;
  is_app_user?: boolean;
  updated: number;
  is_email_confirmed?: boolean;
  who_can_share_contact_card?: string;
};

export type SlackConversationHistoryPayload = {
  ok: boolean;
  messages: SlackMessagePayload[];
  has_more: boolean;
  pin_count: number;
  response_metadata?: {
    next_cursor?: string;
  };
};

export type SlackFilePayload = {
  file: {
    id: string;
    created: number;
    timestamp: number;
    name: string;
    title: string;
    mimetype: string;
    filetype: string;
    pretty_type: string;
    user: string;
    editable: boolean;
    size: number;
    mode: string;
    is_external: boolean;
    external_type: string;
    is_public: boolean;
    public_url_shared: boolean;
    display_as_bot: boolean;
    username: string;
    url_private: string;
    url_private_download: string;
    permalink: string;
    permalink_public: string;
    thumb_64?: string;
    thumb_80?: string;
    thumb_360?: string;
    thumb_360_w?: number;
    thumb_360_h?: number;
    thumb_480?: string;
    thumb_480_w?: number;
    thumb_480_h?: number;
    thumb_160?: string;
    thumb_720?: string;
    thumb_720_w?: number;
    thumb_720_h?: number;
    thumb_800?: string;
    thumb_800_w?: number;
    thumb_800_h?: number;
    thumb_960?: string;
    thumb_960_w?: number;
    thumb_960_h?: number;
    thumb_1024?: string;
    thumb_1024_w?: number;
    thumb_1024_h?: number;
    image_exif_rotation?: number;
    original_w?: number;
    original_h?: number;
    is_starred: boolean;
    has_rich_preview: boolean;
  };
};

export type SlackFileDownloadPayload = {
  content: string;
  mimetype: string;
  size: number;
};

export type SlackPostMessagePayload = {
  ok: boolean;
  channel: string;
  ts: string;
  message: {
    text: string;
    user: string;
    type: string;
    ts: string;
  };
};

export type SlackSearchMessagesPayload = {
  ok: boolean;
  query: string;
  messages: {
    total: number;
    matches: Array<{
      type: string;
      user?: string;
      username?: string;
      text: string;
      ts: string;
      channel?: {
        id: string;
        name: string;
      };
      permalink: string;
    }>;
    pagination?: {
      total_count: number;
      page: number;
      per_page: number;
      page_count: number;
      first: number;
      last: number;
    };
  };
};
