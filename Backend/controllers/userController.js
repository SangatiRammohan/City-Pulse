const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const validator = require('validator');

// Generate JWT Token with improved security
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      tokenVersion: user.tokenVersion || 0 // Added to invalidate tokens on password change
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '7d',
      algorithm: 'HS256'
    }
  );
};

// Helper for secure token comparison (prevents timing attacks)
const compareTokens = (tokenA, tokenB) => {
  try {
    const bufA = Buffer.from(tokenA, 'hex');
    const bufB = Buffer.from(tokenB, 'hex');
    
    if (bufA.length !== bufB.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (error) {
    return false;
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Comprehensive input validation
    const validationErrors = [];
    if (!name || name.trim().length < 2) validationErrors.push('Name must be at least 2 characters long');
    if (!email) validationErrors.push('Email is required');
    if (!validator.isEmail(email)) validationErrors.push('Invalid email format');
    
    // Improved password validation
    if (!password) validationErrors.push('Password is required');
    else if (password.length < 8) validationErrors.push('Password must be at least 8 characters long');
    else if (!/\d/.test(password)) validationErrors.push('Password must contain at least one number');
    else if (!/[A-Z]/.test(password)) validationErrors.push('Password must contain at least one uppercase letter');

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors 
      });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      isVerified: false,
      registeredAt: new Date(),
      tokenVersion: 0,
      emailVerificationSent: false // Track if verification was sent
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpires = Date.now() + 3600000; // 1 hour
    
    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
      user.emailVerificationSent = true;
    } catch (emailError) {
      console.error('Verification email send error:', emailError);
      // Continue but flag that email wasn't sent
    }
    
    // Save user with verification token
    await user.save();

    // Generate authentication token
    const token = generateToken(user);

    res.status(201).json({
      message: user.emailVerificationSent 
        ? 'User registered successfully. Please check your email to verify your account.'
        : 'User registered successfully, but there was an issue sending the verification email. Please contact support.',
      token,
      userId: user._id
    });
  } catch (error) {
    console.error('Signup error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    res.status(500).json({ 
      message: 'Error in user registration', 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ 
        message: 'Valid email is required' 
      });
    }
    
    if (!password) {
      return res.status(400).json({ 
        message: 'Password is required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Consider implementing attempt tracking here for rate limiting
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // If verification email wasn't sent successfully, offer to resend
      if (!user.emailVerificationSent) {
        return res.status(403).json({ 
          message: 'Please verify your email first. Previous verification email could not be sent.', 
          resendOption: true 
        });
      }
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Signin error:', {
      message: error.message,
      name: error.name
    });

    res.status(500).json({ 
      message: 'Error in user login', 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Validate token
    if (!token || token.length !== 64) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Find user with this token
    const user = await User.findOne({ 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verifiedAt = new Date();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ 
      message: 'Email verified successfully',
      userId: user._id
    });
  } catch (error) {
    console.error('Email verification error:', {
      message: error.message,
      name: error.name
    });

    res.status(500).json({ 
      message: 'Error verifying email', 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Use generic message to prevent email enumeration
    if (!user || user.isVerified) {
      return res.status(200).json({ 
        message: 'If an unverified account exists, a verification email will be sent' 
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = verificationToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    try {
      await sendVerificationEmail(user, verificationToken);
      user.emailVerificationSent = true;
    } catch (emailError) {
      console.error('Verification email send error:', emailError);
      user.emailVerificationSent = false;
      await user.save();
      return res.status(500).json({ message: 'Error sending verification email' });
    }
    
    await user.save();

    res.status(200).json({ 
      message: 'If an unverified account exists, a verification email will be sent' 
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      message: 'Error in resending verification', 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Use generic message to prevent email enumeration
      return res.status(200).json({ 
        message: 'If an account exists, a password reset link will be sent' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset password email
    try {
      await sendResetPasswordEmail(user, resetToken);
    } catch (emailError) {
      console.error('Reset password email error:', emailError);
      // Consider adding a flag here similar to emailVerificationSent
    }

    res.status(200).json({ 
      message: 'If an account exists, a password reset link will be sent' 
    });
  } catch (error) {
    console.error('Forgot password error:', {
      message: error.message,
      name: error.name
    });

    res.status(500).json({ 
      message: 'Error in forgot password process', 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate inputs
    if (!token || token.length !== 64) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Improved password validation
    const validationErrors = [];
    if (!newPassword) validationErrors.push('Password is required');
    else if (newPassword.length < 8) validationErrors.push('Password must be at least 8 characters long');
    else if (!/\d/.test(newPassword)) validationErrors.push('Password must contain at least one number');
    else if (!/[A-Z]/.test(newPassword)) validationErrors.push('Password must contain at least one uppercase letter');

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Password validation failed',
        errors: validationErrors 
      });
    }

    // Find user with this token
    const user = await User.findOne({ 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password and increment tokenVersion to invalidate existing JWTs
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordLastChanged = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', {
      message: error.message,
      name: error.name
    });

    res.status(500).json({ 
      message: 'Error resetting password', 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

// Helper function to send verification email
async function sendVerificationEmail(user, token) {
  // Ensure email service is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email service not configured');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
    to: user.email,
    subject: 'Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Hi ${user.name},</p>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `
  });
}

// Helper function to send reset password email
async function sendResetPasswordEmail(user, token) {
  // Ensure email service is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email service not configured');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hi ${user.name},</p>
        <p>You have requested to reset your password. Click the link below:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      </div>
    `
  });
}

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From authenticated middleware
    
    // Validate userId format (if using MongoDB ObjectId)
    if (!userId || !validator.isMongoId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if token version matches the one in the database
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Token version check - invalidate tokens after password changes
    if (user.tokenVersion !== req.user.tokenVersion) {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      message: 'Error retrieving user profile',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From authenticated middleware
    
    // Validate userId format (if using MongoDB ObjectId)
    if (!userId || !validator.isMongoId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Only extract the fields we want to update
    const { name, email } = req.body;

    // Validate inputs
    const validationErrors = [];
    if (!name || name.trim().length < 2) validationErrors.push('Name must be at least 2 characters long');
    if (!email) validationErrors.push('Email is required');
    if (!validator.isEmail(email)) validationErrors.push('Invalid email format');

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors 
      });
    }

    // Check if trying to change to an email that already exists
    if (email !== req.user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Token version check
    if (user.tokenVersion !== req.user.tokenVersion) {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }

    user.name = name.trim();
    
    // If email is being changed, require re-verification
    if (email.toLowerCase() !== user.email) {
      user.email = email.toLowerCase();
      user.isVerified = false;
      user.emailVerificationSent = false;
      
      // Generate verification token for new email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = verificationToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      
      try {
        await sendVerificationEmail(user, verificationToken);
        user.emailVerificationSent = true;
      } catch (emailError) {
        console.error('Verification email send error:', emailError);
      }
    }
    
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      ...userResponse,
      message: user.email !== email && user.emailVerificationSent 
        ? 'Profile updated. Please verify your new email address.' 
        : 'Profile updated successfully.'
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ 
      message: 'Error updating user profile',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // From authenticated middleware
    
    // Validate userId format (if using MongoDB ObjectId)
    if (!userId || !validator.isMongoId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const { oldPassword, newPassword } = req.body;

    // Validate inputs
    if (!oldPassword) {
      return res.status(400).json({ message: 'Current password is required' });
    }
    
    // Improved password validation
    const validationErrors = [];
    if (!newPassword) validationErrors.push('New password is required');
    else if (newPassword.length < 8) validationErrors.push('Password must be at least 8 characters long');
    else if (!/\d/.test(newPassword)) validationErrors.push('Password must contain at least one number');
    else if (!/[A-Z]/.test(newPassword)) validationErrors.push('Password must contain at least one uppercase letter');

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Password validation failed',
        errors: validationErrors 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Token version check
    if (user.tokenVersion !== req.user.tokenVersion) {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Set new password and increment tokenVersion to invalidate existing JWTs
    user.password = newPassword;
    user.passwordLastChanged = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    res.status(200).json({ 
      message: 'Password changed successfully',
      requiresRelogin: true
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

// Export all functions
module.exports = {
  signup,
  signin,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  changePassword,
  compareTokens  // Export the compareTokens function in case it's needed elsewhere
};