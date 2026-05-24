const whitelistInput = document.getElementById("whitelistInput");
const addBtn = document.getElementById("addBtn");
const whitelistList = document.getElementById("whitelistList");
const backBtn = document.getElementById("backBtn");
const searchInput = document.getElementById("searchInput");

// Keep this in sync with normalizeQuickWhitelistDomain in
// src/popup/whitelist-helpers.ts (the unit-tested source of truth).
// Lowercase FIRST so the protocol / www stripping below also catches
// mixed-case input like "HTTPS://WWW.EXAMPLE.COM/"; lowercasing last
// silently leaked "www." into whitelist entries for uppercase pastes.
function normalizeDomain(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

function getSettings(callback) {
  chrome.storage.sync.get(["settings"], (result) => {
    callback(result.settings || {});
  });
}

function saveSettings(settings, callback) {
  chrome.storage.sync.set({ settings }, () => {
    chrome.runtime.sendMessage({
      type: "SETTINGS_UPDATED",
      settings,
    });

    if (callback) callback();
  });
}

function getWhitelist(callback) {
  getSettings((settings) => {
    callback(settings.whitelist || []);
  });
}

function saveWhitelist(whitelist, callback) {
  getSettings((settings) => {
    const updatedSettings = {
      ...settings,
      whitelist,
    };

    saveSettings(updatedSettings, callback);
  });
}

function renderWhitelist() {
  getWhitelist((whitelist) => {
    const searchTerm = normalizeDomain(searchInput.value);

    const filteredWhitelist = whitelist.filter((domain) => {
      return normalizeDomain(domain).includes(searchTerm);
    });

    whitelistList.innerHTML = "";

    if (!whitelist.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "Beyaz liste boş";
      whitelistList.appendChild(empty);
      return;
    }

    if (!filteredWhitelist.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "Aramanızla eşleşen site bulunamadı";
      whitelistList.appendChild(empty);
      return;
    }

    filteredWhitelist.forEach((domain) => {
      const item = document.createElement("div");
      item.className = "item";

      const text = document.createElement("div");
      text.className = "domain";
      text.textContent = domain;
      text.title = domain;

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "Sil";

      removeBtn.addEventListener("click", () => {
        const updatedWhitelist = whitelist.filter((site) => site !== domain);

        saveWhitelist(updatedWhitelist, () => {
          chrome.runtime.sendMessage({
            type: "REMOVE_FROM_WHITELIST",
            domain,
          });

          renderWhitelist();
        });
      });

      item.appendChild(text);
      item.appendChild(removeBtn);
      whitelistList.appendChild(item);
    });
  });
}

function addDomain() {
  const domain = normalizeDomain(whitelistInput.value);

  if (!domain) return;

  getWhitelist((whitelist) => {
    const updatedWhitelist = whitelist.includes(domain)
      ? whitelist
      : [...whitelist, domain];

    saveWhitelist(updatedWhitelist, () => {
      chrome.runtime.sendMessage({
        type: "ADD_TO_WHITELIST",
        domain,
      });

      whitelistInput.value = "";
      renderWhitelist();
    });
  });
}

addBtn.addEventListener("click", addDomain);
searchInput.addEventListener("input", renderWhitelist);

whitelistInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addDomain();
  }
});

backBtn.addEventListener("click", () => {
  window.close();
});

renderWhitelist();
