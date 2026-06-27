export const downloadScreenshot = (url) => {
  chrome.downloads.download({
    url: url,
    filename: "full-page.png"
  });
}