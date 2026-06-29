/**
 * Form Filler
 * Detects and fills Lever.co application form fields with profile data and AI-generated answers.
 */

const FormFiller = {
  /**
   * Main entry point to auto-fill the application form.
   * @returns {Promise<{total: number, filled: number, errors: string[]}>}
   */
  async autoFill() {
    const form = document.querySelector('#application-form');
    if (!form) {
      return { total: 0, filled: 0, errors: ['Application form not found (#application-form)'] };
    }

    // Get stored data
    const [profileRes, cvRes, answersRes] = await Promise.all([
      chrome.runtime.sendMessage({ type: 'GET_PROFILE' }),
      chrome.runtime.sendMessage({ type: 'GET_CV_CONTENT' }),
      chrome.runtime.sendMessage({ type: 'GET_DEFAULT_ANSWERS' })
    ]);

    const profile = profileRes.success ? profileRes.data : {};
    const cvText = cvRes.success ? cvRes.data : '';
    const defaultAnswers = answersRes.success ? answersRes.data : {};

    // Find all fillable fields
    const fields = this.detectFields(form);
    
    if (fields.length === 0) {
      return { total: 0, filled: 0, errors: ['No fillable fields found'] };
    }

    // Show progress bar
    this.showProgress(fields.length);

    const results = { total: fields.length, filled: 0, errors: [] };

    // Process fields sequentially
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      try {
        const filled = await this.fillField(field, profile, cvText, defaultAnswers);
        if (filled) results.filled++;
        this.updateProgress(i + 1, fields.length, `Processing ${field.label || 'field'}...`);
      } catch (err) {
        results.errors.push(`Failed to fill "${field.label || field.name}": ${err.message}`);
      }
    }

    this.hideProgress();
    return results;
  },

  /**
   * Detect all fillable fields in the application form.
   * @param {HTMLElement} form - The application form element
   * @returns {Array<Object>} Array of field descriptors
   */
  detectFields(form) {
    const fields = [];

    // 1. Standard text/email inputs
    form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
      if (this.isHidden(input)) return;
      const name = input.getAttribute('name') || '';
      const label = this.findLabel(input);
      fields.push({ type: 'text', element: input, name, label });
    });

    // 2. Custom card text inputs (screening questions)
    form.querySelectorAll('.custom-question input[type="text"]').forEach(input => {
      if (this.isHidden(input)) return;
      const label = this.findCustomQuestionLabel(input);
      fields.push({ type: 'custom-text', element: input, name: input.getAttribute('name') || '', label });
    });

    // 3. Select dropdowns (including opportunity location)
    form.querySelectorAll('.application-dropdown select, select.application-field').forEach(select => {
      if (this.isHidden(select)) return;
      const label = this.findLabel(select);
      fields.push({ type: 'select', element: select, name: select.getAttribute('name') || '', label });
    });

    // 4. Textareas
    form.querySelectorAll('textarea').forEach(textarea => {
      if (this.isHidden(textarea)) return;
      const label = this.findCustomQuestionLabel(textarea);
      fields.push({ type: 'textarea', element: textarea, name: textarea.getAttribute('name') || '', label });
    });

    // 5. Checkbox groups
    form.querySelectorAll('ul[data-qa="checkboxes"]').forEach(ul => {
      const questionEl = ul.closest('.custom-question') || ul.closest('.application-question');
      if (!questionEl) return;
      const label = this.findQuestionText(questionEl);
      const checkboxes = ul.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length > 0) {
        fields.push({ type: 'checkboxes', element: checkboxes, container: ul, label, name: checkboxes[0].getAttribute('name') || '' });
      }
    });

    // 6. Radio groups
    form.querySelectorAll('ul[data-qa="multiple-choice"]').forEach(ul => {
      const questionEl = ul.closest('.custom-question') || ul.closest('.application-question');
      if (!questionEl) return;
      const label = this.findQuestionText(questionEl);
      const radios = ul.querySelectorAll('input[type="radio"]');
      if (radios.length > 0) {
        fields.push({ type: 'radios', element: radios, container: ul, label, name: radios[0].getAttribute('name') || '' });
      }
    });

    return fields;
  },

  /**
   * Fill a single field.
   * @returns {Promise<boolean>} Whether the field was filled
   */
  async fillField(field, profile, cvText, defaultAnswers) {
    switch (field.type) {
      case 'text':
      case 'custom-text':
        return this.fillTextInput(field, profile, cvText, defaultAnswers);
      case 'select':
        return this.fillSelect(field, profile);
      case 'textarea':
        return this.fillTextarea(field, profile, cvText, defaultAnswers);
      case 'checkboxes':
        return this.fillCheckboxes(field, defaultAnswers);
      case 'radios':
        return this.fillRadios(field, defaultAnswers);
      default:
        return false;
    }
  },

  /**
   * Fill a text input field.
   */
  async fillTextInput(field, profile, cvText, defaultAnswers) {
    const input = field.element;
    const name = field.name.toLowerCase();
    const label = (field.label || '').toLowerCase();

    let value = '';

    // Match by field name
    if (name.includes('name') && !name.includes('org') && !name.includes('company')) value = profile.name || '';
    else if (name.includes('email')) value = profile.email || '';
    else if (name.includes('phone')) value = profile.phone || '';
    else if (name.includes('location') || name.includes('loc')) value = profile.location || '';
    else if (name.includes('org') || name.includes('company')) value = profile.currentCompany || '';
    else if (name.includes('linkedin')) value = profile.linkedinUrl || '';
    else if (name.includes('github')) value = profile.githubUrl || '';
    else if (name.includes('portfolio')) value = profile.portfolioUrl || '';
    else if (name.includes('urls[')) {
      // URLs[LinkedIn], URLs[GitHub], etc.
      if (name.includes('linkedin')) value = profile.linkedinUrl || '';
      else if (name.includes('github')) value = profile.githubUrl || '';
      else if (name.includes('portfolio')) value = profile.portfolioUrl || '';
      else if (name.includes('other')) value = profile.otherUrl || '';
    }

    // Match by label for custom questions
    if (!value && label) {
      if (label.includes('salary') || label.includes('desired')) value = defaultAnswers.desiredSalary || '';
      else if (label.includes('authoris') || label.includes('authoriz') || label.includes('work right')) value = defaultAnswers.workAuthorization || '';
      else if (label.includes('start') || label.includes('commence') || label.includes('available')) value = defaultAnswers.startDate || '';
      else if (label.includes('holiday') || label.includes('leave') || label.includes('vacation')) value = defaultAnswers.holidaysLeave || '';
    }

    // For custom questions not matched, use default notes
    if (!value && label && name.startsWith('cards[')) {
      value = defaultAnswers.additionalNotes || '';
    }

    // Fill and add badge
    if (value) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      
      const badgeText = this.isProfileField(field) ? 'Profile' : 'AI';
      this.addBadge(input, badgeText);
      return true;
    }

    return false;
  },

  /**
   * Fill a select dropdown.
   */
  fillSelect(field, profile) {
    const select = field.element;
    const name = field.name.toLowerCase();
    const label = (field.label || '').toLowerCase();

    // For opportunity location - if we have a location preference stored
    if (name.includes('opportunitylocation') || label.includes('location')) {
      // Try to select an option matching the user's location
      const location = profile.location || '';
      if (location) {
        const options = Array.from(select.options);
        // Try to match the first word of the location (e.g., "Jakarta, Indonesia" -> "Jakarta" might match)
        const firstWord = location.split(',')[0].trim().toLowerCase();
        for (const option of options) {
          if (option.text.toLowerCase().includes(firstWord)) {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            this.addBadge(select, 'Profile');
            return true;
          }
        }
      }
    }

    // For demographic/country select
    if (name.includes('candidate-location') || label.includes('country') || label.includes('location')) {
      const location = profile.location || '';
      if (location) {
        const options = Array.from(select.options);
        const lastPart = location.split(',').pop().trim().toLowerCase();
        for (const option of options) {
          if (option.text.toLowerCase().includes(lastPart) || option.text.toLowerCase().includes(location.toLowerCase())) {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            this.addBadge(select, 'Profile');
            return true;
          }
        }
      }
    }

    return false;
  },

  /**
   * Fill a textarea (open-ended question) with AI-generated answer.
   */
  async fillTextarea(field, profile, cvText, defaultAnswers) {
    const textarea = field.element;
    const label = field.label || '';

    // Check if we have a default answer or if this needs AI generation
    const labelLower = label.toLowerCase();

    // Try default answers first
    if (labelLower.includes('salary')) {
      if (defaultAnswers.desiredSalary) {
        textarea.value = defaultAnswers.desiredSalary;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        this.addBadge(textarea, 'Profile');
        return true;
      }
    }

    // For AI-generated answers, need CV content and API key
    if (cvText && label) {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'GENERATE_ANSWER',
          question: label,
          cvText: cvText
        });

        if (response.success && response.data) {
          textarea.value = response.data;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
          this.addBadge(textarea, 'AI');
          return true;
        }
      } catch (err) {
        console.warn('AI generation failed for:', label, err);
      }
    }

    return false;
  },

  /**
   * Fill checkbox group. Selects the first matching option from default answers.
   */
  fillCheckboxes(field, defaultAnswers) {
    const label = (field.label || '').toLowerCase();
    const checkboxes = Array.from(field.element);

    if (checkboxes.length === 0) return false;

    // Determine which value to select
    let targetValue = '';

    if (label.includes('authoris') || label.includes('authoriz') || label.includes('work right')) {
      targetValue = defaultAnswers.workAuthorization || '';
    } else if (label.includes('salary') || label.includes('desired')) {
      targetValue = defaultAnswers.desiredSalary || '';
    } else if (label.includes('start') || label.includes('commence') || label.includes('available')) {
      targetValue = defaultAnswers.startDate || '';
    } else if (label.includes('holiday') || label.includes('leave') || label.includes('vacation')) {
      targetValue = defaultAnswers.holidaysLeave || '';
    }

    if (targetValue) {
      // Try to match by value text
      for (const cb of checkboxes) {
        const span = cb.closest('label')?.querySelector('.application-answer-alternative');
        const optionText = span ? span.textContent.trim().toLowerCase() : '';
        
        if (optionText && (optionText.includes(targetValue.toLowerCase()) || targetValue.toLowerCase().includes(optionText))) {
          cb.checked = true;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
          this.addBadge(cb.closest('label') || cb, 'Profile');
          return true;
        }
      }

      // If no match found, just check the first option? Better to leave unchecked.
    }

    // For demographic surveys, don't auto-fill (intentionally skip)
    return false;
  },

  /**
   * Fill radio group. Selects the first matching option from default answers.
   */
  fillRadios(field, defaultAnswers) {
    const label = (field.label || '').toLowerCase();
    const radios = Array.from(field.element);

    if (radios.length === 0) return false;

    let targetValue = '';

    if (label.includes('holiday') || label.includes('leave') || label.includes('vacation')) {
      targetValue = defaultAnswers.holidaysLeave || '';
      // For Yes/No questions, try to infer
      if (!targetValue) targetValue = 'No';
    } else if (label.includes('disability') || label.includes('health')) {
      // Skip health/disability questions (prefer not to answer)
      targetValue = 'Prefer not to disclose';
    }

    if (targetValue) {
      for (const radio of radios) {
        const span = radio.closest('label')?.querySelector('.application-answer-alternative');
        const optionText = span ? span.textContent.trim().toLowerCase() : '';
        
        if (optionText && (optionText.includes(targetValue.toLowerCase()) || targetValue.toLowerCase().includes(optionText))) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
          this.addBadge(radio.closest('label') || radio, 'Profile');
          return true;
        }
      }
    }

    return false;
  },

  /**
   * Find the label text for a form element.
   */
  findLabel(element) {
    // Try the adjacent application-label
    const li = element.closest('li');
    if (li) {
      const labelEl = li.querySelector('.application-label');
      if (labelEl) {
        const textEl = labelEl.querySelector('.text');
        return textEl ? textEl.textContent.trim() : labelEl.textContent.trim();
      }
      
      // Try direct label element
      const directLabel = li.querySelector('label');
      if (directLabel) {
        const text = directLabel.textContent.trim();
        // Remove required asterisk and field-specific text
        return text.replace(/[✱✱✱★✩]\s*$/, '').replace(/\(required\)/i, '').trim();
      }
    }
    return '';
  },

  /**
   * Find the label for a custom question.
   */
  findCustomQuestionLabel(element) {
    const questionEl = element.closest('.custom-question') || element.closest('.application-question');
    if (questionEl) {
      return this.findQuestionText(questionEl);
    }
    return '';
  },

  /**
   * Get question text from a question container.
   */
  findQuestionText(questionEl) {
    const textEl = questionEl.querySelector('.application-label .text');
    if (textEl) return textEl.textContent.trim();
    
    const labelEl = questionEl.querySelector('.application-label');
    if (labelEl) {
      // Clone to manipulate
      const clone = labelEl.cloneNode(true);
      const subEls = clone.querySelectorAll('span.required, .description, .hint');
      subEls.forEach(el => el.remove());
      return clone.textContent.trim();
    }
    
    return '';
  },

  /**
   * Check if an element is hidden.
   */
  isHidden(el) {
    return el.offsetParent === null || el.closest('.hidden') !== null;
  },

  /**
   * Add a source badge after the element.
   */
  addBadge(element, source) {
    // Remove any existing badge
    const existing = element.parentElement?.querySelector('.jaa-badge');
    if (existing) existing.remove();

    const badge = document.createElement('span');
    badge.className = `jaa-badge jaa-badge-${source.toLowerCase()}`;
    badge.textContent = `[${source}]`;
    
    // Insert after the element
    element.insertAdjacentElement('afterend', badge);
  },

  /**
   * Check if a field should be marked as Profile (vs AI).
   */
  isProfileField(field) {
    const profileNames = ['name', 'email', 'phone', 'org', 'company', 'location', 'linkedin', 'github', 'portfolio'];
    const name = field.name.toLowerCase();
    const label = (field.label || '').toLowerCase();
    
    for (const pn of profileNames) {
      if (name.includes(pn) || label.includes(pn)) {
        return true;
      }
    }

    // URLs fields
    if (name.startsWith('urls[')) return true;

    // Screening questions with default answers
    if (name.startsWith('cards[')) return false; // These are AI/default answer fields

    return false;
  },

  // ─── Progress UI ───────────────────────────────────────────────

  progressEl: null,

  showProgress(total) {
    this.hideProgress();
    this.progressEl = document.createElement('div');
    this.progressEl.className = 'jaa-progress';
    this.progressEl.innerHTML = `
      <span style="font-weight:600;">🤖 Auto-Fill</span>
      <div class="jaa-progress-bar">
        <div class="jaa-progress-fill" style="width:0%"></div>
      </div>
      <span class="jaa-progress-text">0/${total}</span>
    `;
    document.body.appendChild(this.progressEl);
  },

  updateProgress(current, total, text) {
    if (!this.progressEl) return;
    const fill = this.progressEl.querySelector('.jaa-progress-fill');
    const textEl = this.progressEl.querySelector('.jaa-progress-text');
    if (fill) fill.style.width = `${(current / total) * 100}%`;
    if (textEl) textEl.textContent = `${current}/${total}`;
  },

  hideProgress() {
    if (this.progressEl && this.progressEl.parentNode) {
      this.progressEl.parentNode.removeChild(this.progressEl);
    }
    this.progressEl = null;
  }
};