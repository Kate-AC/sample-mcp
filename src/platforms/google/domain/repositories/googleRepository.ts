import { Result } from "@core/result/result";
import {
  GoogleCalendarListPayload,
  GoogleDocsBatchUpdatePayload,
  GoogleDocsDocumentPayload,
  GoogleDriveFilePayload,
  GoogleSheetsAppendPayload,
  GoogleSheetsSpreadsheetPayload,
  GoogleSheetsUpdatePayload,
  GoogleSheetsValuesPayload,
} from "./googleRepositoryPayload";

export interface GoogleRepository {
  /**
   * Google Calendarからイベント一覧を取得する
   */
  getCalendarEvents: (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<GoogleCalendarListPayload>>;

  /**
   * Google Docsからドキュメントを取得する
   */
  getDocument: (
    documentId: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<GoogleDocsDocumentPayload>>;

  /**
   * Google DocsのbatchUpdateを実行する
   */
  batchUpdateDocument: (
    documentId: string,
    requests: Record<string, any>[],
  ) => Promise<Result<GoogleDocsBatchUpdatePayload>>;

  /**
   * Google Sheetsからスプレッドシート情報を取得する
   */
  getSpreadsheet: (
    apiPath: string,
  ) => Promise<Result<GoogleSheetsSpreadsheetPayload>>;

  /**
   * Google Sheetsから値を取得する
   */
  getSheetValues: (
    apiPath: string,
  ) => Promise<Result<GoogleSheetsValuesPayload>>;

  /**
   * Google Sheetsに値を追記する
   */
  appendSheetValues: (
    spreadsheetId: string,
    range: string,
    values: string[][],
    valueInputOption?: "RAW" | "USER_ENTERED",
  ) => Promise<Result<GoogleSheetsAppendPayload>>;

  /**
   * Google Sheetsの値を更新する
   */
  updateSheetValues: (
    spreadsheetId: string,
    range: string,
    values: string[][],
    valueInputOption?: "RAW" | "USER_ENTERED",
  ) => Promise<Result<GoogleSheetsUpdatePayload>>;

  /**
   * Google Driveからファイル情報を取得する
   */
  getDriveFile: (apiPath: string) => Promise<Result<GoogleDriveFilePayload>>;

  /**
   * Google Driveでファイルを検索する
   */
  searchDriveFiles: (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<{ files: GoogleDriveFilePayload[] }>>;
}
