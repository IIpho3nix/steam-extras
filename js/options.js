const saveOptions = (e) => {
  e.preventDefault();

  const settings = {};
  const checkboxes = document.querySelectorAll(
    ".switch input[type='checkbox']"
  );

  checkboxes.forEach((checkbox) => {
    const settingName = checkbox.id.replace("Toggle", "");
    settings[settingName] = checkbox.checked;
  });

  if (
    typeof browser !== "undefined" &&
    browser.storage &&
    browser.storage.sync
  ) {
    browser.storage.sync.set(settings);
  } else if (
    typeof chrome !== "undefined" &&
    chrome.storage &&
    chrome.storage.sync
  ) {
    chrome.storage.sync.set(settings);
  } else {
    alert("Browser storage API not supported");
  }
};

const restoreOptions = () => {
  const setCurrentChoice = (result) => {
    Object.keys(result).forEach((settingName) => {
      const toggleId = `${settingName}Toggle`;
      const toggle = document.querySelector(`#${toggleId}`);
      if (toggle) {
        toggle.checked = result[settingName] || false;
      }
    });
  };

  const onError = (error) => {
    alert(`An error occurred: ${error}`);
  };

  if (
    typeof browser !== "undefined" &&
    browser.storage &&
    browser.storage.sync
  ) {
    browser.storage.sync.get(null).then(setCurrentChoice).catch(onError);
  } else if (
    typeof chrome !== "undefined" &&
    chrome.storage &&
    chrome.storage.sync
  ) {
    chrome.storage.sync.get(null, setCurrentChoice);
  } else {
    alert("Browser storage API not supported");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  restoreOptions();
  saveOptions();
});

document.querySelector("form").addEventListener("submit", saveOptions);
