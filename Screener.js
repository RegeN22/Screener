import { overrideDeviceMetrics, captureScreenshot, getMetrics, mergeScreenshots } from './ScreenShotHandler.js';
import { scrollToNeededLocation, getBiggestScrollableElement } from './ScrollHandler.js';

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action !== "captureFullPage") {
    return;
  }

  try {
    let tabId = await getCurrentActiveTabId();
    await chrome.debugger.attach({ tabId }, "1.3"); 

    let screenshots = [];
    let currentHeight = 0
    let metrics = await getMetrics(tabId);
    const biggestElement = await getBiggestScrollableElement(tabId);
    await chrome.debugger.sendCommand({ tabId }, "Page.enable");

    // if the biggest scrollable element is taller than the viewport,
    // scroll and capture screenshots
    // else capture a single screenshot of the WHOLE page
    if (biggestElement && biggestElement.height && biggestElement.height > metrics.layoutViewport.clientHeight) {
      await scrollToNeededLocation(tabId, 0, biggestElement.biggestElement)

      while (currentHeight < biggestElement.height) {
        await new Promise(r => setTimeout(r, 500));// wait for the scroll to finish
        let screenshot =await captureScreenshot(tabId, screenshots, false);
        screenshots.push(screenshot);
        currentHeight += metrics.layoutViewport.clientHeight;
        await scrollToNeededLocation(tabId, currentHeight, biggestElement.biggestElement)
      }
    } else {
        const width = Math.ceil(metrics.layoutViewport.clientWidth);
        const height = Math.ceil(metrics.layoutViewport.clientHeight);

        await overrideDeviceMetrics(tabId, width, height);
        await captureScreenshot(tabId, screenshots);
    }

    downloadScreenshot(mergeScreenshots(screenshots));
  } catch (error) {
    console.error("Error capturing full page:", error);
  }
  
  await chrome.debugger.detach({ tabId });
})

var getCurrentActiveTabId = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    return tab.id;
}

var downloadScreenshot = (url) => {
  chrome.downloads.download({
    url: `data:image/png;base64,${url}`,
    filename: "full-page.png"
  });
}