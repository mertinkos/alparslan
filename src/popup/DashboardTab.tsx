import { useState, useEffect } from "react";
import type { DashboardData } from "@/dashboard/types";
import type { ScanHistoryEntry } from "@/utils/types";
import t from "@/i18n/tr";

const BREAKDOWN_LABELS: { key: keyof DashboardData["breakdown"]; label: string; max: number; color: string }[] = [
  { key: "httpsScore", label: "HTTPS", max: 30, color: "#22c55e" },
  { key: "threatAvoidanceScore", label: t.dashboard.threat, max: 30, color: "#3b82f6" },
  { key: "activityScore", label: "Aktivite", max: 20, color: "#8b5cf6" },
  { key: "trackerScore", label: t.dashboard.tracker, max: 20, color: "#f59e0b" },
];

function getScoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

function getScoreLevelColor(score: number): string {
  if (score >= 80) return "#166534";
  if (score >= 50) return "#92400e";
  return "#991b1b";
}

function getScoreLevelLabel(score: number): string {
  if (score >= 80) return t.dashboard.levelSafe;
  if (score >= 50) return t.dashboard.levelMedium;
  return t.dashboard.levelRisky;
}

export default function DashboardTab() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [showChecked, setShowChecked] = useState(false);
  const [showThreats, setShowThreats] = useState(false);
  const [historyList, setHistoryList] = useState<ScanHistoryEntry[]>([]);
  const [threatList, setThreatList] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "GET_DASHBOARD_SCORE" },
      (response: { dashboard: DashboardData } | null) => {
        if (response?.dashboard) {
          setDashboard(response.dashboard);
        }
      },
    );
  }, []);

  const handleToggleChecked = () => {
    if (!showChecked) {
      chrome.runtime.sendMessage({ type: "GET_HISTORY" }, (response: { history: ScanHistoryEntry[] } | null) => {
        if (response?.history) setHistoryList(response.history);
      });
    }
    setShowChecked(!showChecked);
  };

  const handleToggleThreats = () => {
    if (!showThreats) {
      chrome.runtime.sendMessage({ type: "GET_HISTORY" }, (response: { history: ScanHistoryEntry[] } | null) => {
        if (response?.history) setThreatList(response.history.filter((item) => item.level === "DANGEROUS"));
      });
    }
    setShowThreats(!showThreats);
  };

  if (!dashboard) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
        {t.loading}
      </div>
    );
  }

  const scoreColor = getScoreColor(dashboard.score);

  return (
    <div style={{ padding: 16 }}>
      {/* Score Card — large number + color-coded level label */}
      <div
        style={{
          background: "linear-gradient(135deg, #ecfdf5, #f8fafc)",
          border: "1px solid #bbf7d0",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
          {t.dashboard.weeklyScore}
        </div>
        <div data-testid="dashboard-score" style={{ fontSize: 40, fontWeight: 800, color: scoreColor }}>
          {dashboard.score}
        </div>
        <div style={{ fontSize: 12, color: getScoreLevelColor(dashboard.score), fontWeight: 600, marginTop: 4 }}>
          {getScoreLevelLabel(dashboard.score)}
        </div>
      </div>

      {/* Breakdown bars — thicker (6px), rounded, with label + value above */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {BREAKDOWN_LABELS.map(({ key, label, max, color }) => {
          const value = Number(dashboard.breakdown[key] || 0);
          const pct = Math.min(100, Math.round((value / max) * 100));
          return (
            <div key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b7280", marginBottom: 2 }}>
                <span>{label}</span>
                <span>{value}/{max}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "#e5e7eb", overflow: "hidden" }}>
                <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <MiniStat
          label={t.dashboard.control}
          value={dashboard.currentWeek.urlsChecked}
          title="Bu hafta kontrol edilen bağlantı sayısı"
          onClick={handleToggleChecked}
        />
        <MiniStat
          label="HTTPS"
          value={
            dashboard.currentWeek.httpsCount + dashboard.currentWeek.httpCount > 0
              ? Math.round((dashboard.currentWeek.httpsCount / (dashboard.currentWeek.httpsCount + dashboard.currentWeek.httpCount)) * 100) + "%"
              : "0%"
          }
          title="HTTPS kullanan bağlantıların oranı"
        />
        <MiniStat
          label={t.dashboard.blockedThreat}
          value={dashboard.currentWeek.threatsBlocked}
          title="Bu hafta engellenen zararlı tehdit sayısı"
          onClick={handleToggleThreats}
        />
        <MiniStat
          label={t.dashboard.blockedTracker}
          value={dashboard.currentWeek.trackersBlocked}
          title="Bu hafta engellenen tracker sayısı"
        />
      </div>

      {/* Expandable "Kontrol Edilenler" list — shows scan history on click */}
      {showChecked && (
        <div style={{ marginBottom: 16, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "8px 10px", fontSize: 12, fontWeight: 700, color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>
            Kontrol Edilenler
          </div>
          {historyList.length === 0 ? (
            <div style={{ padding: 10, fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
              Kayıt bulunamadı
            </div>
          ) : (
            <div style={{ maxHeight: 140, overflowY: "auto" }}>
              {historyList.slice(0, 8).map((item, index) => (
                <div
                  key={index}
                  style={{ padding: "6px 10px", fontSize: 11, color: "#475569", borderBottom: "1px solid #e5e7eb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {item.domain}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expandable "Engellenen Tehditler" list — DANGEROUS items only */}
      {showThreats && (
        <div style={{ marginBottom: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "8px 10px", fontSize: 12, fontWeight: 700, color: "#dc2626", borderBottom: "1px solid #fecaca" }}>
            Engellenen Tehditler
          </div>
          {threatList.length === 0 ? (
            <div style={{ padding: 10, fontSize: 12, color: "#16a34a", textAlign: "center" }}>
              Tehdit bulunamadı
            </div>
          ) : (
            <div style={{ maxHeight: 140, overflowY: "auto" }}>
              {threatList.slice(0, 8).map((item, index) => (
                <div
                  key={index}
                  style={{ padding: "6px 10px", fontSize: 11, color: "#7f1d1d", borderBottom: "1px solid #fecaca", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {item.domain}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      {dashboard.tips.length > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "8px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#92400e", marginBottom: 4 }}>{t.dashboard.suggestions}</div>
          {dashboard.tips.map((tip, i) => (
            <div key={i} style={{ fontSize: 11, color: "#78350f", padding: "2px 0" }}>
              * {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, title, onClick }: { label: string; value: number | string; title?: string; onClick?: () => void }) {
  return (
    <div
      title={title}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#e2e8f0";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#f1f5f9";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      style={{
        background: "#f1f5f9",
        borderRadius: 10,
        padding: 10,
        textAlign: "center",
        border: "1px solid #e2e8f0",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s ease",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{value}</div>
      <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
    </div>
  );
}
