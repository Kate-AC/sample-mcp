import { Result } from "@core/result/result";

export interface PrivacyFilterList {
  [key: string]: PrivacyFilter;
}

export type PrivacyFilter<T = any> = (result: Result<T>) => Result<T>;

export const maskEmail = (email: string): string => {
  // @で分割
  const [local, domain] = email.split("@");
  // 最初の文字を除いて*でマスキング
  return `${local?.[0]}***@${domain}`;
};

export const maskPhone = (phone: string): string => {
  // 数字だけにする
  const digitsOnly = phone.replace(/\D/g, "");
  // 最後の4桁を除いて*でマスキング
  return digitsOnly.replace(/\d(?=\d{4})/g, "*");
};

export const maskName = (name: string): string => {
  // 最初の文字を残して残りを*でマスキング
  if (name.length === 0) return name;
  return name[0] + "*".repeat(name.length - 1);
};
