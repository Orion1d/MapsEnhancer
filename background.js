// Background script for Google Maps Image Quality Fix
// Automatically adds gl=es parameter to Google Maps URLs

// Track which tabs have already been fixed in this session
const fixedTabs = new Set();

// Cache of processed URLs to prevent duplicate processing
const processedUrls = new Set();

// Function to check if URL is a Google Maps satellite view
function isGoogleMapsSatelliteView(url) {
  // More strict validation - must be a proper Google Maps URL
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    
    // Must be Google Maps domain
    if (!urlObj.hostname.includes('google.com') && !urlObj.hostname.includes('maps.google.com')) {
      return false;
    }
    
    // Must have /maps/ path
    if (!urlObj.pathname.includes('/maps/')) {
      return false;
    }
    
    // Must be satellite view
    if (!url.includes('!3m1!1e3')) {
      return false;
    }
    
    // Additional safety check - URL should be reasonably formed
    if (url.length < 20 || url.includes('NaN')) {
      console.log('Rejected URL - too short or contains NaN:', url);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating URL:', error, url);
    return false;
  }
}

// Function to add or update gl=es parameter
function addGlParameter(url) {
  try {
    // Additional safety check before processing
    if (!url || typeof url !== 'string' || url.includes('NaN')) {
      console.log('Rejected URL for modification - contains NaN or invalid:', url);
      return null;
    }
    
    const urlObj = new URL(url);
    
    // Verify the URL is still valid after parsing
    if (!urlObj.hostname || !urlObj.pathname) {
      console.log('Rejected URL - invalid structure after parsing:', url);
      return null;
    }
    
    // Check if gl parameter already exists and is 'es'
    if (urlObj.searchParams.get('gl') === 'es') {
      return null; // No change needed
    }
    
    // Add or update gl parameter to 'es'
    urlObj.searchParams.set('gl', 'es');
    
    const result = urlObj.toString();
    
    // Final safety check - ensure the result is valid
    if (result.includes('NaN') || result.length < 20) {
      console.log('Rejected modified URL - contains NaN or too short:', result);
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('Error parsing URL:', error, url);
    return null;
  }
}

// Function to fix URL if needed with realistic delay
function fixUrlIfNeeded(tabId, url) {
  console.log('fixUrlIfNeeded called for tab:', tabId, 'URL:', url);
  
  if (!url || !isGoogleMapsSatelliteView(url)) {
    console.log('URL rejected - not a valid Google Maps satellite view');
    return; // Not a Google Maps satellite view
  }
  
  // Check if this tab has already been fixed in this session
  if (fixedTabs.has(tabId)) {
    console.log('Tab already fixed in this session');
    return; // Already fixed, don't refresh again
  }
  
  // Check if this exact URL has already been processed
  if (processedUrls.has(url)) {
    console.log('URL already processed:', url);
    return; // Already processed this URL
  }
  
  console.log('Processing URL for modification:', url);
  const fixedUrl = addGlParameter(url);
  
  if (fixedUrl && fixedUrl !== url) {
    console.log('URL will be updated from:', url);
    console.log('To:', fixedUrl);
    
    // Mark this tab as fixed immediately to prevent multiple calls
    fixedTabs.add(tabId);
    
    // Mark this URL as processed
    processedUrls.add(url);
    
    // Add 2-second delay to match the visual progression in content script
    setTimeout(() => {
      // Double-check the tab still exists and hasn't been closed
      chrome.tabs.get(tabId, (tab) => {
        if (tab && !chrome.runtime.lastError) {
          console.log('Updating tab URL to:', fixedUrl);
          chrome.tabs.update(tabId, { url: fixedUrl });
        }
      });
    }, 2000);
  } else {
    console.log('No URL modification needed or modification failed');
  }
}

// Function to check and fix current tab immediately
function checkCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      fixUrlIfNeeded(tabs[0].id, tabs[0].url);
    }
  });
}

// Listen for navigation events - when pages complete loading
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) { // Main frame only
    fixUrlIfNeeded(details.tabId, details.url);
  }
});

// Listen for tab updates - catches page refreshes and content changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    fixUrlIfNeeded(tabId, tab.url);
  }
});

// Listen for tab activation - when switching between tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      fixUrlIfNeeded(tab.id, tab.url);
    }
  });
});

// Listen for tab focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    checkCurrentTab();
  }
});

// Listen for extension startup
chrome.runtime.onStartup.addListener(() => {
  checkCurrentTab();
});

// Listen for extension installation/update
chrome.runtime.onInstalled.addListener(() => {
  checkCurrentTab();
});

// Clean up fixed tabs when they're closed
chrome.tabs.onRemoved.addListener((tabId) => {
  fixedTabs.delete(tabId);
  
  // Clean up processed URLs for this tab (optional - keeps memory usage low)
  // Note: This is a simple cleanup, in a production app you might want more sophisticated cleanup
  if (processedUrls.size > 1000) {
    // If cache gets too large, clear it
    console.log('Clearing URL cache due to size:', processedUrls.size);
    processedUrls.clear();
  }
});

// Handle manual fix request from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fixCurrentUrl') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        const url = tabs[0].url;
        
        if (isGoogleMapsSatelliteView(url)) {
          const fixedUrl = addGlParameter(url);
          
          if (fixedUrl && fixedUrl !== url) {
            // Mark this tab as fixed
            fixedTabs.add(tabs[0].id);
            
            chrome.tabs.update(tabs[0].id, { url: fixedUrl });
            sendResponse({ success: true, message: 'URL fixed successfully!' });
          } else {
            sendResponse({ success: false, message: 'URL already has gl=es parameter or is not a satellite view.' });
          }
        } else {
          sendResponse({ success: false, message: 'Current page is not a Google Maps satellite view.' });
        }
      } else {
        sendResponse({ success: false, message: 'No active tab found.' });
      }
    });
    
    return true; // Keep message channel open for async response
  }
});
