import { type ReactNode } from "react";

/**
 * Genel amaçlı onaylama modali. Overlay + kart + başlık + gövde yapısını
 * paylaşır; her özel modal kendi butonlarını children olarak verir.
 *
 * Önce 3 yerde (DisableConfirm, CloseConfirm, TrustConfirm) inline
 * kopyalanmış 75 satırlık aynı overlay/kart kodu vardı; tek shell'e
 * indirgendi (her modal ~10 satıra düştü).
 *
 * Kullanım:
 *   <ConfirmModal title="..." body="...">
 *     <button onClick={...}>Onayla</button>
 *     <button onClick={...}>Vazgeç</button>
 *   </ConfirmModal>
 */
export function ConfirmModal({
  title,
  body,
  children,
}: {
  title: ReactNode;
  body: ReactNode;
  children: ReactNode;
}) {
  return (
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
          {title}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
          {body}
        </div>
        {children}
      </div>
    </div>
  );
}
