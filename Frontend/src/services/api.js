import axios from 'axios';

// Create axios instance with comprehensive error handling
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor for comprehensive logging
api.interceptors.request.use(
  config => {
    // Only log in development environment
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        data: config.data
      });
    }
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    console.error('❌ Request Configuration Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor for global error handling
api.interceptors.response.use(
  response => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        data: response.data,
        url: response.config.url
      });
    }
    return response;
  },
  error => {
    // Enhanced error logging
    if (import.meta.env.DEV) {
      console.error('🔥 API Error Details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response,
        url: error.config?.url,
        method: error.config?.method
      });
    }
    
    // Handle different types of errors
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error: Cannot connect to server');
      console.error('💡 Make sure your backend server is running on http://localhost:3000');
      
      // Return a more user-friendly error
      return Promise.reject({
        ...error,
        userMessage: 'Cannot connect to server. Please make sure the backend is running.'
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Connection Refused: Server is not running');
      return Promise.reject({
        ...error,
        userMessage: 'Server is not running. Please start the backend server.'
      });
    }
    
    if (error.response) {
      // Server responded with an error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('❌ Bad Request:', data);
          break;
        case 401:
          console.error('🔐 Unauthorized - clearing tokens');
          localStorage.removeItem('authToken');
          break;
        case 403:
          console.error('🚫 Forbidden');
          break;
        case 404:
          console.error('🔍 Not Found:', data);
          break;
        case 500:
          console.error('💥 Server Error:', data);
          break;
        default:
          console.error(`🔴 HTTP ${status}:`, data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('📡 No Response Received:', {
        readyState: error.request.readyState,
        status: error.request.status,
        timeout: error.request.timeout
      });
    } else {
      // Something happened in setting up the request
      console.error('⚠️ Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Health check function
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ Server is healthy:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    return false;
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔍 Testing server connection...');
    const isHealthy = await checkServerHealth();
    
    if (isHealthy) {
      console.log('🎉 Connection successful!');
      return { success: true, message: 'Connected to server successfully' };
    } else {
      throw new Error('Health check failed');
    }
  } catch (error) {
    console.error('💥 Connection test failed:', error);
    return { 
      success: false, 
      message: error.userMessage || error.message || 'Connection failed' 
    };
  }
};

export default api;