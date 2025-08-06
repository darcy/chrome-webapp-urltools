// This content script is loaded on all pages at document start
console.log('webapp-urltools: Content listener loaded');

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === 'show-modal') {
    showEditModal();
  } else if (request.action === 'show-notification') {
    showNotification();
  }
});

// Listen for keyboard shortcuts directly in the content script
document.addEventListener('keydown', (e) => {
  // Ctrl+Shift+E or Cmd+Shift+E
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
    e.preventDefault();
    console.log('Edit URL shortcut detected in content script');
    showEditModal();
  }
});

function showEditModal() {
  // Remove any existing modal
  const existingModal = document.getElementById('edit-url-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'edit-url-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:2147483647;display:flex;align-items:center;justify-content:center';
  
  const box = document.createElement('div');
  box.style.cssText = 'background:white;padding:20px;border-radius:8px;width:500px;max-width:90%';
  
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;gap:8px';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.value = window.location.href;
  input.style.cssText = 'flex:1;padding:10px;border:2px solid #ccc;border-radius:4px;font-size:14px;color:black;background:white;font-family:system-ui';
  
  const button = document.createElement('button');
  button.textContent = 'Go';
  button.style.cssText = 'padding:10px 20px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px';
  
  container.appendChild(input);
  container.appendChild(button);
  box.appendChild(container);
  modal.appendChild(box);
  document.body.appendChild(modal);
  
  input.focus();
  input.select();
  
  const navigate = () => {
    const url = input.value.trim();
    if (url) {
      if (url.includes('.') || url.startsWith('http') || url.startsWith('/')) {
        window.location.href = url.startsWith('http') ? url : 'https://' + url;
      } else {
        // Send search request to background
        chrome.runtime.sendMessage({ type: 'search', query: url });
      }
    }
    modal.remove();
  };
  
  button.addEventListener('click', navigate);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') navigate();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.remove();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function showNotification() {
  const notification = document.createElement('div');
  notification.textContent = 'URL copied!';
  notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:12px 20px;border-radius:4px;z-index:2147483647;font-size:14px;box-shadow:0 2px 5px rgba(0,0,0,0.2)';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}