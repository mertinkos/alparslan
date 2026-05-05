const listDiv = document.getElementById("list");
const countDiv = document.getElementById("count");
const searchInput = document.getElementById("searchInput");

let allItems = [];

function renderList(items) {
  countDiv.textContent = `${items.length} kayıt gösteriliyor`;

  if (items.length === 0) {
    listDiv.textContent = "Sonuç bulunamadı.";
    return;
  }

  listDiv.innerHTML = items
    .slice(0, 5000)
    .map((item) => {
      let url = item;

      if (!url.startsWith("http")) {
        url = "http://" + url;
      }

      return `
    <div class="item">
         <span class="linkIcon">🔗</span>
        <a href="${url}" target="_blank" rel="noopener noreferrer">${item}</a>
    </div>
  `;
    })
    .join("");
}

chrome.runtime.sendMessage({ type: "GET_BLACKLIST_ITEMS" }, (res) => {
  if (!res || !res.items) {
    listDiv.textContent = "Liste alınamadı.";
    return;
  }

  allItems = res.items.sort((a, b) => a.localeCompare(b));
  renderList(allItems);
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();

  const filtered = allItems.filter((item) =>
    String(item).toLowerCase().includes(query),
  );

  renderList(filtered);
});
