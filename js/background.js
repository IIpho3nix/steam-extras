const openNewTab = (url) => {
  const api = typeof browser !== "undefined" ? browser : chrome;
  api.tabs.create({ url });
};

const api = typeof browser !== "undefined" ? browser : chrome;

api.browserAction.onClicked.addListener(() => {
  api.tabs.create({ url: "html/options.html" });
});

api.contextMenus.create({
  id: "extensionContextMenu",
  title: "Steam Search",
  contexts: ["selection"],
});

api.contextMenus.create({
  id: "searchSteam",
  parentId: "extensionContextMenu",
  title: "Search in Steam",
  contexts: ["selection"],
});

api.contextMenus.create({
  id: "searchSteamDB",
  parentId: "extensionContextMenu",
  title: "Search in SteamDB",
  contexts: ["selection"],
});

api.contextMenus.create({
  id: "searchProtonDB",
  parentId: "extensionContextMenu",
  title: "Search in ProtonDB",
  contexts: ["selection"],
});

api.contextMenus.onClicked.addListener((info) => {
  const text = info.selectionText;

  if (info.menuItemId === "searchSteam") {
    openNewTab(
      "https://store.steampowered.com/search/?term=" + encodeURIComponent(text),
    );
  }

  if (info.menuItemId === "searchSteamDB") {
    openNewTab(
      "https://steamdb.info/search/?a=app&q=" + encodeURIComponent(text),
    );
  }

  if (info.menuItemId === "searchProtonDB") {
    openNewTab("https://www.protondb.com/search?q=" + encodeURIComponent(text));
  }
});

api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sendResponse);
  return true;
});

let ITAD_API_KEY = "";

const loadApiKey = () => {
  if (typeof browser !== "undefined" && browser.storage?.sync) {
    browser.storage.sync.get(["isthereanydealApiKey"]).then((result) => {
      ITAD_API_KEY = result.isthereanydealApiKey || "";
    });
  } else if (typeof chrome !== "undefined" && chrome.storage?.sync) {
    chrome.storage.sync.get(["isthereanydealApiKey"], (result) => {
      ITAD_API_KEY = result.isthereanydealApiKey || "";
    });
  }
};

loadApiKey();

if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.isthereanydealApiKey) {
      ITAD_API_KEY = changes.isthereanydealApiKey.newValue || "";
    }
  });
}

function handleMessage(message, sendResponse) {
  if (message.action === "itadFetch") {
    (async () => {
      try {
        if (!ITAD_API_KEY) {
          sendResponse({ success: false, error: "ITAD API key not set" });
          return;
        }

        const url = new URL(message.url);
        url.searchParams.set("key", ITAD_API_KEY);

        const response = await fetch(url.toString(), message.options || {});
        const data = await response.json();

        sendResponse({ success: true, data });
      } catch (e) {
        sendResponse({ success: false, error: e.toString() });
      }
    })();

    return;
  }

  if (message.action === "fetchData") {
    fetch(message.url, message.options || {})
      .then((r) => r.json())
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.toString() }));

    return;
  }
}
