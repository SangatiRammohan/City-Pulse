const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    // ❌ DO NOT add index: true here
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  
  unsubscribedAt: Date,
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  source: {
    type: String,
    enum: ['website', 'booking', 'manual'],
    default: 'website'
  },
  
  preferences: {
    newTrips: {
      type: Boolean,
      default: true
    },
    discounts: {
      type: Boolean,
      default: true
    },
    weeklyDigest: {
      type: Boolean,
      default: false
    }
  },
  
  emailStats: {
    totalSent: {
      type: Number,
      default: 0
    },
    totalOpened: {
      type: Number,
      default: 0
    },
    totalClicked: {
      type: Number,
      default: 0
    },
    lastEmailSent: Date
  }
  
}, {
  timestamps: true
});

// ✅ Only declare indexes here (not in field definition above)
NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ isActive: 1 });
NewsletterSchema.index({ subscribedAt: -1 });

// Methods
NewsletterSchema.methods.unsubscribe = function() {
  this.isActive = false;
  this.unsubscribedAt = new Date();
  return this.save();
};

NewsletterSchema.methods.resubscribe = function() {
  this.isActive = true;
  this.unsubscribedAt = undefined;
  return this.save();
};

NewsletterSchema.statics.getActiveSubscribers = async function() {
  return this.find({ isActive: true });
};

NewsletterSchema.statics.getSubscribersCount = async function() {
  return {
    total: await this.countDocuments(),
    active: await this.countDocuments({ isActive: true }),
    inactive: await this.countDocuments({ isActive: false })
  };
};

module.exports = mongoose.model('Newsletter', NewsletterSchema);