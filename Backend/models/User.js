const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },

  // Authentication
  authProvider: {
    type: String,
    enum: ['email', 'google', 'facebook'],
    default: 'email'
  },
  googleId: String,
  facebookId: String,

  // Profile
  phone: String,
  avatar: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },

  // Address
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },

  // Preferences
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    notifications: {
      type: Boolean,
      default: true
    },
    preferredLanguage: {
      type: String,
      default: 'en'
    }
  },

  // Bookings
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],

  // Payment Methods (Stored securely)
  savedPaymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'upi', 'netbanking']
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    // For cards (only last 4 digits stored)
    lastFourDigits: String,
    cardBrand: String,
    expiryMonth: String,
    expiryYear: String,
    // For UPI
    upiId: String,
    // For Net Banking
    bankName: String,
    // Metadata
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Password Reset
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Security
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Admin/Role
  role: {
    type: String,
    enum: ['user', 'admin', 'guide'],
    default: 'user'
  }

}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Remove sensitive data when converting to JSON
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
};

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to check if account is locked
UserSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Static method to get user statistics
UserSchema.statics.getUserStats = async function(userId) {
  const user = await this.findById(userId).populate('bookings');
  
  if (!user) return null;
  
  const totalBookings = user.bookings.length;
  const totalSpent = user.bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  
  return {
    totalBookings,
    totalSpent,
    memberSince: user.createdAt,
    lastBooking: user.bookings[0]?.bookingTimestamp
  };
};

module.exports = mongoose.model('User', UserSchema);