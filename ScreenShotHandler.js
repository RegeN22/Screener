export const getMetrics = async (tabId) => {
  const [{result}] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
  });

  return result;
}

export const captureScreenshot = async (tabId, screenshots) => {
  const res = await chrome.tabs.captureVisibleTab(
    undefined,
    { format: 'png' }
  );
  return res;
}


export const mergeScreenshots = async (base64Array) => {
    // 1. Decode Base64 strings into browser-native ImageBitmaps
    const bitmaps = await Promise.all(
        base64Array.map(async (str) => {
            // Strip data URI prefix if it exists
            const cleanBase64 = str.replace(/^data:image\/\w+;base64,/, "");
            
            // Fetch raw binary blob from the data
            const res = await fetch(`data:image/png;base64,${cleanBase64}`);
            const blob = await res.blob();
            
            // Create a web worker-safe image bitmap
            return await createImageBitmap(blob);
        })
    );

    // 2. Calculate final image size requirements
    const maxWidth = Math.max(...bitmaps.map(b => b.width));
    const totalHeight = bitmaps.reduce((sum, b) => sum + b.height, 0);

    // 3. Initialize a headless OffscreenCanvas container
    const canvas = new OffscreenCanvas(maxWidth, totalHeight);
    const ctx = canvas.getContext('2d');

    // 4. Stencil images sequentially from top to bottom
    let currentY = 0;
    bitmaps.forEach(bitmap => {
        ctx.drawImage(bitmap, 0, currentY);
        currentY += bitmap.height;
        bitmap.close(); // Clean up system memory right away
    });

    // 5. Convert the canvas back into a clean Base64 data string
    const finalBlob = await canvas.convertToBlob({ type: 'image/png' });
    
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(finalBlob);
    });

}

export const getCurrentActiveTabId = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    return tab.id;
}