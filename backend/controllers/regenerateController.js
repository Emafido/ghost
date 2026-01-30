import SearchResult from '../models/SearchResult.js';
import Wallet from '../models/Wallet.js';
import { generateOpener } from '../utils/gemini.js';
import logger from '../utils/logger.js';

export async function regenerateOpener(req, res) {
  const { id } = req.body || {};
  const { wallet } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id is required' });

  // handle credit check & deduction when wallet provided
  let w = null;
  if (wallet) {
    await Wallet.findOneAndUpdate(
      { wallet },
      { $setOnInsert: { credits: wallet === '0xTESTWALLET' ? 10 : parseInt(process.env.SIGNUP_BONUS_CREDITS || '3', 10) } },
      { upsert: true }
    );

    w = await Wallet.findOneAndUpdate(
      { wallet, credits: { $gte: 1 } },
      { $inc: { credits: -1 } },
      { new: true }
    );

    if (!w) {
      logger.info('Insufficient credits for regenerate wallet', wallet);
      return res.status(402).json({ error: 'Insufficient credits' });
    }
    logger.info('Deducted 1 credit for regenerate wallet', wallet, 'newBalance', w.credits);
  }
  try {
    const record = await SearchResult.findById(id);
    if (!record) return res.status(404).json({ error: 'Search result not found' });

    const openerResult = await generateOpener({
      fullName: record.fullName || '',
      jobTitle: record.jobTitle || '',
      company: record.companyName || '',
    });

    const openerText = openerResult && openerResult.opener ? openerResult.opener : '';

    record.opener = openerText;
    record.geminiUsage = openerResult.usageMetadata || null;
    record.geminiModel = openerResult.model || null;
    record.openerHistory = record.openerHistory || [];
    record.openerHistory.push({ text: openerText, geminiUsage: openerResult.usageMetadata || null, geminiModel: openerResult.model || null });
    record.updatedAt = new Date();

    await record.save();

    // record a history entry for regenerate if wallet provided
    if (w) {
      w.history = w.history || [];
      w.history.push({ searchId: record._id.toString(), linkedinUrl: record.linkedinUrl, recordedAt: new Date() });
      await w.save();
    }

    const formatted = {
      id: record._id,
      linkedinUrl: record.linkedinUrl,
      fullName: record.fullName,
      jobTitle: record.jobTitle,
      companyName: record.companyName,
      email: record.email,
      phone: record.phone,
      opener: record.opener,
      geminiModel: record.geminiModel || null,
      geminiUsageSummary: record.geminiUsage && record.geminiUsage.totalTokenCount ? { totalTokenCount: record.geminiUsage.totalTokenCount } : null,
      openerHistory: Array.isArray(record.openerHistory)
        ? record.openerHistory.map((h) => ({ text: h.text, createdAt: h.createdAt, geminiModel: h.geminiModel }))
        : [],
    };

    return res.json({ data: formatted });
  } catch (err) {
    logger.error('regenerateOpener error:', err);
    // refund if wallet was charged
    if (w) {
      try {
        await Wallet.findOneAndUpdate({ wallet }, { $inc: { credits: 1 } });
        logger.info('Refunded 1 credit to wallet after regenerate failure', wallet);
      } catch (e) {
        logger.error('failed to refund credit after regenerate error', e);
      }
    }
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
