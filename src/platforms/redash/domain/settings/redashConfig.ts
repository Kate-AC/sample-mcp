export type RedashConfig = {
  /** RedashのベースURL */
  baseUrl: string;
  /** 環境名とデータソースIDの対応表 */
  dataSources: Record<string, number>;
};

/**
 * 環境名からデータソースIDを取得
 */
export const getDataSourceIdByEnv = (envName: string): number | undefined => {
  const config = loadRedashConfig();
  return config.dataSources[envName];
};

/**
 * 利用可能な環境一覧を取得
 */
export const getAvailableEnvironments = (): string[] => {
  const config = loadRedashConfig();
  return Object.keys(config.dataSources);
};

export function loadRedashConfig(): RedashConfig {
  const config: RedashConfig = {
    baseUrl: "https://redash.example.com",
    dataSources: {
      prod: 2, // sample-api 本番
      athena: 7, // sample-api Athena
      bigquery: 18, // sample-api BigQuery
      demo: 21, // sample-api demo
      stage: 22, // sample-api stage
      "athena-sample": 23, // sample-order-sync athena
      "dev-sample": 24, // sample-order-sync dev
      "prod-sample": 26, // sample-order-sync prod
      dev: 25, // sample-api dev
    },
  };

  return config;
}
