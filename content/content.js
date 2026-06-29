/**
 * Job Application Assistant - Main Content Script
 * Routes between Lever.co job description and application pages.
 * Injects match scoring UI or form auto-fill functionality accordingly.
 */

(function () {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /**
   * Main initialization.
   */
  function init() {
    const path = window.location.pathname;

    // Check if we're on a Lever.co job page
    if (!path.match(/^\/[^/]+\/[^/]+/)) {
      return; // Not a Lever job page
    }

    if (path.includes('/apply')) {
      // Application page - setup auto-fill
      setupAutoFill();
    } else {
      // Job description page - trigger match scoring
      runMatchScoring();
    }
  }

  /**
   * Run match scoring on JD page.
   * Extracts JD, gets CV, sends to background for scoring, displays result.
   */
  async function runMatchScoring() {
    // Wait a moment for page content to fully render
    await sleep(500);

    // Extract job description
    const jobData = JDExtractor.extract();
    if (!jobData || !jobData.description) {
      MatchScorer.showError('Could not extract job description from this page.');
      return;
    }

    // Get CV content
    try {
      const cvRes = await chrome.runtime.sendMessage({ type: 'GET_CV_CONTENT' });
      if (!cvRes.success || !cvRes.data) {
        MatchScorer.showError('No CV/reference document found. Please upload one in extension settings.');
        return;
      }

      const cvText = cvRes.data;

      // Check if API is configured
      const configRes = await chrome.runtime.sendMessage({ type: 'GET_API_CONFIG' });
      if (!configRes.success || !configRes.data.apiKey) {
        MatchScorer.showError('API key not configured. Please set up DeepSeek in extension settings.');
        return;
      }

      // Show loading state
      MatchScorer.showLoading();

      // Request scoring
      const scoreRes = await chrome.runtime.sendMessage({
        type: 'SCORE_MATCH',
        jobDescription: jobData.description,
        cvText: cvText
      });

      if (scoreRes.success && scoreRes.data) {
        MatchScorer.show(scoreRes.data);
        console.log('Match score result:', scoreRes.data);
      } else {
        MatchScorer.showError(scoreRes.error || 'Failed to get match score.');
      }
    } catch (err) {
      console.error('Match scoring error:', err);
      MatchScorer.showError('Error: ' + err.message);
    }
  }

  /**
   * Setup auto-fill on application page.
   * Adds the auto-fill button to the form.
   */
  function setupAutoFill() {
    // Wait for form to render
    const form = document.querySelector('#application-form');
    if (!form) {
      // Form might load later, observe DOM
      const observer = new MutationObserver(() => {
        if (document.querySelector('#application-form')) {
          observer.disconnect();
          addAutoFillButton();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return;
    }

    addAutoFillButton();
  }

  /**
   * Add the auto-fill button to the application page.
   */
  function addAutoFillButton() {
    const submitBtn = document.querySelector('button[type="submit"]');
    const form = document.querySelector('#application-form');

    if (!form) return;

    // Create button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'jaa-autofill-btn';
    btn.innerHTML = '✨ Auto-Fill with AI';

    // Add result div
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = 'margin: 8px 0; font-size: 13px;';

    // Insert before submit button area
    if (submitBtn) {
      submitBtn.parentNode.insertBefore(btn, submitBtn);
      submitBtn.parentNode.insertBefore(resultDiv, submitBtn);
    } else {
      form.appendChild(btn);
      form.appendChild(resultDiv);
    }

    // Handle click
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.innerHTML = '⏳ Auto-Filling...';
      resultDiv.innerHTML = '';
      resultDiv.style.color = '#666';

      try {
        const results = await FormFiller.autoFill();

        if (results.errors.length > 0) {
          resultDiv.innerHTML = `
            <span style="color:#166534;">✅ Filled ${results.filled}/${results.total} fields</span><br>
            <span style="color:#991b1b;font-size:12px;">⚠️ ${results.errors.length} errors: ${results.errors.slice(0, 3).join('; ')}</span>
          `;
        } else {
          resultDiv.innerHTML = `<span style="color:#166534;font-weight:500;">✅ Successfully filled ${results.filled}/${results.total} fields</span>`;
        }

        btn.innerHTML = '✅ Re-Fill';
      } catch (err) {
        resultDiv.innerHTML = `<span style="color:#991b1b;">❌ Error: ${err.message}</span>`;
        btn.innerHTML = '✨ Auto-Fill with AI';
      }

      btn.disabled = false;
    });
  }

  /**
   * Utility: sleep for ms.
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Log that content script loaded
  console.log('Job Application Assistant: Content script loaded');
})();