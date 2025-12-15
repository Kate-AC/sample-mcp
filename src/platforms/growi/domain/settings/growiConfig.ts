export type GrowiConfig = {
  /** GrowiのベースURL */
  baseUrl: string;
  /** Growiのベース作成パス */
  baseCreatePath: string;
  /** ページタイトルのプレフィックスフォーマット */
  pageTitlePrefixFormat: string;
};

export function loadGrowiConfig(): GrowiConfig {
  const config: GrowiConfig = {
    baseUrl: "https://wiki.example.com",
    baseCreatePath: "/generated_by_ai",
    pageTitlePrefixFormat: "YYYY-MM-DD_HH-ii-SS_",
  };

  return config;
}
