chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.setUninstallURL(
    'https://docs.google.com/forms/d/e/1FAIpQLSdAAV6IBIHDXTmQ13EhoUhKfxs7p4UEphGcDxw9n-rl72Jk6A/viewform?usp=sf_link'
  );
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://image-compressor-landing.vercel.app/instructions' });
  }
});
