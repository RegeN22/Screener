export const downloadScreenshot = (url) => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed (0 = January)
  const year = date.getFullYear();

  chrome.downloads.download({
    url: url,
    filename: `Screener-Screenshot-${day}-${month}-${year}.png`
  });
}