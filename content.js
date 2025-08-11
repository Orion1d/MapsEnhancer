// Content script for Google Maps Image Quality Fix
// Runs on Google Maps pages to provide user feedback and additional functionality

// Flag to prevent multiple status indicators
let statusIndicatorCreated = false;

// Function to check if current page is a Google Maps satellite view
function isCurrentPageSatelliteView() {
  return window.location.href.includes('google.com/maps') && 
         window.location.href.includes('!3m1!1e3');
}

// Function to check if gl=es parameter is present
function hasGlParameter() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('gl') === 'es';
}

// Function to create clean status indicator
function createStatusIndicator() {
  // Prevent multiple indicators
  if (statusIndicatorCreated || !isCurrentPageSatelliteView()) {
    return;
  }
  
  statusIndicatorCreated = true;

  // Remove existing indicator if present
  const existingIndicator = document.getElementById('gm-quality-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }

  // Create status indicator
  const indicator = document.createElement('div');
  indicator.id = 'gm-quality-indicator';
                                         indicator.style.cssText = `
             position: fixed;
             top: 20px;
             right: 20px;
             background: #fbfafb;
             color: #0f172a;
             padding: 12px 18px;
             border-radius: 16px;
             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
             font-size: 14px;
             font-weight: 500;
             z-index: 10000;
             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
             transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
             opacity: 0;
             transform: translateY(-10px);
             border: 1px solid #e2e8f0;
           `;

  // Start with "fixing" status
  indicator.innerHTML = '🔧 Processing Image Quality...';

  // Add to page
  document.body.appendChild(indicator);
  
  // Smooth entrance animation
  requestAnimationFrame(() => {
    indicator.style.opacity = '1';
    indicator.style.transform = 'translateY(0)';
  });

  // Simulate background processing - show "fixing" for 2 seconds
  setTimeout(() => {
    if (indicator.parentNode) {
                                // Update to "fixed" status with smooth transition
              indicator.innerHTML = '✅ High Quality Images Active';
              indicator.style.background = '#ecfdf5';
              indicator.style.borderColor = '#059669';
              indicator.style.color = '#059669';
      
      // Auto-hide after 1.5 seconds
      setTimeout(() => {
        if (indicator.parentNode) {
          // Smooth exit animation
          indicator.style.opacity = '0';
          indicator.style.transform = 'translateY(-10px)';
          setTimeout(() => {
            if (indicator.parentNode) {
              indicator.remove();
            }
          }, 300);
        }
      }, 1500);
    }
  }, 2000);
}

// Function to show clean notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
                       notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: ${type === 'success' ? '#ecfdf5' : '#fffbeb'};
            color: ${type === 'success' ? '#059669' : '#d97706'};
            padding: 16px 24px;
            border-radius: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 16px;
            font-weight: 500;
            z-index: 10001;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 320px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
            border: 1px solid ${type === 'success' ? '#059669' : '#d97706'};
          `;
  
  notification.textContent = message;
  document.body.appendChild(notification);

  // Smooth entrance
  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  // Auto-remove after 3 seconds with smooth exit
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 3000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showNotification') {
    showNotification(request.message, request.type);
  }
});

// Initialize immediately when script loads
createStatusIndicator();

// Also initialize when page loads if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createStatusIndicator);
} else {
  createStatusIndicator();
}

// Reset flag when page unloads to allow recreation on navigation
window.addEventListener('beforeunload', () => {
  statusIndicatorCreated = false;
});

// Listen for popup messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageStatus') {
    sendResponse({
      isSatelliteView: isCurrentPageSatelliteView(),
      hasGlParameter: hasGlParameter(),
      currentUrl: window.location.href
    });
  } else if (request.action === 'resetStatusIndicator') {
    // Allow popup to reset the status indicator if needed
    statusIndicatorCreated = false;
    createStatusIndicator();
    sendResponse({ success: true });
  }
});
