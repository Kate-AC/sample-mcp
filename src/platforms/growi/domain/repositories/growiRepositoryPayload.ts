export type GrowiPageData = {
  _id: string;
  path: string;
  revision: {
    _id: string;
    body: string;
    format: "markdown" | "html" | "text";
    createdAt: string;
    author: {
      _id: string;
      username: string;
      name: string;
      email: string;
    };
  };
  status: "published" | "draft" | "deleted";
  creator: {
    _id: string;
    username: string;
    name: string;
    email: string;
  };
  lastUpdateUser: {
    _id: string;
    username: string;
    name: string;
    email: string;
  };
  liker: string[];
  seenUsers: Array<{
    _id: string;
    username: string;
    lastSeenAt: string;
  }>;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  grant: number;
  grantedUsers: string[];
  grantedGroup: string[];
  bookmarkCount: number;
  tags: string[];
  parent: string | null;
  descendantCount: number;
  isEmpty: boolean;
  isPortal: boolean;
  isTemplate: boolean;
  templateTagData: string[];
  redirectTo: string | null;
  shareLinksNumber: number;
  pageIdOnHackmd: string | null;
  hasDraftOnHackmd: boolean;
  draft: {
    body: string;
    updatedAt: string;
  } | null;
  sync: {
    status: "none" | "requested" | "syncing" | "completed" | "failed";
    error?: string;
  };
};

export type GrowiPagePayload = {
  page: GrowiPageData;
};

export type GrowiPageListPayload = {
  pages: GrowiPageData[];
  totalCount: number;
  limit: number;
  offset: number;
};

export type GrowiRevisionPayload = {
  _id: string;
  pageId: string;
  body: string;
  format: "markdown" | "html" | "text";
  author: {
    _id: string;
    username: string;
    name: string;
    email: string;
  };
  createdAt: string;
  hasDiffToPrev: boolean;
  prevRevision: string | null;
};

export type GrowiUserPayload = {
  _id: string;
  username: string;
  name: string;
  email: string;
  image: string;
  imageUrlCached: string;
  googleId: string | null;
  githubId: string | null;
  status: "active" | "suspended" | "invited" | "deactivated";
  lang: string;
  isEmailPublished: boolean;
  slackMemberId: string | null;
  apiToken: string | null;
  createdAt: string;
  lastLoginAt: string;
  admin: boolean;
  isGravatarEnabled: boolean;
  isGravatarEnabledInWhiteTheme: boolean;
  isMailerEnabled: boolean;
  isNotificationEnabled: boolean;
  isLdapHidden: boolean;
  isPasswordSet: boolean;
  isExternalAuth: boolean;
  twoFactorSecret: string | null;
  twoFactorEnabled: boolean;
  isTwoFactorAuthenticationEnabled: boolean;
};

export type GrowiSearchPayload = {
  data: Array<{
    data: GrowiPageData;
    meta: any;
  }>;
  totalCount?: number;
  meta?: {
    search: string;
    searchType: "prefix" | "partial" | "forward" | "backward";
    searchPath: string;
    searchTag: string[];
    searchUser: string[];
  };
};

export type GrowiCommentPayload = {
  _id: string;
  page: string;
  revision: string;
  creator: {
    _id: string;
    username: string;
    name: string;
    email: string;
  };
  comment: string;
  commentPosition: number;
  isMarkdown: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GrowiAttachmentPayload = {
  _id: string;
  originalName: string;
  name: string;
  path: string;
  filePath: string;
  fileFormat: string;
  fileSize: number;
  mime: string;
  creator: {
    _id: string;
    username: string;
    name: string;
    email: string;
  };
  page: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  downloadUrl: string;
};
