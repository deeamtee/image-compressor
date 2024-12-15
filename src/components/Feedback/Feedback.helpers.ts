export const closeSidePanel = () => {
  window.close();
};

export const openDownloadFolder = () => {
  window.parent.postMessage({ type: 'OPEN_DOWNLOADS_FOLDER' }, '*');
};
