let creating;

async function setupOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['CLIPBOARD'],
      justification: 'Write URL to clipboard',
    });
    await creating;
    creating = null;
  }
}

chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log('Active tab:', tab?.url, 'Tab ID:', tab?.id);
  
  if (command === 'copy-url') {
    if (tab && tab.url) {
      await setupOffscreenDocument('offscreen.html');
      
      chrome.runtime.sendMessage({
        type: 'copy-to-clipboard',
        text: tab.url,
        title: tab.title || 'Untitled'
      });
      
      // Inject content script to show notification
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['notification.js']
        });
      } catch (err) {
        console.error('Could not inject notification script:', err);
      }
    }
  } else if (command === 'edit-url') {
    // Try to send message to content script first
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'show-modal' });
      console.log('Sent show-modal message to content script');
    } catch (err) {
      console.error('Could not send message to content script:', err);
      
      // Fallback: try injecting modal.js
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['modal.js']
        });
        console.log('Modal injected via executeScript');
      } catch (injectErr) {
        console.error('Could not inject modal:', injectErr);
        // Last resort: open as a new tab
        chrome.tabs.create({
          url: 'popup.html',
          active: true
        });
      }
    }
  }
});

// Handle search requests from the modal
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'search') {
    chrome.search.query({
      text: request.query,
      tabId: sender.tab.id
    });
  }
});