const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  otp: {
    type: String,
    required: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
  },
  
  used: {
    type: Boolean,
    default: false
  },
  
  usedAt: Date,
  
  attempts: {
    type: Number,
    default: 0
  },
  
  maxAttempts: {
    type: Number,
    default: 5
  },
  
  ipAddress: String,
  
  userAgent: String

}, {
  timestamps: true
});

// Index for automatic deletion of expired OTPs
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for quick lookups
PasswordResetSchema.index({ email: 1 });
PasswordResetSchema.index({ userId: 1 });
PasswordResetSchema.index({ otp: 1 });

// Check if OTP is valid
PasswordResetSchema.methods.isValid = function() {
  return !this.used && this.expiresAt > new Date() && this.attempts < this.maxAttempts;
};

// Increment attempt count
PasswordResetSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  return this.save();
};

// Mark OTP as used
PasswordResetSchema.methods.markAsUsed = async function() {
  this.used = true;
  this.usedAt = new Date();
  return this.save();
};

// Generate 6-digit OTP
PasswordResetSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = mongoose.model('PasswordReset', PasswordResetSchema);