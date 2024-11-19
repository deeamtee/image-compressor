document.addEventListener('dragenter', (event) => {
  chrome.runtime.sendMessage({
    type: 'dragenter',
  });
});

document.addEventListener('dragover', (event) => {
  chrome.runtime.sendMessage({
    type: 'dragover',
  });
});

document.addEventListener('dragend', (event) => {
  chrome.runtime.sendMessage({
    type: 'dragend',
  });
});

document.addEventListener('dragstart', (event) => {
  chrome.runtime.sendMessage({
    type: 'dragstart',
  });
});

// проверка успешной загрузки
console.log('content.js');
