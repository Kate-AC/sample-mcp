import { ResultFs } from "@core/result/result";

/**
 * ファイル保存のオプション
 */
export type SaveFileOptions = {
  /** ディレクトリが存在しない場合は作成するか */
  createDirectory?: boolean;
  /** ファイルが既に存在する場合の動作 */
  overwrite?: boolean;
  /** エンコーディング（デフォルト: utf8） */
  encoding?: BufferEncoding;
};

/**
 * ファイル読み込みの結果
 */
export type LoadFilePayload = {
  /** ファイルコンテンツ */
  content: string;
};

/**
 * ファイル保存の結果
 */
export type SaveFilePayload = {
  /** 保存されたファイルパス */
  filePath: string;
  /** 保存されたファイルサイズ（バイト） */
  fileSize: number;
  /** 保存日時 */
  savedAt: string;
};

export interface FileStoragePort {
  /**
   * ファイルパスとボディを指定してファイルを保存する共通処理
   */
  saveFile: (
    filePath: string,
    content: string,
    options: SaveFileOptions,
  ) => Promise<ResultFs<SaveFilePayload>>;
  /**
   * ファイルを読み込む共通処理
   */
  loadFile: (
    filePath: string,
    encoding: BufferEncoding,
  ) => Promise<ResultFs<LoadFilePayload>>;
  /**
   * ファイルの存在確認
   */
  fileExists: (filePath: string) => Promise<ResultFs<boolean>>;
}
