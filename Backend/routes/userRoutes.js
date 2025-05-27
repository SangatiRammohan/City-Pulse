const express = require('express');
const userController = require('../controllers/userController');
const {
   validateSignup,
   validateSignin,
   validateForgotPassword,
   validateResetPassword,
   validateUpdateProfile,
   validateChangePassword
} = require('../middleware/userValidation');
const {
   authMiddleware,
   rateLimitMiddleware
} = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes with Rate Limiting
router.post(
   '/signup',
   rateLimitMiddleware(50, 'signup'), // Limit signup attempts
   validateSignup,
   userController.signup
);

router.post(
   '/signin',
   rateLimitMiddleware(10, 'signin'), // Limit login attempts
   validateSignin,
   userController.signin
);

router.get(
   '/verify-email/:token',
   rateLimitMiddleware(5, 'verify-email'),
   userController.verifyEmail
);

router.post(
   '/forgot-password',
   rateLimitMiddleware(5, 'forgot-password'),
   validateForgotPassword,
   userController.forgotPassword
);

router.post(
   '/reset-password/:token',
   rateLimitMiddleware(5, 'reset-password'),
   validateResetPassword,
   userController.resetPassword
);

// Protected Routes
router.get(
   '/profile',
   authMiddleware,
   userController.getUserProfile
);

router.put(
   '/profile',
   authMiddleware,
   validateUpdateProfile,
   userController.updateUserProfile
);

router.patch(
   '/change-password',
   authMiddleware,
   validateChangePassword,
   userController.changePassword
);

// Keep logout route commented if the controller method doesn't exist
// router.post(
//    '/logout',
//    authMiddleware,
//    userController.logout  // This function is missing in your controller
// );

// Two-Factor Authentication Routes remain commented
// router.post(
//   '/2fa/enable',
//   authMiddleware,
//   userController.enableTwoFactorAuth
// );

// router.post(
//   '/2fa/disable',
//   authMiddleware,
//   userController.disableTwoFactorAuth
// );

// router.post(
//   '/2fa/verify',
//   rateLimitMiddleware(5, '2fa-verify'),
//   userController.verifyTwoFactorAuth
// );

module.exports = router;