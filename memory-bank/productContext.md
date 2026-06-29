# Product Context: Job Application Assistant

## Why This Extension Exists
Applying to jobs on Lever.co involves two repetitive, time-consuming tasks:
1. Manually assessing whether a job is worth applying to by comparing your CV to the job description
2. Filling out lengthy application forms with the same basic info plus open-ended questions

## How It Solves These Problems

### Match Scoring
- **Before**: User reads JD, opens CV in another tab, mentally compares, guesses fit
- **After**: Extension extracts JD, sends to AI with CV context, returns a structured score with rationale
- **Value**: Saves mental effort, provides objective assessment, helps prioritize which jobs to apply for

### Form Auto-Fill
- **Before**: User manually types name, email, phone, location, company, links for every application; spends minutes crafting answers to open-ended questions
- **After**: One click fills all known fields from profile, AI generates professional answers for open-ended questions
- **Value**: Reduces application time from 5-10 minutes to under 30 seconds

## User Experience Goals
- **Non-intrusive**: Extension adds UI elements that blend with Lever's design
- **Transparent**: User always knows which fields came from profile vs AI
- **Controllable**: Auto-fill only happens when user clicks the button
- **Configurable**: API settings, CV file, and profile defaults all managed in options page
- **Informative**: Match score shows not just a number but why (per-dimension breakdown)

## Key Differentiators
- Uses a single Markdown file for all reference data (simple, portable)
- Multi-parameter weighted scoring (not just a single number)
- Source badges on filled fields (transparency)
- DeepSeek API (cost-effective, OpenAI-compatible)