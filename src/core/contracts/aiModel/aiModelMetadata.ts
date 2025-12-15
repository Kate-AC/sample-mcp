export type AiModelMetadataFunction = {
  description: string;
  functionName: string;
  usage: string;
};

export interface AiModelMetadata {
  /**
   * 概要を記載
   */
  getSummary: () => string[];

  /**
   * どのようなケースで使用するかを記載
   */
  getUsageContext: () => string[];

  /**
   * 使用可能な関数を記載
   */
  getFunctions: () => AiModelMetadataFunction[];

  /**
   * セキュリティルールを記載
   */
  getSecurityRules: () => string[];
}
