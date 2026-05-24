import { test, expect } from "../fixtures/extension";
import { openPopup } from "../helpers/extension-page";

test.describe("Popup Navigation", () => {
  test("should show header with Alparslan branding", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    // Scope to #root: the onboarding overlay (#introScreen, outside the React
    // tree) also contains an "Alparslan ..." title, so an unscoped
    // getByText(...).first() can resolve to that hidden node.
    await expect(popup.locator("#root").getByText("Alparslan").first()).toBeVisible();
    await popup.close();
  });

  test("should show Durum and Skor tabs", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await expect(popup.getByText("Durum")).toBeVisible();
    await expect(popup.getByText("Skor")).toBeVisible();
    await popup.close();
  });

  test("should default to Durum tab with stats visible", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    // "Kontrol" also appears inside "Kontrol ediliyor..." briefly during
    // init; pin to the exact stat label.
    await expect(popup.getByText("Kontrol", { exact: true })).toBeVisible();
    await expect(popup.getByText("Tehdit")).toBeVisible();
    await popup.close();
  });

  test("should switch to Skor tab when clicked", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.getByText("Skor").click();
    await expect(popup.getByText("Haftalık Güvenlik Skoru")).toBeVisible();
    await popup.close();
  });

  test("should switch back to Durum tab", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.getByText("Skor").click();
    await expect(popup.getByText("Haftalık Güvenlik Skoru")).toBeVisible();
    await popup.getByText("Durum").click();
    await expect(popup.getByText("Kontrol")).toBeVisible();
    await popup.close();
  });

  test("should show toggle switch in header", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await expect(popup.getByText("Aktif")).toBeVisible();
    await popup.close();
  });

  test("negative: should show disabled state when toggled off", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    // Click the toggle track div (width: 36px, inside the header label)
    const toggleTrack = popup.locator('label div[style*="width: 36px"]');
    await toggleTrack.click();
    // Disabling protection now surfaces the activation/onboarding overlay
    // (#introScreen, driven by src/popup/intro-screen.ts) and hides the main
    // React tree (#root). The overlay is the "protection off" state and offers
    // the "Koruma sistemini başlat" re-activation affordance.
    await expect(popup.locator("#introScreen")).toBeVisible();
    await expect(popup.getByText("Koruma sistemini başlat")).toBeVisible();
    await expect(popup.locator("#root")).toBeHidden();
    await popup.close();
  });
});
