/**
 * Chrome Storage Wrapper
 * Centralized access to chrome.storage.local for the extension.
 */
const Storage = {
  /**
   * Get values from storage by keys.
   * @param {string|string[]} keys - Single key or array of keys. Empty array returns all.
   * @returns {Promise<Object>} Object with requested key-value pairs.
   */
  get(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  },

  /**
   * Set values in storage.
   * @param {Object} data - Key-value pairs to store.
   * @returns {Promise<void>}
   */
  set(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  },

  /**
   * Remove keys from storage.
   * @param {string|string[]} keys - Key(s) to remove.
   * @returns {Promise<void>}
   */
  remove(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, () => {
        resolve();
      });
    });
  },

  /**
   * Clear all extension storage.
   * @returns {Promise<void>}
   */
  clear() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
  },

  /**
   * Get all stored data (for debugging/export).
   * @returns {Promise<Object>}
   */
  getAll() {
    return this.get(null);
  },

  /**
   * Get DeepSeek API configuration.
   * @returns {Promise<Object>} { baseUrl, apiKey, model }
   */
  async getApiConfig() {
    const result = await this.get('deepseek');
    return result.deepseek || { baseUrl: 'https://api.deepseek.com/v1', apiKey: '', model: 'deepseek-chat' };
  },

  /**
   * Save DeepSeek API configuration.
   * @param {Object} config - { baseUrl, apiKey, model }
   */
  async setApiConfig(config) {
    await this.set({ deepseek: config });
  },

  /**
   * Get CV/reference markdown content.
   * @returns {Promise<string>}
   */
  async getCvContent() {
    const result = await this.get('cvContent');
    return result.cvContent || '';
  },

  /**
   * Save CV/reference markdown content.
   * @param {string} content - Markdown content.
   */
  async setCvContent(content) {
    await this.set({ cvContent: content });
  },

  /**
   * Get user profile for form filling.
   * @returns {Promise<Object>}
   */
  async getProfile() {
    const result = await this.get('profile');
    return result.profile || {
      name: '',
      email: '',
      phone: '',
      location: '',
      currentCompany: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
      otherUrl: ''
    };
  },

  /**
   * Save user profile.
   * @param {Object} profile
   */
  async setProfile(profile) {
    await this.set({ profile });
  },

  /**
   * Get default answers for screening questions.
   * @returns {Promise<Object>}
   */
  async getDefaultAnswers() {
    const result = await this.get('defaultAnswers');
    return result.defaultAnswers || {
      workAuthorization: '',
      desiredSalary: '',
      startDate: '',
      holidaysLeave: '',
      additionalNotes: ''
    };
  },

  /**
   * Save default answers.
   * @param {Object} answers
   */
  async setDefaultAnswers(answers) {
    await this.set({ defaultAnswers: answers });
  }
};