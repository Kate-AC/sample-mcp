import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { safeCall } from "@core/result/safeCall";
import { GrowiRepository } from "@platforms/growi/domain/repositories/growiRepository";
import {
  GrowiAttachmentPayload,
  GrowiCommentPayload,
  GrowiPageListPayload,
  GrowiPagePayload,
  GrowiRevisionPayload,
  GrowiSearchPayload,
  GrowiUserPayload,
} from "@platforms/growi/domain/repositories/growiRepositoryPayload";
import { makeGrowiApiClient } from "../http/growiApiClient";

export const makeGrowiRepository = (
  apiClientFactory: () => ApiClientPort = makeGrowiApiClient,
): GrowiRepository => ({
  /**
   * Growiからページ一覧を取得する
   */
  getPages: async (apiPath: string, queryParams?: Record<string, string>) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<GrowiPageListPayload>(apiPath, queryParams || {});
    });
  },

  /**
   * Growiからページ情報を取得する
   */
  getPage: async (apiPath: string, queryParams?: Record<string, string>) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<GrowiPagePayload>(apiPath, queryParams || {});
    });
  },

  /**
   * Growiからページを検索する
   */
  searchPages: async (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<GrowiSearchPayload>(apiPath, queryParams || {});
    });
  },

  /**
   * Growiからページのリビジョン一覧を取得する
   */
  getRevisions: async (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<{ revisions: GrowiRevisionPayload[] }>(
        apiPath,
        queryParams || {},
      );
    });
  },

  /**
   * Growiからユーザー情報を取得する
   */
  getUsers: async (apiPath: string, queryParams?: Record<string, string>) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<{ users: GrowiUserPayload[] }>(
        apiPath,
        queryParams || {},
      );
    });
  },

  /**
   * Growiからページのコメント一覧を取得する
   */
  getComments: async (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<{ comments: GrowiCommentPayload[] }>(
        apiPath,
        queryParams || {},
      );
    });
  },

  /**
   * Growiからページの添付ファイル一覧を取得する
   */
  getAttachments: async (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<{ attachments: GrowiAttachmentPayload[] }>(
        apiPath,
        queryParams || {},
      );
    });
  },

  /**
   * Growiにページを作成する
   */
  createPage: async (apiPath: string, data: { path: string; body: string }) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.post<{ page: GrowiPagePayload }>(apiPath, data);
    });
  },
});
