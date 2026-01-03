const { body, param, validationResult } = require('express-validator');
const User = require('../models/User');

// Helper function to handle validation errors (DRY principle)
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

// Reusable password validation rule
const passwordValidationRules = () => [
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6, max: 20 })
        .withMessage('Password must be between 6 and 20 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
        .withMessage('Password must include uppercase, lowercase, number, and special character')
];

// Reusable name validation rule
const nameValidationRules = () => [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s\-']+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes')
];

// Reusable email validation rule
const emailValidationRules = () => [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail({ gmail_remove_dots: false })
];

const validateSignup = [
    ...nameValidationRules(),
    
    ...emailValidationRules(),
    body('email').custom(async (email) => {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('Email already in use');
        }
        return true;
    }),
    
    ...passwordValidationRules(),
    
    // Add confirm password validation
    body('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    
    handleValidationErrors
];

const validateSignin = [
    ...emailValidationRules(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

const validateForgotPassword = [
    ...emailValidationRules(),
    
    handleValidationErrors
];

const validateResetPassword = [
    param('token')
        .notEmpty()
        .withMessage('Reset token is required')
        .isLength({ min: 10 })
        .withMessage('Invalid token format'),
    
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 6, max: 20 })
        .withMessage('Password must be between 6 and 20 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
        .withMessage('New password must include uppercase, lowercase, number, and special character'),
    
    body('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password is required')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    
    handleValidationErrors
];

const validateUpdateProfile = [
    ...nameValidationRules(),
    
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail({ gmail_remove_dots: false })
        .custom(async (email, { req }) => {
            const user = await User.findOne({ email });
            if (user && user._id.toString() !== req.user.id) {
                throw new Error('Email already in use by another account');
            }
            return true;
        }),
    
    body('phone')
        .optional()
        .trim()
        .isMobilePhone()
        .withMessage('Invalid phone number format'),
    
    body('address')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Address cannot exceed 200 characters'),
    
    handleValidationErrors
];

const validateChangePassword = [
    body('oldPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 6, max: 20 })
        .withMessage('New password must be between 6 and 20 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
        .withMessage('New password must include uppercase, lowercase, number, and special character')
        .custom((value, { req }) => {
            if (value === req.body.oldPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        }),
    
    body('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password is required')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    
    handleValidationErrors
];

module.exports = {
    validateSignup,
    validateSignin,
    validateForgotPassword,
    validateResetPassword,
    validateUpdateProfile,
    validateChangePassword
};
