import Wallet from '../models/Wallet.js';
import SearchResult from '../models/SearchResult.js';
import logger from '../utils/logger.js';
import { getSignupBonus, ensureWalletWithDefaults } from '../utils/walletService.js';

// Helper: find or create wallet with sensible defaults
async function findOrCreateWallet(walletAddr) {
  // use centralized helper so signup bonus is consistent
  const w = await ensureWalletWithDefaults(walletAddr);
  // ensure we return a fully populated document (findOneAndUpdate with new:true may return null when upserted in some drivers)
  return (await Wallet.findOne({ wallet: walletAddr })) || w;
}

export const getCredits = async (req, res) => {
  const { wallet } = req.params;
  const w = await findOrCreateWallet(wallet);
  return res.json({ wallet: w.wallet, balance: w.credits });
};

export const getHistory = async (req, res) => {
  const { wallet } = req.params;
  const w = await findOrCreateWallet(wallet);
  return res.json({ wallet: w.wallet, history: w.history });
};

export const getBadges = async (req, res) => {
  const { wallet } = req.params;
  const w = await findOrCreateWallet(wallet);
  return res.json({ wallet: w.wallet, badges: w.badges });
};

export const getReputation = async (req, res) => {
  const { wallet } = req.params;
  const w = await findOrCreateWallet(wallet);
  return res.json({ wallet: w.wallet, reputation: w.reputation });
};

// Deduct credits and persist
export const deductCredit = async (req, res) => {
  const { wallet, amount = 1 } = req.body;
  if (!wallet) return res.status(400).json({ error: 'wallet required' });
  // atomic decrement
  await findOrCreateWallet(wallet);
  const updated = await Wallet.findOneAndUpdate({ wallet, credits: { $gte: amount } }, { $inc: { credits: -amount } }, { new: true });
  if (!updated) {
    logger.info('Deduct failed, insufficient credits', wallet);
    return res.status(402).json({ error: 'Insufficient credits' });
  }
  logger.info('Deducted credits', { wallet, amount, newBalance: updated.credits });
  return res.json({ wallet: updated.wallet, balance: updated.credits });
};

// Buy credits (called after payment is confirmed)
export const buyCredits = async (req, res) => {
  const { wallet, amount } = req.body || {};
  if (!wallet) return res.status(400).json({ error: 'wallet required' });
  const n = parseInt(amount, 10);
  if (!n || n <= 0) return res.status(400).json({ error: 'amount must be a positive integer' });

  // ensure wallet exists
  await findOrCreateWallet(wallet);
  const updated = await Wallet.findOneAndUpdate({ wallet }, { $inc: { credits: n } }, { new: true });
  logger.info('Bought credits', { wallet, amount: n, newBalance: updated.credits });
  return res.json({ wallet: updated.wallet, balance: updated.credits });
};

// Record a search in DB (also keep as reference to SearchResult if exists)
export const recordSearch = async (req, res) => {
  const { wallet, search } = req.body;
  if (!wallet || !search) return res.status(400).json({ error: 'wallet and search required' });
  const w = await findOrCreateWallet(wallet);
  // push to wallet history
  const entry = {
    searchId: search.id || (search._id ?? null),
    linkedinUrl: search.linkedinUrl || null,
    recordedAt: new Date(),
  };
  w.history = w.history || [];
  w.history.push(entry);
  await w.save();

  // If a SearchResult exists with that id, ensure it's linked (no schema change but we could store relation later)
  if (entry.searchId) {
    try {
      const sr = await SearchResult.findById(entry.searchId);
      if (sr) {
        // optional: update updatedAt
        sr.updatedAt = new Date();
        await sr.save();
      }
    } catch (e) {
      // ignore invalid ids
    }
  }

  return res.json({ wallet: w.wallet, recorded: true });
};

export default {
  getCredits,
  getHistory,
  getBadges,
  getReputation,
  deductCredit,
  buyCredits,
  recordSearch,
};
