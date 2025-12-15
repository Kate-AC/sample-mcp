import { AxiosResponse } from "axios";

export interface ApiClientPort {
  baseUrl: string;
  headers: Record<string, string>;
  get: <T>(
    url: string,
    params?: Record<string, any>,
  ) => Promise<AxiosResponse<T>>;
  post: <T>(
    url: string,
    data?: Record<string, any>,
  ) => Promise<AxiosResponse<T>>;
  put: <T>(
    url: string,
    data?: Record<string, any>,
  ) => Promise<AxiosResponse<T>>;
}

export type ApiResponse<T> = AxiosResponse<T>;
