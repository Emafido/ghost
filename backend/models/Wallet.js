import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  credits: { type: Number, default: 0 },
  badges: [
    {
      tokenId: String,
      name: String,
      issuedAt: Date,
    },
  ],
  reputation: {
    score: { type: Number, default: 0 },
  },
  history: [
    {
      searchId: String,
      linkedinUrl: String,
      recordedAt: { type: Date, default: Date.now },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

WalletSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);
