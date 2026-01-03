import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://city-pulse-backend-w59a.onrender.com/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
api.interceptors.request.use(
  config => {
    // Log in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
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

// Response Interceptor
api.interceptors.response.use(
  response => {
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  error => {
    if (import.meta.env.DEV) {
      console.error('🔥 API Error Details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.error('🌐 Network Error: Cannot connect to server');
      return Promise.reject({
        ...error,
        userMessage: 'Cannot connect to server. Please try again later.'
      });
    }
    
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        console.error('🔐 Unauthorized - clearing tokens');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API METHODS
// ============================================

export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.status === 'success' && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.status === 'success' && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Google OAuth
  googleAuth: async (googleData) => {
    try {
      const response = await api.post('/auth/google', googleData);
      if (response.data.status === 'success' && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Forgot Password - Send OTP
  forgotPassword: async (data) => {
    try {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify OTP
  verifyOTP: async (data) => {
    try {
      const response = await api.post('/auth/verify-otp', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reset Password with OTP
  resetPassword: async (data) => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Resend OTP
  resendOTP: async (data) => {
    try {
      const response = await api.post('/auth/resend-otp', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('pendingBooking');
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// ============================================
// BOOKING API METHODS
// ============================================

export const bookingAPI = {
  // Create booking
  create: async (bookingData) => {
    try {
      const response = await api.post('/bookings/create', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all bookings
  getAll: async () => {
    try {
      const response = await api.get('/bookings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user's bookings
  getMyBookings: async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single booking
  getById: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Download invoice as PDF (No Email)
  downloadInvoice: async (bookingId) => {
    try {
      const response = await axios({
        method: 'GET',
        url: `${api.defaults.baseURL}/bookings/download-invoice/${bookingId}`,
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Invoice downloaded successfully!' };
    } catch (error) {
      console.error('Invoice download error:', error);
      throw error.response?.data || error;
    }
  },

  // Resend invoice email (Email Only, No Download)
  resendInvoiceEmail: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/resend-invoice/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get booking statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/bookings/stats/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// ============================================
// NEWSLETTER API METHODS
// ============================================

export const newsletterAPI = {
  // Subscribe to newsletter
  subscribe: async (email) => {
    try {
      const response = await api.post('/newsletter/subscribe', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Unsubscribe from newsletter
  unsubscribe: async (email) => {
    try {
      const response = await api.post('/newsletter/unsubscribe', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get newsletter statistics
  getStats: async () => {
    try {
      const response = await api.get('/newsletter/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Send new trip notification (Admin)
  notifyNewTrip: async (tripDetails) => {
    try {
      const response = await api.post('/newsletter/notify-new-trip', tripDetails);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Send discount notification (Admin)
  notifyDiscount: async (discountDetails) => {
    try {
      const response = await api.post('/newsletter/notify-discount', discountDetails);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// ============================================
// CONTACT API METHODS
// ============================================

export const contactAPI = {
  // Submit contact form
  submit: async (contactData) => {
    try {
      const response = await api.post('/contact/submit', contactData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all contacts (Admin)
  getAll: async () => {
    try {
      const response = await api.get('/contact/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get unread count (Admin)
  getUnreadCount: async () => {
    try {
      const response = await api.get('/contact/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark as read (Admin)
  markAsRead: async (contactId) => {
    try {
      const response = await api.patch(`/contact/${contactId}/mark-read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

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