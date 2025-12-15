import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { makeFileStorage } from "@infrastructure/shared/fileStorage";

describe("fileStorage", () => {
  let testDir: string;
  let fileStorage: ReturnType<typeof makeFileStorage>;

  beforeEach(() => {
    // テスト用の一時ディレクトリを作成
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "fileStorage-test-"));
    fileStorage = makeFileStorage();
  });

  afterEach(() => {
    // テスト用ディレクトリを削除
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("saveFile", () => {
    it("ファイルを保存できること", async () => {
      const filePath = path.join(testDir, "test.txt");
      const content = "Hello, World!";

      const result = await fileStorage.saveFile(filePath, content, {});

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.filePath).toBe(filePath);
      expect(result.payload?.fileSize).toBeGreaterThan(0);
      expect(result.payload?.savedAt).toBeDefined();

      // ファイルが実際に保存されているか確認
      expect(fs.existsSync(filePath)).toBe(true);
      const savedContent = fs.readFileSync(filePath, "utf8");
      expect(savedContent).toBe(content);
    });

    it("ディレクトリが存在しない場合、自動的に作成すること", async () => {
      const filePath = path.join(testDir, "subdir", "nested", "test.txt");
      const content = "Test content";

      const result = await fileStorage.saveFile(filePath, content, {
        createDirectory: true,
      });

      expect(result.isSuccess).toBe(true);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.existsSync(path.dirname(filePath))).toBe(true);
    });

    it("createDirectory=falseの場合、ディレクトリを作成しないこと", async () => {
      const filePath = path.join(testDir, "nonexistent", "test.txt");
      const content = "Test content";

      const result = await fileStorage.saveFile(filePath, content, {
        createDirectory: false,
      });

      expect(result.isSuccess).toBe(false);
      expect(result.message).toBeDefined();
    });

    it("overwrite=falseの場合、既存ファイルを上書きしないこと", async () => {
      const filePath = path.join(testDir, "test.txt");
      const originalContent = "Original content";
      const newContent = "New content";

      // 最初のファイルを保存
      await fileStorage.saveFile(filePath, originalContent, {});

      // 上書き禁止で保存を試みる
      const result = await fileStorage.saveFile(filePath, newContent, {
        overwrite: false,
      });

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain("File already exists");

      // 元のコンテンツが保持されているか確認
      const savedContent = fs.readFileSync(filePath, "utf8");
      expect(savedContent).toBe(originalContent);
    });

    it("overwrite=trueの場合、既存ファイルを上書きすること", async () => {
      const filePath = path.join(testDir, "test.txt");
      const originalContent = "Original content";
      const newContent = "New content";

      // 最初のファイルを保存
      await fileStorage.saveFile(filePath, originalContent, {});

      // 上書きして保存
      const result = await fileStorage.saveFile(filePath, newContent, {
        overwrite: true,
      });

      expect(result.isSuccess).toBe(true);

      // 新しいコンテンツが保存されているか確認
      const savedContent = fs.readFileSync(filePath, "utf8");
      expect(savedContent).toBe(newContent);
    });

    it("ファイルサイズが正しく取得できること", async () => {
      const filePath = path.join(testDir, "test.txt");
      const content = "Test content with some length";

      const result = await fileStorage.saveFile(filePath, content, {});

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.fileSize).toBe(Buffer.byteLength(content, "utf8"));
    });

    it("空のコンテンツも保存できること", async () => {
      const filePath = path.join(testDir, "empty.txt");
      const content = "";

      const result = await fileStorage.saveFile(filePath, content, {});

      expect(result.isSuccess).toBe(true);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(result.payload?.fileSize).toBe(0);
    });

    it("日本語のコンテンツも正しく保存できること", async () => {
      const filePath = path.join(testDir, "japanese.txt");
      const content = "こんにちは、世界！";

      const result = await fileStorage.saveFile(filePath, content, {});

      expect(result.isSuccess).toBe(true);

      const savedContent = fs.readFileSync(filePath, "utf8");
      expect(savedContent).toBe(content);
    });
  });

  describe("loadFile", () => {
    it("ファイルを読み込めること", async () => {
      const filePath = path.join(testDir, "test.txt");
      const content = "Test content";
      fs.writeFileSync(filePath, content, "utf8");

      const result = await fileStorage.loadFile(filePath, "utf8");

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.content).toBe(content);
    });

    it("ファイルが存在しない場合、エラーを返すこと", async () => {
      const filePath = path.join(testDir, "nonexistent.txt");

      const result = await fileStorage.loadFile(filePath, "utf8");

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain("File not found");
    });

    it("空のファイルも読み込めること", async () => {
      const filePath = path.join(testDir, "empty.txt");
      fs.writeFileSync(filePath, "", "utf8");

      const result = await fileStorage.loadFile(filePath, "utf8");

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.content).toBe("");
    });

    it("日本語のコンテンツも正しく読み込めること", async () => {
      const filePath = path.join(testDir, "japanese.txt");
      const content = "こんにちは、世界！";
      fs.writeFileSync(filePath, content, "utf8");

      const result = await fileStorage.loadFile(filePath, "utf8");

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.content).toBe(content);
    });

    it("大きなファイルも読み込めること", async () => {
      const filePath = path.join(testDir, "large.txt");
      const content = "x".repeat(10000); // 10KB
      fs.writeFileSync(filePath, content, "utf8");

      const result = await fileStorage.loadFile(filePath, "utf8");

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.content).toBe(content);
      expect(result.payload?.content.length).toBe(10000);
    });
  });

  describe("fileExists", () => {
    it("ファイルが存在する場合、trueを返すこと", async () => {
      const filePath = path.join(testDir, "test.txt");
      fs.writeFileSync(filePath, "content", "utf8");

      const result = await fileStorage.fileExists(filePath);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toBe(true);
    });

    it("ファイルが存在しない場合、falseを返すこと", async () => {
      const filePath = path.join(testDir, "nonexistent.txt");

      const result = await fileStorage.fileExists(filePath);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toBe(false);
    });

    it("ディレクトリの存在も確認できること", async () => {
      const dirPath = path.join(testDir, "subdir");
      fs.mkdirSync(dirPath);

      const result = await fileStorage.fileExists(dirPath);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toBe(true);
    });
  });

  describe("統合テスト", () => {
    it("保存して読み込むフローが正常に動作すること", async () => {
      const filePath = path.join(testDir, "integration.txt");
      const content = "Integration test content";

      // 保存
      const saveResult = await fileStorage.saveFile(filePath, content, {});
      expect(saveResult.isSuccess).toBe(true);

      // 存在確認
      const existsResult = await fileStorage.fileExists(filePath);
      expect(existsResult.payload).toBe(true);

      // 読み込み
      const loadResult = await fileStorage.loadFile(filePath, "utf8");
      expect(loadResult.isSuccess).toBe(true);
      expect(loadResult.payload?.content).toBe(content);
    });

    it("上書き保存が正常に動作すること", async () => {
      const filePath = path.join(testDir, "overwrite.txt");

      // 1回目の保存
      await fileStorage.saveFile(filePath, "First content", {});
      const firstLoad = await fileStorage.loadFile(filePath, "utf8");
      expect(firstLoad.payload?.content).toBe("First content");

      // 2回目の保存（上書き）
      await fileStorage.saveFile(filePath, "Second content", {});
      const secondLoad = await fileStorage.loadFile(filePath, "utf8");
      expect(secondLoad.payload?.content).toBe("Second content");
    });
  });
});
