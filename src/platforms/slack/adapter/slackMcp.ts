import { Mcp } from "@core/contracts/mcp/mcp";
import { McpFunction } from "@core/contracts/mcp/mcpFunction";
import { makePostSlackUseCase } from "../application/usecases/postSlackUseCase";
import {
  SlackChannelPayload,
  SlackConversationHistoryPayload,
  SlackFileDownloadPayload,
  SlackFilePayload,
  SlackPostMessagePayload,
  SlackSearchMessagesPayload,
} from "../domain/repositories/slackRepositoryPayload";
import { makeSlackApiClient } from "../infrastructure/http/slackApiClient";
import { makeSlackRepository } from "../infrastructure/repositories/slackRepository";
import { makeSlackMcpMetadata } from "./slackMcpMetadata";
import { makeSlackMcpSetting } from "./slackMcpSetting";

type SlackMcpFunctions = {
  getChannels: McpFunction<
    SlackChannelPayload,
    [(Record<string, string> | string)?]
  >;
  getConversationHistory: McpFunction<
    SlackConversationHistoryPayload,
    [string, (Record<string, string> | string)?]
  >;
  getFileInfo: McpFunction<SlackFilePayload, [string]>;
  downloadFile: McpFunction<SlackFileDownloadPayload, [string]>;
  postMessage: McpFunction<SlackPostMessagePayload, [string, string, string?]>;
  getThreadMessages: McpFunction<SlackConversationHistoryPayload, [string]>;
  getMessagesWithReaction: McpFunction<
    SlackConversationHistoryPayload,
    [string, string, (Record<string, string> | string)?]
  >;
  searchMessages: McpFunction<
    SlackSearchMessagesPayload,
    [string, (Record<string, string> | string)?]
  >;
};

export const makeSlackMcp = (
  postSlackUseCase = makePostSlackUseCase(),
): Mcp<SlackMcpFunctions> => ({
  mcpFunctions: {
    getChannels: async (queryParams?: Record<string, string> | string) => {
      const repo = makeSlackRepository(makeSlackApiClient);
      return repo.getChannels(queryParams);
    },
    getConversationHistory: async (
      channel: string,
      queryParams?: Record<string, string> | string,
    ) => {
      const repo = makeSlackRepository(makeSlackApiClient);
      return repo.getConversationHistory(channel, queryParams);
    },
    getFileInfo: async (fileId: string) => {
      const repo = makeSlackRepository(makeSlackApiClient);
      return repo.getFileInfo(fileId);
    },
    downloadFile: async (filePath: string) => {
      const repo = makeSlackRepository(makeSlackApiClient);
      return repo.downloadFile(filePath);
    },
    postMessage: async (channel: string, text: string, options?: string) => {
      return await postSlackUseCase.invoke(channel, text, options);
    },
    getThreadMessages: async (messageUrl: string) => {
      const repo = makeSlackRepository(makeSlackApiClient);
      return repo.getThreadMessages(messageUrl);
    },
    getMessagesWithReaction: async (
      channel: string,
      reactionName: string,
      queryParams?: Record<string, string> | string,
    ) => {
      const repo = makeSlackRepository(makeSlackApiClient);
      return repo.getMessagesWithReaction(channel, reactionName, queryParams);
    },
    searchMessages: async (
      query: string,
      queryParams?: Record<string, string> | string,
    ) => {
      const repo = makeSlackRepository(makeSlackApiClient);
      return repo.searchMessages(query, queryParams);
    },
  },
  mcpMetadata: makeSlackMcpMetadata(),
  mcpSetting: makeSlackMcpSetting(),
});
