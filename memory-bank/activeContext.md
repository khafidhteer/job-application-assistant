# Active Context: Job Application Assistant

## Current Status
Extension is functional. Fixed a critical bug where the job description extractor was using outdated CSS selectors that no longer matched Lever.co's current DOM structure.

## Recent Changes
- **2026-06-30**: Fixed `jd-extractor.js` - `extractDescription()` selector updated
  - **Problem**: Lever.co changed their job posting page structure. The description was inside `<div data-qa="job-description">` instead of the old `.posting-description` class. This caused `extractDescription()` to return empty string, triggering "Could not extract job description from this page." error.
  - **Fix**: Updated primary selector to `[data-qa="job-description"]` with `.posting-description` as fallback. Added div text extraction logic since the current Lever.co structure uses `<div>` elements with inline text rather than `<p>` tags.
  - **Note**: The CSP error `injectlaunchmonitors.js:131` seen in console is from a different Chrome extension, not from Job Application Assistant.

## All Completed Files
1. ~~Create .clinerules~~ ✓
2. ~~Create memory-bank (5 files)~~ ✓
3. ~~Create manifest.json + icons directory~~ ✓
4. ~~Create lib/storage.js - Chrome storage wrapper~~ ✓
5. ~~Create background/service-worker.js - DeepSeek API proxy~~ ✓
6. ~~Create options/ page (HTML, JS, CSS) - API config, CV upload, profile~~ ✓
7. ~~Create content/content.js - Main orchestrator~~ ✓
8. ~~Create content/jd-extractor.js - Parse Lever JD pages~~ ✓
9. ~~Create content/match-scorer.js - Score display floating panel~~ ✓
10. ~~Create content/form-filler.js - Field detection & auto-fill~~ ✓
11. ~~Create popup/ page (HTML, JS, CSS) - Quick controls~~ ✓
12. ~~Create config.example.js - Configuration template~~ ✓
13. ~~Create README.md - Full project documentation~~ ✓
14. ~~Create .gitignore - Exclude private docs from git~~ ✓
15. ~~Create LICENSE - MIT license~~ ✓
16. ~~Add "Built with Cline" section to README with contribution guide for .clinerules & memory-bank~~ ✓

## Active Decisions
- Single Markdown file as CV/reference source (stored in chrome.storage.local)
- 6 weighted parameters for match scoring
- Auto-fill triggered by button click, not automatic
- Field badges showing [Profile] or [AI] source
- All AI calls routed through background service worker
- Job description extraction uses `[data-qa="job-description"]` as primary selector with `.posting-description` fallback

## Current Considerations
- Ensure content scripts only run on jobs.lever.co domain
- Handle service worker lifecycle (may go idle)
- Handle API errors gracefully with user-friendly messages
- Support all Lever form field types (text, email, select, checkbox, radio, textarea)
- Lever.co may change DOM structure again in the future; selectors should be monitored

## Open Questions
- Need to determine exact Lever DOM structure for all field types from samples
- Need to handle the hCaptcha on application pages (extension cannot auto-solve CAPTCHA)