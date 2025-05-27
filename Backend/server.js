const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

// Import Routes
const userRoutes = require('./routes/userRoutes');
const tripRoutes = require('./routes/tripRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Create Express App
const app = express();

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for now, can be configured later
    hsts: { maxAge: 31536000, includeSubDomains: true }, // Enable HSTS
    frameguard: { action: 'deny' }, // Prevent clickjacking
  })
);



// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later',
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      error: options.message,
    });
  },
});
app.use(limiter);

// Cors Configuration with More Robust Options
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      // Add production frontend URLs here
    ];
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json({
  limit: '10kb', // Limit payload size
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw e;
    }
  }
}));
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging Middleware with Better Security
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    // Log only in development, strip sensitive data in production
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      console.log('Headers:', req.headers);
      console.log('Body:', req.body);
    }
    originalSend.call(this, body);
  };
  next();
});

// Improved Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Initialize Database Connection
connectDB();

// Mongoose Connection Event Handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
  // Optional: Attempt reconnection
  setTimeout(connectDB, 5000);
});

// Health Check Route with More Details
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    databaseStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);

// Global Error Handler with More Details
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  
  res.status(statusCode).json({
    status: 'error',
    statusCode: statusCode,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    suggestedAction: 'Check the API documentation',
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Improved Graceful Shutdown
const gracefulShutdown = () => {
  console.log('Received kill signal, shutting down gracefully');
  
  server.close(() => {
    console.log('Closed out remaining HTTP connections');
    
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });

  // If connections don't close in 10 seconds, forcefully shut down
  const forceShutdown = setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  // Prevent forceShutdown from keeping the process running
  forceShutdown.unref();
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;