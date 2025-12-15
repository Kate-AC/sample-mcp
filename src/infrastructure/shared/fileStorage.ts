import * as fs from "fs";
import * as path from "path";
import { FileStoragePort } from "@core/contracts/application/fileStoragePort";
import { safeCallFs } from "@core/result/safeCallFs";

export const makeFileStorage = (): FileStoragePort => ({
  saveFile: async (filePath, content, options = {}) => {
    return safeCallFs(async () => {
      const {
        createDirectory = true,
        overwrite = true,
        encoding = "utf8",
      } = options;

      // ディレクトリの存在確認と作成
      const dir = path.dirname(filePath);
      if (createDirectory && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // ファイルの存在確認
      if (!overwrite && fs.existsSync(filePath)) {
        throw new Error(`File already exists: ${filePath}`);
      }

      // ファイル保存
      fs.writeFileSync(filePath, content, encoding);

      // ファイルサイズ取得
      const stats = fs.statSync(filePath);

      return {
        filePath,
        fileSize: stats.size,
        savedAt: new Date().toISOString(),
      };
    });
  },
  loadFile: async (filePath, encoding = "utf8") => {
    return safeCallFs(async () => {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      return {
        content: fs.readFileSync(filePath, encoding),
      };
    });
  },
  fileExists: async (filePath: string) => {
    return safeCallFs(async () => {
      return fs.existsSync(filePath);
    });
  },
});
