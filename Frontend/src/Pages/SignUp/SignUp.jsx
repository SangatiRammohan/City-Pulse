import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get return URL from location state
  const returnTo = location.state?.returnTo || '/';

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
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    if (formData.password.length < 8) {
      await Swal.fire({
        icon: 'error',
        title: 'Weak Password',
        text: 'Password must be at least 8 characters',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: `Welcome, ${response.data.user.name}!`,
          confirmButtonColor: '#54a15d',
          timer: 1500,
          showConfirmButton: false
        });

        // Redirect to return URL or home
        navigate(returnTo, { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.message || 'Unable to create account. Please try again.',
        confirmButtonColor: '#54a15d'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join us and start your adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <div className="input-icon-wrapper">
              <User className="input-icon" size={20} />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="terms-notice">
            <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
          </div>

          <button 
            type="submit" 
            className="signup-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-small"></span>
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <Link to="/signin" state={{ returnTo }}>Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;