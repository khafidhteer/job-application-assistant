/**
 * Popup Script
 * Shows quick status and provides shortcuts to settings.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Check API config status
  try {
    const configRes = await chrome.runtime.sendMessage({ type: 'GET_API_CONFIG' });
    const apiStatus = document.getElementById('api-status');
    if (configRes.success && configRes.data.apiKey) {
      apiStatus.textContent = 'Configured';
      apiStatus.className = 'status-value status-ok';
    } else {
      apiStatus.textContent = 'Not Set';
      apiStatus.className = 'status-value status-missing';
    }
  } catch (err) {
    document.getElementById('api-status').textContent = 'Error';
    document.getElementById('api-status').className = 'status-value status-missing';
  }

  // Check CV content status
  try {
    const cvRes = await chrome.runtime.sendMessage({ type: 'GET_CV_CONTENT' });
    const cvStatus = document.getElementById('cv-status');
    if (cvRes.success && cvRes.data) {
      const lines = cvRes.data.split('\n').length;
      cvStatus.textContent = `Loaded (${lines} lines)`;
      cvStatus.className = 'status-value status-ok';
    } else {
      cvStatus.textContent = 'Not Loaded';
      cvStatus.className = 'status-value status-missing';
    }
  } catch (err) {
    document.getElementById('cv-status').textContent = 'Error';
    document.getElementById('cv-status').className = 'status-value status-missing';
  }

  // Check current page
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const pageInfo = document.getElementById('page-type');
    if (tab && tab.url) {
      if (tab.url.includes('jobs.lever.co')) {
        if (tab.url.includes('/apply')) {
          pageInfo.textContent = 'On Lever.co application page - Auto-fill available';
        } else {
          pageInfo.textContent = 'On Lever.co job posting - Match scoring available';
        }
      } else {
        pageInfo.textContent = 'Not on a Lever.co job page';
      }
    }
  } catch (err) {
    document.getElementById('page-type').textContent = 'Could not determine page';
  }

  // Open settings
  document.getElementById('open-settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Re-check page (reload current tab)
  document.getElementById('recheck-page').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.reload(tab.id);
      window.close();
    }
  });
});