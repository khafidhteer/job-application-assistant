# Tech Context: Job Application Assistant

## Technology Stack

### Chrome Extension (Manifest V3)
- **Manifest version**: 3 (required by Chrome Web Store for new extensions)
- **Service Worker**: Replaces background pages in MV3
- **Content Scripts**: Run in isolated world, injected into lever.co pages
- **Storage API**: chrome.storage.local for all persistent data

### APIs
- **DeepSeek API**: OpenAI-compatible chat completions endpoint
  - Base URL: https://api.deepseek.com/v1
  - Model: deepseek-chat (or configurable)
  - Endpoint: /v1/chat/completions
  - Auth: Bearer token (API key)

### Storage Schema (chrome.storage.local)
```javascript
{
  // API Configuration
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: 'sk-...',
    model: 'deepseek-chat'
  },

  // CV/Reference Markdown content
  cvContent: '# Personal Profile\nName: ...',

  // User Profile (for form filling)
  profile: {
    name: '',
    email: '',
    phone: '',
    location: '',
    currentCompany: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    otherUrl: ''
  },

  // Default answers for common screening questions
  defaultAnswers: {
    workAuthorization: '',
    desiredSalary: '',
    startDate: '',
    holidaysLeave: ''
  }
}
```

### File Types
- **`.md`** (Markdown): CV/reference document format
- **`.js`**: Vanilla JavaScript (no transpilation needed)
- **`.html`**: Extension pages (popup, options)
- **`.css`**: Styling for extension pages
- **`.json`**: Manifest configuration
- **`.png`**: Extension icons (optional, can use emoji/unicode)

## Development Environment
- **OS**: Windows 11
- **IDE**: Visual Studio Code
- **Testing**: Chrome browser with developer mode extensions
- **No build tools**: Plain JS, extension loaded unpacked

## Constraints & Limitations
- **Content script isolation**: Cannot access page's window variables directly
- **Service worker lifecycle**: Background script may terminate after ~30s idle; use chrome.storage for state
- **CSP**: Extension's CSP may block inline scripts in HTML pages
- **DeepSeek rate limits**: API calls may have rate limits; handle gracefully
- **PDF parsing**: Not needed since user uploads Markdown directly
- **Lever.co DOM changes**: Lever.co may update their page structure. Current JD description uses `[data-qa="job-description"]` (not `.posting-description`). Form fields use classes like `.custom-question`, `.application-label`, `.application-field`, `.application-dropdown`. Selectors should be verified if extension stops working.

## Dependencies
- **Zero external dependencies** for the extension itself
- Only relies on Chrome Extension APIs and standard Web APIs (fetch, DOM)

## Browser Compatibility
- Chrome 88+ (for Manifest V3 support)
- Does NOT target Firefox, Safari, or Edge (Lever.co focus)