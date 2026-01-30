import { GoogleGenAI } from '@google/genai';

const MODEL_DEFAULT = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

let aiClient = null;
function ensureClient() {
  if (aiClient) return aiClient;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log('[Gemini] no GEMINI_API_KEY in env');
    return null;
  }
  try {
    aiClient = new GoogleGenAI({ apiKey: key });
    console.log('[Gemini] aiClient initialized successfully');
    return aiClient;
  } catch (e) {
    console.error('[Gemini] failed to construct aiClient:', e?.message || e);
    aiClient = null;
    return null;
  }
}

function safeTrim(s) {
  return typeof s === 'string' ? s.trim() : '';
}

// Returns an object: { opener, usageMetadata, model }
export async function generateOpener({ fullName = '', jobTitle = '', company = '' } = {}) {
  console.log('[Gemini] GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  const client = ensureClient();
  console.log('[Gemini] aiClient constructed:', !!client);

  if (!client) {
    console.log('[Gemini] Using mock opener (no API key or client)');
    await new Promise((r) => setTimeout(r, 200));
    const rolePart = jobTitle ? `${jobTitle} ` : '';
    const companyPart = company ? `at ${company}` : '';
    const mock = `Hi ${rolePart}${companyPart}, curious how you approach growth—can we connect?`;
    return { opener: mock, usageMetadata: null, model: null };
  }

  const model = process.env.GEMINI_MODEL || MODEL_DEFAULT;

  // Sanitize inputs
  const cleanName = safeTrim(fullName);
  const cleanJob = safeTrim(jobTitle);
  const cleanCompany = safeTrim(company);
  const companyPart = cleanCompany && cleanCompany.toLowerCase() !== 'none at this time' ? ` at ${cleanCompany}` : '';
  let prompt = `Write a single conversational, professional email opener under 20 words for a ${cleanJob || 'professional'}${companyPart}. Keep it friendly and concise. Do not use placeholders like [Name].`;

  console.log('[Gemini] Model:', model);
  console.log('[Gemini] Prompt:', prompt);

  try {
    const maxAttempts = 3;
    const maxOutputTokens = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 40);
    let usage = null;
    let opener = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        maxOutputTokens,
      });

      console.log('[Gemini] API response object:', response);
      usage = response?.usageMetadata || null;
      const text = response?.text || (response?.candidates && response.candidates[0] && (Array.isArray(response.candidates[0].content) ? response.candidates[0].content.join('\n') : response.candidates[0].content)) || '';
      opener = safeTrim(text).replace(/\s+/g, ' ');

      // Replace placeholder [Name] if present with actual name
      if (opener.includes('[Name]') && cleanName) {
        opener = opener.replace(/\[Name\]/g, cleanName);
      }

      // Remove other placeholder patterns if name is missing
      opener = opener.replace(/\[Name\]|\{\{name\}\}|\<name\>/gi, cleanName || '').replace(/\s+/g, ' ').trim();

      const wordCount = opener ? opener.split(/\s+/).filter(Boolean).length : 0;
      if (wordCount <= 20) {
        return { opener, usageMetadata: usage, model: response?.modelVersion || model };
      }

      console.log(`[Gemini] Attempt ${attempt} produced ${wordCount} words; retrying`);
      prompt = `Shorten the previous answer to a single conversational opener under 20 words. Keep it professional and friendly.`;
    }

    // Truncate to 20 words as a last resort
    const truncated = opener.split(/\s+/).slice(0, 20).join(' ');
    return { opener: truncated, usageMetadata: usage, model };
  } catch (err) {
    console.error('Gemini generateOpener error:', err?.message || err);
    const rolePart = jobTitle ? `${jobTitle} ` : '';
    const companyPart = company ? `at ${company}` : '';
    const mock = `Hi ${rolePart}${companyPart}, curious how you approach growth—can we connect?`;
    return { opener: mock, usageMetadata: null, model: null };
  }
}
