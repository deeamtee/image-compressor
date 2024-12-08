export const closeSidePanel = () => {
  window.close();
};

export const openDownloadFolder = () => {
  chrome.downloads?.search({}, (downloads) => {
    if (downloads.length > 0) {
      const lastDownload = downloads[0];
      chrome.downloads.show(lastDownload.id);
    }
  });
};
