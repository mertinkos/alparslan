const listDiv = document.getElementById("list");
const countDiv = document.getElementById("count");
const searchInput = document.getElementById("searchInput");

let allItems = [];

// Blocklist entries are attacker-influenced data (USOM / remote lists), so
// they must never be interpolated into innerHTML. Build each row with
// createElement + textContent, and only allow http(s) hrefs so a crafted
// entry can't smuggle a javascript:/data: URL into the link.
function safeHref(item) {
  let url = item;
  if (!/^https?:\/\//i.test(url)) {
    url = "http://" + url;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    /* fall through */
  }
  return null;
}

function renderList(items) {
  countDiv.textContent = `${items.length} kayıt gösteriliyor`;

  listDiv.replaceChildren();

  if (items.length === 0) {
    listDiv.textContent = "Sonuç bulunamadı.";
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "item";

    const icon = document.createElement("span");
    icon.className = "linkIcon";
    icon.textContent = "🔗";
    row.appendChild(icon);

    const href = safeHref(item);
    if (href) {
      const link = document.createElement("a");
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item;
      row.appendChild(link);
    } else {
      const text = document.createElement("span");
      text.textContent = item;
      row.appendChild(text);
    }

    listDiv.appendChild(row);
  }
}

chrome.runtime.sendMessage({ type: "GET_BLACKLIST_ITEMS" }, (res) => {
  if (!res || !res.items) {
    listDiv.textContent = "Liste alınamadı.";
    return;
  }

  allItems = res.items.sort((a, b) => a.localeCompare(b));
  renderList(allItems);
});

let searchTimeout;

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    const query = searchInput.value.toLowerCase().trim();

    const filtered = allItems.filter((item) =>
      String(item).toLowerCase().includes(query),
    );

    renderList(filtered);
  }, 200);
});
