export type FigmaImagePayload = {
  err: string | null;
  images: Record<string, string | null>;
};

export type FigmaComment = {
  id: string;
  message: string;
  created_at: string;
  resolved_at: string | null;
  user: {
    handle: string;
    img_url: string;
  };
  order_id: string | null;
  parent_id: string;
  client_meta?: {
    node_id?: string;
    node_offset?: {
      x: number;
      y: number;
    };
  };
};

export type FigmaCommentsPayload = {
  comments: FigmaComment[];
};

export type FigmaFilePayload = {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  document: {
    id: string;
    name: string;
    type: string;
    children?: FigmaNode[];
  };
};

export type FigmaNode = {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
};
