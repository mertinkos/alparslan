import { test, expect } from "../fixtures/extension";
import { openOptionsPage } from "../helpers/extension-page";
import type { Page } from "@playwright/test";

async function resetOptionsStorage(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        chrome.storage.sync.clear(() => resolve());
      }),
  );
  await page.reload();
  await page.waitForLoadState("domcontentloaded");
}

test.describe("Whitelist validation", () => {
  test("accepts valid entries in normalized form", async ({ context, extensionId }) => {
    const options = await openOptionsPage(context, extensionId);
    const cases = [
      { raw: "example.com", normalized: "example.com" },
      { raw: "https://example.com/path?x=1", normalized: "example.com" },
      { raw: "https://www.example.com:8443/", normalized: "www.example.com" },
    ];

    for (const entry of cases) {
      await resetOptionsStorage(options);
      await options.getByRole("textbox").fill(entry.raw);
      await options.getByRole("button", { name: "Ekle" }).click();
      await expect(options.getByText(entry.normalized, { exact: true })).toBeVisible();
    }

    await options.close();
  });

  test("rejects public suffixes and empty URL inputs", async ({ context, extensionId }) => {
    const options = await openOptionsPage(context, extensionId);
    await expect(options.getByText("Beyaz liste boş")).toBeVisible();

    for (const raw of [".com", "com", "com.tr", "co.uk", "", "http://"]) {
      await options.getByRole("textbox").fill(raw);
      await options.getByRole("button", { name: "Ekle" }).click();
      await expect(options.getByText("Beyaz liste boş")).toBeVisible();
    }

    await options.close();
  });
});
