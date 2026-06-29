/**
 * Background Service Worker
 * Handles OpenAI-compatible API calls (Sumopod, OpenRouter, DeepSeek, OpenAI, etc.)
 * and storage operations for the extension.
 * All AI operations are routed through this worker.
 */

// Import storage wrapper
importScripts('../lib/storage.js');

/**
 * Call an OpenAI-compatible API with a chat completion request.
 * Works with any provider: Sumopod, OpenRouter, DeepSeek, OpenAI, Groq, etc.
 * @param {Array} messages - Array of { role, content } objects
 * @param {Object} config - { baseUrl, apiKey, model }
 * @returns {Promise<string>} The response text
 */
async function callAI(messages, config) {
  const url = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      messages: messages,
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

/**
 * Score match between job description and CV.
 * @param {string} jobDescription - The job description text
 * @param {string} cvText - The CV/reference markdown content
 * @param {Object} config - API configuration
 * @returns {Promise<Object>} Scoring result with dimensions and overall score
 */
async function scoreMatch(jobDescription, cvText, config) {
  const systemPrompt = `You are a career assessment assistant. Analyze how well the candidate's CV matches the job description. For each dimension, provide a score (0-100) with a one-sentence rationale. Then provide an overall weighted score and 2-3 sentence summary.

Dimensions and weights:
- Skills Match (35%): Technical skills, tools, methodologies alignment
- Experience Level (25%): Years, seniority, scope
- Domain Knowledge (15%): Industry-specific relevance
- Cultural Fit Signals (10%): Communication style, values, work preferences
- Growth Potential (10%): Learning trajectory, adaptability
- Background Alignment (5%): Education, certifications

Return ONLY valid JSON with this exact structure (no markdown, no code fences):
{
  "skillsMatch": { "score": 0, "rationale": "..." },
  "experienceLevel": { "score": 0, "rationale": "..." },
  "domainKnowledge": { "score": 0, "rationale": "..." },
  "culturalFit": { "score": 0, "rationale": "..." },
  "growthPotential": { "score": 0, "rationale": "..." },
  "backgroundAlignment": { "score": 0, "rationale": "..." },
  "overallScore": 0,
  "summary": "..."
}`;

  const userMessage = `JOB DESCRIPTION:\n${jobDescription}\n\nCANDIDATE CV:\n${cvText}`;

  const response = await callAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ], config);

  // Parse JSON from response (handle potential markdown wrapping)
  let jsonStr = response;
  // Remove markdown code fences if present
  jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse scoring response:', response);
    throw new Error('Failed to parse AI scoring response. Please try again.');
  }
}

/**
 * Generate an answer for an open-ended question.
 * @param {string} question - The question text
 * @param {string} cvText - The CV/reference markdown content
 * @param {Object} config - API configuration
 * @returns {Promise<string>} Generated answer
 */
async function generateAnswer(question, cvText, config) {
  const systemPrompt = `You are a job application assistant. Using the candidate's CV and reference information as context, answer the following job application question concisely and professionally (2-4 sentences). Be specific to the candidate's experience and avoid generic responses. Answer directly without prefacing.`;

  const userMessage = `CV/REFERENCE:\n${cvText}\n\nQUESTION:\n${question}`;

  return await callAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ], config);
}

/**
 * Handle messages from content scripts and popup.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle async operations
  (async () => {
    try {
      switch (request.type) {
        case 'SCORE_MATCH': {
          const config = await Storage.getApiConfig();
          if (!config.apiKey) {
            throw new Error('API key not configured. Please set up your API provider in extension settings.');
          }
          const result = await scoreMatch(request.jobDescription, request.cvText, config);
          sendResponse({ success: true, data: result });
          break;
        }

        case 'GENERATE_ANSWER': {
          const config = await Storage.getApiConfig();
          if (!config.apiKey) {
            throw new Error('API key not configured. Please set up your API provider in extension settings.');
          }
          const answer = await generateAnswer(request.question, request.cvText, config);
          sendResponse({ success: true, data: answer });
          break;
        }

        case 'GET_STORAGE': {
          const result = await Storage.get(request.keys);
          sendResponse({ success: true, data: result });
          break;
        }

        case 'SET_STORAGE': {
          await Storage.set(request.data);
          sendResponse({ success: true });
          break;
        }

        case 'GET_API_CONFIG': {
          const config = await Storage.getApiConfig();
          sendResponse({ success: true, data: config });
          break;
        }

        case 'GET_CV_CONTENT': {
          const content = await Storage.getCvContent();
          sendResponse({ success: true, data: content });
          break;
        }

        case 'GET_PROFILE': {
          const profile = await Storage.getProfile();
          sendResponse({ success: true, data: profile });
          break;
        }

        case 'GET_DEFAULT_ANSWERS': {
          const answers = await Storage.getDefaultAnswers();
          sendResponse({ success: true, data: answers });
          break;
        }

        default:
          sendResponse({ success: false, error: `Unknown message type: ${request.type}` });
      }
    } catch (error) {
      console.error('Background worker error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  // Return true to indicate async response
  return true;
});

// Log installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Job Application Assistant installed. Please configure in extension settings.');
  }
});