import mongoose from 'mongoose';

const SearchResultSchema = new mongoose.Schema({
  linkedinUrl: { type: String, required: true },
  fullName: { type: String },
  jobTitle: { type: String },
  companyName: { type: String },
  email: { type: String },
  phone: { type: String },
  opener: { type: String },
  openerHistory: [
    {
      text: String,
      createdAt: { type: Date, default: Date.now },
      geminiUsage: { type: mongoose.Schema.Types.Mixed },
      geminiModel: String,
    },
  ],
  geminiUsage: { type: mongoose.Schema.Types.Mixed },
  geminiModel: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SearchResult || mongoose.model('SearchResult', SearchResultSchema);
