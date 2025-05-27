const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: [true, 'Booking ID is required'],
    unique: true,
    trim: true
  },
  userDetails: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Travel date is required']
    },
    persons: {
      type: Number,
      required: [true, 'Number of travelers is required'],
      min: [1, 'At least one traveler is required']
    }
  },
  packageInfo: {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true
    },
    duration: {
      type: String,
      required: [true, 'Package duration is required']
    },
    charge: {
      type: Number,
      required: [true, 'Package charge is required']
    },
    image: {
      type: String,
      default: null
    }
  },
  guideInfo: {
    name: {
      type: String,
      default: null
    },
    specialization: {
      type: String,
      default: null
    },
    guideId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Guide',
      default: null
    }
  },
  specialRequirements: {
    hasDisability: {
      type: Boolean,
      default: false
    },
    requirements: {
      type: String,
      default: ''
    }
  },
  paymentDetails: {
    paymentType: {
      type: String,
      required: [true, 'Payment type is required'],
      enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking']
    },
    cardNumber: {
      type: String,
      // Store only last 4 digits for security
      select: false
    },
    cardHolderName: {
      type: String,
      select: false
    },
    paymentId: {
      type: String,
      default: null
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  },
  bookingStatus: {
    type: String,
    required: [true, 'Booking status is required'],
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  cancellationReason: {
    type: String,
    default: null
  },
  cancellationDate: {
    type: Date,
    default: null
  },
  invoiceUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Generate booking ID before saving
BookingSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  // Format: TRP-YEAR-MONTH-RANDOMNUMBER
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  this.bookingId = `TRP-${year}${month}-${random}`;
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);