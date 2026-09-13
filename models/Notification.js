import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false },
  userId: { type: String, required: true },
  time: { type: String, required: true }
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
