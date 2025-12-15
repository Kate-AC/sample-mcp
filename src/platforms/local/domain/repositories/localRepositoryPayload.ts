/**
 * Local操作のレスポンスペイロード型定義
 */

/**
 * ファイル内容のレスポンス
 */
export interface LocalReadPayload {
  /**
   * ファイルパス
   */
  path: string;
  /**
   * ファイル内容
   */
  content: string;
  /**
   * ファイルサイズ（バイト）
   */
  size: number;
  /**
   * ファイルの最終更新日時（ISO 8601形式）
   */
  modifiedAt: string;
}

/**
 * ファイル一覧のレスポンス
 */
export interface LocalListPayload {
  /**
   * ディレクトリパス
   */
  path: string;
  /**
   * ファイル・ディレクトリの一覧
   */
  items: Array<{
    /**
     * ファイル名またはディレクトリ名
     */
    name: string;
    /**
     * フルパス
     */
    path: string;
    /**
     * ファイルかディレクトリか
     */
    type: "file" | "directory";
    /**
     * ファイルサイズ（バイト、ディレクトリの場合は0）
     */
    size: number;
    /**
     * 最終更新日時（ISO 8601形式）
     */
    modifiedAt: string;
  }>;
}

/**
 * ファイル名検索結果のレスポンス
 */
export interface LocalSearchByNamePayload {
  /**
   * 検索パターン
   */
  pattern: string;
  /**
   * 検索結果のファイル一覧
   */
  files: Array<{
    /**
     * ファイルパス
     */
    path: string;
    /**
     * ファイル名
     */
    name: string;
    /**
     * ファイルサイズ（バイト）
     */
    size: number;
    /**
     * 最終更新日時（ISO 8601形式）
     */
    modifiedAt: string;
  }>;
}

/**
 * コード検索結果のレスポンス
 */
export interface LocalSearchCodePayload {
  /**
   * 検索パターン
   */
  pattern: string;
  /**
   * 検索結果
   */
  results: Array<{
    /**
     * ファイルパス
     */
    path: string;
    /**
     * マッチした行番号（1始まり）
     */
    lineNumber: number;
    /**
     * マッチした行の内容
     */
    line: string;
    /**
     * マッチした部分の前のコンテキスト（オプション）
     */
    context?: {
      before: string[];
    };
  }>;
}

/**
 * ディレクトリ名検索結果のレスポンス
 */
export interface LocalFindDirsByNamePayload {
  /**
   * 検索したディレクトリ名の配列
   */
  names: string[];
  /**
   * 検索開始ディレクトリパス
   */
  rootPath: string;
  /**
   * 一致したディレクトリ一覧（再帰的に検索）
   */
  directories: Array<{
    /**
     * ディレクトリ名
     */
    name: string;
    /**
     * ディレクトリのフルパス
     */
    path: string;
    /**
     * 最終更新日時（ISO 8601形式）
     */
    modifiedAt: string;
  }>;
}
