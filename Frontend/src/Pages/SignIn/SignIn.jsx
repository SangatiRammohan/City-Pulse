import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { Mail, Lock, Eye, EyeOff, LogIn, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import './SignIn.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login with:', formData.email);
      
      const response = await authAPI.login(formData);

      if (response.status === 'success') {
        console.log('✅ Login successful');
        
        // Show success message
        await Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: `Hello ${response.data.user.name}! You're now signed in.`,
          confirmButtonColor: '#6fbf73',
          timer: 2000,
          showConfirmButton: false
        });

        // Check if there's a pending booking
        const pendingBooking = sessionStorage.getItem('pendingBooking');
        
        if (pendingBooking) {
          // Redirect to payment page with booking data
          navigate('/payment', { 
            state: JSON.parse(pendingBooking),
            replace: true 
          });
          sessionStorage.removeItem('pendingBooking');
        } else {
          // Redirect to home or dashboard
          navigate('/', { replace: true });
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Sign In Failed',
        text: error.message || 'Invalid email or password. Please try again.',
        confirmButtonColor: '#6fbf73'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Google Sign-In implementation
      await Swal.fire({
        icon: 'info',
        title: 'Coming Soon',
        text: 'Google Sign-In will be available soon!',
        confirmButtonColor: '#6fbf73'
      });
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Left Side - Welcome Section */}
        <div className="auth-left-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Welcome Back!</h1>
            <p className="welcome-subtitle">
              Sign in to access your bookings, save your favorite destinations, 
              and continue your journey with City Pulse Tours.
            </p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">✈️</div>
                <div className="feature-text">
                  <h3>Book Amazing Tours</h3>
                  <p>Explore destinations worldwide</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">💰</div>
                <div className="feature-text">
                  <h3>Best Price Guarantee</h3>
                  <p>Get the best deals on tours</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <div className="feature-text">
                  <h3>Personalized Experience</h3>
                  <p>Tours tailored just for you</p>
                </div>
              </div>
            </div>
            
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-icon" aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div className="auth-image-overlay"></div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="auth-right-section">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Sign In</h2>
              <p className="auth-subheader">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper password-input">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="forgot-password-wrapper">
                <Link 
                  to="/forgot-password" 
                  className="forgot-password-link"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Remember Me Checkbox */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>

  
    

              {/* Terms */}
              <div className="auth-terms">
                By signing in, you agree to our{' '}
                <a href="/terms">Terms of Service</a> and{' '}
                <a href="/privacy">Privacy Policy</a>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;