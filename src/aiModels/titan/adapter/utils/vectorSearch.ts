import type {
  TitanEmbeddedDocument,
  TitanEmbeddingsContext,
} from "../../domain/repositories/titanRepositoryRequestPayload";

/**
 * コサイン類似度を計算
 */
export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * クエリに最も関連する文書を検索
 */
export const searchRelevantDocuments = (
  queryVector: number[],
  context: TitanEmbeddingsContext,
): TitanEmbeddedDocument[] => {
  // 各文書との類似度を計算
  const scored = context.documents.map((doc) => ({
    document: doc,
    score: cosineSimilarity(queryVector, doc.vector),
  }));

  // 類似度でソート（降順）
  scored.sort((a, b) => b.score - a.score);

  // topK件を返す
  return scored.slice(0, context.topK || 3).map((item) => item.document);
};
