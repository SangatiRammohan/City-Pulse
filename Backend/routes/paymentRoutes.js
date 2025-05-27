const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const {
  validatePaymentInput,
  validatePaymentStatusUpdate,
  validateRefundRequest
} = require('../middleware/paymentValidation');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Create a new payment
router.post(
  '/create',
  // authenticate, // Ensure user is logged in
  validatePaymentInput,
  paymentController.createPayment
);

// Get payment details by ID (with role-based access)
router.get(
  '/:id',
  // authenticate, // Ensure user is authenticated
  authorize(['admin', 'user']), // Restrict access to specific roles
  paymentController.getPaymentById
);

// Update payment status (admin-only route)
router.patch(
  '/:paymentId/status',
  // authenticate, // Ensure user is authenticated
  authorize(['admin']), // Only admins can update payment status
  validatePaymentStatusUpdate,
  paymentController.updatePaymentStatus
);

// List all payments (admin-only route) with pagination and filtering
router.get(
  '/',
  // authenticate, // Ensure user is authenticated
  authorize(['admin']), // Only admins can list all payments
  paymentController.listPayments
);

// Process refund for a payment
// router.post(
//   '/:paymentId/refund',
//   // authenticate,
//   authorize(['admin']),
//   validateRefundRequest, // Added validation middleware for refund requests
//   paymentController.processRefund
// );

// Get payment history for a user (for user dashboard)
router.get(
  '/user/history',
  // authenticate,
  paymentController.getUserPaymentHistory
);

// Webhook endpoint for payment provider callbacks
router.post(
  '/webhook',
  paymentController.handlePaymentWebhook
);

module.exports = router;