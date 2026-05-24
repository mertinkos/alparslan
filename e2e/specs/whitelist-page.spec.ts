import { test, expect } from "../fixtures/extension";
import type { BrowserContext, Page } from "@playwright/test";

// The standalone whitelist page (whitelist.html + whitelist.js) writes to the
// same settings.whitelist array as the popup quick-add. PR #30's normalize fix
// must apply here too, otherwise "WWW.EXAMPLE.COM" leaks "www." and silently
// fails to match the user's actual browsing domain.
async function openWhitelistPage(context: BrowserContext, extensionId: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/whitelist.html`);
  await page.waitForLoadState("domcontentloaded");
  return page;
}

test.describe("Whitelist standalone page", () => {
  test("normalizes uppercase + www to a bare lowercase domain", async ({ context, extensionId }) => {
    const page = await openWhitelistPage(context, extensionId);
    await page.fill("#whitelistInput", "WWW.EXAMPLE.COM");
    await page.click("#addBtn");

    await expect(page.getByText("example.com", { exact: true })).toBeVisible();
    // The leaked "www.example.com" form must never be stored.
    await expect(page.getByText("www.example.com", { exact: true })).toHaveCount(0);
    await page.close();
  });

  test("strips protocol and path from a pasted URL", async ({ context, extensionId }) => {
    const page = await openWhitelistPage(context, extensionId);
    await page.fill("#whitelistInput", "https://www.Garanti.com.tr/login?x=1");
    await page.click("#addBtn");

    await expect(page.getByText("garanti.com.tr", { exact: true })).toBeVisible();
    await page.close();
  });

  test("does not add duplicate entries that normalize to the same domain", async ({ context, extensionId }) => {
    const page = await openWhitelistPage(context, extensionId);
    await page.fill("#whitelistInput", "example.com");
    await page.click("#addBtn");
    await page.fill("#whitelistInput", "WWW.EXAMPLE.COM");
    await page.click("#addBtn");

    await expect(page.getByText("example.com", { exact: true })).toHaveCount(1);
    await page.close();
  });

  test("search filters the rendered entries", async ({ context, extensionId }) => {
    const page = await openWhitelistPage(context, extensionId);
    for (const d of ["example.com", "akbank.com.tr"]) {
      await page.fill("#whitelistInput", d);
      await page.click("#addBtn");
    }
    await page.fill("#searchInput", "akbank");
    await expect(page.getByText("akbank.com.tr", { exact: true })).toBeVisible();
    await expect(page.getByText("example.com", { exact: true })).toHaveCount(0);
    await page.close();
  });

  test("removes an entry", async ({ context, extensionId }) => {
    const page = await openWhitelistPage(context, extensionId);
    await page.fill("#whitelistInput", "example.com");
    await page.click("#addBtn");
    await expect(page.getByText("example.com", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Sil" }).click();
    await expect(page.getByText("Beyaz liste boş")).toBeVisible();
    await page.close();
  });
});
