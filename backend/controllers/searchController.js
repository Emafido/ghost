import SearchResult from '../models/SearchResult.js';
import Wallet from '../models/Wallet.js';
import { enrichFromFullEnrich } from '../utils/fullEnrich.js';
import { generateOpener } from '../utils/gemini.js';
import logger from '../utils/logger.js';

export async function searchLead(req, res) {
  const { linkedinUrl, wallet } = req.body || {};

  if (!linkedinUrl) {
    return res.status(400).json({ error: 'LinkedIn URL is required' });
  }

  const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-_%]+\/?$/i;
  if (!linkedinRegex.test(linkedinUrl)) {
    return res.status(400).json({ error: 'Invalid LinkedIn profile URL' });
  }

  // If wallet provided, ensure wallet exists and atomically deduct one credit
  let w = null;
  if (wallet) {
    // ensure wallet exists with sensible defaults
    // ensure wallet exists with signup bonus/defaults
    await Wallet.findOneAndUpdate(
      { wallet },
      { $setOnInsert: { credits: wallet === '0xTESTWALLET' ? 10 : parseInt(process.env.SIGNUP_BONUS_CREDITS || '3', 10) } },
      { upsert: true }
    );

    // atomic decrement only if credits >= 1
    w = await Wallet.findOneAndUpdate(
      { wallet, credits: { $gte: 1 } },
      { $inc: { credits: -1 } },
      { new: true }
    );

    if (!w) {
      logger.info('Insufficient credits for wallet', wallet);
      return res.status(402).json({ error: 'Insufficient credits' });
    }
    logger.info('Deducted 1 credit for wallet', wallet, 'newBalance', w.credits);
  }

  try {
    // Call FullEnrich (mock for now)
    const enrichment = await enrichFromFullEnrich(linkedinUrl);
    if (!enrichment) {
      // refund if wallet was charged
      if (w) {
        try {
          await Wallet.findOneAndUpdate({ wallet }, { $inc: { credits: 1 } });
          logger.info('Refunded 1 credit to wallet after enrichment failure', wallet);
        } catch (e) {
          logger.error('failed to refund credit after search error', e);
        }
      }
      return res.status(404).json({ error: 'No data found from FullEnrich' });
    }

    // Call Gemini AI to generate opener (returns structured result)
    const openerResult = await generateOpener({
      fullName: enrichment.fullName || '',
      jobTitle: enrichment.jobTitle || '',
      company: enrichment.companyName || '',
    });

    const openerText = openerResult && openerResult.opener ? openerResult.opener : '';

    // Save result to MongoDB
    const result = new SearchResult({
      linkedinUrl,
      fullName: enrichment.fullName,
      jobTitle: enrichment.jobTitle,
      companyName: enrichment.companyName,
      email: enrichment.email,
      phone: enrichment.phone,
      opener: openerText,
      openerHistory: [
        {
          text: openerText,
          geminiUsage: openerResult.usageMetadata || null,
          geminiModel: openerResult.model || null,
        },
      ],
      geminiUsage: openerResult.usageMetadata || null,
      geminiModel: openerResult.model || null,
    });

    await result.save();

    // record search to wallet history if wallet present
    if (w) {
      w.history = w.history || [];
      w.history.push({ searchId: result._id.toString(), linkedinUrl: result.linkedinUrl, recordedAt: new Date() });
      await w.save();
    }

    // Return filtered response
    const formatted = {
      id: result._id,
      linkedinUrl: result.linkedinUrl,
      fullName: result.fullName,
      jobTitle: result.jobTitle,
      companyName: result.companyName,
      email: result.email,
      phone: result.phone,
      opener: result.opener,
      geminiModel: result.geminiModel || null,
      geminiUsageSummary: result.geminiUsage && result.geminiUsage.totalTokenCount ? { totalTokenCount: result.geminiUsage.totalTokenCount } : null,
      openerHistory: Array.isArray(result.openerHistory)
        ? result.openerHistory.map((h) => ({ text: h.text, createdAt: h.createdAt, geminiModel: h.geminiModel }))
        : [],
    };

    return res.json({ data: formatted });
  } catch (err) {
    logger.error('searchLead error:', err);
    // refund if wallet was charged
    if (w) {
      try {
        w.credits = (w.credits || 0) + 1;
        await w.save();
      } catch (e) {
        console.error('failed to refund credit after search error', e);
      }
    }
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
