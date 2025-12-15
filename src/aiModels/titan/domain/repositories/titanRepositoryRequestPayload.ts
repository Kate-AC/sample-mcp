/**
 * Titan リクエスト用のペイロード定義
 */

export type TitanMessage = {
  role: "user" | "assistant";
  content: string;
};

export type TitanRequest = {
  inputText: string;
  textGenerationConfig?: {
    maxTokenCount?: number;
    temperature?: number;
    topP?: number;
    stopSequences?: string[];
  };
};

/**
 * Titan Embeddingsで使用する文書の型
 */
export type TitanEmbeddingsDocument = {
  /** 文書のID（任意） */
  id?: string;
  /** 文書の内容 */
  text: string;
  /** メタデータ（任意） */
  metadata?: Record<string, any>;
};

/**
 * ベクトル化された文書
 */
export type TitanEmbeddedDocument = {
  /** 元の文書情報 */
  document: TitanEmbeddingsDocument;
  /** ベクトル表現（1024次元） */
  vector: number[];
};

/**
 * Titan Embeddingsのコンテキスト
 * askメソッドに渡してRAGを実現
 */
export type TitanEmbeddingsContext = {
  /** ベクトル化された文書群 */
  documents: TitanEmbeddedDocument[];
  /** 検索時に返す最大文書数 */
  topK?: number;
};

/**
 * Titan Embeddings APIのリクエスト
 */
export type TitanEmbeddingsRequest = {
  inputText: string;
};
