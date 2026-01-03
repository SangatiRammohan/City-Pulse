const mongoose = require('mongoose');
const os = require('os');

const connectDB = async () => {
  // Detect appropriate connection string based on OS
  const getConnectionString = () => {
    const platform = os.platform();
    // Consider using environment variable for more flexibility
    const defaultConnString = process.env.MONGODB_URI || 'mongodb://localhost:27017/FULLSTACK';
   
    // Simplified connection string selection
    const platformConnections = {
      'win32': 'mongodb://127.0.0.1:27017/FULLSTACK',
      'darwin': defaultConnString,
      'linux': defaultConnString
    };
    return platformConnections[platform] || defaultConnString;
  };

  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
    connectTimeoutMS: 5000
  };

  try {
    const connectionUrl = getConnectionString();
    console.log('Attempting to connect with:', {
      url: connectionUrl.replace(/\/\/.*:.*@/, '//[REDACTED]:***@'), // Safely log connection string
      platform: os.platform(),
      arch: os.arch()
    });
    
    await mongoose.connect(connectionUrl, connectionOptions);
    console.log('✅ MongoDB Connection Successful');
    console.log('Connection Details:', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name
    });
    
    // Improved event listeners
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose persistently connected to database');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose Connection Persistent Error:', {
        message: err.message,
        name: err.name,
        code: err.code
      });
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🚫 Mongoose disconnected');
    });
    
    // Optional: Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ FATAL MongoDB Connection Error:', {
      message: error.message,
      name: error.name
    });
    
    console.log('Troubleshooting Steps:');
    console.log('1. Ensure MongoDB is installed');
    console.log('2. Start MongoDB service');
    console.log('3. Check network/firewall');
    console.log('4. Verify connection string');
    
    // Exponential backoff reconnection with max retry limit
    const MAX_RETRIES = 5;
    let retryCount = 0;
    const reconnect = () => {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        const reconnectDelay = Math.min(
          Math.floor(Math.random() * 30000) + 5000 * retryCount,
          60000 // Max delay of 1 minute
        );
       
        console.log(`Reconnection attempt ${retryCount}. Retrying in ${reconnectDelay/1000} seconds...`);
        setTimeout(connectDB, reconnectDelay);
      } else {
        console.error('Max reconnection attempts reached. Manual intervention required.');
      }
    };
    reconnect();
  }
};

module.exports = connectDB;