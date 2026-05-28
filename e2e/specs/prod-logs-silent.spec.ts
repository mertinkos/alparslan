import { test, expect } from "../fixtures/extension";
import { openOptionsPage } from "../helpers/extension-page";
import { checkUrl } from "../helpers/extension-messaging";

test.describe("Production log gating", () => {
  test("does not emit Alparslan debug/info logs from the production service worker", async ({
    context,
    extensionId,
  }) => {
    const serviceWorker =
      context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
    const alparslanLogs: { type: string; text: string }[] = [];

    serviceWorker.on("console", (message) => {
      const text = message.text();
      if (text.includes("[Alparslan]")) {
        alparslanLogs.push({ type: message.type(), text });
      }
    });

    const options = await openOptionsPage(context, extensionId);
    await checkUrl(options, "https://www.google.com.tr/search?q=prod-log-gate");
    await options.waitForTimeout(1000);

    expect(alparslanLogs.filter((log) => log.type === "debug" || log.type === "info")).toEqual([]);
    expect(alparslanLogs.every((log) => log.type === "warning" || log.type === "error")).toBe(true);

    await options.close();
  });
});
