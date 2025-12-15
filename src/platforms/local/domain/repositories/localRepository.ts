import { Result } from "@core/result/result";
import {
  LocalFindDirsByNamePayload,
  LocalListPayload,
  LocalReadPayload,
  LocalSearchByNamePayload,
  LocalSearchCodePayload,
} from "./localRepositoryPayload";

/**
 * Local操作のリポジトリインターフェース
 */
export interface LocalRepository {
  /**
   * 指定されたパスのファイル内容を読み込む
   *
   * @param filePath 読み込むファイルのパス（絶対パスまたは相対パス）
   * @returns ファイル内容
   */
  readFile: (filePath: string) => Promise<Result<LocalReadPayload>>;

  /**
   * ディレクトリ内のファイル一覧を取得する
   *
   * @param dirPath ディレクトリパス（絶対パスまたは相対パス）
   * @param recursive 再帰的に検索するか（デフォルト: false）
   * @returns ファイル一覧
   */
  listFiles: (
    dirPath: string,
    recursive?: boolean,
  ) => Promise<Result<LocalListPayload>>;

  /**
   * パターンマッチでファイル名を検索する
   *
   * @param pattern 検索パターン（glob形式、例: "*.ts"）
   * @param rootPath 検索開始ディレクトリ（デフォルト: カレントディレクトリ）
   * @returns 検索結果のファイル一覧
   */
  searchFilesByName: (
    pattern: string,
    rootPath?: string,
  ) => Promise<Result<LocalSearchByNamePayload>>;

  /**
   * ファイルの中身を検索する
   *
   * @param pattern 検索パターン（正規表現または文字列）
   * @param rootPath 検索開始ディレクトリ（デフォルト: カレントディレクトリ）
   * @param filePattern 検索対象ファイルのパターン（glob形式、例: "*.ts"）
   * @param contextLines マッチ行の前後に表示する行数（デフォルト: 2）
   * @returns 検索結果
   */
  searchCode: (
    pattern: string,
    rootPath?: string,
    filePattern?: string,
    contextLines?: number,
  ) => Promise<Result<LocalSearchCodePayload>>;

  /**
   * 配列で渡した文字列に一致するディレクトリを再帰的に検索して返す
   *
   * @param names 検索するディレクトリ名の配列
   * @param rootPath 検索開始ディレクトリ（デフォルト: カレントディレクトリ）
   * @returns 一致したディレクトリ一覧
   */
  findDirsByName: (
    names: string[],
    rootPath?: string,
  ) => Promise<Result<LocalFindDirsByNamePayload>>;
}
