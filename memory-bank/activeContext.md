# Active Context: Job Application Assistant

## Current Status
Initial project scaffolding - building all extension files.

## Recent Changes
- Created .clinerules with project conventions
- Created memory-bank documentation (projectbrief, productContext, systemPatterns, techContext)
- Created sample-cv-reference.md as recommended CV format template
- Built all extension source files (22 files total)
- Created README.md with full documentation
- Created .gitignore to exclude private documents

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

## Current Considerations
- Ensure content scripts only run on jobs.lever.co domain
- Handle service worker lifecycle (may go idle)
- Handle API errors gracefully with user-friendly messages
- Support all Lever form field types (text, email, select, checkbox, radio, textarea)

## Open Questions
- Need to determine exact Lever DOM structure for all field types from samples
- Need to handle the hCaptcha on application pages (extension cannot auto-solve CAPTCHA)