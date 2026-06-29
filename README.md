# Job Application Assistant - Chrome Extension

AI-powered Chrome extension for automating job applications on [jobs.lever.co](https://jobs.lever.co). It analyzes job descriptions against your CV using any OpenAI-compatible API (e.g. DeepSeek, Sumopod, OpenRouter, OpenAI) and auto-fills application forms.

## Features

### 📊 AI Match Scoring
On any Lever.co job posting page, a floating panel automatically displays how well your CV matches the job across **6 weighted dimensions**:

| Dimension | Weight | What It Evaluates |
|-----------|--------|-------------------|
| Skills Match | 35% | Technical skills, tools, methodologies |
| Experience Level | 25% | Years, seniority, scope |
| Domain Knowledge | 15% | Industry-specific relevance |
| Cultural Fit Signs | 10% | Communication style, values |
| Growth Potential | 10% | Learning trajectory, adaptability |
| Background Alignment | 5% | Education, certifications |

Each dimension shows a score (0-100) with a rationale bar. An overall score with color coding (green ≥80, yellow 60-79, red <60) and an AI summary help you decide whether to apply.

### 🤖 Auto-Fill Application Forms
On the `/apply` page, click **"Auto-Fill with AI"** to:
- Fill standard fields (name, email, phone, location, company) from your profile
- Fill link fields (LinkedIn, GitHub, Portfolio) from your profile
- Handle select dropdowns, checkboxes, and radio buttons intelligently
- Generate professional answers for **open-ended questions** using AI (based on your CV)
- Every filled field gets a badge: `[Profile]` or `[AI]` so you know the source

## Getting Started

### Prerequisites
- Google Chrome 88+
- An API key from any OpenAI-compatible provider (e.g. [Sumopod](https://sumopod.com), [OpenRouter](https://openrouter.ai), [DeepSeek](https://platform.deepseek.com), OpenAI)

### Installation

1. **Clone or download** this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked** and select the project folder
5. The extension icon should appear in your toolbar

### Configuration

Right-click the extension icon → **Settings** (or Options) and configure:

#### 1. API Configuration
| Field | Description |
|-------|-------------|
| Base URL | Your provider's OpenAI-compatible endpoint (e.g. `https://api.sumopod.com/v1` for Sumopod, `https://api.deepseek.com/v1` for DeepSeek, `https://openrouter.ai/api/v1` for OpenRouter) |
| API Key | Your API key from the provider |
| Model | Any model available on your provider (e.g. `gpt-4o-mini`, `claude-3-haiku`, `deepseek-chat` — depends on your budget) |

#### 2. CV & Reference
Upload or paste a single **Markdown (.md) file** containing your CV and any reference information. A template is available at `sample-cv-reference.md`. Sections include:
- Personal profile (name, email, phone, links)
- Professional summary
- Core competencies & skills
- Work experience
- Education & certifications
- Additional reference material (career narrative, projects, salary expectations, availability)

#### 3. Personal Profile
Your basic info for form auto-fill: name, email, phone, location, company, and profile URLs.

#### 4. Default Answers
Predefined responses for common screening questions (work authorization, salary expectations, start date, holidays).

### Usage

1. **Browse jobs.lever.co** normally
2. On any **job posting page**, a match score panel appears automatically
3. When you click **"Apply for this Job"**, the extension adds a **"Auto-Fill with AI"** button
4. Click it to fill the form — you can review and edit before submitting

## Project Structure

```
├── manifest.json              # Extension manifest (MV3)
├── config.example.js          # Configuration reference
├── sample-cv-reference.md     # CV template (excluded from git)
├── .clinerules                # Project AI rules
├── .gitignore                 # Ignores private documents
├── memory-bank/               # Project context documentation
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   └── activeContext.md
├── background/
│   └── service-worker.js      # DeepSeek API calls, storage
├── content/
│   ├── content.js             # Main orchestrator
│   ├── jd-extractor.js        # Job description parser
│   ├── match-scorer.js        # Score panel UI
│   ├── form-filler.js         # Form field detection & fill
│   └── styles.css             # All injected styles
├── options/
│   ├── options.html           # Settings page
│   ├── options.css
│   └── options.js
├── popup/
│   ├── popup.html             # Quick controls
│   ├── popup.css
│   └── popup.js
├── lib/
│   └── storage.js             # Chrome storage wrapper
└── icons/                     # Extension icons (add your own)
```

## Technical Notes

- **Manifest V3**: Modern Chrome extension architecture
- **Zero external dependencies**: Pure vanilla JavaScript
- **API compatibility**: Works with any OpenAI-compatible API (DeepSeek, OpenAI, Groq, etc.)
- **Privacy**: All data stored locally in `chrome.storage.local`. CV content never leaves your browser except when sent to your configured API endpoint.
- **Service worker**: Background script may go idle after ~30s; all state is in storage

## Customizing Match Scoring

The scoring prompt is in `background/service-worker.js`. You can modify:
- The **system prompt** (analysis instructions)
- The **dimensions and weights** (Skills 35%, Experience 25%, etc.)
- The **JSON response format** (must match what `match-scorer.js` expects)

## Contributing

Contributions are welcome! This project is open-source under the MIT license, and everyone is encouraged to participate.

### How to Contribute

1. **Fork the repository** and clone it locally
2. **Create a feature branch**: `git checkout -b feat/your-feature-name`
3. **Make your changes** following the existing code style (vanilla JS, no external dependencies)
4. **Test your changes** by loading the extension unpacked in Chrome
5. **Commit** with clear messages describing what and why
6. **Push** to your fork and open a Pull Request

### Development Guidelines

- **Code style**: Use vanilla JavaScript only (no frameworks, no build tools). Keep it lightweight.
- **File organization**: Follow the existing structure. Content scripts in `/content/`, background in `/background/`, etc.
- **DOM queries**: Use Lever.co's known class structure (`.posting-description`, `#application-form`, etc.). If Lever changes their markup, update selectors accordingly.
- **API compatibility**: The extension supports any OpenAI-compatible API. New AI providers should work without code changes if they follow the same chat completions format.
- **Error handling**: Always provide user-friendly error messages. Failed API calls, missing CV content, or configuration issues should show helpful guidance rather than breaking silently.
- **Privacy**: Never send user data anywhere except the user's configured API endpoint. All data stays in `chrome.storage.local`.

### Built with Cline

This project is built and maintained using [Cline](https://github.com/cline/cline), an AI-powered coding assistant. The repository includes Cline-specific files that guide AI contributions:

#### `.clinerules`
The root-level `.clinerules` file defines project conventions, architecture, prompt templates, and DOM structure references. AI assistants use this as their primary context when working on the codebase.

**When you contribute, if your changes affect:**
- **Architecture** → Update the Architecture section in `.clinerules`
- **New features/prompts** → Add prompt templates to the Prompt Templates section
- **DOM selectors** → Update the Lever.co DOM Structure section
- **Tech stack or key rules** → Modify the relevant sections accordingly

#### `memory-bank/`
The `memory-bank/` directory contains structured project context that helps both humans and AI assistants understand the project holistically:

| File | Purpose | When to Update |
|------|---------|----------------|
| `projectbrief.md` | Core requirements and goals | When scope or requirements change |
| `productContext.md` | Why the project exists, user experience goals | When adding new features or changing UX |
| `systemPatterns.md` | Architecture, message flows, UI patterns | When changing architecture or adding new components |
| `techContext.md` | Tech stack, storage schema, constraints | When adding dependencies or changing storage |
| `activeContext.md` | Current status, recent changes, open questions | After every significant change — update status and completed items |

**Contribution workflow for Cline files:**
1. When you submit a PR that changes functionality, include updates to relevant `memory-bank/` files
2. If you introduce new patterns (e.g., a new message type between content and background scripts), document them in `systemPatterns.md`
3. If you change the storage schema, update `techContext.md`
4. After merging, update `activeContext.md` to reflect the new status

### What Needs Help

- **Testing on different Lever.co pages** - Different companies may customize their application forms. Report any field types that aren't detected.
- **Additional AI providers** - Documentation for using with OpenAI, Anthropic, Groq, etc.
- **i18n** - Internationalization for the extension UI
- **Accessibility** - Improve ARIA labels, keyboard navigation, and screen reader support
- **Theme support** - Dark mode for the floating panel and popup

### Reporting Issues

Open an issue with:
- Browser version and OS
- URL of the page where the issue occurs
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable (exclude any personal information)

## License

MIT License - see [LICENSE](LICENSE) for details.

Copyright (c) 2026 Khafidh Tri Ramdhani

Permission is granted to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software. This project is open for everyone to join, learn from, and contribute to.
