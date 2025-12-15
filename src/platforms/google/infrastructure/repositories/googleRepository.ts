import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { safeCall } from "@core/result/safeCall";
import { GoogleRepository } from "@platforms/google/domain/repositories/googleRepository";
import {
  GoogleCalendarListPayload,
  GoogleDocsBatchUpdatePayload,
  GoogleDocsDocumentPayload,
  GoogleDriveFilePayload,
  GoogleSheetsAppendPayload,
  GoogleSheetsSpreadsheetPayload,
  GoogleSheetsUpdatePayload,
  GoogleSheetsValuesPayload,
} from "@platforms/google/domain/repositories/googleRepositoryPayload";
import {
  makeGoogleCalendarApiClient,
  makeGoogleDocsApiClient,
  makeGoogleDriveApiClient,
  makeGoogleSheetsApiClient,
} from "../http/googleApiClient";

export const makeGoogleRepository = (
  calendarApiClientFactory: () => Promise<ApiClientPort> = makeGoogleCalendarApiClient,
  docsApiClientFactory: () => Promise<ApiClientPort> = makeGoogleDocsApiClient,
  sheetsApiClientFactory: () => Promise<ApiClientPort> = makeGoogleSheetsApiClient,
  driveApiClientFactory: () => Promise<ApiClientPort> = makeGoogleDriveApiClient,
): GoogleRepository => ({
  /**
   * Google Calendarからイベント一覧を取得する
   */
  getCalendarEvents: async (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => {
    return safeCall(async () => {
      const client = await calendarApiClientFactory();
      return await client.get<GoogleCalendarListPayload>(
        apiPath,
        queryParams || {},
      );
    });
  },

  /**
   * Google Docsからドキュメントを取得する
   */
  getDocument: async (
    documentId: string,
    queryParams?: Record<string, string>,
  ) => {
    return safeCall(async () => {
      const client = await docsApiClientFactory();
      return await client.get<GoogleDocsDocumentPayload>(
        `/documents/${documentId}`,
        queryParams || {},
      );
    });
  },

  /**
   * Google DocsのbatchUpdateを実行する
   */
  batchUpdateDocument: async (
    documentId: string,
    requests: Record<string, any>[],
  ) => {
    return safeCall(async () => {
      const client = await docsApiClientFactory();
      return await client.post<GoogleDocsBatchUpdatePayload>(
        `/documents/${documentId}:batchUpdate`,
        { requests },
      );
    });
  },

  /**
   * Google Sheetsからスプレッドシート情報を取得する
   */
  getSpreadsheet: async (apiPath: string) => {
    return safeCall(async () => {
      const client = await sheetsApiClientFactory();
      return await client.get<GoogleSheetsSpreadsheetPayload>(apiPath);
    });
  },

  /**
   * Google Sheetsから値を取得する
   */
  getSheetValues: async (apiPath: string) => {
    return safeCall(async () => {
      const client = await sheetsApiClientFactory();
      return await client.get<GoogleSheetsValuesPayload>(apiPath);
    });
  },

  /**
   * Google Sheetsに値を追記する
   */
  appendSheetValues: async (
    spreadsheetId: string,
    range: string,
    values: string[][],
    valueInputOption: "RAW" | "USER_ENTERED" = "USER_ENTERED",
  ) => {
    return safeCall(async () => {
      const client = await sheetsApiClientFactory();
      const url = `/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=${valueInputOption}`;
      return await client.post<GoogleSheetsAppendPayload>(url, {
        values,
      });
    });
  },

  /**
   * Google Sheetsの値を更新する
   */
  updateSheetValues: async (
    spreadsheetId: string,
    range: string,
    values: string[][],
    valueInputOption: "RAW" | "USER_ENTERED" = "USER_ENTERED",
  ) => {
    return safeCall(async () => {
      const client = await sheetsApiClientFactory();
      const url = `/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`;
      return await client.put<GoogleSheetsUpdatePayload>(url, {
        values,
      });
    });
  },

  /**
   * Google Driveからファイル情報を取得する
   */
  getDriveFile: async (apiPath: string) => {
    return safeCall(async () => {
      const client = await driveApiClientFactory();
      return await client.get<GoogleDriveFilePayload>(apiPath);
    });
  },

  /**
   * Google Driveでファイルを検索する
   */
  searchDriveFiles: async (
    apiPath: string,
    queryParams?: Record<string, string>,
  ) => {
    return safeCall(async () => {
      const client = await driveApiClientFactory();
      return await client.get<{ files: GoogleDriveFilePayload[] }>(
        apiPath,
        queryParams || {},
      );
    });
  },
});
