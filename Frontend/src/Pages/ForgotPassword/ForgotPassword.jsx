import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { Mail, ArrowLeft, Send, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import '../SignIn/SignIn.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });

      if (response.status === 'success') {
        setEmailSent(true);
        
        await Swal.fire({
          icon: 'success',
          title: 'Code Sent!',
          text: 'A 6-digit verification code has been sent to your email.',
          confirmButtonColor: '#6fbf73',
          timer: 3000,
          showConfirmButton: true
        });

        // Navigate to verify OTP page with email
        navigate('/verify-otp', { state: { email } });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Request Failed',
        text: error.message || 'Unable to process your request. Please try again.',
        confirmButtonColor: '#6fbf73'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/signin');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Left Side - Welcome Section */}
        <div className="auth-left-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Reset Password</h1>
            <p className="welcome-subtitle">
              Don't worry! It happens to the best of us. Enter your email address and we'll 
              send you a verification code to reset your password.
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

        {/* Right Side - Forgot Password Form */}
        <div className="auth-right-section">
          <div className="auth-form-container">
            <button 
              onClick={handleBackToLogin}
              className="back-to-login-btn"
              type="button"
            >
              <ArrowLeft size={18} />
              Back to Sign In
            </button>

            <div className="auth-header">
              <h2>Forgot Password?</h2>
              <p className="auth-subheader">
                Enter your email to receive a verification code
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
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
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Verification Code
                  </>
                )}
              </button>

              <div className="auth-terms">
                You will receive a 6-digit verification code via email.
                <br />
                The code will expire in 15 minutes.
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

export default ForgotPassword;