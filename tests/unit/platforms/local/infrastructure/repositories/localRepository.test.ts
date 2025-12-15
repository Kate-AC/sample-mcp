import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { makeLocalRepository } from "@platforms/local/infrastructure/repositories/localRepository";

describe("localRepository", () => {
  let testDir: string;
  let repository: ReturnType<typeof makeLocalRepository>;

  beforeEach(() => {
    // テスト用の一時ディレクトリを作成
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "localRepository-test-"));
    repository = makeLocalRepository(testDir);

    // テスト用のファイルとディレクトリを作成
    fs.writeFileSync(path.join(testDir, "test.txt"), "Hello, World!");
    fs.writeFileSync(
      path.join(testDir, "test.ts"),
      'export const test = "test";\nconst example = "example";',
    );
    fs.mkdirSync(path.join(testDir, "subdir"), { recursive: true });
    fs.writeFileSync(path.join(testDir, "subdir", "nested.txt"), "Nested file");
  });

  afterEach(() => {
    // テスト用ディレクトリを削除
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("readFile", () => {
    it("ファイルを正しく読み込めること", async () => {
      const filePath = path.join(testDir, "test.txt");
      const result = await repository.readFile("test.txt");

      expect(result.isSuccess).toBe(true);
      expect(result.status).toBe(200);
      expect(result.payload).toBeDefined();
      expect(result.payload?.path).toBe(filePath);
      expect(result.payload?.content).toBe("Hello, World!");
      expect(result.payload?.size).toBeGreaterThan(0);
      expect(result.payload?.modifiedAt).toBeDefined();
    });

    it("絶対パスでファイルを読み込めること", async () => {
      const filePath = path.join(testDir, "test.txt");
      const result = await repository.readFile(filePath);

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.path).toBe(filePath);
      expect(result.payload?.content).toBe("Hello, World!");
    });

    it("存在しないファイルの場合、エラーを返すこと", async () => {
      const result = await repository.readFile("nonexistent.txt");

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toContain("File not found");
    });

    it("ディレクトリを指定した場合、エラーを返すこと", async () => {
      const result = await repository.readFile("subdir");

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Path is not a file");
    });
  });

  describe("listFiles", () => {
    it("ディレクトリ内のファイル一覧を取得できること", async () => {
      const result = await repository.listFiles(".");

      expect(result.isSuccess).toBe(true);
      expect(result.status).toBe(200);
      expect(result.payload).toBeDefined();
      expect(result.payload?.path).toBe(testDir);
      expect(result.payload?.items).toBeDefined();
      expect(Array.isArray(result.payload?.items)).toBe(true);
      expect(result.payload?.items.length).toBeGreaterThan(0);

      const fileNames = result.payload?.items.map((item) => item.name) || [];
      expect(fileNames).toContain("test.txt");
      expect(fileNames).toContain("test.ts");
      expect(fileNames).toContain("subdir");
    });

    it("再帰的にファイル一覧を取得できること", async () => {
      const result = await repository.listFiles(".", true);

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.items).toBeDefined();

      const paths = result.payload?.items.map((item) => item.path) || [];
      expect(paths).toContain(path.join(testDir, "subdir", "nested.txt"));
    });

    it("再帰的でない場合、サブディレクトリのファイルを含まないこと", async () => {
      const result = await repository.listFiles(".", false);

      expect(result.isSuccess).toBe(true);
      const paths = result.payload?.items.map((item) => item.path) || [];
      expect(paths).not.toContain(path.join(testDir, "subdir", "nested.txt"));
    });

    it("存在しないディレクトリの場合、エラーを返すこと", async () => {
      const result = await repository.listFiles("nonexistent");

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toContain("Directory not found");
    });

    it("ファイルを指定した場合、エラーを返すこと", async () => {
      const result = await repository.listFiles("test.txt");

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Path is not a directory");
    });
  });

  describe("searchFilesByName", () => {
    it("パターンでファイルを検索できること", async () => {
      const result = await repository.searchFilesByName("*.txt");

      expect(result.isSuccess).toBe(true);
      expect(result.status).toBe(200);
      expect(result.payload).toBeDefined();
      expect(result.payload?.pattern).toBe("*.txt");
      expect(result.payload?.files).toBeDefined();
      expect(Array.isArray(result.payload?.files)).toBe(true);

      const fileNames = result.payload?.files.map((file) => file.name) || [];
      expect(fileNames).toContain("test.txt");
      expect(fileNames).toContain("nested.txt");
    });

    it("特定のディレクトリ内で検索できること", async () => {
      const result = await repository.searchFilesByName("*.txt", "subdir");

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.files).toBeDefined();
      const fileNames = result.payload?.files.map((file) => file.name) || [];
      expect(fileNames).toContain("nested.txt");
      expect(fileNames).not.toContain("test.txt");
    });

    it("存在しないディレクトリの場合、エラーを返すこと", async () => {
      const result = await repository.searchFilesByName("*.txt", "nonexistent");

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toContain("Search root not found");
    });

    it("マッチしないパターンの場合、空の配列を返すこと", async () => {
      const result = await repository.searchFilesByName("*.nonexistent");

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.files).toEqual([]);
    });
  });

  describe("searchCode", () => {
    it("コード内のパターンを検索できること", async () => {
      const result = await repository.searchCode("test");

      expect(result.isSuccess).toBe(true);
      expect(result.status).toBe(200);
      expect(result.payload).toBeDefined();
      expect(result.payload?.pattern).toBe("test");
      expect(result.payload?.results).toBeDefined();
      expect(Array.isArray(result.payload?.results)).toBe(true);
      expect(result.payload?.results.length).toBeGreaterThan(0);

      const matchedFile = result.payload?.results.find(
        (r) => r.path === path.join(testDir, "test.ts"),
      );
      expect(matchedFile).toBeDefined();
      expect(matchedFile?.line).toContain("test");
    });

    it("正規表現パターンで検索できること", async () => {
      const result = await repository.searchCode("export.*test");

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.results).toBeDefined();
      const matchedLines = result.payload?.results.map((r) => r.line) || [];
      expect(matchedLines.some((line) => line.includes("export"))).toBe(true);
    });

    it("特定のディレクトリ内で検索できること", async () => {
      const result = await repository.searchCode("test", ".");

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.results).toBeDefined();
    });

    it("ファイルパターンを指定して検索できること", async () => {
      const result = await repository.searchCode("test", ".", "*.ts");

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.results).toBeDefined();
      const filePaths = result.payload?.results.map((r) => r.path) || [];
      expect(filePaths.every((p) => p.endsWith(".ts"))).toBe(true);
    });

    it("コンテキスト行数を指定できること", async () => {
      const result = await repository.searchCode("test", ".", "*.ts", 1);

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.results).toBeDefined();
      if (
        result.payload?.results &&
        result.payload.results.length > 0 &&
        result.payload.results[0]
      ) {
        const firstResult = result.payload.results[0];
        expect(firstResult.context).toBeDefined();
        if (firstResult.context) {
          expect(firstResult.context.before.length).toBeLessThanOrEqual(1);
        }
      }
    });

    it("存在しないディレクトリの場合、エラーを返すこと", async () => {
      const result = await repository.searchCode("test", "nonexistent");

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toContain("Search root not found");
    });

    it("マッチしないパターンの場合、空の配列を返すこと", async () => {
      const result = await repository.searchCode("nonexistentPattern12345");

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.results).toEqual([]);
    });
  });

  describe("findDirsByName", () => {
    beforeEach(() => {
      // テスト用のディレクトリ構造を作成
      fs.mkdirSync(path.join(testDir, "order-sync"), { recursive: true });
      fs.mkdirSync(path.join(testDir, "sample-api"), { recursive: true });
      fs.mkdirSync(path.join(testDir, "sample-mcp-kit"), { recursive: true });
      fs.mkdirSync(path.join(testDir, "subdir", "order-sync-nested"), {
        recursive: true,
      });
      fs.mkdirSync(path.join(testDir, "subdir", "sample-order-sync"), {
        recursive: true,
      });
    });

    it("配列で指定した文字列に一致するディレクトリを再帰的に検索できること", async () => {
      const result = await repository.findDirsByName(["order-sync"]);

      expect(result.isSuccess).toBe(true);
      expect(result.status).toBe(200);
      expect(result.payload).toBeDefined();
      expect(result.payload?.names).toEqual(["order-sync"]);
      expect(result.payload?.rootPath).toBe(testDir);
      expect(result.payload?.directories).toBeDefined();
      expect(Array.isArray(result.payload?.directories)).toBe(true);

      const dirNames = result.payload?.directories.map((dir) => dir.name) || [];
      expect(dirNames).toContain("order-sync");
      expect(dirNames).toContain("order-sync-nested");
      expect(dirNames).toContain("sample-order-sync");
    });

    it("複数の文字列で検索できること", async () => {
      const result = await repository.findDirsByName([
        "order-sync",
        "sample",
      ]);

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.directories).toBeDefined();

      const dirNames = result.payload?.directories.map((dir) => dir.name) || [];
      expect(dirNames).toContain("order-sync");
      expect(dirNames).toContain("sample-api");
      expect(dirNames).toContain("sample-mcp-kit");
    });

    it("特定のディレクトリ内で検索できること", async () => {
      const result = await repository.findDirsByName(["order-sync"], "subdir");

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.directories).toBeDefined();

      const dirNames = result.payload?.directories.map((dir) => dir.name) || [];
      expect(dirNames).toContain("order-sync-nested");
      expect(dirNames).toContain("sample-order-sync");
      expect(dirNames).not.toContain("order-sync"); // ルートレベルのものは含まれない
    });

    it("部分一致で検索できること", async () => {
      const result = await repository.findDirsByName(["sample"]);

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.directories).toBeDefined();

      const dirNames = result.payload?.directories.map((dir) => dir.name) || [];
      expect(dirNames).toContain("sample-api");
      expect(dirNames).toContain("sample-mcp-kit");
    });

    it("存在しないディレクトリの場合、エラーを返すこと", async () => {
      const result = await repository.findDirsByName(
        ["order-sync"],
        "nonexistent",
      );

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toContain("Search root not found");
    });

    it("ファイルを指定した場合、エラーを返すこと", async () => {
      const result = await repository.findDirsByName(
        ["order-sync"],
        "test.txt",
      );

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Path is not a directory");
    });

    it("マッチしない文字列の場合、空の配列を返すこと", async () => {
      const result = await repository.findDirsByName([
        "nonexistent-directory-12345",
      ]);

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.directories).toEqual([]);
    });

    it("除外パターン（node_modules等）がスキップされること", async () => {
      // node_modulesディレクトリを作成
      fs.mkdirSync(path.join(testDir, "node_modules", "order-sync"), {
        recursive: true,
      });

      const result = await repository.findDirsByName(["order-sync"]);

      expect(result.isSuccess).toBe(true);
      const dirPaths = result.payload?.directories.map((dir) => dir.path) || [];
      expect(dirPaths).not.toContain(
        path.join(testDir, "node_modules", "order-sync"),
      );
    });

    it("重複するディレクトリが返されないこと", async () => {
      // 同じディレクトリが複数回見つかる可能性がある構造を作成
      fs.mkdirSync(path.join(testDir, "test-order-sync"), { recursive: true });

      const result = await repository.findDirsByName(["order-sync"]);

      expect(result.isSuccess).toBe(true);
      const dirPaths = result.payload?.directories.map((dir) => dir.path) || [];
      const uniquePaths = new Set(dirPaths);
      expect(dirPaths.length).toBe(uniquePaths.size);
    });

    it("ディレクトリ情報が正しく返されること", async () => {
      const result = await repository.findDirsByName(["order-sync"]);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toBeDefined();
      if (result.payload && result.payload.directories.length > 0) {
        const firstDir = result.payload.directories[0];
        expect(firstDir).toBeDefined();
        if (firstDir) {
          expect(firstDir).toHaveProperty("name");
          expect(firstDir).toHaveProperty("path");
          expect(firstDir).toHaveProperty("modifiedAt");
          expect(typeof firstDir.name).toBe("string");
          expect(typeof firstDir.path).toBe("string");
          expect(typeof firstDir.modifiedAt).toBe("string");
        }
      }
    });
  });

  describe("basePathの動作", () => {
    it("basePathを指定した場合、相対パスが解決されること", async () => {
      const customBasePath = path.join(testDir, "subdir");
      const customRepository = makeLocalRepository(customBasePath);

      const result = await customRepository.readFile("nested.txt");

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.path).toBe(
        path.join(customBasePath, "nested.txt"),
      );
    });

    it("basePathが指定されない場合、process.cwd()が使用されること", async () => {
      const defaultRepository = makeLocalRepository();

      // カレントディレクトリに存在するファイルでテスト
      // このテストは環境に依存するため、エラーハンドリングを確認
      const result = await defaultRepository.readFile("nonexistent.txt");

      // ファイルが存在しない場合のエラーを確認
      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(404);
    });
  });
});
