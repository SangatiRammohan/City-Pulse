import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import './SignIn.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get return URL from location state
  const from = location.state?.from?.pathname || '/';
  const returnTo = location.state?.returnTo || from;

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
      const response = await authAPI.login(formData);

      if (response.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: `Welcome back, ${response.data.user.name}!`,
          confirmButtonColor: '#54a15d',
          timer: 1500,
          showConfirmButton: false
        });

        // Redirect to return URL or home
        navigate(returnTo, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message || 'Invalid email or password',
        confirmButtonColor: '#54a15d'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <div className="input-icon-wrapper">
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

          <button 
            type="submit" 
            className="signin-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-small"></span>
                Signing In...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="signin-footer">
          <p>Don't have an account? <Link to="/signup" state={{ returnTo }}>Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;