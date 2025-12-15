export type McpMetadataCommand = {
  description: string;
  command: string;
  usage: string;
};

export interface McpMetadata {
  /**
   * 概要を記載
   */
  getSummary: () => string[];

  /**
   * どのようなケースで使用するかを記載
   */
  getUsageContext: () => string[];

  /**
   * 使用可能なコマンドを記載
   */
  getCommands: () => McpMetadataCommand[];

  /**
   * セキュリティルールを記載
   */
  getSecurityRules: () => string[];
}
