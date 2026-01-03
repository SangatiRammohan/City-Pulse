import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { Eye, EyeOff, Lock, CheckCircle, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import '../SignIn/SignIn.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;

  useEffect(() => {
    // Redirect if no email or OTP
    if (!email || !otp) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Access',
        text: 'Please complete the verification process first.',
        confirmButtonColor: '#6fbf73'
      }).then(() => {
        navigate('/forgot-password');
      });
    }
  }, [email, otp, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      await Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match',
        confirmButtonColor: '#6fbf73'
      });
      return;
    }

    if (formData.password.length < 8) {
      await Swal.fire({
        icon: 'error',
        title: 'Weak Password',
        text: 'Password must be at least 8 characters',
        confirmButtonColor: '#6fbf73'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.resetPassword({
        email: email,
        otp: otp,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (response.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Password Reset Successful!',
          text: 'Your password has been reset. You can now sign in with your new password.',
          confirmButtonColor: '#6fbf73',
          timer: 3000,
          showConfirmButton: true
        });

        // Redirect to sign in page
        navigate('/signin');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: error.message || 'Unable to reset password. Please try again.',
        confirmButtonColor: '#6fbf73'
      });
      
      // If OTP expired or invalid, redirect to forgot password
      if (error.message?.toLowerCase().includes('expired') || 
          error.message?.toLowerCase().includes('invalid') ||
          error.message?.toLowerCase().includes('used')) {
        setTimeout(() => navigate('/forgot-password'), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Left Side - Welcome Section */}
        <div className="auth-left-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Create New Password</h1>
            <p className="welcome-subtitle">
              Your new password must be different from previously used passwords. 
              Make sure it's strong and secure to protect your account.
            </p>
            
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

        {/* Right Side - Reset Password Form */}
        <div className="auth-right-section">
          <div className="auth-form-container">
            <div className="auth-header">
              <div className="success-badge">
                <CheckCircle size={24} />
                <span>Code Verified</span>
              </div>
              <h2>Reset Password</h2>
              <p className="auth-subheader">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <div className="input-wrapper password-input">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter new password"
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
                <small className="password-hint">
                  Must be at least 8 characters
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="input-wrapper password-input">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Reset Password
                  </>
                )}
              </button>

              <div className="password-requirements">
                <p className="requirements-title">Password must contain:</p>
                <ul className="requirements-list">
                  <li className={formData.password.length >= 8 ? 'valid' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                    One uppercase letter (recommended)
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                    One number (recommended)
                  </li>
                  <li className={/[!@#$%^&*]/.test(formData.password) ? 'valid' : ''}>
                    One special character (recommended)
                  </li>
                </ul>
              </div>
            </form>

            <div className="auth-switch">
              <p>
                Remember your password?{' '}
                <Link to="/signin">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;