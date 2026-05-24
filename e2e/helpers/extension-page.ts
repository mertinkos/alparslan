import type { BrowserContext, Page } from "@playwright/test";

export async function openPopup(context: BrowserContext, extensionId: string): Promise<Page> {
  const popupUrl = "chrome-extension://" + extensionId + "/popup.html";
  const page = await context.newPage();
  await page.goto(popupUrl);
  await page.waitForLoadState("domcontentloaded");
  // On a fresh install, src/popup/intro-screen.ts keeps #root hidden behind
  // the onboarding overlay until the user activates the extension. Tests
  // typically want the main React tree; seed storage here so the intro
  // listener auto-flips to the main popup.
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      chrome.storage.sync.set({ enabled: true }, () => resolve());
    });
  });
  // Wait for intro to dismiss and #root to be revealed
  await page.waitForFunction(() => {
    const root = document.getElementById("root");
    return root !== null && !root.classList.contains("hidden");
  }, { timeout: 5000 });
  return page;
}

export async function openOptionsPage(context: BrowserContext, extensionId: string): Promise<Page> {
  const optionsUrl = "chrome-extension://" + extensionId + "/options.html";
  const page = await context.newPage();
  await page.goto(optionsUrl);
  await page.waitForLoadState("domcontentloaded");
  return page;
}

export async function navigateToSite(context: BrowserContext, url: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForLoadState("domcontentloaded");
  return page;
}
