import { test, expect } from "../fixtures/extension";
import { openPopup, navigateToSite, openOptionsPage } from "../helpers/extension-page";

test.describe("Dashboard Score — Happy Path", () => {
  test("should show score with no browsing activity", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.getByText("Skor").click();
    // "Günlük skor" başlığı skor halkasının üstünde görünür.
    await expect(popup.getByText("Günlük skor")).toBeVisible();
    await popup.close();
  });

  test("should show score breakdown panel (Skor Analizi)", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.getByText("Skor").click();
    // Skor halkası altındaki yeni "Skor Analizi" panosu.
    await expect(popup.getByText("Günlük skor")).toBeVisible({ timeout: 10000 });
    await expect(popup.getByText("Skor Analizi")).toBeVisible();
    // Detaylı Güvenlik Taraması insight satırı her zaman görünür
    // (kapaliyken kirmizi rozet, aciksa yesil cumle).
    await expect(popup.getByText(/Detaylı Güvenlik Taraması/)).toBeVisible();
    await popup.close();
  });

  test("should show clean state messages when no activity", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.getByText("Skor").click();
    // Hiç aktivite yoksa tehdit ve risk için "bulunmadı" mesajları görünür.
    await expect(popup.getByText("Tehdit bulunmadı")).toBeVisible();
    await expect(popup.getByText("Potansiyel risk bulunmadı")).toBeVisible();
    await popup.close();
  });

  test("should update score after browsing HTTPS sites", async ({ context, extensionId }) => {
    const page1 = await navigateToSite(context, "https://example.com");
    await page1.waitForTimeout(1000);
    await page1.close();

    const page2 = await navigateToSite(context, "https://www.google.com");
    await page2.waitForTimeout(1000);
    await page2.close();

    const popup = await openPopup(context, extensionId);
    await popup.getByText("Skor").click();

    const scoreElement = popup.getByTestId("dashboard-score");
    await expect(scoreElement).toBeVisible({ timeout: 10000 });
    const scoreText = await scoreElement.textContent();
    const score = parseInt(scoreText || "0", 10);
    expect(score).toBeGreaterThan(0);
    await popup.close();
  });

  test("should show options page header", async ({ context, extensionId }) => {
    const options = await openOptionsPage(context, extensionId);
    await expect(options.getByText("Alparslan Ayarlar")).toBeVisible();
    await options.close();
  });
});

test.describe("Dashboard Score — Negative Scenarios", () => {
  test("negative: score should not exceed 100", async ({ context, extensionId }) => {
    for (let i = 0; i < 5; i++) {
      const page = await navigateToSite(context, "https://example.com");
      await page.waitForTimeout(300);
      await page.close();
    }

    const popup = await openPopup(context, extensionId);
    await popup.getByText("Skor").click();
    const scoreElement = popup.getByTestId("dashboard-score");
    await expect(scoreElement).toBeVisible({ timeout: 10000 });
    const scoreText = await scoreElement.textContent();
    const score = parseInt(scoreText || "0", 10);
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThanOrEqual(0);
    await popup.close();
  });

  test("negative: dashboard should handle extension disabled state", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    // "Aktif" toggle artik <button role="switch"> — aria-label uzerinden bulunur.
    // Bu butona basinca koruma kapanir; intro/onboarding overlay'i acilir
    // ve React tree gizlenir. Bu yuzden Skor sekmesine tiklayamayiz —
    // disabled state'in dogru yansidigini introScreen'in varligi ile
    // dogrularız.
    await popup.getByRole("switch", { name: /aktif|pasif|koruma/i }).first().click();
    await expect(popup.locator("#introScreen")).toBeVisible();
    await popup.close();
  });
});
