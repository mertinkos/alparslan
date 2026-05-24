// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";

// list.js is a classic (non-module) page script that captures #list / #count /
// #searchInput at load and renders whatever GET_BLACKLIST_ITEMS returns.
// Blocklist entries are attacker-influenced data, so the regression we guard
// here is: entries must be rendered as TEXT, never interpolated into innerHTML,
// and links must be limited to http(s).
function scaffold() {
  document.body.replaceChildren();
  for (const id of ["count", "list"]) {
    const div = document.createElement("div");
    div.id = id;
    document.body.appendChild(div);
  }
  const input = document.createElement("input");
  input.id = "searchInput";
  document.body.appendChild(input);
}

async function loadListScript(items: string[]) {
  vi.resetModules();
  scaffold();
  chrome.runtime.sendMessage = ((msg: { type: string }, cb?: (r: unknown) => void) => {
    if (msg.type === "GET_BLACKLIST_ITEMS" && cb) cb({ items });
  }) as unknown as typeof chrome.runtime.sendMessage;
  await import("../../list.js");
  return document.getElementById("list") as HTMLElement;
}

describe("list.js — safe rendering", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("does not inject HTML from a malicious entry", async () => {
    const payload = '<img src=x onerror="window.__pwned=1">';
    const list = await loadListScript([payload, "ok.com"]);

    // No real element should be created from the payload.
    expect(list.querySelector("img")).toBeNull();
    // The payload survives verbatim as text content (i.e. it was escaped).
    expect(list.textContent).toContain(payload);
  });

  it("renders the entry text inside an anchor for normal domains", async () => {
    const list = await loadListScript(["evil-phish.com"]);
    const anchor = list.querySelector("a");
    expect(anchor).not.toBeNull();
    expect(anchor?.textContent).toBe("evil-phish.com");
    expect(anchor?.getAttribute("href")).toBe("http://evil-phish.com/");
    expect(anchor?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("never emits a javascript: (or other non-http) href", async () => {
    const list = await loadListScript(["javascript:alert(1)", "https://safe.com"]);
    const hrefs = [...list.querySelectorAll("a")].map((a) => a.getAttribute("href") || "");
    expect(hrefs.some((h) => h.toLowerCase().startsWith("javascript:"))).toBe(false);
    // The safe https entry is still linked.
    expect(hrefs.some((h) => h === "https://safe.com/")).toBe(true);
  });
});
