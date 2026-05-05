import {
  T as S,
  t as f,
  a as Ee,
  D as Vt,
  b as Kt,
  M as Dt,
} from "./chunks/tr.sOGZA2rk.js";
typeof globalThis.browser < "u" && (globalThis.chrome = globalThis.browser);
typeof chrome < "u" &&
  !chrome.action &&
  chrome.browserAction &&
  (chrome.action = chrome.browserAction);
const Tt = !1,
  H = "[Alparslan]",
  i = {
    debug: (...t) => {
      Tt && console.log(H, ...t);
    },
    info: (...t) => {
      Tt && console.info(H, ...t);
    },
    warn: (...t) => {
      console.warn(H, ...t);
    },
    error: (...t) => {
      console.error(H, ...t);
    },
  },
  Be = "AlparslanDB",
  Ie = 2;
let v = null;
function ve() {
  if (!v) return !1;
  try {
    return (v.objectStoreNames, !0);
  } catch {
    return ((v = null), !1);
  }
}
function y() {
  return ve()
    ? Promise.resolve(v)
    : new Promise((t, e) => {
        const o = indexedDB.open(Be, Ie);
        ((o.onupgradeneeded = () => {
          const r = o.result;
          if (
            (r.objectStoreNames.contains("whitelist") ||
              r.createObjectStore("whitelist", { keyPath: "domain" }),
            !r.objectStoreNames.contains("blacklist"))
          ) {
            const n = r.createObjectStore("blacklist", { keyPath: "domain" });
            (n.createIndex("category", "category", { unique: !1 }),
              n.createIndex("source", "source", { unique: !1 }));
          }
          (r.objectStoreNames.contains("metadata") ||
            r.createObjectStore("metadata", { keyPath: "key" }),
            r.objectStoreNames.contains("dynamic-whitelist") ||
              r.createObjectStore("dynamic-whitelist", { keyPath: "domain" }),
            r.objectStoreNames.contains("ugc-domains") ||
              r.createObjectStore("ugc-domains", { keyPath: "domain" }),
            r.objectStoreNames.contains("risky-tlds") ||
              r.createObjectStore("risky-tlds", { keyPath: "tld" }),
            r.objectStoreNames.contains("breaches") ||
              r
                .createObjectStore("breaches", { keyPath: "domain" })
                .createIndex("name", "name", { unique: !1 }));
        }),
          (o.onsuccess = () => {
            ((v = o.result),
              (v.onclose = () => {
                v = null;
              }),
              t(v));
          }),
          (o.onerror = () => {
            e(o.error);
          }));
      });
}
async function xe() {
  const t = await y();
  return new Promise((e, o) => {
    const s = t
      .transaction("whitelist", "readonly")
      .objectStore("whitelist")
      .getAll();
    ((s.onsuccess = () => e(s.result)), (s.onerror = () => o(s.error)));
  });
}
async function Yt(t, e = "user") {
  const o = await y();
  return new Promise((r, n) => {
    const s = o.transaction("whitelist", "readwrite"),
      a = s.objectStore("whitelist"),
      c = { domain: t.toLowerCase(), addedAt: Date.now(), addedBy: e };
    (a.put(c), (s.oncomplete = () => r()), (s.onerror = () => n(s.error)));
  });
}
async function Le(t) {
  const e = await y();
  return new Promise((o, r) => {
    const n = e.transaction("whitelist", "readwrite");
    (n.objectStore("whitelist").delete(t.toLowerCase()),
      (n.oncomplete = () => o()),
      (n.onerror = () => r(n.error)));
  });
}
async function ht() {
  const t = await y();
  return new Promise((e, o) => {
    const s = t
      .transaction("blacklist", "readonly")
      .objectStore("blacklist")
      .getAll();
    ((s.onsuccess = () => e(s.result)), (s.onerror = () => o(s.error)));
  });
}
async function Jt(t) {
  if (t.length === 0) return;
  const e = await y();
  return new Promise((o, r) => {
    const n = e.transaction("blacklist", "readwrite"),
      s = n.objectStore("blacklist");
    for (const a of t) s.put({ ...a, domain: a.domain.toLowerCase() });
    ((n.oncomplete = () => o()), (n.onerror = () => r(n.error)));
  });
}
async function Xt(t) {
  const e = await y();
  return new Promise((o, r) => {
    const a = e
      .transaction("metadata", "readonly")
      .objectStore("metadata")
      .get(t);
    ((a.onsuccess = () => {
      const c = a.result;
      o((c == null ? void 0 : c.value) ?? null);
    }),
      (a.onerror = () => r(a.error)));
  });
}
async function Zt(t, e) {
  const o = await y();
  return new Promise((r, n) => {
    const s = o.transaction("metadata", "readwrite");
    (s.objectStore("metadata").put({ key: t, value: e }),
      (s.oncomplete = () => r()),
      (s.onerror = () => n(s.error)));
  });
}
async function Me() {
  const t = await y();
  return new Promise((e, o) => {
    const n = t
      .transaction("dynamic-whitelist", "readonly")
      .objectStore("dynamic-whitelist")
      .getAllKeys();
    ((n.onsuccess = () => e(n.result)), (n.onerror = () => o(n.error)));
  });
}
async function Re(t) {
  const e = await y();
  return new Promise((o, r) => {
    const n = e.transaction("dynamic-whitelist", "readwrite"),
      s = n.objectStore("dynamic-whitelist");
    s.clear();
    for (const a of t) s.put({ domain: a.toLowerCase() });
    ((n.oncomplete = () => o()), (n.onerror = () => r(n.error)));
  });
}
async function Ue() {
  const t = await y();
  return new Promise((e, o) => {
    const n = t
      .transaction("ugc-domains", "readonly")
      .objectStore("ugc-domains")
      .getAllKeys();
    ((n.onsuccess = () => e(n.result)), (n.onerror = () => o(n.error)));
  });
}
async function Ce(t) {
  const e = await y();
  return new Promise((o, r) => {
    const n = e.transaction("ugc-domains", "readwrite"),
      s = n.objectStore("ugc-domains");
    s.clear();
    for (const a of t) s.put({ domain: a.toLowerCase() });
    ((n.oncomplete = () => o()), (n.onerror = () => r(n.error)));
  });
}
async function Ne() {
  const t = await y();
  return new Promise((e, o) => {
    const n = t
      .transaction("risky-tlds", "readonly")
      .objectStore("risky-tlds")
      .getAllKeys();
    ((n.onsuccess = () => e(n.result)), (n.onerror = () => o(n.error)));
  });
}
async function Oe(t) {
  const e = await y();
  return new Promise((o, r) => {
    const n = e.transaction("risky-tlds", "readwrite"),
      s = n.objectStore("risky-tlds");
    s.clear();
    for (const a of t) s.put({ tld: a.toLowerCase() });
    ((n.oncomplete = () => o()), (n.onerror = () => r(n.error)));
  });
}
async function _e() {
  const t = await y();
  return new Promise((e, o) => {
    const n = t
      .transaction("breaches", "readonly")
      .objectStore("breaches")
      .getAll();
    ((n.onsuccess = () => e(n.result)), (n.onerror = () => o(n.error)));
  });
}
async function Pe(t) {
  const e = await y();
  return new Promise((o, r) => {
    const n = e.transaction("breaches", "readwrite"),
      s = n.objectStore("breaches");
    s.clear();
    for (const a of t) s.put(a);
    ((n.oncomplete = () => o()), (n.onerror = () => r(n.error)));
  });
}
let I = new Set(),
  M = new Set(),
  rt = !1;
function Qt(t) {
  const e = t.toLowerCase();
  if (I.has(e)) return !0;
  const o = e.split(".");
  for (let r = 1; r < o.length - 1; r++) {
    const n = o.slice(r).join(".");
    if (n.split(".").length < 2) break;
    if (I.has(n)) return !0;
  }
  return !1;
}
function K(t) {
  const e = t.toLowerCase();
  if (M.has(e)) return !0;
  const o = e.split(".");
  for (let r = 1; r < o.length - 1; r++)
    if (M.has(o.slice(r).join("."))) return !0;
  return !1;
}
async function We(t) {
  const e = t.toLowerCase();
  (I.add(e), await Yt(e, "user"));
}
async function je(t) {
  const e = t.toLowerCase();
  (I.delete(e), await Le(e));
}
async function te(t) {
  for (const e of t) M.add(e.domain.toLowerCase());
  await Jt(t);
}
function At() {
  return [...I];
}
function Et() {
  return M.size;
}
async function $e() {
  var e, o;
  if ((await Xt("migrationV1Complete")) !== !0) {
    i.debug("Running IndexedDB migration...");
    try {
      const n = (
        await new Promise((s) => {
          chrome.storage.sync.get(["settings"], (a) => s(a));
        })
      ).settings;
      if ((e = n == null ? void 0 : n.whitelist) != null && e.length) {
        for (const s of n.whitelist) {
          const a = s.toLowerCase();
          I.has(a) || (I.add(a), await Yt(a, "import"));
        }
        i.debug(`Migrated ${n.whitelist.length} whitelist entries`);
      }
    } catch (r) {
      i.warn("Whitelist migration error:", r);
    }
    try {
      const n = await (
        await fetch(chrome.runtime.getURL("lists/tr-phishing.json"))
      ).json();
      if ((o = n.domains) != null && o.length) {
        const s = n.domains.map((a) => ({
          domain: a.domain.toLowerCase(),
          category: a.category || "other",
          addedAt: a.addedAt || new Date().toISOString().split("T")[0],
          source: a.source || "builtin",
        }));
        await Jt(s);
        for (const a of s) M.add(a.domain);
        i.debug(`Migrated ${s.length} blacklist entries`);
      }
    } catch (r) {
      i.warn("Blacklist migration error:", r);
    }
    (await Zt("migrationV1Complete", !0), i.debug("Migration complete"));
  }
}
async function qe() {
  if (!rt)
    try {
      const [t, e] = await Promise.all([xe(), ht()]);
      ((I = new Set(t.map((o) => o.domain))),
        (M = new Set(e.map((o) => o.domain))),
        await $e(),
        (rt = !0),
        i.debug(`List cache ready: ${I.size} whitelist, ${M.size} blacklist`));
    } catch (t) {
      (i.warn("List cache init failed, using empty sets:", t), (rt = !0));
    }
}
const Fe = "alparslan-blocklist",
  Ge = 1,
  k = "domains",
  Bt = 5e4;
function G() {
  return new Promise((t, e) => {
    const o = indexedDB.open(Fe, Ge);
    ((o.onupgradeneeded = () => {
      const r = o.result;
      r.objectStoreNames.contains(k) ||
        r
          .createObjectStore(k, { keyPath: "domain" })
          .createIndex("source", "source", { unique: !1 });
    }),
      (o.onsuccess = () => t(o.result)),
      (o.onerror = () => e(o.error)));
  });
}
async function He(t, e) {
  const o = await G(),
    r = Date.now();
  let n = 0;
  for (let s = 0; s < t.length; s += Bt) {
    const a = t.slice(s, s + Bt);
    await new Promise((c, h) => {
      const u = o.transaction(k, "readwrite"),
        d = u.objectStore(k);
      for (const m of a) {
        const w = { domain: m.toLowerCase(), source: e, addedAt: r };
        d.put(w);
      }
      ((u.oncomplete = () => {
        ((n += a.length), c());
      }),
        (u.onerror = () => h(u.error)));
    });
  }
  return (o.close(), n);
}
async function It(t) {
  const e = await G();
  return new Promise((o, r) => {
    const a = e.transaction(k, "readonly").objectStore(k).get(t.toLowerCase());
    ((a.onsuccess = () => {
      (e.close(), o(a.result !== void 0));
    }),
      (a.onerror = () => {
        (e.close(), r(a.error));
      }));
  });
}
async function ze() {
  const t = await G();
  return new Promise((e, o) => {
    const s = t.transaction(k, "readonly").objectStore(k).getAllKeys();
    ((s.onsuccess = () => {
      (t.close(), e(s.result));
    }),
      (s.onerror = () => {
        (t.close(), o(s.error));
      }));
  });
}
async function Ve() {
  const t = await G();
  return new Promise((e, o) => {
    const s = t.transaction(k, "readonly").objectStore(k).count();
    ((s.onsuccess = () => {
      (t.close(), e(s.result));
    }),
      (s.onerror = () => {
        (t.close(), o(s.error));
      }));
  });
}
async function Ke(t) {
  const e = await G();
  return new Promise((o, r) => {
    const n = e.transaction(k, "readwrite"),
      c = n.objectStore(k).index("source").openCursor(IDBKeyRange.only(t));
    let h = 0;
    ((c.onsuccess = () => {
      const u = c.result;
      u && (u.delete(), h++, u.continue());
    }),
      (n.oncomplete = () => {
        (e.close(), o(h));
      }),
      (n.onerror = () => {
        (e.close(), r(n.error));
      }));
  });
}
function ee(t, e) {
  let o = 2166136261 ^ e;
  for (let r = 0; r < t.length; r++)
    ((o ^= t.charCodeAt(r)), (o = Math.imul(o, 16777619)));
  return o >>> 0;
}
function Ye(t, e) {
  const o = Math.ceil((-t * Math.log(e)) / Math.log(2) ** 2),
    r = Math.max(1, Math.round((o / t) * Math.log(2)));
  return { numBits: o, numHashes: r };
}
async function oe(t, e = 0.001) {
  const { numBits: o, numHashes: r } = Ye(t.length || 1, e),
    n = new Uint32Array(Math.ceil(o / 32)),
    s = 2e3;
  for (let a = 0; a < t.length; a += s) {
    const c = Math.min(a + s, t.length);
    for (let h = a; h < c; h++) {
      const u = t[h].toLowerCase();
      for (let d = 0; d < r; d++) {
        const m = ee(u, d) % o;
        n[m >>> 5] |= 1 << (m & 31);
      }
    }
    c < t.length && (await new Promise((h) => setTimeout(h, 0)));
  }
  return { bits: n, numHashes: r, numBits: o };
}
function Je(t, e) {
  const o = e.toLowerCase();
  for (let r = 0; r < t.numHashes; r++) {
    const n = ee(o, r) % t.numBits;
    if (!(t.bits[n >>> 5] & (1 << (n & 31)))) return !1;
  }
  return !0;
}
function re(t) {
  const e = new Uint32Array([t.numBits, t.numHashes]),
    o = new ArrayBuffer(8 + t.bits.byteLength),
    r = new Uint8Array(o);
  return (
    r.set(new Uint8Array(e.buffer), 0),
    r.set(new Uint8Array(t.bits.buffer), 8),
    o
  );
}
function Xe(t) {
  const e = new Uint32Array(t, 0, 2),
    o = e[0],
    r = e[1];
  return { bits: new Uint32Array(t, 8), numHashes: r, numBits: o };
}
const Ze = 3e4;
async function N(t, e) {
  var n;
  const o = new AbortController(),
    r = setTimeout(() => o.abort(), e.timeoutMs ?? Ze);
  try {
    const s = await fetch(t, {
      headers: e.headers,
      cache: e.cache,
      signal: o.signal,
    });
    if (!s.ok) throw new Error(`HTTP ${s.status}`);
    const a = s.headers.get("content-length");
    if (a) {
      const g = parseInt(a, 10);
      if (Number.isFinite(g) && g > e.maxBytes)
        throw new Error(
          `response too large: content-length ${g} > ${e.maxBytes}`,
        );
    }
    const c = s.headers.get("content-type") ?? "",
      h = (n = s.body) == null ? void 0 : n.getReader();
    if (!h) {
      if (typeof s.arrayBuffer == "function") {
        const b = await s.arrayBuffer();
        if (b.byteLength > e.maxBytes)
          throw new Error(
            `response too large: ${b.byteLength} > ${e.maxBytes}`,
          );
        return {
          text: new TextDecoder("utf-8", { fatal: !1 }).decode(b),
          contentType: c,
          bytes: b.byteLength,
        };
      }
      const g = await s.text();
      if (g.length > e.maxBytes)
        throw new Error(`response too large: ${g.length} > ${e.maxBytes}`);
      return { text: g, contentType: c, bytes: g.length };
    }
    const u = [];
    let d = 0;
    for (;;) {
      const { done: g, value: b } = await h.read();
      if (g) break;
      if (((d += b.byteLength), d > e.maxBytes))
        throw (
          await h.cancel(),
          new Error(`response too large: streamed ${d} > ${e.maxBytes}`)
        );
      u.push(b);
    }
    const m = new Uint8Array(d);
    let w = 0;
    for (const g of u) (m.set(g, w), (w += g.byteLength));
    return {
      text: new TextDecoder("utf-8", { fatal: !1 }).decode(m),
      contentType: c,
      bytes: d,
    };
  } finally {
    clearTimeout(r);
  }
}
async function Qe(t) {
  const e = new TextEncoder().encode(t),
    o = await crypto.subtle.digest("SHA-256", e),
    r = new Uint8Array(o);
  let n = "";
  for (let s = 0; s < r.length; s++) n += r[s].toString(16).padStart(2, "0");
  return n;
}
const x = {
    versionJson: 64 * 1024,
    whitelistTxt: 2 * 1024 * 1024,
    ugcDomainsTxt: 2 * 1024 * 1024,
    riskyTldsTxt: 256 * 1024,
    usomBlocklistTxt: 25 * 1024 * 1024,
    remoteBlocklist: 25 * 1024 * 1024,
  },
  vt = "alparslan-usom-update",
  j = "usom-version",
  Y = "usom-bloom",
  xt = 360,
  ne = "https://raw.githubusercontent.com/AsabiAlgo/blocklists/main",
  to = `${ne}/usom-blocklist.txt`,
  eo = `${ne}/version.json`;
let A = null;
function Lt(t) {
  return A ? Je(A, t) : !1;
}
async function oo() {
  const t = await ze();
  if (t.length !== 0) {
    ((A = await oe(t)),
      i.debug(
        `USOM Bloom filter built: ${t.length} domains, ${(A.bits.byteLength / 1024).toFixed(0)}KB`,
      ));
    try {
      const e = re(A),
        o = le(e);
      await chrome.storage.local.set({ [Y]: o });
    } catch (e) {
      i.warn("Could not cache Bloom filter:", e);
    }
  }
}
async function ro() {
  try {
    const e = (await chrome.storage.local.get(Y))[Y];
    if (!e) return !1;
    const o = io(e);
    return (
      (A = Xe(o)),
      i.debug(`USOM Bloom filter loaded from cache: ${A.numBits} bits`),
      !0
    );
  } catch {
    return !1;
  }
}
function no(t) {
  return t
    .split(
      `
`,
    )
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && !e.startsWith("#"));
}
async function se() {
  try {
    const { text: t } = await N(eo, {
        maxBytes: x.versionJson,
        headers: { Accept: "application/json" },
        cache: "no-cache",
      }),
      e = JSON.parse(t),
      r = (await chrome.storage.local.get(j))[j];
    return !(r != null && r.hash) || r.hash !== e.hash
      ? { hasUpdate: !0, remote: e }
      : { hasUpdate: !1, remote: e };
  } catch {
    return { hasUpdate: !1, remote: null };
  }
}
async function ae() {
  const { text: t } = await N(to, { maxBytes: x.usomBlocklistTxt }),
    e = await Qe(t);
  return { domains: no(t), sha256: e };
}
async function ie(t, e) {
  if (e.sha256 && e.sha256 !== t)
    throw new Error(
      `USOM integrity failure: published sha256=${e.sha256} computed=${t}`,
    );
  const r = (await chrome.storage.local.get(j))[j];
  if (r != null && r.hash && r.hash === e.hash && r.sha256 && r.sha256 !== t)
    throw new Error(
      `USOM integrity drift: version tag ${e.hash} unchanged but content sha256 moved ${r.sha256} → ${t}`,
    );
}
async function ce(t, e, o) {
  ((A = await oe(t)),
    i.debug(
      `USOM Bloom filter built: ${t.length} domains, ${(A.bits.byteLength / 1024).toFixed(0)}KB`,
    ));
  try {
    const r = re(A),
      n = le(r);
    await chrome.storage.local.set({ [Y]: n });
  } catch (r) {
    i.warn("Could not cache Bloom filter:", r);
  }
  (await chrome.storage.local.set({
    [j]: {
      hash: e.hash ?? "",
      sha256: o,
      date: e.updatedAt ?? new Date().toISOString(),
      count: t.length,
    },
  }),
    Ke("usom")
      .then(() => He(t, "usom"))
      .then((r) => i.debug(`USOM list stored in IndexedDB: ${r} domains`))
      .catch((r) => i.warn("USOM IDB store error:", r)));
}
async function so() {
  if (await ro()) return;
  if ((await Ve()) > 0) {
    await oo();
    return;
  }
  try {
    i.debug("Fetching USOM list from GitHub...");
    const o = Date.now(),
      { domains: r, sha256: n } = await ae(),
      { remote: s } = await se();
    (await ie(n, s ?? {}),
      await ce(r, s ?? {}, n),
      i.debug(
        `USOM init complete: ${r.length} domains in ${Date.now() - o}ms`,
      ));
  } catch (o) {
    i.warn("USOM init error:", o);
  }
}
function ao() {
  chrome.alarms
    ? (chrome.alarms.create(vt, { delayInMinutes: 5, periodInMinutes: xt }),
      chrome.alarms.onAlarm.addListener((t) => {
        t.name === vt && nt();
      }))
    : (setTimeout(() => nt(), 5 * 6e4), setInterval(() => nt(), xt * 6e4));
}
async function nt() {
  try {
    const { hasUpdate: t, remote: e } = await se();
    if (!t) {
      i.debug("USOM list is up to date");
      return;
    }
    i.debug("USOM list update available, downloading...");
    const { domains: o, sha256: r } = await ae();
    o.length > 0 &&
      (await ie(r, e ?? {}),
      await ce(o, e ?? {}, r),
      i.debug(`USOM list refreshed: ${o.length} domains`));
  } catch (t) {
    i.warn("USOM refresh error:", t);
  }
}
function le(t) {
  const e = new Uint8Array(t);
  let o = "";
  for (let r = 0; r < e.length; r++) o += String.fromCharCode(e[r]);
  return btoa(o);
}
function io(t) {
  const e = atob(t),
    o = new Uint8Array(e.length);
  for (let r = 0; r < e.length; r++) o[r] = e.charCodeAt(r);
  return o.buffer;
}
const ot = "https://raw.githubusercontent.com/AsabiAlgo/blocklists/main",
  co = `${ot}/whitelist.txt`,
  lo = `${ot}/ugc-domains.txt`,
  uo = `${ot}/risky-tlds.txt`,
  ue = `${ot}/version.json`,
  Mt = "alparslan-whitelist-update",
  Rt = 360;
let L = new Set(),
  J = new Set(),
  X = [];
function ho(t) {
  return L.has(t.toLowerCase());
}
function fo(t) {
  const e = t.toLowerCase();
  for (const o of J) if (e === o || e.endsWith("." + o)) return !0;
  return !1;
}
function mo(t) {
  const e = t.toLowerCase();
  for (const o of X) if (e.endsWith(o)) return o;
  return null;
}
function wo() {
  return L.size;
}
const go = new Set([
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
  "pl",
  "nl",
  "be",
  "at",
  "ch",
  "se",
  "no",
  "fi",
  "dk",
  "br",
  "au",
  "ca",
  "us",
  "io",
  "co",
  "me",
  "tv",
  "xyz",
  "app",
  "dev",
  "com.tr",
  "net.tr",
  "org.tr",
  "edu.tr",
  "gov.tr",
  "mil.tr",
  "bel.tr",
  "pol.tr",
  "k12.tr",
  "tsk.tr",
  "av.tr",
  "dr.tr",
  "co.uk",
  "ac.uk",
  "gov.uk",
  "org.uk",
  "me.uk",
  "com.au",
  "net.au",
  "org.au",
  "edu.au",
  "gov.au",
  "co.jp",
  "ne.jp",
  "or.jp",
  "ac.jp",
  "co.kr",
  "or.kr",
  "co.in",
  "net.in",
  "co.za",
  "com.br",
  "net.br",
  "org.br",
  "gov.br",
]);
function po(t) {
  return go.has(t);
}
function yo(t) {
  return t
    .split(
      `
`,
    )
    .map((e) => e.trim().toLowerCase())
    .filter((e) =>
      !e || e.startsWith("#") || !e.includes(".")
        ? !1
        : po(e)
          ? (i.warn("Rejected public-suffix whitelist entry:", e), !1)
          : !0,
    );
}
async function bo() {
  try {
    const [t, e, o] = await Promise.all([Me(), Ue(), Ne()]);
    return t.length === 0
      ? !1
      : ((L = new Set(t)),
        (J = new Set(e)),
        (X = o),
        i.debug(`Whitelist loaded from IndexedDB: ${L.size} domains`),
        !0);
  } catch {
    return !1;
  }
}
async function st(t, e) {
  const { text: o } = await N(t, { maxBytes: e, cache: "no-cache" });
  return yo(o);
}
async function So() {
  var t;
  try {
    const { text: e } = await N(ue, {
        maxBytes: x.versionJson,
        headers: { Accept: "application/json" },
        cache: "no-cache",
      }),
      r = (t = JSON.parse(e).whitelist) == null ? void 0 : t.hash;
    if (!r) return !1;
    const n = await Xt("whitelist-version");
    return (n == null ? void 0 : n.hash) !== r;
  } catch {
    return !1;
  }
}
async function de() {
  var s;
  i.debug("Fetching whitelist from GitHub...");
  const t = Date.now(),
    [e, o, r] = await Promise.all([
      st(co, x.whitelistTxt),
      st(lo, x.ugcDomainsTxt).catch(() => []),
      st(uo, x.riskyTldsTxt).catch(() => []),
    ]),
    n = L.size;
  if (n >= 100 && e.length < n * 0.5) {
    i.warn(
      `Whitelist refresh rejected: new size ${e.length} < 50% of previous ${n}`,
    );
    return;
  }
  (await Promise.all([Re(e), Ce(o), Oe(r)]),
    (L = new Set(e)),
    (J = new Set(o)),
    (X = r));
  try {
    const { text: a } = await N(ue, {
        maxBytes: x.versionJson,
        headers: { Accept: "application/json" },
        cache: "no-cache",
      }),
      c = JSON.parse(a);
    await Zt("whitelist-version", {
      hash: ((s = c.whitelist) == null ? void 0 : s.hash) ?? "",
      updatedAt: new Date().toISOString(),
    });
  } catch {}
  i.debug(
    `Whitelist stored in IndexedDB: ${L.size} domains, ${J.size} UGC domains, ${X.length} risky TLDs (${Date.now() - t}ms)`,
  );
}
async function ko() {
  if (!(await bo()))
    try {
      await de();
    } catch (e) {
      i.warn("Whitelist init error:", e);
    }
}
async function at() {
  try {
    if (!(await So())) {
      i.debug("Whitelist is up to date");
      return;
    }
    await de();
  } catch (t) {
    i.warn("Whitelist refresh error:", t);
  }
}
function Do() {
  chrome.alarms
    ? (chrome.alarms.create(Mt, { delayInMinutes: 5, periodInMinutes: Rt }),
      chrome.alarms.onAlarm.addListener((t) => {
        t.name === Mt && at();
      }))
    : (setTimeout(() => at(), 5 * 6e4), setInterval(() => at(), Rt * 6e4));
}
const E = 36,
  z = 1,
  lt = 26,
  To = 38,
  Ao = 700,
  Eo = 72,
  Bo = 128;
function Io(t) {
  return t >= 48 && t <= 57
    ? t - 22
    : t >= 65 && t <= 90
      ? t - 65
      : t >= 97 && t <= 122
        ? t - 97
        : E;
}
function vo(t, e, o) {
  let r = Math.floor(o ? t / Ao : t / 2);
  r += Math.floor(r / e);
  let n = 0;
  for (; r > ((E - z) * lt) / 2; ) ((r = Math.floor(r / (E - z))), (n += E));
  return n + Math.floor(((E - z + 1) * r) / (r + To));
}
function xo(t) {
  const e = [];
  let o = Bo,
    r = Eo,
    n = 0;
  const s = t.lastIndexOf("-"),
    a = s < 0 ? 0 : s;
  for (let h = 0; h < a; h++) e.push(t.charCodeAt(h));
  let c = a > 0 ? a + 1 : 0;
  for (; c < t.length; ) {
    const h = n;
    let u = 1;
    for (let m = E; !(c >= t.length); m += E) {
      const w = Io(t.charCodeAt(c++));
      if (w >= E) break;
      n += w * u;
      const g = m <= r ? z : m >= r + lt ? lt : m - r;
      if (w < g) break;
      u *= E - g;
    }
    const d = e.length + 1;
    ((r = vo(n - h, d, h === 0)),
      (o += Math.floor(n / d)),
      (n %= d),
      e.splice(n, 0, o),
      n++);
  }
  return String.fromCodePoint(...e);
}
function Lo(t) {
  return t
    .split(".")
    .map((e) => (e.startsWith("xn--") ? xo(e.slice(4)) : e))
    .join(".");
}
const Mo = new Set([
    "microsoftonline.com",
    "office.com",
    "office365.com",
    "sharepoint.com",
    "msauth.net",
    "msftauth.net",
    "microsoft365.com",
    "googleapis.com",
    "gstatic.com",
    "google-analytics.com",
    "googletagmanager.com",
    "googleadservices.com",
    "icloud-content.com",
    "amazon-adsystem.com",
    "facebook.net",
    "fbcdn.net",
    "instagram.net",
    "whatsapp.net",
    "cloudflareinsights.com",
    "cloudflarestream.com",
  ]),
  _ = new Set([
    "turkiye.gov.tr",
    "e-devlet.gov.tr",
    "ptt.gov.tr",
    "gib.gov.tr",
    "sgk.gov.tr",
    "ziraatbank.com.tr",
    "isbank.com.tr",
    "garanti.com.tr",
    "akbank.com.tr",
    "akbank.com",
    "yapikredi.com.tr",
    "halkbank.com.tr",
    "vakifbank.com.tr",
    "denizbank.com",
    "trendyol.com",
    "hepsiburada.com",
    "n11.com",
    "sahibinden.com",
    "yurticikargo.com",
    "araskargo.com.tr",
    "mngkargo.com.tr",
    "sendeo.com.tr",
    "dhl.com.tr",
    "a101.com.tr",
    "bim.com.tr",
    "sok.com.tr",
    "migros.com.tr",
    "ntv.com.tr",
    "haberturk.com",
    "cnnturk.com",
    "google.com",
    "google.com.tr",
    "youtube.com",
    "bing.com",
    "yahoo.com",
    "wikipedia.org",
    "github.com",
    "stackoverflow.com",
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "reddit.com",
    "whatsapp.com",
    "telegram.org",
    "discord.com",
    "gmail.com",
    "microsoft.com",
    "live.com",
    "outlook.com",
    "apple.com",
    "icloud.com",
    "amazon.com",
    "amazon.com.tr",
    "netflix.com",
    "spotify.com",
    "shopify.com",
    "paypal.com",
    "cloudflare.com",
  ]);
function U(t) {
  try {
    return new URL(t).hostname.toLowerCase();
  } catch {
    return null;
  }
}
function $(t) {
  const e = t.split(".");
  if (e.length <= 2) return t;
  const o = e[e.length - 2];
  return ["com", "gov", "org", "edu", "net", "mil"].includes(o) && e.length >= 3
    ? e.slice(-3).join(".")
    : e.slice(-2).join(".");
}
function Ut(t, e) {
  const o = t.length,
    r = e.length,
    n = Array.from({ length: o + 1 }, () => Array(r + 1).fill(0));
  for (let s = 0; s <= o; s++) n[s][0] = s;
  for (let s = 0; s <= r; s++) n[0][s] = s;
  for (let s = 1; s <= o; s++)
    for (let a = 1; a <= r; a++) {
      const c = t[s - 1] === e[a - 1] ? 0 : 1;
      ((n[s][a] = Math.min(
        n[s - 1][a] + 1,
        n[s][a - 1] + 1,
        n[s - 1][a - 1] + c,
      )),
        s > 1 &&
          a > 1 &&
          t[s - 1] === e[a - 2] &&
          t[s - 2] === e[a - 1] &&
          (n[s][a] = Math.min(n[s][a], n[s - 2][a - 2] + c)));
    }
  return n[o][r];
}
const Ro = {
  а: "a",
  е: "e",
  о: "o",
  р: "p",
  с: "c",
  у: "y",
  х: "x",
  і: "i",
  ѕ: "s",
  ј: "j",
  һ: "h",
  ґ: "r",
  к: "k",
  м: "m",
  н: "h",
  т: "t",
  в: "b",
  д: "d",
  ш: "w",
  ь: "b",
  ɡ: "g",
  ԁ: "d",
  ƅ: "b",
  ǃ: "l",
  α: "a",
  ο: "o",
  ε: "e",
  ι: "i",
  κ: "k",
  ν: "v",
  ρ: "p",
  τ: "t",
  υ: "u",
  ω: "w",
  ı: "i",
};
function Ct(t) {
  let e = "";
  for (const o of t) e += Ro[o] ?? o;
  return e;
}
function Nt(t) {
  return t.replace(/[-_.]/g, "");
}
function Ot(t) {
  return t.split(".")[0];
}
function Uo(t) {
  const e = Lo(t),
    o = $(e);
  if (_.has(o)) return { isSuspicious: !1, similarTo: null, reason: null };
  if (Mo.has(o)) return { isSuspicious: !1, similarTo: null, reason: null };
  const r = Ot(o),
    n = Ct(r),
    s = Nt(n),
    a = r !== n || t !== e,
    c = e.split("."),
    h = c.length > 2 ? c.slice(0, -2) : [];
  for (const u of _) {
    const d = $(u),
      m = Ot(d),
      w = Nt(m);
    if (o === d || w.length <= 2) continue;
    if (n === m || s === w)
      return {
        isSuspicious: !0,
        similarTo: u,
        reason: a ? "homoglyph" : "tld-mismatch",
      };
    const g = Ut(s, w),
      b = Math.abs(s.length - w.length);
    if (!(w.length <= 4 || s.length <= 4) && (g === 1 || (g === 2 && b >= 1)))
      return {
        isSuspicious: !0,
        similarTo: u,
        reason: a ? "homoglyph" : "edit-distance",
      };
    if (w.length >= 5 && s.length > w.length && s.includes(w))
      return {
        isSuspicious: !0,
        similarTo: u,
        reason: "contains-trusted-name",
      };
    for (const Ae of h) {
      const St = Ct(Ae);
      if (St === m)
        return {
          isSuspicious: !0,
          similarTo: u,
          reason: "subdomain-impersonation",
        };
      const kt = Ut(St, m);
      if (m.length >= 4 && kt > 0 && kt <= 2)
        return {
          isSuspicious: !0,
          similarTo: u,
          reason: "subdomain-typosquat",
        };
    }
  }
  return { isSuspicious: !1, similarTo: null, reason: null };
}
function ft(t, e = "medium") {
  const o = U(t),
    r = Date.now();
  if (!o)
    return {
      level: S.UNKNOWN,
      score: 0,
      reasons: [f.reasons.invalidUrl],
      url: t,
      checkedAt: r,
    };
  const n = $(o),
    s = [];
  let a = 0;
  if (K(o) || K(n))
    return (
      (a = 100),
      s.push(f.reasons.knownDangerous),
      { level: S.DANGEROUS, score: a, reasons: s, url: t, checkedAt: r }
    );
  if (Lt(o) || Lt(n))
    return (
      (a = 100),
      s.push(f.reasons.usomListed),
      { level: S.DANGEROUS, score: a, reasons: s, url: t, checkedAt: r }
    );
  if (ho(n) && !fo(o))
    return { level: S.SAFE, score: 0, reasons: [], url: t, checkedAt: r };
  if (e === "low")
    return _.has(n)
      ? { level: S.SAFE, score: 0, reasons: [], url: t, checkedAt: r }
      : { level: S.UNKNOWN, score: 0, reasons: [], url: t, checkedAt: r };
  const c = Uo(o);
  if (c.isSuspicious) {
    const b = {
      homoglyph: { score: 100, text: f.reasons.homoglyph },
      "edit-distance": { score: 70, text: f.reasons.editDistance },
      "tld-mismatch": { score: 60, text: f.reasons.tldMismatch },
      "contains-trusted-name": { score: 50, text: f.reasons.containsTrusted },
      "subdomain-impersonation": {
        score: 65,
        text: f.reasons.subdomainImpersonation,
      },
      "subdomain-typosquat": { score: 55, text: f.reasons.subdomainTyposquat },
    }[c.reason ?? ""] ?? { score: 70, text: f.reasons.similarDomain };
    ((a += b.score), s.push(`${c.similarTo} ile ${b.text}`));
  }
  ((o.includes("login") || o.includes("secure") || o.includes("verify")) &&
    (_.has(n) || ((a += 20), s.push(f.reasons.suspiciousKeyword))),
    o.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/) &&
      ((a += 30), s.push(f.reasons.ipAccess)),
    o.split(".").length > 4 &&
      ((a += 15), s.push(f.reasons.excessiveSubdomains)));
  const u = mo(o);
  u && ((a += 15), s.push(f.reasons.riskyTld(u)));
  const d = e === "high" ? 50 : 70,
    m = e === "high" ? 15 : 30;
  let w;
  return (
    a >= d
      ? (w = S.DANGEROUS)
      : a >= m
        ? (w = S.SUSPICIOUS)
        : _.has(n)
          ? (w = S.SAFE)
          : (w = S.UNKNOWN),
    { level: w, score: a, reasons: s, url: t, checkedAt: r }
  );
}
async function he(t, e = "medium") {
  const o = ft(t, e);
  if (o.level === S.DANGEROUS && o.reasons.includes(f.reasons.usomListed)) {
    const r = U(t);
    if (r) {
      const n = $(r);
      if (!((await It(r)) || (await It(n)))) {
        const a = o.reasons.filter((c) => c !== f.reasons.usomListed);
        return {
          ...o,
          level: a.length > 0 ? o.level : S.UNKNOWN,
          score: a.length > 0 ? o.score : 0,
          reasons: a,
        };
      }
    }
  }
  return o;
}
const _t = "alparslan-list-update";
let Z = { ...Ee };
function Co(t, e) {
  const o = [];
  if (e.includes("json"))
    try {
      const r = JSON.parse(t);
      if (Array.isArray(r.domains))
        for (const n of r.domains)
          typeof n == "string"
            ? o.push(n.trim())
            : n != null && n.domain && o.push(n.domain.trim());
      return o.filter((n) => n.length > 0);
    } catch {}
  for (const r of t.split(`
`)) {
    const n = r.trim();
    n && !n.startsWith("#") && o.push(n);
  }
  return o;
}
async function V() {
  const t = Date.now();
  try {
    i.debug(`Fetching blocklist from: ${Z.listUrl}`);
    const {
        text: e,
        contentType: o,
        bytes: r,
      } = await N(Z.listUrl, { maxBytes: x.remoteBlocklist }),
      n = Date.now() - t;
    i.debug(
      `Blocklist downloaded: ${(r / 1024).toFixed(1)}KB in ${n}ms (content-type: ${o})`,
    );
    const s = Co(e, o),
      a = Date.now() - t - n;
    if (s.length > 0) {
      const c = new Date().toISOString().split("T")[0],
        h = s.map((d) => ({
          domain: d,
          category: "other",
          addedAt: c,
          source: "remote",
        }));
      await te(h);
      const u = Date.now() - t;
      i.debug(
        `Remote list updated: ${s.length} domains (download: ${n}ms, parse: ${a}ms, save: ${u - n - a}ms, total: ${u}ms)`,
      );
    } else
      i.warn(
        `Remote list empty or could not parse (${e.length} bytes, content-type: ${o})`,
      );
    return s.length;
  } catch (e) {
    const o = Date.now() - t;
    return (i.warn(`List update error after ${o}ms:`, e), -1);
  }
}
function No() {
  chrome.alarms
    ? (chrome.alarms.create(_t, {
        delayInMinutes: 1,
        periodInMinutes: Z.updateIntervalMinutes,
      }),
      chrome.alarms.onAlarm.addListener((t) => {
        t.name === _t && V();
      }))
    : (setTimeout(() => V(), 6e4),
      setInterval(() => V(), Z.updateIntervalMinutes * 6e4));
}
let C = new Map();
function Oo(t) {
  return {
    domain: t.domain.toLowerCase(),
    name: t.name,
    date: t.date,
    dataTypes: t.dataTypes,
  };
}
function _o(t) {
  return {
    domain: t.domain,
    name: t.name,
    date: t.date,
    dataTypes: t.dataTypes,
    accountsAffected: 0,
  };
}
async function Po(t) {
  const e = t.map(Oo);
  (await Pe(e),
    (C = new Map(
      t.map((o) => [
        o.domain.toLowerCase(),
        { ...o, domain: o.domain.toLowerCase() },
      ]),
    )),
    i.debug(`Breach DB stored in IndexedDB: ${C.size} entries`));
}
async function Wo() {
  try {
    const t = await _e();
    t.length > 0 &&
      ((C = new Map(t.map((e) => [e.domain, _o(e)]))),
      i.debug(`Breach DB loaded from IndexedDB: ${C.size} entries`));
  } catch (t) {
    i.warn("Breach cache init error:", t);
  }
}
function jo(t) {
  const e = t.toLowerCase().split(".");
  if (e.length <= 2) return t.toLowerCase();
  const o = e[e.length - 2];
  return ["com", "gov", "org", "edu", "net"].includes(o) && e.length >= 3
    ? e.slice(-3).join(".")
    : e.slice(-2).join(".");
}
function $o(t) {
  const e = t.toLowerCase(),
    o = jo(e),
    r = [],
    n = C.get(e),
    s = C.get(o);
  return (
    n && r.push(n),
    s && s !== n && r.push(s),
    { isBreached: r.length > 0, breaches: r }
  );
}
const fe = {
  urlsChecked: 0,
  threatsBlocked: 0,
  trackersBlocked: 0,
  httpsCount: 0,
  httpCount: 0,
  dangerousSitesVisited: 0,
  suspiciousSitesVisited: 0,
  weekStart: 0,
};
function me(t) {
  const e = new Date(t),
    o = e.getUTCDay(),
    r = o === 0 ? 6 : o - 1,
    n = new Date(e);
  return (
    n.setUTCDate(e.getUTCDate() - r),
    n.setUTCHours(0, 0, 0, 0),
    n.getTime()
  );
}
function we() {
  return new Promise((t) => {
    chrome.storage.sync.get(["weeklyMetrics", "previousWeekMetrics"], (e) => {
      const o = me(Date.now()),
        r = e.weeklyMetrics,
        n = e.previousWeekMetrics || null;
      if (r && r.weekStart === o) t({ current: r, previous: n });
      else {
        const s = { ...fe, weekStart: o },
          a = r && r.weekStart > 0 ? r : n;
        (chrome.storage.sync.set({ weeklyMetrics: s, previousWeekMetrics: a }),
          t({ current: s, previous: a }));
      }
    });
  });
}
async function qo() {
  const { current: t } = await we();
  return t;
}
async function Fo() {
  const { previous: t } = await we();
  return t;
}
function mt(t) {
  return new Promise((e) => {
    const o = me(Date.now());
    chrome.storage.sync.get(["weeklyMetrics", "previousWeekMetrics"], (r) => {
      let n = r.weeklyMetrics;
      if (!n || n.weekStart !== o) {
        const s = n && n.weekStart > 0 ? n : r.previousWeekMetrics;
        n = { ...fe, weekStart: o };
        const a = t(n);
        chrome.storage.sync.set(
          { weeklyMetrics: a, previousWeekMetrics: s },
          e,
        );
      } else {
        const s = t(n);
        chrome.storage.sync.set({ weeklyMetrics: s }, e);
      }
    });
  });
}
async function ge(t) {
  const e = t.startsWith("https://"),
    o = t.startsWith("http://");
  (!e && !o) ||
    (await mt((r) => ({
      ...r,
      urlsChecked: r.urlsChecked + 1,
      httpsCount: r.httpsCount + (e ? 1 : 0),
      httpCount: r.httpCount + (o ? 1 : 0),
    })));
}
async function Go(t) {
  (t !== "DANGEROUS" && t !== "SUSPICIOUS") ||
    (await mt((e) => ({
      ...e,
      threatsBlocked: e.threatsBlocked + 1,
      dangerousSitesVisited:
        e.dangerousSitesVisited + (t === "DANGEROUS" ? 1 : 0),
      suspiciousSitesVisited:
        e.suspiciousSitesVisited + (t === "SUSPICIOUS" ? 1 : 0),
    })));
}
async function Ho() {
  await mt((t) => ({ ...t, trackersBlocked: t.trackersBlocked + 1 }));
}
const zo = 20;
function Vo(t) {
  const e = [],
    o = t.httpsCount + t.httpCount;
  let r = 0;
  (o > 0 && (r = Math.round((t.httpsCount / o) * 30)),
    o > 0 && r < 30 && e.push(f.tips.insecureHttp));
  let n = 30;
  if (t.urlsChecked > 0) {
    const d = t.dangerousSitesVisited * 10,
      m = t.suspiciousSitesVisited * 5;
    n = Math.max(0, 30 - d - m);
  } else n = 0;
  (t.dangerousSitesVisited > 0 &&
    e.push(f.tips.dangerousSites(t.dangerousSitesVisited)),
    t.suspiciousSitesVisited > 0 &&
      t.dangerousSitesVisited === 0 &&
      e.push(f.tips.suspiciousSites(t.suspiciousSitesVisited)));
  const s = Math.min(t.urlsChecked / zo, 1),
    a = Math.round(s * 20);
  let c = 0;
  return (
    t.urlsChecked > 0 && t.trackersBlocked > 0 && (c = 20),
    t.urlsChecked > 0 &&
      t.trackersBlocked === 0 &&
      e.push(f.tips.enableTracker),
    t.urlsChecked === 0 && e.push(f.tips.notActive),
    {
      score: Math.min(100, Math.max(0, r + n + a + c)),
      breakdown: {
        httpsScore: r,
        threatAvoidanceScore: n,
        activityScore: a,
        trackerScore: c,
      },
      currentWeek: t,
      previousWeek: null,
      tips: e,
    }
  );
}
const q = new Map();
let wt = 5 * 60 * 1e3,
  P = null;
function pe(t) {
  wt = t * 60 * 1e3;
}
function Ko(t) {
  const e = q.get(t.toLowerCase());
  return e
    ? Date.now() - e.cachedAt >= wt
      ? (q.delete(t.toLowerCase()), null)
      : e.result
    : null;
}
function Yo(t, e) {
  q.set(t.toLowerCase(), { result: e, cachedAt: Date.now() });
}
function Jo() {
  const t = Date.now();
  for (const [e, o] of q) t - o.cachedAt >= wt && q.delete(e);
}
function Xo() {
  P || (P = setInterval(Jo, 6e4));
}
function Zo() {
  P && (clearInterval(P), (P = null));
}
const gt = 1e3,
  W = new Map();
var Ft, Gt;
const pt =
  typeof globalThis.browser < "u" &&
  typeof ((Gt = (Ft = globalThis.browser) == null ? void 0 : Ft.runtime) == null
    ? void 0
    : Gt.getBrowserInfo) == "function";
function ye(t) {
  let e = 0;
  for (let o = 0; o < t.length; o++) e = ((e << 5) - e + t.charCodeAt(o)) | 0;
  return gt + Math.abs(e % 29e3);
}
async function Qo(t) {
  if (pt || W.has(t)) return;
  const e = ye(t);
  W.set(t, e);
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: e,
          priority: 2,
          action: { type: "block" },
          condition: {
            urlFilter: `||${t}`,
            resourceTypes: [
              "main_frame",
              "sub_frame",
              "script",
              "xmlhttprequest",
              "image",
            ],
          },
        },
      ],
      removeRuleIds: [e],
    });
  } catch (o) {
    (W.delete(t), i.warn("DNR rule add failed:", t, o));
  }
}
async function be(t) {
  if (!pt)
    try {
      const o = (await chrome.declarativeNetRequest.getDynamicRules())
          .filter((n) => n.id >= gt)
          .map((n) => n.id),
        r = t.map((n) => {
          const s = ye(n);
          return (
            W.set(n, s),
            {
              id: s,
              priority: 2,
              action: { type: "block" },
              condition: {
                urlFilter: `||${n}`,
                resourceTypes: [
                  "main_frame",
                  "sub_frame",
                  "script",
                  "xmlhttprequest",
                  "image",
                ],
              },
            }
          );
        });
      (await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: o,
        addRules: r,
      }),
        i.debug(`DNR rules synced: ${r.length} block rules`));
    } catch (e) {
      i.warn("DNR sync failed:", e);
    }
}
async function yt() {
  if (!pt)
    try {
      const e = (await chrome.declarativeNetRequest.getDynamicRules())
        .filter((o) => o.id >= gt)
        .map((o) => o.id);
      (e.length > 0 &&
        (await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: e,
        })),
        W.clear(),
        i.debug("All DNR block rules cleared"));
    } catch (t) {
      i.warn("DNR clear failed:", t);
    }
}
const Pt = 20,
  T = {
    requestsChecked: 0,
    threatsDetected: 0,
    requestsBlocked: 0,
    recentThreats: [],
  },
  Q = new Map();
function tr(t) {
  let e = Q.get(t);
  return (
    e ||
      ((e = {
        requestsChecked: 0,
        threatsDetected: 0,
        requestsBlocked: 0,
        domains: new Set(),
        threats: [],
      }),
      Q.set(t, e)),
    e
  );
}
let F = !1,
  B = null;
const ut = new Map();
var Ht, zt;
const tt =
  typeof globalThis.browser < "u" &&
  typeof ((zt = (Ht = globalThis.browser) == null ? void 0 : Ht.runtime) == null
    ? void 0
    : zt.getBrowserInfo) == "function";
function er(t) {
  return (
    t.startsWith("chrome") ||
    t.startsWith("moz-extension") ||
    t.startsWith("about:") ||
    t.startsWith("data:") ||
    t.startsWith("blob:") ||
    t.startsWith("devtools:")
  );
}
function Se(t) {
  if (!F || !B || er(t.url)) return;
  const e = U(t.url);
  if (!e) return;
  T.requestsChecked++;
  const o = t.tabId > 0 ? tr(t.tabId) : null;
  if (t.type === "main_frame" && o) {
    const n = ut.get(t.tabId);
    ((n ? U(n) : null) === e ||
      ((o.requestsChecked = 0),
      (o.threatsDetected = 0),
      (o.requestsBlocked = 0),
      (o.domains = new Set()),
      (o.threats = [])),
      ut.set(t.tabId, t.url));
  }
  if ((o && (o.requestsChecked++, o.domains.add(e)), Qt(e))) return;
  const r = $(e);
  if (K(e) || K(r)) {
    if (
      (T.threatsDetected++,
      it(e, "DANGEROUS"),
      o &&
        (o.threatsDetected++,
        o.threats.some((n) => n.domain === e) ||
          o.threats.push({
            domain: e,
            level: "DANGEROUS",
            timestamp: Date.now(),
          })),
      B.networkBlockingEnabled)
    ) {
      if ((T.requestsBlocked++, o && o.requestsBlocked++, tt))
        return { cancel: !0 };
      Qo(e).catch(() => {});
    }
    t.type === "main_frame" || t.type;
    return;
  }
  if (t.type === "main_frame") {
    const n = Ko(e);
    if (n) {
      (n.level === "DANGEROUS" || n.level === "SUSPICIOUS") &&
        (T.threatsDetected++,
        it(e, n.level),
        o &&
          (o.threatsDetected++,
          o.threats.some((h) => h.domain === e) ||
            o.threats.push({
              domain: e,
              level: n.level,
              timestamp: Date.now(),
            })));
      return;
    }
    const s = performance.now(),
      a = ft(t.url, B.protectionLevel),
      c = performance.now() - s;
    (Yo(e, a),
      c > 5 && i.debug(`URL check took ${c.toFixed(1)}ms for ${e}`),
      (a.level === "DANGEROUS" || a.level === "SUSPICIOUS") &&
        (T.threatsDetected++,
        it(e, a.level),
        o &&
          (o.threatsDetected++,
          o.threats.some((h) => h.domain === e) ||
            o.threats.push({
              domain: e,
              level: a.level,
              timestamp: Date.now(),
            }))));
  }
}
function it(t, e) {
  (T.recentThreats.unshift({ domain: t, level: e, timestamp: Date.now() }),
    T.recentThreats.length > Pt && (T.recentThreats.length = Pt));
}
function or(t) {
  const e = (B == null ? void 0 : B.networkBlockingEnabled) ?? !1;
  ((B = t),
    t.networkBlockingEnabled &&
      !e &&
      !tt &&
      (ht()
        .then((o) => be(o.map((r) => r.domain)))
        .catch((o) => i.warn("DNR sync on enable failed:", o)),
      i.debug("Blocking enabled — syncing DNR rules")),
    !t.networkBlockingEnabled &&
      e &&
      (yt(), i.debug("Blocking disabled — clearing DNR rules")));
}
function dt(t) {
  var o;
  if (F) return;
  if (
    ((B = t), (F = !0), !((o = chrome.webRequest) != null && o.onBeforeRequest))
  ) {
    i.warn("webRequest API not available");
    return;
  }
  const e = tt && t.networkBlockingEnabled ? ["blocking"] : [];
  (chrome.webRequest.onBeforeRequest.addListener(
    Se,
    { urls: ["<all_urls>"] },
    e.length > 0 ? e : void 0,
  ),
    Xo(),
    tt ||
      (t.networkBlockingEnabled
        ? ht()
            .then((r) => be(r.map((n) => n.domain)))
            .catch((r) => i.warn("DNR sync failed:", r))
        : yt()),
    i.debug("Network request monitoring started"));
}
function Wt() {
  var t, e;
  F &&
    ((F = !1),
    (B = null),
    (e = (t = chrome.webRequest) == null ? void 0 : t.onBeforeRequest) ==
      null || e.removeListener(Se),
    Zo(),
    yt(),
    i.debug("Network request monitoring stopped"));
}
function jt() {
  return { ...T, recentThreats: [...T.recentThreats] };
}
function rr(t) {
  const e = Q.get(t);
  return e
    ? {
        requestsChecked: e.requestsChecked,
        threatsDetected: e.threatsDetected,
        requestsBlocked: e.requestsBlocked,
        domains: [...e.domains],
        threats: [...e.threats],
      }
    : null;
}
function nr(t) {
  (Q.delete(t), ut.delete(t));
}
const l = {
  enabled: !0,
  checkedUrls: 0,
  settings: { ...Vt },
  stats: { ...Kt },
  reports: [],
  history: [],
  pageAnalysis: new Map(),
};
function ct() {
  chrome.storage.sync.set({ stats: l.stats });
}
function et(t) {
  try {
    const e = new URL(t);
    return e.origin + e.pathname;
  } catch {
    return U(t) ?? "";
  }
}
function $t(t, e, o) {
  const r = et(t),
    n = U(t) || r;
  (l.history.unshift({
    url: r,
    domain: n,
    level: e,
    score: o,
    checkedAt: Date.now(),
  }),
    l.history.length > Dt && (l.history = l.history.slice(0, Dt)),
    chrome.storage.local.set({ history: l.history }));
}
let bt = !1,
  ke;
const De = new Promise((t) => {
    ke = t;
  }),
  R = { swInitDone: !1, blocklistLoaded: !1, breachLoaded: !1 };
globalThis.__alparslanE2E = R;
const D = { _startedAt: Date.now() },
  p = {
    ready: !1,
    step: f.init.starting,
    percent: 0,
    steps: [
      { name: f.init.settings, done: !1 },
      { name: f.init.blacklist, done: !1 },
      { name: f.init.usom, done: !1 },
      { name: f.init.whitelist, done: !1 },
      { name: f.init.breachDb, done: !1 },
    ],
  };
function O(t, e) {
  ((p.steps[t].done = !0), e !== void 0 && (p.steps[t].ms = e));
  const o = p.steps.filter((r) => r.done).length;
  ((p.percent = Math.round((o / p.steps.length) * 100)),
    (p.step =
      t < p.steps.length - 1
        ? p.steps[t + 1].name + " " + f.init.loadingSuffix
        : f.init.ready));
}
async function sr() {
  const t = Date.now();
  p.step = f.init.settings + " " + f.init.loadingSuffix;
  const [e, o] = await Promise.all([
    new Promise((u) => {
      chrome.storage.sync.get(
        ["enabled", "settings", "stats", "reports"],
        (d) => u(d),
      );
    }),
    new Promise((u) => {
      chrome.storage.local.get(["history"], (d) => u(d));
    }),
  ]);
  ((D.storageLoad = Date.now() - t),
    O(0, D.storageLoad),
    e.enabled !== void 0 && (l.enabled = e.enabled),
    e.settings && (l.settings = { ...Vt, ...e.settings }),
    e.stats && (l.stats = { ...Kt, ...e.stats }),
    e.reports && (l.reports = e.reports.map((u) => ({ ...u, url: et(u.url) }))),
    o.history && (l.history = o.history.map((u) => ({ ...u, url: et(u.url) }))),
    (p.step = f.init.blacklist + " " + f.init.loadingSuffix));
  const r = Date.now();
  (await qe(),
    (D.cacheInit = Date.now() - r),
    O(1, D.cacheInit),
    (p.step = f.init.usom + " " + f.init.loadingSuffix));
  const n = Date.now(),
    [s, a, c] = await Promise.allSettled([so(), ko(), Wo()]),
    h = Date.now() - n;
  ((D.usomWhitelistBreach = h),
    O(2, h),
    s.status === "rejected" && i.warn("USOM init failed:", s.reason),
    O(3, h),
    a.status === "rejected" && i.warn("Whitelist init failed:", a.reason),
    O(4, h),
    c.status === "rejected" && i.warn("Breach init failed:", c.reason),
    pe(l.settings.urlCacheTtlMinutes),
    l.settings.networkMonitoringEnabled && dt(l.settings),
    (D.total = Date.now() - t),
    (p.ready = !0),
    (p.step = f.init.ready),
    (p.percent = 100),
    (bt = !0),
    (R.swInitDone = !0),
    ke(),
    i.debug(
      `Service worker initialized in ${D.total}ms (storage: ${D.storageLoad}ms, cache: ${D.cacheInit}ms)`,
    ),
    chrome.tabs.query({}, (u) => {
      for (const d of u) {
        if (
          !d.id ||
          !d.url ||
          d.url.startsWith("chrome") ||
          d.url.startsWith("about:")
        )
          continue;
        const m = ft(d.url, l.settings.protectionLevel);
        (Te(d.id, m.level),
          (m.level === "DANGEROUS" || m.level === "SUSPICIOUS") &&
            l.settings.showDomWarnings !== !1 &&
            chrome.tabs
              .sendMessage(d.id, {
                type: "SHOW_WARNING",
                level: m.level,
                reason: m.reasons.join(", "),
                score: m.score,
              })
              .catch(() => {}),
          chrome.tabs.sendMessage(d.id, { type: "RESCAN" }).catch(() => {}));
      }
    }));
}
sr().catch((t) => {
  i.warn("Service worker init error:", t);
});
chrome.runtime.onInstalled.addListener(() => {
  var t;
  (i.debug("Extension installed"),
    (t = chrome.declarativeNetRequest) != null &&
      t.getDynamicRules &&
      chrome.declarativeNetRequest
        .getDynamicRules()
        .then((e) => {
          const o = e.filter((r) => r.id >= 1e3).map((r) => r.id);
          o.length > 0 &&
            (chrome.declarativeNetRequest.updateDynamicRules({
              removeRuleIds: o,
            }),
            i.debug(`Cleared ${o.length} leftover DNR rules`));
        })
        .catch(() => {}),
    fetch(chrome.runtime.getURL("lists/tr-phishing.json"))
      .then((e) => e.json())
      .then((e) => {
        const o = e.domains.map((r) => ({
          domain: r.domain,
          category: r.category || "other",
          addedAt: r.addedAt || new Date().toISOString().split("T")[0],
          source: r.source || "builtin",
        }));
        return te(o);
      })
      .then(() => {
        (i.debug("Built-in blocklist loaded into IndexedDB"),
          (R.blocklistLoaded = !0));
      })
      .catch(() => {
        (i.warn("Could not load blocklist"), (R.blocklistLoaded = !0));
      }),
    ao(),
    Do(),
    No(),
    V(),
    fetch(chrome.runtime.getURL("lists/breached-sites.json"))
      .then((e) => e.json())
      .then((e) =>
        Po(e.breaches).then(() => {
          (i.debug(
            "Breach DB stored in IndexedDB: " +
              String(e.breaches.length) +
              " entries",
          ),
            (R.breachLoaded = !0));
        }),
      )
      .catch(() => {
        (i.warn("Could not load breach database"), (R.breachLoaded = !0));
      }));
});
const ar = new Set([
  "SET_ENABLED",
  "SETTINGS_UPDATED",
  "ADD_TO_WHITELIST",
  "REMOVE_FROM_WHITELIST",
  "CLEAR_HISTORY",
]);
function ir(t) {
  var o;
  if (t.id !== chrome.runtime.id) return !1;
  if (t.tab === void 0) return !0;
  const e = `chrome-extension://${chrome.runtime.id}/`;
  return ((o = t.url) == null ? void 0 : o.startsWith(e)) ?? !1;
}
chrome.runtime.onMessage.addListener((t, e, o) => {
  if (ar.has(t.type) && !ir(e))
    return (
      i.warn("Rejected privileged message:", t.type),
      i.debug("Rejected sender url:", e.url),
      o({ ok: !1, reason: "unauthorized" }),
      !0
    );
  if (t.type === "PING")
    return (o({ type: "PONG", timestamp: Date.now() }), !0);
  if (t.type === "CHECK_URL") {
    const r = t.url;
    return l.enabled
      ? (l.checkedUrls++,
        l.stats.urlsChecked++,
        (async () => {
          bt || (await De);
          try {
            const s = new URL(r).hostname.toLowerCase();
            if (Qt(s)) {
              (ct(),
                $t(r, "SAFE", 0),
                o({
                  level: "SAFE",
                  score: 0,
                  reasons: [f.reasons.whitelisted],
                  url: r,
                  checkedAt: Date.now(),
                  showDomWarnings: l.settings.showDomWarnings !== !1,
                }));
              return;
            }
          } catch {}
          const n = await he(r, l.settings.protectionLevel);
          ((n.level === "DANGEROUS" || n.level === "SUSPICIOUS") &&
            (l.stats.threatsBlocked++, Go(n.level)),
            ct(),
            $t(r, n.level, n.score),
            o({ ...n, showDomWarnings: l.settings.showDomWarnings !== !1 }));
        })(),
        !0)
      : (o({
          level: "UNKNOWN",
          score: 0,
          reasons: [],
          url: r,
          checkedAt: Date.now(),
          showDomWarnings: !1,
        }),
        !0);
  }
  if (t.type === "GET_STATE") return (o({ ...l }), !0);
  if (t.type === "SET_ENABLED")
    return (
      (l.enabled = t.enabled),
      chrome.storage.sync.set({ enabled: l.enabled }),
      l.enabled
        ? l.settings.networkMonitoringEnabled && dt(l.settings)
        : (Wt(),
          chrome.tabs.query({}, (r) => {
            for (const n of r)
              n.id !== void 0 &&
                chrome.action.setBadgeText({ text: "", tabId: n.id });
          })),
      o({ enabled: l.enabled }),
      !0
    );
  if (t.type === "GET_SETTINGS") return (o({ settings: l.settings }), !0);
  if (t.type === "SETTINGS_UPDATED") {
    const r = t.settings,
      n = l.settings;
    return (
      (l.settings = r),
      pe(r.urlCacheTtlMinutes),
      r.networkMonitoringEnabled && !n.networkMonitoringEnabled
        ? dt(r)
        : !r.networkMonitoringEnabled && n.networkMonitoringEnabled
          ? Wt()
          : r.networkMonitoringEnabled && or(r),
      o({ ok: !0 }),
      !0
    );
  }
  if (t.type === "ADD_TO_WHITELIST") {
    const r = t.domain;
    return (
      We(r).catch((n) => i.warn("Whitelist add error:", n)),
      o({ ok: !0 }),
      !0
    );
  }
  if (t.type === "REMOVE_FROM_WHITELIST") {
    const r = t.domain;
    return (
      je(r).catch((n) => i.warn("Whitelist remove error:", n)),
      o({ ok: !0 }),
      !0
    );
  }
  if (t.type === "GET_LIST_STATS") {
    const r = t.tabId,
      n = jt(),
      s = r ? rr(r) : null;
    return (
      o({
        whitelistSize: At().length,
        blacklistSize: Et(),
        dynamicWhitelistSize: wo(),
        settings: l.settings,
        ...n,
        tab: s,
      }),
      !0
    );
  }
  if (t.type === "GET_BLACKLIST_ITEMS") {
  o({
    items: Array.from(M).slice(0, 2000),
  });
  return !0;
}
  if (t.type === "GET_STATS") return (o({ stats: l.stats }), !0);
  if (t.type === "TRACKER_BLOCKED")
    return (l.stats.trackersBlocked++, ct(), Ho(), o({ ok: !0 }), !0);
  if (t.type === "REPORT_SITE") {
    const r = t.domain;
    if (l.reports.some((m) => m.domain === r))
      return (o({ ok: !1, reason: "already_reported" }), !0);
    const s = Date.now() - 60 * 60 * 1e3;
    if (l.reports.filter((m) => m.reportedAt >= s).length >= 10)
      return (o({ ok: !1, reason: "rate_limited" }), !0);
    const c = t.reportType,
      h = t.description || "",
      u = t.url,
      d = {
        domain: r,
        url: et(u),
        reportType: c,
        description: h,
        reportedAt: Date.now(),
      };
    return (
      l.reports.push(d),
      chrome.storage.sync.set({ reports: l.reports }),
      o({ ok: !0 }),
      !0
    );
  }
  if (t.type === "GET_REPORTS") return (o({ reports: l.reports }), !0);
  if (t.type === "GET_HISTORY") return (o({ history: l.history }), !0);
  if (t.type === "CLEAR_HISTORY")
    return (
      (l.history = []),
      chrome.storage.local.set({ history: [] }),
      o({ ok: !0 }),
      !0
    );
  if (t.type === "PAGE_ANALYSIS") {
    const r = t.domain,
      n = {
        hasLoginForm: t.hasLoginForm,
        hasPasswordField: t.hasPasswordField,
        hasCreditCardField: t.hasCreditCardField,
        suspiciousFormAction: t.suspiciousFormAction,
        externalFormAction: t.externalFormAction || null,
        score: t.score,
        reasons: t.reasons,
      };
    return (l.pageAnalysis.set(r, n), o({ ok: !0 }), !0);
  }
  if (t.type === "GET_PAGE_ANALYSIS") {
    const r = t.domain,
      n = l.pageAnalysis.get(r) || null;
    return (o({ analysis: n }), !0);
  }
  if (t.type === "CHECK_BREACH") {
    const r = t.domain,
      n = $o(r);
    return (o(n), !0);
  }
  if (t.type === "GET_DASHBOARD_SCORE")
    return (
      (async () => {
        const r = await qo(),
          n = await Fo(),
          s = Vo(r);
        ((s.previousWeek = n), o({ dashboard: s }));
      })(),
      !0
    );
  if (t.type === "RECORD_PROTOCOL") {
    const r = t.url;
    return (ge(r), o({ ok: !0 }), !0);
  }
  return t.type === "GET_INIT_STATUS"
    ? (o(p), !0)
    : t.type === "GET_DEBUG_INFO"
      ? (o({
          initTimings: D,
          blacklistSize: Et(),
          whitelistSize: At().length,
          monitoring: jt(),
          uptime: Date.now() - (D._startedAt || Date.now()),
        }),
        !0)
      : !1;
});
const qt = {
  SAFE: { text: "✓", color: "#16a34a" },
  DANGEROUS: { text: "!", color: "#dc2626" },
  SUSPICIOUS: { text: "?", color: "#d97706" },
  UNKNOWN: { text: "", color: "#6b7280" },
};
function Te(t, e) {
  const o = qt[e] || qt.UNKNOWN;
  (chrome.action.setBadgeText({ text: o.text, tabId: t }),
    chrome.action.setBadgeBackgroundColor({ color: o.color, tabId: t }));
}
chrome.tabs.onUpdated.addListener((t, e, o) => {
  if (l.enabled && (e.url && ge(e.url), e.status === "complete")) {
    const r = o.url;
    if (
      !r ||
      r.startsWith("chrome") ||
      r.startsWith("about:") ||
      r.startsWith("moz-extension")
    )
      return;
    (async () => {
      bt || (await De);
      const n = await he(r, l.settings.protectionLevel);
      (Te(t, n.level),
        (n.level === "DANGEROUS" || n.level === "SUSPICIOUS") &&
          l.settings.showDomWarnings !== !1 &&
          chrome.tabs
            .sendMessage(t, {
              type: "SHOW_WARNING",
              level: n.level,
              reason: n.reasons.join(", "),
              score: n.score,
            })
            .catch(() => {}));
    })();
  }
});
chrome.tabs.onRemoved.addListener((t) => {
  nr(t);
});
