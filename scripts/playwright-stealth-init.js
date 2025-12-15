/**
 * 自動化検知の緩和（正規ログイン利用前提）。WAF 対策の補助のみ。
 */
(() => {
  try {
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined,
      configurable: true,
    });
  } catch {
    /* ignore */
  }
})();
