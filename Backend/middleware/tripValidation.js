const { body, param, validationResult } = require('express-validator');

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

const validPackageTypes = [
    'weekend_tours',
    'summer_holiday_tour',
    'kerala_tour',
    'hill_station_tour',
    'golden_triangle_tours',
    'goa_tour',
    'beach_tours_india'
];

const validateTripCreation = [
    body('packageType')
        .trim()
        .notEmpty()
        .withMessage('Package type is required')
        .isIn(validPackageTypes)
        .withMessage(`Invalid package type. Must be one of: ${validPackageTypes.join(', ')}`),
    
    body('destinationIndex')
        .isInt({ min: 0 })
        .withMessage('Destination index must be a non-negative integer'),
    
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a non-negative number'),
    
    body('duration')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Duration must be a positive integer'),
    
    body('inclusions')
        .optional()
        .isArray()
        .withMessage('Inclusions must be an array'),
    
    body('excludes')
        .optional()
        .isArray()
        .withMessage('Excludes must be an array'),
    
    handleValidationErrors
];

const validateTripParams = [
    param('packageType')
        .trim()
        .notEmpty()
        .withMessage('Package type is required')
        .isIn(validPackageTypes)
        .withMessage(`Invalid package type. Must be one of: ${validPackageTypes.join(', ')}`),
    
    param('destinationIndex')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Destination index must be a non-negative integer'),
    
    param('id')
        .optional()
        .isMongoId()
        .withMessage('Invalid trip ID format'),
    
    handleValidationErrors
];

module.exports = {
    validPackageTypes,
    validateTripCreation,
    validateTripParams
};