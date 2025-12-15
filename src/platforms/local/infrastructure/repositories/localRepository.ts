import * as fs from "fs";
import { glob } from "glob";
import * as path from "path";
import { Result } from "@core/result/result";
import { ErrorType } from "@core/result/result";
import { LocalRepository } from "../../domain/repositories/localRepository";
import {
  LocalFindDirsByNamePayload,
  LocalListPayload,
  LocalReadPayload,
  LocalSearchByNamePayload,
  LocalSearchCodePayload,
} from "../../domain/repositories/localRepositoryPayload";

/**
 * Local操作のリポジトリ実装
 */
export const makeLocalRepository = (basePath?: string): LocalRepository => {
  const getBasePath = (): string => {
    return basePath || process.cwd();
  };

  const resolvePath = (targetPath: string): string => {
    if (path.isAbsolute(targetPath)) {
      return targetPath;
    }
    return path.resolve(getBasePath(), targetPath);
  };

  return {
    readFile: async (filePath: string): Promise<Result<LocalReadPayload>> => {
      try {
        const absolutePath = resolvePath(filePath);

        if (!fs.existsSync(absolutePath)) {
          return {
            payload: null as unknown as LocalReadPayload,
            status: 404,
            isSuccess: false,
            message: `File not found: ${absolutePath}`,
            errorType: ErrorType.OTHER_ERROR,
          };
        }

        const stats = fs.statSync(absolutePath);
        if (!stats.isFile()) {
          return {
            payload: null as unknown as LocalReadPayload,
            status: 400,
            isSuccess: false,
            message: `Path is not a file: ${absolutePath}`,
            errorType: ErrorType.OTHER_ERROR,
          };
        }

        const content = fs.readFileSync(absolutePath, "utf-8");

        return {
          payload: {
            path: absolutePath,
            content,
            size: stats.size,
            modifiedAt: stats.mtime.toISOString(),
          },
          status: 200,
          isSuccess: true,
          message: "ok",
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          payload: null as unknown as LocalReadPayload,
          status: 500,
          isSuccess: false,
          message: `Failed to read file: ${errorMessage}`,
          errorType: ErrorType.OTHER_ERROR,
        };
      }
    },

    listFiles: async (
      dirPath: string,
      recursive = false,
    ): Promise<Result<LocalListPayload>> => {
      try {
        const absolutePath = resolvePath(dirPath);

        if (!fs.existsSync(absolutePath)) {
          return {
            payload: null as unknown as LocalListPayload,
            status: 404,
            isSuccess: false,
            message: `Directory not found: ${absolutePath}`,
            errorType: ErrorType.OTHER_ERROR,
          };
        }

        const stats = fs.statSync(absolutePath);
        if (!stats.isDirectory()) {
          return {
            payload: null as unknown as LocalListPayload,
            status: 400,
            isSuccess: false,
            message: `Path is not a directory: ${absolutePath}`,
            errorType: ErrorType.OTHER_ERROR,
          };
        }

        const items: LocalListPayload["items"] = [];

        const readDir = (dir: string, depth = 0): void => {
          if (depth > 10) {
            return; // 深さ制限
          }

          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            try {
              const entryStats = fs.statSync(fullPath);
              items.push({
                name: entry.name,
                path: fullPath,
                type: entry.isDirectory() ? "directory" : "file",
                size: entryStats.size,
                modifiedAt: entryStats.mtime.toISOString(),
              });

              if (recursive && entry.isDirectory()) {
                readDir(fullPath, depth + 1);
              }
            } catch {
              // 読み込みエラーは無視
            }
          }
        };

        readDir(absolutePath);

        return {
          payload: {
            path: absolutePath,
            items,
          },
          status: 200,
          isSuccess: true,
          message: "ok",
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          payload: null as unknown as LocalListPayload,
          status: 500,
          isSuccess: false,
          message: `Failed to list files: ${errorMessage}`,
          errorType: ErrorType.OTHER_ERROR,
        };
      }
    },

    searchFilesByName: async (
      pattern: string,
      rootPath?: string,
    ): Promise<Result<LocalSearchByNamePayload>> => {
      try {
        const searchRoot = rootPath ? resolvePath(rootPath) : getBasePath();

        if (!fs.existsSync(searchRoot)) {
          return {
            payload: null as unknown as LocalSearchByNamePayload,
            status: 404,
            isSuccess: false,
            message: `Search root not found: ${searchRoot}`,
            errorType: ErrorType.OTHER_ERROR,
          };
        }

        // パターンが再帰的でない場合（**を含まない場合）、**/を追加して再帰的に検索
        const recursivePattern = pattern.includes("**")
          ? pattern
          : `**/${pattern}`;

        const files = await glob(recursivePattern, {
          cwd: searchRoot,
          absolute: true,
          ignore: [
            "**/node_modules/**",
            "**/vendor/**",
            "**/dist/**",
            "**/build/**",
            "**/.git/**",
          ],
        });

        const results: LocalSearchByNamePayload["files"] = [];

        for (const filePath of files) {
          try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              results.push({
                path: filePath,
                name: path.basename(filePath),
                size: stats.size,
                modifiedAt: stats.mtime.toISOString(),
              });
            }
          } catch {
            // 読み込みエラーは無視
          }
        }

        return {
          payload: {
            pattern,
            files: results,
          },
          status: 200,
          isSuccess: true,
          message: "ok",
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          payload: null as unknown as LocalSearchByNamePayload,
          status: 500,
          isSuccess: false,
          message: `Failed to search files: ${errorMessage}`,
          errorType: ErrorType.OTHER_ERROR,
        };
      }
    },

    searchCode: async (
      pattern: string,
      rootPath?: string,
      filePattern = "**/*.{ts,js,php,py,java,go,rs}",
      contextLines = 2,
    ): Promise<Result<LocalSearchCodePayload>> => {
      try {
        const searchRoot = rootPath ? resolvePath(rootPath) : getBasePath();

        if (!fs.existsSync(searchRoot)) {
          return {
            payload: null as unknown as LocalSearchCodePayload,
            status: 404,
            isSuccess: false,
            message: `Search root not found: ${searchRoot}`,
            errorType: ErrorType.OTHER_ERROR,
          };
        }

        const globPattern = path.isAbsolute(filePattern)
          ? filePattern
          : path.join(searchRoot, filePattern);

        const files = await glob(globPattern, {
          cwd: searchRoot,
          absolute: true,
          ignore: [
            "**/node_modules/**",
            "**/vendor/**",
            "**/dist/**",
            "**/build/**",
            "**/.git/**",
          ],
        });

        const regex = new RegExp(pattern, "i");
        const results: LocalSearchCodePayload["results"] = [];

        for (const filePath of files) {
          try {
            const content = fs.readFileSync(filePath, "utf-8");
            const lines = content.split("\n");

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (line && regex.test(line)) {
                const before = lines
                  .slice(Math.max(0, i - contextLines), i)
                  .map((l, idx) => `${i - contextLines + idx + 1}: ${l || ""}`);

                results.push({
                  path: filePath,
                  lineNumber: i + 1,
                  line: line.trim(),
                  context: {
                    before,
                  },
                });
              }
            }
          } catch {
            // 読み込みエラーは無視
          }
        }

        return {
          payload: {
            pattern,
            results,
          },
          status: 200,
          isSuccess: true,
          message: "ok",
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          payload: null as unknown as LocalSearchCodePayload,
          status: 500,
          isSuccess: false,
          message: `Failed to search code: ${errorMessage}`,
          errorType: ErrorType.OTHER_ERROR,
        };
      }
    },

    findDirsByName: async (
      names: string[],
      rootPath?: string,
    ): Promise<Result<LocalFindDirsByNamePayload>> => {
      try {
        const searchRoot = rootPath ? resolvePath(rootPath) : getBasePath();

        if (!fs.existsSync(searchRoot)) {
          return {
            payload: null as unknown as LocalFindDirsByNamePayload,
            status: 404,
            isSuccess: false,
            message: `Search root not found: ${searchRoot}`,
            errorType: ErrorType.OTHER_ERROR,
          };
        }

        const stats = fs.statSync(searchRoot);
        if (!stats.isDirectory()) {
          return {
            payload: null as unknown as LocalFindDirsByNamePayload,
            status: 400,
            isSuccess: false,
            message: `Path is not a directory: ${searchRoot}`,
            errorType: ErrorType.OTHER_ERROR,
          };
        }

        const directories: LocalFindDirsByNamePayload["directories"] = [];
        const foundPaths = new Set<string>(); // 重複を防ぐ

        // 再帰的にディレクトリを検索
        const searchDirectories = (dir: string, depth = 0): void => {
          if (depth > 20) {
            return; // 深さ制限
          }

          try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
              if (!entry.isDirectory()) {
                continue;
              }

              const dirName = entry.name;
              const fullPath = path.join(dir, dirName);

              // 除外パターン
              if (
                dirName === "node_modules" ||
                dirName === ".git" ||
                dirName === "dist" ||
                dirName === "build" ||
                dirName.startsWith(".")
              ) {
                continue;
              }

              // 配列内の文字列のいずれかがディレクトリ名に含まれているかチェック
              const matches = names.some((name) => dirName.includes(name));

              if (matches && !foundPaths.has(fullPath)) {
                try {
                  const dirStats = fs.statSync(fullPath);
                  directories.push({
                    name: dirName,
                    path: fullPath,
                    modifiedAt: dirStats.mtime.toISOString(),
                  });
                  foundPaths.add(fullPath);
                } catch {
                  // 読み込みエラーは無視
                }
              }

              // 再帰的に検索を続ける
              searchDirectories(fullPath, depth + 1);
            }
          } catch {
            // 読み込みエラーは無視
          }
        };

        searchDirectories(searchRoot);

        return {
          payload: {
            names,
            rootPath: searchRoot,
            directories,
          },
          status: 200,
          isSuccess: true,
          message: "ok",
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          payload: null as unknown as LocalFindDirsByNamePayload,
          status: 500,
          isSuccess: false,
          message: `Failed to find directories: ${errorMessage}`,
          errorType: ErrorType.OTHER_ERROR,
        };
      }
    },
  };
};
