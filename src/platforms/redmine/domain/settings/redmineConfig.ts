export type RedmineConfig = {
  /** RedmineのベースURL */
  baseUrl: string;
};

export function loadRedmineConfig(): RedmineConfig {
  const config: RedmineConfig = {
    baseUrl: "https://redmine.example.com",
  };

  return config;
}
