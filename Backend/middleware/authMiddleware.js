const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const rateLimitMiddleware = (limit, windowMs = 15 * 60 * 1000, key = 'ip') => {
    return rateLimit({
        windowMs: windowMs, // Default: 15 minutes
        max: limit, // Limit each IP/key to `limit` requests per windowMs
        keyGenerator: (req) => {
            // If key is 'ip', use the default behavior
            if (key === 'ip') return req.ip;
            // Otherwise use the specified key from request
            return req[key] || req.headers[key] || key;
        },
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: {
            error: 'Too many requests, please try again later.'
        }
    });
};

// Authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        
        // Check if token starts with 'Bearer '
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ message: 'Token format is invalid' });
        }
        
        const token = parts[1];
        
        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (verifyError) {
            if (verifyError.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token' });
            }
            if (verifyError.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Authentication failed' });
        }
        
        // Find user
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        // Catch any unexpected errors
        res.status(500).json({
            message: 'Server error during authentication'
        });
    }
};

const authorize = (roles) => {
    return (req, res, next) => {
        // Check if user has the required role
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

module.exports = {
    rateLimitMiddleware,
    authMiddleware,
    authorize
};
