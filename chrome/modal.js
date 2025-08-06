(() => {
  // Remove any existing modal
  const existingModal = document.getElementById('edit-url-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'edit-url-modal';
  modal.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: rgba(0, 0, 0, 0.5) !important;
    z-index: 999999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    animation: fadeIn 0.2s ease-out;
  `;
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white !important;
    border-radius: 8px !important;
    padding: 20px !important;
    width: 500px !important;
    max-width: 90% !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
    animation: slideIn 0.2s ease-out;
  `;
  
  // Create input container
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex !important;
    gap: 8px !important;
  `;
  
  // Create input
  const input = document.createElement('input');
  input.type = 'text';
  input.value = window.location.href;
  input.style.cssText = `
    flex: 1;
    padding: 10px;
    border: 2px solid #ccc !important;
    border-radius: 4px;
    font-size: 14px !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    color: #000 !important;
    background-color: #fff !important;
    line-height: normal !important;
    box-sizing: border-box !important;
  `;
  
  // Create button
  const button = document.createElement('button');
  button.textContent = 'Go';
  button.style.cssText = `
    padding: 10px 20px;
    background-color: #4CAF50 !important;
    color: white !important;
    border: none !important;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px !important;
    font-weight: 500 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    line-height: normal !important;
    box-sizing: border-box !important;
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    #edit-url-modal input:focus {
      outline: none !important;
      border-color: #4CAF50 !important;
    }
    #edit-url-modal button:hover {
      background-color: #45a049 !important;
    }
  `;
  document.head.appendChild(style);
  
  // Assemble modal
  container.appendChild(input);
  container.appendChild(button);
  modalContent.appendChild(container);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Focus and select input
  input.focus();
  input.select();
  
  // Navigate function
  const navigate = () => {
    let url = input.value.trim();
    
    if (!url) {
      input.style.borderColor = 'red';
      return;
    }
    
    const isLikelyUrl = (str) => {
      return str.match(/^https?:\/\//) || 
             str.includes('.') || 
             str.startsWith('/') || 
             str.includes(':');
    };
    
    if (isLikelyUrl(url)) {
      if (!url.match(/^https?:\/\//) && url.includes('.') && !url.startsWith('/')) {
        url = 'https://' + url;
      }
      window.location.href = url;
    } else {
      // Use Chrome's search
      chrome.runtime.sendMessage({
        type: 'search',
        query: url
      });
    }
    
    modal.remove();
    style.remove();
  };
  
  // Event handlers
  button.addEventListener('click', navigate);
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      navigate();
    }
  });
  
  // Close on escape or click outside
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      style.remove();
    }
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      style.remove();
    }
  });
  
  input.addEventListener('input', () => {
    input.style.borderColor = '';
  });
})();