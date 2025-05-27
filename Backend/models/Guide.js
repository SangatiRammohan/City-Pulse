const mongoose = require('mongoose');

const GuideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Guide name is required'],
    trim: true
  },
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  bio: {
    type: String,
    required: [true, 'Guide bio is required'],
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required']
  },
  languages: {
    type: [String],
    required: [true, 'At least one language is required']
  },
  experience: {
    type: Number,
    required: [true, 'Years of experience is required']
  },
  locations: [{
    type: String,
    required: [true, 'Location is required']
  }],
  ratings: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not be more than 5'],
    default: 4.5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  qualifications: [String],
  certifications: [String],
  availability: {
    type: Boolean,
    default: true
  },
  specialExpertise: {
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    hearingImpaired: {
      type: Boolean,
      default: false
    },
    visuallyImpaired: {
      type: Boolean,
      default: false
    },
    seniorCitizens: {
      type: Boolean,
      default: false
    }
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Guide', GuideSchema);