chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("https://meet.google.com/") && changeInfo.status === "complete") {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["main.js"]
    });
  }
});