import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { Shield, ArrowLeft, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import '../SignIn/SignIn.css';
import './VerifyOTP.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(900); // 15 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  const inputRefs = useRef([]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      await Swal.fire({
        icon: 'error',
        title: 'Incomplete Code',
        text: 'Please enter the complete 6-digit verification code',
        confirmButtonColor: '#6fbf73'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.verifyOTP({ email, otp: otpCode });

      if (response.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Code Verified!',
          text: 'Your verification code has been confirmed.',
          confirmButtonColor: '#6fbf73',
          timer: 2000,
          showConfirmButton: false
        });

        // Navigate to reset password with email and OTP
        navigate('/reset-password', { state: { email, otp: otpCode } });
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: error.message || 'Invalid verification code. Please try again.',
        confirmButtonColor: '#6fbf73'
      });

      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await authAPI.resendOTP({ email });

      if (response.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Code Resent!',
          text: 'A new verification code has been sent to your email.',
          confirmButtonColor: '#6fbf73',
          timer: 3000
        });

        // Reset timer
        setTimer(900);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Resend Failed',
        text: error.message || 'Unable to resend code. Please try again.',
        confirmButtonColor: '#6fbf73'
      });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Left Side */}
        <div className="auth-left-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Verify Your Code</h1>
            <p className="welcome-subtitle">
              We've sent a 6-digit verification code to your email address. 
              Enter the code below to reset your password.
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

        {/* Right Side */}
        <div className="auth-right-section">
          <div className="auth-form-container">
            <button 
              onClick={() => navigate('/forgot-password')}
              className="back-to-login-btn"
              type="button"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="auth-header">
              <div className="verification-icon">
                <Shield size={48} />
              </div>
              <h2>Enter Verification Code</h2>
              <p className="auth-subheader">
                Code sent to <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="otp-container" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="otp-input"
                    disabled={isLoading}
                  />
                ))}
              </div>

              <div className="timer-section">
                <p className={`timer ${timer <= 60 ? 'timer-warning' : ''}`}>
                  {timer > 0 ? (
                    <>⏰ Code expires in: <strong>{formatTime(timer)}</strong></>
                  ) : (
                    <>⏰ Code has expired</>
                  )}
                </p>
              </div>

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    Verify Code
                  </>
                )}
              </button>

              <div className="resend-section">
                <p>Didn't receive the code?</p>
                {canResend || timer === 0 ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="resend-link-btn"
                  >
                    Resend Code
                  </button>
                ) : (
                  <span className="resend-disabled">
                    Resend available in {formatTime(timer)}
                  </span>
                )}
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

export default VerifyOTP;