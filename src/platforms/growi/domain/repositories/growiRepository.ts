import { Result } from "@core/result/result";
import {
  GrowiAttachmentPayload,
  GrowiCommentPayload,
  GrowiPageListPayload,
  GrowiPagePayload,
  GrowiRevisionPayload,
  GrowiSearchPayload,
  GrowiUserPayload,
} from "./growiRepositoryPayload";

export interface GrowiRepository {
  /**
   * Growiからページ一覧を取得する
   */
  getPages: (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<GrowiPageListPayload>>;

  /**
   * Growiからページ情報を取得する
   */
  getPage: (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<GrowiPagePayload>>;

  /**
   * Growiからページを検索する
   */
  searchPages: (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<GrowiSearchPayload>>;

  /**
   * Growiからページのリビジョン一覧を取得する
   */
  getRevisions: (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<{ revisions: GrowiRevisionPayload[] }>>;

  /**
   * Growiからユーザー情報を取得する
   */
  getUsers: (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<{ users: GrowiUserPayload[] }>>;

  /**
   * Growiからページのコメント一覧を取得する
   */
  getComments: (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<{ comments: GrowiCommentPayload[] }>>;

  /**
   * Growiからページの添付ファイル一覧を取得する
   */
  getAttachments: (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<{ attachments: GrowiAttachmentPayload[] }>>;

  /**
   * Growiにページを作成する
   */
  createPage: (
    apiPath: string,
    data: { path: string; body: string },
  ) => Promise<Result<{ page: GrowiPagePayload }>>;
}
