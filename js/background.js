const openNewTab = (url) => {
  if (typeof browser !== "undefined" && browser.tabs) {
    browser.tabs.create({ url });
  } else if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.create({ url });
  }
};

if (typeof browser !== "undefined" && browser.browserAction) {
  browser.browserAction.onClicked.addListener((tab) => {
    browser.tabs.create({ url: "html/options.html" });
  });
} else if (typeof chrome !== "undefined" && chrome.browserAction) {
  chrome.browserAction.onClicked.addListener((tab) => {
    chrome.tabs.create({ url: "html/options.html" });
  });
}

if (typeof browser !== "undefined" && browser.contextMenus) {
  browser.contextMenus.create({
    id: "extensionContextMenu",
    title: "Steam Search",
    contexts: ["selection"],
  });
} else if (typeof chrome !== "undefined" && chrome.contextMenus) {
  chrome.contextMenus.create({
    id: "extensionContextMenu",
    title: "Steam Search",
    contexts: ["selection"],
  });
}

if (typeof browser !== "undefined" && browser.contextMenus) {
  browser.contextMenus.create({
    id: "searchSteam",
    title: "Search in Steam",
    contexts: ["selection"],
    parentId: "extensionContextMenu",
  });
  browser.contextMenus.create({
    id: "searchSteamDB",
    title: "Search in SteamDB",
    contexts: ["selection"],
    parentId: "extensionContextMenu",
  });
  browser.contextMenus.create({
    id: "searchProtonDB",
    title: "Search in ProtonDB",
    contexts: ["selection"],
    parentId: "extensionContextMenu",
  });
} else if (typeof chrome !== "undefined" && chrome.contextMenus) {
  chrome.contextMenus.create({
    id: "searchSteam",
    title: "Search in Steam",
    contexts: ["selection"],
    parentId: "extensionContextMenu",
  });
  chrome.contextMenus.create({
    id: "searchSteamDB",
    title: "Search in SteamDB",
    contexts: ["selection"],
    parentId: "extensionContextMenu",
  });
  chrome.contextMenus.create({
    id: "searchProtonDB",
    title: "Search in ProtonDB",
    contexts: ["selection"],
    parentId: "extensionContextMenu",
  });
}

if (typeof browser !== "undefined" && browser.contextMenus) {
  browser.contextMenus.onClicked.addListener((info, tab) =>
    handleContextMenuClick(info, tab)
  );
} else if (typeof chrome !== "undefined" && chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info, tab) =>
    handleContextMenuClick(info, tab)
  );
}

const searchInSteam = (selectionText) => {
  const searchUrl =
    "https://store.steampowered.com/search/?term=" +
    encodeURIComponent(selectionText);
  openNewTab(searchUrl);
};

const searchInSteamDB = (selectionText) => {
  const searchUrl =
    "https://steamdb.info/search/?a=app&q=" + encodeURIComponent(selectionText);
  openNewTab(searchUrl);
};

const searchInProtonDB = (selectionText) => {
  const searchUrl =
    "https://www.protondb.com/search?q=" + encodeURIComponent(selectionText);
  openNewTab(searchUrl);
};

const handleContextMenuClick = (info, tab) => {
  if (info.menuItemId === "searchSteam") {
    searchInSteam(info.selectionText);
  } else if (info.menuItemId === "searchSteamDB") {
    searchInSteamDB(info.selectionText);
  } else if (info.menuItemId === "searchProtonDB") {
    searchInProtonDB(info.selectionText);
  }
};

if (typeof browser !== "undefined" && browser.runtime) {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender, sendResponse);
    return true;
  });
}

if (typeof chrome !== "undefined" && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender, sendResponse);
    return true;
  });
}

function handleMessage(message, sender, sendResponse) {
  if (message.action === "fetchData") {
    const { url, options } = message;

    fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        sendResponse({ success: true, data: data });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error });
      });

    return true;
  }
}
