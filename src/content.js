document.addEventListener('dragenter', (event) => {
  chrome.runtime.sendMessage({
    type: 'dragenter',
  });
});

document.addEventListener('dragstart', (event) => {
  chrome.runtime.sendMessage({
    type: 'dragstart',
  });
});
