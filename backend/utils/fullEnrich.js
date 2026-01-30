// FullEnrich integration with polling for bulk enrichment result.
// If `process.env.FULLENRICH_API_KEY` is not set, falls back to a local mock.

const DEFAULT_BASE = 'https://app.fullenrich.com/api/v2';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startBulkEnrichment(linkedinUrl, apiKey, baseUrl) {
  const url = `${baseUrl}/contact/enrich/bulk`;
  const body = {
    name: `Ghost Enrichment - ${new Date().toISOString()}`,
    data: [
      {
        linkedin_url: linkedinUrl,
        enrich_fields: ['contact.emails', 'contact.personal_emails', 'contact.phones'],
      },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(`FullEnrich start error: ${res.status} ${txt}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  return data.enrichment_id || data.enrichmentId || data.enrichment_id;
}

async function getEnrichmentResult(enrichmentId, apiKey, baseUrl) {
  const url = `${baseUrl}/contact/enrich/bulk/${enrichmentId}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(`FullEnrich get result error: ${res.status} ${txt}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export async function enrichFromFullEnrich(linkedinUrl) {
  const apiKey = process.env.FULLENRICH_API_KEY;
  const baseUrl = process.env.FULLENRICH_BASE_URL || DEFAULT_BASE;

  // If no API key is configured, keep using the local mock for development.
  if (!apiKey) {
    console.warn('FULLENRICH_API_KEY not set — using mock enrichment result');
    await sleep(500);
    return {
      fullName: 'Jane Doe',
      jobTitle: 'Growth Manager',
      companyName: 'Acme Corp',
      email: 'jane.doe@acme.com',
      phone: '+1-555-1234',
    };
  }

  // Start bulk enrichment
  const enrichmentId = await startBulkEnrichment(linkedinUrl, apiKey, baseUrl);

  // Poll for result with a timeout
  const timeoutMs = Number(process.env.FULLENRICH_TIMEOUT_MS || 120000); // default 2 minutes
  const intervalMs = Number(process.env.FULLENRICH_POLL_INTERVAL_MS || 2000); // default 2s
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const result = await getEnrichmentResult(enrichmentId, apiKey, baseUrl);

    if (result && result.status === 'FINISHED' && Array.isArray(result.data) && result.data.length) {
      const entry = result.data[0];
      const contact = entry.contact_info || {};
      const profile = entry.profile || {};

      const workEmail = (contact.most_probable_work_email && contact.most_probable_work_email.email) ||
        (Array.isArray(contact.work_emails) && contact.work_emails[0] && contact.work_emails[0].email) ||
        null;

      const phone = (contact.most_probable_phone && contact.most_probable_phone.number) ||
        (Array.isArray(contact.phones) && contact.phones[0] && contact.phones[0].number) ||
        null;

      const jobTitle = (profile.employment && profile.employment.current && profile.employment.current.title) || entry.input && entry.input.title || null;
      const companyName = (profile.employment && profile.employment.current && profile.employment.current.company && profile.employment.current.company.name) || entry.input && entry.input.company_name || null;

      return {
        fullName: profile.full_name || entry.input && `${entry.input.first_name || ''} ${entry.input.last_name || ''}`.trim(),
        jobTitle: jobTitle || null,
        companyName: companyName || null,
        email: workEmail,
        phone: phone,
      };
    }

    if (result && result.status === 'CREDITS_INSUFFICIENT') {
      throw new Error('FullEnrich: insufficient credits');
    }

    await sleep(intervalMs);
  }

  throw new Error('FullEnrich: enrichment timed out');
}
