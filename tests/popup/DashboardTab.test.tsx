// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardTab from "@/popup/DashboardTab";
import t from "@/i18n/tr";

describe("DashboardTab", () => {
  // Yeni model: skor backend'in dashboard.score'undan DEGIL, insightCounts'tan
  // hesaplaniyor. Test mock'unda bu sayilari geciyoruz ki popup ayni formulu
  // kullanip beklenen sonucu uretsin.
  // 0 tehdit + 1 risk + 0 safe + scan acik = 100 - 5 = 95
  const mockDashboard = {
    score: 95,
    breakdown: { httpsScore: 0, threatAvoidanceScore: 95, activityScore: 0, trackerScore: 0 },
    currentWeek: { urlsChecked: 50, httpsCount: 45, httpCount: 5, threatsBlocked: 0, trackersBlocked: 0, dangerousSitesVisited: 0, suspiciousSitesVisited: 0, unknownSitesVisited: 1, weekStart: Date.now() },
    previousWeek: null,
    tips: [t.tips.notActive],
    insightCounts: {
      uniqueSafe: 0,
      uniqueThreat: 0,
      uniqueUnknown: 1,
      scanOn: true,
    },
  };

  beforeEach(() => {
    chrome.runtime.sendMessage = vi.fn((msg: unknown, cb?: unknown) => {
      const message = msg as { type: string };
      const callback = cb as ((response: unknown) => void) | undefined;
      if (message.type === "GET_DASHBOARD_SCORE" && callback) {
        callback({ dashboard: mockDashboard });
      } else if (message.type === "GET_STATS" && callback) {
        callback({ stats: { urlsChecked: 0, threatsBlocked: 0, trackersBlocked: 0 } });
      } else if (message.type === "GET_HISTORY" && callback) {
        callback({ history: [] });
      } else if (message.type === "GET_SETTINGS" && callback) {
        callback({ settings: { networkMonitoringEnabled: true } });
      }
    }) as unknown as typeof chrome.runtime.sendMessage;
    // chrome.storage.onChanged listener kullaniliyor; minimal stub.
    (globalThis as unknown as { chrome: typeof chrome }).chrome.storage = {
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    } as unknown as typeof chrome.storage;
  });

  it("renders the computed score value", async () => {
    render(<DashboardTab />);
    // 100 - 1*5 = 95. useCountUp animates 0→95 over 300ms; nihai deger 95.
    await waitFor(() => {
      expect(screen.getByText("95")).toBeDefined();
    }, { timeout: 1000 });
  });

  it("renders the score breakdown panel title", async () => {
    render(<DashboardTab />);
    await waitFor(() => {
      expect(screen.getByText(t.skorBreakdown.title)).toBeDefined();
    });
  });

  it("renders the status message under the ring", async () => {
    // Score 95 (>= 80) → "safe" tier message.
    render(<DashboardTab />);
    await waitFor(() => {
      expect(screen.getByText(t.scoreRing.safeTitle)).toBeDefined();
      expect(screen.getByText(t.scoreRing.safeSubtitle)).toBeDefined();
    });
  });

  it("shows loading state initially", () => {
    chrome.runtime.sendMessage = vi.fn() as unknown as typeof chrome.runtime.sendMessage;
    render(<DashboardTab />);
    expect(screen.getByText(t.loading)).toBeDefined();
  });
});
