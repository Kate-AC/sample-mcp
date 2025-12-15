/**
 * 日時フォーマット文字列を実際の日時に変換する
 * YYYY-MM-DD_HH-ii-SS_ のようなフォーマットをサポート
 */
export const formatDateString = (
  format: string,
  date: Date = new Date(),
): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return format
    .replace(/YYYY/g, String(year))
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hours)
    .replace(/ii/g, minutes)
    .replace(/SS/g, seconds);
};
