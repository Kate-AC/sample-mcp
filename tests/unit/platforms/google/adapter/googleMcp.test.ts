import { ErrorType } from "@core/result/result";
import { makeGoogleMcp } from "@platforms/google/adapter/googleMcp";
import { GoogleRepository } from "@platforms/google/domain/repositories/googleRepository";

describe("googleMcp", () => {
  describe("makeGoogleMcp", () => {
    it("MCPオブジェクトを正しく作成できること", () => {
      const mcp = makeGoogleMcp({});

      expect(mcp).toBeDefined();
      expect(mcp.mcpFunctions).toBeDefined();
      expect(mcp.mcpFunctions.getCalendarEvents).toBeDefined();
      expect(mcp.mcpFunctions.getDocument).toBeDefined();
      expect(mcp.mcpFunctions.getSpreadsheet).toBeDefined();
      expect(mcp.mcpFunctions.getSheetValues).toBeDefined();
      expect(mcp.mcpFunctions.appendSheetValues).toBeDefined();
      expect(mcp.mcpFunctions.updateSheetValues).toBeDefined();
      expect(mcp.mcpFunctions.getDriveFile).toBeDefined();
      expect(mcp.mcpFunctions.searchDriveFiles).toBeDefined();
      expect(mcp.mcpMetadata).toBeDefined();
      expect(mcp.mcpSetting).toBeDefined();
    });

    it("getCalendarEvents関数が実行できること", async () => {
      const mockRepository: GoogleRepository = {
        getCalendarEvents: jest.fn().mockResolvedValue({
          payload: { items: [] },
          isSuccess: true,
        }),
        getDocument: jest.fn(),
        getSpreadsheet: jest.fn(),
        getSheetValues: jest.fn(),
        appendSheetValues: jest.fn(),
        updateSheetValues: jest.fn(),
        getDriveFile: jest.fn(),
        searchDriveFiles: jest.fn(),
        batchUpdateDocument: jest.fn(),
      };

      const mcp = makeGoogleMcp({
        googleRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.getCalendarEvents(
        "/calendars/primary/events",
        { timeMin: "2024-01-01T00:00:00Z" },
      );

      expect(mockRepository.getCalendarEvents).toHaveBeenCalledWith(
        "/calendars/primary/events",
        { timeMin: "2024-01-01T00:00:00Z" },
      );
      expect(result.isSuccess).toBe(true);
    });

    it("getDocument関数が実行できること", async () => {
      const mockRepository: GoogleRepository = {
        getCalendarEvents: jest.fn(),
        getDocument: jest.fn().mockResolvedValue({
          payload: { title: "Test Document" },
          isSuccess: true,
        }),
        getSpreadsheet: jest.fn(),
        getSheetValues: jest.fn(),
        appendSheetValues: jest.fn(),
        updateSheetValues: jest.fn(),
        getDriveFile: jest.fn(),
        searchDriveFiles: jest.fn(),
        batchUpdateDocument: jest.fn(),
      };

      const mcp = makeGoogleMcp({
        googleRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.getDocument("test-doc-id");

      expect(mockRepository.getDocument).toHaveBeenCalledWith(
        "test-doc-id",
        undefined,
      );
      expect(result.isSuccess).toBe(true);
    });

    it("getDocument関数がqueryParamsを受け取れること", async () => {
      const mockRepository: GoogleRepository = {
        getCalendarEvents: jest.fn(),
        getDocument: jest.fn().mockResolvedValue({
          payload: { title: "Test Document" },
          isSuccess: true,
        }),
        getSpreadsheet: jest.fn(),
        getSheetValues: jest.fn(),
        appendSheetValues: jest.fn(),
        updateSheetValues: jest.fn(),
        getDriveFile: jest.fn(),
        searchDriveFiles: jest.fn(),
        batchUpdateDocument: jest.fn(),
      };

      const mcp = makeGoogleMcp({
        googleRepositoryFactory: mockRepository,
      });

      const queryParams = { includeTabsContent: "true" };
      const result = await mcp.mcpFunctions.getDocument(
        "test-doc-id",
        queryParams,
      );

      expect(mockRepository.getDocument).toHaveBeenCalledWith(
        "test-doc-id",
        queryParams,
      );
      expect(result.isSuccess).toBe(true);
    });

    it("getSpreadsheet関数が実行できること", async () => {
      const mockRepository: GoogleRepository = {
        getCalendarEvents: jest.fn(),
        getDocument: jest.fn(),
        getSpreadsheet: jest.fn().mockResolvedValue({
          payload: { properties: { title: "Test Sheet" } },
          isSuccess: true,
        }),
        getSheetValues: jest.fn(),
        appendSheetValues: jest.fn(),
        updateSheetValues: jest.fn(),
        getDriveFile: jest.fn(),
        searchDriveFiles: jest.fn(),
        batchUpdateDocument: jest.fn(),
      };

      const mcp = makeGoogleMcp({
        googleRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.getSpreadsheet(
        "/spreadsheets/test-sheet-id",
      );

      expect(mockRepository.getSpreadsheet).toHaveBeenCalledWith(
        "/spreadsheets/test-sheet-id",
      );
      expect(result.isSuccess).toBe(true);
    });

    describe("appendSheetValues", () => {
      it("JSON文字列を正しくパースしてrepositoryに渡すこと", async () => {
        const mockRepository: GoogleRepository = {
          getCalendarEvents: jest.fn(),
          getDocument: jest.fn(),
          getSpreadsheet: jest.fn(),
          getSheetValues: jest.fn(),
          appendSheetValues: jest.fn().mockResolvedValue({
            payload: {
              spreadsheetId: "test-id",
              tableRange: "シート1!A1:B1",
              updates: {
                spreadsheetId: "test-id",
                updatedRange: "シート1!A2:B2",
                updatedRows: 1,
                updatedColumns: 2,
                updatedCells: 2,
              },
            },
            isSuccess: true,
            status: 200,
            message: "ok",
          }),
          updateSheetValues: jest.fn(),
          getDriveFile: jest.fn(),
          searchDriveFiles: jest.fn(),
          batchUpdateDocument: jest.fn(),
        };

        const mcp = makeGoogleMcp({
          googleRepositoryFactory: mockRepository,
        });

        const result = await mcp.mcpFunctions.appendSheetValues(
          "test-spreadsheet-id",
          "シート1",
          '[["test", "data"]]',
          "USER_ENTERED",
        );

        expect(mockRepository.appendSheetValues).toHaveBeenCalledWith(
          "test-spreadsheet-id",
          "シート1",
          [["test", "data"]],
          "USER_ENTERED",
        );
        expect(result.isSuccess).toBe(true);
      });

      it("valueInputOptionが未指定の場合、デフォルト値が渡されること", async () => {
        const mockRepository: GoogleRepository = {
          getCalendarEvents: jest.fn(),
          getDocument: jest.fn(),
          getSpreadsheet: jest.fn(),
          getSheetValues: jest.fn(),
          appendSheetValues: jest.fn().mockResolvedValue({
            payload: {
              spreadsheetId: "test-id",
              tableRange: "シート1!A1:B1",
              updates: {
                spreadsheetId: "test-id",
                updatedRange: "シート1!A2:B2",
                updatedRows: 1,
                updatedColumns: 2,
                updatedCells: 2,
              },
            },
            isSuccess: true,
            status: 200,
            message: "ok",
          }),
          updateSheetValues: jest.fn(),
          getDriveFile: jest.fn(),
          searchDriveFiles: jest.fn(),
          batchUpdateDocument: jest.fn(),
        };

        const mcp = makeGoogleMcp({
          googleRepositoryFactory: mockRepository,
        });

        await mcp.mcpFunctions.appendSheetValues(
          "test-spreadsheet-id",
          "シート1",
          '[["test", "data"]]',
          undefined,
        );

        expect(mockRepository.appendSheetValues).toHaveBeenCalledWith(
          "test-spreadsheet-id",
          "シート1",
          [["test", "data"]],
          undefined,
        );
      });

      it("不正なJSON文字列の場合、エラーを返すこと", async () => {
        const mockRepository: GoogleRepository = {
          getCalendarEvents: jest.fn(),
          getDocument: jest.fn(),
          getSpreadsheet: jest.fn(),
          getSheetValues: jest.fn(),
          appendSheetValues: jest.fn(),
          updateSheetValues: jest.fn(),
          getDriveFile: jest.fn(),
          searchDriveFiles: jest.fn(),
          batchUpdateDocument: jest.fn(),
        };

        const mcp = makeGoogleMcp({
          googleRepositoryFactory: mockRepository,
        });

        const result = await mcp.mcpFunctions.appendSheetValues(
          "test-spreadsheet-id",
          "シート1",
          "invalid json",
          "USER_ENTERED",
        );

        expect(result.isSuccess).toBe(false);
        expect(result.status).toBe(400);
        expect(result.errorType).toBe(ErrorType.PARSE_ERROR);
        expect(result.message).toContain("JSONパースに失敗しました");
        expect(mockRepository.appendSheetValues).not.toHaveBeenCalled();
      });

      it("1次元配列の場合、エラーを返すこと", async () => {
        const mockRepository: GoogleRepository = {
          getCalendarEvents: jest.fn(),
          getDocument: jest.fn(),
          getSpreadsheet: jest.fn(),
          getSheetValues: jest.fn(),
          appendSheetValues: jest.fn(),
          updateSheetValues: jest.fn(),
          getDriveFile: jest.fn(),
          searchDriveFiles: jest.fn(),
          batchUpdateDocument: jest.fn(),
        };

        const mcp = makeGoogleMcp({
          googleRepositoryFactory: mockRepository,
        });

        const result = await mcp.mcpFunctions.appendSheetValues(
          "test-spreadsheet-id",
          "シート1",
          '["test", "data"]',
          "USER_ENTERED",
        );

        expect(result.isSuccess).toBe(false);
        expect(result.status).toBe(400);
        expect(result.errorType).toBe(ErrorType.PARSE_ERROR);
        expect(result.message).toContain("values must be a 2D array");
        expect(mockRepository.appendSheetValues).not.toHaveBeenCalled();
      });

      it("2次元配列でない場合、エラーを返すこと", async () => {
        const mockRepository: GoogleRepository = {
          getCalendarEvents: jest.fn(),
          getDocument: jest.fn(),
          getSpreadsheet: jest.fn(),
          getSheetValues: jest.fn(),
          appendSheetValues: jest.fn(),
          updateSheetValues: jest.fn(),
          getDriveFile: jest.fn(),
          searchDriveFiles: jest.fn(),
          batchUpdateDocument: jest.fn(),
        };

        const mcp = makeGoogleMcp({
          googleRepositoryFactory: mockRepository,
        });

        const result = await mcp.mcpFunctions.appendSheetValues(
          "test-spreadsheet-id",
          "シート1",
          '[["test", "data"], "not-array"]',
          "USER_ENTERED",
        );

        expect(result.isSuccess).toBe(false);
        expect(result.status).toBe(400);
        expect(result.errorType).toBe(ErrorType.PARSE_ERROR);
        expect(result.message).toContain("values must be a 2D array");
        expect(mockRepository.appendSheetValues).not.toHaveBeenCalled();
      });
    });

    describe("updateSheetValues", () => {
      it("JSON文字列を正しくパースしてrepositoryに渡すこと", async () => {
        const mockRepository: GoogleRepository = {
          getCalendarEvents: jest.fn(),
          getDocument: jest.fn(),
          getSpreadsheet: jest.fn(),
          getSheetValues: jest.fn(),
          appendSheetValues: jest.fn(),
          updateSheetValues: jest.fn().mockResolvedValue({
            payload: {
              spreadsheetId: "test-id",
              updatedRange: "シート1!A1:B1",
              updatedRows: 1,
              updatedColumns: 2,
              updatedCells: 2,
            },
            isSuccess: true,
            status: 200,
            message: "ok",
          }),
          getDriveFile: jest.fn(),
          searchDriveFiles: jest.fn(),
          batchUpdateDocument: jest.fn(),
        };

        const mcp = makeGoogleMcp({
          googleRepositoryFactory: mockRepository,
        });

        const result = await mcp.mcpFunctions.updateSheetValues(
          "test-spreadsheet-id",
          "シート1!A1:B1",
          '[["updated", "data"]]',
          "USER_ENTERED",
        );

        expect(mockRepository.updateSheetValues).toHaveBeenCalledWith(
          "test-spreadsheet-id",
          "シート1!A1:B1",
          [["updated", "data"]],
          "USER_ENTERED",
        );
        expect(result.isSuccess).toBe(true);
      });

      it("valueInputOptionが未指定の場合、デフォルト値が渡されること", async () => {
        const mockRepository: GoogleRepository = {
          getCalendarEvents: jest.fn(),
          getDocument: jest.fn(),
          getSpreadsheet: jest.fn(),
          getSheetValues: jest.fn(),
          appendSheetValues: jest.fn(),
          updateSheetValues: jest.fn().mockResolvedValue({
            payload: {
              spreadsheetId: "test-id",
              updatedRange: "シート1!A1:B1",
              updatedRows: 1,
              updatedColumns: 2,
              updatedCells: 2,
            },
            isSuccess: true,
            status: 200,
            message: "ok",
          }),
          getDriveFile: jest.fn(),
          searchDriveFiles: jest.fn(),
          batchUpdateDocument: jest.fn(),
        };

        const mcp = makeGoogleMcp({
          googleRepositoryFactory: mockRepository,
        });

        await mcp.mcpFunctions.updateSheetValues(
          "test-spreadsheet-id",
          "シート1!A1:B1",
          '[["updated", "data"]]',
          undefined,
        );

        expect(mockRepository.updateSheetValues).toHaveBeenCalledWith(
          "test-spreadsheet-id",
          "シート1!A1:B1",
          [["updated", "data"]],
          undefined,
        );
      });

      it("不正なJSON文字列の場合、エラーを返すこと", async () => {
        const mockRepository: GoogleRepository = {
          getCalendarEvents: jest.fn(),
          getDocument: jest.fn(),
          getSpreadsheet: jest.fn(),
          getSheetValues: jest.fn(),
          appendSheetValues: jest.fn(),
          updateSheetValues: jest.fn(),
          getDriveFile: jest.fn(),
          searchDriveFiles: jest.fn(),
          batchUpdateDocument: jest.fn(),
        };

        const mcp = makeGoogleMcp({
          googleRepositoryFactory: mockRepository,
        });

        const result = await mcp.mcpFunctions.updateSheetValues(
          "test-spreadsheet-id",
          "シート1!A1:B1",
          "invalid json",
          "USER_ENTERED",
        );

        expect(result.isSuccess).toBe(false);
        expect(result.status).toBe(400);
        expect(result.errorType).toBe(ErrorType.PARSE_ERROR);
        expect(result.message).toContain("JSONパースに失敗しました");
        expect(mockRepository.updateSheetValues).not.toHaveBeenCalled();
      });

      it("1次元配列の場合、エラーを返すこと", async () => {
        const mockRepository: GoogleRepository = {
          getCalendarEvents: jest.fn(),
          getDocument: jest.fn(),
          getSpreadsheet: jest.fn(),
          getSheetValues: jest.fn(),
          appendSheetValues: jest.fn(),
          updateSheetValues: jest.fn(),
          getDriveFile: jest.fn(),
          searchDriveFiles: jest.fn(),
          batchUpdateDocument: jest.fn(),
        };

        const mcp = makeGoogleMcp({
          googleRepositoryFactory: mockRepository,
        });

        const result = await mcp.mcpFunctions.updateSheetValues(
          "test-spreadsheet-id",
          "シート1!A1:B1",
          '["updated", "data"]',
          "USER_ENTERED",
        );

        expect(result.isSuccess).toBe(false);
        expect(result.status).toBe(400);
        expect(result.errorType).toBe(ErrorType.PARSE_ERROR);
        expect(result.message).toContain("values must be a 2D array");
        expect(mockRepository.updateSheetValues).not.toHaveBeenCalled();
      });

      it("2次元配列でない場合、エラーを返すこと", async () => {
        const mockRepository: GoogleRepository = {
          getCalendarEvents: jest.fn(),
          getDocument: jest.fn(),
          getSpreadsheet: jest.fn(),
          getSheetValues: jest.fn(),
          appendSheetValues: jest.fn(),
          updateSheetValues: jest.fn(),
          getDriveFile: jest.fn(),
          searchDriveFiles: jest.fn(),
          batchUpdateDocument: jest.fn(),
        };

        const mcp = makeGoogleMcp({
          googleRepositoryFactory: mockRepository,
        });

        const result = await mcp.mcpFunctions.updateSheetValues(
          "test-spreadsheet-id",
          "シート1!A1:B1",
          '[["updated", "data"], "not-array"]',
          "USER_ENTERED",
        );

        expect(result.isSuccess).toBe(false);
        expect(result.status).toBe(400);
        expect(result.errorType).toBe(ErrorType.PARSE_ERROR);
        expect(result.message).toContain("values must be a 2D array");
        expect(mockRepository.updateSheetValues).not.toHaveBeenCalled();
      });
    });
  });
});
