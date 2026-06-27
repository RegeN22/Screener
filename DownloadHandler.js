export const downloadScreenshot = (url) => {
  chrome.downloads.download({
    url: url,
    filename: `Screener-Screenshot-${Date.getMonth()}-${Date.getDate()}-${Date.getFullYear()}.png`
  });
}