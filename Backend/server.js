const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// ✅ LOAD .ENV FIRST - BEFORE ANYTHING ELSE
require('dotenv').config();

// Verify .env loaded
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ CRITICAL ERROR: .env file not loaded properly!');
  console.error('EMAIL_USER:', process.env.EMAIL_USER);
  console.error('EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
  console.error('Please check that .env file exists at:', __dirname + '/.env');
  process.exit(1);
}

console.log('✅ .env loaded successfully');
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
console.log('📧 EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length);

// Import services AFTER dotenv is loaded
const { 
  sendEmail,
  sendBookingConfirmation, 
  sendContactFormEmail,
  sendBookingNotificationToCompany,
  sendPasswordResetOTP
} = require('./services/emailService');

const { generateInvoicePDF } = require('./services/pdfService');

const { 
  subscribeToNewsletter, 
  unsubscribeFromNewsletter,
  sendNewTripNotification,
  sendDiscountNotification
} = require('./services/newsletterService');

// Load models
const User = require('./models/User');
const Booking = require('./models/Booking');
const Newsletter = require('./models/Newsletter');
const Contact = require('./models/Contact');
const PasswordReset = require('./models/PasswordReset');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';


app.use(cors({
  origin: ['https://city-pulse-01.vercel.app', 'http://localhost:5173'],
  credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log('🔌 Connecting to MongoDB Atlas...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connected Successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB Atlas');
});

// Helper function to mask sensitive payment data
const maskPaymentDetails = (paymentDetails) => {
  const masked = { ...paymentDetails };
  
  if (masked.cardNumber) {
    const lastFour = masked.cardNumber.replace(/\s/g, '').slice(-4);
    masked.cardNumber = `****-****-****-${lastFour}`;
  }
  
  if (masked.cvv) {
    delete masked.cvv;
  }
  
  if (masked.password) {
    delete masked.password;
  }
  
  masked.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  masked.transactionDate = new Date();
  masked.status = 'Completed';
  
  return masked;
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('📝 Registration request:', { name, email });

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    const user = new User({
      name,
      email,
      password,
      authProvider: 'email'
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User registered successfully:', user.email);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Registration failed'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login request:', { email });

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User logged in successfully:', user.email);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Login failed'
    });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { name, email, googleId, avatar } = req.body;

    console.log('🔐 Google login request:', { email });

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: Math.random().toString(36),
        authProvider: 'google',
        googleId,
        avatar,
        isEmailVerified: true
      });
      await user.save();
      console.log('✅ New Google user created:', user.email);
    } else {
      user.lastLogin = new Date();
      await user.save();
      console.log('✅ Existing user logged in via Google:', user.email);
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Google authentication successful',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('❌ Google auth error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Google authentication failed'
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user: user.toJSON() }
    });

  } catch (error) {
    console.error('❌ Auth verification error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
});

// ============================================
// PASSWORD RESET ROUTES (OTP BASED)
// ============================================

// Step 1: Send OTP to Email
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔐 Forgot password request for:', email);

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success even if user not found (security best practice)
    if (!user) {
      console.log('⚠️ User not found, but returning success for security');
      return res.status(200).json({
        status: 'success',
        message: 'If an account exists with this email, you will receive a verification code.'
      });
    }

    // Delete any existing unused OTPs for this email
    await PasswordReset.deleteMany({ email: user.email, used: false });

    // Generate 6-digit OTP
    const otp = PasswordReset.generateOTP();

    // Save OTP to database
    const passwordReset = new PasswordReset({
      email: user.email,
      otp: otp,
      userId: user._id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    await passwordReset.save();

    console.log('✅ OTP generated for user:', user.email, 'OTP:', otp);

    // Send email with OTP
    try {
      await sendPasswordResetOTP(user.email, otp, user.name);
      console.log('✅ Password reset OTP email sent');
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError.message);
      // Continue anyway - OTP is saved in database
    }

    res.status(200).json({
      status: 'success',
      message: 'If an account exists with this email, you will receive a verification code.',
      data: {
        email: user.email // Send email back for UI to show
      }
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to process password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Step 2: Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('🔐 Verify OTP request:', { email, otp });

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and verification code are required'
      });
    }

    // Find OTP record
    const passwordReset = await PasswordReset.findOne({ 
      email: email.toLowerCase(),
      otp: otp 
    }).sort({ createdAt: -1 });

    if (!passwordReset) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code'
      });
    }

    // Check if OTP is valid
    if (!passwordReset.isValid()) {
      if (passwordReset.used) {
        return res.status(400).json({
          status: 'error',
          message: 'This verification code has already been used'
        });
      }
      
      if (passwordReset.expiresAt < new Date()) {
        return res.status(400).json({
          status: 'error',
          message: 'This verification code has expired. Please request a new one.'
        });
      }
      
      if (passwordReset.attempts >= passwordReset.maxAttempts) {
        return res.status(400).json({
          status: 'error',
          message: 'Maximum verification attempts exceeded. Please request a new code.'
        });
      }
    }

    // Increment attempts
    await passwordReset.incrementAttempts();

    console.log('✅ OTP verified successfully for:', email);

    res.status(200).json({
      status: 'success',
      message: 'Verification code confirmed. You can now reset your password.',
      data: {
        email: passwordReset.email,
        resetToken: passwordReset._id // Send ID as a temporary token for next step
      }
    });

  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify code',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Step 3: Reset Password with Verified OTP
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    console.log('🔐 Reset password request for:', email);

    // Validation
    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, verification code, and passwords are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Passwords do not match'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters'
      });
    }

    // Find OTP record
    const passwordReset = await PasswordReset.findOne({ 
      email: email.toLowerCase(),
      otp: otp 
    }).sort({ createdAt: -1 });

    if (!passwordReset) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code'
      });
    }

    // Check if OTP is still valid
    if (!passwordReset.isValid()) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification code has expired or been used. Please request a new one.'
      });
    }

    // Find user
    const user = await User.findById(passwordReset.userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update password
    user.password = password; // Will be hashed by pre-save hook
    await user.save();

    // Mark OTP as used
    await passwordReset.markAsUsed();

    // Delete all other unused OTPs for this user
    await PasswordReset.deleteMany({ 
      email: user.email, 
      used: false,
      _id: { $ne: passwordReset._id }
    });

    console.log('✅ Password reset successful for user:', user.email);

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Resend OTP
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔐 Resend OTP request for:', email);

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return success for security
      return res.status(200).json({
        status: 'success',
        message: 'If an account exists with this email, you will receive a new verification code.'
      });
    }

    // Delete old unused OTPs
    await PasswordReset.deleteMany({ email: user.email, used: false });

    // Generate new OTP
    const otp = PasswordReset.generateOTP();

    // Save new OTP
    const passwordReset = new PasswordReset({
      email: user.email,
      otp: otp,
      userId: user._id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    await passwordReset.save();

    console.log('✅ New OTP generated:', otp);

    // Send email
    try {
      await sendPasswordResetOTP(user.email, otp, user.name);
      console.log('✅ New OTP email sent');
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError.message);
    }

    res.status(200).json({
      status: 'success',
      message: 'A new verification code has been sent to your email.'
    });

  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to resend verification code'
    });
  }
});

// ============================================
// BOOKING ROUTES
// ============================================

app.post('/api/bookings/create', async (req, res) => {
  try {
    console.log('📝 Received booking request:', req.body);

    const bookingData = req.body;

    if (!bookingData.bookingId || !bookingData.packageName || !bookingData.amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required booking information'
      });
    }

    const sanitizedPaymentDetails = maskPaymentDetails(bookingData.paymentDetails || {});

    const booking = new Booking({
      bookingId: bookingData.bookingId,
      packageName: bookingData.packageName,
      packageInfo: bookingData.packageInfo,
      selectedPackage: bookingData.selectedPackage,
      amount: bookingData.amount,
      totalAmount: bookingData.totalAmount,
      travelers: bookingData.travelers,
      userDetails: {
        name: bookingData.userDetails?.name,
        email: bookingData.userDetails?.email,
        phone: bookingData.userDetails?.phone,
        persons: bookingData.userDetails?.persons,
        date: bookingData.userDetails?.date || new Date()
      },
      paymentMethod: bookingData.paymentMethod,
      paymentDetails: sanitizedPaymentDetails,
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      selectedGuide: bookingData.selectedGuide,
      bookingTimestamp: bookingData.bookingTimestamp || new Date()
    });

    await booking.save();

    console.log('✅ Booking saved to MongoDB:', booking.bookingId);
    console.log('💳 Payment details stored securely');

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) {
          booking.user = user._id;
          await booking.save();
          
          user.bookings.push(booking._id);
          await user.save();
          
          console.log('✅ Booking linked to user:', user.email);
        }
      } catch (err) {
        console.log('⚠️ Could not link booking to user:', err.message);
      }
    }

    let pdfBuffer;
    try {
      console.log('📧 Generating invoice PDF...');
      pdfBuffer = await generateInvoicePDF(booking);
      console.log('✅ PDF generated successfully');
    } catch (pdfError) {
      console.error('⚠️ PDF generation failed:', pdfError.message);
    }

    const emailPromises = [];

    if (pdfBuffer) {
      emailPromises.push(
        sendBookingConfirmation(booking, pdfBuffer)
          .then(() => {
            console.log('✅ Customer invoice email sent to:', booking.userDetails?.email);
          })
          .catch(err => {
            console.error('⚠️ Customer email failed:', err.message);
          })
      );
    }

    emailPromises.push(
      sendBookingNotificationToCompany(booking)
        .then(() => {
          console.log('✅ Company notification email sent');
        })
        .catch(err => {
          console.error('⚠️ Company email failed:', err.message);
        })
    );

    await Promise.allSettled(emailPromises);

    booking.invoiceSent = true;
    booking.invoiceSentAt = new Date();
    await booking.save();

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully. Invoice sent to your email!',
      data: booking.maskSensitiveData(),
      bookingId: booking.bookingId,
      packageName: booking.packageName,
      amount: booking.amount,
      paymentMethod: booking.paymentMethod
    });

  } catch (error) {
    console.error('❌ Error creating booking:', error);
    
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.stack : {}
    });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    const maskedBookings = bookings.map(booking => booking.maskSensitiveData());
    
    res.status(200).json({
      status: 'success',
      count: bookings.length,
      data: maskedBookings
    });

  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
});

app.get('/api/bookings/my-bookings', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const bookings = await Booking.find({
      $or: [
        { user: decoded.userId },
        { 'userDetails.email': user.email }
      ]
    }).sort({ bookingTimestamp: -1 });

    console.log(`📦 Found ${bookings.length} bookings for user: ${user.email}`);

    const maskedBookings = bookings.map(booking => booking.maskSensitiveData());

    res.status(200).json({
      status: 'success',
      count: bookings.length,
      data: maskedBookings
    });

  } catch (error) {
    console.error('❌ Error fetching user bookings:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
});

app.get('/api/bookings/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('user', 'name email phone');
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: booking.maskSensitiveData()
    });

  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking'
    });
  }
});

app.get('/api/bookings/download-invoice/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    console.log('📄 Generating PDF for download:', booking.bookingId);

    const pdfBuffer = await generateInvoicePDF(booking);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${booking.bookingId}.pdf`);
    res.send(pdfBuffer);

    console.log('✅ PDF downloaded successfully');

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

app.post('/api/bookings/resend-invoice/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    console.log('📧 Resending invoice email for:', booking.bookingId);

    const pdfBuffer = await generateInvoicePDF(booking);
    await sendBookingConfirmation(booking, pdfBuffer);

    booking.invoiceSent = true;
    booking.invoiceSentAt = new Date();
    await booking.save();

    console.log('✅ Invoice email resent successfully');

    res.status(200).json({
      status: 'success',
      message: 'Invoice sent to your email successfully!'
    });

  } catch (error) {
    console.error('❌ Error resending invoice:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to resend invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

app.get('/api/bookings/invoice/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    console.log('📄 Generating invoice for:', booking.bookingId);

    const pdfBuffer = await generateInvoicePDF(booking);

    try {
      console.log('📧 Sending invoice email to:', booking.userDetails?.email);
      await sendBookingConfirmation(booking, pdfBuffer);
      
      booking.invoiceSent = true;
      booking.invoiceSentAt = new Date();
      await booking.save();
      
      console.log('✅ Invoice email sent successfully!');
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError.message);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${booking.bookingId}.pdf`);
    res.send(pdfBuffer);

    console.log('✅ PDF downloaded to device');

  } catch (error) {
    console.error('❌ Error generating invoice:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

app.get('/api/bookings/stats/summary', async (req, res) => {
  try {
    const stats = await Booking.getStatistics();
    
    res.status(200).json({
      status: 'success',
      data: stats
    });

  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics'
    });
  }
});

// ============================================
// NEWSLETTER ROUTES
// ============================================

app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address'
      });
    }

    let userId = null;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        // User not authenticated, continue without userId
      }
    }

    const result = await subscribeToNewsletter(email, 'website', userId);

    if (result.success) {
      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.subscriber
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: result.message
      });
    }

  } catch (error) {
    console.error('❌ Newsletter subscription error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to subscribe to newsletter',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

app.post('/api/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    const result = await unsubscribeFromNewsletter(email);

    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: result.message
      });
    }

  } catch (error) {
    console.error('❌ Newsletter unsubscribe error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to unsubscribe from newsletter',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

app.get('/api/newsletter/stats', async (req, res) => {
  try {
    const stats = await Newsletter.getSubscribersCount();
    
    res.status(200).json({
      status: 'success',
      data: stats
    });

  } catch (error) {
    console.error('❌ Newsletter stats error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch newsletter statistics'
    });
  }
});

app.post('/api/newsletter/notify-new-trip', async (req, res) => {
  try {
    const tripDetails = req.body;

    await sendNewTripNotification(tripDetails);

    res.status(200).json({
      status: 'success',
      message: 'New trip notification sent to all subscribers'
    });

  } catch (error) {
    console.error('❌ New trip notification error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to send new trip notification',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

app.post('/api/newsletter/notify-discount', async (req, res) => {
  try {
    const discountDetails = req.body;

    await sendDiscountNotification(discountDetails);

    res.status(200).json({
      status: 'success',
      message: 'Discount notification sent to all subscribers'
    });

  } catch (error) {
    console.error('❌ Discount notification error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to send discount notification',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// CONTACT FORM ROUTES
// ============================================

app.post('/api/contact/submit', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    console.log('📧 Contact form submission received:', { name, email });

    if (!name || !email || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and message are required'
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address'
      });
    }

    const contact = new Contact({
      name,
      email,
      phone: phone || undefined,
      message,
      status: 'new',
      source: 'website',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    await contact.save();

    console.log('✅ Contact form saved to database:', contact._id);

    try {
      await sendContactFormEmail({ name, email, phone, message });
      console.log('✅ Contact emails sent successfully');
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email
      }
    });

  } catch (error) {
    console.error('❌ Error submitting contact form:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit contact form. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

app.get('/api/contact/all', async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.status(200).json({
      status: 'success',
      count: contacts.length,
      data: contacts
    });

  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contacts'
    });
  }
});

app.get('/api/contact/unread-count', async (req, res) => {
  try {
    const count = await Contact.getUnreadCount();
    
    res.status(200).json({
      status: 'success',
      data: { count }
    });

  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch unread count'
    });
  }
});

app.patch('/api/contact/:id/mark-read', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }

    contact.status = 'read';
    contact.readAt = new Date();
    await contact.save();

    res.status(200).json({
      status: 'success',
      message: 'Contact marked as read',
      data: contact
    });

  } catch (error) {
    console.error('❌ Error marking contact as read:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update contact'
    });
  }
});

// ============================================
// TEST ROUTES
// ============================================

app.get('/api/test-email', async (req, res) => {
  try {
    await sendEmail({
      to: 'sangatirammohan01@gmail.com',
      subject: 'City Pulse Tours - Test Email',
      html: `
        <h1>✅ Test Email Successful!</h1>
        <p>If you receive this email, your email configuration is working correctly!</p>
        <p><strong>From:</strong> ${process.env.EMAIL_FROM}</p>
        <p><strong>Server:</strong> ${process.env.EMAIL_HOST}</p>
        <p><strong>Port:</strong> ${process.env.EMAIL_PORT}</p>
      `
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Test email sent successfully! Check your inbox.'
    });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Test email failed',
      error: error.message
    });
  }
});

app.get('/api/test-smtp', async (req, res) => {
  const nodemailer = require('nodemailer');
  
  console.log('🔍 Testing SMTP connection...');

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  try {
    console.log('⏳ Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    res.json({ 
      success: true, 
      message: 'SMTP connection successful!',
      config: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER
      }
    });
  } catch (error) {
    console.error('❌ SMTP verification failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Error:', err);
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Email configured: ${process.env.EMAIL_USER || 'Not configured'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  try {
    await mongoose.connection.close();
    console.log('💤 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  try {
    await mongoose.connection.close();
    console.log('💤 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});