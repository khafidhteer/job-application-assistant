# System Patterns: Job Application Assistant

## Architecture Overview

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Popup     │     │   Content Script  │     │   Options Page  │
│  (Controls) │     │  (Lever.co Page)  │     │  (Settings/CV)  │
└──────┬──────┘     └────────┬─────────┘     └────────┬────────┘
       │                     │                        │
       │    chrome.runtime   │   chrome.runtime       │ chrome.storage
       │    .sendMessage     │   .sendMessage          │ .local
       ▼                     ▼                        ▼
┌──────────────────────────────────────────────────────────────┐
│                 Background Service Worker                     │
│                                                              │
│  - Routes messages from content/popup                        │
│  - Makes DeepSeek API calls (OpenAI-compatible)              │
│  - Reads/writes chrome.storage.local                         │
│  - Manages CV file storage                                   │
└──────────────────────────────────────────────────────────────┘
```

## Message Passing Patterns

### Match Score Request
```
Content Script → Background → DeepSeek API → Background → Content Script
  1. inject.js detects JD page
  2. Extracts job description text
  3. Sends { type: 'SCORE_MATCH', jobDescription, cvText } to background
  4. Background calls DeepSeek API with scoring prompt
  5. Background returns { scores, overallScore, summary }
  6. Content script displays floating panel
```

### Auto-Fill Request
```
Content Script → Background → DeepSeek API (if needed) → Background → Content Script
  1. User clicks "Auto-Fill" button on apply page
  2. Content script identifies all form fields
  3. For profile fields → fill directly from stored profile data
  4. For open-ended questions → send { type: 'GENERATE_ANSWER', question, cvText }
  5. Background calls DeepSeek API with question prompt
  6. Background returns generated answer
  7. Content script fills field + adds source badge
```

### Storage Access (any caller)
```
Any Script → Background → chrome.storage.local → Response
  - { type: 'GET_STORAGE', keys: [...] }
  - { type: 'SET_STORAGE', data: {...} }
```

## Content Script Routing

The main `content.js` determines which page type is loaded:

```javascript
if (url contains '/apply') {
    // Application page → load form-filler.js logic
} else if (url matches jobs.lever.co/{company}/{id} without /apply) {
    // Job description page → load jd-extractor + match-scorer
}
```

## Scoring Data Flow

```
JD Text + CV Markdown
        │
        ▼
DeepSeek API (system prompt: career assessment assistant)
        │
        ▼
JSON Response:
{
  "skillsMatch": { "score": 85, "rationale": "..." },
  "experienceLevel": { "score": 70, "rationale": "..." },
  "domainKnowledge": { "score": 65, "rationale": "..." },
  "culturalFit": { "score": 80, "rationale": "..." },
  "growthPotential": { "score": 75, "rationale": "..." },
  "backgroundAlignment": { "score": 90, "rationale": "..." },
  "overallScore": 76,
  "summary": "The candidate has strong skills alignment..."
}
        │
        ▼
Floating Panel UI showing:
- Overall score (color-coded)
- Breakdown per dimension
- Summary text
```

## Form Field Detection Strategy

Lever.co application fields are detected using:
1. **Standard fields**: `input[name="name"]`, `input[name="email"]`, etc.
2. **Custom text inputs**: Found within `.custom-question` with `input[type="text"]`
3. **Select dropdowns**: `.application-dropdown select`
4. **Checkboxes**: `input[type="checkbox"]` with labels from `.application-answer-alternative`
5. **Radios**: `input[type="radio"]` with labels from `.application-answer-alternative`
6. **Textareas**: `textarea` within `.custom-question`
7. **Question labels**: `.application-label .text` text content for context

## UI Component Patterns

### Floating Match Score Panel
- Position: Fixed, top-right of viewport
- Can be minimized/dismissed
- Shows overall score in large font with color
- Expandable to show per-dimension breakdown
- Background color transitions: green (≥80), yellow (60-79), red (<60)

### Auto-Fill Button
- Position: Near form submit button or floating
- Text: "Auto-Fill with AI" with icon
- Shows loading spinner during processing
- Disables during fill operation

### Field Source Badges
- Small pill after each filled field
- `[Profile]` in blue for profile-sourced fields
- `[AI]` in purple for AI-generated answers
- Removable if user edits the field