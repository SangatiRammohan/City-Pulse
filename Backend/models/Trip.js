import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true,
    minlength: [2, 'Destination name must be at least 2 characters long'],
    maxlength: [100, 'Destination name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  index: {
    type: Number,
    required: [true, 'Destination index is required'],
    min: [0, 'Index cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Index must be an integer'
    }
  }
});

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Trip title is required'],
    trim: true,
    minlength: [3, 'Trip title must be at least 3 characters long'],
    maxlength: [100, 'Trip title cannot exceed 100 characters']
  },
  packageType: {
    type: String,
    required: [true, 'Package type is required'],
    enum: {
      values: ['adventure', 'leisure', 'cultural', 'family', 'group'],
      message: 'Package type must be one of: adventure, leisure, cultural, family, group'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  destinations: {
    type: [destinationSchema],
    validate: {
      validator: function(destinations) {
        return destinations.length > 0;
      },
      message: 'Trip must have at least one destination'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Start date cannot be in the past'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Price must be a valid number'
    }
  },
  maxGroupSize: {
    type: Number,
    default: 10,
    min: [1, 'Group size must be at least 1'],
    max: [50, 'Group size cannot exceed 50'],
    validate: {
      validator: Number.isInteger,
      message: 'Group size must be an integer'
    }
  },
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'moderate', 'challenging'],
      message: 'Difficulty must be one of: easy, moderate, challenging'
    },
    default: 'moderate'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: 'Images must be valid image files (jpg, jpeg, png, gif)'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property for trip duration
tripSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return null;
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Validate end date is after start date
tripSchema.pre('validate', function(next) {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// Create indexes for better query performance
tripSchema.index({ packageType: 1 });
tripSchema.index({ createdBy: 1 });
tripSchema.index({ startDate: 1 });
tripSchema.index({ price: 1 });
tripSchema.index({ difficulty: 1 });
tripSchema.index({ 'destinations.name': 1 });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;