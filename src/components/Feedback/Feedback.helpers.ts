export const closeSidePanel = () => {
  self?.close();
  window.parent.postMessage({ type: 'CLOSE_SIDE_PANEL' }, '*');
};

export const openDownloadFolder = () => {
  window.parent.postMessage({ type: 'OPEN_DOWNLOADS_FOLDER' }, '*');
};
