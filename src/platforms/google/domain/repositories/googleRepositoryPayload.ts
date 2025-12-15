export type GoogleCalendarEventPayload = {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: "needsAction" | "declined" | "tentative" | "accepted";
  }>;
  location?: string;
  status: "confirmed" | "tentative" | "cancelled";
  htmlLink: string;
  created: string;
  updated: string;
};

export type GoogleCalendarListPayload = {
  kind: "calendar#calendarList";
  etag: string;
  nextPageToken?: string;
  nextSyncToken?: string;
  items: GoogleCalendarPayload[];
};

export type GoogleCalendarPayload = {
  id: string;
  summary: string;
  description?: string;
  timeZone: string;
  colorId: string;
  backgroundColor: string;
  foregroundColor: string;
  accessRole: "none" | "freeBusyReader" | "reader" | "writer" | "owner";
  primary?: boolean;
  selected?: boolean;
  hidden?: boolean;
  deleted?: boolean;
};

export type GoogleDocsDocumentPayload = {
  documentId: string;
  title: string;
  body: {
    content: Array<{
      startIndex?: number;
      endIndex: number;
      paragraph?: {
        elements: Array<{
          startIndex?: number;
          endIndex: number;
          textRun?: {
            content: string;
            textStyle?: {
              bold?: boolean;
              italic?: boolean;
              fontSize?: {
                magnitude: number;
                unit: string;
              };
              link?: {
                url?: string;
                headingId?: string;
                bookmarkId?: string;
              };
            };
          };
          richLink?: {
            richLinkProperties?: {
              uri?: string;
              title?: string;
            };
          };
          inlineObjectElement?: {
            inlineObjectId?: string;
          };
        }>;
      };
      table?: {
        rows: Array<{
          cells: Array<{
            content: Array<{
              paragraph?: {
                elements: Array<{
                  textRun?: {
                    content: string;
                    textStyle?: {
                      link?: {
                        url?: string;
                      };
                    };
                  };
                }>;
              };
            }>;
          }>;
        }>;
      };
      sectionBreak?: unknown;
      horizontalRule?: unknown;
    }>;
  };
  inlineObjects?: Record<
    string,
    {
      inlineObjectProperties?: {
        embeddedObject?: {
          imageProperties?: {
            contentUri?: string;
            title?: string;
          };
        };
      };
    }
  >;
  tabs?: Array<{
    tabId?: string;
    tabProperties?: {
      tabId?: string;
      title?: string;
      index?: number;
    };
    childTabs?: Array<any>; // サブタブの定義（再帰的な構造）
    documentTab?: {
      body?: {
        content?: Array<{
          paragraph?: {
            elements?: Array<{
              textRun?: {
                content?: string;
                textStyle?: {
                  link?: {
                    url?: string;
                  };
                };
              };
            }>;
          };
          table?: {
            rows?: number; // 通常のテーブルの場合、行数
            columns?: number; // 通常のテーブルの場合、列数
            tableRows?: Array<{
              startIndex?: number;
              endIndex?: number;
              tableCells?: Array<{
                startIndex?: number;
                endIndex?: number;
                content?: Array<{
                  paragraph?: {
                    elements?: Array<{
                      textRun?: {
                        content?: string;
                        textStyle?: {
                          link?: {
                            url?: string;
                          };
                        };
                      };
                      inlineObjectElement?: {
                        inlineObjectId?: string;
                      };
                    }>;
                  };
                }>;
              }>;
            }>;
          };
        }>;
      };
    };
  }>;
  revisionId: string;
  suggestionsViewMode:
    | "DEFAULT_FOR_CURRENT_ACCESS"
    | "SUGGESTIONS_INLINE"
    | "PREVIEW_SUGGESTIONS_ACCEPTED"
    | "PREVIEW_WITHOUT_SUGGESTIONS";
};

export type GoogleDocsBatchUpdatePayload = {
  documentId: string;
  replies: Array<Record<string, any>>;
  writeControl: {
    requiredRevisionId?: string;
  };
};

export type GoogleSheetsSpreadsheetPayload = {
  spreadsheetId: string;
  properties: {
    title: string;
    locale: string;
    autoRecalc: "ON_CHANGE" | "MINUTE" | "HOUR" | "DAILY";
    timeZone: string;
  };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      index: number;
      sheetType: "GRID" | "OBJECT";
      gridProperties?: {
        rowCount: number;
        columnCount: number;
        frozenRowCount?: number;
        frozenColumnCount?: number;
      };
    };
  }>;
  spreadsheetUrl: string;
};

export type GoogleSheetsValuesPayload = {
  range: string;
  majorDimension: "ROWS" | "COLUMNS";
  values: string[][];
};

export type GoogleSheetsAppendPayload = {
  spreadsheetId: string;
  tableRange: string;
  updates: {
    spreadsheetId: string;
    updatedRange: string;
    updatedRows: number;
    updatedColumns: number;
    updatedCells: number;
  };
};

export type GoogleSheetsUpdatePayload = {
  spreadsheetId: string;
  updatedRange: string;
  updatedRows: number;
  updatedColumns: number;
  updatedCells: number;
};

export type GoogleDriveFilePayload = {
  id: string;
  name: string;
  description?: string;
  mimeType: string;
  parents?: string[];
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
  owners?: Array<{
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  }>;
  permissions?: Array<{
    id: string;
    type: "user" | "group" | "domain" | "anyone";
    role:
      | "owner"
      | "organizer"
      | "fileOrganizer"
      | "writer"
      | "commenter"
      | "reader";
    emailAddress?: string;
    domain?: string;
  }>;
};
