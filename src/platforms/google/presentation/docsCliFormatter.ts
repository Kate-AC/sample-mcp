import type { GoogleDocsDocumentPayload } from "@platforms/google/domain/repositories/googleRepositoryPayload";
import type { McpCallRequest, McpCallResponse } from "@presentation/mcpHandler";

export type ExtractedLinks = Array<{ text: string; url: string }>;
export type ExtractedImages = Array<{
  id: string;
  url?: string;
  title?: string;
}>;

export type FormattedDocument = {
  text: string;
  links: ExtractedLinks;
  images: ExtractedImages;
};

/**
 * タブとサブタブを再帰的に処理する
 * @param tabs タブの配列
 * @param specifiedTabId 特定のタブIDを指定する場合
 * @param level ネストレベル（インデント表示用）
 * @returns 処理されたコンテンツアイテムと、タブが見つかったかのフラグ
 */
const processTabsRecursively = (
  tabs: Array<any>,
  specifiedTabId: string | null,
  level: number = 0,
): { contentItems: Array<any>; fullText: string; found: boolean } => {
  const contentItems: Array<any> = [];
  let fullText = "";
  let found = false;

  for (const tab of tabs) {
    const tabId = (tab as any).tabProperties?.tabId || tab.tabId;
    const tabTitle =
      (tab as any).tabProperties?.title ||
      (tab as any).tabProperties?.tabId ||
      tab.tabId ||
      "不明";

    // タブIDが指定されている場合は、指定されたタブのみ処理
    const shouldProcessThisTab = !specifiedTabId || tabId === specifiedTabId;

    if (shouldProcessThisTab && tab.documentTab?.body?.content) {
      found = true;
      const indent = "  ".repeat(level);
      fullText += `\n\n${indent}=== ${level > 0 ? "サブ" : ""}タブ: ${tabTitle} ===\n\n`;
      for (const contentItem of tab.documentTab.body.content) {
        contentItems.push({ item: contentItem, isTab: true });
      }
    }

    // サブタブ（childTabs）がある場合は再帰的に処理
    if (
      tab.childTabs &&
      Array.isArray(tab.childTabs) &&
      tab.childTabs.length > 0
    ) {
      const childResult = processTabsRecursively(
        tab.childTabs,
        specifiedTabId,
        level + 1,
      );
      contentItems.push(...childResult.contentItems);
      fullText += childResult.fullText;
      if (childResult.found) {
        found = true;
      }
    }
  }

  return { contentItems, fullText, found };
};

/**
 * Google Docsのドキュメントをプレーンテキスト形式に変換する
 * @param payload Google Docs APIレスポンス
 * @param specifiedTabId 特定のタブIDを指定する場合（オプション）
 * @param imageDataSource 画像情報を含むデータソース（通常のpayloadとは別に取得した画像データ）
 * @returns フォーマット済みのドキュメント
 */
export const formatGoogleDocsDocument = (
  payload: GoogleDocsDocumentPayload,
  specifiedTabId: string | null = null,
  imageDataSource: any = null,
): FormattedDocument => {
  const imageDataSource_ = imageDataSource || payload;

  let fullText = "";
  const links: ExtractedLinks = [];
  const images: ExtractedImages = [];

  // タブがある場合はタブから処理、ない場合はbody.contentから処理
  const contentItems: Array<any> = [];

  if (payload.tabs && Array.isArray(payload.tabs) && payload.tabs.length > 0) {
    // タブがある場合：各タブとサブタブのコンテンツを再帰的に処理
    const tabResult = processTabsRecursively(payload.tabs, specifiedTabId, 0);
    contentItems.push(...tabResult.contentItems);
    fullText += tabResult.fullText;

    if (specifiedTabId && !tabResult.found) {
      // タブが見つからない場合は、エラーメッセージを返す
      throw new Error(
        `指定されたタブID "${specifiedTabId}" が見つかりませんでした。`,
      );
    }
  } else if (payload.body?.content) {
    // タブがない場合：通常のbody.contentを処理
    for (const contentItem of payload.body.content) {
      contentItems.push({ item: contentItem, isTab: false });
    }
  } else {
    throw new Error("ドキュメントのコンテンツが見つかりませんでした");
  }

  for (const { item: contentItem } of contentItems) {
    // 段落要素の処理
    if (contentItem.paragraph?.elements) {
      const result = processParagraphElements(
        contentItem.paragraph.elements,
        imageDataSource_,
      );
      fullText += result.text;
      links.push(...result.links);
      images.push(...result.images);
    }

    // テーブルの処理
    if (contentItem.table && typeof contentItem.table === "object") {
      const result = processTable(contentItem.table, imageDataSource_);
      fullText += result.text;
      links.push(...result.links);
      images.push(...result.images);
    }
  }

  return {
    text: fullText,
    links,
    images,
  };
};

/**
 * 段落要素を処理する
 */
const processParagraphElements = (
  elements: any[],
  imageDataSource: any,
): { text: string; links: ExtractedLinks; images: ExtractedImages } => {
  let text = "";
  const links: ExtractedLinks = [];
  const images: ExtractedImages = [];

  for (const element of elements) {
    if (element.textRun?.content) {
      const elementText = element.textRun.content;
      text += elementText;

      // リンク情報を抽出
      if (element.textRun.textStyle?.link?.url) {
        links.push({
          text: elementText.trim(),
          url: element.textRun.textStyle.link.url,
        });
      }
    }

    // RichLinkの処理
    if (element.richLink?.richLinkProperties?.uri) {
      const url = element.richLink.richLinkProperties.uri;
      const title = element.richLink.richLinkProperties.title || url;
      links.push({ text: title, url });
      text += `[${title}](${url})\n`;
    }

    // 画像要素の処理
    if (element.inlineObjectElement?.inlineObjectId) {
      const imageResult = processImageElement(
        element.inlineObjectElement.inlineObjectId,
        imageDataSource,
      );
      if (imageResult.url) {
        text += `\n[画像: ${imageResult.title || imageResult.id}]\n`;
        text += `URL: ${imageResult.url}\n\n`;
      } else {
        text += `\n[画像: ${imageResult.id}]\n`;
      }
      images.push(imageResult);
    }
  }

  return { text, links, images };
};

/**
 * 画像要素を処理する
 */
const processImageElement = (
  imageId: string,
  imageDataSource: any,
): { id: string; url?: string; title?: string } => {
  const inlineObject = imageDataSource.inlineObjects?.[imageId];
  const imageUrl =
    inlineObject?.inlineObjectProperties?.embeddedObject?.imageProperties
      ?.contentUri;
  const imageTitle =
    inlineObject?.inlineObjectProperties?.embeddedObject?.imageProperties
      ?.title;

  const image: { id: string; url?: string; title?: string } = {
    id: imageId,
  };
  if (imageUrl) {
    image.url = imageUrl;
  }
  if (imageTitle) {
    image.title = imageTitle;
  }
  return image;
};

/**
 * テーブルを処理する
 */
const processTable = (
  table: any,
  imageDataSource: any,
): { text: string; links: ExtractedLinks; images: ExtractedImages } => {
  let text = "";
  const links: ExtractedLinks = [];
  const images: ExtractedImages = [];

  // タブ内のテーブル構造（tableRows/tableCells）に対応
  if (table.tableRows && Array.isArray(table.tableRows)) {
    text += `\n[テーブル開始 (${table.rows || table.tableRows.length}行 × ${table.columns || "?"}列)]\n`;
    for (const row of table.tableRows) {
      if (!row.tableCells || !Array.isArray(row.tableCells)) continue;

      const rowText: string[] = [];
      for (const cell of row.tableCells) {
        const cellResult = processTableCell(cell, imageDataSource);
        rowText.push(cellResult.text);
        links.push(...cellResult.links);
        images.push(...cellResult.images);
      }
      text += rowText.join(" | ") + "\n";
    }
    text += "[テーブル終了]\n\n";
  }
  // 通常のテーブル構造（rows/cells）にも対応
  else if (table.rows && Array.isArray(table.rows)) {
    text += "\n[テーブル開始]\n";
    for (const row of table.rows) {
      if (!row.cells || !Array.isArray(row.cells)) continue;

      const rowText: string[] = [];
      for (const cell of row.cells) {
        const cellResult = processTableCell(cell, imageDataSource);
        rowText.push(cellResult.text);
        links.push(...cellResult.links);
        images.push(...cellResult.images);
      }
      text += rowText.join(" | ") + "\n";
    }
    text += "[テーブル終了]\n\n";
  }

  return { text, links, images };
};

/**
 * テーブルセルを処理する
 */
const processTableCell = (
  cell: any,
  imageDataSource: any,
): { text: string; links: ExtractedLinks; images: ExtractedImages } => {
  let cellText = "";
  const links: ExtractedLinks = [];
  const images: ExtractedImages = [];

  if (!cell.content || !Array.isArray(cell.content)) {
    return { text: "", links, images };
  }

  for (const cellContent of cell.content) {
    if (cellContent.paragraph?.elements) {
      const result = processTableCellElements(
        cellContent.paragraph.elements,
        imageDataSource,
      );
      cellText += result.text;
      links.push(...result.links);
      images.push(...result.images);
    }
  }

  return { text: cellText.trim(), links, images };
};

/**
 * テーブルセル内の要素を処理する
 */
const processTableCellElements = (
  elements: any[],
  imageDataSource: any,
): { text: string; links: ExtractedLinks; images: ExtractedImages } => {
  let text = "";
  const links: ExtractedLinks = [];
  const images: ExtractedImages = [];

  for (const element of elements) {
    if (element.textRun?.content) {
      let elementText = element.textRun.content;

      // 空の記号（\ue908）はドロップダウンのプレースホルダーとして表示
      // Google Docs APIではドロップダウンの選択値を直接取得できないため、
      // ドロップダウンの存在を示すマーカーに置換
      if (elementText.includes("\ue908")) {
        elementText = elementText.replace(/\ue908/g, "[ドロップダウン]");
      }

      text += elementText;

      // セル内のリンク
      if (element.textRun.textStyle?.link?.url) {
        links.push({
          text: elementText.trim(),
          url: element.textRun.textStyle.link.url,
        });
      }
    }

    // セル内の画像要素の処理
    if (element.inlineObjectElement?.inlineObjectId) {
      const imageResult = processImageElement(
        element.inlineObjectElement.inlineObjectId,
        imageDataSource,
      );
      images.push(imageResult);
    }
  }

  return { text, links, images };
};

/**
 * タブとサブタブのIDを再帰的に収集する
 */
const collectTabIdsRecursively = (
  tabs: Array<any>,
  level: number = 0,
): Array<{ id: string; title: string; level: number }> => {
  const result: Array<{ id: string; title: string; level: number }> = [];

  for (const tab of tabs) {
    const tabId = (tab as any).tabProperties?.tabId || tab.tabId;
    const tabTitle = (tab as any).tabProperties?.title || tabId || "不明";
    result.push({
      id: tabId || "不明",
      title: tabTitle,
      level,
    });

    // サブタブがある場合は再帰的に処理
    if (
      tab.childTabs &&
      Array.isArray(tab.childTabs) &&
      tab.childTabs.length > 0
    ) {
      const childResults = collectTabIdsRecursively(tab.childTabs, level + 1);
      result.push(...childResults);
    }
  }

  return result;
};

/**
 * 利用可能なタブIDのリストを取得する（サブタブを含む）
 */
export const getAvailableTabIds = (
  payload: GoogleDocsDocumentPayload,
): Array<{ id: string; title: string }> => {
  const tabs: Array<{ id: string; title: string }> = [];

  if (payload.tabs && Array.isArray(payload.tabs)) {
    const allTabs = collectTabIdsRecursively(payload.tabs);
    for (const tab of allTabs) {
      const indent = "  ".repeat(tab.level);
      tabs.push({
        id: tab.id,
        title: `${indent}${tab.title}${tab.level > 0 ? " (サブタブ)" : ""}`,
      });
    }
  }

  return tabs;
};

/**
 * MCP関数呼び出しの型定義
 */
type McpCallFunction = <T>(
  request: McpCallRequest,
) => Promise<McpCallResponse<T>>;

/**
 * Google DocsのgetDocumentコマンドを実行し、フォーマットして表示する
 */
export const executeGoogleDocsGetDocument = async (
  args: string[],
  mcpCall: McpCallFunction,
): Promise<void> => {
  if (args.length === 0) {
    throw new Error("ドキュメントIDが必要です");
  }

  const documentId = args[0] as string;

  // 引数を準備（タブコンテンツを含める）
  let finalArgs: (string | Record<string, string>)[];
  if (args.length > 1 && typeof args[1] === "object") {
    const existingParams = args[1] as Record<string, string>;
    finalArgs = [documentId, { ...existingParams, includeTabsContent: "true" }];
  } else {
    finalArgs = [documentId, { includeTabsContent: "true" }];
  }

  // ドキュメントを取得
  const response = await mcpCall<GoogleDocsDocumentPayload>({
    platform: "google",
    funcName: "getDocument",
    args: finalArgs,
  });

  if (!response.result.isSuccess || !response.result.payload) {
    throw new Error(
      response.result.message || "ドキュメントの取得に失敗しました",
    );
  }

  const payload = response.result.payload;

  // 画像データを取得・マージ
  const mergedInlineObjects: Record<string, any> = {};
  if (payload.inlineObjects) {
    Object.assign(mergedInlineObjects, payload.inlineObjects);
  }
  if (payload.tabs && Array.isArray(payload.tabs)) {
    for (const tab of payload.tabs) {
      const tabDocumentTab = (tab as any).documentTab;
      if (tabDocumentTab?.inlineObjects) {
        Object.assign(mergedInlineObjects, tabDocumentTab.inlineObjects);
      }
    }
  }

  // 2回目のAPI呼び出しで画像データを取得
  const imageDataResponse = await mcpCall<GoogleDocsDocumentPayload>({
    platform: "google",
    funcName: "getDocument",
    args: [documentId], // includeTabsContentなしで取得
  });

  if (
    imageDataResponse.result.isSuccess &&
    imageDataResponse.result.payload?.inlineObjects
  ) {
    Object.assign(
      mergedInlineObjects,
      imageDataResponse.result.payload.inlineObjects,
    );
  }

  const imageDataSource =
    Object.keys(mergedInlineObjects).length > 0
      ? { inlineObjects: mergedInlineObjects }
      : payload;

  // タブIDを取得
  const specifiedTabId =
    (args.length > 2 && typeof args[2] === "string"
      ? args[2]
      : args.length > 1 && typeof args[1] === "string"
        ? args[1]
        : null) || null;

  try {
    // ドキュメントをフォーマット
    const formatted = formatGoogleDocsDocument(
      payload,
      specifiedTabId,
      imageDataSource,
    );

    console.log(`タイトル: ${payload.title}\n`);
    console.log("内容:\n");
    console.log(formatted.text);

    // リンク情報を表示
    if (formatted.links.length > 0) {
      console.log("\n=== リンク一覧 ===");
      formatted.links.forEach((link, index) => {
        console.log(`${index + 1}. ${link.text}`);
        console.log(`   ${link.url}`);
      });
    }

    // 画像情報を表示
    if (formatted.images.length > 0) {
      console.log("\n=== 画像一覧 ===");
      formatted.images.forEach((image, index) => {
        console.log(`${index + 1}. ${image.title || image.id}`);
        if (image.url) {
          console.log(`   URL: ${image.url}`);
          console.log(`   ※注意: このURLは30分間のみ有効です`);
        } else {
          console.log(`   ※画像情報の取得に失敗しました`);
        }
      });
    }
  } catch (error: any) {
    if (error.message?.includes("指定されたタブID") && payload.tabs) {
      console.log(`⚠️  ${error.message}`);
      console.log("利用可能なタブ:");
      const availableTabs = getAvailableTabIds(payload);
      availableTabs.forEach((tab) => {
        console.log(`  - ${tab.title} (ID: ${tab.id})`);
      });
    } else {
      console.log(`⚠️  ${error.message || "エラーが発生しました"}`);
      if (
        error.message?.includes(
          "ドキュメントのコンテンツが見つかりませんでした",
        )
      ) {
        console.log(JSON.stringify(payload, null, 2));
      }
    }
  }
};
