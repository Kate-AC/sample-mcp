import { Result } from "@core/result/result";
import {
  SlackChannelPayload,
  SlackConversationHistoryPayload,
  SlackFileDownloadPayload,
  SlackFilePayload,
  SlackPostMessagePayload,
  SlackSearchMessagesPayload,
} from "./slackRepositoryPayload";

export type SlackPostMessageOptions = {
  username?: string | undefined;
  icon_emoji?: string | undefined;
  icon_url?: string | undefined;
  /** スレッド返信にする場合の親メッセージTS */
  thread_ts?: string | undefined;
  /** 返信をチャンネルにバンプするか */
  reply_broadcast?: boolean | undefined;
};

export interface SlackRepository {
  /**
   * Slackからチャンネル一覧を取得する
   */
  getChannels: (
    queryParams?: Record<string, string> | string,
  ) => Promise<Result<SlackChannelPayload>>;

  /**
   * Slackから会話履歴を取得する
   */
  getConversationHistory: (
    channel: string,
    queryParams?: Record<string, string> | string,
  ) => Promise<Result<SlackConversationHistoryPayload>>;

  /**
   * Slackからファイル情報を取得する
   */
  getFileInfo: (fileId: string) => Promise<Result<SlackFilePayload>>;

  /**
   * SlackからファイルをダウンロードしてBase64エンコードして返す
   */
  downloadFile: (filePath: string) => Promise<Result<SlackFileDownloadPayload>>;

  /**
   * Slackにメッセージを投稿する
   */
  postMessage: (
    channel: string,
    text: string,
    options?: SlackPostMessageOptions,
  ) => Promise<Result<SlackPostMessagePayload>>;

  /**
   * Slackからスレッドメッセージ（親メッセージとその返信）を取得する
   */
  getThreadMessages: (
    messageUrl: string,
  ) => Promise<Result<SlackConversationHistoryPayload>>;

  /**
   * Slackから特定のリアクションが押されているメッセージを取得する
   */
  getMessagesWithReaction: (
    channel: string,
    reactionName: string,
    queryParams?: Record<string, string> | string,
  ) => Promise<Result<SlackConversationHistoryPayload>>;

  /**
   * Slackでメッセージを全体検索する（search:read スコープが必要）
   */
  searchMessages: (
    query: string,
    queryParams?: Record<string, string> | string,
  ) => Promise<Result<SlackSearchMessagesPayload>>;
}
