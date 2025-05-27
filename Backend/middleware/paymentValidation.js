const { body, param, validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed',
            errors: errors.array() 
        });
    }
    next();
};

const validatePaymentInput = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s\-']+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail({ gmail_remove_dots: false }),
    
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .isMobilePhone('any')
        .withMessage('Invalid phone number')
        .custom((value) => {
            // Simplified regex that handles international formats better
            const phoneRegex = /^[+]?[0-9]{1,4}?[-.\s]?[(]?[0-9]{1,3}[)]?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}$/;
            if (!phoneRegex.test(value)) {
                throw new Error('Phone number format is invalid');
            }
            return true;
        }),
    
    body('travelers')
        .isInt({ min: 1, max: 20 })
        .withMessage('Number of travelers must be between 1 and 20'),
    
    body('paymentMethod')
        .isIn(['credit', 'debit', 'upi', 'netbanking', 'wallet', 'paypal'])
        .withMessage('Invalid payment method'),
    
    body('packageId')
        .notEmpty()
        .withMessage('Package ID is required')
        .isMongoId()
        .withMessage('Invalid package ID'),
    
    // Add optional amount validation
    body('amount')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number'),
    
    handleValidationErrors
];

const validatePaymentStatusUpdate = [
    param('paymentId')
        .isMongoId()
        .withMessage('Invalid payment ID'),
    
    body('paymentStatus')
        .isIn(['pending', 'processing', 'completed', 'failed', 'refunded'])
        .withMessage('Invalid payment status'),
    
    // Add optional transaction ID validation
    body('transactionId')
        .optional()
        .isString()
        .isLength({ min: 6, max: 100 })
        .withMessage('Transaction ID must be between 6 and 100 characters'),
    
    handleValidationErrors
];

module.exports = {
    validatePaymentInput,
    validatePaymentStatusUpdate
};