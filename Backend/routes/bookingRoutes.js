const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { downloadInvoice } = require('../controllers/bookingController');
const Booking = require('../models/Booking');

// Middleware to handle validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Create a new booking route with comprehensive validation
router.post('/create', [
  // Validation middleware
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('packageName').notEmpty().withMessage('Package name is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('travelers').isArray().withMessage('Travelers must be an array'),
  body('travelers.*.name').notEmpty().withMessage('Traveler name is required'),
  body('travelers.*.age').optional().isInt({ min: 0 }).withMessage('Traveler age must be a positive integer'),
  body('paymentDetails').isObject().withMessage('Payment details must be an object'),
  body('paymentDetails.method').notEmpty().withMessage('Payment method is required'),
  body('selectedPackage').isObject().withMessage('Selected package must be an object'),
  validateRequest
], async (req, res) => {
  try {
    const {
      bookingId,
      packageName,
      amount,
      paymentDetails,
      travelers,
      selectedPackage
    } = req.body;

    // Check for existing booking with the same ID
    const existingBooking = await Booking.findOne({ bookingId });
    if (existingBooking) {
      return res.status(409).json({
        message: 'Booking with this ID already exists'
      });
    }

    // Create new booking
    const newBooking = new Booking({
      bookingId,
      packageName,
      amount,
      paymentDetails,
      travelers,
      selectedPackage,
      bookingTimestamp: new Date(),
      status: 'confirmed' // Add default status
    });

    // Save booking to database
    const savedBooking = await newBooking.save();

    // Respond with success
    res.status(201).json({
      message: 'Booking created successfully',
      booking: savedBooking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// Get booking by ID with validation
router.get('/:bookingId', [
  // Validate booking ID parameter
  param('bookingId').notEmpty().withMessage('Booking ID is required'),
  validateRequest
], async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId
    }).lean(); // Use lean() for better performance

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Booking fetch error:', error);
    res.status(500).json({
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// Get all bookings with pagination and optional filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isString().withMessage('Status must be a string'),
  validateRequest
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const totalBookings = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ bookingTimestamp: -1 }) // Sort by most recent first
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      total: totalBookings,
      page,
      limit,
      totalPages: Math.ceil(totalBookings / limit),
      bookings
    });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// Download invoice route
// router.get('/:bookingId/invoice', [
//   param('bookingId').notEmpty().withMessage('Booking ID is required'),
//   validateRequest
// ], downloadInvoice);

// Update booking status
router.patch('/:bookingId/status', [
  param('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('status').isIn(['confirmed', 'cancelled', 'completed', 'pending']).withMessage('Invalid status value'),
  validateRequest
], async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    
    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }
    
    booking.status = req.body.status;
    const updatedBooking = await booking.save();
    
    res.status(200).json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Booking update error:', error);
    res.status(500).json({
      message: 'Error updating booking status',
      error: error.message
    });
  }
});

module.exports = router;