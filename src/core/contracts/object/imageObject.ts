/**
 * 汎用的な画像オブジェクト
 * AIモデルやMCPなど、どのレイヤーからでも参照可能な共通型
 */
export type ImageObject = {
  base64: string;
  mimeType: string;
};
