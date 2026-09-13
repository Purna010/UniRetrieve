import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['lost', 'found'] },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    label: { type: String }
  },
  date: { type: String, required: true },
  images: [{ type: String }],
  tags: [{ type: String }],
  aiTags: [{ type: String }],
  reportedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true }
  },
  status: { type: String, default: 'unclaimed' },
  blockchainHash: { type: String },
  blockchainBlock: { type: Number },
  aiCategory: { type: String },
  aiConfidence: { type: Number },
  ocrText: { type: String, default: '' },
  ocrKeywords: [{ type: String }],
  createdAt: { type: String, required: true }
});

ItemSchema.index({ location: '2dsphere' });

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);
