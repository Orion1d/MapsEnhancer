// Popup script for Google Maps Image Quality Fix
// Handles popup interface and communicates with background script

document.addEventListener('DOMContentLoaded', function() {
    const pageStatus = document.getElementById('pageStatus');
    const qualityStatus = document.getElementById('qualityStatus');
    const autoFixStatus = document.getElementById('autoFixStatus');
    const fixButton = document.getElementById('fixButton');
    const loading = document.getElementById('loading');

    // Function to update status display
    function updateStatus(statusData) {
        // Update page status
        if (statusData.isSatelliteView) {
            pageStatus.textContent = 'Google Maps';
            pageStatus.className = 'status-value status-good';
        } else {
            pageStatus.textContent = 'Other Page';
            pageStatus.className = 'status-value status-bad';
        }

        // Update quality status
        if (statusData.isSatelliteView) {
            if (statusData.hasGlParameter) {
                qualityStatus.textContent = 'High Quality';
                qualityStatus.className = 'status-value status-good';
            } else {
                qualityStatus.textContent = 'Low Quality';
                qualityStatus.className = 'status-value status-warning';
            }
        } else {
            qualityStatus.textContent = 'N/A';
            qualityStatus.className = 'status-value';
        }

        // Update button state
        if (statusData.isSatelliteView && !statusData.hasGlParameter) {
            fixButton.disabled = false;
            fixButton.textContent = 'Fix Current URL';
        } else if (statusData.isSatelliteView && statusData.hasGlParameter) {
            fixButton.disabled = true;
            fixButton.textContent = 'Already Fixed';
        } else {
            fixButton.disabled = true;
            fixButton.textContent = 'Not Google Maps';
        }
    }

    // Function to show loading state
    function showLoading() {
        loading.style.display = 'block';
        fixButton.disabled = true;
    }

    // Function to hide loading state
    function hideLoading() {
        loading.style.display = 'none';
    }

    // Function to check current tab status
    function checkCurrentTabStatus() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                const currentTab = tabs[0];
                
                // Check if it's a Google Maps page
                if (currentTab.url && currentTab.url.includes('google.com/maps')) {
                    // Send message to content script to get detailed status
                    chrome.tabs.sendMessage(currentTab.id, { action: 'getPageStatus' }, function(response) {
                        if (chrome.runtime.lastError) {
                            // Content script not ready or not a maps page
                            updateStatus({
                                isSatelliteView: false,
                                hasGlParameter: false,
                                currentUrl: currentTab.url
                            });
                        } else if (response) {
                            updateStatus(response);
                        }
                    });
                } else {
                    // Not a Google Maps page
                    updateStatus({
                        isSatelliteView: false,
                        hasGlParameter: false,
                        currentUrl: currentTab.url || 'Unknown'
                    });
                }
            }
        });
    }

    // Function to fix current URL
    function fixCurrentUrl() {
        showLoading();
        
        // Add timeout protection
        const timeoutId = setTimeout(() => {
            hideLoading();
            qualityStatus.textContent = 'Timeout Error';
            qualityStatus.className = 'status-value status-bad';
            setTimeout(() => checkCurrentTabStatus(), 3000);
        }, 10000); // 10 second timeout
        
        chrome.runtime.sendMessage({ action: 'fixCurrentUrl' }, function(response) {
            clearTimeout(timeoutId);
            hideLoading();
            
            if (chrome.runtime.lastError) {
                // Handle runtime error
                qualityStatus.textContent = 'Runtime Error';
                qualityStatus.className = 'status-value status-bad';
                setTimeout(() => checkCurrentTabStatus(), 3000);
                return;
            }
            
            if (response && response.success) {
                // Show success message
                qualityStatus.textContent = 'Fixing...';
                qualityStatus.className = 'status-value status-warning';
                
                // Wait a moment and then refresh status
                setTimeout(() => {
                    checkCurrentTabStatus();
                }, 1000);
            } else {
                // Show error message
                const errorMessage = response ? response.message : 'Unknown error occurred';
                qualityStatus.textContent = 'Error';
                qualityStatus.className = 'status-value status-bad';
                
                // Reset after 3 seconds
                setTimeout(() => {
                    checkCurrentTabStatus();
                }, 3000);
            }
        });
    }

    // Event listeners
    fixButton.addEventListener('click', fixCurrentUrl);

    // Check status when popup opens
    checkCurrentTabStatus();

    // Listen for tab updates
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            // Refresh status if this is the current tab
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (tabs[0] && tabs[0].id === tabId) {
                    setTimeout(checkCurrentTabStatus, 500);
                }
            });
        }
    });

    // Listen for tab activation
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        setTimeout(checkCurrentTabStatus, 100);
    });
});
