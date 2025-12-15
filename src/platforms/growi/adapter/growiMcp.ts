import { Mcp } from "@core/contracts/mcp/mcp";
import { McpFunction } from "@core/contracts/mcp/mcpFunction";
import { formatDateString } from "../application/utils/dateFormatter";
import {
  GrowiPagePayload,
  GrowiSearchPayload,
} from "../domain/repositories/growiRepositoryPayload";
import { loadGrowiConfig } from "../domain/settings/growiConfig";
import { makeGrowiRepository } from "../infrastructure/repositories/growiRepository";
import { makeGrowiMcpMetadata } from "./growiMcpMetadata";
import { makeGrowiMcpSetting } from "./growiMcpSetting";

type GrowiMcpFunctions = {
  searchPages: McpFunction<GrowiSearchPayload, [string]>;
  getPage: McpFunction<GrowiPagePayload, [string]>;
  createPage: McpFunction<{ page: GrowiPagePayload }, [string, string]>;
};

export const makeGrowiMcp = ({
  growiRepositoryFactory = makeGrowiRepository(),
} = {}): Mcp<GrowiMcpFunctions> => ({
  mcpFunctions: {
    searchPages: async (queryOrParams: string) => {
      // JSON文字列の場合はパース
      if (queryOrParams.startsWith("{") || queryOrParams.startsWith("[")) {
        try {
          const params = JSON.parse(queryOrParams);
          return growiRepositoryFactory.searchPages("/_api/search", params);
        } catch (error) {
          // パースに失敗した場合はエラーを返す
          return {
            payload: null as any,
            status: 400,
            isSuccess: false,
            message: `JSON parse error: ${error instanceof Error ? error.message : String(error)}`,
          };
        }
      }
      // 文字列の場合は検索クエリとして扱う
      return growiRepositoryFactory.searchPages("/_api/search", {
        q: queryOrParams,
      });
    },
    getPage: async (pageId: string) => {
      // ページIDを指定してページの詳細を取得
      return growiRepositoryFactory.getPage("/_api/v3/page", { pageId });
    },
    createPage: async (title: string, body: string) => {
      const config = loadGrowiConfig();

      // 日時プレフィックスを生成
      const prefix = formatDateString(config.pageTitlePrefixFormat);

      // ページパスを生成: baseCreatePath + prefix + title
      const pagePath = `${config.baseCreatePath}/${prefix}${title}`;

      // ページを作成
      return growiRepositoryFactory.createPage("/_api/v3/page", {
        path: pagePath,
        body: body,
      });
    },
  },
  mcpMetadata: makeGrowiMcpMetadata(),
  mcpSetting: makeGrowiMcpSetting(),
});
