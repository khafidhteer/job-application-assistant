/**
 * Options Page Script
 * Handles all settings tabs: API config, CV upload, profile, default answers.
 */

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// Load all settings on page open
document.addEventListener('DOMContentLoaded', async () => {
  await loadApiConfig();
  await loadCvContent();
  await loadProfile();
  await loadDefaultAnswers();
});

/**
 * Show a status message for a specific section.
 */
function showStatus(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = 'status-message ' + (isError ? 'error' : 'success');
  setTimeout(() => { el.textContent = ''; el.className = 'status-message'; }, 4000);
}

// ─── API Configuration ──────────────────────────────────────────

async function loadApiConfig() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_API_CONFIG' });
    if (response.success && response.data) {
      document.getElementById('api-base-url').value = response.data.baseUrl || 'https://api.deepseek.com/v1';
      document.getElementById('api-key').value = response.data.apiKey || '';
      document.getElementById('api-model').value = response.data.model || 'deepseek-chat';
    }
  } catch (err) {
    console.error('Failed to load API config:', err);
  }
}

document.getElementById('save-api').addEventListener('click', async () => {
  const config = {
    baseUrl: document.getElementById('api-base-url').value.trim() || 'https://api.deepseek.com/v1',
    apiKey: document.getElementById('api-key').value.trim(),
    model: document.getElementById('api-model').value.trim() || 'deepseek-chat'
  };

  if (!config.apiKey) {
    showStatus('api-status', 'Please enter an API key', true);
    return;
  }

  try {
    await chrome.runtime.sendMessage({ type: 'SET_STORAGE', data: { deepseek: config } });
    showStatus('api-status', 'API settings saved successfully!');
  } catch (err) {
    showStatus('api-status', 'Failed to save: ' + err.message, true);
  }
});

// ─── CV & Reference ─────────────────────────────────────────────

async function loadCvContent() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_CV_CONTENT' });
    if (response.success) {
      document.getElementById('cv-content').value = response.data || '';
    }
  } catch (err) {
    console.error('Failed to load CV content:', err);
  }
}

// Handle file upload
document.getElementById('cv-file').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('cv-content').value = e.target.result;
  };
  reader.readAsText(file);
});

document.getElementById('save-cv').addEventListener('click', async () => {
  const content = document.getElementById('cv-content').value.trim();

  if (!content) {
    showStatus('cv-status', 'Please enter or upload CV content', true);
    return;
  }

  try {
    await chrome.runtime.sendMessage({ type: 'SET_STORAGE', data: { cvContent: content } });
    showStatus('cv-status', 'CV content saved successfully!');
  } catch (err) {
    showStatus('cv-status', 'Failed to save: ' + err.message, true);
  }
});

// ─── Profile ────────────────────────────────────────────────────

async function loadProfile() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });
    if (response.success && response.data) {
      const p = response.data;
      document.getElementById('profile-name').value = p.name || '';
      document.getElementById('profile-email').value = p.email || '';
      document.getElementById('profile-phone').value = p.phone || '';
      document.getElementById('profile-location').value = p.location || '';
      document.getElementById('profile-company').value = p.currentCompany || '';
      document.getElementById('profile-linkedin').value = p.linkedinUrl || '';
      document.getElementById('profile-github').value = p.githubUrl || '';
      document.getElementById('profile-portfolio').value = p.portfolioUrl || '';
      document.getElementById('profile-other').value = p.otherUrl || '';
    }
  } catch (err) {
    console.error('Failed to load profile:', err);
  }
}

document.getElementById('save-profile').addEventListener('click', async () => {
  const profile = {
    name: document.getElementById('profile-name').value.trim(),
    email: document.getElementById('profile-email').value.trim(),
    phone: document.getElementById('profile-phone').value.trim(),
    location: document.getElementById('profile-location').value.trim(),
    currentCompany: document.getElementById('profile-company').value.trim(),
    linkedinUrl: document.getElementById('profile-linkedin').value.trim(),
    githubUrl: document.getElementById('profile-github').value.trim(),
    portfolioUrl: document.getElementById('profile-portfolio').value.trim(),
    otherUrl: document.getElementById('profile-other').value.trim()
  };

  try {
    await chrome.runtime.sendMessage({ type: 'SET_STORAGE', data: { profile } });
    showStatus('profile-status', 'Profile saved successfully!');
  } catch (err) {
    showStatus('profile-status', 'Failed to save: ' + err.message, true);
  }
});

// ─── Default Answers ────────────────────────────────────────────

async function loadDefaultAnswers() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_DEFAULT_ANSWERS' });
    if (response.success && response.data) {
      const a = response.data;
      document.getElementById('answer-work-auth').value = a.workAuthorization || '';
      document.getElementById('answer-salary').value = a.desiredSalary || '';
      document.getElementById('answer-start-date').value = a.startDate || '';
      document.getElementById('answer-holidays').value = a.holidaysLeave || '';
      document.getElementById('answer-notes').value = a.additionalNotes || '';
    }
  } catch (err) {
    console.error('Failed to load default answers:', err);
  }
}

document.getElementById('save-answers').addEventListener('click', async () => {
  const answers = {
    workAuthorization: document.getElementById('answer-work-auth').value.trim(),
    desiredSalary: document.getElementById('answer-salary').value.trim(),
    startDate: document.getElementById('answer-start-date').value.trim(),
    holidaysLeave: document.getElementById('answer-holidays').value.trim(),
    additionalNotes: document.getElementById('answer-notes').value.trim()
  };

  try {
    await chrome.runtime.sendMessage({ type: 'SET_STORAGE', data: { defaultAnswers: answers } });
    showStatus('answers-status', 'Default answers saved successfully!');
  } catch (err) {
    showStatus('answers-status', 'Failed to save: ' + err.message, true);
  }
});