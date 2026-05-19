import { j as e, r as o, c as V } from "./chunks/client.CTQ0Ju4c.js";
import { t as s, H as X } from "./chunks/tr.sOGZA2rk.js";
const spinnerStyle = document.createElement("style");
spinnerStyle.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes safePulse {
  0% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.45);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(22, 163, 74, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
  }
}`;
document.head.appendChild(spinnerStyle);
const Z = [
  { id: "status", label: "Durum" },
  { id: "dashboard", label: "Skor" },
  { id: "settings", label: "Ayarlar" },
];
function ee({ activeTab: i, onTabChange: l }) {
  return e.jsx("div", {
    style: {
      display: "flex",
      borderBottom: "1px solid #e5e7eb",
      background: "white",
    },
    children: Z.map((r) =>
      e.jsx(
        "button",
        {
          onClick: () => l(r.id),
          title:
            r.id === "status"
              ? "Sayfanın güvenlik durumunu göster"
              : r.id === "dashboard"
                ? "Haftalık güvenlik skorunu göster"
                : "Eklenti ayarlarını göster",
          onMouseEnter: (event) => {
            if (i !== r.id) {
              event.currentTarget.style.background = "#e2e8f0";
            }
          },

          onMouseLeave: (event) => {
            if (i !== r.id) {
              event.currentTarget.style.background = "transparent";
            }
          },
          style: {
            flex: 1,
            padding: "8px 0",
            background: i === r.id ? "#f8fafc" : "transparent",
            boxShadow: i === r.id ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
            border: "none",
            borderBottom:
              i === r.id ? "2px solid #3b82f6" : "2px solid transparent",
            color: i === r.id ? "#3b82f6" : "#6b7280",
            fontWeight: i === r.id ? 600 : 400,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s ease",
            borderRadius: 8,
            margin: "4px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          children: r.label,
        },
        r.id,
      ),
    ),
  });
}
const te = [
  { key: "httpsScore", label: "HTTPS", max: 30, color: "#22c55e" },
  {
    key: "threatAvoidanceScore",
    label: s.dashboard.threat,
    max: 30,
    color: "#3b82f6",
  },
  { key: "activityScore", label: "Aktivite", max: 20, color: "#8b5cf6" },
  {
    key: "trackerScore",
    label: s.dashboard.tracker,
    max: 20,
    color: "#f59e0b",
  },
];
function ie(i) {
  return i >= 80 ? "#16a34a" : i >= 50 ? "#d97706" : "#dc2626";
}
function se() {
  const [i, l] = o.useState(null);
  const [showChecked, setShowChecked] = o.useState(false);
  const [historyList, setHistoryList] = o.useState([]);
  const [showThreats, setShowThreats] = o.useState(false);
  const [threatList, setThreatList] = o.useState([]);
  if (
    (o.useEffect(() => {
      chrome.runtime.sendMessage({ type: "GET_DASHBOARD_SCORE" }, (d) => {
        d != null && d.dashboard && l(d.dashboard);
      });
    }, []),
    !i)
  )
    return e.jsx("div", {
      style: {
        padding: 24,
        textAlign: "center",
        color: "#9ca3af",
        fontSize: 13,
      },
      children: s.loading,
    });
  const r = ie(i.score);
  return e.jsxs("div", {
    style: { padding: 16 },
    children: [
      e.jsxs("div", {
        style: { textAlign: "center", marginBottom: 16 },
        children: [
          e.jsxs("div", {
            style: {
              background: "linear-gradient(135deg, #ecfdf5, #f8fafc)",
              border: "1px solid #bbf7d0",
              borderRadius: 16,
              padding: "16px",
              marginBottom: 16,
              textAlign: "center",
            },
            children: [
              e.jsx("div", {
                style: {
                  fontSize: 12,
                  color: "#64748b",
                  marginBottom: 6,
                },
                children: "Haftalık Güvenlik Skoru",
              }),
              e.jsx("div", {
                style: {
                  fontSize: 40,
                  fontWeight: 800,
                  color:
                    i.score >= 80
                      ? "#16a34a"
                      : i.score >= 50
                        ? "#d97706"
                        : "#dc2626",
                },
                children: i.score,
              }),

              e.jsx("div", {
                style: {
                  fontSize: 12,
                  color:
                    i.score >= 80
                      ? "#166534"
                      : i.score >= 50
                        ? "#92400e"
                        : "#991b1b",
                  fontWeight: 600,
                  marginTop: 4,
                },
                children:
                  i.score >= 80
                    ? "Güvenli seviye"
                    : i.score >= 50
                      ? "Orta risk seviyesi"
                      : "Riskli seviye",
              }),
            ],
          }),
        ],
      }),
      e.jsx("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 16,
        },
        children: te.map(({ key: d, label: c, max: p, color: u }) => {
          const y = Number(i.breakdown[d] || 0),
            S = Math.min(100, Math.round((y / p) * 100));
          return e.jsxs(
            "div",
            {
              children: [
                e.jsxs("div", {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 10,
                    color: "#6b7280",
                    marginBottom: 2,
                  },
                  children: [
                    e.jsx("span", { children: c }),
                    e.jsxs("span", { children: [y, "/", p] }),
                  ],
                }),
                e.jsx("div", {
                  style: {
                    height: 6,
                    borderRadius: 3,
                    background: "#e5e7eb",
                    overflow: "hidden",
                  },
                  children: e.jsx("div", {
                    style: {
                      height: "100%",
                      width: S + "%",
                      background: u,
                      borderRadius: 3,
                    },
                  }),
                }),
              ],
            },
            d,
          );
        }),
      }),
      e.jsxs("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 16,
        },
        children: [
          e.jsx(v, {
            label: s.dashboard.control,
            value: i.currentWeek.urlsChecked,
            title: "Bu hafta kontrol edilen bağlantı sayısı",
            onClick: () => {
              if (!showChecked) {
                chrome.runtime.sendMessage({ type: "GET_HISTORY" }, (res) => {
                  res != null && res.history && setHistoryList(res.history);
                });
              }
              setShowChecked(!showChecked);
            },
          }),

          e.jsx(v, {
            label: "HTTPS",
            value:
              i.currentWeek.httpsCount + i.currentWeek.httpCount > 0
                ? Math.round(
                    (i.currentWeek.httpsCount /
                      (i.currentWeek.httpsCount + i.currentWeek.httpCount)) *
                      100,
                  ) + "%"
                : "0%",
            title: "HTTPS kullanan bağlantıların oranı",
          }),
          e.jsx(v, {
            label: s.dashboard.blockedThreat,
            value: i.currentWeek.threatsBlocked,
            title: "Bu hafta engellenen zararlı tehdit sayısı",
            onClick: () => {
              if (!showThreats) {
                chrome.runtime.sendMessage({ type: "GET_HISTORY" }, (res) => {
                  if (res != null && res.history) {
                    setThreatList(
                      res.history.filter((item) => item.level === "DANGEROUS"),
                    );
                  }
                });
              }
              setShowThreats(!showThreats);
            },
          }),
          e.jsx(v, {
            label: s.dashboard.blockedTracker,
            value: i.currentWeek.trackersBlocked,
            title: "Bu hafta engellenen tracker sayısı",
          }),
        ],
      }),
      showChecked &&
        e.jsxs("div", {
          style: {
            marginBottom: 16,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            overflow: "hidden",
          },
          children: [
            e.jsx("div", {
              style: {
                padding: "8px 10px",
                fontSize: 12,
                fontWeight: 700,
                color: "#1e293b",
                borderBottom: "1px solid #e2e8f0",
              },
              children: "Kontrol Edilenler",
            }),

            historyList.length === 0
              ? e.jsx("div", {
                  style: {
                    padding: "10px",
                    fontSize: 12,
                    color: "#9ca3af",
                    textAlign: "center",
                  },
                  children: "Kayıt bulunamadı",
                })
              : e.jsx("div", {
                  style: {
                    maxHeight: 140,
                    overflowY: "auto",
                  },
                  children: historyList.slice(0, 8).map((item, index) =>
                    e.jsx(
                      "div",
                      {
                        style: {
                          padding: "6px 10px",
                          fontSize: 11,
                          color: "#475569",
                          borderBottom: "1px solid #e5e7eb",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                        children: item.domain,
                      },
                      index,
                    ),
                  ),
                }),
          ],
        }),
      showThreats &&
        e.jsxs("div", {
          style: {
            marginBottom: 16,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 10,
            overflow: "hidden",
          },
          children: [
            e.jsx("div", {
              style: {
                padding: "8px 10px",
                fontSize: 12,
                fontWeight: 700,
                color: "#dc2626",
                borderBottom: "1px solid #fecaca",
              },
              children: "Engellenen Tehditler",
            }),

            threatList.length === 0
              ? e.jsx("div", {
                  style: {
                    padding: "10px",
                    fontSize: 12,
                    color: "#9ca3af",
                    textAlign: "center",
                  },
                  children: "Tehdit bulunamadı",
                })
              : e.jsx("div", {
                  style: {
                    maxHeight: 140,
                    overflowY: "auto",
                  },
                  children: threatList.slice(0, 8).map((item, index) =>
                    e.jsx(
                      "div",
                      {
                        style: {
                          padding: "6px 10px",
                          fontSize: 11,
                          color: "#7f1d1d",
                          borderBottom: "1px solid #fecaca",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                        children: item.domain,
                      },
                      index,
                    ),
                  ),
                }),
          ],
        }),
      i.tips.length > 0 &&
        e.jsxs("div", {
          style: {
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: 10,
            padding: "10px 12px",
            marginTop: 4,
          },
          children: [
            e.jsx("div", {
              style: {
                fontSize: 12,
                fontWeight: 700,
                color: "#9a3412",
                marginBottom: 6,
              },
              children: s.dashboard.suggestions,
            }),
            i.tips.map((d, c) =>
              e.jsxs(
                "div",
                {
                  style: {
                    fontSize: 11,
                    color: "#7c2d12",
                    padding: "2px 0",
                    lineHeight: 1.4,
                  },
                  children: ["* ", d],
                },
                c,
              ),
            ),
          ],
        }),
    ],
  });
}
function v({ label: i, value: l, onClick, title }) {
  return e.jsxs("div", {
    title: title,
    onClick: onClick,
    onMouseEnter: (event) => {
      event.currentTarget.style.background = "#e2e8f0";
      event.currentTarget.style.transform = "translateY(-1px)";
    },
    onMouseLeave: (event) => {
      event.currentTarget.style.background = "#f1f5f9";
      event.currentTarget.style.transform = "translateY(0)";
    },
    style: {
      background: "#f1f5f9",
      borderRadius: 10,
      padding: "10px",
      textAlign: "center",
      border: "1px solid #e2e8f0",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.15s ease",
    },
    children: [
      e.jsx("div", {
        style: { fontSize: 16, fontWeight: 700, color: "#1e293b" },
        children: l,
      }),
      e.jsx("div", {
        style: { fontSize: 10, color: "#64748b" },
        children: i,
      }),
    ],
  });
}
function ne({ domain: i }) {
  const [l, r] = o.useState(null);
  if (
    (o.useEffect(() => {
      i &&
        chrome.runtime.sendMessage({ type: "CHECK_BREACH", domain: i }, (c) => {
          c && r(c);
        });
    }, [i]),
    !i || !(l != null && l.isBreached) || l.breaches.length === 0)
  )
    return null;
  const d = l.breaches[0];
  return e.jsxs("div", {
    style: {
      margin: "0 16px",
      padding: "8px 10px",
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: 6,
      fontSize: 11,
      color: "#1e40af",
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
    children: [
      e.jsx("span", { style: { fontSize: 14 }, children: "🔓" }),
      e.jsx("span", {
        children: s.breach.badgeDetected(
          d.name,
          d.date,
          d.dataTypes.join(", "),
        ),
      }),
    ],
  });
}
const oe = {
    safe: { label: s.status.safe, color: "#16a34a", bg: "#f0fdf4" },
    dangerous: { label: s.status.dangerous, color: "#dc2626", bg: "#fef2f2" },
    suspicious: { label: s.status.suspicious, color: "#d97706", bg: "#fffbeb" },
    unknown: { label: s.status.unknown, color: "#6b7280", bg: "#e9e9eb" },
    disabled: { label: s.status.disabled, color: "#9ca3af", bg: "#f3f4f6" },
  },
  re = {
    safe: "✅",
    dangerous: "🛑",
    suspicious: "⚠️",
    unknown: "❓",
    disabled: "⏸️",
  };
function le() {
  const [i, l] = o.useState(null),
    [r, d] = o.useState(""),
    [c, p] = o.useState("loading"),
    [u, y] = o.useState(!1),
    [S, U] = o.useState([]),
    [k, H] = o.useState(0),
    [w, O] = o.useState({
      urlsChecked: 0,
      threatsBlocked: 0,
      trackersBlocked: 0,
    }),
    [j, G] = o.useState(!1),
    [C, E] = o.useState([]),
    [filter, setFilter] = o.useState(null),
    [I, F] = o.useState([]),
    [T, L] = o.useState("status"),
    [showDetails, setShowDetails] = o.useState(false),
    [f, B] = o.useState(null),
    [x, N] = o.useState(null),
    [z, P] = o.useState(null),
    [m, Y] = o.useState(null),
    [isQuickWhitelisted, setIsQuickWhitelisted] = o.useState(!1),
    [popupWhitelistInput, setPopupWhitelistInput] = o.useState(""),
    [popupWhitelistItems, setPopupWhitelistItems] = o.useState([]),
    [notificationsOpen, setNotificationsOpen] = o.useState(!1),
    [protectedDays, setProtectedDays] = o.useState(1),
    [infoOpen, setInfoOpen] = o.useState(!1),
    R = o.useCallback((t) => {
      (B(t),
        chrome.storage.sync.set({ settings: t }, () => {
          chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED", settings: t });
        }));
    }, []);
  (o.useEffect(() => {
    let t = null;
    function n() {
      chrome.runtime.sendMessage({ type: "GET_INIT_STATUS" }, (g) => {
        g && (l(g), g.ready && t && (clearInterval(t), (t = null)));
      });
    }
    return (
      n(),
      (t = setInterval(n, 300)),
      () => {
        t && clearInterval(t);
      }
    );
  }, []),
    o.useEffect(() => {
      (chrome.storage.sync.get("enabled", (t) => {
        typeof t.enabled == "boolean" && y(t.enabled);
      }),
        chrome.runtime.sendMessage({ type: "GET_STATS" }, (t) => {
          t != null && t.stats && O(t.stats);
        }),
        chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (t) => {
          t != null && t.settings && B(t.settings);
        }),
        chrome.runtime.sendMessage({ type: "GET_DEBUG_INFO" }, (t) => {
          const n = t;
          n != null &&
            n.initTimings &&
            Y({
              initTimings: n.initTimings,
              blacklistSize: n.blacklistSize ?? 0,
              uptime: n.uptime ?? 0,
            });
        }),
        chrome.tabs.query({ active: !0, currentWindow: !0 }, (t) => {
          var g;
          const n = (g = t[0]) == null ? void 0 : g.id;
          n &&
            chrome.runtime.sendMessage(
              { type: "GET_LIST_STATS", tabId: n },
              (b) => {
                const h = b;
                h &&
                  (P({
                    blacklistSize: h.blacklistSize ?? 0,
                    whitelistSize:
                      (h.whitelistSize ?? 0) + (h.dynamicWhitelistSize ?? 0),
                  }),
                  h.tab && N(h.tab));
              },
            );
        }));
    }, [i == null ? void 0 : i.ready]),
    o.useEffect(() => {
      chrome.tabs.query({ active: !0, currentWindow: !0 }, (t) => {
        var g;
        const n = ((g = t[0]) == null ? void 0 : g.url) || "";
        if ((d(n), !u)) {
          p("disabled");
          return;
        }
        if (!n || n.startsWith("chrome://") || n.startsWith("about:")) {
          p("unknown");
          return;
        }
        chrome.runtime.sendMessage({ type: "CHECK_URL", url: n }, (b) => {
          if (!b) {
            p("unknown");
            return;
          }
          (p(b.level.toLowerCase()), U(b.reasons || []), H(b.score || 0));
        });
        try {
          const b = new URL(n).hostname;
          chrome.runtime.sendMessage(
            { type: "GET_PAGE_ANALYSIS", domain: b },
            (h) => {
              var D, M;
              (M =
                (D = h == null ? void 0 : h.analysis) == null
                  ? void 0
                  : D.reasons) != null &&
                M.length &&
                F(h.analysis.reasons);
            },
          );
        } catch {}
      });
    }, [u, i == null ? void 0 : i.ready]));
  const unknownCount = C.filter((item) => item.level === "UNKNOWN").length;
  const todayHistory = C.filter((item) => {
    if (!item.checkedAt) return false;

    const checkedDate = new Date(item.checkedAt);
    const now = new Date();

    return (
      checkedDate.getFullYear() === now.getFullYear() &&
      checkedDate.getMonth() === now.getMonth() &&
      checkedDate.getDate() === now.getDate()
    );
  });

  const todayControlCount = todayHistory.length;
  const todayThreatCount = todayHistory.filter(
    (item) => item.level === "DANGEROUS",
  ).length;
  const todayTrackerCount = todayHistory.filter(
    (item) => item.level === "TRACKER",
  ).length;
  const todayUnknownCount = todayHistory.filter(
    (item) => item.level === "UNKNOWN",
  ).length;
  o.useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_HISTORY" }, (t) => {
      t != null && t.history && E(t.history);
    });
  }, []);

  o.useEffect(() => {
    const handleStorageChange = (changes, areaName) => {
      if (areaName !== "sync") return;

      if (changes.enabled && typeof changes.enabled.newValue === "boolean") {
        y(changes.enabled.newValue);
      }

      if (changes.settings && changes.settings.newValue) {
        const settings = changes.settings.newValue;

        if (typeof settings.enabled === "boolean") {
          y(settings.enabled);
        } else if (typeof settings.isEnabled === "boolean") {
          y(settings.isEnabled);
        } else if (typeof settings.protectionEnabled === "boolean") {
          y(settings.protectionEnabled);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  o.useEffect(() => {
    chrome.storage.sync.get(["settings"], (result) => {
      const settings = result.settings || {};

      let startedAt = settings.protectionStartedAt;

      if (!startedAt && u) {
        startedAt = Date.now();

        chrome.storage.sync.set({
          settings: {
            ...settings,
            protectionStartedAt: startedAt,
          },
        });
      }

      if (startedAt) {
        const diff = Date.now() - Number(startedAt);
        const days = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);

        setProtectedDays(days);
      }
    });
  }, [u]);
  const normalizeWhitelistDomain = (value) => {
    return String(value || "")
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .toLowerCase();
  };
  const isDomainInWhitelist = (domain, whitelist) => {
    return whitelist.some((item) => {
      return domain === item || domain.endsWith("." + item);
    });
  };

  const addCurrentSiteToWhitelist = () => {
    const domain = normalizeWhitelistDomain(W);

    if (!domain || domain === "—") return;

    chrome.storage.sync.get(["settings"], (result) => {
      const settings = result.settings || {};
      const whitelist = settings.whitelist || [];

      const updatedWhitelist = whitelist.includes(domain)
        ? whitelist
        : [...whitelist, domain];

      const updatedSettings = {
        ...settings,
        whitelist: updatedWhitelist,
      };

      chrome.storage.sync.set(
        {
          settings: updatedSettings,
        },
        () => {
          setIsQuickWhitelisted(!0);
          setPopupWhitelistItems(updatedWhitelist);
          p("safe");
          U(["Beyaz Listede"]);
          H(0);

          chrome.runtime.sendMessage({
            type: "ADD_TO_WHITELIST",
            domain,
          });

          chrome.runtime.sendMessage({
            type: "SETTINGS_UPDATED",
            settings: updatedSettings,
          });

          console.log("Beyaz listeye eklendi:", domain);
        },
      );
    });
  };
  const getPopupWhitelist = (callback) => {
    chrome.storage.sync.get(["settings"], (result) => {
      const settings = result.settings || {};
      callback(settings.whitelist || []);
    });
  };

  const savePopupWhitelist = (whitelist, callback) => {
    chrome.storage.sync.get(["settings"], (result) => {
      const settings = result.settings || {};
      const updatedSettings = {
        ...settings,
        whitelist,
      };

      chrome.storage.sync.set(
        {
          settings: updatedSettings,
        },
        () => {
          chrome.runtime.sendMessage({
            type: "SETTINGS_UPDATED",
            settings: updatedSettings,
          });

          if (callback) callback();
        },
      );
    });
  };

  const refreshPopupWhitelist = () => {
    getPopupWhitelist((whitelist) => {
      setPopupWhitelistItems(whitelist);
    });
  };

  const addPopupWhitelistItem = () => {
    const domain = normalizeWhitelistDomain(popupWhitelistInput);

    if (!domain || domain === "—") return;

    getPopupWhitelist((whitelist) => {
      const updatedWhitelist = whitelist.includes(domain)
        ? whitelist
        : [...whitelist, domain];

      savePopupWhitelist(updatedWhitelist, () => {
        setPopupWhitelistInput("");
        setPopupWhitelistItems(updatedWhitelist);

        if (domain === currentDomainForWhitelist) {
          setIsQuickWhitelisted(!0);
          p("safe");
          U(["Beyaz Listede"]);
          H(0);
        }

        chrome.runtime.sendMessage({
          type: "ADD_TO_WHITELIST",
          domain,
        });

        console.log("Popup beyaz listeye eklendi:", domain);
      });
    });
  };

  const recheckCurrentUrlStatus = () => {
    if (!r || !u) return;

    chrome.runtime.sendMessage({ type: "CHECK_URL", url: r }, (response) => {
      if (!response) {
        p("unknown");
        U([]);
        H(0);
        return;
      }

      p(response.level.toLowerCase());
      U(response.reasons || []);
      H(response.score || 0);
    });
  };
  const refreshPageDetails = () => {
    chrome.tabs.query({ active: !0, currentWindow: !0 }, (tabs) => {
      const tabId = tabs[0]?.id;

      if (!tabId) return;

      chrome.runtime.sendMessage(
        { type: "GET_LIST_STATS", tabId },
        (response) => {
          if (!response) return;

          P({
            blacklistSize: response.blacklistSize ?? 0,
            whitelistSize:
              (response.whitelistSize ?? 0) +
              (response.dynamicWhitelistSize ?? 0),
          });

          if (response.tab) {
            N(response.tab);
          }
        },
      );
    });
  };
  const q = (t) => {
      y(t);

      chrome.storage.sync.get(["settings"], (result) => {
        const settings = result.settings || {};

        const updatedSettings = {
          ...settings,
          enabled: t,
          isEnabled: t,
          active: t,
          isActive: t,
          protectionActive: t,
          protectionEnabled: t,
          protectionStartedAt: t
            ? settings.protectionStartedAt || Date.now()
            : settings.protectionStartedAt,
        };

        chrome.storage.sync.set(
          {
            enabled: t,
            settings: updatedSettings,
          },
          () => {
            chrome.runtime.sendMessage({
              type: "SET_ENABLED",
              enabled: t,
            });

            chrome.runtime.sendMessage({
              type: "SETTINGS_UPDATED",
              settings: updatedSettings,
            });
          },
        );
      });
    },
    $ = () => {
      chrome.runtime.sendMessage({ type: "GET_HISTORY" }, (t) => {
        t != null && t.history && E(t.history);
      });
    },
    K = (type = null) => {
      setFilter(type);
      (j || $(), G(!j));
    },
    J = () => {
      chrome.runtime.sendMessage({ type: "CLEAR_HISTORY" }, () => {
        E([]);
      });
    },
    W = (() => {
      try {
        return new URL(r).hostname;
      } catch {
        return r || "—";
      }
    })(),
    displayStatus = isQuickWhitelisted ? "safe" : c,
    a = displayStatus === "loading" ? null : oe[displayStatus],
    Q = displayStatus === "loading" ? "" : re[displayStatus];
  const currentDomainForWhitelist = normalizeWhitelistDomain(W);

  const shouldShowQuickWhitelistButton =
    currentDomainForWhitelist &&
    currentDomainForWhitelist !== "—" &&
    !isQuickWhitelisted &&
    (displayStatus === "dangerous" ||
      displayStatus === "suspicious" ||
      displayStatus === "unknown");

  o.useEffect(() => {
    if (!currentDomainForWhitelist || currentDomainForWhitelist === "—") return;

    chrome.storage.sync.get(["settings"], (result) => {
      const settings = result.settings || {};
      const whitelist = settings.whitelist || [];
      const matchedWhitelist = isDomainInWhitelist(
        currentDomainForWhitelist,
        whitelist,
      );

      setIsQuickWhitelisted(matchedWhitelist);

      if (matchedWhitelist) {
        p("safe");
        U(["Beyaz listede"]);
        H(0);
      }
    });
  }, [currentDomainForWhitelist]);
  o.useEffect(() => {
    chrome.storage.sync.get(["settings"], (result) => {
      const settings = result.settings || {};
      setPopupWhitelistItems(settings.whitelist || []);
    });
  }, []);
  o.useEffect(() => {
    if (showDetails) {
      refreshPageDetails();
    }
  }, [showDetails]);
  return i && !i.ready
    ? e.jsxs("div", {
        style: {
          width: 340,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 14,
          borderRadius: 16,
          overflow: "hidden",
        },
        children: [
          e.jsxs("div", {
            style: {
              padding: "12px 16px",
              background: "#1e293b",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 8,
            },
            children: [
              e.jsx("img", {
                src: "/icons/alparslan_logo.svg",
                alt: "Alparslan",
                style: { width: 36, height: 36 },
              }),
              e.jsx("span", {
                style: { fontWeight: 700, fontSize: 16 },
                children: "Alparslan",
              }),
            ],
          }),
          e.jsxs("div", {
            style: { padding: "32px 24px", textAlign: "center" },
            children: [
              e.jsx("div", {
                style: {
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 16,
                },
                children: i.step,
              }),
              e.jsx("div", {
                style: {
                  height: 6,
                  borderRadius: 3,
                  background: "#e5e7eb",
                  overflow: "hidden",
                  marginBottom: 12,
                },
                children: e.jsx("div", {
                  style: {
                    height: "100%",
                    width: i.percent + "%",
                    background: "linear-gradient(90deg, #3b82f6, #2563eb)",
                    borderRadius: 3,
                    transition: "width 0.3s ease",
                  },
                }),
              }),
              e.jsxs("div", {
                style: { fontSize: 11, color: "#9ca3af", marginBottom: 16 },
                children: ["%", i.percent],
              }),
              e.jsx("div", {
                style: { textAlign: "left", display: "inline-block" },
                children: i.steps.map((t, n) =>
                  e.jsxs(
                    "div",
                    {
                      style: {
                        fontSize: 12,
                        color: t.done ? "#16a34a" : "#9ca3af",
                        padding: "2px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      },
                      children: [
                        e.jsx("span", {
                          style: { fontSize: 14 },
                          children: t.done ? "✓" : "○",
                        }),
                        e.jsx("span", { children: t.name }),
                        t.done &&
                          t.ms !== void 0 &&
                          e.jsxs("span", {
                            style: { fontSize: 10, color: "#b0b5bd" },
                            children: [t.ms, "ms"],
                          }),
                      ],
                    },
                    n,
                  ),
                ),
              }),
            ],
          }),
        ],
      })
    : e.jsxs("div", {
        style: {
          width: 340,
        },
        children: [
          e.jsxs("div", {
            style: {
              padding: "12px 16px",
              background: "linear-gradient(135deg, #1e3a8a, #0f172a)",
              borderBottom: "2px solid #3b82f6",
              boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
              color: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            },
            children: [
              e.jsxs("div", {
                style: { display: "flex", alignItems: "center", gap: 10 },
                children: [
                  e.jsx("img", {
                    src: "/icons/alparslan_logo.svg",
                    alt: "Alparslan",
                    onClick: () => {
                      chrome.tabs.create({
                        url: "https://dijitalsavunma.org/",
                      });
                    },
                    title: "Dijital Savunma sitesine git",
                    onMouseEnter: (event) => {
                      event.currentTarget.style.transform =
                        "translateY(-1px) scale(1.07)";
                      event.currentTarget.style.filter =
                        "drop-shadow(0 0 8px rgba(96, 165, 250, 0.75))";
                    },
                    onMouseLeave: (event) => {
                      event.currentTarget.style.transform =
                        "translateY(0) scale(1)";
                      event.currentTarget.style.filter = "none";
                    },
                    style: {
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    },
                  }),
                  e.jsx("span", {
                    onClick: () => {
                      chrome.tabs.create({
                        url: "https://dijitalsavunma.org/",
                      });
                    },
                    title: "Dijital Savunma sitesine git",
                    onMouseEnter: (event) => {
                      event.currentTarget.style.color = "#60a5fa";
                      event.currentTarget.style.textShadow =
                        "0 0 8px rgba(96, 165, 250, 0.65)";
                      event.currentTarget.style.transform = "translateY(-1px)";
                    },
                    onMouseLeave: (event) => {
                      event.currentTarget.style.color = "#f8fafc";
                      event.currentTarget.style.textShadow = "none";
                      event.currentTarget.style.transform = "translateY(0)";
                    },
                    style: {
                      fontWeight: 700,
                      fontSize: 15,
                      letterSpacing: 0.3,
                      cursor: "pointer",
                      color: "#f8fafc",
                      transition: "all 0.15s ease",
                    },
                    children: "Alparslan",
                  }),
                ],
              }),
              e.jsx("button", {
                onClick: () => setNotificationsOpen(!notificationsOpen),
                title: notificationsOpen
                  ? "Bildirimleri kapat"
                  : "Bildirimleri görüntüle",
                onMouseEnter: (event) => {
                  event.currentTarget.style.background = notificationsOpen
                    ? "rgba(248, 250, 252, 0.22)"
                    : "rgba(96, 165, 250, 0.18)";

                  event.currentTarget.style.transform =
                    "translateY(-1px) scale(1.05)";
                },
                onMouseLeave: (event) => {
                  event.currentTarget.style.background = notificationsOpen
                    ? "rgba(248, 250, 252, 0.12)"
                    : "rgba(255, 255, 255, 0.08)";

                  event.currentTarget.style.transform =
                    "translateY(0) scale(1)";
                },
                style: {
                  marginLeft: "auto",
                  width: 30,
                  height: 30,
                  borderRadius: 999,

                  border: notificationsOpen
                    ? "1px solid rgba(248, 250, 252, 0.55)"
                    : "1px solid rgba(191, 219, 254, 0.35)",

                  background: notificationsOpen
                    ? "rgba(248, 250, 252, 0.12)"
                    : "rgba(255, 255, 255, 0.08)",

                  color: notificationsOpen ? "#e2e8f0" : "#bfdbfe",

                  cursor: "pointer",
                  fontSize: notificationsOpen ? 18 : 14,
                  fontWeight: notificationsOpen ? 500 : 400,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  marginRight: 8,

                  boxShadow: notificationsOpen
                    ? "0 0 10px rgba(148, 163, 184, 0.35)"
                    : "none",
                },
                children: notificationsOpen ? "✕" : "🔔",
              }),
              e.jsxs("label", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  fontSize: 12,
                },
                children: [
                  e.jsx("span", {
                    style: {
                      fontSize: 12,
                      color: "#cbd5e1",
                      fontWeight: 500,
                    },
                    children: u ? s.active : s.passive,
                  }),
                  e.jsx("div", {
                    onClick: () => q(!u),
                    onMouseEnter: (e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    },
                    title: u
                      ? "Korumayı kapatmak için tıklayınız"
                      : "Korumayı etkinleştirmek için tıklayınız",
                    style: {
                      width: 36,
                      height: 20,
                      borderRadius: 10,
                      background: u ? "#22c55e" : "#1f2937",
                      boxShadow: u
                        ? "0 0 6px rgba(34,197,94,0.6)"
                        : "0 0 4px rgba(0,0,0,0.4)",
                      position: "relative",
                      transition: "background 0.2s",
                      cursor: "pointer",
                    },
                    children: e.jsx("div", {
                      style: {
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        background: "white",
                        position: "absolute",
                        top: 2,
                        left: u ? 18 : 2,
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      },
                    }),
                  }),
                ],
              }),
            ],
          }),
          notificationsOpen &&
            e.jsxs("div", {
              style: {
                margin: "10px auto 0 auto",
                width: "calc(100% - 16px)",
                padding: "12px",
                background: "linear-gradient(135deg, #eff6ff, #f8fafc)",
                border: "1px solid #bfdbfe",
                borderRadius: 14,
                boxShadow: "0 8px 18px rgba(30, 64, 175, 0.08)",
                color: "#1e293b",
                width: 300,
              },
              children: [
                e.jsxs("div", {
                  style: {
                    fontSize: 12,
                    lineHeight: 1.45,
                    color: "#334155",
                    background: "#ffffff",
                    border: "1px solid #dbeafe",
                    borderRadius: 10,
                    padding: "8px 10px",
                    marginBottom: 10,
                  },
                  children: [
                    "Ben Alparslan sizi korumak için buradayım! ",
                    e.jsx("span", {
                      onClick: () => {
                        chrome.tabs.create({
                          url: "https://dijitalsavunma.org/",
                        });
                      },
                      title: "Dijital Savunma sitesine git",
                      onMouseEnter: (event) => {
                        event.currentTarget.style.color = "#1d4ed8";
                        event.currentTarget.style.textDecoration = "underline";
                      },
                      onMouseLeave: (event) => {
                        event.currentTarget.style.color = "#2563eb";
                        event.currentTarget.style.textDecoration = "none";
                      },
                      style: {
                        color: "#2563eb",
                        fontWeight: 800,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      },
                      children: "Buraya",
                    }),
                    " tıklayarak benimle ilgili bilgilere ulaşabilirsiniz.",
                  ],
                }),
                e.jsxs("div", {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  },
                  children: [
                    e.jsx("div", {
                      style: {
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                      },
                      children: "🛡️",
                    }),
                    e.jsx("div", {
                      style: {
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#172554",
                      },
                      children: `${protectedDays} gündür korunuyorsunuz`,
                    }),
                  ],
                }),

                e.jsxs("div", {
                  style: {
                    fontSize: 12,
                    lineHeight: 1.55,
                    color: "#475569",
                  },
                  children: [
                    e.jsxs("div", {
                      children: [
                        "Bugün sizin için ",
                        e.jsx("strong", {
                          style: { color: "#1d4ed8" },
                          children: w.urlsChecked,
                        }),
                        " kontrol yaptım.",
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("strong", {
                          style: {
                            color: todayThreatCount > 0 ? "#dc2626" : "#16a34a",
                          },
                          children: w.threatsBlocked,
                        }),
                        " tehdit buldum.",
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("strong", {
                          style: {
                            color:
                              todayTrackerCount > 0 ? "#d97706" : "#16a34a",
                          },
                          children: w.trackersBlocked,
                        }),
                        " tracker buldum.",
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("strong", {
                          style: {
                            color:
                              todayUnknownCount > 0 ? "#3640a0" : "#16a34a",
                          },
                          children: unknownCount,
                        }),
                        " bilinmeyen kayıt tespit ettim.",
                      ],
                    }),
                    e.jsx("button", {
                      onClick: () => setInfoOpen(!infoOpen),
                      onMouseEnter: (event) => {
                        event.currentTarget.style.background = "#dbeafe";
                        event.currentTarget.style.color = "#1d4ed8";
                        event.currentTarget.style.transform =
                          "translateY(-1px)";
                      },
                      onMouseLeave: (event) => {
                        event.currentTarget.style.background = "#eef2ff";
                        event.currentTarget.style.color = "#2563eb";
                        event.currentTarget.style.transform = "translateY(0)";
                      },
                      style: {
                        width: "70%",
                        margin: "22px auto 10px auto",
                        padding: "7px 10px",
                        border: "1px solid #bfdbfe",
                        background: "#eef2ff",
                        color: "#2563eb",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                      },
                      children: infoOpen
                        ? "Bilgilendirmeyi gizle"
                        : e.jsxs(e.Fragment, {
                            children: [
                              e.jsx("span", {
                                style: {
                                  fontSize: 14,
                                },
                                children: "📘",
                              }),

                              e.jsx("span", {
                                children: "Bilgilendirme Merkezi",
                              }),
                            ],
                          }),
                    }),
                    infoOpen &&
                      e.jsxs("div", {
                        style: {
                          marginTop: 10,
                          padding: "10px 11px",
                          background: "#ffffff",
                          border: "1px solid #dbeafe",
                          borderRadius: 12,
                          fontSize: 11,
                          color: "#475569",
                          lineHeight: 1.5,
                        },
                        children: [
                          e.jsx("div", {
                            style: {
                              fontWeight: 800,
                              fontSize: 12,
                              color: "#172554",
                              marginBottom: 6,
                            },
                            children: "Kısa Bilgilendirme",
                          }),
                          e.jsxs("div", {
                            style: { marginBottom: 6 },
                            children: [
                              e.jsx("strong", {
                                style: { color: "#1e3a8a" },
                                children: "Kontrol: ",
                              }),
                              "Eklentinin ziyaret ettiğiniz sayfadaki bağlantıları, istekleri ve alan adlarını güvenlik açısından incelemesini ifade eder.",
                            ],
                          }),
                          e.jsxs("div", {
                            style: { marginBottom: 6 },
                            children: [
                              e.jsx("strong", {
                                style: { color: "#3a76a8" },
                                children: "Skor: ",
                              }),
                              "Haftalık güvenlik skorunu gösterir. ",
                              e.jsx("strong", {
                                style: { color: "#16a34a" },
                                children: "80 – 100",
                              }),
                              " güvenli, ",
                              e.jsx("strong", {
                                style: { color: "#d97706" },
                                children: "50 – 79",
                              }),
                              " orta seviye, ",
                              e.jsx("strong", {
                                style: { color: "#dc2626" },
                                children: "0 – 49",
                              }),
                              " riskli seviye olarak değerlendirilir.",
                            ],
                          }),
                          e.jsxs("div", {
                            style: { marginBottom: 6 },
                            children: [
                              e.jsx("strong", {
                                style: { color: "#16a34a" },
                                children: "Beyaz Liste: ",
                              }),
                              "Güvenilir olduğunu bildiğiniz siteleri eklediğiniz alandır. Bu siteler güvenli kabul edilir. Beyaz listeye ayarlar kısmından ulaşabilirsiniz.",
                            ],
                          }),

                          e.jsxs("div", {
                            style: { marginBottom: 6 },
                            children: [
                              e.jsx("strong", {
                                style: { color: "#020617" },
                                children: "Kara Liste: ",
                              }),
                              "Riskli veya engellenmesini istediğiniz sitelerin tutulduğu listedir.",
                            ],
                          }),

                          e.jsxs("div", {
                            style: { marginBottom: 6 },
                            children: [
                              e.jsx("strong", {
                                style: { color: "#dc2626" },
                                children: "Tehdit: ",
                              }),
                              "Zararlı, şüpheli veya kullanıcı güvenliğini riske atabilecek bağlantıları ifade eder.",
                            ],
                          }),

                          e.jsxs("div", {
                            style: { marginBottom: 6 },
                            children: [
                              e.jsx("strong", {
                                style: { color: "#d97706" },
                                children: "Tracker: ",
                              }),
                              "Sitelerdeki takip mekanizmalarıdır. Kullanıcı davranışlarını izleyebilir.",
                            ],
                          }),

                          e.jsxs("div", {
                            children: [
                              e.jsx("strong", {
                                style: { color: "#3640a0" },
                                children: "Bilinmeyen: ",
                              }),
                              "Sistemin kesin olarak güvenli veya riskli sınıflandıramadığı bağlantıları gösterir. İsterseniz bilinmeyen siteleri ayarlar kısmından beyaz listeye ekleyebilirsiniz.",
                            ],
                          }),
                        ],
                      }),
                  ],
                }),
              ],
            }),
          notificationsOpen
            ? null
            : e.jsx(ee, { activeTab: T, onTabChange: L }),
          notificationsOpen
            ? null
            : T === "dashboard"
              ? e.jsx(se, {})
              : T === "settings"
                ? e.jsx("div", {
                    style: { padding: "12px 16px" },
                    children:
                      f &&
                      e.jsxs(e.Fragment, {
                        children: [
                          e.jsx("div", {
                            style: { marginBottom: 12 },
                            children: e.jsxs("div", {
                              style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px 0",
                              },
                              children: [
                                e.jsxs("div", {
                                  children: [
                                    e.jsx("div", {
                                      style: { fontWeight: 600, fontSize: 13 },
                                      children: s.settings.networkMonitoring,
                                    }),
                                    e.jsx("div", {
                                      style: { fontSize: 11, color: "#6b7280" },
                                      children:
                                        s.settings.networkMonitoringDesc,
                                    }),
                                  ],
                                }),
                                e.jsx("div", {
                                  onClick: () => {
                                    const t = {
                                      ...f,
                                      networkMonitoringEnabled:
                                        !f.networkMonitoringEnabled,
                                    };
                                    (t.networkMonitoringEnabled ||
                                      (t.networkBlockingEnabled = !1),
                                      R(t));
                                  },
                                  style: {
                                    width: 36,
                                    height: 20,
                                    borderRadius: 10,
                                    background: f.networkMonitoringEnabled
                                      ? "#22c55e"
                                      : "#d1d5db",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                  },
                                  onMouseEnter: (e) => {
                                    e.currentTarget.style.transform =
                                      "scale(1.05)";
                                  },

                                  onMouseLeave: (e) => {
                                    e.currentTarget.style.transform =
                                      "scale(1)";
                                  },
                                  children: e.jsx("div", {
                                    style: {
                                      width: 16,
                                      height: 16,
                                      borderRadius: 8,
                                      background: "white",
                                      position: "absolute",
                                      top: 2,
                                      left: f.networkMonitoringEnabled ? 18 : 2,
                                      transition: "left 0.2s",
                                    },
                                  }),
                                }),
                              ],
                            }),
                          }),
                          e.jsx("div", {
                            style: { marginBottom: 12 },
                            children: e.jsxs("div", {
                              style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px 0",
                              },
                              children: [
                                e.jsxs("div", {
                                  children: [
                                    e.jsx("div", {
                                      style: { fontWeight: 600, fontSize: 13 },
                                      children: "Bildirimler",
                                    }),
                                    e.jsx("div", {
                                      style: { fontSize: 11, color: "#6b7280" },
                                      children: s.settings.domWarningsDesc,
                                    }),
                                  ],
                                }),
                                e.jsx("div", {
                                  onClick: () =>
                                    R({
                                      ...f,
                                      showDomWarnings: !f.showDomWarnings,
                                    }),
                                  onMouseEnter: (e) => {
                                    const active = f.showDomWarnings !== !1;

                                    e.currentTarget.style.transform =
                                      "scale(1.05)";
                                    e.currentTarget.style.boxShadow = active
                                      ? "0 0 14px rgba(34,197,94,0.8)"
                                      : "0 0 8px rgba(0,0,0,0.5)";
                                  },

                                  onMouseLeave: (e) => {
                                    const active = f.showDomWarnings !== !1;

                                    e.currentTarget.style.transform =
                                      "scale(1)";
                                    e.currentTarget.style.boxShadow = active
                                      ? "0 0 8px rgba(34,197,94,0.6)"
                                      : "0 0 4px rgba(0,0,0,0.3)";
                                  },
                                  style: {
                                    width: 36,
                                    height: 20,
                                    borderRadius: 10,
                                    background:
                                      f.showDomWarnings !== !1
                                        ? "#22c55e"
                                        : "#1f2937",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    boxShadow:
                                      f.showDomWarnings !== !1
                                        ? "0 0 8px rgba(34,197,94,0.6)"
                                        : "0 0 4px rgba(0,0,0,0.3)",
                                  },
                                  children: e.jsx("div", {
                                    style: {
                                      width: 16,
                                      height: 16,
                                      borderRadius: 8,
                                      background: "white",
                                      position: "absolute",
                                      top: 2,
                                      left: f.showDomWarnings !== !1 ? 18 : 2,
                                      transition: "all 0.2s ease",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                    },
                                  }),
                                }),
                              ],
                            }),
                          }),

                          e.jsxs("div", {
                            style: {
                              marginBottom: 14,
                              padding: 12,
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: 12,
                            },
                            children: [
                              e.jsxs("div", {
                                style: {
                                  marginBottom: 8,
                                },
                                children: [
                                  e.jsx("div", {
                                    style: {
                                      fontWeight: 700,
                                      fontSize: 13,
                                      color: "#111827",
                                    },
                                    children: "Beyaz Liste",
                                  }),
                                  e.jsx("div", {
                                    style: {
                                      fontSize: 11,
                                      color: "#6b7280",
                                      marginTop: 2,
                                    },
                                    children:
                                      "Bu listedeki siteler güvenli kabul edilir",
                                  }),
                                ],
                              }),

                              e.jsxs("div", {
                                style: {
                                  display: "flex",
                                  gap: 6,
                                  marginBottom: 8,
                                },
                                children: [
                                  e.jsx("input", {
                                    value: popupWhitelistInput,
                                    placeholder: "örnek: example.com",
                                    onChange: (event) =>
                                      setPopupWhitelistInput(
                                        event.target.value,
                                      ),
                                    onKeyDown: (event) => {
                                      if (event.key === "Enter") {
                                        addPopupWhitelistItem();
                                      }
                                    },
                                    style: {
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
                                    },
                                  }),

                                  e.jsx("button", {
                                    onClick: addPopupWhitelistItem,
                                    onMouseEnter: (event) => {
                                      event.currentTarget.style.background =
                                        "#1d4ed8";
                                      event.currentTarget.style.transform =
                                        "translateY(-1px)";
                                    },
                                    onMouseLeave: (event) => {
                                      event.currentTarget.style.background =
                                        "#2563eb";
                                      event.currentTarget.style.transform =
                                        "translateY(0)";
                                    },
                                    style: {
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
                                    },
                                    children: "Ekle",
                                  }),
                                ],
                              }),

                              e.jsx("button", {
                                onClick: () => {
                                  chrome.tabs.create({
                                    url: chrome.runtime.getURL(
                                      "whitelist.html",
                                    ),
                                  });
                                },

                                onMouseEnter: (event) => {
                                  event.currentTarget.style.background =
                                    "#e0e7ff";
                                  event.currentTarget.style.color = "#1e3a8a";
                                  event.currentTarget.style.transform =
                                    "translateY(-1px)";
                                },

                                onMouseLeave: (event) => {
                                  event.currentTarget.style.background =
                                    "#eef2ff";
                                  event.currentTarget.style.color = "#2563eb";
                                  event.currentTarget.style.transform =
                                    "translateY(0)";
                                },

                                style: {
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
                                },

                                children: "Beyaz listeyi görüntüle",
                              }),
                            ],
                          }),
                          e.jsx("button", {
                            onClick: () => chrome.runtime.openOptionsPage(),

                            onMouseEnter: (event) => {
                              event.currentTarget.style.background = "#d1d5db";
                              event.currentTarget.style.transform =
                                "scale(1.04)";
                            },

                            onMouseLeave: (event) => {
                              event.currentTarget.style.background = "#e5e7eb";
                              event.currentTarget.style.transform = "scale(1)";
                            },

                            onMouseDown: (event) => {
                              event.currentTarget.style.transform =
                                "scale(0.97)";
                            },

                            onMouseUp: (event) => {
                              event.currentTarget.style.transform =
                                "scale(1.04)";
                            },

                            style: {
                              width: "100%",
                              padding: "10px 0",
                              background: "#e5e7eb",
                              border: "1px solid #d1d5db",
                              borderRadius: 10,
                              cursor: "pointer",
                              fontSize: 12,
                              color: "#374151",
                              fontFamily: "inherit",
                              transition: "all 0.2s ease",
                            },

                            children: `⚙️ ${s.settings.allSettings}`,
                          }),
                        ],
                      }),
                  })
                : e.jsxs(e.Fragment, {
                    children: [
                      e.jsxs("div", {
                        style: {
                          padding: "10px 16px",
                          background: (a == null ? void 0 : a.bg) || "#f9fafb",
                          borderBottom: `3px solid ${(a == null ? void 0 : a.color) || "#e5e7eb"}`,
                        },
                        children: [
                          e.jsxs("div", {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 10,
                              marginBottom: 8,
                              width: "100%",
                            },
                            children: [
                              e.jsxs("div", {
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 7,
                                  flex: 1,
                                  minWidth: 0,
                                },
                                children: [
                                  e.jsx("span", {
                                    style: {
                                      animation:
                                        displayStatus === "safe" && u
                                          ? "safePulse 1.6s ease-out infinite"
                                          : "none",
                                      boxShadow:
                                        displayStatus === "safe" && u
                                          ? "0 0 0 0 rgba(22, 163, 74, 0.45)"
                                          : "none",
                                      width: 10,
                                      height: 10,
                                      borderRadius: "50%",
                                      display: "inline-block",
                                      background:
                                        displayStatus === "safe"
                                          ? "#16a34a"
                                          : displayStatus === "dangerous"
                                            ? "#dc2626"
                                            : displayStatus === "suspicious"
                                              ? "#d97706"
                                              : "#6b7280",
                                      marginTop: -15,
                                      flexShrink: 0,
                                    },
                                  }),

                                  e.jsxs("div", {
                                    title:
                                      displayStatus === "safe"
                                        ? "Bu site güvenli görünüyor"
                                        : displayStatus === "dangerous"
                                          ? "Bu site riskli olabilir"
                                          : displayStatus === "suspicious"
                                            ? "Bu site şüpheli davranış gösteriyor"
                                            : "Bu sitenin durumu belirlenemedi",
                                    style: {
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "center",
                                      minWidth: 0,
                                    },
                                    children: [
                                      e.jsx("div", {
                                        style: {
                                          fontWeight: 700,
                                          fontSize: 16,
                                          color:
                                            (a == null ? void 0 : a.color) ||
                                            "#374151",
                                        },
                                        children:
                                          displayStatus === "loading"
                                            ? s.status.checking
                                            : a == null
                                              ? void 0
                                              : a.label,
                                      }),
                                      e.jsx("div", {
                                        style: {
                                          fontSize: 12,
                                          color: "#6b7280",
                                          marginTop: 2,
                                        },
                                        children: W,
                                      }),
                                    ],
                                  }),
                                ],
                              }),

                              shouldShowQuickWhitelistButton &&
                                e.jsx("button", {
                                  onClick: addCurrentSiteToWhitelist,

                                  onMouseEnter: (event) => {
                                    if (isQuickWhitelisted) return;

                                    event.currentTarget.style.background =
                                      "#dbeafe";
                                    event.currentTarget.style.borderColor =
                                      "#60a5fa";
                                    event.currentTarget.style.transform =
                                      "translateY(-1px)";
                                  },

                                  onMouseLeave: (event) => {
                                    event.currentTarget.style.background =
                                      isQuickWhitelisted
                                        ? "#dcfce7"
                                        : "#eff6ff";

                                    event.currentTarget.style.borderColor =
                                      isQuickWhitelisted
                                        ? "#86efac"
                                        : "#bfdbfe";

                                    event.currentTarget.style.transform =
                                      "translateY(0)";
                                  },

                                  disabled: isQuickWhitelisted,

                                  title: isQuickWhitelisted
                                    ? "Bu site zaten beyaz listede"
                                    : "Bu siteyi beyaz listeye ekle",

                                  style: {
                                    flexShrink: 0,
                                    marginLeft: 8,
                                    border: isQuickWhitelisted
                                      ? "1px solid #86efac"
                                      : "1px solid #bfdbfe",
                                    background: isQuickWhitelisted
                                      ? "#dcfce7"
                                      : "#eff6ff",
                                    color: isQuickWhitelisted
                                      ? "#166534"
                                      : "#2563eb",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: "7px 9px",
                                    borderRadius: 10,
                                    cursor: isQuickWhitelisted
                                      ? "default"
                                      : "pointer",
                                    whiteSpace: "nowrap",
                                    fontFamily: "inherit",
                                    transition: "all 0.15s ease",
                                    opacity: isQuickWhitelisted ? 0.85 : 1,
                                  },

                                  children: isQuickWhitelisted
                                    ? "Listede"
                                    : "Beyaz listeye al",
                                }),
                            ],
                          }),

                          k > 0 &&
                            e.jsxs("div", {
                              style: { marginTop: 8 },
                              children: [
                                e.jsx("div", {
                                  style: {
                                    height: 4,
                                    borderRadius: 2,
                                    background: "#e5e7eb",
                                    overflow: "hidden",
                                  },
                                  children: e.jsx("div", {
                                    style: {
                                      height: "100%",
                                      width: `${Math.min(k, 100)}%`,
                                      background:
                                        (a == null ? void 0 : a.color) ||
                                        "#6b7280",
                                      borderRadius: 2,
                                      transition: "width 0.3s",
                                    },
                                  }),
                                }),
                                e.jsxs("div", {
                                  style: {
                                    fontSize: 11,
                                    color: "#9ca3af",
                                    marginTop: 4,
                                  },
                                  children: [
                                    s.dashboard.threat,
                                    " skoru: ",
                                    k,
                                    "/100",
                                  ],
                                }),
                              ],
                            }),
                          (S.length > 0 || I.length > 0) &&
                            e.jsxs("div", {
                              style: { marginTop: 10 },
                              children: [
                                S.map((t, n) =>
                                  e.jsxs(
                                    "div",
                                    {
                                      style: {
                                        fontSize: 12,
                                        color: "#4b5563",
                                        padding: "4px 0",
                                        borderTop:
                                          n > 0 ? "1px solid #e5e7eb" : void 0,
                                      },
                                      children: ["•", " ", t],
                                    },
                                    `url-${n}`,
                                  ),
                                ),
                                I.map((t, n) =>
                                  e.jsxs(
                                    "div",
                                    {
                                      style: {
                                        fontSize: 12,
                                        color: "#7c3aed",
                                        padding: "4px 0",
                                        borderTop: "1px solid #e5e7eb",
                                      },
                                      children: ["•", " ", t],
                                    },
                                    `page-${n}`,
                                  ),
                                ),
                              ],
                            }),
                        ],
                      }),
                      e.jsx(ne, { domain: W }),
                      e.jsxs("div", {
                        style: {
                          display: "flex",
                          justifyContent: "space-around",
                          padding: "10px 16px",
                          background: "white",
                          borderTop: "1px solid #e5e7eb",
                        },
                        children: [
                          e.jsx(A, {
                            label: s.dashboard.control,
                            value: w.urlsChecked,
                            title: "Kontrol edilen bağlantıların toplam sayısı",
                            onClick: () => K(null),
                          }),
                          e.jsx(A, {
                            label: s.dashboard.threat,
                            value: w.threatsBlocked,
                            title: "Tespit edilen tehlikeli bağlantı sayısı",
                            color: "#dc2626",
                            onClick: () => K("threat"),
                          }),
                          e.jsx(A, {
                            label: s.dashboard.tracker,
                            value: w.trackersBlocked,
                            title: "Tespit edilen tracker sayısı",
                            color: "#d97706",
                            onClick: () => K("tracker"),
                          }),
                          e.jsx(A, {
                            label: "Bilinmeyen",
                            value: unknownCount,
                            title: "Durumu belirlenemeyen bağlantı sayısı",
                            color: "#6b7280",
                            onClick: () => K("unknown"),
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        style: {
                          padding: "8px 16px",
                          textAlign: "center",
                          borderTop: "1px solid #e5e7eb",
                        },
                        children: e.jsx("button", {
                          onClick: () => {
                            if (!showDetails) {
                              refreshPageDetails();
                            }

                            setShowDetails(!showDetails);
                          },
                          title: showDetails
                            ? "Detay panelini kapat"
                            : "Bu sayfadaki ağ izleme detaylarını göster",
                          onMouseEnter: (event) => {
                            event.currentTarget.style.background = "#eef2ff";
                            event.currentTarget.style.color = "#1e3a8a";
                            event.currentTarget.style.transform = "scale(1.03)";
                          },
                          onMouseLeave: (event) => {
                            event.currentTarget.style.background =
                              "transparent";
                            event.currentTarget.style.color = "#3b82f6";
                            event.currentTarget.style.transform = "scale(1)";
                          },
                          style: {
                            background: "transparent",
                            border: "none",
                            color: "#3b82f6",
                            cursor: "pointer",
                            fontSize: 12,
                            fontFamily: "inherit",
                            padding: "6px 12px",
                            borderRadius: 8,
                            transition: "all 0.15s ease",
                          },
                          children: showDetails
                            ? "Detayı gizle"
                            : "Detaylı görüntüle",
                        }),
                      }),
                      showDetails &&
                        (!x || x.requestsChecked <= 0) &&
                        e.jsxs("div", {
                          style: {
                            padding: "12px 16px",
                            background: "#f0f9ff",
                            borderTop: "1px solid #e0f2fe",
                            fontSize: 12,
                            color: "#64748b",
                            textAlign: "center",
                          },
                          children: [
                            e.jsx("div", {
                              style: {
                                width: 18,
                                height: 18,
                                border: "2px solid #cbd5e1",
                                borderTop: "2px solid #3b82f6",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                                margin: "0 auto 6px auto",
                              },
                            }),
                            e.jsx("div", {
                              children: "Detaylar yükleniyor...",
                            }),
                          ],
                        }),
                      showDetails &&
                        x &&
                        x.requestsChecked > 0 &&
                        e.jsxs("div", {
                          style: {
                            padding: "8px 16px",
                            background: "#f0f9ff",
                            borderTop: "1px solid #e0f2fe",
                          },
                          children: [
                            e.jsx("div", {
                              style: {
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#0369a1",
                                marginBottom: 4,
                              },
                              children: s.networkStats.title,
                            }),
                            e.jsxs("div", {
                              style: {
                                display: "flex",
                                justifyContent: "space-around",
                                marginBottom: 4,
                              },
                              children: [
                                e.jsxs("div", {
                                  style: { textAlign: "center" },
                                  children: [
                                    e.jsx("div", {
                                      style: {
                                        fontWeight: 700,
                                        fontSize: 14,
                                        color: "#0369a1",
                                      },
                                      children: x.requestsChecked,
                                    }),
                                    e.jsx("div", {
                                      style: { fontSize: 10, color: "#6b7280" },
                                      children: s.networkStats.request,
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  style: { textAlign: "center" },
                                  children: [
                                    e.jsx("div", {
                                      style: {
                                        fontWeight: 700,
                                        fontSize: 14,
                                        color: "#0369a1",
                                      },
                                      children: x.domains.length,
                                    }),
                                    e.jsx("div", {
                                      style: { fontSize: 10, color: "#6b7280" },
                                      children: s.networkStats.domain,
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  style: { textAlign: "center" },
                                  children: [
                                    e.jsx("div", {
                                      style: {
                                        fontWeight: 700,
                                        fontSize: 14,
                                        color:
                                          x.threatsDetected > 0
                                            ? "#dc2626"
                                            : "#000",
                                      },
                                      children: x.threatsDetected,
                                    }),
                                    e.jsx("div", {
                                      style: { fontSize: 10, color: "#6b7280" },
                                      children: s.networkStats.threat,
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  style: { textAlign: "center" },
                                  children: [
                                    e.jsx("div", {
                                      style: {
                                        fontWeight: 700,
                                        fontSize: 14,
                                        color:
                                          x.requestsBlocked > 0
                                            ? "#ea580c"
                                            : "#000",
                                      },
                                      children: x.requestsBlocked,
                                    }),
                                    e.jsx("div", {
                                      style: { fontSize: 10, color: "#6b7280" },
                                      children: s.networkStats.blocked,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            z &&
                              e.jsxs("div", {
                                style: {
                                  marginBottom: 10,
                                  padding: "8px 10px",
                                  background: "#f8fafc",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: 8,
                                  fontSize: 12,
                                  color: "#475569",
                                },
                                children: [
                                  e.jsx("div", {
                                    children: s.settings.blacklistCount(
                                      z.blacklistSize,
                                    ),
                                  }),
                                  e.jsx("div", {
                                    children: s.settings.whitelistCount(
                                      z.whitelistSize,
                                    ),
                                  }),
                                ],
                              }),
                            x.threats.length > 0 &&
                              e.jsx("div", {
                                style: { maxHeight: 60, overflowY: "auto" },
                                children: x.threats.map((t, n) =>
                                  e.jsx(
                                    "div",
                                    {
                                      style: {
                                        fontSize: 10,
                                        color:
                                          t.level === "DANGEROUS"
                                            ? "#dc2626"
                                            : "#d97706",
                                        padding: "1px 0",
                                      },
                                      children: t.domain,
                                    },
                                    n,
                                  ),
                                ),
                              }),
                          ],
                        }),

                      e.jsx("div", {
                        style: {
                          padding: "6px 16px",
                          borderTop: "1px solid #e5e7eb",
                          display: "flex",
                          justifyContent: "center",
                        },
                        children: e.jsx("button", {
                          onClick: K,
                          title: j
                            ? "Geçmiş listesini gizle"
                            : "Tarama geçmişini görüntüle",
                          onMouseEnter: (event) => {
                            event.currentTarget.style.background = "#eef2ff";
                            event.currentTarget.style.color = "#1e3a8a";
                            event.currentTarget.style.transform = "scale(1.03)";
                          },
                          onMouseLeave: (event) => {
                            event.currentTarget.style.background =
                              "transparent";
                            event.currentTarget.style.color = "#3b82f6";
                            event.currentTarget.style.transform = "scale(1)";
                          },
                          style: {
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
                          },
                          children: j ? s.history.hide : s.history.show,
                        }),
                      }),
                      j &&
                        e.jsx("div", {
                          style: {
                            padding: "10px 16px",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#1e3a8a",
                            background: "#f2f9ff",
                            borderBottom: "1px solid #bae6fd",
                            letterSpacing: 0.3,
                          },
                          children:
                            filter === "threat"
                              ? "Tehdit Listesi"
                              : filter === "tracker"
                                ? "Tracker Listesi"
                                : filter === "unknown"
                                  ? "Bilinmeyen Listesi"
                                  : "Kontrol Listesi",
                        }),
                      j &&
                        e.jsx("div", {
                          style: {
                            maxHeight: 200,
                            overflowY: "auto",
                            borderTop: "1px solid #e5e7eb",
                            background: "#e2e8f0",
                          },
                          children:
                            C.filter((item) => {
                              if (!filter) return true;
                              if (filter === "threat")
                                return item.level === "DANGEROUS";
                              if (filter === "tracker")
                                return item.level === "TRACKER";
                              if (filter === "unknown")
                                return item.level === "UNKNOWN";
                              return true;
                            }).length === 0
                              ? e.jsx("div", {
                                  style: {
                                    padding: "12px 16px",
                                    fontSize: 12,
                                    color:
                                      filter === "threat" ||
                                      filter === "tracker"
                                        ? "#16a34a"
                                        : "#9ca3af",
                                    textAlign: "center",
                                  },
                                  children:
                                    filter === "threat"
                                      ? "Tehdit bulunamadı"
                                      : filter === "tracker"
                                        ? "Tracker bulunamadı"
                                        : filter === "unknown"
                                          ? "Bilinmeyen kayıt bulunamadı"
                                          : s.history.empty,
                                })
                              : e.jsxs(e.Fragment, {
                                  children: [
                                    C.filter((item) => {
                                      if (!filter) return true;
                                      if (filter === "threat")
                                        return item.level === "DANGEROUS";
                                      if (filter === "tracker")
                                        return item.level === "TRACKER";
                                      if (filter === "unknown")
                                        return item.level === "UNKNOWN";
                                      return true;
                                    })
                                      .slice(0, X)
                                      .map((t, n) =>
                                        e.jsxs(
                                          "div",
                                          {
                                            style: {
                                              padding: "6px 16px",
                                              display: "flex",
                                              justifyContent: "space-between",
                                              alignItems: "center",
                                              borderBottom: "1px solid #f3f4f6",
                                              fontSize: 12,
                                              background: "white",
                                              margin: "4px 8px",
                                              borderRadius: 8,
                                              border: "1px solid #e5e7eb",
                                            },
                                            children: [
                                              e.jsxs("div", {
                                                style: { flex: 1, minWidth: 0 },
                                                children: [
                                                  e.jsx("div", {
                                                    style: {
                                                      overflow: "hidden",
                                                      textOverflow: "ellipsis",
                                                      whiteSpace: "nowrap",
                                                      color: "#374151",
                                                    },
                                                    children: t.domain,
                                                  }),
                                                  e.jsx("div", {
                                                    style: {
                                                      fontSize: 10,
                                                      color: "#9ca3af",
                                                    },
                                                    children: new Date(
                                                      t.checkedAt,
                                                    ).toLocaleString("tr-TR", {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                      day: "2-digit",
                                                      month: "2-digit",
                                                    }),
                                                  }),
                                                ],
                                              }),
                                              e.jsx("span", {
                                                style: {
                                                  fontSize: 10,
                                                  fontWeight: 600,
                                                  padding: "2px 6px",
                                                  borderRadius: 4,
                                                  color:
                                                    t.level === "SAFE"
                                                      ? "#166534"
                                                      : t.level === "DANGEROUS"
                                                        ? "#dc2626"
                                                        : t.level ===
                                                            "SUSPICIOUS"
                                                          ? "#d97706"
                                                          : "#6b7280",
                                                  background:
                                                    t.level === "SAFE"
                                                      ? "#dcfce7"
                                                      : t.level === "DANGEROUS"
                                                        ? "#fef2f2"
                                                        : t.level ===
                                                            "SUSPICIOUS"
                                                          ? "#fffbeb"
                                                          : "#f3f4f6",
                                                },
                                                children:
                                                  t.level === "SAFE"
                                                    ? s.status.safe
                                                    : t.level === "DANGEROUS"
                                                      ? "Tehlikeli"
                                                      : t.level === "SUSPICIOUS"
                                                        ? s.status.suspicious
                                                        : s.status.unknown,
                                              }),
                                            ],
                                          },
                                          n,
                                        ),
                                      ),
                                    e.jsx("div", {
                                      style: {
                                        padding: "6px 16px",
                                        textAlign: "center",
                                      },
                                      children: e.jsx("button", {
                                        onClick: J,
                                        onMouseEnter: (event) => {
                                          event.currentTarget.style.background =
                                            "#fecaca";
                                          event.currentTarget.style.transform =
                                            "translateY(-1px)";
                                        },
                                        onMouseLeave: (event) => {
                                          event.currentTarget.style.background =
                                            "#fee2e2";
                                          event.currentTarget.style.transform =
                                            "translateY(0)";
                                        },
                                        style: {
                                          background: "#fee2e2",
                                          border: "1px solid #fecaca",
                                          color: "#dc2626",
                                          cursor: "pointer",
                                          fontSize: 11,
                                          fontWeight: 600,
                                          fontFamily: "inherit",
                                          padding: "6px 12px",
                                          borderRadius: 8,
                                          transition: "all 0.15s ease",
                                        },
                                        children: s.history.clear,
                                      }),
                                    }),
                                  ],
                                }),
                        }),
                    ],
                  }),
          notificationsOpen
            ? null
            : e.jsxs("div", {
                style: {
                  padding: "6px 16px",
                  fontSize: 10,
                  color: "#9ca3af",
                  background: "#f9fafb",
                  borderTop: "1px solid #e5e7eb",
                },
                children: [
                  e.jsxs("div", {
                    style: {
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 10,
                      color: "#9ca3af",
                      width: "100%",
                    },
                    children: [
                      //  e.jsx("button", {
                      //     onClick: () => {
                      //       chrome.tabs.create({
                      //         url: chrome.runtime.getURL("list.html"),
                      //       });
                      //     },
                      //     title: "Liste detaylarını yeni sayfada aç",
                      //     onMouseEnter: (event) => {
                      //       event.currentTarget.style.background = "#dbeafe";
                      //       event.currentTarget.style.color = "#1d4ed8";
                      //       event.currentTarget.style.borderColor = "#93c5fd";
                      //       event.currentTarget.style.transform =
                      //         "translateY(-1px)";
                      //       event.currentTarget.style.boxShadow =
                      //         "0 3px 8px rgba(37, 99, 235, 0.16)";
                      //     },
                      //     onMouseLeave: (event) => {
                      //       event.currentTarget.style.background = "#eef2ff";
                      //       event.currentTarget.style.color = "#2563eb";
                      //       event.currentTarget.style.borderColor = "#bfdbfe";
                      //       event.currentTarget.style.transform =
                      //         "translateY(0)";
                      //       event.currentTarget.style.boxShadow =
                      //         "0 1px 3px rgba(37, 99, 235, 0.08)";
                      //     },
                      // style: {
                      //   justifySelf: "start",
                      //   background: "#eef2ff",
                      //   border: "1px solid #bfdbfe",
                      //   borderRadius: 999,
                      //   padding: "3px 8px",
                      //   fontSize: 9,
                      //   fontWeight: 600,
                      //   color: "#2563eb",
                      //   cursor: "pointer",
                      //   fontFamily: "inherit",
                      //   transition: "all 0.15s ease",
                      //   boxShadow: "0 1px 3px rgba(37, 99, 235, 0.08)",
                      // },
                      // children: "Liste Detayları",
                      // }),

                      e.jsx("div", {
                        style: {
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        },
                        children: s.footer,
                      }),
                    ],
                  }),
                ],
              }),
        ],
      });
}
function A({ label: i, value: l, color: r, onClick, title }) {
  let dynamicColor = r || "#1e293b";

  if (i === s.dashboard.threat) {
    dynamicColor = l > 0 ? "#dc2626" : "#9ca3af";
  }

  if (i === s.dashboard.tracker) {
    dynamicColor = l > 0 ? "#f97316" : "#9ca3af";
  }
  if (i === "Bilinmeyen") {
    dynamicColor = l > 0 ? "#3640a0" : "#9ca3af";
  }
  return e.jsxs("div", {
    title: title,
    style: {
      textAlign: "center",
      cursor: onClick ? "pointer" : "default",
      borderRadius: 8,
      padding: "4px 8px",
      transition: "all 0.15s ease",
    },
    onClick: onClick,
    onMouseEnter: (event) => {
      if (!onClick) return;
      event.currentTarget.style.background = "#f1f5f9";
      event.currentTarget.style.transform = "translateY(-1px)";
    },

    onMouseLeave: (event) => {
      event.currentTarget.style.background = "transparent";
      event.currentTarget.style.transform = "translateY(0)";
    },
    children: [
      e.jsx("div", {
        style: { fontWeight: 700, fontSize: 16, color: dynamicColor },
        children: l,
      }),
      e.jsx("div", {
        style: { fontSize: 11, color: dynamicColor },
        children: i,
      }),
    ],
  });
}
const _ = document.getElementById("root");
_ && V(_).render(e.jsx(o.StrictMode, { children: e.jsx(le, {}) }));

setTimeout(() => {
  const introScreen = document.getElementById("introScreen");
  const root = document.getElementById("root");
  const introActivateBtn = document.getElementById("introActivateBtn");
  const introSwitch = document.getElementById("introSwitch");
  const introSwitchCircle = document.getElementById("introSwitchCircle");
  const introLogo = document.getElementById("introLogo");
  const introSwitchStatus = document.getElementById("introSwitchStatus");

  if (!introScreen || !root || !introActivateBtn) return;

  let ignoreStateCheckUntil = 0;
  let introActivationInProgress = false;

  function showIntroScreen() {
    introScreen.classList.remove("hidden");
    root.classList.add("hidden");

    introActivateBtn.disabled = false;

    if (introSwitch) introSwitch.classList.remove("active");
    if (introSwitchCircle) introSwitchCircle.textContent = "";
    if (introLogo) introLogo.classList.remove("awake");
    if (introSwitchStatus) introSwitchStatus.classList.remove("active");
  }

  function showMainPopup() {
    introScreen.classList.add("hidden");
    root.classList.remove("hidden");

    introActivateBtn.disabled = false;
  }

  function updateIntroVisibility() {
    if (Date.now() < ignoreStateCheckUntil) return;

    chrome.storage.sync.get(["enabled", "settings"], (result) => {
      if (Date.now() < ignoreStateCheckUntil) return;

      const settings = result.settings || {};

      const isEnabled =
        typeof result.enabled === "boolean"
          ? result.enabled
          : typeof settings.enabled === "boolean"
            ? settings.enabled
            : typeof settings.isEnabled === "boolean"
              ? settings.isEnabled
              : false;

      if (isEnabled) {
        showMainPopup();
      } else {
        showIntroScreen();
      }
    });
  }

  updateIntroVisibility();

  introActivateBtn.addEventListener("click", () => {
    introActivateBtn.disabled = true;

    ignoreStateCheckUntil = Date.now() + 2500;
    introActivationInProgress = true;

    if (introSwitch) introSwitch.classList.add("active");
    if (introSwitchCircle) introSwitchCircle.textContent = "";
    if (introLogo) introLogo.classList.add("awake");
    if (introSwitchStatus) introSwitchStatus.classList.add("active");

    chrome.storage.sync.get(["settings"], (result) => {
      const settings = result.settings || {};

      const updatedSettings = {
        ...settings,
        enabled: true,
        isEnabled: true,
        active: true,
        isActive: true,
        protectionActive: true,
        protectionEnabled: true,
        protectionStartedAt: settings.protectionStartedAt || Date.now(),
      };

      chrome.storage.sync.set(
        {
          enabled: true,
          settings: updatedSettings,
        },
        () => {
          chrome.runtime.sendMessage({
            type: "SET_ENABLED",
            enabled: true,
          });

          chrome.runtime.sendMessage({
            type: "SETTINGS_UPDATED",
            settings: updatedSettings,
          });

          setTimeout(() => {
            introActivationInProgress = false;
            showMainPopup();
          }, 1500);
        },
      );
    });
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;

    let newEnabledValue = null;

    if (changes.enabled && typeof changes.enabled.newValue === "boolean") {
      newEnabledValue = changes.enabled.newValue;
    }

    if (changes.settings && changes.settings.newValue) {
      const settings = changes.settings.newValue;

      if (typeof settings.enabled === "boolean") {
        newEnabledValue = settings.enabled;
      } else if (typeof settings.isEnabled === "boolean") {
        newEnabledValue = settings.isEnabled;
      } else if (typeof settings.protectionEnabled === "boolean") {
        newEnabledValue = settings.protectionEnabled;
      }
    }

    if (newEnabledValue === false) {
      ignoreStateCheckUntil = 0;
      introActivationInProgress = false;
      showIntroScreen();
      return;
    }

    if (newEnabledValue === true) {
      if (introActivationInProgress) return;

      showMainPopup();
      return;
    }

    if (changes.enabled || changes.settings) {
      updateIntroVisibility();
    }
  });
}, 100);
