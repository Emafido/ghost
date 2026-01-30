import Wallet from '../models/Wallet.js';

export function getSignupBonus() {
  const n = parseInt(process.env.SIGNUP_BONUS_CREDITS || '3', 10);
  return Number.isNaN(n) ? 3 : n;
}

export async function ensureWalletWithDefaults(walletAddr) {
  const bonus = getSignupBonus();
  const defaults = {
    credits: walletAddr === '0xTESTWALLET' ? 10 : bonus,
    badges: walletAddr === '0xTESTWALLET' ? [{ tokenId: '1', name: 'Early Adopter', issuedAt: new Date() }] : [],
    reputation: { score: walletAddr === '0xTESTWALLET' ? 72 : 0 },
  };

  // upsert with defaults
  const w = await Wallet.findOneAndUpdate(
    { wallet: walletAddr },
    { $setOnInsert: defaults },
    { upsert: true, new: true }
  );

  return w;
}

export default { getSignupBonus, ensureWalletWithDefaults };
