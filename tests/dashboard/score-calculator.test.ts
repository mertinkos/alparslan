// @vitest-environment node
import { describe, it, expect } from "vitest";
import { calculateScore } from "@/dashboard/score-calculator";
import { EMPTY_WEEKLY_METRICS, type WeeklyMetrics } from "@/dashboard/types";
import t from "@/i18n/tr";

describe("calculateScore (unique-domain penalty-based)", () => {
  it("starts at 100 with no activity", () => {
    const result = calculateScore(EMPTY_WEEKLY_METRICS);
    expect(result.score).toBe(100);
    expect(result.breakdown.threatAvoidanceScore).toBe(100);
    expect(result.tips).toContain(t.tips.notActive);
  });

  it("deducts 10 points per DANGEROUS visit", () => {
    const metrics: WeeklyMetrics = {
      ...EMPTY_WEEKLY_METRICS,
      urlsChecked: 5,
      dangerousSitesVisited: 1,
    };
    const result = calculateScore(metrics);
    expect(result.score).toBe(90);
    expect(result.tips.some((tip) => tip.includes("tehlikeli"))).toBe(true);
  });

  it("deducts 10 points per SUSPICIOUS visit (threat bucket)", () => {
    // Background tum tehditleri tek bir kovada (suspicious) toplar; 3
    // benzersiz tehdit = -30.
    const metrics: WeeklyMetrics = {
      ...EMPTY_WEEKLY_METRICS,
      urlsChecked: 5,
      suspiciousSitesVisited: 3,
    };
    const result = calculateScore(metrics);
    expect(result.score).toBe(100 - 30);
  });

  it("deducts 5 points per UNKNOWN visit (risk bucket)", () => {
    const metrics: WeeklyMetrics = {
      ...EMPTY_WEEKLY_METRICS,
      urlsChecked: 10,
      unknownSitesVisited: 4,
    };
    const result = calculateScore(metrics);
    expect(result.score).toBe(100 - 20);
  });

  it("stacks penalties across categories", () => {
    const metrics: WeeklyMetrics = {
      ...EMPTY_WEEKLY_METRICS,
      urlsChecked: 20,
      dangerousSitesVisited: 1, // -10
      suspiciousSitesVisited: 2, // -20
      unknownSitesVisited: 5,    // -25
    };
    const result = calculateScore(metrics);
    expect(result.score).toBe(100 - 10 - 20 - 25);
  });

  it("floors at 20 even when penalties exceed 100", () => {
    const metrics: WeeklyMetrics = {
      ...EMPTY_WEEKLY_METRICS,
      urlsChecked: 200,
      // 20 tehdit * 10 = 200 > 100, floor 20
      suspiciousSitesVisited: 20,
    };
    const result = calculateScore(metrics);
    expect(result.score).toBe(20);
  });

  it("returns 100 when only safe sites have been visited", () => {
    const metrics: WeeklyMetrics = {
      ...EMPTY_WEEKLY_METRICS,
      urlsChecked: 25,
      httpsCount: 25,
    };
    const result = calculateScore(metrics);
    expect(result.score).toBe(100);
  });

  it("subtracts 10 when 'Detayli Guvenlik Taramasi' (networkMonitoring) is off", () => {
    // Ayar kapaliysa direkt -10 puan, UI'da kirmizi rozet ile gosterilir.
    const result = calculateScore(EMPTY_WEEKLY_METRICS, {
      networkMonitoringEnabled: false,
    });
    expect(result.score).toBe(90);
  });

  it("does not add bonus when networkMonitoring is on", () => {
    // Acikken ek puan EKLENMEZ, sadece -10 cezadan kacindirir. Skor
    // maksimum 100'de kalir; UI yesil bilgi cumlesi gosterir.
    const result = calculateScore(EMPTY_WEEKLY_METRICS, {
      networkMonitoringEnabled: true,
    });
    expect(result.score).toBe(100);
  });

  it("combines visit penalties with settings penalty", () => {
    const metrics: WeeklyMetrics = {
      ...EMPTY_WEEKLY_METRICS,
      urlsChecked: 10,
      suspiciousSitesVisited: 3, // -30
    };
    // -30 (threats) + -10 (setting off) = -40 -> 60
    const result = calculateScore(metrics, { networkMonitoringEnabled: false });
    expect(result.score).toBe(60);
  });

  it("adds 1 point per unique SAFE domain (capped at 100)", () => {
    // 5 guvenli site bonusu = +5, ama baska ceza yok ve baslangic zaten
    // 100 oldugu icin tavanda kapalı kaliyor.
    const result = calculateScore(EMPTY_WEEKLY_METRICS, {
      uniqueSafeDomainCount: 5,
    });
    expect(result.score).toBe(100);
  });

  it("uses safe bonus to offset risk penalties", () => {
    const metrics: WeeklyMetrics = {
      ...EMPTY_WEEKLY_METRICS,
      urlsChecked: 30,
      suspiciousSitesVisited: 3, // -30
    };
    // -30 (threats) + +15 (15 safe * 1) = -15 puan -> 85
    const result = calculateScore(metrics, { uniqueSafeDomainCount: 15 });
    expect(result.score).toBe(85);
  });

  it("safe bonus cannot push score above 100", () => {
    // 50 guvenli site, hicbir ceza yok → 100 + 50 = 150 ama cap 100.
    const result = calculateScore(EMPTY_WEEKLY_METRICS, {
      uniqueSafeDomainCount: 50,
    });
    expect(result.score).toBe(100);
  });
});
