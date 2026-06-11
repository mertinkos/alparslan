import { useState, useEffect, useCallback } from "react";
import { type ThreatResult, type ExtensionStats, type ExtensionSettings, type ScanHistoryEntry, HISTORY_DISPLAY_LIMIT } from "@/utils/types";
import TabBar, { type TabId } from "./TabBar";
import DashboardTab, { SkorCountButton, SkorFilteredList } from "./DashboardTab";
import BreachBadge from "./BreachBadge";
import { normalizeQuickWhitelistDomain, isDomainInWhitelist } from "./whitelist-helpers";
import { useInitProgress } from "./hooks/useInitProgress";
import { useExtensionEnabled } from "./hooks/useExtensionEnabled";
import { useScanHistory } from "./hooks/useScanHistory";
import { useExtensionSettings } from "./hooks/useExtensionSettings";
import { useProtectedDays } from "./hooks/useProtectedDays";
import t from "@/i18n/tr";

type SecurityStatus = "safe" | "dangerous" | "suspicious" | "unknown" | "loading" | "disabled";

// Status panel theme tokens. The `bg` field is a translucent rgba so it
// works as a subtle wash on both light and dark surfaces — the previous
// solid pastels (#f0fdf4 etc.) looked great on white but turned into a
// blown-out fog patch over the dark popup background.
const STATUS_CONFIG: Record<Exclude<SecurityStatus, "loading">, { label: string; color: string; bg: string }> = {
  safe: { label: t.status.safe, color: "#16a34a", bg: "rgba(22, 163, 74, 0.10)" },
  dangerous: { label: t.status.dangerous, color: "#dc2626", bg: "rgba(220, 38, 38, 0.10)" },
  suspicious: { label: t.status.suspicious, color: "#d97706", bg: "rgba(217, 119, 6, 0.10)" },
  unknown: { label: t.status.unknown, color: "var(--text-muted)", bg: "rgba(107, 114, 128, 0.10)" },
  disabled: { label: t.status.disabled, color: "#9ca3af", bg: "rgba(156, 163, 175, 0.10)" },
};

const STATUS_ICONS: Record<Exclude<SecurityStatus, "loading">, string> = {
  safe: "\u2705",
  dangerous: "\uD83D\uDED1",
  suspicious: "\u26A0\uFE0F",
  unknown: "\u2753",
  disabled: "\u23F8\uFE0F",
};

// InitStatus interface'i ve init polling mantigi src/popup/hooks/useInitProgress.ts
// dosyasina tasindi. Bu sayede App.tsx 1300+ satirdan biraz nefes alir, SW
// polling'i backoff'la 300ms-sabit'ten 300ms→5s'e bandinda evrimli hale gelir.

/**
 * Tek bir teknik "reason" satırını (orn. "e-devlet.gov.tr ile aynı isim
 * farklı uzantı (olası sahte site)") Alparslan'in agzindan dogal bir
 * cumleye cevirir. Balonun icinde "...dikkatli olun!" cumlesinin altinda
 * gosterilir.
 *
 * Typosquatting reasons backend'de "${similar} ile ${reasonText}" formatinda
 * birlestirilir; biz once " ile " uzerinde bolerek "${similar}" kismini ve
 * "${reasonText}" kismini ayirip uygun narration fonksiyonuna gondeririz.
 * Diger reason'lar (suspiciousKeyword, ipAccess vb.) sabit string'ler oldugu
 * icin direkt eslestiririz. Risky TLD ve harici form gibi parametreli
 * olanlar icin regex ile parantez/iki noktadan sonraki degeri cikariyoruz.
 */
function narrateReason(raw: string): string {
  // 1) "${similar} ile ${reasonText}" formatlı typosquatting reasonları
  const ilePartIdx = raw.lastIndexOf(" ile ");
  if (ilePartIdx > 0) {
    const similar = raw.slice(0, ilePartIdx);
    const reasonText = raw.slice(ilePartIdx + 5);
    const typosquatMap: Record<string, (s: string) => string> = {
      [t.reasons.homoglyph]: t.reasonNarrations.homoglyph,
      [t.reasons.editDistance]: t.reasonNarrations.editDistance,
      [t.reasons.tldMismatch]: t.reasonNarrations.tldMismatch,
      [t.reasons.containsTrusted]: t.reasonNarrations.containsTrusted,
      [t.reasons.subdomainImpersonation]: t.reasonNarrations.subdomainImpersonation,
      [t.reasons.subdomainTyposquat]: t.reasonNarrations.subdomainTyposquat,
      [t.reasons.similarDomain]: t.reasonNarrations.similarDomain,
    };
    if (typosquatMap[reasonText]) {
      return typosquatMap[reasonText](similar);
    }
  }

  // 2) Sabit (parametresiz) reasonlar
  if (raw === t.reasons.suspiciousKeyword) return t.reasonNarrations.suspiciousKeyword;
  if (raw === t.reasons.ipAccess) return t.reasonNarrations.ipAccess;
  if (raw === t.reasons.excessiveSubdomains) return t.reasonNarrations.excessiveSubdomains;
  if (raw === t.analysis.creditCardRequested) return t.reasonNarrations.creditCardRequested;
  if (raw === t.analysis.tcKimlikSensitive) return t.reasonNarrations.tcKimlikSensitive;
  if (raw === t.analysis.urgencyLanguage) return t.reasonNarrations.urgencyLanguage;

  // 3) Parametreli — "Riskli uzantı (.xyz)"
  const tldMatch = raw.match(/^Riskli uzantı \((.+)\)$/);
  if (tldMatch) return t.reasonNarrations.riskyTld(tldMatch[1]);

  // 4) Parametreli — "Form verisi farklı sunucuya gönderiliyor: <host>"
  const formMatch = raw.match(/^Form verisi farklı sunucuya gönderiliyor: ([^ )]+)/);
  if (formMatch) return t.reasonNarrations.externalFormAction(formMatch[1]);

  // 5) Fallback — tanımadığım reason olursa olduğu gibi göster
  return t.reasonNarrations.generic(raw);
}

export default function App() {
  // Init durumu artik useInitProgress hook'unda — backoff'lu polling,
  // session marker okuma, cleanup. Component sadece 2 deger okuyor.
  const { initStatus, initDoneSession } = useInitProgress();
  const [url, setUrl] = useState<string>("");
  const [status, setStatus] = useState<SecurityStatus>("loading");
  // Enabled toggle + storage senkron mantigi useExtensionEnabled hook'unda.
  const { enabled, setEnabled, toggleEnabled } = useExtensionEnabled();
  const [reasons, setReasons] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [stats, setStats] = useState<ExtensionStats>({ urlsChecked: 0, threatsBlocked: 0, trackersBlocked: 0 });
  const [showHistory, setShowHistory] = useState(false);
  // Tarama gecmisi (history) yukleme + reaktif senkron mantigi
  // useScanHistory hook'unda. setHistory ve loadHistory hook ustunden gelir.
  const { history, reloadHistory: loadHistory, clearLocalHistory: clearHistoryLocal } = useScanHistory();
  const [pageReasons, setPageReasons] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("status");
  // Settings yukleme + reaktif senkron useExtensionSettings hook'una tasindi.
  const { settings, setSettings, saveSettings } = useExtensionSettings();
  const [tabStats, setTabStats] = useState<{
    requestsChecked: number;
    threatsDetected: number;
    requestsBlocked: number;
    domains: string[];
    threats: Array<{ domain: string; level: string; timestamp: number }>;
  } | null>(null);
  const [listStats, setListStats] = useState<{
    blacklistSize: number;
    whitelistSize: number;
  } | null>(null);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [infoOpen, setInfoOpen] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<"threat" | "tracker" | "unknown" | null>(null);
  // Tracks whether the history list was opened from the "Tarama geçmişi"
  // button (true) or from a stat card (false). The two share the same list
  // contents when no filter is set, but the toggle button below them reads
  // differently — "Tarama Geçmişini Gizle" vs "Kontrol Listesini Gizle" — so
  // the user knows which surface they're closing.
  const [openedFromHistoryBtn, setOpenedFromHistoryBtn] = useState<boolean>(false);
  // Koruma süresi hesabi (gun) useProtectedDays hook'unda.
  const protectedDays = useProtectedDays();
  const [popupWhitelistInput, setPopupWhitelistInput] = useState<string>("");
  const [showDisableConfirm, setShowDisableConfirm] = useState<boolean>(false);
  // Speech-bubble action confirmation gates — both verdicts run through a
  // modal so neither path (close-tab or whitelist-domain) fires on a stray
  // click.
  const [showCloseConfirm, setShowCloseConfirm] = useState<boolean>(false);
  const [showTrustConfirm, setShowTrustConfirm] = useState<boolean>(false);
  // Durum sekmesindeki Skor-style kart hangi kategori acik (null = hicbiri).
  const [durumSkorFilter, setDurumSkorFilter] = useState<"control" | "threat" | "unknown" | null>(null);
  const handleDurumSkorClick = (filter: "control" | "threat" | "unknown") => {
    setDurumSkorFilter((prev) => (prev === filter ? null : filter));
  };

  // saveSettings useExtensionSettings hook'una tasindi.

  // Pull global list sizes + per-tab network monitoring stats for the active
  // tab. Called on init-ready and again whenever the detail panel opens.
  const fetchListStats = useCallback(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      chrome.runtime.sendMessage({ type: "GET_LIST_STATS", tabId }, (response: unknown) => {
        const r = response as {
          blacklistSize?: number; whitelistSize?: number; dynamicWhitelistSize?: number;
          tab?: { requestsChecked: number; threatsDetected: number; requestsBlocked: number; domains: string[]; threats: Array<{ domain: string; level: string; timestamp: number }> };
        } | null;
        if (r) {
          setListStats({ blacklistSize: r.blacklistSize ?? 0, whitelistSize: (r.whitelistSize ?? 0) + (r.dynamicWhitelistSize ?? 0) });
          // Fall back to a zero-state object when the background has no
          // per-tab monitoring data yet — otherwise tabStats stays null and
          // the detail panel is stuck on "Detaylar yükleniyor..." forever.
          setTabStats(r.tab ?? { requestsChecked: 0, threatsDetected: 0, requestsBlocked: 0, domains: [], threats: [] });
        }
      });
    });
  }, []);

  // Init durumu okuma & polling: useInitProgress hook'una tasindi (yukarida
  // cagriliyor). Burada eskiden 2 ayri useEffect + setInitStatus/setInitDoneSession
  // state'i vardi; sade tutmak icin disari cikarildi.

  // Fetch all popup data — re-runs when init becomes ready
  useEffect(() => {
    // Enabled durumunu okuma useExtensionEnabled hook'una tasindi.
    chrome.runtime.sendMessage({ type: "GET_STATS" }, (response: { stats: ExtensionStats } | null) => {
      if (response?.stats) setStats(response.stats);
    });
    // GET_SETTINGS useExtensionSettings hook'unda otomatik cagriliyor.
    // Get per-tab network stats for the current tab
    fetchListStats();
  }, [initStatus?.ready]);

  // Re-fetch tab/network stats whenever the detail panel is opened. The
  // initial fetch (on init-ready) can land before the background's per-tab
  // monitoring has any data, leaving tabStats null and the panel stuck on
  // "Detaylar yükleniyor...". Opening the panel forces a fresh pull so it
  // populates immediately instead of waiting for a popup reopen.
  useEffect(() => {
    if (showDetails) fetchListStats();
  }, [showDetails]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0]?.url || "";
      setUrl(currentUrl);

      if (!enabled) {
        setStatus("disabled");
        return;
      }

      if (!currentUrl || currentUrl.startsWith("chrome://") || currentUrl.startsWith("about:")) {
        setStatus("unknown");
        // Tell the background to record this as a "Bilinmeyen" visit so the
        // counter on the stats row matches the status displayed above it.
        // (Background dedupes against the most recent entry to avoid spam
        // when the popup is reopened on the same internal page.)
        if (currentUrl) {
          chrome.runtime.sendMessage({ type: "RECORD_UNKNOWN_VIEW", url: currentUrl });
        }
        return;
      }

      chrome.runtime.sendMessage(
        { type: "CHECK_URL", url: currentUrl },
        (response: ThreatResult | null) => {
          if (!response) {
            setStatus("unknown");
            return;
          }
          setStatus(response.level.toLowerCase() as SecurityStatus);
          setReasons(response.reasons || []);
          setScore(response.score || 0);
          setIsWhitelisted((response.reasons || []).includes(t.reasons.whitelisted));
        },
      );

      // Fetch page analysis results
      try {
        const domain = new URL(currentUrl).hostname;
        chrome.runtime.sendMessage(
          { type: "GET_PAGE_ANALYSIS", domain },
          (response: { analysis: { reasons: string[]; score: number } | null } | null) => {
            if (response?.analysis?.reasons?.length) {
              setPageReasons(response.analysis.reasons);
            }
          },
        );
      } catch { /* ignore */ }
    });
  }, [enabled, initStatus?.ready]);

  // handleToggle artik useExtensionEnabled hook'unun expose ettigi
  // toggleEnabled fonksiyonu — alias olarak tutuldu ki diger butonlar
  // ayni isim uzerinden cagirabilsin.
  const handleToggle = toggleEnabled;

  // History yukleme + reaktif senkron useScanHistory hook'una tasindi.

  // Koruma süresi hesabi useProtectedDays hook'una tasindi.

  // Authoritative whitelist check: read settings.whitelist from sync storage
  // and re-check whenever the underlying storage changes (e.g. user added/
  // removed a domain from the options page while popup is open).
  const checkWhitelistMembership = useCallback(() => {
    const domain = normalizeQuickWhitelistDomain(
      (() => {
        try { return new URL(url).hostname; } catch { return ""; }
      })(),
    );
    if (!domain) {
      setIsWhitelisted(false);
      return;
    }
    chrome.storage.sync.get(["settings"], (result) => {
      const settings = result.settings || {};
      const whitelist: string[] = settings.whitelist || [];
      setIsWhitelisted(isDomainInWhitelist(domain, whitelist));
    });
  }, [url]);

  useEffect(() => {
    checkWhitelistMembership();
    const onChanged = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName !== "sync") return;
      // "enabled" + "settings.enabled" senkronu useExtensionEnabled hook'una
      // tasindi. Burada sadece whitelist uyeligi degisirse yeniden kontrol
      // ediyoruz.
      if ("settings" in changes) {
        checkWhitelistMembership();
      }
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, [checkWhitelistMembership]);

  const handleToggleHistory = () => {
    if (!showHistory) {
      loadHistory();
      setHistoryFilter(null);
      setOpenedFromHistoryBtn(true);
    }
    setShowHistory(!showHistory);
  };

  const handleStatClick = (filter: "threat" | "tracker" | "unknown" | null) => {
    // Toggle behaviour: clicking the same stat that's already open closes the
    // list; clicking a different stat switches the filter (keeps it open);
    // clicking while closed opens it. Either way, mark this as a stat-card
    // open so the bottom toggle label reads "Kontrol/Tehdit/... Listesini
    // Gizle" instead of the generic "Tarama Geçmişini Gizle".
    if (showHistory && historyFilter === filter && !openedFromHistoryBtn) {
      setShowHistory(false);
      return;
    }
    setHistoryFilter(filter);
    setOpenedFromHistoryBtn(false);
    if (!showHistory) {
      loadHistory();
      setShowHistory(true);
    }
  };

  const handleClearHistory = () => {
    chrome.runtime.sendMessage({ type: "CLEAR_HISTORY" }, () => {
      clearHistoryLocal();
    });
  };

  // Closes the active tab from the in-bubble "Sayfayı Kapat" rescue button —
  // used in the suspicious/dangerous/unknown speech-bubble action row.
  const handleClosePage = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const id = tabs[0]?.id;
      if (typeof id === "number") chrome.tabs.remove(id);
    });
  };

  const handleAddToWhitelist = () => {
    const domain = normalizeQuickWhitelistDomain(displayDomain);
    if (!domain || domain === "—") return;
    chrome.storage.sync.get(["settings"], (result) => {
      const current: ExtensionSettings = result.settings || {};
      const list: string[] = current.whitelist || [];
      if (list.includes(domain)) {
        setIsWhitelisted(true);
        return;
      }
      const updated: ExtensionSettings = { ...current, whitelist: [...list, domain] };
      chrome.storage.sync.set({ settings: updated }, () => {
        setIsWhitelisted(true);
        // Update IDB-backed cache used by CHECK_URL.
        chrome.runtime.sendMessage({ type: "ADD_TO_WHITELIST", domain });
        // Propagate settings change so background re-applies (and other
        // popups/options pages refresh their state).
        chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED", settings: updated });
      });
    });
  };

  const handleViewWhitelist = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("whitelist.html") });
  };

  const handleAddWhitelistEntry = () => {
    const domain = normalizeQuickWhitelistDomain(popupWhitelistInput);
    if (!domain) return;
    chrome.storage.sync.get(["settings"], (result) => {
      const current: ExtensionSettings = result.settings || {};
      const list: string[] = current.whitelist || [];
      if (list.includes(domain)) {
        setPopupWhitelistInput("");
        return;
      }
      const updated: ExtensionSettings = { ...current, whitelist: [...list, domain] };
      chrome.storage.sync.set({ settings: updated }, () => {
        setPopupWhitelistInput("");
        // Local state mirror so the count badge + any other settings-derived
        // UI (e.g. whitelist length checks) reflect the change instantly
        // instead of waiting for the storage.onChanged round-trip.
        setSettings((prev) => prev ? { ...prev, whitelist: updated.whitelist } : updated);
        chrome.runtime.sendMessage({ type: "ADD_TO_WHITELIST", domain });
        chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED", settings: updated });
      });
    });
  };


  // When the user just whitelisted the current site we want the status panel
  // to flip to "Güvenli" immediately (matches the legacy bundled popup), even
  // though the next CHECK_URL is still in flight. Once that response lands,
  // `status` will already be "safe" so the override becomes a no-op.
  const displayStatus = isWhitelisted && status !== "loading" ? "safe" : status;
  const config = displayStatus === "loading" ? null : STATUS_CONFIG[displayStatus];
  const icon = displayStatus === "loading" ? "" : STATUS_ICONS[displayStatus];
  const displayDomain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url || "\u2014";
    }
  })();

  // Loading screen while lists are being loaded — but ONLY on the first cold
  // start of the Chrome session. `initDoneSession === false` means the bar
  // hasn't run yet this session; `null` (still reading the flag) or `true`
  // both suppress it so silent worker restarts don't flash the bar again.
  if (initDoneSession === false && initStatus && !initStatus.ready) {
    return (
      <div style={{ width: 340, fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 14 }}>
        <div
          style={{
            padding: "12px 16px",
            background: "linear-gradient(135deg, var(--accent-navy), var(--accent-navy-deep))",
            borderBottom: "2px solid var(--accent-info-bright)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
            color: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <img src="/icons/alparslan_logo.svg" alt="Alparslan" style={{ width: 36, height: 36, borderRadius: 6 }} />
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.3, color: "#f8fafc" }}>Alparslan</span>
        </div>
        <div style={{ padding: "32px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
            {initStatus.step}
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, borderRadius: 3, background: "var(--ring-track)", overflow: "hidden", marginBottom: 12 }}>
            <div
              style={{
                height: "100%",
                width: initStatus.percent + "%",
                background: "linear-gradient(90deg, #3b82f6, #2563eb)",
                borderRadius: 3,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 16 }}>
            %{initStatus.percent}
          </div>
          {/* Step checklist */}
          <div style={{ textAlign: "left", display: "inline-block" }}>
            {initStatus.steps.map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: s.done ? "#16a34a" : "#9ca3af", padding: "2px 0", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{s.done ? "\u2713" : "\u25CB"}</span>
                <span>{s.name}</span>
                {s.done && s.ms !== undefined && (
                  <span style={{ fontSize: 10, color: "#b0b5bd" }}>{s.ms}ms</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: 340, fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 14 }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          background: "linear-gradient(135deg, var(--accent-navy), var(--accent-navy-deep))",
          borderBottom: "2px solid var(--accent-info-bright)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
          color: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* A11y notu: Eskiden <img onClick> ve <span onClick> ayri ayri
            tiklanabilirdi — klavye Tab ile odaklanmiyor, screen reader
            "image clickable" demiyordu. Ikisi tek <button>'a sarildi:
              - Tab ile odaklanir, Enter/Space ile dijitalsavunma.org
                acilir
              - aria-label dogru bilgi verir
              - Hover efektleri (logo scale + glow, yazi mavi parıltı)
                aynen korundu; sadece tek bir hover yerine button'a tasindi
            Gorsel kalip degismedi. */}
        <button
          type="button"
          onClick={() => chrome.tabs.create({ url: "https://dijitalsavunma.org/" })}
          title="Dijital Savunma sitesine git"
          aria-label="Dijital Savunma sitesine git"
          onMouseEnter={(e) => {
            const img = e.currentTarget.querySelector("img");
            const span = e.currentTarget.querySelector("span");
            if (img) {
              img.style.transform = "translateY(-1px) scale(1.07)";
              img.style.filter = "drop-shadow(0 0 8px rgba(96, 165, 250, 0.75))";
            }
            if (span) {
              span.style.color = "#60a5fa";
              span.style.textShadow = "0 0 8px rgba(96, 165, 250, 0.65)";
              span.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            const img = e.currentTarget.querySelector("img");
            const span = e.currentTarget.querySelector("span");
            if (img) {
              img.style.transform = "translateY(0) scale(1)";
              img.style.filter = "none";
            }
            if (span) {
              span.style.color = "#f8fafc";
              span.style.textShadow = "none";
              span.style.transform = "translateY(0)";
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            // Default button stillerini sifirla — header'a uydur:
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
          }}
        >
          <img
            src="/icons/alparslan_logo.svg"
            alt=""
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              transition: "all 0.15s ease",
            }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: 0.3,
              color: "#f8fafc",
              transition: "all 0.15s ease",
              display: "inline-block",
            }}
          >
            Alparslan
          </span>
        </button>
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          title={notificationsOpen ? t.notificationCenter.close : t.notificationCenter.open}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = notificationsOpen
              ? "rgba(248, 250, 252, 0.22)"
              : "rgba(96, 165, 250, 0.18)";
            e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = notificationsOpen
              ? "rgba(248, 250, 252, 0.12)"
              : "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.transform = "translateY(0) scale(1)";
          }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            border: notificationsOpen ? "1px solid rgba(248, 250, 252, 0.55)" : "1px solid rgba(191, 219, 254, 0.35)",
            background: notificationsOpen ? "rgba(248, 250, 252, 0.12)" : "rgba(255, 255, 255, 0.08)",
            color: notificationsOpen ? "#e2e8f0" : "#bfdbfe",
            cursor: "pointer",
            fontSize: notificationsOpen ? 18 : 14,
            fontWeight: notificationsOpen ? 500 : 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "inherit",
            transition: "all 0.2s ease",
            boxShadow: notificationsOpen ? "0 0 10px rgba(148, 163, 184, 0.35)" : "none",
          }}
        >
          {notificationsOpen ? "✕" : "🔔"}
        </button>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          <span>{enabled ? t.active : t.passive}</span>
          {/* A11y notu: eskiden <div onClick> idi. Klavye Tab ile odaklanmiyor,
              screen reader "button" demiyordu. Native <button> elemanına
              cevrildi — Enter/Space ile aktivasyon, focus halkasi ve dogru
              role bedavaya geliyor. Gorsel kalibi koruyabilmek icin
              default buton stilleri (border, background, padding, font)
              sifirlandi; sadece aria-pressed ile durum bildiriliyor. */}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={enabled ? t.protectionToggle.disable : t.protectionToggle.enable}
            onClick={() => handleToggle(!enabled)}
            title={enabled ? t.protectionToggle.disable : t.protectionToggle.enable}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
              e.currentTarget.style.boxShadow = enabled
                ? "0 0 0 3px rgba(34, 197, 94, 0.25), 0 3px 8px rgba(34, 197, 94, 0.35)"
                : "0 0 0 3px rgba(255, 255, 255, 0.12), 0 3px 8px rgba(0, 0, 0, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              background: enabled ? "var(--accent-success-bright)" : "#4b5563",
              position: "relative",
              transition: "background 0.2s, transform 0.18s ease, box-shadow 0.18s ease",
              cursor: "pointer",
              border: "none",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                background: "white",
                position: "absolute",
                top: 2,
                left: enabled ? 18 : 2,
                transition: "left 0.2s",
              }}
            />
          </button>
        </label>
      </div>

      {notificationsOpen && (
        <NotificationPanel
          infoOpen={infoOpen}
          setInfoOpen={setInfoOpen}
          stats={stats}
          unknownCount={history.filter((h) => h.level === "UNKNOWN").length}
          protectedDays={protectedDays}
        />
      )}

      {!notificationsOpen && <TabBar activeTab={activeTab} onTabChange={setActiveTab} />}

      {!notificationsOpen && (
      <>
      {activeTab === "dashboard" ? (
        <DashboardTab />
      ) : activeTab === "settings" ? (
        <div style={{ padding: "12px 16px" }}>
          {settings && (
            <>
              {/* "Detayli Guvenlik Taramasi" karti popup Ayarlar sekmesinden
                  kaldirildi — bu ayar sadece "Tum Ayarlar" sayfasinda
                  (options.html) gosterilir. Skor sekmesindeki "Skor
                  Analizi" panosu hala settings.networkMonitoringEnabled'i
                  okuyup yesil/kirmizi insight gosterir; ayarin kendisi
                  yalnizca tam ayarlar sayfasindan degistirilir. */}

              {/* Tehlike Uyarıları card — turning it OFF asks for confirmation */}
              <SettingCard
                title={t.settings.dangerWarnings}
                desc={t.settings.dangerWarningsDesc}
                enabled={settings.showDomWarnings !== false}
                onToggle={() => {
                  if (settings.showDomWarnings !== false) {
                    setShowDisableConfirm(true); // currently ON → confirm
                  } else {
                    saveSettings({ ...settings, showDomWarnings: true }); // OFF → enable
                  }
                }}
              />

              {/* Dark Mode card */}
              <SettingCard
                title={t.settings.darkMode}
                desc={t.settings.darkModeDesc}
                enabled={settings.darkMode}
                onToggle={() => saveSettings({ ...settings, darkMode: !settings.darkMode })}
              />

              {/* Konuşma Balonu ile Anlatım — adds a friendly avatar + verdict
                  bubble to the Durum panel for plain-language explanations. */}
              <SettingCard
                title={t.settings.speechBubble}
                desc={t.settings.speechBubbleDesc}
                enabled={settings.speechBubbleEnabled !== false}
                onToggle={() => saveSettings({ ...settings, speechBubbleEnabled: !(settings.speechBubbleEnabled !== false) })}
              />

              {/* Beyaz Liste — popup-side quick management */}
              <div
                style={{
                  marginBottom: 14,
                  padding: 12,
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  {/* Onay ikonu (yesil tikli daire) + "Güvendiğim Bağlantılar"
                      basligi: bu listenin "guvenli kabul edilenler" oldugunu
                      gorsel olarak da vurgular. */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
                    <span
                      aria-hidden="true"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "#16a34a",
                        color: "white",
                        fontSize: 10,
                        fontWeight: 800,
                        flexShrink: 0,
                        boxShadow: "0 1px 3px rgba(22, 163, 74, 0.35)",
                      }}
                    >
                      ✓
                    </span>
                    {t.options.whitelist}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    Bu listedeki siteler güvenli kabul edilir
                  </div>
                </div>
                {/* "Mevcut siteyi otomatik yazdır" — saves the user from typing
                    the domain. Mor (violet) tonla yapildi cunku alt taraftaki
                    "Guvendigim siteleri goruntule" butonu mavi → ayni renkte
                    olsa iki buton tek tarafmis gibi gorunuyor. Mor "kisayol/
                    oneri" havasi verir, navigationdan ayrisir. */}
                {displayDomain && displayDomain !== "—" && displayStatus !== "safe" && displayStatus !== "loading" && displayStatus !== "disabled" && (
                  <button
                    onClick={() => setPopupWhitelistInput(displayDomain)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(139, 92, 246, 0.16)";
                      e.currentTarget.style.borderColor = "#7c3aed";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(139, 92, 246, 0.09)";
                      e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.45)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    style={{
                      width: "100%",
                      padding: "7px 10px",
                      marginBottom: 6,
                      background: "rgba(139, 92, 246, 0.09)",
                      border: "1px solid rgba(139, 92, 246, 0.45)",
                      color: "#6d28d9",
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      borderRadius: 7,
                      transition: "all 0.15s ease",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      boxShadow: "0 1px 3px rgba(139, 92, 246, 0.12)",
                    }}
                  >
                    {t.popupWhitelist.autoFillCurrent(displayDomain)}
                  </button>
                )}
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <input
                    value={popupWhitelistInput}
                    placeholder={t.options.whitelistPlaceholder}
                    onChange={(e) => setPopupWhitelistInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddWhitelistEntry();
                    }}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: "8px 9px",
                      border: "1px solid var(--border-strong)",
                      borderRadius: 9,
                      fontSize: 12,
                      outline: "none",
                      fontFamily: "inherit",
                      color: "var(--text)",
                      background: "var(--surface-card)",
                    }}
                  />
                  <button
                    onClick={handleAddWhitelistEntry}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#1d4ed8";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#2563eb";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    style={{
                      border: "none",
                      background: "#2563eb",
                      color: "white",
                      borderRadius: 9,
                      padding: "8px 11px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {t.add}
                  </button>
                </div>
                <button
                  onClick={handleViewWhitelist}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e0e7ff";
                    e.currentTarget.style.color = "#1e3a8a";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#eef2ff";
                    e.currentTarget.style.color = "#2563eb";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "8px 10px",
                    border: "1px solid #bfdbfe",
                    background: "#eef2ff",
                    color: "#2563eb",
                    borderRadius: 9,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s ease",
                  }}
                >
                  {t.popupWhitelist.viewAll}
                  {/* Live count badge — soft grey pill showing how many sites
                      are already in the user's trust list, without forcing a
                      click into the standalone page. */}
                  <span style={{
                    marginLeft: 7,
                    padding: "1px 7px",
                    background: "rgba(107, 114, 128, 0.18)",
                    color: "var(--text-muted)",
                    borderRadius: 999,
                    fontSize: 10.5,
                    fontWeight: 600,
                    verticalAlign: "middle",
                  }}>
                    {settings?.whitelist?.length ?? 0}
                  </span>
                </button>
              </div>

              {/* Link to full options */}
              <button
                onClick={() => chrome.runtime.openOptionsPage()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#d1d5db";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#e5e7eb";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                style={{
                  width: "100%",
                  padding: "10px 0",
                  background: "#e5e7eb",
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#374151",
                  fontFamily: "inherit",
                  marginTop: 4,
                  transition: "all 0.2s ease",
                }}
              >
                ⚙️ {t.settings.allSettings}
              </button>
            </>
          )}
        </div>
      ) : (
      <>
      {/* Status \u2014 compact card with a coloured dot indicator, inline quick-
          whitelist button on the right (only on dangerous/suspicious/unknown
          sites \u2014 safe sites don't need whitelisting). */}
      <div
        style={{
          padding: "12px 16px",
          background: config?.bg || "rgba(107, 114, 128, 0.05)",
          borderBottom: `3px solid ${config?.color || "#e5e7eb"}`,
          // Soft inner top-edge glow in the status colour so the panel reads
          // as a tinted surface on both light and dark themes without
          // needing a heavy fill.
          boxShadow: config ? `inset 0 1px 0 ${config.color}40` : "none",
          position: "relative",
        }}
      >
        {/* One-time bright-grey light ray sweeping across this status box every
            time the popup opens — top-left corner → bottom-right corner,
            widening mid-travel. Runs for every verdict (safe / suspicious /
            dangerous / unknown). pointer-events:none so clicks pass through. */}
        <div className="status-sweep-overlay"><div className="status-sweep-beam" /></div>
        {/* TWO PRESENTATIONS — driven by the "Konuşma Balonu ile Anlatım"
            setting. ON: a hero "logo on the left + speech bubble on the right
            with the URL pinned to the bubble's bottom strip" layout. OFF: the
            classic compact "● status dot + label + domain + whitelist button"
            row that was here before. Loading/disabled states always fall back
            to the classic row since there's no verdict to narrate. */}
        {settings?.speechBubbleEnabled !== false && displayStatus !== "loading" && displayStatus !== "disabled" ? (() => {
          const variant =
            displayStatus === "safe" ? "success" :
            displayStatus === "dangerous" ? "danger" :
            displayStatus === "suspicious" ? "warning" :
            "info";
          // Domain shown inside the sentence ("chatgpt.com sayfasını sizin
          // için..."); falls back to a generic noun when we don't have one.
          const siteName = displayDomain && displayDomain !== "—" ? displayDomain : "Bu sayfa";
          const message =
            displayStatus === "safe" ? t.speechBubble.safe(siteName) :
            displayStatus === "dangerous" ? t.speechBubble.dangerous(siteName) :
            displayStatus === "suspicious" ? t.speechBubble.suspicious(siteName) :
            t.speechBubble.unknown(siteName);
          // Leading status emoji renders OUTSIDE the text flow so wrapped
          // lines start where "the words" start, not next to the bubble's
          // left edge.
          const leadEmoji =
            displayStatus === "safe" ? "🛡️" :
            displayStatus === "dangerous" ? "🚨" :
            displayStatus === "suspicious" ? "⚠️" :
            "🔍";
          // Word that gets bolded + status-coloured so the eye lands on the
          // verdict in one glance without making the whole bubble loud.
          const highlightWord =
            displayStatus === "safe" ? "güvendesiniz" :
            displayStatus === "dangerous" ? "uzaklaşın" :
            displayStatus === "suspicious" ? "dikkatli olun" :
            "merak etmeyin";
          const accentColor =
            displayStatus === "safe" ? "#16a34a" :
            displayStatus === "dangerous" ? "#dc2626" :
            displayStatus === "suspicious" ? "#d97706" :
            "#2563eb";
          // Build the body with two callouts: the domain (semi-bold accent)
          // and the verdict keyword (bold accent). Both lean on accentColor;
          // weight separates them.
          const dIdx = message.indexOf(siteName);
          const renderBody = (): React.ReactNode => {
            if (dIdx === -1) {
              const hIdx = message.indexOf(highlightWord);
              if (hIdx === -1) return message;
              return (
                <>
                  {message.slice(0, hIdx)}
                  <strong style={{ color: accentColor, fontWeight: 700, whiteSpace: "nowrap" }}>{message.slice(hIdx, hIdx + highlightWord.length)}</strong>
                  {message.slice(hIdx + highlightWord.length)}
                </>
              );
            }
            const beforeDomain = message.slice(0, dIdx);
            const afterDomain = message.slice(dIdx + siteName.length);
            const hIdxAfter = afterDomain.indexOf(highlightWord);
            if (hIdxAfter === -1) {
              return (
                <>
                  {beforeDomain}
                  <span style={{ color: accentColor, fontWeight: 600, whiteSpace: "nowrap" }}>{siteName}</span>
                  {afterDomain}
                </>
              );
            }
            return (
              <>
                {beforeDomain}
                <span style={{ color: accentColor, fontWeight: 600, whiteSpace: "nowrap" }}>{siteName}</span>
                {afterDomain.slice(0, hIdxAfter)}
                <strong style={{ color: accentColor, fontWeight: 700, whiteSpace: "nowrap" }}>{afterDomain.slice(hIdxAfter, hIdxAfter + highlightWord.length)}</strong>
                {afterDomain.slice(hIdxAfter + highlightWord.length)}
              </>
            );
          };
          const messageNode = renderBody();
          return (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 4 }}>
                {/* Big logo with soft outer glow in the verdict colour — sits
                    flush against the bubble so the speech tail appears to
                    emerge straight from its edge. Hover lifts + tilts the
                    helmet slightly to feel alive. */}
                <div
                  className={`alparslan-bubble-logo alparslan-mood-${displayStatus}`}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: "var(--surface-card)",
                    border: `2px solid var(--btn-${variant}-border)`,
                    boxShadow: `0 0 0 4px var(--btn-${variant}-bg), 0 2px 10px var(--btn-${variant}-border)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    marginTop: -2,
                    cursor: "pointer",
                  }}
                >
                  <img
                    src="/icons/alparslan_logo.svg"
                    alt="Alparslan"
                    style={{ width: "78%", height: "78%" }}
                  />
                </div>

                {/* Bubble — soft tinted surface in the verdict colour, dark
                    body text for readability, with a small tail pointing
                    left into the logo. URL pinned to a separated bottom
                    strip with a globe icon. */}
                <div style={{
                  position: "relative",
                  flex: 1,
                  minWidth: 0,
                  background: `var(--btn-${variant}-bg)`,
                  border: `1px solid var(--btn-${variant}-border)`,
                  borderRadius: 12,
                  color: "var(--text)",
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
                  marginLeft: 4,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 4, padding: "8px 11px 7px", fontSize: 12.5, lineHeight: 1.45 }}>
                    {/* Leading verdict emoji as its own flex item so wrapped
                        lines of the body align with the body's left edge
                        instead of the bubble's. */}
                    <span style={{ flexShrink: 0, lineHeight: 1.45 }}>{leadEmoji}</span>
                    <div style={{ flex: 1, minWidth: 0, hyphens: "auto" }}>
                      {messageNode}
                      {/* Balonun ICINDE: "dikkatli olun!" cumlesinin hemen
                          altinda Alparslan agziyla anlatilan reasonlar.
                          Eski "altta cikan • bullet listesi" tamamen burada,
                          balonun icine tasindi — kullanici sebepleri
                          Alparslan'in konusmasinin devami gibi okur.

                          SAFE durumda HIC reason gostermiyoruz: Alparslan
                          "her sey sapasaglam, guvendesiniz" diyorken altta
                          "kredi karti soruyor, dikkat" bullet'i celiski
                          yaratir. Trusted domain'lerde (github.com gibi)
                          DOM analizinin bildirdigi sinyaller bilgilendirici
                          olarak duser ama kullaniciya gosterilmez. */}
                      {displayStatus !== "safe" && (reasons.length > 0 || pageReasons.length > 0) && (
                        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                          {[...reasons, ...pageReasons].map((r, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: 11.5,
                                lineHeight: 1.4,
                                color: "var(--text)",
                                opacity: 0.92,
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 5,
                              }}
                            >
                              <span style={{ color: accentColor, fontWeight: 700, flexShrink: 0 }}>•</span>
                              <span>{narrateReason(r)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Action row — only when the verdict actually carries risk.
                      Hero "Sayfayı Kapat" mirrors the verdict colour so users
                      hit the safe move instinctively; the secondary "Bu Adrese
                      Güven" stays transparent + bordered so it can't be tapped
                      reflexively. */}
                  {displayStatus !== "safe" && (
                    <>
                      <div style={{
                        padding: "0 10px 6px",
                        fontSize: 11.5,
                        lineHeight: 1.45,
                        color: "var(--text)",
                      }}>
                        {(() => {
                          // "Dilerseniz" rendered slightly darker + bolder so
                          // the eye lands on the consent cue first — emphasises
                          // that this is an OPT-IN moment, not a directive.
                          const txt = t.speechBubble.actionPrompt;
                          const word = "Dilerseniz";
                          const idx = txt.indexOf(word);
                          if (idx === -1) return txt;
                          return (
                            <>
                              <strong style={{ color: "var(--text-strong)", fontWeight: 700 }}>{word}</strong>
                              {txt.slice(idx + word.length)}
                            </>
                          );
                        })()}
                      </div>
                      <div style={{ display: "flex", gap: 6, padding: "0 8px 8px" }}>
                        <button
                          onClick={() => setShowCloseConfirm(true)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#1d4ed8";
                            e.currentTarget.style.transform = "scale(1.04)";
                            e.currentTarget.style.boxShadow = "0 3px 8px rgba(37, 99, 235, 0.40)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#2563eb";
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.10)";
                          }}
                          style={{
                            flex: 1,
                            // Always corporate blue, regardless of verdict colour. The bubble
                            // already carries the warning hue; the button is a calm CTA that
                            // shouldn't panic the user when the site isn't confirmed-malicious.
                            background: "#2563eb",
                            color: "#ffffff",
                            border: "none",
                            padding: "3px 5px",
                            borderRadius: 5,
                            fontSize: 9,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.15s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 3,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.10)",
                            lineHeight: 1.2,
                          }}
                        >
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          {t.speechBubble.actionClose}
                        </button>
                        {!isWhitelisted && (
                          <button
                            onClick={() => setShowTrustConfirm(true)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "scale(1.04)";
                              e.currentTarget.style.color = "var(--text)";
                              e.currentTarget.style.borderColor = "var(--text-muted)";
                              e.currentTarget.style.boxShadow = "0 2px 6px rgba(15, 23, 42, 0.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.color = "var(--text-muted)";
                              e.currentTarget.style.borderColor = "var(--border-strong)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                            style={{
                              flex: 1,
                              background: "var(--surface-card)",
                              color: "var(--text-muted)",
                              border: "1px solid var(--border-strong)",
                              padding: "3px 5px",
                              borderRadius: 5,
                              fontSize: 9,
                              fontWeight: 500,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              transition: "all 0.15s ease",
                              lineHeight: 1.2,
                              textAlign: "center",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t.speechBubble.actionTrust}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  {/* Tail (rotated square overlapping the bubble's left edge
                      so its tip is flush with the logo). */}
                  <div style={{
                    position: "absolute",
                    left: -5,
                    top: 14,
                    transform: "rotate(45deg)",
                    width: 9,
                    height: 9,
                    background: `var(--btn-${variant}-bg)`,
                    borderLeft: `1px solid var(--btn-${variant}-border)`,
                    borderBottom: `1px solid var(--btn-${variant}-border)`,
                  }} />
                </div>
              </div>

            </>
          );
        })() : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, minWidth: 0 }}>
            <span
              style={{
                animation: displayStatus === "safe" && enabled ? "safePulse 1.6s ease-out infinite" : "none",
                boxShadow: displayStatus === "safe" && enabled ? "0 0 0 0 rgba(22, 163, 74, 0.45)" : "none",
                width: 10,
                height: 10,
                borderRadius: "50%",
                display: "inline-block",
                background:
                  displayStatus === "safe" ? "#16a34a" :
                  displayStatus === "dangerous" ? "#dc2626" :
                  displayStatus === "suspicious" ? "#d97706" : "#6b7280",
                marginTop: -15,
                flexShrink: 0,
              }}
            />
            <div
              title={
                displayStatus === "loading" ? undefined :
                displayStatus === "safe" ? t.statusMessages.safe :
                displayStatus === "dangerous" ? t.statusMessages.dangerous :
                displayStatus === "suspicious" ? t.statusMessages.suspicious :
                displayStatus === "disabled" ? t.statusMessages.disabled :
                t.statusMessages.unknown
              }
              style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, color: config?.color || "#374151" }}>
                {displayStatus === "loading" ? t.status.checking : config?.label}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{displayDomain}</div>
            </div>
          </div>

          {/* Classic right-side: inline quick-whitelist for non-safe verdicts. */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
            {/* Inline quick-add button \u2014 only shows on non-safe verdicts
                and disappears once the site is whitelisted. */}
            {displayStatus !== "loading" && !isWhitelisted && displayDomain && displayDomain !== "\u2014" &&
              (displayStatus === "dangerous" || displayStatus === "suspicious" || displayStatus === "unknown") && (
              <button
                onClick={handleAddToWhitelist}
                title={t.popupWhitelist.tooltipAdd}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#dbeafe";
                  e.currentTarget.style.borderColor = "#60a5fa";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#eff6ff";
                  e.currentTarget.style.borderColor = "#bfdbfe";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                style={{
                  border: "1px solid #bfdbfe",
                  background: "#eff6ff",
                  color: "#2563eb",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 9px",
                  borderRadius: 10,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                  transition: "all 0.15s ease",
                }}
              >
                {t.popupWhitelist.addButton}
              </button>
            )}
          </div>
        </div>
        )}

        {/* Eski "\u2022 reason" listesi balonun ICINE tasindi (yukaridaki
            narrated bullets). Burada artik render etmiyoruz. */}
      </div>

      <BreachBadge domain={displayDomain} />

      {/* Skor sekmesindeki tıklanabilir sayaç kartlari Durum sekmesine de
          tasindi. Tiklayinca o kategorinin filtreli listesi acilir; tekrar
          tiklayinca veya baska karta tiklayinca degisir.

          ONEMLI: Karttaki sayi (orn. "17"), tıklanınca acilan SkorFilteredList
          ile AYNI veri kaynagından (history) hesaplanir. Eskiden Kontrol ve
          Tehdit kartlari stats.* session sayaclarini gosteriyordu, liste ise
          history'den dolduruluyordu — sayilar bazen geç eşleşiyor, kullanici
          "17 dedi ama 4 eleman gosterdi" diye sorabiliyordu. Artik her ikisi
          de history'den okudugu icin matematiksel olarak ayni. */}
      {(() => {
        const controlCount = history.length;
        const threatCount = history.filter(
          (h) => h.level === "DANGEROUS" || h.level === "SUSPICIOUS",
        ).length;
        const unknownCount = history.filter((h) => h.level === "UNKNOWN").length;
        return (
          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SkorCountButton
              icon="🔍"
              label={t.skorCards.control}
              activeLabel={t.skorCards.controlClose}
              zeroText={t.skorCards.controlZero}
              value={controlCount}
              variant="neutral"
              active={durumSkorFilter === "control"}
              onClick={() => handleDurumSkorClick("control")}
              title={t.skorCards.controlTooltip}
              activeTitle={t.skorCards.controlTooltipClose}
            />
            {durumSkorFilter === "control" && (
              <SkorFilteredList filter="control" history={history} />
            )}

            <SkorCountButton
              icon="🚨"
              label={t.skorCards.threat}
              activeLabel={t.skorCards.threatClose}
              zeroText={t.skorCards.threatZero}
              value={threatCount}
              variant="danger"
              active={durumSkorFilter === "threat"}
              onClick={() => handleDurumSkorClick("threat")}
              title={t.skorCards.threatTooltip}
              activeTitle={t.skorCards.threatTooltipClose}
            />
            {durumSkorFilter === "threat" && (
              <SkorFilteredList filter="threat" history={history} />
            )}

            <SkorCountButton
              icon="❔"
              label={t.skorCards.unknown}
              activeLabel={t.skorCards.unknownClose}
              zeroText={t.skorCards.unknownZero}
              value={unknownCount}
              variant="info"
              active={durumSkorFilter === "unknown"}
              onClick={() => handleDurumSkorClick("unknown")}
              title={t.skorCards.unknownTooltip}
              activeTitle={t.skorCards.unknownTooltipClose}
            />
            {durumSkorFilter === "unknown" && (
              <SkorFilteredList filter="unknown" history={history} />
            )}
          </div>
        );
      })()}

      </>
      )}
      </>
      )}

      {/* Footer — matches the bundled popup's minimal centered version label */}
      {!notificationsOpen && (
        <div
          style={{
            padding: "6px 16px",
            fontSize: 10,
            color: "var(--text-faint)",
            background: "var(--surface-elevated)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 10,
              color: "#9ca3af",
              width: "100%",
            }}
          >
            <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>{t.footer}</div>
          </div>
        </div>
      )}

      {/* Confirmation modal shown when the user tries to turn OFF danger
          warnings. UX: "keep protecting" is a big bright-green button; the
          "disable" action is a plain, dim text link so a careless tap can't
          easily switch protection off. */}
      {showDisableConfirm && settings && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 18,
              maxWidth: 300,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              {t.confirmDisableNotif.message}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
              {t.confirmDisableNotif.detail}
            </div>

            <button
              onClick={() => setShowDisableConfirm(false)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
                width: "100%",
                padding: "11px 0",
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                marginBottom: 8,
                boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                transition: "transform 0.15s ease",
              }}
            >
              🟢 {t.confirmDisableNotif.keep}
            </button>

            <button
              onClick={() => {
                saveSettings({ ...settings, showDomWarnings: false });
                setShowDisableConfirm(false);
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
                width: "100%",
                padding: "6px 0",
                background: "transparent",
                border: "none",
                color: "var(--text-faint)",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "transform 0.15s ease",
              }}
            >
              {t.confirmDisableNotif.disable}
            </button>
          </div>
        </div>
      )}

      {/* "Sayfadan Ayrıl" confirmation — closing the dangerous tab IS the safe
          move here, so the filled "Sekmeyi Kapat" button is dominant. "Vazgeç"
          stays transparent so a reflex tap on it leaves the user back on the
          warning, not still on the page. */}
      {showCloseConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 18,
              maxWidth: 300,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              {t.speechBubble.confirmCloseTitle}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
              {t.speechBubble.confirmCloseBody}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setShowCloseConfirm(false);
                  handleClosePage();
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                style={{
                  flex: 1,
                  padding: "9px 8px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 3px 8px rgba(37,99,235,0.35)",
                  transition: "transform 0.15s ease",
                }}
              >
                {t.speechBubble.confirmCloseConfirm}
              </button>
              <button
                onClick={() => setShowCloseConfirm(false)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                style={{
                  flex: 1,
                  padding: "9px 8px",
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "transform 0.15s ease",
                }}
              >
                {t.speechBubble.confirmCloseCancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Bu Adrese Güven" confirmation — staying away IS the safe move here,
          so "Vazgeç" is the dominant filled-gray button (easy reflex tap).
          "Evet, Güven" is the subtle outlined button with a faint amber tint
          so the user has to deliberately aim at it to take the risk. */}
      {showTrustConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 18,
              maxWidth: 300,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              {t.speechBubble.confirmTrustTitle}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
              {t.speechBubble.confirmTrustBody}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowTrustConfirm(false)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                style={{
                  flex: 1,
                  padding: "9px 8px",
                  background: "#475569",
                  color: "white",
                  border: "none",
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 3px 8px rgba(71,85,105,0.30)",
                  transition: "transform 0.15s ease",
                }}
              >
                {t.speechBubble.confirmTrustCancel}
              </button>
              <button
                onClick={() => {
                  setShowTrustConfirm(false);
                  handleAddToWhitelist();
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                style={{
                  flex: 1,
                  padding: "9px 8px",
                  background: "transparent",
                  color: "#d97706",
                  border: "1px solid #fcd34d",
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "transform 0.15s ease",
                }}
              >
                {t.speechBubble.confirmTrustConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// A settings toggle rendered as an elevated, hover-lifting card. The whole
// card is clickable (the switch on the right is just a visual indicator), and
// the colours flow from theme.ts CSS variables so it adapts to dark mode.
function SettingCard({
  title,
  desc,
  enabled,
  onToggle,
}: {
  title: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  // Brief green border-pulse on every toggle — silent "Ayar kaydedildi"
  // micro feedback so the user knows the click registered without us adding
  // yet another "Saved!" banner.
  const [justSaved, setJustSaved] = useState(false);
  const handleToggle = () => {
    onToggle();
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 600);
  };
  return (
    /* A11y notu: eskiden bu kart <div onClick> idi — klavyeden Tab ile
       odaklanmiyor, screen reader "button" demiyordu. Native <button>
       elemanina cevrildi:
         - Tab ile fokuslanir, Enter/Space ile aktive olur
         - role="switch" + aria-checked ile dogru anlamsal etiketleme
         - aria-label "title: ayar acik/kapali" seklinde dinamik
       Gorsel kalibi degistirmemek icin border/background/padding inline
       stilde aynen tutuldu; sadece default button stillerini (font, text
       align, outline) override ediyoruz. */
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={`${title}: ${enabled ? "ayar aktif" : "ayar kapali"}`}
      onClick={handleToggle}
      /* Hover efekti artik JS onMouseEnter/Leave ile DEGIL, CSS :hover ile
         calisiyor (.alparslan-setting-card class'i theme.ts'de). Bu sayede
         20+ inline JS handler tekrari yerine tek bir CSS kurali; tarayici
         optimize ediyor, kod daha sade. */
      className={`alparslan-setting-card${justSaved ? " setting-card-saved" : ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        marginBottom: 10,
        borderRadius: 12,
        cursor: "pointer",
        // Default button stillerini sifirla: yazi tipini sayfadan al,
        // sola yasla (button default ortalar), genislik tam.
        fontFamily: "inherit",
        textAlign: "left",
        width: "100%",
        color: "var(--text)",
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{title}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
      </div>
      <div
        title={enabled ? `${title}: ayar acik` : `${title}: ayar kapali`}
        onMouseEnter={(e) => {
          // Toggle'in uzerine hover: hafif buyume + duruma gore renkli halka.
          // Kart hover'ina ek olarak calisir, "tiklanabilir aktif element"
          // hissini guclendirir.
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = enabled
            ? "0 0 0 4px rgba(34, 197, 94, 0.18), 0 3px 8px rgba(34, 197, 94, 0.25)"
            : "0 0 0 4px rgba(148, 163, 184, 0.20), 0 3px 8px rgba(15, 23, 42, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "none";
        }}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: enabled ? "#22c55e" : "#d1d5db",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.2s, transform 0.18s ease, box-shadow 0.18s ease",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            background: "white",
            position: "absolute",
            top: 2,
            left: enabled ? 18 : 2,
            transition: "left 0.2s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </button>
  );
}

function NotificationPanel({
  infoOpen,
  setInfoOpen,
  stats,
  unknownCount,
  protectedDays,
}: {
  infoOpen: boolean;
  setInfoOpen: (v: boolean) => void;
  stats: ExtensionStats;
  unknownCount: number;
  protectedDays: number;
}) {
  const g = t.notificationCenter.glossary;
  return (
    <div
      style={{
        margin: "10px auto 0 auto",
        width: 300,
        padding: 12,
        background: "var(--surface-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        boxShadow: "0 8px 18px rgba(30, 64, 175, 0.08)",
        color: "var(--text)",
      }}
    >
      {/* Welcome message */}
      <div
        style={{
          fontSize: 12,
          lineHeight: 1.45,
          color: "var(--text-muted)",
          background: "var(--surface-card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "8px 10px",
          marginBottom: 10,
        }}
      >
        {t.notificationCenter.welcome}
        <span
          onClick={() => chrome.tabs.create({ url: "https://dijitalsavunma.org/" })}
          title={t.notificationCenter.welcomeLinkTitle}
          style={{ color: "#2563eb", fontWeight: 800, cursor: "pointer" }}
        >
          {t.notificationCenter.welcomeLink}
        </span>
        {t.notificationCenter.welcomeSuffix}
      </div>

      {/* Protected days badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "#dbeafe",
            color: "#1d4ed8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          🛡️
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>
          {t.notificationCenter.protectedDays(protectedDays)}
        </div>
      </div>

      {/* Daily summary */}
      <div style={{ fontSize: 12, lineHeight: 1.55, color: "var(--text-muted)", marginBottom: 10 }}>
        <div>
          {t.notificationCenter.todayPrefix}
          <strong style={{ color: "#1d4ed8" }}>{stats.urlsChecked}</strong>
          {t.notificationCenter.todayChecked}
        </div>
        <div>
          <strong style={{ color: stats.threatsBlocked > 0 ? "#dc2626" : "#16a34a" }}>
            {stats.threatsBlocked}
          </strong>
          {t.notificationCenter.todayThreats}
        </div>
        <div>
          <strong style={{ color: stats.trackersBlocked > 0 ? "#d97706" : "#16a34a" }}>
            {stats.trackersBlocked}
          </strong>
          {t.notificationCenter.todayTrackers}
        </div>
        <div>
          <strong style={{ color: unknownCount > 0 ? "#3640a0" : "#16a34a" }}>
            {unknownCount}
          </strong>
          {t.notificationCenter.todayUnknowns}
        </div>
      </div>

      <button
        onClick={() => setInfoOpen(!infoOpen)}
        style={{
          width: "70%",
          margin: "8px auto 10px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          padding: "7px 10px",
          border: "1px solid #bfdbfe",
          background: "#eef2ff",
          color: "#2563eb",
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {infoOpen ? (
          t.notificationCenter.infoButtonHide
        ) : (
          <>
            <span style={{ fontSize: 14 }}>📘</span>
            <span>{t.notificationCenter.infoButton}</span>
          </>
        )}
      </button>

      {infoOpen && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 11px",
            background: "var(--surface-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 11,
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 12, color: "var(--text)", marginBottom: 6 }}>
            {t.notificationCenter.infoTitle}
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong style={{ color: "#3b82f6" }}>{g.controlLabel}: </strong>
            {g.controlDesc}
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong style={{ color: "#38bdf8" }}>{g.scoreLabel}: </strong>
            {g.scoreDesc1}
            <strong style={{ color: "#16a34a" }}>{g.scoreRangeGood}</strong>
            {g.scoreDesc2}
            <strong style={{ color: "#d97706" }}>{g.scoreRangeMedium}</strong>
            {g.scoreDesc3}
            <strong style={{ color: "#dc2626" }}>{g.scoreRangeBad}</strong>
            {g.scoreDesc4}
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong style={{ color: "#16a34a" }}>{g.whitelistLabel}: </strong>
            {g.whitelistDesc}
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong style={{ color: "var(--text)" }}>{g.blacklistLabel}: </strong>
            {g.blacklistDesc}
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong style={{ color: "#dc2626" }}>{g.threatLabel}: </strong>
            {g.threatDesc}
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong style={{ color: "#d97706" }}>{g.trackerLabel}: </strong>
            {g.trackerDesc}
          </div>
          <div>
            <strong style={{ color: "#818cf8" }}>{g.unknownLabel}: </strong>
            {g.unknownDesc}
          </div>
        </div>
      )}
    </div>
  );
}
