import { r as l, j as e, c as z } from "./chunks/client.CTQ0Ju4c.js";
import { D as p, t as i } from "./chunks/tr.sOGZA2rk.js";
const D = new Set([
  "com",
  "org",
  "net",
  "edu",
  "gov",
  "mil",
  "int",
  "info",
  "biz",
  "tr",
  "uk",
  "de",
  "fr",
  "jp",
  "kr",
  "cn",
  "ru",
  "it",
  "es",
  "nl",
  "be",
  "io",
  "co",
  "me",
  "xyz",
  "app",
  "dev",
  "com.tr",
  "net.tr",
  "org.tr",
  "edu.tr",
  "gov.tr",
  "mil.tr",
  "co.uk",
  "ac.uk",
  "gov.uk",
]);
function T(o) {
  const r = o.trim().toLowerCase();
  if (!r) return "";
  let n = r;
  if (n.includes("://"))
    try {
      n = new URL(n).hostname;
    } catch {
      return "";
    }
  else n = n.split("/")[0].split("?")[0].split("#")[0];
  return (
    (n = n.split(":")[0]),
    (n = n.replace(/^(\*\.|\.)+/, "")),
    !n.includes(".") || D.has(n) ? "" : n
  );
}
const h = {
  low: { label: i.protection.low, desc: i.protection.lowDesc },
  medium: { label: i.protection.medium, desc: i.protection.mediumDesc },
  high: { label: i.protection.high, desc: i.protection.highDesc },
};
function R() {
  const [o, r] = l.useState(p),
    [n, g] = l.useState(""),
    [m, x] = l.useState(!1),
    [y, f] = l.useState(!1),
    [s, j] = l.useState(null);
  l.useEffect(() => {
    (chrome.storage.sync.get(["settings"], (t) => {
      t.settings && r({ ...p, ...t.settings });
    }),
      chrome.runtime.sendMessage({ type: "GET_DASHBOARD_SCORE" }, (t) => {
        t != null && t.dashboard && j(t.dashboard);
      }));
  }, []);
  const a = l.useCallback((t) => {
      (r(t),
        chrome.storage.sync.set({ settings: t }, () => {
          (chrome.runtime.sendMessage({
            type: "SETTINGS_UPDATED",
            settings: t,
          }),
            x(!0),
            setTimeout(() => x(!1), 2e3));
        }));
    }, []),
    S = (t) => {
      a({ ...o, protectionLevel: t });
    },
    w = () => {
      a({ ...o, notificationsEnabled: !o.notificationsEnabled });
    },
    k = () => {
      const t = { ...o, networkMonitoringEnabled: !o.networkMonitoringEnabled };
      (t.networkMonitoringEnabled || (t.networkBlockingEnabled = !1), a(t));
    },
    u = () => {
      const t = T(n);
      !t ||
        o.whitelist.includes(t) ||
        (a({ ...o, whitelist: [...o.whitelist, t] }),
        chrome.runtime.sendMessage({ type: "ADD_TO_WHITELIST", domain: t }),
        g(""));
    },
    v = (t) => {
      (a({ ...o, whitelist: o.whitelist.filter((c) => c !== t) }),
        chrome.runtime.sendMessage({
          type: "REMOVE_FROM_WHITELIST",
          domain: t,
        }));
    },
    E = () => {
      chrome.storage.sync.clear(() => {
        (r(p), f(!0), setTimeout(() => f(!1), 2e3));
      });
    };
  return e.jsxs("div", {
    style: { maxWidth: 600, margin: "0 auto", padding: "24px 16px" },
    children: [
      e.jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 24,
        },
        children: [
          e.jsx("span", { style: { fontSize: 28 }, children: "🛡️" }),
          e.jsxs("div", {
            children: [
              e.jsx("h1", {
                style: { margin: 0, fontSize: 22, color: "#1e293b" },
                children: i.options.title,
              }),
              e.jsx("p", {
                style: { margin: 0, fontSize: 13, color: "#6b7280" },
                children: i.options.subtitle,
              }),
            ],
          }),
        ],
      }),
      s &&
        e.jsxs(d, {
          title: i.options.weeklySummary,
          children: [
            e.jsxs("div", {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 12,
              },
              children: [
                e.jsx("div", {
                  style: {
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    border:
                      "3px solid " +
                      (s.score >= 80
                        ? "#16a34a"
                        : s.score >= 50
                          ? "#d97706"
                          : "#dc2626"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    color:
                      s.score >= 80
                        ? "#16a34a"
                        : s.score >= 50
                          ? "#d97706"
                          : "#dc2626",
                  },
                  children: s.score,
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("div", {
                      style: { fontSize: 14, fontWeight: 600 },
                      children:
                        s.score >= 80
                          ? i.scoreMessages.great
                          : s.score >= 50
                            ? i.scoreMessages.good
                            : i.scoreMessages.warning,
                    }),
                    e.jsx("div", {
                      style: { fontSize: 12, color: "#6b7280", marginTop: 4 },
                      children: i.weeklyStats(s.currentWeek.urlsChecked),
                    }),
                  ],
                }),
              ],
            }),
            s.tips.length > 0 &&
              e.jsxs("div", {
                style: {
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: 8,
                  padding: "10px 14px",
                },
                children: [
                  e.jsx("div", {
                    style: {
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#92400e",
                      marginBottom: 6,
                    },
                    children: i.dashboard.suggestions,
                  }),
                  s.tips.map((t, c) =>
                    e.jsxs(
                      "div",
                      {
                        style: {
                          fontSize: 12,
                          color: "#78350f",
                          padding: "3px 0",
                        },
                        children: ["* ", t],
                      },
                      c,
                    ),
                  ),
                ],
              }),
          ],
        }),
      m &&
        e.jsx("div", {
          style: {
            padding: "8px 16px",
            background: "#dcfce7",
            color: "#166534",
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 13,
          },
          children: i.options.settingsSaved,
        }),
      // e.jsx(d, {
      //   title: i.options.protectionLevel,
      //   children: e.jsx("div", {
      //     style: { display: "flex", flexDirection: "column", gap: 8 },
      //     children: Object.keys(h).map((t) =>
      //       e.jsxs(
      //         "label",
      //         {
      //           onMouseEnter: (event) => {
      //             if (o.protectionLevel !== t) {
      //               event.currentTarget.style.background = "#f8fafc";
      //               event.currentTarget.style.borderColor = "#bfdbfe";
      //               event.currentTarget.style.transform = "translateY(-1px)";
      //               event.currentTarget.style.boxShadow =
      //                 "0 8px 20px rgba(15, 23, 42, 0.08)";
      //             }
      //           },
      //           onMouseLeave: (event) => {
      //             if (o.protectionLevel !== t) {
      //               event.currentTarget.style.background = "white";
      //               event.currentTarget.style.borderColor = "#e5e7eb";
      //               event.currentTarget.style.transform = "translateY(0)";
      //               event.currentTarget.style.boxShadow =
      //                 "0 2px 8px rgba(15, 23, 42, 0.04)";
      //             }
      //           },
      //           style: {
      //             display: "flex",
      //             alignItems: "flex-start",
      //             gap: 10,
      //             padding: "12px 14px",
      //             border: `2px solid ${o.protectionLevel === t ? "#3b82f6" : "#e5e7eb"}`,
      //             borderRadius: 12,
      //             cursor: "pointer",
      //             background: o.protectionLevel === t ? "#eff6ff" : "white",
      //             transition: "all 0.18s ease",
      //             boxShadow:
      //               o.protectionLevel === t
      //                 ? "0 6px 16px rgba(59, 130, 246, 0.12)"
      //                 : "0 2px 8px rgba(15, 23, 42, 0.04)",
      //           },
      //           children: [
      //             e.jsx("input", {
      //               type: "radio",
      //               name: "protection",
      //               checked: o.protectionLevel === t,
      //               onChange: () => S(t),
      //               style: { marginTop: 2 },
      //             }),
      //             e.jsxs("div", {
      //               children: [
      //                 e.jsx("div", {
      //                   style: { fontWeight: 600, fontSize: 14 },
      //                   children: h[t].label,
      //                 }),
      //                 e.jsx("div", {
      //                   style: { fontSize: 12, color: "#6b7280", marginTop: 2 },
      //                   children: h[t].desc,
      //                 }),
      //               ],
      //             }),
      //           ],
      //         },
      //         t,
      //       ),
      //     ),
      //   }),
      // }),
      e.jsx(d, {
        title: i.options.notifications,
        children: e.jsxs("label", {
          onMouseEnter: (event) => {
            event.currentTarget.style.background = "#f8fafc";
            event.currentTarget.style.transform = "translateY(-1px)";
            event.currentTarget.style.boxShadow =
              "0 8px 20px rgba(15, 23, 42, 0.08)";
          },

          onMouseLeave: (event) => {
            event.currentTarget.style.background = "white";
            event.currentTarget.style.transform = "translateY(0)";
            event.currentTarget.style.boxShadow =
              "0 2px 8px rgba(15, 23, 42, 0.04)";
          },
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            background: "white",
            borderRadius: 12,
            transition: "all 0.18s ease",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            border: "1px solid #e5e7eb",
            cursor: "pointer",
          },
          children: [
            e.jsxs("div", {
              children: [
                e.jsx("div", {
                  style: { fontWeight: 600, fontSize: 14 },
                  children: i.options.threatNotifications,
                }),
                e.jsx("div", {
                  style: { fontSize: 12, color: "#6b7280", marginTop: 2 },
                  children: i.options.threatNotificationsDesc,
                }),
              ],
            }),
            e.jsx("div", {
              onClick: w,
              style: {
                width: 44,
                height: 24,
                borderRadius: 12,
                background: o.notificationsEnabled ? "#22c55e" : "#d1d5db",
                position: "relative",
                transition: "background 0.2s",
                cursor: "pointer",
                flexShrink: 0,
              },
              children: e.jsx("div", {
                style: {
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  background: "white",
                  position: "absolute",
                  top: 2,
                  left: o.notificationsEnabled ? 22 : 2,
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                },
              }),
            }),
          ],
        }),
      }),
      // e.jsx(d, {
      //   title: i.options.networkMonitoring,
      //   children: e.jsxs("label", {
      //     onMouseEnter: (event) => {
      //       event.currentTarget.style.background = "#f8fafc";
      //       event.currentTarget.style.transform = "translateY(-1px)";
      //       event.currentTarget.style.boxShadow =
      //         "0 8px 20px rgba(15, 23, 42, 0.08)";
      //     },

      //     onMouseLeave: (event) => {
      //       event.currentTarget.style.background = "white";
      //       event.currentTarget.style.transform = "translateY(0)";
      //       event.currentTarget.style.boxShadow =
      //         "0 2px 8px rgba(15, 23, 42, 0.04)";
      //     },
      //     style: {
      //       display: "flex",
      //       alignItems: "center",
      //       justifyContent: "space-between",
      //       padding: "10px 12px",
      //       background: "white",
      //       borderRadius: 8,
      //       border: "1px solid #e5e7eb",
      //       cursor: "pointer",
      //       marginBottom: 8,
      //       borderRadius: 12,
      //       transition: "all 0.18s ease",
      //       boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
      //     },
      //     children: [
      //       e.jsxs("div", {
      //         children: [
      //           e.jsx("div", {
      //             style: { fontWeight: 600, fontSize: 14 },
      //             children: i.options.networkListenLabel,
      //           }),
      //           e.jsx("div", {
      //             style: { fontSize: 12, color: "#6b7280", marginTop: 2 },
      //             children: i.options.networkListenDesc,
      //           }),
      //         ],
      //       }),
      //       e.jsx("div", {
      //         onClick: k,
      //         style: {
      //           width: 44,
      //           height: 24,
      //           borderRadius: 12,
      //           background: o.networkMonitoringEnabled ? "#22c55e" : "#d1d5db",
      //           position: "relative",
      //           transition: "background 0.2s",
      //           cursor: "pointer",
      //           flexShrink: 0,
      //         },
      //         children: e.jsx("div", {
      //           style: {
      //             width: 20,
      //             height: 20,
      //             borderRadius: 10,
      //             background: "white",
      //             position: "absolute",
      //             top: 2,
      //             left: o.networkMonitoringEnabled ? 22 : 2,
      //             transition: "left 0.2s",
      //             boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      //           },
      //         }),
      //       }),
      //     ],
      //   }),
      // }),
      e.jsxs(d, {
        title: i.options.whitelist,
        children: [
          e.jsx("p", {
            style: { fontSize: 12, color: "#6b7280", margin: "0 0 10px" },
            children: i.options.whitelistDesc,
          }),
          e.jsxs("div", {
            style: { display: "flex", gap: 8, marginBottom: 12 },
            children: [
              e.jsx("input", {
                type: "text",
                value: n,
                onChange: (t) => g(t.target.value),
                onKeyDown: (t) => t.key === "Enter" && u(),
                placeholder: i.options.whitelistPlaceholder,
                style: {
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  outline: "none",
                },
              }),
              e.jsx("button", {
                onClick: u,
                style: {
                  padding: "8px 16px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "inherit",
                },
                children: i.add,
              }),
            ],
          }),
          o.whitelist.length === 0
            ? e.jsx("div", {
                style: { fontSize: 13, color: "#9ca3af", padding: "8px 0" },
                children: i.options.whitelistEmpty,
              })
            : e.jsx("div", {
                style: { display: "flex", flexDirection: "column", gap: 4 },
                children: o.whitelist.map((t) =>
                  e.jsxs(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 12px",
                        background: "white",
                        borderRadius: 6,
                        border: "1px solid #e5e7eb",
                      },
                      children: [
                        e.jsx("span", { style: { fontSize: 13 }, children: t }),
                        e.jsx("button", {
                          onClick: () => v(t),
                          style: {
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 16,
                            padding: "0 4px",
                            fontFamily: "inherit",
                          },
                          children: "✕",
                        }),
                      ],
                    },
                    t,
                  ),
                ),
              }),
        ],
      }),
      e.jsxs(d, {
        title: i.options.dataManagement,
        children: [
          e.jsx("button", {
            onClick: E,
            style: {
              padding: "10px 20px",
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "inherit",
              fontWeight: 600,
            },
            children: i.options.clearAll,
          }),
          y &&
            e.jsx("span", {
              style: { marginLeft: 12, fontSize: 13, color: "#166534" },
              children: i.options.cleared,
            }),
          e.jsx("p", {
            style: { fontSize: 12, color: "#9ca3af", margin: "8px 0 0" },
            children: i.options.clearDesc,
          }),
        ],
      }),
      e.jsx("div", {
        style: {
          marginTop: 32,
          textAlign: "center",
          fontSize: 12,
          color: "#9ca3af",
        },
        children: i.footer,
      }),
    ],
  });
}
function d({ title: o, children: r }) {
  return e.jsxs("div", {
    style: { marginBottom: 24 },
    children: [
      e.jsx("h2", {
        style: {
          fontSize: 16,
          fontWeight: 700,
          color: "#374151",
          margin: "0 0 12px",
        },
        children: o,
      }),
      r,
    ],
  });
}
const b = document.getElementById("root");
b && z(b).render(e.jsx(l.StrictMode, { children: e.jsx(R, {}) }));
