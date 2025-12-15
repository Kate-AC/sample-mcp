import { makeSlackRepository } from "@platforms/slack/infrastructure/repositories/slackRepository";

describe("SlackRepository.searchMessages (unit)", () => {
  test("GETでqueryとparamsが渡る（文字列paramsはURLデコード）", async () => {
    const get = jest.fn().mockResolvedValue({ data: { ok: true } });
    const fakeClient = { get } as any;
    const factory = () => fakeClient;

    const repo = makeSlackRepository(factory);
    await repo.searchMessages(
      "copilot ライセンス",
      "count=5&foo=%E6%97%A5%E6%9C%AC",
    );

    expect(get).toHaveBeenCalledWith("/search.messages", {
      query: "copilot ライセンス",
      count: "5",
      foo: "日本",
    });
  });

  test("オブジェクトparamsもそのままマージされる", async () => {
    const get = jest.fn().mockResolvedValue({ data: { ok: true } });
    const fakeClient = { get } as any;
    const factory = () => fakeClient;

    const repo = makeSlackRepository(factory);
    await repo.searchMessages("foo", { count: "3", sort: "timestamp" });

    expect(get).toHaveBeenCalledWith("/search.messages", {
      query: "foo",
      count: "3",
      sort: "timestamp",
    });
  });
});
