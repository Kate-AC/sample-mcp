import type { GoogleDocsDocumentPayload } from "@platforms/google/domain/repositories/googleRepositoryPayload";
import {
  executeGoogleDocsGetDocument,
  formatGoogleDocsDocument,
  getAvailableTabIds,
} from "@platforms/google/presentation/docsCliFormatter";
import type { McpCallRequest, McpCallResponse } from "@presentation/mcpHandler";

type McpCallFunction = <T>(
  request: McpCallRequest,
) => Promise<McpCallResponse<T>>;

describe("docsCliFormatter", () => {
  describe("formatGoogleDocsDocument", () => {
    const mockPayload: GoogleDocsDocumentPayload = {
      documentId: "test-doc-id",
      title: "Test Document",
      body: {
        content: [
          {
            endIndex: 10,
            paragraph: {
              elements: [
                {
                  endIndex: 10,
                  textRun: {
                    content: "Hello World\n",
                  },
                },
              ],
            },
          },
        ],
      },
      revisionId: "rev1",
      suggestionsViewMode: "DEFAULT_FOR_CURRENT_ACCESS",
    };

    it("基本的なドキュメントをフォーマットできること", () => {
      const result = formatGoogleDocsDocument(mockPayload);

      expect(result.text).toContain("Hello World");
      expect(result.links).toEqual([]);
      expect(result.images).toEqual([]);
    });

    it("リンクを含むドキュメントをフォーマットできること", () => {
      const payloadWithLink: GoogleDocsDocumentPayload = {
        ...mockPayload,
        body: {
          content: [
            {
              endIndex: 20,
              paragraph: {
                elements: [
                  {
                    endIndex: 20,
                    textRun: {
                      content: "Google\n",
                      textStyle: {
                        link: {
                          url: "https://google.com",
                        },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      const result = formatGoogleDocsDocument(payloadWithLink);

      expect(result.text).toContain("Google");
      expect(result.links).toHaveLength(1);
      expect(result.links[0]).toEqual({
        text: "Google",
        url: "https://google.com",
      });
    });

    it("RichLinkを含むドキュメントをフォーマットできること", () => {
      const payloadWithRichLink: GoogleDocsDocumentPayload = {
        ...mockPayload,
        body: {
          content: [
            {
              endIndex: 30,
              paragraph: {
                elements: [
                  {
                    endIndex: 30,
                    richLink: {
                      richLinkProperties: {
                        uri: "https://example.com",
                        title: "Example",
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      const result = formatGoogleDocsDocument(payloadWithRichLink);

      expect(result.text).toContain("[Example](https://example.com)");
      expect(result.links).toHaveLength(1);
      expect(result.links[0]).toEqual({
        text: "Example",
        url: "https://example.com",
      });
    });

    it("画像を含むドキュメントをフォーマットできること", () => {
      const payloadWithImage: GoogleDocsDocumentPayload = {
        ...mockPayload,
        body: {
          content: [
            {
              endIndex: 40,
              paragraph: {
                elements: [
                  {
                    endIndex: 40,
                    inlineObjectElement: {
                      inlineObjectId: "image1",
                    },
                  },
                ],
              },
            },
          ],
        },
        inlineObjects: {
          image1: {
            inlineObjectProperties: {
              embeddedObject: {
                imageProperties: {
                  contentUri: "https://example.com/image.jpg",
                  title: "Test Image",
                },
              },
            },
          },
        },
      };

      const result = formatGoogleDocsDocument(payloadWithImage);

      expect(result.text).toContain("[画像: Test Image]");
      expect(result.text).toContain("URL: https://example.com/image.jpg");
      expect(result.images).toHaveLength(1);
      expect(result.images[0]).toEqual({
        id: "image1",
        url: "https://example.com/image.jpg",
        title: "Test Image",
      });
    });

    it("テーブルを含むドキュメントをフォーマットできること", () => {
      const payloadWithTable: GoogleDocsDocumentPayload = {
        ...mockPayload,
        body: {
          content: [
            {
              endIndex: 50,
              table: {
                rows: [
                  {
                    cells: [
                      {
                        content: [
                          {
                            paragraph: {
                              elements: [
                                {
                                  textRun: {
                                    content: "Header 1",
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                      {
                        content: [
                          {
                            paragraph: {
                              elements: [
                                {
                                  textRun: {
                                    content: "Header 2",
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    cells: [
                      {
                        content: [
                          {
                            paragraph: {
                              elements: [
                                {
                                  textRun: {
                                    content: "Cell 1",
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                      {
                        content: [
                          {
                            paragraph: {
                              elements: [
                                {
                                  textRun: {
                                    content: "Cell 2",
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      };

      const result = formatGoogleDocsDocument(payloadWithTable);

      expect(result.text).toContain("[テーブル開始]");
      expect(result.text).toContain("Header 1 | Header 2");
      expect(result.text).toContain("Cell 1 | Cell 2");
      expect(result.text).toContain("[テーブル終了]");
    });

    it("タブを含むドキュメントをフォーマットできること", () => {
      const payloadWithTabs: GoogleDocsDocumentPayload = {
        ...mockPayload,
        tabs: [
          {
            tabId: "t.0",
            tabProperties: {
              tabId: "t.0",
              title: "Tab 1",
              index: 0,
            },
            documentTab: {
              body: {
                content: [
                  {
                    paragraph: {
                      elements: [
                        {
                          textRun: {
                            content: "Tab 1 Content\n",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
      };

      const result = formatGoogleDocsDocument(payloadWithTabs);

      expect(result.text).toContain("=== タブ: Tab 1 ===");
      expect(result.text).toContain("Tab 1 Content");
    });

    it("指定されたタブIDでフォーマットできること", () => {
      const payloadWithTabs: GoogleDocsDocumentPayload = {
        ...mockPayload,
        tabs: [
          {
            tabId: "t.0",
            tabProperties: {
              tabId: "t.0",
              title: "Tab 1",
              index: 0,
            },
            documentTab: {
              body: {
                content: [
                  {
                    paragraph: {
                      elements: [
                        {
                          textRun: {
                            content: "Tab 1 Content\n",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
          {
            tabId: "t.1",
            tabProperties: {
              tabId: "t.1",
              title: "Tab 2",
              index: 1,
            },
            documentTab: {
              body: {
                content: [
                  {
                    paragraph: {
                      elements: [
                        {
                          textRun: {
                            content: "Tab 2 Content\n",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
      };

      const result = formatGoogleDocsDocument(payloadWithTabs, "t.1");

      expect(result.text).toContain("=== タブ: Tab 2 ===");
      expect(result.text).toContain("Tab 2 Content");
      expect(result.text).not.toContain("Tab 1 Content");
    });

    it("存在しないタブIDを指定した場合、エラーをthrowすること", () => {
      const payloadWithTabs: GoogleDocsDocumentPayload = {
        ...mockPayload,
        tabs: [
          {
            tabId: "t.0",
            tabProperties: {
              tabId: "t.0",
              title: "Tab 1",
            },
            documentTab: {
              body: {
                content: [],
              },
            },
          },
        ],
      };

      expect(() => {
        formatGoogleDocsDocument(payloadWithTabs, "t.invalid");
      }).toThrow('指定されたタブID "t.invalid" が見つかりませんでした。');
    });

    it("サブタブ（childTabs）を含むドキュメントをフォーマットできること", () => {
      const payloadWithChildTabs: GoogleDocsDocumentPayload = {
        ...mockPayload,
        tabs: [
          {
            tabId: "t.0",
            tabProperties: {
              tabId: "t.0",
              title: "親タブ 1",
              index: 0,
            },
            documentTab: {
              body: {
                content: [
                  {
                    paragraph: {
                      elements: [
                        {
                          textRun: {
                            content: "親タブ 1 のコンテンツ\n",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            childTabs: [
              {
                tabId: "t.0.0",
                tabProperties: {
                  tabId: "t.0.0",
                  title: "サブタブ 1-1",
                  index: 0,
                },
                documentTab: {
                  body: {
                    content: [
                      {
                        paragraph: {
                          elements: [
                            {
                              textRun: {
                                content: "サブタブ 1-1 のコンテンツ\n",
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
              {
                tabId: "t.0.1",
                tabProperties: {
                  tabId: "t.0.1",
                  title: "サブタブ 1-2",
                  index: 1,
                },
                documentTab: {
                  body: {
                    content: [
                      {
                        paragraph: {
                          elements: [
                            {
                              textRun: {
                                content: "サブタブ 1-2 のコンテンツ\n",
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        ],
      };

      const result = formatGoogleDocsDocument(payloadWithChildTabs);

      expect(result.text).toContain("=== タブ: 親タブ 1 ===");
      expect(result.text).toContain("親タブ 1 のコンテンツ");
      expect(result.text).toContain("=== サブタブ: サブタブ 1-1 ===");
      expect(result.text).toContain("サブタブ 1-1 のコンテンツ");
      expect(result.text).toContain("=== サブタブ: サブタブ 1-2 ===");
      expect(result.text).toContain("サブタブ 1-2 のコンテンツ");
    });

    it("指定されたサブタブIDでフォーマットできること", () => {
      const payloadWithChildTabs: GoogleDocsDocumentPayload = {
        ...mockPayload,
        tabs: [
          {
            tabId: "t.0",
            tabProperties: {
              tabId: "t.0",
              title: "親タブ 1",
            },
            documentTab: {
              body: {
                content: [
                  {
                    paragraph: {
                      elements: [
                        {
                          textRun: {
                            content: "親タブ 1 のコンテンツ\n",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            childTabs: [
              {
                tabId: "t.0.0",
                tabProperties: {
                  tabId: "t.0.0",
                  title: "サブタブ 1-1",
                },
                documentTab: {
                  body: {
                    content: [
                      {
                        paragraph: {
                          elements: [
                            {
                              textRun: {
                                content: "サブタブ 1-1 のコンテンツ\n",
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        ],
      };

      const result = formatGoogleDocsDocument(payloadWithChildTabs, "t.0.0");

      expect(result.text).toContain("=== サブタブ: サブタブ 1-1 ===");
      expect(result.text).toContain("サブタブ 1-1 のコンテンツ");
      expect(result.text).not.toContain("親タブ 1 のコンテンツ");
    });

    it("ドロップダウン記号を[ドロップダウン]に置換すること", () => {
      const payloadWithDropdown: GoogleDocsDocumentPayload = {
        ...mockPayload,
        body: {
          content: [
            {
              endIndex: 10,
              table: {
                rows: [
                  {
                    cells: [
                      {
                        content: [
                          {
                            paragraph: {
                              elements: [
                                {
                                  textRun: {
                                    content: "\ue908",
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      };

      const result = formatGoogleDocsDocument(payloadWithDropdown);

      expect(result.text).toContain("[ドロップダウン]");
      expect(result.text).not.toContain("\ue908");
    });
  });

  describe("getAvailableTabIds", () => {
    it("タブIDのリストを取得できること", () => {
      const payload: GoogleDocsDocumentPayload = {
        documentId: "test-doc-id",
        title: "Test Document",
        body: { content: [] },
        revisionId: "rev1",
        suggestionsViewMode: "DEFAULT_FOR_CURRENT_ACCESS",
        tabs: [
          {
            tabId: "t.0",
            tabProperties: {
              tabId: "t.0",
              title: "Tab 1",
            },
          },
          {
            tabId: "t.1",
            tabProperties: {
              tabId: "t.1",
              title: "Tab 2",
            },
          },
        ],
      };

      const result = getAvailableTabIds(payload);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: "t.0", title: "Tab 1" });
      expect(result[1]).toEqual({ id: "t.1", title: "Tab 2" });
    });

    it("サブタブを含むタブIDのリストを取得できること", () => {
      const payload: GoogleDocsDocumentPayload = {
        documentId: "test-doc-id",
        title: "Test Document",
        body: { content: [] },
        revisionId: "rev1",
        suggestionsViewMode: "DEFAULT_FOR_CURRENT_ACCESS",
        tabs: [
          {
            tabId: "t.0",
            tabProperties: {
              tabId: "t.0",
              title: "親タブ 1",
            },
            childTabs: [
              {
                tabId: "t.0.0",
                tabProperties: {
                  tabId: "t.0.0",
                  title: "サブタブ 1-1",
                },
              },
              {
                tabId: "t.0.1",
                tabProperties: {
                  tabId: "t.0.1",
                  title: "サブタブ 1-2",
                },
              },
            ],
          },
        ],
      };

      const result = getAvailableTabIds(payload);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ id: "t.0", title: "親タブ 1" });
      expect(result[1]).toEqual({
        id: "t.0.0",
        title: "  サブタブ 1-1 (サブタブ)",
      });
      expect(result[2]).toEqual({
        id: "t.0.1",
        title: "  サブタブ 1-2 (サブタブ)",
      });
    });

    it("タブがない場合、空の配列を返すこと", () => {
      const payload: GoogleDocsDocumentPayload = {
        documentId: "test-doc-id",
        title: "Test Document",
        body: { content: [] },
        revisionId: "rev1",
        suggestionsViewMode: "DEFAULT_FOR_CURRENT_ACCESS",
      };

      const result = getAvailableTabIds(payload);

      expect(result).toEqual([]);
    });
  });

  describe("executeGoogleDocsGetDocument", () => {
    it("ドキュメントIDが指定されていない場合、エラーをthrowすること", async () => {
      const mockCall = jest.fn();

      await expect(executeGoogleDocsGetDocument([], mockCall)).rejects.toThrow(
        "ドキュメントIDが必要です",
      );

      expect(mockCall).not.toHaveBeenCalled();
    });

    it("ドキュメントを取得してフォーマットできること", async () => {
      const mockPayload: GoogleDocsDocumentPayload = {
        documentId: "test-doc-id",
        title: "Test Document",
        body: {
          content: [
            {
              endIndex: 10,
              paragraph: {
                elements: [
                  {
                    endIndex: 10,
                    textRun: {
                      content: "Hello World\n",
                    },
                  },
                ],
              },
            },
          ],
        },
        revisionId: "rev1",
        suggestionsViewMode: "DEFAULT_FOR_CURRENT_ACCESS",
        inlineObjects: {},
      };

      let callCount = 0;
      const mockCall = jest.fn((_request: McpCallRequest) => {
        callCount++;
        // 1回目の呼び出し（タブコンテンツ付き）
        if (callCount === 1) {
          return Promise.resolve({
            platform: "google",
            funcName: "getDocument",
            result: {
              isSuccess: true,
              payload: mockPayload,
            },
            timestamp: new Date(),
          }) as Promise<McpCallResponse<any>>;
        }

        // 2回目の呼び出し（画像データ取得）
        return Promise.resolve({
          platform: "google",
          funcName: "getDocument",
          result: {
            isSuccess: true,
            payload: {
              ...mockPayload,
              inlineObjects: {},
            },
          },
          timestamp: new Date(),
        }) as Promise<McpCallResponse<any>>;
      }) as McpCallFunction;

      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      await executeGoogleDocsGetDocument(["test-doc-id"], mockCall);

      expect(mockCall).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("タイトル: Test Document"),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Hello World"),
      );

      consoleSpy.mockRestore();
    });

    it("API呼び出しが失敗した場合、エラーをthrowすること", async () => {
      const mockCall = jest.fn((_request: McpCallRequest) => {
        return Promise.resolve({
          platform: "google",
          funcName: "getDocument",
          result: {
            isSuccess: false,
            payload: null as any,
            message: "API Error",
          },
          timestamp: new Date(),
        }) as Promise<McpCallResponse<any>>;
      }) as McpCallFunction;

      await expect(
        executeGoogleDocsGetDocument(["test-doc-id"], mockCall),
      ).rejects.toThrow("API Error");

      expect(mockCall).toHaveBeenCalledTimes(1);
    });
  });
});
