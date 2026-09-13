import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  matchId: { type: String },
  participants: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String, default: null },
      role: { type: String },
      status: { type: String, default: 'offline' }
    }
  ],
  itemTitle: { type: String, required: true },
  lastMessage: { type: String },
  lastMessageTime: { type: String },
  unread: { type: Number, default: 0 }
});

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
