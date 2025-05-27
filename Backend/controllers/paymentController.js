const Payment = require('../models/Payment');
const Package = require('../models/Package');
const Guide = require('../models/Guide');
const mongoose = require('mongoose'); // Added for ObjectId validation

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      travelers,
      paymentMethod,
      packageId,
      guideId
    } = req.body;

    // Enhanced input validation
    const validationErrors = [];
    if (!name) validationErrors.push('Name is required');
    if (!email) validationErrors.push('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) validationErrors.push('Invalid email format');
    if (!phone) validationErrors.push('Phone number is required');
    if (!travelers || travelers <= 0) validationErrors.push('Invalid number of travelers');
    if (!packageId) validationErrors.push('Package ID is required');
    if (packageId && !mongoose.Types.ObjectId.isValid(packageId)) validationErrors.push('Invalid package ID format');
    if (guideId && !mongoose.Types.ObjectId.isValid(guideId)) validationErrors.push('Invalid guide ID format');

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors 
      });
    }

    // Fetch package details with error handling
    const packageDetails = await Package.findById(packageId).lean();
    if (!packageDetails) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Optional guide details
    let guideDetails = null;
    if (guideId) {
      guideDetails = await Guide.findById(guideId).lean();
      if (!guideDetails) {
        return res.status(404).json({ message: 'Guide not found' });
      }
    }

    // Calculate total amount with decimal precision
    // Convert to cents/smallest currency unit before calculations to avoid floating point issues
    const packageTotal = Math.round(packageDetails.charge * travelers * 100) / 100;
    const guideTotal = guideDetails ? Math.round(guideDetails.charge * travelers * 100) / 100 : 0;
    const totalAmount = parseFloat((packageTotal + guideTotal).toFixed(2));

    // Create payment record
    const payment = new Payment({
      name,
      email,
      phone,
      travelers,
      paymentMethod,
      packageDetails: {
        packageId: packageDetails._id,
        packageName: packageDetails.name,
        packageCharge: packageDetails.charge,
        duration: packageDetails.duration
      },
      guideDetails: guideDetails ? {
        guideId: guideDetails._id,
        guideName: guideDetails.name,
        guideCharge: guideDetails.charge || 0
      } : null,
      totalAmount,
      paymentStatus: 'pending',
      createdAt: new Date()
    });

    // Save payment
    const savedPayment = await payment.save();

    res.status(201).json({
      message: 'Payment initiated successfully',
      paymentId: savedPayment._id,
      totalAmount: savedPayment.totalAmount
    });
  } catch (error) {
    console.error('Payment creation error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // More specific error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      message: 'Error processing payment',
      error: 'Internal server error'
    });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(id)
      .populate('packageDetails.packageId')
      .populate('guideDetails.guideId')
      .lean();

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      message: 'Error retrieving payment',
      error: 'Internal server error'
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentStatus } = req.body;

    // Validate ID format
    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    // Enhanced validation
    const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        message: 'Invalid payment status',
        validStatuses,
        receivedStatus: paymentStatus
      });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { 
        paymentStatus,
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({
      message: 'Payment status updated successfully',
      payment: {
        id: payment._id,
        status: payment.paymentStatus
      }
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      message: 'Error updating payment status',
      error: 'Internal server error'
    });
  }
};

// Get all payments (with optional filtering)
exports.getAllPayments = async (req, res) => {
  try {
    const { 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Validate and parse inputs
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // Build filter object with input sanitization
    const filter = {};
    if (status) {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status filter',
          validStatuses,
          receivedStatus: status
        });
      }
      filter.paymentStatus = status;
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate date range
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid date format',
          receivedStart: startDate,
          receivedEnd: endDate
        });
      }
      
      if (start > end) {
        return res.status(400).json({ 
          message: 'Start date must be before end date',
          receivedStart: startDate,
          receivedEnd: endDate
        });
      }

      filter.createdAt = {
        $gte: start,
        $lte: end
      };
    }

    // Check if pagination is available
    if (typeof Payment.paginate !== 'function') {
      // Fallback if mongoose-paginate-v2 is not set up
      const skip = (pageNum - 1) * limitNum;
      const totalDocs = await Payment.countDocuments(filter);
      const totalPages = Math.ceil(totalDocs / limitNum);
      
      const payments = await Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('packageDetails.packageId')
        .populate('guideDetails.guideId')
        .lean();
      
      return res.status(200).json({
        totalPayments: totalDocs,
        totalPages,
        currentPage: pageNum,
        payments
      });
    }

    // Pagination with mongoose-paginate-v2
    const options = {
      page: pageNum,
      limit: limitNum,
      sort: { createdAt: -1 },
      populate: [
        'packageDetails.packageId',
        'guideDetails.guideId'
      ],
      lean: true // Convert to plain JavaScript objects
    };

    const payments = await Payment.paginate(filter, options);

    res.status(200).json({
      totalPayments: payments.totalDocs,
      totalPages: payments.totalPages,
      currentPage: payments.page,
      payments: payments.docs
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      message: 'Error retrieving payments',
      error: 'Internal server error'
    });
  }
};

// Cancel payment
exports.cancelPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Validate ID format
    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if payment can be cancelled
    if (payment.paymentStatus === 'completed') {
      return res.status(400).json({ 
        message: 'Cannot cancel a completed payment',
        currentStatus: payment.paymentStatus
      });
    }

    payment.paymentStatus = 'cancelled';
    payment.cancelledAt = new Date();
    payment.updatedAt = new Date();
    
    await payment.save();

    res.status(200).json({
      message: 'Payment cancelled successfully',
      payment: {
        id: payment._id,
        status: payment.paymentStatus
      }
    });
  } catch (error) {
    console.error('Cancel payment error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      message: 'Error cancelling payment',
      error: 'Internal server error'
    });
  }
};


// List all payments (admin-only route) with pagination and filtering
exports.listPayments = exports.getAllPayments;

// Process refund for a payment (placeholder)
exports.processRefund = async (req, res) => {
  // TODO: Implement refund logic
  return res.status(501).json({ message: 'Refund processing not implemented yet.' });
};

// Get payment history for a user (placeholder)
exports.getUserPaymentHistory = async (req, res) => {
  // TODO: Implement user payment history logic
  return res.status(501).json({ message: 'User payment history not implemented yet.' });
};

// Webhook endpoint for payment provider callbacks (placeholder)
exports.handlePaymentWebhook = async (req, res) => {
  // TODO: Implement webhook logic
  return res.status(501).json({ message: 'Payment webhook handler not implemented yet.' });
};