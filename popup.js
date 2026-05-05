import { j as e, r as o, c as V } from "./chunks/client.CTQ0Ju4c.js";
import { t as s, H as X } from "./chunks/tr.sOGZA2rk.js";
const spinnerStyle = document.createElement("style");
spinnerStyle.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
    [u, y] = o.useState(!0),
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
  o.useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_HISTORY" }, (t) => {
      t != null && t.history && E(t.history);
    });
  }, []);
  const q = (t) => {
      (y(t), chrome.runtime.sendMessage({ type: "SET_ENABLED", enabled: t }));
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
    a = c === "loading" ? null : oe[c],
    Q = c === "loading" ? "" : re[c],
    W = (() => {
      try {
        return new URL(r).hostname;
      } catch {
        return r || "—";
      }
    })();
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
                    style: {
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                    },
                  }),
                  e.jsx("span", {
                    style: {
                      fontWeight: 600,
                      fontSize: 15,
                      letterSpacing: 0.3,
                    },
                    children: "Alparslan",
                  }),
                ],
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
          e.jsx(ee, { activeTab: T, onTabChange: L }),
          T === "dashboard"
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
                                    children: s.settings.networkMonitoringDesc,
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
                                  e.currentTarget.style.transform = "scale(1)";
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

                                  e.currentTarget.style.transform = "scale(1)";
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

                        e.jsx("button", {
                          onClick: () => chrome.runtime.openOptionsPage(),

                          onMouseEnter: (event) => {
                            event.currentTarget.style.background = "#d1d5db";
                            event.currentTarget.style.transform = "scale(1.04)";
                          },

                          onMouseLeave: (event) => {
                            event.currentTarget.style.background = "#e5e7eb";
                            event.currentTarget.style.transform = "scale(1)";
                          },

                          onMouseDown: (event) => {
                            event.currentTarget.style.transform = "scale(0.97)";
                          },

                          onMouseUp: (event) => {
                            event.currentTarget.style.transform = "scale(1.04)";
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
                            gap: 7,
                            marginBottom: 8,
                          },
                          children: [
                            e.jsx("span", {
                              style: {
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                display: "inline-block",
                                background:
                                  c === "safe"
                                    ? "#16a34a"
                                    : c === "dangerous"
                                      ? "#dc2626"
                                      : c === "suspicious"
                                        ? "#d97706"
                                        : "#6b7280",
                                marginTop: -15,
                              },
                            }),
                            e.jsxs("div", {
                              title:
                                c === "safe"
                                  ? "Bu site güvenli görünüyor"
                                  : c === "dangerous"
                                    ? "Bu site riskli olabilir"
                                    : c === "suspicious"
                                      ? "Bu site şüpheli davranış gösteriyor"
                                      : "Bu sitenin durumu belirlenemedi",
                              style: {
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
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
                                    c === "loading"
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
                        onClick: () => setShowDetails(!showDetails),
                        title: showDetails
                          ? "Detay panelini kapat"
                          : "Bu sayfadaki ağ izleme detaylarını göster",
                        onMouseEnter: (event) => {
                          event.currentTarget.style.background = "#eef2ff";
                          event.currentTarget.style.color = "#1e3a8a";
                          event.currentTarget.style.transform = "scale(1.03)";
                        },
                        onMouseLeave: (event) => {
                          event.currentTarget.style.background = "transparent";
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
                          event.currentTarget.style.background = "transparent";
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
                                    filter === "threat" || filter === "tracker"
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
                                                      : t.level === "SUSPICIOUS"
                                                        ? "#d97706"
                                                        : "#6b7280",
                                                background:
                                                  t.level === "SAFE"
                                                    ? "#dcfce7"
                                                    : t.level === "DANGEROUS"
                                                      ? "#fef2f2"
                                                      : t.level === "SUSPICIOUS"
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
          e.jsxs("div", {
            style: {
              padding: "6px 16px",
              fontSize: 10,
              color: "#9ca3af",
              background: "#f9fafb",
              borderTop: "1px solid #e5e7eb",
            },
            children: [
              e.jsx("div", {
                style: { textAlign: "center", marginBottom: m ? 2 : 0 },
                children: s.footer,
              }),
              m &&
                e.jsxs("div", {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 9,
                    color: "#b0b5bd",
                  },
                  children: [
                    e.jsxs("span", {
                      children: ["init: ", m.initTimings.total ?? "?", "ms"],
                    }),
                    e.jsx("button", {
                      onClick: () => {
                        chrome.tabs.create({
                          url: chrome.runtime.getURL("list.html"),
                        });
                      },
                      title: "Liste detaylarını yeni sayfada aç",
                      onMouseEnter: (event) => {
                        event.currentTarget.style.background = "#e0e7ff";
                        event.currentTarget.style.color = "#1e3a8a";
                      },
                      onMouseLeave: (event) => {
                        event.currentTarget.style.background = "transparent";
                        event.currentTarget.style.color = "#64748b";
                      },
                      style: {
                        background: "transparent",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        padding: "2px 6px",
                        fontSize: 9,
                        color: "#64748b",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.15s ease",
                      },
                      children: ["liste: ", m.blacklistSize],
                    }),
                    e.jsxs("span", {
                      children: ["uptime: ", Math.round(m.uptime / 1e3), "s"],
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
