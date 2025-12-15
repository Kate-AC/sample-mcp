import axios from "axios";
import {
  ApiClientPort,
  ApiResponse,
} from "@core/contracts/application/apiClientPort";

export const makeApiClient = (
  baseUrl: string,
  headers: Record<string, string>,
): ApiClientPort => {
  return {
    baseUrl,
    headers,
    get: async <T = unknown>(
      url: string,
      params: Record<string, any> = {},
    ): Promise<ApiResponse<T>> => {
      return await request<T>(baseUrl, headers, url, params, "GET");
    },
    post: async <T = unknown>(
      url: string,
      data: Record<string, any> = {},
    ): Promise<ApiResponse<T>> => {
      return await request<T>(baseUrl, headers, url, data, "POST");
    },
    put: async <T = unknown>(
      url: string,
      data: Record<string, any> = {},
    ): Promise<ApiResponse<T>> => {
      return await request<T>(baseUrl, headers, url, data, "PUT");
    },
  };
};

const request = async <T = unknown>(
  baseUrl: string,
  headers: Record<string, string>,
  url: string,
  data: Record<string, any> = {},
  method: "GET" | "POST" | "PUT",
  timeout: number = 30000, // 30秒のタイムアウト
): Promise<ApiResponse<T>> => {
  return await axios({
    method,
    url: `${baseUrl}${url}`,
    headers,
    timeout,
    data: method === "GET" ? undefined : data,
    params: method === "GET" ? data : undefined,
  });
};
