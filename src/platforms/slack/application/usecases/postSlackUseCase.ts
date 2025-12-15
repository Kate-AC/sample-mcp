import {
  SlackPostMessageOptions,
  SlackRepository,
} from "@platforms/slack/domain/repositories/slackRepository";
import {
  SlackEnv,
  loadSlackEnv,
} from "@platforms/slack/infrastructure/env/slackEnv";
import { makeSlackApiClient } from "@platforms/slack/infrastructure/http/slackApiClient";
import { makeSlackRepository } from "@platforms/slack/infrastructure/repositories/slackRepository";

export const makePostSlackUseCase = (
  deps: {
    slackRepositoryFactory: () => SlackRepository;
    slackEnv: SlackEnv;
  } = {
    slackRepositoryFactory: () =>
      makeSlackRepository(() => makeSlackApiClient(false)),
    slackEnv: loadSlackEnv(),
  },
) => ({
  invoke: async (channel: string, text: string, options?: string) => {
    const slackRepository = deps.slackRepositoryFactory();

    const parsedOptions = {
      username: deps.slackEnv.botUserName,
      ...(JSON.parse(options || "{}") as SlackPostMessageOptions),
    };

    return await slackRepository.postMessage(channel, text, parsedOptions);
  },
});
