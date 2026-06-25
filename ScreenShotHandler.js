// import Sharp from 'sharp';

export var overrideDeviceMetrics = async (tabId, width, height) => {
  await chrome.debugger.sendCommand(
    { tabId },
    "Emulation.setDeviceMetricsOverride",
    {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false
    }
  );
}

export var getMetrics = async (tabId) => {
  const metrics = await chrome.debugger.sendCommand(
    { tabId },
    "Page.getLayoutMetrics"
  );

  return metrics;
}

export var captureScreenshot = async (tabId, screenshots, beyondViewport) => {
  const res = await chrome.debugger.sendCommand(
    { tabId },
    "Page.captureScreenshot",
    {
      format:"png",
      captureBeyondViewport: beyondViewport
    }
  );

  return res.data;
}


export var mergeScreenshots = async (screenshotUrls) => {
    async function mergeBase64Node(base64Array) {
    // 1. Convert base64 strings to raw Node.js binary buffers
    const imageBuffers = base64Array.map(str => {
        // Strip data URI prefix if it exists (e.g., "data:image/png;base64,")
        const cleanBase64 = str.replace(/^data:image\/\w+;base64,/, "");
        return Buffer.from(cleanBase64, 'base64');
    });

    // 2. Get dimensions (width and height) for all images
    const metadataList = await Promise.all(
        imageBuffers.map(buffer => sharp(buffer).metadata())
    );

    // 3. Calculate canvas requirements
    const maxWidth = Math.max(...metadataList.map(meta => meta.width));
    const totalHeight = metadataList.reduce((sum, meta) => sum + meta.height, 0);

    // 4. Prepare the list of image positions for composition
    let currentY = 0;
    const layers = imageBuffers.map((buffer, index) => {
        const layer = {
            input: buffer,
            top: currentY,
            left: 0
        };
        currentY += metadataList[index].height; // Push the next image down
        return layer;
    });

    // 5. Create a blank canvas container and layer images onto it
    const mergedImageBuffer = await sharp({
        create: {
            width: maxWidth,
            height: totalHeight,
            channels: 4, // RGBA (supports transparency)
            background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        }
    })
    .composite(layers)
    .png() // Convert the final result to PNG format
    .toBuffer();

    // 6. Return as a single Base64 string
    return `data:image/png;base64,${mergedImageBuffer.toString('base64')}`;
}
}