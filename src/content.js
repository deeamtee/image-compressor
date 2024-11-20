document.addEventListener('dragenter', (event) => {
  chrome.runtime.sendMessage({
    type: 'dragenter',
  });
});

document.addEventListener('dragend', (event) => {
  chrome.runtime.sendMessage({
    type: 'dragend',
  });
});
