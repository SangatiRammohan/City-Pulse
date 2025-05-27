const mongoose = require('mongoose');
const slugify = require('slugify');

const PackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Package name cannot be more than 100 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Package description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  duration: {
    type: String,
    required: [true, 'Package duration is required']
  },
  charge: {
    type: Number,
    required: [true, 'Package charge is required']
  },
  category: {
    type: String,
    required: [true, 'Package category is required'],
    enum: [
      'beach_tours_india',
      'weekend_tours',
      'summer_holiday_tour',
      'kerala_tour',
      'hill_station_tour',
      'golden_triangle_tours',
      'goa_tour'
    ]
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  images: [String],
  highlights: [String],
  inclusions: [String],
  exclusions: [String],
  dayWisePlan: [{
    day: Number,
    title: String,
    activities: [String]
  }],
  locations: [{
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    city: String,
    state: String,
    country: String
  }],
  accessibilityOptions: [{
    type: String,
    enum: ['wheelchair', 'hearing', 'vision', 'mobility', 'cognitive', 'dietary']
  }],
  totalUsers: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not be more than 5'],
    default: 4.5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create package slug from the name
PackageSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Reverse populate with virtual field
PackageSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'package',
  justOne: false
});

module.exports = mongoose.model('Package', PackageSchema);