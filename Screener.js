import { getCurrentActiveTabId,captureScreenshot, getMetrics, mergeScreenshots } from './ScreenShotHandler.js';
import { scrollToNeededLocation, getBiggestScrollableElement } from './ScrollHandler.js';
import { downloadScreenshot } from './DownloadHandler.js';

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action !== "captureFullPage") {
    return;
  }

  try {
    let tabId = message.tabId || await getCurrentActiveTabId();
    let screenshots = [];
    let currentHeight = 0
    let metrics = await getMetrics(tabId);
    const biggestElement = await getBiggestScrollableElement(tabId);

    // if the biggest scrollable element is taller than the viewport, scroll and capture screenshots
    // else capture a single screenshot of the WHOLE page
    if (biggestElement && biggestElement.height) {
      await scrollToNeededLocation(tabId, 0, biggestElement.biggestElement)

      while (currentHeight < biggestElement.height) {
        await new Promise(r => setTimeout(r, 1000));// MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND
        let screenshot = await captureScreenshot(tabId, screenshots);
        screenshots.push(screenshot);
        currentHeight += metrics.height;
        await scrollToNeededLocation(tabId, currentHeight, biggestElement.biggestElement)
      }
    } else {
      let screenshot = await captureScreenshot(tabId, screenshots);
      throw new Error("Error finding the biggest scrollable element. Capturing a single screenshot of the whole page instead.");
    }

    let merged = await mergeScreenshots(screenshots);

    downloadScreenshot(merged);
  } catch (error) {
    console.error("Error capturing full page:", error);
  }
})