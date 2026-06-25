export var getBiggestScrollableElement = async (tabId) => {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: getBiggestScrollableElementFunc
    });
    return result;
  } catch (error) {
    console.error("Error executing script:", error);
  }
};

export var getBiggestScrollableElementFunc = () => {
    const allElements = document.querySelectorAll('*');
    let maxScrollHeight = 0;
    let biggestElement = null;

    allElements.forEach((el,index) => {
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;

      // Element must have actual overflowing content to be truly scrollable
      if (scrollHeight > clientHeight && scrollHeight > maxScrollHeight) {
        maxScrollHeight = scrollHeight;
        biggestElement = index;
      }

    });
    return {
      biggestElement: biggestElement ?? null,
      height: maxScrollHeight,
      width: document.documentElement.scrollWidth
    };
}

export var scrollToNeededLocation = async (tabId, height,index) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (y,index) => {
        let behavior =  y != 0?'smooth':'instant';
        document.querySelectorAll('*')[index].scrollTo({top: y, behavior});
      },
      args: [height,index]
    });
  } catch (error) {
    console.error("Error scrolling to location:", error);
  }

}