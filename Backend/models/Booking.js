const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  // Booking Identification
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },

  // Package Information
  packageName: {
    type: String,
    required: true
  },
  packageInfo: {
    name: String,
    charge: Number,
    duration: String,
    description: String
  },
  selectedPackage: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },

  // Pricing
  amount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },

  // Travelers Information
  travelers: [{
    name: {
      type: String,
      required: true
    },
    age: Number,
    gender: String,
    idType: String,
    idNumber: String
  }],

  // User Details
  userDetails: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    persons: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },

  // Payment Information
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'credit', 'debit', 'upi', 'netbanking']
  },
  
  paymentDetails: {
    // Common fields
    paymentType: String,
    method: String,
    transactionId: String,
    transactionDate: Date,

    // Credit/Debit Card Details (masked)
    cardNumber: String,           // Stored as ****-****-****-1234
    cardHolderName: String,
    expiryDate: String,
    cardType: String,             // Visa, MasterCard, etc.

    // UPI Details
    upiId: String,

    // Net Banking Details
    bank: String,
    username: String,
    // Note: Password is NEVER stored

    // Payment Status
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Completed'
    },
    
    // Additional Info
    paymentGateway: String,
    gatewayResponse: String
  },

  // Guide Selection
  selectedGuide: {
    id: Number,
    name: String,
    email: String,
    phone: String,
    description: String,
    specialties: [String],
    languages: [String],
    image: String,
    instagram: String,
    facebook: String,
    x: String,
    bio: String,
    available: Boolean,
    reviews: [mongoose.Schema.Types.Mixed]
  },

  // Booking Status
  bookingStatus: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
    default: 'Confirmed'
  },

  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
    default: 'Paid'
  },

  // Timestamps
  bookingTimestamp: {
    type: Date,
    default: Date.now
  },
  
  // User Reference (if logged in)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  // Invoice Details
  invoiceSent: {
    type: Boolean,
    default: false
  },
  invoiceSentAt: Date,
  
  // Cancellation Details
  cancellationReason: String,
  cancelledAt: Date,
  refundAmount: Number,
  refundStatus: String,

  // Additional Notes
  specialRequests: String,
  internalNotes: String

}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for better query performance
BookingSchema.index({ bookingId: 1 });
BookingSchema.index({ 'userDetails.email': 1 });
BookingSchema.index({ 'userDetails.phone': 1 });
BookingSchema.index({ user: 1 });
BookingSchema.index({ bookingTimestamp: -1 });
BookingSchema.index({ paymentStatus: 1 });
BookingSchema.index({ bookingStatus: 1 });


// Virtual for formatted booking date
BookingSchema.virtual('formattedDate').get(function() {
  return this.bookingTimestamp.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Method to mask sensitive payment details
BookingSchema.methods.maskSensitiveData = function() {
  const booking = this.toObject();
  
  if (booking.paymentDetails) {
    // Mask card number if present
    if (booking.paymentDetails.cardNumber && booking.paymentDetails.cardNumber.length > 4) {
      const lastFour = booking.paymentDetails.cardNumber.slice(-4);
      booking.paymentDetails.cardNumber = `****-****-****-${lastFour}`;
    }
    
    // Remove CVV (should never be stored anyway)
    delete booking.paymentDetails.cvv;
    
    // Remove password (should never be stored anyway)
    delete booking.paymentDetails.password;
  }
  
  return booking;
};

// Static method to get booking statistics
BookingSchema.statics.getStatistics = async function() {
  const totalBookings = await this.countDocuments();
  const totalRevenue = await this.aggregate([
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  
  const statusBreakdown = await this.aggregate([
    { $group: { _id: '$bookingStatus', count: { $sum: 1 } } }
  ]);
  
  return {
    totalBookings,
    totalRevenue: totalRevenue[0]?.total || 0,
    statusBreakdown
  };
};

module.exports = mongoose.model('Booking', BookingSchema);