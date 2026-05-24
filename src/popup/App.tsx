import { useState, useEffect, useCallback } from "react";
import { type ThreatResult, type ExtensionStats, type ExtensionSettings, type ScanHistoryEntry, HISTORY_DISPLAY_LIMIT } from "@/utils/types";
import TabBar, { type TabId } from "./TabBar";
import DashboardTab from "./DashboardTab";
import BreachBadge from "./BreachBadge";
import { normalizeQuickWhitelistDomain, isDomainInWhitelist } from "./whitelist-helpers";
import t from "@/i18n/tr";

type SecurityStatus = "safe" | "dangerous" | "suspicious" | "unknown" | "loading" | "disabled";

const STATUS_CONFIG: Record<Exclude<SecurityStatus, "loading">, { label: string; color: string; bg: string }> = {
  safe: { label: t.status.safe, color: "#16a34a", bg: "#f0fdf4" },
  dangerous: { label: t.status.dangerous, color: "#dc2626", bg: "#fef2f2" },
  suspicious: { label: t.status.suspicious, color: "#d97706", bg: "#fffbeb" },
  unknown: { label: t.status.unknown, color: "#6b7280", bg: "#f9fafb" },
  disabled: { label: t.status.disabled, color: "#9ca3af", bg: "#f3f4f6" },
};

const STATUS_ICONS: Record<Exclude<SecurityStatus, "loading">, string> = {
  safe: "\u2705",
  dangerous: "\uD83D\uDED1",
  suspicious: "\u26A0\uFE0F",
  unknown: "\u2753",
  disabled: "\u23F8\uFE0F",
};

interface InitStatus {
  ready: boolean;
  step: string;
  percent: number;
  steps: { name: string; done: boolean; ms?: number }[];
}

export default function App() {
  const [initStatus, setInitStatus] = useState<InitStatus | null>(null);
  const [url, setUrl] = useState<string>("");
  const [status, setStatus] = useState<SecurityStatus>("loading");
  const [enabled, setEnabled] = useState<boolean>(true);
  const [reasons, setReasons] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [stats, setStats] = useState<ExtensionStats>({ urlsChecked: 0, threatsBlocked: 0, trackersBlocked: 0 });
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [pageReasons, setPageReasons] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("status");
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
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
  const [protectedDays, setProtectedDays] = useState<number>(1);
  const [popupWhitelistInput, setPopupWhitelistInput] = useState<string>("");

  const saveSettings = useCallback((updated: ExtensionSettings) => {
    setSettings(updated);
    chrome.storage.sync.set({ settings: updated }, () => {
      chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED", settings: updated });
    });
  }, []);

  // Poll init status until ready
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    function checkInit(): void {
      chrome.runtime.sendMessage({ type: "GET_INIT_STATUS" }, (response: InitStatus | null) => {
        if (response) {
          setInitStatus(response);
          if (response.ready && timer) {
            clearInterval(timer);
            timer = null;
          }
        }
      });
    }

    checkInit();
    timer = setInterval(checkInit, 300);
    return () => { if (timer) clearInterval(timer); };
  }, []);

  // Fetch all popup data — re-runs when init becomes ready
  useEffect(() => {
    // Restore persisted enabled state so the toggle reflects reality
    // after closing and reopening the popup.
    chrome.storage.sync.get("enabled", (result) => {
      if (typeof result.enabled === "boolean") setEnabled(result.enabled);
    });

    chrome.runtime.sendMessage({ type: "GET_STATS" }, (response: { stats: ExtensionStats } | null) => {
      if (response?.stats) setStats(response.stats);
    });
    chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (response: { settings: ExtensionSettings } | null) => {
      if (response?.settings) setSettings(response.settings);
    });
    // Get per-tab network stats for the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.runtime.sendMessage({ type: "GET_LIST_STATS", tabId }, (response: unknown) => {
          const r = response as {
            blacklistSize?: number; whitelistSize?: number; dynamicWhitelistSize?: number;
            tab?: { requestsChecked: number; threatsDetected: number; requestsBlocked: number; domains: string[]; threats: Array<{ domain: string; level: string; timestamp: number }> };
          } | null;
          if (r) {
            setListStats({ blacklistSize: r.blacklistSize ?? 0, whitelistSize: (r.whitelistSize ?? 0) + (r.dynamicWhitelistSize ?? 0) });
            if (r.tab) setTabStats(r.tab);
          }
        });
      }
    });
  }, [initStatus?.ready]);

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

  const handleToggle = (newEnabled: boolean) => {
    setEnabled(newEnabled);
    chrome.runtime.sendMessage({ type: "SET_ENABLED", enabled: newEnabled });
  };

  const loadHistory = () => {
    chrome.runtime.sendMessage({ type: "GET_HISTORY" }, (response: { history: ScanHistoryEntry[] } | null) => {
      if (response?.history) setHistory(response.history);
    });
  };

  // Eager-load history on mount so the "Bilinmeyen" counter has data without
  // requiring the user to open the history panel first.
  useEffect(() => {
    loadHistory();
  }, []);

  // Read protection start date (set by the intro-screen activation flow) and
  // derive how many days the user has been protected. Minimum 1 so the badge
  // never says "0 gündür korunuyorsunuz".
  useEffect(() => {
    chrome.storage.sync.get(["settings"], (result) => {
      const settings = result.settings || {};
      const startedAt = typeof settings.protectionStartedAt === "number"
        ? settings.protectionStartedAt
        : Date.now();
      const days = Math.max(1, Math.floor((Date.now() - startedAt) / (1000 * 60 * 60 * 24)) + 1);
      setProtectedDays(days);
    });
  }, []);

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
      // Intro-screen activation writes `enabled: true` to sync storage; without
      // this we'd keep showing "Pasif" in the header because App.tsx's initial
      // storage read happened before the user clicked "Aktif et".
      if ("enabled" in changes && typeof changes.enabled.newValue === "boolean") {
        setEnabled(changes.enabled.newValue);
      }
      if ("settings" in changes) {
        checkWhitelistMembership();
        // Settings object can also carry an `enabled` flag (legacy bundled
        // popup wrote both). Honour it so the toggle stays in sync.
        const settings = changes.settings.newValue as { enabled?: boolean } | undefined;
        if (settings && typeof settings.enabled === "boolean") {
          setEnabled(settings.enabled);
        }
      }
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, [checkWhitelistMembership]);

  const handleToggleHistory = () => {
    if (!showHistory) loadHistory();
    setShowHistory(!showHistory);
  };

  const handleStatClick = (filter: "threat" | "tracker" | "unknown" | null) => {
    setHistoryFilter(filter);
    if (!showHistory) {
      loadHistory();
      setShowHistory(true);
    }
  };

  const handleClearHistory = () => {
    chrome.runtime.sendMessage({ type: "CLEAR_HISTORY" }, () => {
      setHistory([]);
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

  // Loading screen while lists are being loaded
  if (initStatus && !initStatus.ready) {
    return (
      <div style={{ width: 340, fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 14 }}>
        <div
          style={{
            padding: "12px 16px",
            background: "linear-gradient(135deg, #1e3a8a, #0f172a)",
            borderBottom: "2px solid #3b82f6",
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
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 16 }}>
            {initStatus.step}
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, borderRadius: 3, background: "#e5e7eb", overflow: "hidden", marginBottom: 12 }}>
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
          background: "linear-gradient(135deg, #1e3a8a, #0f172a)",
          borderBottom: "2px solid #3b82f6",
          boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
          color: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <img
            src="/icons/alparslan_logo.svg"
            alt="Alparslan"
            onClick={() => chrome.tabs.create({ url: "https://dijitalsavunma.org/" })}
            title="Dijital Savunma sitesine git"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px) scale(1.07)";
              e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(96, 165, 250, 0.75))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.filter = "none";
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          />
          <span
            onClick={() => chrome.tabs.create({ url: "https://dijitalsavunma.org/" })}
            title="Dijital Savunma sitesine git"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#60a5fa";
              e.currentTarget.style.textShadow = "0 0 8px rgba(96, 165, 250, 0.65)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#f8fafc";
              e.currentTarget.style.textShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            style={{
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: 0.3,
              cursor: "pointer",
              color: "#f8fafc",
              transition: "all 0.15s ease",
              display: "inline-block",
            }}
          >
            Alparslan
          </span>
        </div>
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
          <div
            onClick={() => handleToggle(!enabled)}
            title={enabled ? t.protectionToggle.disable : t.protectionToggle.enable}
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              background: enabled ? "#22c55e" : "#4b5563",
              position: "relative",
              transition: "background 0.2s",
              cursor: "pointer",
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
          </div>
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
              {/* Network Monitoring Toggle */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.settings.networkMonitoring}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{t.settings.networkMonitoringDesc}</div>
                  </div>
                  <div
                    onClick={() => {
                      const updated = { ...settings, networkMonitoringEnabled: !settings.networkMonitoringEnabled };
                      if (!updated.networkMonitoringEnabled) updated.networkBlockingEnabled = false;
                      saveSettings(updated);
                    }}
                    style={{ width: 36, height: 20, borderRadius: 10, background: settings.networkMonitoringEnabled ? "#22c55e" : "#d1d5db", position: "relative", cursor: "pointer" }}
                  >
                    <div style={{ width: 16, height: 16, borderRadius: 8, background: "white", position: "absolute", top: 2, left: settings.networkMonitoringEnabled ? 18 : 2, transition: "left 0.2s" }} />
                  </div>
                </div>
              </div>

              {/* DOM Warning Toggle */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.settings.domWarnings}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{t.settings.domWarningsDesc}</div>
                  </div>
                  <div
                    onClick={() => saveSettings({ ...settings, showDomWarnings: !settings.showDomWarnings })}
                    style={{ width: 36, height: 20, borderRadius: 10, background: settings.showDomWarnings !== false ? "#22c55e" : "#d1d5db", position: "relative", cursor: "pointer" }}
                  >
                    <div style={{ width: 16, height: 16, borderRadius: 8, background: "white", position: "absolute", top: 2, left: (settings.showDomWarnings !== false) ? 18 : 2, transition: "left 0.2s" }} />
                  </div>
                </div>
              </div>

              {/* Beyaz Liste — popup-side quick management */}
              <div
                style={{
                  marginBottom: 14,
                  padding: 12,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>
                    {t.options.whitelist}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                    Bu listedeki siteler güvenli kabul edilir
                  </div>
                </div>
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
                      border: "1px solid #d1d5db",
                      borderRadius: 9,
                      fontSize: 12,
                      outline: "none",
                      fontFamily: "inherit",
                      color: "#374151",
                      background: "white",
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
          padding: "10px 16px",
          background: config?.bg || "#f9fafb",
          borderBottom: `3px solid ${config?.color || "#e5e7eb"}`,
        }}
      >
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
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{displayDomain}</div>
            </div>
          </div>

          {/* Inline quick-add button \u2014 only shows on non-safe verdicts and
              disappears once the site is whitelisted (matches the bundled
              popup's behaviour where displayStatus flips to "safe"). */}
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
                flexShrink: 0,
                marginLeft: 8,
                border: "1px solid #bfdbfe",
                background: "#eff6ff",
                color: "#2563eb",
                fontSize: 11,
                fontWeight: 700,
                padding: "7px 9px",
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

        {score > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 4, borderRadius: 2, background: "#e5e7eb", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(score, 100)}%`,
                  background: config?.color || "#6b7280",
                  borderRadius: 2,
                  transition: "width 0.3s",
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
              {t.dashboard.threat} skoru: {score}/100
            </div>
          </div>
        )}

        {(reasons.length > 0 || pageReasons.length > 0) && (
          <div style={{ marginTop: 10 }}>
            {reasons.map((r, i) => (
              <div
                key={`url-${i}`}
                style={{
                  fontSize: 12,
                  color: "#4b5563",
                  padding: "4px 0",
                  borderTop: i > 0 ? "1px solid #e5e7eb" : undefined,
                }}
              >
                {"\u2022"} {r}
              </div>
            ))}
            {pageReasons.map((r, i) => (
              <div
                key={`page-${i}`}
                style={{
                  fontSize: 12,
                  color: "#7c3aed",
                  padding: "4px 0",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                {"\u2022"} {r}
              </div>
            ))}
          </div>
        )}
      </div>

      <BreachBadge domain={displayDomain} />

      {/* Stats — clickable; opens history filtered to the chosen category */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 16px",
          background: "white",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <StatItem
          label={t.dashboard.control}
          value={stats.urlsChecked}
          title={t.filterLists.tooltipControl}
          onClick={() => handleStatClick(null)}
        />
        <StatItem
          label={t.dashboard.threat}
          value={stats.threatsBlocked}
          title={t.filterLists.tooltipThreat}
          onClick={() => handleStatClick("threat")}
        />
        <StatItem
          label={t.dashboard.tracker}
          value={stats.trackersBlocked}
          title={t.filterLists.tooltipTracker}
          onClick={() => handleStatClick("tracker")}
        />
        <StatItem
          label={t.filterLists.unknownLabel}
          value={history.filter((h) => h.level === "UNKNOWN").length}
          title={t.filterLists.tooltipUnknown}
          onClick={() => handleStatClick("unknown")}
        />
      </div>

      {/* Detail Panel Toggle — same blue pill styling as "Tarama geçmişi" */}
      {status !== "loading" && (
        <div style={{ padding: "6px 16px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            title={showDetails ? t.detailPanel.close : "Bu sayfadaki ağ izleme detaylarını göster"}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#eef2ff";
              e.currentTarget.style.color = "#1e3a8a";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#3b82f6";
              e.currentTarget.style.transform = "scale(1)";
            }}
            style={{
              width: "auto",
              padding: "6px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              color: "#3b82f6",
              fontFamily: "inherit",
              borderRadius: 8,
              transition: "all 0.15s ease",
            }}
          >
            {showDetails ? t.detailPanel.hide : t.detailPanel.show}
          </button>
        </div>
      )}

      {/* Network Monitoring Stats — per-tab (in detail panel) */}
      {showDetails && (
        <div style={{ padding: "8px 16px", background: "#f0f9ff", borderTop: "1px solid #e0f2fe" }}>
          {!tabStats ? (
            <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", padding: "8px 0" }}>
              {t.detailPanel.loading}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0369a1", marginBottom: 4 }}>
                {t.networkStats.title}
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 4 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0369a1" }}>{tabStats.requestsChecked}</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{t.networkStats.request}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0369a1" }}>{tabStats.domains.length}</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{t.networkStats.domain}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#dc2626" }}>{tabStats.threatsDetected}</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{t.networkStats.threat}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#ea580c" }}>{tabStats.requestsBlocked}</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{t.networkStats.blocked}</div>
                </div>
              </div>
              {tabStats.threats.length > 0 && (
                <div style={{ maxHeight: 60, overflowY: "auto", marginBottom: 10 }}>
                  {tabStats.threats.map((threat, i) => (
                    <div key={i} style={{ fontSize: 10, color: threat.level === "DANGEROUS" ? "#dc2626" : "#d97706", padding: "1px 0" }}>
                      {threat.domain}
                    </div>
                  ))}
                </div>
              )}

              {/* Global list sizes (Kara liste / Beyaz liste) — kept at the
                  BOTTOM of the detail panel per design feedback. */}
              {listStats && (
                <div
                  style={{
                    padding: "8px 10px",
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#475569",
                  }}
                >
                  <div>{t.settings.blacklistCount(listStats.blacklistSize)}</div>
                  <div>{t.settings.whitelistCount(listStats.whitelistSize)}</div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* History Toggle — matches the Detaylı görüntüle pill */}
      <div style={{ padding: "6px 16px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "center" }}>
        <button
          onClick={handleToggleHistory}
          title={showHistory ? t.history.hideAlt : t.history.showAlt}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#eef2ff";
            e.currentTarget.style.color = "#1e3a8a";
            e.currentTarget.style.transform = "scale(1.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#3b82f6";
            e.currentTarget.style.transform = "scale(1)";
          }}
          style={{
            width: "auto",
            padding: "6px 12px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            color: "#3b82f6",
            fontFamily: "inherit",
            borderRadius: 8,
            transition: "all 0.15s ease",
          }}
        >
          {showHistory ? t.history.hide : t.history.show}
        </button>
      </div>

      {showHistory && (() => {
        const filtered = history.filter((item) => {
          if (!historyFilter) return true;
          if (historyFilter === "threat") return item.level === "DANGEROUS";
          // TRACKER isn't in the ThreatLevel enum — history doesn't currently
          // record tracker entries, so this filter always renders empty. Kept
          // for parity with the legacy bundled UI; revisit if tracker history
          // ever lands.
          if (historyFilter === "tracker") return (item.level as string) === "TRACKER";
          if (historyFilter === "unknown") return item.level === "UNKNOWN";
          return true;
        });
        const listTitle =
          historyFilter === "threat" ? t.filterLists.threatList :
          historyFilter === "tracker" ? t.filterLists.trackerList :
          historyFilter === "unknown" ? t.filterLists.unknownList :
          t.filterLists.controlList;
        const emptyMessage =
          historyFilter === "threat" ? t.filterLists.threatEmpty :
          historyFilter === "tracker" ? t.filterLists.trackerEmpty :
          historyFilter === "unknown" ? t.filterLists.unknownEmpty :
          t.history.empty;
        const emptyColor =
          historyFilter === "threat" || historyFilter === "tracker" ? "#16a34a" : "#9ca3af";

        return (
          <>
            <div
              style={{
                padding: "10px 16px",
                fontSize: 12,
                fontWeight: 700,
                color: "#1e3a8a",
                background: "#f2f9ff",
                borderBottom: "1px solid #bae6fd",
                letterSpacing: 0.3,
              }}
            >
              {listTitle}
            </div>
            <div style={{ maxHeight: 200, overflowY: "auto", borderTop: "1px solid #e5e7eb" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "12px 16px", fontSize: 12, color: emptyColor, textAlign: "center" }}>
              {emptyMessage}
            </div>
          ) : (
            <>
              {filtered.slice(0, HISTORY_DISPLAY_LIMIT).map((entry, i) => (
                <div
                  key={i}
                  style={{
                    padding: "6px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #f3f4f6",
                    fontSize: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#374151" }}>
                      {entry.domain}
                    </div>
                    <div style={{ fontSize: 10, color: "#9ca3af" }}>
                      {new Date(entry.checkedAt).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 4,
                      color: entry.level === "SAFE" ? "#166534" : entry.level === "DANGEROUS" ? "#dc2626" : entry.level === "SUSPICIOUS" ? "#d97706" : "#6b7280",
                      background: entry.level === "SAFE" ? "#dcfce7" : entry.level === "DANGEROUS" ? "#fef2f2" : entry.level === "SUSPICIOUS" ? "#fffbeb" : "#f3f4f6",
                    }}
                  >
                    {entry.level === "SAFE" ? t.status.safe : entry.level === "DANGEROUS" ? "Tehlikeli" : entry.level === "SUSPICIOUS" ? t.status.suspicious : t.status.unknown}
                  </span>
                </div>
              ))}
              <div style={{ padding: "6px 16px", textAlign: "center" }}>
                <button
                  onClick={handleClearHistory}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: 11,
                    fontFamily: "inherit",
                  }}
                >
                  {t.history.clear}
                </button>
              </div>
            </>
          )}
            </div>
          </>
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
            color: "#9ca3af",
            background: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
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
    </div>
  );
}

function StatItem({ label, value, color, onClick, title }: { label: string; value: number; color?: string; onClick?: () => void; title?: string }) {
  // Value-driven colouring: a non-zero "Tehdit"/"Tracker"/"Bilinmeyen" stat
  // pops in its severity colour; zero stays muted so users can scan the row
  // and see at a glance whether anything needs attention. The explicit
  // `color` prop wins if the caller passes one.
  let dynamicColor = color || "#1e293b";
  if (label === t.dashboard.threat) dynamicColor = value > 0 ? "#dc2626" : "#9ca3af";
  else if (label === t.dashboard.tracker) dynamicColor = value > 0 ? "#f97316" : "#9ca3af";
  else if (label === t.filterLists.unknownLabel) dynamicColor = value > 0 ? "#3640a0" : "#9ca3af";

  return (
    <div
      onClick={onClick}
      title={title}
      onMouseEnter={(e) => {
        if (!onClick) return;
        e.currentTarget.style.background = "#f1f5f9";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      style={{
        textAlign: "center",
        cursor: onClick ? "pointer" : "default",
        borderRadius: 8,
        padding: "4px 8px",
        transition: "all 0.15s ease",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 16, color: dynamicColor }}>{value}</div>
      <div style={{ fontSize: 11, color: dynamicColor }}>{label}</div>
    </div>
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
        background: "linear-gradient(135deg, #eff6ff, #f8fafc)",
        border: "1px solid #bfdbfe",
        borderRadius: 14,
        boxShadow: "0 8px 18px rgba(30, 64, 175, 0.08)",
        color: "#1e293b",
      }}
    >
      {/* Welcome message */}
      <div
        style={{
          fontSize: 12,
          lineHeight: 1.45,
          color: "#334155",
          background: "#ffffff",
          border: "1px solid #dbeafe",
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
        <div style={{ fontSize: 13, fontWeight: 800, color: "#172554" }}>
          {t.notificationCenter.protectedDays(protectedDays)}
        </div>
      </div>

      {/* Daily summary */}
      <div style={{ fontSize: 12, lineHeight: 1.55, color: "#475569", marginBottom: 10 }}>
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
            background: "#ffffff",
            border: "1px solid #dbeafe",
            borderRadius: 12,
            fontSize: 11,
            color: "#475569",
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 12, color: "#172554", marginBottom: 6 }}>
            {t.notificationCenter.infoTitle}
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong style={{ color: "#1e3a8a" }}>{g.controlLabel}: </strong>
            {g.controlDesc}
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong style={{ color: "#3a76a8" }}>{g.scoreLabel}: </strong>
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
            <strong style={{ color: "#020617" }}>{g.blacklistLabel}: </strong>
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
            <strong style={{ color: "#3640a0" }}>{g.unknownLabel}: </strong>
            {g.unknownDesc}
          </div>
        </div>
      )}
    </div>
  );
}
