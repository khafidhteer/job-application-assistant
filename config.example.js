/**
 * Configuration Example for Job Application Assistant
 * 
 * This file serves as a reference for configuring the extension.
 * Do NOT put real credentials here - use the Options page in the extension.
 * 
 * To configure:
 * 1. Load the extension unpacked in Chrome (chrome://extensions -> Developer mode -> Load unpacked)
 * 2. Right-click the extension icon -> Options (or Settings)
 * 3. Fill in:
 *    - DeepSeek API Configuration (Base URL, API Key, Model)
 *    - Upload your CV/reference Markdown file
 *    - Enter your personal profile details
 *    - Set default screening answers
 * 
 * All configuration is stored in chrome.storage.local, not in this file.
 * This file is purely documentation.
 */

// ─── API Configuration ─────────────────────────────────────────
// Works with any OpenAI-compatible API provider.
// Examples: Sumopod, OpenRouter, DeepSeek, OpenAI, Groq, etc.
const EXAMPLE_API_CONFIG = {
  baseUrl: 'https://api.sumopod.com/v1',    // Your provider's endpoint
  apiKey: 'sk-your-api-key-here',           // Your actual API key
  model: 'gpt-4o-mini'                      // Model name (pick what fits your budget)
};

// ─── Supported Providers & Models ──────────────────────────────
// Sumopod:    https://api.sumopod.com/v1     → any model you have credits for
// OpenRouter: https://openrouter.ai/api/v1   → any model available
// DeepSeek:   https://api.deepseek.com/v1    → deepseek-chat, deepseek-reasoner
// OpenAI:     https://api.openai.com/v1      → gpt-4o, gpt-4o-mini, gpt-4, gpt-3.5-turbo
// Groq:       https://api.groq.com/openai/v1 → llama-3, mixtral, gemma
// 
// The extension is provider-agnostic. Just set the Base URL, API Key, and Model
// that matches your provider's OpenAI-compatible chat completions endpoint.

// ─── CV/Reference File Format ──────────────────────────────────
// The extension expects a single Markdown (.md) file with sections:
// 
// # Personal Profile
// Name: ...
// Email: ...
// Phone: ...
// ...
// 
// # Professional Summary
// ...
// 
// # Core Competencies & Skills
// ...
// 
// # Work Experience
// ...
// 
// # Education
// ...
// 
// # Certifications
// ...
// 
// # Additional Reference Material
// Career narrative, projects, salary expectations, availability...
// 
// See sample-cv-reference.md for a complete example.

// ─── Match Scoring Weights ─────────────────────────────────────
// These are built into the AI prompt and not user-configurable:
const SCORING_WEIGHTS = {
  skillsMatch: 35,           // Technical skills, tools, methodologies
  experienceLevel: 25,       // Years, seniority, scope
  domainKnowledge: 15,       // Industry-specific relevance
  culturalFit: 10,           // Communication style, values
  growthPotential: 10,       // Learning trajectory, adaptability
  backgroundAlignment: 5     // Education, certifications
};

// ─── Useful Chrome Extension URLs ──────────────────────────────
// After loading the extension:
// chrome://extensions/              -> Manage extensions
// chrome-extension://<your-id>/options/options.html  -> Settings page directly
// View -> Developer -> JavaScript Console  -> Debug content scripts