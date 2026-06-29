/**
 * Match Scorer UI
 * Displays a floating panel with the CV-job match score on Lever JD pages.
 */

const MatchScorer = {
  panelEl: null,
  minimized: false,

  /**
   * Show the floating score panel.
   * @param {Object} scoreData - { skillsMatch, experienceLevel, domainKnowledge, culturalFit, growthPotential, backgroundAlignment, overallScore, summary }
   */
  show(scoreData) {
    this.remove(); // Remove existing panel if any
    this.createPanel(scoreData);
  },

  /**
   * Show loading state while waiting for API response.
   */
  showLoading() {
    this.remove();
    this.panelEl = document.createElement('div');
    this.panelEl.className = 'jaa-score-panel';

    this.panelEl.innerHTML = `
      <div class="jaa-panel-header">
        <h3>📊 Match Analysis</h3>
        <div class="jaa-panel-controls">
          <button class="jaa-close-btn" title="Close">✕</button>
        </div>
      </div>
      <div class="jaa-panel-body">
        <div class="jaa-loading">
          <div class="jaa-spinner"></div>
          <div>Analyzing match...</div>
        </div>
      </div>
    `;

    this.panelEl.querySelector('.jaa-close-btn').addEventListener('click', () => this.remove());
    document.body.appendChild(this.panelEl);
  },

  /**
   * Show error state.
   * @param {string} message - Error message to display
   */
  showError(message) {
    if (!this.panelEl) {
      this.panelEl = document.createElement('div');
      this.panelEl.className = 'jaa-score-panel';
      this.panelEl.innerHTML = `
        <div class="jaa-panel-header">
          <h3>📊 Match Analysis</h3>
          <div class="jaa-panel-controls">
            <button class="jaa-close-btn" title="Close">✕</button>
          </div>
        </div>
        <div class="jaa-panel-body"></div>
      `;
      this.panelEl.querySelector('.jaa-close-btn').addEventListener('click', () => this.remove());
      document.body.appendChild(this.panelEl);
    }

    const body = this.panelEl.querySelector('.jaa-panel-body');
    body.innerHTML = `<div class="jaa-error">⚠️ ${this.escapeHtml(message)}</div>`;
  },

  /**
   * Create the score panel with data.
   */
  createPanel(scoreData) {
    this.panelEl = document.createElement('div');
    this.panelEl.className = 'jaa-score-panel';

    const overall = scoreData.overallScore || 0;
    const scoreClass = overall >= 80 ? 'jaa-score-high' : overall >= 60 ? 'jaa-score-medium' : 'jaa-score-low';

    // Build dimensions HTML
    const dimensions = [
      { key: 'skillsMatch', name: 'Skills Match', weight: '35%' },
      { key: 'experienceLevel', name: 'Experience Level', weight: '25%' },
      { key: 'domainKnowledge', name: 'Domain Knowledge', weight: '15%' },
      { key: 'culturalFit', name: 'Cultural Fit', weight: '10%' },
      { key: 'growthPotential', name: 'Growth Potential', weight: '10%' },
      { key: 'backgroundAlignment', name: 'Background Alignment', weight: '5%' }
    ];

    let dimensionsHtml = '';
    dimensions.forEach(dim => {
      const data = scoreData[dim.key] || { score: 0, rationale: 'N/A' };
      const score = data.score || 0;
      const barColor = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';

      dimensionsHtml += `
        <div class="jaa-dimension">
          <div class="jaa-dimension-header">
            <span class="jaa-dimension-name">${dim.name} <span style="color:#999;font-size:11px;">(${dim.weight})</span></span>
            <span class="jaa-dimension-score" style="color:${barColor}">${score}/100</span>
          </div>
          <div class="jaa-dimension-bar">
            <div class="jaa-dimension-fill" style="width:${score}%;background:${barColor}"></div>
          </div>
          <div class="jaa-dimension-rationale">${this.escapeHtml(data.rationale || '')}</div>
        </div>
      `;
    });

    this.panelEl.innerHTML = `
      <div class="jaa-panel-header">
        <h3>📊 Match Analysis</h3>
        <div class="jaa-panel-controls">
          <button class="jaa-minimize-btn" title="Minimize">_</button>
          <button class="jaa-close-btn" title="Close">✕</button>
        </div>
      </div>
      <div class="jaa-panel-body">
        <div class="jaa-overall-score ${scoreClass}">
          <div class="jaa-score-number">${overall}</div>
          <div class="jaa-score-label">
            ${overall >= 80 ? 'Strong Match' : overall >= 60 ? 'Moderate Match' : 'Weak Match'}
          </div>
        </div>
        <div class="jaa-dimensions">
          ${dimensionsHtml}
        </div>
        <div class="jaa-summary">
          <strong>Summary:</strong> ${this.escapeHtml(scoreData.summary || '')}
        </div>
      </div>
    `;

    // Event listeners
    const header = this.panelEl.querySelector('.jaa-panel-header');
    header.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        this.toggleMinimize();
      }
    });

    this.panelEl.querySelector('.jaa-minimize-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMinimize();
    });

    this.panelEl.querySelector('.jaa-close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.remove();
    });

    document.body.appendChild(this.panelEl);
  },

  /**
   * Toggle minimize state of the panel.
   */
  toggleMinimize() {
    this.minimized = !this.minimized;
    if (this.panelEl) {
      this.panelEl.classList.toggle('jaa-minimized', this.minimized);
      const btn = this.panelEl.querySelector('.jaa-minimize-btn');
      if (btn) btn.textContent = this.minimized ? '□' : '_';
    }
  },

  /**
   * Remove the panel from the DOM.
   */
  remove() {
    if (this.panelEl && this.panelEl.parentNode) {
      this.panelEl.parentNode.removeChild(this.panelEl);
    }
    this.panelEl = null;
  },

  /**
   * Simple HTML escaping.
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};