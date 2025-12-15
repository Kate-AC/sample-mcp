import { Mcp } from "@core/contracts/mcp/mcp";
import { McpFunction } from "@core/contracts/mcp/mcpFunction";
import { ErrorType } from "@core/result/result";
import {
  GoogleCalendarListPayload,
  GoogleDocsBatchUpdatePayload,
  GoogleDocsDocumentPayload,
  GoogleDriveFilePayload,
  GoogleSheetsAppendPayload,
  GoogleSheetsSpreadsheetPayload,
  GoogleSheetsUpdatePayload,
  GoogleSheetsValuesPayload,
} from "../domain/repositories/googleRepositoryPayload";
import { makeGoogleRepository } from "../infrastructure/repositories/googleRepository";
import { makeGoogleMcpMetadata } from "./googleMcpMetadata";
import { makeGoogleMcpSetting } from "./googleMcpSetting";

type GoogleMcpFunctions = {
  getCalendarEvents: McpFunction<
    GoogleCalendarListPayload,
    [string, Record<string, string>?]
  >;
  getDocument: McpFunction<
    GoogleDocsDocumentPayload,
    [string, Record<string, string>?]
  >;
  batchUpdateDocument: McpFunction<
    GoogleDocsBatchUpdatePayload,
    [string, string]
  >;
  getSpreadsheet: McpFunction<GoogleSheetsSpreadsheetPayload, [string]>;
  getSheetValues: McpFunction<GoogleSheetsValuesPayload, [string]>;
  appendSheetValues: McpFunction<
    GoogleSheetsAppendPayload,
    [string, string, string, ("RAW" | "USER_ENTERED") | undefined]
  >;
  updateSheetValues: McpFunction<
    GoogleSheetsUpdatePayload,
    [string, string, string, ("RAW" | "USER_ENTERED") | undefined]
  >;
  getDriveFile: McpFunction<GoogleDriveFilePayload, [string]>;
  searchDriveFiles: McpFunction<
    { files: GoogleDriveFilePayload[] },
    [string, Record<string, string>?]
  >;
};

export const makeGoogleMcp = ({
  googleRepositoryFactory = makeGoogleRepository(),
} = {}): Mcp<GoogleMcpFunctions> => ({
  mcpFunctions: {
    getCalendarEvents: async (
      apiPath: string,
      queryParams?: Record<string, string>,
    ) => {
      return googleRepositoryFactory.getCalendarEvents(apiPath, queryParams);
    },
    getDocument: async (
      documentId: string,
      queryParams?: Record<string, string>,
    ) => {
      return googleRepositoryFactory.getDocument(documentId, queryParams);
    },
    batchUpdateDocument: async (documentId: string, requests: string) => {
      let parsedRequests: Record<string, any>[];
      try {
        parsedRequests = JSON.parse(requests);
        if (!Array.isArray(parsedRequests)) {
          throw new Error("requests must be an array");
        }
      } catch (error) {
        return {
          payload: null as unknown as GoogleDocsBatchUpdatePayload,
          status: 400,
          isSuccess: false,
          message: `requests引数のJSONパースに失敗しました: ${requests}. エラー: ${error instanceof Error ? error.message : String(error)}`,
          errorType: ErrorType.PARSE_ERROR,
        };
      }
      return googleRepositoryFactory.batchUpdateDocument(
        documentId,
        parsedRequests,
      );
    },
    getSpreadsheet: async (apiPath: string) => {
      return googleRepositoryFactory.getSpreadsheet(apiPath);
    },
    getSheetValues: async (apiPath: string) => {
      return googleRepositoryFactory.getSheetValues(apiPath);
    },
    appendSheetValues: async (
      spreadsheetId: string,
      range: string,
      values: string,
      valueInputOption?: "RAW" | "USER_ENTERED",
    ) => {
      // valuesはJSON文字列として渡されるため、パースする
      let parsedValues: string[][];
      try {
        parsedValues = JSON.parse(values);
        if (
          !Array.isArray(parsedValues) ||
          !parsedValues.every(Array.isArray)
        ) {
          throw new Error("values must be a 2D array");
        }
      } catch (error) {
        return {
          payload: null as unknown as GoogleSheetsAppendPayload,
          status: 400,
          isSuccess: false,
          message: `values引数のJSONパースに失敗しました: ${values}. エラー: ${error instanceof Error ? error.message : String(error)}`,
          errorType: ErrorType.PARSE_ERROR,
        };
      }
      return googleRepositoryFactory.appendSheetValues(
        spreadsheetId,
        range,
        parsedValues,
        valueInputOption,
      );
    },
    updateSheetValues: async (
      spreadsheetId: string,
      range: string,
      values: string,
      valueInputOption?: "RAW" | "USER_ENTERED",
    ) => {
      // valuesはJSON文字列として渡されるため、パースする
      let parsedValues: string[][];
      try {
        parsedValues = JSON.parse(values);
        if (
          !Array.isArray(parsedValues) ||
          !parsedValues.every(Array.isArray)
        ) {
          throw new Error("values must be a 2D array");
        }
      } catch (error) {
        return {
          payload: null as unknown as GoogleSheetsUpdatePayload,
          status: 400,
          isSuccess: false,
          message: `values引数のJSONパースに失敗しました: ${values}. エラー: ${error instanceof Error ? error.message : String(error)}`,
          errorType: ErrorType.PARSE_ERROR,
        };
      }
      return googleRepositoryFactory.updateSheetValues(
        spreadsheetId,
        range,
        parsedValues,
        valueInputOption,
      );
    },
    getDriveFile: async (apiPath: string) => {
      return googleRepositoryFactory.getDriveFile(apiPath);
    },
    searchDriveFiles: async (
      apiPath: string,
      queryParams?: Record<string, string>,
    ) => {
      return googleRepositoryFactory.searchDriveFiles(apiPath, queryParams);
    },
  },
  mcpMetadata: makeGoogleMcpMetadata(),
  mcpSetting: makeGoogleMcpSetting(),
});

export type GoogleMcp = Mcp<GoogleMcpFunctions>;
