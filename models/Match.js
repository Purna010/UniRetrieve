import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  lostItemId: { type: String, required: true },
  foundItemId: { type: String, required: true },
  similarityScore: { type: Number, required: true },
  status: { type: String, default: 'pending_claim' },
  locationMatch: { type: Boolean, default: false },
  locationDistance: { type: Number },
  aiConfidence: { type: Number },
  claimRequestSent: { type: Boolean, default: false },
  claimAttempts: { type: Number, default: 0 },
  ocrVerified: { type: Boolean },
  ocrExtractedText: { type: String },
  blockchainClaimTxHash: { type: String },
  blockchainClaimBlock: { type: Number },
  blockchainResolutionTxHash: { type: String },
  blockchainResolutionBlock: { type: Number },
  verification: {
    studentId: { type: String },
    uniqueMarks: { type: String },
    contentsDesc: { type: String },
    proofImage: { type: String },
    submittedAt: { type: String }
  },
  matchedAt: { type: String, required: true }
});

export default mongoose.models.Match || mongoose.model('Match', MatchSchema);
