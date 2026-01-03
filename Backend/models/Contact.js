const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'resolved', 'archived'],
    default: 'new'
  },
  
  source: {
    type: String,
    default: 'website'
  },
  
  ipAddress: String,
  
  userAgent: String,
  
  readAt: Date,
  
  repliedAt: Date,
  
  replyMessage: String,
  
  notes: String

}, {
  timestamps: true
});

// Indexes
ContactSchema.index({ email: 1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ createdAt: -1 });

// Static method to get unread count
ContactSchema.statics.getUnreadCount = async function() {
  return this.countDocuments({ status: 'new' });
};

module.exports = mongoose.model('Contact', ContactSchema);