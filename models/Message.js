import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  conversationId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true },
  type: { type: String, default: 'text' }
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
