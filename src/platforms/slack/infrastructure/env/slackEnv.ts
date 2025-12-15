import { getEnv } from "@infrastructure/shared/env";

export type SlackEnv = {
  userOAuthToken: string;
  botUserOAuthToken: string;
  botUserName: string;
};

export function loadSlackEnv(): SlackEnv {
  const env: SlackEnv = {
    userOAuthToken: getEnv("SLACK_USER_OAUTH_TOKEN"),
    botUserOAuthToken: getEnv("SLACK_BOT_USER_OAUTH_TOKEN"),
    botUserName: getEnv("SLACK_BOT_USER_NAME"),
  };

  if (!env.userOAuthToken) {
    throw new Error("Slack userOAuthToken is required");
  }

  if (!env.botUserOAuthToken) {
    throw new Error("Slack botUserOAuthToken is required");
  }

  if (!env.botUserName) {
    throw new Error("Slack botUserName is required");
  }

  return env;
}
