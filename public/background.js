chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'dragenter' || message.type === 'dragover' || message.type === 'dragend') {
    chrome.runtime.sendMessage(message);
  }
});
