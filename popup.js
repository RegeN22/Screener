const isRestrictedUrl = (url) => {
  if (!url) return true;
  return url.startsWith("chrome://") || 
         url.startsWith("chrome-extension://") || 
         url.startsWith("edge://") ||
         url.startsWith("about:") ||
         url.includes("chromewebstore.google.com");
}

document.addEventListener("DOMContentLoaded", async () => {
  const supportedView = document.getElementById("supported-view");
  const unsupportedView = document.getElementById("unsupported-view");
  const captureBtn = document.getElementById("capture-btn");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // 2. Check if it's restricted and toggle UI
  if (isRestrictedUrl(tab?.url)) {
    supportedView.classList.add("hidden");
    unsupportedView.classList.remove("hidden");
  } else {
    supportedView.classList.remove("hidden");
    unsupportedView.classList.add("hidden");
    
    chrome.runtime.sendMessage({
      action: "captureFullPage",
      tabId: tab.id
    });
  }
});