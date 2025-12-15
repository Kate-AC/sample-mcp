export type SlackConfig = {
  /** SlackのベースURL */
  baseUrl: string;
  /** SlackのファイルベースURL */
  baseFileUrl: string;
};

export function loadSlackConfig(): SlackConfig {
  const config: SlackConfig = {
    baseUrl: "https://slack.com",
    baseFileUrl: "https://files.slack.com",
  };

  return config;
}
