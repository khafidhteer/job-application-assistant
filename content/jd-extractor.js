/**
 * Job Description Extractor
 * Extracts job details from Lever.co job posting pages.
 */

const JDExtractor = {
  /**
   * Extract job description details from the current page.
   * @returns {Object|null} { title, company, description, categories } or null if not a JD page
   */
  extract() {
    const title = this.extractTitle();
    if (!title) return null;

    return {
      title: title,
      company: this.extractCompany(),
      description: this.extractDescription(),
      categories: this.extractCategories(),
      url: window.location.href
    };
  },

  /**
   * Extract job title from .posting-headline h2
   */
  extractTitle() {
    const el = document.querySelector('.posting-headline h2');
    return el ? el.textContent.trim() : null;
  },

  /**
   * Extract company name from header logo alt text
   */
  extractCompany() {
    const el = document.querySelector('.main-header-logo img');
    if (el) {
      const alt = el.getAttribute('alt');
      if (alt) return alt.replace(/ logo$/i, '').trim();
    }
    // Fallback: extract from URL
    const match = window.location.pathname.match(/\/lever\.co\/([^/]+)/);
    if (match) return match[1];
    return 'Unknown Company';
  },

  /**
   * Extract job description text from the posting page.
   * Uses [data-qa="job-description"] (current Lever.co structure) 
   * with .posting-description as fallback for legacy pages.
   * Gets all text content, stripping HTML.
   */
  extractDescription() {
    // Primary selector: data-qa attribute (current Lever.co structure)
    let el = document.querySelector('[data-qa="job-description"]');
    
    // Fallback: .posting-description class (legacy Lever.co structure)
    if (!el) {
      el = document.querySelector('.posting-description');
    }
    
    if (!el) return '';

    // Clone to avoid modifying the DOM
    const clone = el.cloneNode(true);
    
    // Remove non-content elements
    clone.querySelectorAll('script, style, iframe, noscript').forEach(el => el.remove());

    // Get text, preserving some structure
    let text = '';
    
    // Handle headings
    clone.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
      text += '\n' + h.textContent.trim() + '\n';
    });
    
    // Handle paragraphs
    clone.querySelectorAll('p').forEach(p => {
      text += p.textContent.trim() + '\n\n';
    });
    
    // Handle lists
    clone.querySelectorAll('li').forEach(li => {
      text += '• ' + li.textContent.trim() + '\n';
    });
    
    // Handle divs with inline content (used in current Lever.co structure)
    clone.querySelectorAll('div').forEach(div => {
      // Only add div text if it has direct text content (not just child elements)
      const directText = Array.from(div.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .filter(text => text.length > 0)
        .join(' ');
      if (directText) {
        text += directText + '\n\n';
      }
    });
    
    // Get any remaining text
    text += clone.textContent;

    // Clean up whitespace
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  },

  /**
   * Extract posting categories (location, team, commitment, workplace)
   * @returns {Object}
   */
  extractCategories() {
    const categories = {};
    const categoryEls = document.querySelectorAll('.posting-categories .posting-category');

    categoryEls.forEach(el => {
      const text = el.textContent.trim().replace(/\/$/, '').trim();
      const classList = Array.from(el.classList);
      
      if (classList.includes('location')) {
        categories.location = text;
      } else if (classList.includes('department') || classList.includes('team')) {
        categories.team = text;
      } else if (classList.includes('commitment')) {
        categories.commitment = text;
      } else if (classList.includes('workplaceTypes')) {
        categories.workplace = text;
      }
    });

    return categories;
  },

  /**
   * Check if current page is a job description page (not apply page)
   */
  isJobDescriptionPage() {
    const path = window.location.pathname;
    // Must be jobs.lever.co/{company}/{id} and NOT have /apply
    return /^\/[^/]+\/[^/]+\/?$/.test(path) && !path.includes('/apply');
  },

  /**
   * Check if current page is an application page
   */
  isApplicationPage() {
    return window.location.pathname.includes('/apply');
  }
};