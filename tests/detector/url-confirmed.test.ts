// @vitest-environment node
// Pure verdict logic — no DOM needed. Avoids the jsdom html-encoding-sniffer
// ESM crash that breaks single-file runs.
import { describe, it, expect, vi, beforeEach } from "vitest";

// checkUrl()/checkUrlConfirmed() read these two leaf data sources. Mock them so
// we can simulate the exact condition behind the sahibinden.com bug: a USOM
// Bloom-filter hit for a domain that is NOT actually in the IndexedDB store
// (a false positive). checkUrl() trusts the raw Bloom hit; checkUrlConfirmed()
// must confirm against IndexedDB and drop the false positive.
vi.mock("@/blocklist/usom-updater", () => ({
  usomBloomTest: vi.fn(() => false),
  isUsomReady: vi.fn(() => true),
}));
vi.mock("@/blocklist/indexeddb-store", () => ({ hasDomain: vi.fn(async () => false) }));
vi.mock("@/api/usom/service", () => ({
  checkDomain: vi.fn(async (domain: string) => ({
    domain,
    verdict: false,
    checkedAt: new Date(),
    expiresAt: new Date(Date.now() + 60_000),
  })),
}));

import { isUsomReady, usomBloomTest } from "@/blocklist/usom-updater";
import { hasDomain } from "@/blocklist/indexeddb-store";
import { checkDomain } from "@/api/usom/service";
import { checkUrl, checkUrlConfirmed } from "@/detector/url-checker";
import { ThreatLevel } from "@/utils/types";

const FP_URL = "https://sahibinden.com/";

describe("USOM Bloom-filter false-positive confirmation (sahibinden.com regression)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usomBloomTest).mockReturnValue(false);
    vi.mocked(isUsomReady).mockReturnValue(true);
    vi.mocked(hasDomain).mockResolvedValue(false);
    vi.mocked(checkDomain).mockImplementation(async (domain) => ({
      domain,
      verdict: false,
      checkedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    }));
  });

  it("checkUrl() trusts the raw Bloom hit and reports DANGEROUS", () => {
    vi.mocked(usomBloomTest).mockReturnValue(true);
    // This is exactly why the unconfirmed re-scan path produced a false banner.
    expect(checkUrl(FP_URL).level).toBe(ThreatLevel.DANGEROUS);
  });

  it("checkUrlConfirmed() downgrades a Bloom hit IndexedDB cannot confirm (false positive)", async () => {
    vi.mocked(usomBloomTest).mockReturnValue(true);
    vi.mocked(hasDomain).mockResolvedValue(false);
    const result = await checkUrlConfirmed(FP_URL);
    expect(result.level).not.toBe(ThreatLevel.DANGEROUS);
    expect(result.level).toBe(ThreatLevel.UNKNOWN);
    expect(result.reasons).not.toContain("USOM tehdit listesinde");
  });

  it("checkUrlConfirmed() keeps DANGEROUS when IndexedDB confirms the USOM listing", async () => {
    vi.mocked(usomBloomTest).mockReturnValue(true);
    vi.mocked(hasDomain).mockResolvedValue(true);
    expect((await checkUrlConfirmed(FP_URL)).level).toBe(ThreatLevel.DANGEROUS);
    expect(checkDomain).not.toHaveBeenCalled();
  });

  it("keeps a Bloom hit when the API confirms it after an IndexedDB miss", async () => {
    vi.mocked(usomBloomTest).mockReturnValue(true);
    vi.mocked(hasDomain).mockResolvedValue(false);
    vi.mocked(checkDomain).mockImplementation(async (domain) => ({
      domain,
      verdict: true,
      checkedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    }));

    expect((await checkUrlConfirmed(FP_URL)).level).toBe(ThreatLevel.DANGEROUS);
    expect(checkDomain).toHaveBeenCalledWith("sahibinden.com");
  });

  it("uses the API when the Bloom filter is not ready", async () => {
    vi.mocked(usomBloomTest).mockReturnValue(false);
    vi.mocked(isUsomReady).mockReturnValue(false);
    vi.mocked(checkDomain).mockImplementation(async (domain) => ({
      domain,
      verdict: true,
      checkedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    }));

    const result = await checkUrlConfirmed("https://evil.example/");

    expect(result.level).toBe(ThreatLevel.DANGEROUS);
    expect(result.reasons).toContain("USOM tehdit listesinde");
  });

  it("does not call the API for a Bloom miss after the filter is ready", async () => {
    vi.mocked(usomBloomTest).mockReturnValue(false);
    vi.mocked(isUsomReady).mockReturnValue(true);

    await checkUrlConfirmed("https://example.com/");

    expect(checkDomain).not.toHaveBeenCalled();
  });
});
