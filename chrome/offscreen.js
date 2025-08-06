chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'copy-to-clipboard') {
    const url = message.text;
    const title = message.title;
    
    // Use the clipboardData API via a copy event
    const copyHandler = (e) => {
      e.preventDefault();
      
      // Set plain text format (for terminal, plain editors)
      e.clipboardData.setData('text/plain', url);
      
      // Set HTML format (for rich editors like Logseq)
      e.clipboardData.setData('text/html', `<a href="${url}">${title}</a>`);
      
      console.log('Rich clipboard set with both formats');
    };
    
    // Add the copy event handler
    document.addEventListener('copy', copyHandler);
    
    try {
      // Trigger the copy
      document.execCommand('copy');
      console.log('Successfully copied with both formats');
    } catch (err) {
      console.error('Copy failed:', err);
      
      // Fallback to plain text only
      document.removeEventListener('copy', copyHandler);
      
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        console.log('URL copied to clipboard (plain text fallback):', url);
      } catch (err2) {
        console.error('Fallback also failed:', err2);
      } finally {
        textArea.remove();
      }
    } finally {
      // Clean up the event handler
      document.removeEventListener('copy', copyHandler);
    }
  }
});