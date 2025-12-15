import axios from "axios";
import { makeApiClient } from "@infrastructure/shared/apiClient";

// axiosをモック化
jest.mock("axios");
const mockedAxios = axios as jest.MockedFunction<typeof axios>;

describe("apiClient", () => {
  const baseUrl = "https://api.example.com";
  const headers = { Authorization: "Bearer test-token" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("makeApiClient", () => {
    it("ApiClientオブジェクトを正しく作成できること", () => {
      const client = makeApiClient(baseUrl, headers);

      expect(client).toBeDefined();
      expect(client.baseUrl).toBe(baseUrl);
      expect(client.headers).toBe(headers);
      expect(client.get).toBeDefined();
      expect(client.post).toBeDefined();
      expect(client.put).toBeDefined();
    });
  });

  describe("get", () => {
    it("GETリクエストが成功すること", async () => {
      const mockResponse = {
        data: { id: 1, name: "Test User" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      mockedAxios.mockResolvedValue(mockResponse);

      const client = makeApiClient(baseUrl, headers);
      const result = await client.get("/users/1");

      expect(result.data).toEqual(mockResponse.data);
      expect(result.status).toBe(200);

      expect(mockedAxios).toHaveBeenCalledWith({
        method: "GET",
        url: `${baseUrl}/users/1`,
        headers,
        timeout: 30000,
        data: undefined,
        params: {},
      });
    });

    it("GETリクエストにクエリパラメータを渡せること", async () => {
      const mockResponse = {
        data: { results: [] },
        status: 200,
      };

      mockedAxios.mockResolvedValue(mockResponse);

      const client = makeApiClient(baseUrl, headers);
      const params = { page: 1, limit: 10 };
      await client.get("/users", params);

      expect(mockedAxios).toHaveBeenCalledWith({
        method: "GET",
        url: `${baseUrl}/users`,
        headers,
        timeout: 30000,
        data: undefined,
        params,
      });
    });

    it("GETリクエストが失敗した場合、例外をthrowすること", async () => {
      const mockError = new Error("Network Error");
      mockedAxios.mockRejectedValue(mockError);

      const client = makeApiClient(baseUrl, headers);

      await expect(client.get("/users/999")).rejects.toThrow("Network Error");
    });
  });

  describe("post", () => {
    it("POSTリクエストが成功すること", async () => {
      const mockResponse = {
        data: { id: 2, name: "New User" },
        status: 201,
        statusText: "Created",
        headers: {},
        config: {} as any,
      };

      mockedAxios.mockResolvedValue(mockResponse);

      const client = makeApiClient(baseUrl, headers);
      const postData = { name: "New User" };
      const result = await client.post("/users", postData);

      expect(result.data).toEqual(mockResponse.data);
      expect(result.status).toBe(201);

      expect(mockedAxios).toHaveBeenCalledWith({
        method: "POST",
        url: `${baseUrl}/users`,
        headers,
        timeout: 30000,
        data: postData,
        params: undefined,
      });
    });

    it("POSTリクエストが失敗した場合、例外をthrowすること", async () => {
      const mockError = new Error("Validation Error");
      mockedAxios.mockRejectedValue(mockError);

      const client = makeApiClient(baseUrl, headers);

      await expect(client.post("/users", { name: "" })).rejects.toThrow(
        "Validation Error",
      );
    });
  });

  describe("put", () => {
    it("PUTリクエストが成功すること", async () => {
      const mockResponse = {
        data: { id: 1, name: "Updated User" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      mockedAxios.mockResolvedValue(mockResponse);

      const client = makeApiClient(baseUrl, headers);
      const putData = { name: "Updated User" };
      const result = await client.put("/users/1", putData);

      expect(result.data).toEqual(mockResponse.data);
      expect(result.status).toBe(200);

      expect(mockedAxios).toHaveBeenCalledWith({
        method: "PUT",
        url: `${baseUrl}/users/1`,
        headers,
        timeout: 30000,
        data: putData,
        params: undefined,
      });
    });

    it("PUTリクエストが失敗した場合、例外をthrowすること", async () => {
      const mockError = new Error("Server Error");
      mockedAxios.mockRejectedValue(mockError);

      const client = makeApiClient(baseUrl, headers);

      await expect(client.put("/users/1", { name: "Error" })).rejects.toThrow(
        "Server Error",
      );
    });
  });

  describe("エラーハンドリング", () => {
    it("エラーはsafeCallに委譲されること", async () => {
      const mockError = new Error("Connection timeout");
      mockedAxios.mockRejectedValue(mockError);

      const client = makeApiClient(baseUrl, headers);

      await expect(client.get("/users")).rejects.toThrow("Connection timeout");
    });
  });
});
