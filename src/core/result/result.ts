export enum ErrorType {
  PARSE_ERROR = "parse_error",
  OTHER_ERROR = "other_error",
}

export type Result<T> = {
  payload: T;
  status: number;
  isSuccess: boolean;
  message?: string;
  errorType?: ErrorType;
};

export type ResultFs<T> = {
  payload: T;
  isSuccess: boolean;
  message?: string;
  errorType?: ErrorType;
};
