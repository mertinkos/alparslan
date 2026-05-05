(function () {
  "use strict";
  const l = {
    appName: "Alparslan",
    version: "v0.1.0",
    footer: "Alparslan v0.1.0",
    close: "Kapat",
    add: "Ekle",
    send: "Gönder",
    cancel: "İptal",
    save: "Kaydet",
    active: "Aktif",
    passive: "Pasif",
    loading: "Yükleniyor...",
    status: {
      safe: "Güvenli",
      dangerous: "Tehlikeli!",
      suspicious: "Şüpheli",
      unknown: "Bilinmiyor",
      disabled: "Koruma Kapalı",
      checking: "Kontrol ediliyor...",
    },
    reasons: {
      knownDangerous: "Bilinen tehlikeli site",
      usomListed: "USOM tehdit listesinde",
      invalidUrl: "Geçersiz URL",
      whitelisted: "Beyaz listede",
      homoglyph: "sahte Unicode karakterler kullanıyor (tehlikeli)",
      editDistance: "benzer domain (olası sahte site)",
      tldMismatch: "aynı isim farklı uzantı (olası sahte site)",
      containsTrusted: "güvenilir ismi içeriyor (olası sahte site)",
      subdomainImpersonation:
        "alt alan adında güvenilir isim (olası sahte site)",
      subdomainTyposquat: "alt alan adında benzer isim (olası sahte site)",
      similarDomain: "benzer domain",
      suspiciousKeyword: "Şüpheli anahtar kelime içeriyor",
      ipAccess: "IP adresi ile erişim",
      excessiveSubdomains: "Çok fazla alt alan adı",
      riskyTld: (e) => `Riskli uzantı (${e})`,
    },
    analysis: {
      creditCardRequested: "Kredi kartı bilgisi isteniyor",
      externalFormAction: (e, t = 1) =>
        t > 1
          ? `Form verisi farklı sunucuya gönderiliyor: ${e} (${t} form)`
          : `Form verisi farklı sunucuya gönderiliyor: ${e}`,
      tcKimlikSensitive:
        "TC Kimlik numarası ve hassas bilgi birlikte isteniyor",
      urgencyLanguage: "Aciliyet yaratan dil kullanılıyor",
    },
    dashboard: {
      weeklyScore: "Haftalık Güvenlik Skoru",
      suggestions: "Öneriler",
      control: "Kontrol",
      threat: "Tehdit",
      tracker: "Tracker",
      blockedThreat: "Engellenen Tehdit",
      blockedTracker: "Engellenen Tracker",
      https: "HTTPS",
      activity: "Aktivite",
    },
    tips: {
      insecureHttp:
        "Güvenli olmayan (HTTP) sitelere dikkat edin. HTTPS olan alternatifleri tercih edin.",
      dangerousSites: (e) =>
        `Bu hafta ${e} tehlikeli siteye girdiniz. Uyarılara dikkat edin.`,
      suspiciousSites: (e) =>
        `Bu hafta ${e} şüpheli site tespit edildi. Dikkatli olun.`,
      enableTracker: "Tracker engelleyiciyi aktif edin. Gizliliğinizi korur.",
      notActive:
        "Alparslan aktif değil veya bu hafta hiç gezinmediniz. Koruma için eklentiyi aktif tutun.",
    },
    tabs: { status: "Durum", score: "Skor", settings: "Ayarlar" },
    settings: {
      networkMonitoring: "Ağ İzleme",
      networkMonitoringDesc: "Network isteklerini dinle",
      domWarnings: "Sayfa Uyarıları",
      domWarningsDesc: "Tehlikeli sitelerde uyarı göster",
      blacklistCount: (e) => `Kara liste: ${e} domain`,
      whitelistCount: (e) => `Beyaz liste: ${e} domain`,
      allSettings: "Tüm Ayarlarr",
    },
    networkStats: {
      title: "Bu Sayfa - Ağ İzleme",
      request: "İstek",
      domain: "Domain",
      threat: "Tehdit",
      blocked: "Engellenen",
    },
    history: {
      hide: "Geçmişi gizle",
      show: "Tarama geçmişi",
      empty: "Henüz tarama yok",
      clear: "Geçmişi temizle",
    },
    report: {
      button: "Bu siteyi raporla",
      success: "Rapor gönderildi!",
      duplicate: "Bu site zaten raporlanmış.",
      dangerous: "Tehlikeli",
      safe: "Güvenli",
      placeholder: "Açıklama (opsiyonel)",
    },
    scoreMessages: {
      great: "Harika! Güvenli geziniyorsunuz.",
      good: "İyi, ama iyileştirme alanı var.",
      warning: "Dikkat! Güvenliğinizi artırın.",
    },
    banner: {
      dangerous: "TEHLİKELİ SİTE",
      suspicious: "ŞÜPHELİ SİTE",
      prefix: "Alparslan:",
    },
    breach: {
      detected: (e, t, i) =>
        `Bu site geçmişte veri sızıntısına uğramış: ${e} (${t}). Sızabilecek veriler: ${i}`,
      badgeDetected: (e, t, i) =>
        `Bu sitede veri sızıntısı tespit edildi: ${e} (${t}). Sızabilecek veriler: ${i}`,
    },
    options: {
      title: "Alparslan Ayarlar",
      subtitle: "Güvenlik ve gizlilik tercihlerinizi yönetin",
      weeklySummary: "Haftalık Güvenlik Özeti",
      settingsSaved: "Ayarlar kaydedildi",
      protectionLevel: "Koruma Seviyesi",
      notifications: "Bildirimler",
      threatNotifications: "Tehdit Bildirimleri",
      threatNotificationsDesc:
        "Tehlikeli site tespit edildiğinde bildirim göster",
      networkMonitoring: "Ağ İzleme",
      networkListenLabel: "Network İsteklerini Dinle",
      networkListenDesc: "Tüm ağ isteklerini izleyerek tehditleri tespit eder",
      whitelist: "Beyaz Liste",
      whitelistDesc: "Bu listedeki siteler için koruma devre dışı bırakılır",
      whitelistPlaceholder: "örnek: example.com",
      whitelistEmpty: "Beyaz liste boş",
      dataManagement: "Veri Yönetimi",
      clearAll: "Tüm Verileri Temizle",
      cleared: "Veriler temizlendi",
      clearDesc: "Tüm ayarlar ve beyaz liste sıfırlanır",
    },
    protection: {
      low: "Düşük",
      lowDesc: "Sadece bilinen tehlikeli siteleri engeller",
      medium: "Orta",
      mediumDesc: "Tehlikeli siteler + şüpheli URL tespiti",
      high: "Yüksek",
      highDesc: "Tüm kontroller aktif, agresif koruma",
    },
    init: {
      starting: "Başlatılıyor...",
      settings: "Ayarlar",
      blacklist: "Kara liste",
      usom: "USOM listesi",
      whitelist: "Beyaz liste",
      breachDb: "İhlal veritabanı",
      loadingSuffix: "yükleniyor...",
      ready: "Hazır",
    },
    weeklyStats: (e) => `Bu hafta ${e} sayfa kontrol edildi`,
  };
  function A(e, t) {
    var T;
    const i = [];
    let n = 0;
    const a = e.querySelectorAll("form");
    let s = !1,
      r = !1,
      d = !1,
      m = !1,
      c = null;
    e.querySelectorAll('input[type="password"]').length > 0 &&
      ((r = !0), (s = !0), (n += 10));
    const B = e.querySelectorAll("input");
    for (const u of B) {
      const h = (u.getAttribute("name") || "").toLowerCase(),
        p = (u.getAttribute("placeholder") || "").toLowerCase(),
        D = (u.getAttribute("autocomplete") || "").toLowerCase();
      if (
        h.match(/card|kredi|kart|cc[-_]?num/) ||
        p.match(/kart|card|kredi/) ||
        D.includes("cc-number")
      ) {
        ((d = !0), (n += 15), i.push(l.analysis.creditCardRequested));
        break;
      }
    }
    const v = new Map();
    for (const u of a) {
      const h = u.getAttribute("action") || "";
      if (h && h.startsWith("http"))
        try {
          const p = new URL(h);
          p.hostname !== t &&
            ((m = !0),
            (c = p.hostname),
            v.set(p.hostname, (v.get(p.hostname) ?? 0) + 1));
        } catch {
          n += 5;
        }
    }
    for (const [u, h] of v)
      ((n += 30), i.push(l.analysis.externalFormAction(u, h)));
    const z = ((T = e.body) == null ? void 0 : T.textContent) || "";
    z.match(/T\.?C\.?\s*[Kk]imlik|TCKN|TC\s*No/) &&
      (r || d) &&
      ((n += 20), i.push(l.analysis.tcKimlikSensitive));
    const L = [
      /hesabiniz\s*(askiya\s*alindi|bloke|kapatilacak)/i,
      /acil\s*(islem|guncelleme|dogrulama)/i,
      /son\s*(saat|dakika|gun).*icinde/i,
      /hemen\s*(tiklayin|giris\s*yapin)/i,
      /guvenlik\s*nedeniyle.*dogrulayin/i,
    ];
    for (const u of L)
      if (z.match(u)) {
        ((n += 15), i.push(l.analysis.urgencyLanguage));
        break;
      }
    return {
      hasLoginForm: s,
      hasPasswordField: r,
      hasCreditCardField: d,
      suspiciousFormAction: m,
      externalFormAction: c,
      score: n,
      reasons: i,
    };
  }
  const f = "alparslan-warning-host",
    b = "alparslan-breach-host";
  let y = !1,
    o = null;
  function w(e, t) {
    var c;
    if (y || document.getElementById(f)) return;
    const n = document.createElement("div");
    ((n.id = f),
      (n.style.cssText =
        "all: initial; position: fixed; top: 0; left: 0; width: 100%; z-index: 2147483647;"));
    const a = n.attachShadow({ mode: "closed" }),
      s = e === "DANGEROUS",
      r = s ? "#dc2626" : "#d97706",
      d = s ? "⚠️" : "⚠",
      m = s ? l.banner.dangerous : l.banner.suspicious;
    ((a.innerHTML = `
    <style>
      .banner {
        font-family: system-ui, -apple-system, sans-serif;
        background: ${r};
        color: white;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease-out;
      }
      .banner-content { display: contents; align-items: center; gap: 12px; flex: 1; }
      .banner-icon { font-size: 20px; }
      .banner-title { font-weight: 700; }
      .banner-reason { font-size: 12px; opacity: 0.9; margin-top: 2px; }
      .banner-close {
        background: rgba(255,255,255,0.2);
        border: none; color: white;
        padding: 6px 12px; border-radius: 4px;
        cursor: pointer; font-size: 13px; font-family: inherit;
      }
      .banner-close:hover { background: rgba(255,255,255,0.3); }
      @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
    </style>
    <div class="banner" role="alert">
      <div class="banner-content">
        <span class="banner-icon">${d}</span>
        <div>
          <div class="banner-title">${l.banner.prefix} ${m}</div>
          <div class="banner-reason">${E(t)}</div>
        </div>
      </div>
      <button class="banner-close" id="close-btn">${l.close}</button>
    </div>
  `),
      (c = a.getElementById("close-btn")) == null ||
        c.addEventListener("click", () => {
          ((y = !0), n.remove(), o && (o.disconnect(), (o = null)));
        }),
      document.documentElement.appendChild(n),
      o && o.disconnect(),
      (o = new MutationObserver(() => {
        !y &&
          !document.getElementById(f) &&
          document.documentElement.appendChild(n);
      })),
      o.observe(document.documentElement, { childList: !0, subtree: !0 }));
  }
  function E(e) {
    const t = document.createElement("div");
    return ((t.textContent = e), t.innerHTML);
  }
  function S(e) {
    const t = document.getElementById(b);
    t && t.remove();
    const i = document.createElement("div");
    ((i.id = b),
      (i.style.cssText =
        "all: initial; position: fixed; bottom: 0; left: 0; width: 100%; z-index: 2147483647;"));
    const n = i.attachShadow({ mode: "closed" }),
      a = document.createElement("style");
    ((a.textContent = [
      ".breach-banner { font-family: system-ui, -apple-system, sans-serif; background: #1e40af; color: white; padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; font-size: 13px; box-shadow: 0 -2px 8px rgba(0,0,0,0.2); animation: slideUp 0.3s ease-out; }",
      ".breach-content { display: flex; align-items: center; gap: 10px; flex: 1; }",
      ".breach-icon { font-size: 18px; }",
      ".breach-close { background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-family: inherit; }",
      ".breach-close:hover { background: rgba(255,255,255,0.3); }",
      "@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }",
    ].join(" ")),
      n.appendChild(a));
    const s = document.createElement("div");
    ((s.className = "breach-banner"), s.setAttribute("role", "status"));
    const r = document.createElement("div");
    r.className = "breach-content";
    const d = document.createElement("span");
    ((d.className = "breach-icon"), (d.textContent = "🔓"), r.appendChild(d));
    const m = document.createElement("div");
    ((m.textContent = e), r.appendChild(m), s.appendChild(r));
    const c = document.createElement("button");
    ((c.className = "breach-close"),
      (c.textContent = l.close),
      c.addEventListener("click", () => i.remove()),
      s.appendChild(c),
      n.appendChild(s),
      document.body && document.body.appendChild(i));
  }
  function k() {
    var e;
    try {
      if (!((e = chrome.runtime) != null && e.id)) return;
      const t = window.location.href,
        i = window.location.hostname;
      if (
        t.startsWith("chrome") ||
        t.startsWith("about:") ||
        t.startsWith("moz-extension")
      )
        return;
      chrome.runtime.sendMessage({ type: "CHECK_URL", url: t }, (a) => {
        a &&
          (a.level === "DANGEROUS" || a.level === "SUSPICIOUS") &&
          a.showDomWarnings !== !1 &&
          w(a.level, (a.reasons || []).join(", "));
      });
      const n = A(document, i);
      (n.score > 0 &&
        chrome.runtime
          .sendMessage({ type: "PAGE_ANALYSIS", domain: i, url: t, ...n })
          .catch(() => {}),
        chrome.runtime.sendMessage({ type: "CHECK_BREACH", domain: i }, (a) => {
          if (a != null && a.isBreached && a.breaches.length > 0) {
            const s = a.breaches[0],
              r = l.breach.detected(s.name, s.date, s.dataTypes.join(", "));
            S(r);
          }
        }));
    } catch {}
  }
  (chrome.runtime.onMessage.addListener(
    (e, t, i) => (
      e.type === "SHOW_WARNING" && (w(e.level, e.reason), i({ shown: !0 })),
      e.type === "RESCAN" && ((y = !1), k(), i({ ok: !0 })),
      !0
    ),
  ),
    document.readyState === "complete"
      ? setTimeout(k, 500)
      : window.addEventListener("load", () => setTimeout(k, 500)));
  let x = window.location.href;
  const C = 1e3;
  function g() {
    var e, t;
    window.location.href !== x &&
      ((x = window.location.href),
      (y = !1),
      (e = document.getElementById(f)) == null || e.remove(),
      (t = document.getElementById(b)) == null || t.remove(),
      o && (o.disconnect(), (o = null)),
      k());
  }
  (window.addEventListener("popstate", g),
    window.addEventListener("hashchange", g),
    setInterval(g, C));
})();
