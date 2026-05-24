// E2E coverage for popup features added when the legacy bundled popup.js
// was ported back into src/. These verify the user-visible UI surfaces of
// the notification centre, quick-whitelist, detail panel toggle, and the
// in-popup whitelist management section in the Settings tab.

import { test, expect } from "../fixtures/extension";
import { openPopup } from "../helpers/extension-page";

test.describe("Popup — Notification Centre", () => {
  test("bell button is visible in the header", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    // Title attribute carries the localized hint; matching by title is
    // resilient to icon font / emoji rendering differences across OSes.
    await expect(popup.getByTitle("Bildirimleri görüntüle")).toBeVisible();
    await popup.close();
  });

  test("clicking bell opens the notification panel", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.getByTitle("Bildirimleri görüntüle").click();
    await expect(popup.getByText("Bilgilendirme Merkezi")).toBeVisible();
    await popup.close();
  });

  test("Bilgilendirme Merkezi button reveals the glossary", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.getByTitle("Bildirimleri görüntüle").click();
    await popup.getByText("Bilgilendirme Merkezi").click();
    // The glossary heading "Kısa Bilgilendirme" should now be visible
    await expect(popup.getByText("Kısa Bilgilendirme")).toBeVisible();
    // And the term definitions should be there
    await expect(popup.getByText(/Kontrol:/)).toBeVisible();
    await expect(popup.getByText(/Skor:/)).toBeVisible();
    await popup.close();
  });

  test("daily summary shows in notification panel", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.getByTitle("Bildirimleri görüntüle").click();
    // Welcome line + daily summary should both render
    await expect(popup.getByText(/Bugün sizin için/)).toBeVisible();
    await expect(popup.getByText(/gündür korunuyorsunuz/)).toBeVisible();
    await popup.close();
  });

  test("close button (✕) closes the notification panel", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.getByTitle("Bildirimleri görüntüle").click();
    await expect(popup.getByText("Bilgilendirme Merkezi")).toBeVisible();
    // After opening, the same button toggles state with title "Bildirimleri kapat"
    await popup.getByTitle("Bildirimleri kapat").click();
    // Notification panel content gone, status panel visible again
    await expect(popup.getByText("Bilgilendirme Merkezi")).not.toBeVisible();
    await popup.close();
  });
});

// NOTE: The quick-whitelist button visibility is gated on the popup having a
// real "active tab" with a non-chrome:// URL. Playwright's extension popup
// fixture doesn't reliably expose an active tab to chrome.tabs.query, so a UI
// presence check here is flaky. The underlying normalisation + membership
// logic is covered by tests/popup/whitelist-helpers.test.ts (34 cases).

test.describe("Popup — Detail Panel", () => {
  test("detail panel toggle button is visible and toggles", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    const showButton = popup.getByRole("button", { name: "Detaylı görüntüle" });
    await expect(showButton).toBeVisible();
    await showButton.click();
    // After click the button label flips to "Detayı gizle"
    await expect(popup.getByRole("button", { name: "Detayı gizle" })).toBeVisible();
    await popup.close();
  });
});

test.describe("Popup — Settings tab whitelist management", () => {
  test("Settings tab shows the inline Beyaz Liste management card", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.getByText("Ayarlar").click();
    // Header + descriptive subtitle of the popup-side whitelist card
    await expect(popup.getByText("Beyaz Liste").first()).toBeVisible();
    await expect(
      popup.getByText("Bu listedeki siteler güvenli kabul edilir"),
    ).toBeVisible();
    // Input placeholder + Ekle button
    await expect(popup.getByPlaceholder(/örnek/)).toBeVisible();
    await expect(popup.getByRole("button", { name: "Ekle" })).toBeVisible();
    await popup.close();
  });

  test("Tüm Ayarlar button (with cog emoji) is visible", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.getByText("Ayarlar").click();
    await expect(popup.getByRole("button", { name: /Tüm Ayarlar/ })).toBeVisible();
    await popup.close();
  });
});

test.describe("Popup — Status row clickable stats", () => {
  test("includes the Bilinmeyen fourth stat", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await expect(popup.getByText("Bilinmeyen", { exact: true })).toBeVisible();
    await popup.close();
  });

  test("clicking the Tehdit stat opens history filtered to threats", async ({
    context,
    extensionId,
  }) => {
    const popup = await openPopup(context, extensionId);
    await popup.getByText("Tehdit", { exact: true }).click();
    // Title bar of the filtered list
    await expect(popup.getByText("Tehdit Listesi")).toBeVisible();
    await popup.close();
  });
});
