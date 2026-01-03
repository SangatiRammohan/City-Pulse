import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { User, LogOut, Menu, X, ChevronDown, Package } from 'lucide-react';
import "./Header.css";
import logo from '../../assets/HeaderAssets/logo.png';

const packageModules = import.meta.glob('../../packagesData/*.json');

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check authentication status on mount and location change
  useEffect(() => {
    checkAuthStatus();
  }, [location]);
  
  const checkAuthStatus = () => {
    const authenticated = authAPI.isAuthenticated();
    const storedUser = authAPI.getStoredUser();
    
    setIsAuthenticated(authenticated);
    setUser(storedUser);
  };
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isMenuOpen && !e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-btn')) {
        setIsMenuOpen(false);
      }
      
      if (showProfileDropdown && !e.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen, showProfileDropdown]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsMenuOpen(false);
        setActiveDropdown(null);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setShowProfileDropdown(false);
    setActiveDropdown(null);
  }, [location]);
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);
  
  const toggleDropdown = (index, e) => {
    if (window.innerWidth <= 1024) {
      e.preventDefault();
      setActiveDropdown(activeDropdown === index ? null : index);
    }
  };
  
  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setActiveDropdown(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePackageClick = async (packageKey) => {
    setSelectedPackage(packageKey);
    setIsMenuOpen(false);
    setActiveDropdown(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const modulePath = `../../packagesData/${packageKey}.json`;
      const loader = packageModules[modulePath];
      
      if (loader) {
        const packageData = await loader();
        setPackageData(packageData.default || packageData);
      } else {
        console.error(`Package data not found for: ${packageKey}`);
      }
    } catch (error) {
      console.error("Error loading package data:", error);
    }
  };
  
  // Handle auth navigation
  const handleSignIn = (e) => {
    e.preventDefault();
    navigate('/signin');
    setIsMenuOpen(false);
  };
  
  const handleSignUp = (e) => {
    e.preventDefault();
    navigate('/signup');
    setIsMenuOpen(false);
  };
  
  // Handle profile actions
  const handleMyProfile = () => {
    setShowProfileDropdown(false);
    setIsMenuOpen(false);
    navigate('/profile');
  };
  
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6fbf73',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      authAPI.logout();
      setIsAuthenticated(false);
      setUser(null);
      setShowProfileDropdown(false);
      setIsMenuOpen(false);
      
      await Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been logged out successfully',
        confirmButtonColor: '#6fbf73',
        timer: 1500,
        showConfirmButton: false
      });
      
      navigate('/');
    }
  };
  
  const packageOptions = [
    { display: 'Weekend Tours', path: '/packages/weekend_tours'},
    { display: 'Hill Station Tours', path: '/packages/hill_station_tour' },
    { display: 'Goa Tour', path: '/packages/goa_tour' },
    { display: 'Kerala Tour', path: '/packages/kerala_tour' },
    { display: 'Golden Triangular Tours', path: '/packages/golden_triangle_tours' },
    { display: 'Summer Holiday Tour', path: '/packages/summer_holiday_tour' },
    { display: 'Beach Vacation Tours', path: '/packages/beach_tours_india' }
  ];

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="header-content">
            {/* Logo */}
            <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
              <img src={logo} alt="City Pulse Logo" />
              <span className="logo-text">City Pulse</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              <ul className="nav-list">
                <li className="nav-item">
                  <Link to="/" className="nav-link">Home</Link>
                </li>
                <li className="nav-item">
                  <Link to="/about" className="nav-link">About</Link>
                </li>
                <li className="nav-item">
                  <Link to="/guide" className="nav-link">Guide</Link>
                </li>
                <li className="nav-item dropdown-nav">
                  <button className="nav-link dropdown-trigger">
                    Packages <ChevronDown size={16} className="dropdown-icon" />
                  </button>
                  <div className="dropdown-menu">
                    {packageOptions.map((option, index) => (
                      <Link 
                        key={index} 
                        to={option.path} 
                        className="dropdown-item"
                      >
                        {option.display}
                      </Link>
                    ))}
                  </div>
                </li>
                <li className="nav-item">
                  <Link to="/testimonials" className="nav-link">Testimonials</Link>
                </li>
                <li className="nav-item">
                  <Link to="/contact" className="nav-link">Contact</Link>
                </li>
              </ul>
            </nav>
            
            {/* Desktop Auth Section */}
            <div className="header-actions">
              {!isAuthenticated ? (
                <div className="auth-buttons">
                  <Link to="/signin" className="btn btn-outline" onClick={handleSignIn}>
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn btn-primary" onClick={handleSignUp}>
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="profile-dropdown-container">
                  <button 
                    className="profile-btn"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    aria-expanded={showProfileDropdown}
                  >
                    <div className="profile-avatar">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="profile-name">{user?.name}</span>
                    <ChevronDown size={16} className={`profile-arrow ${showProfileDropdown ? 'rotate' : ''}`} />
                  </button>
                  
                  {showProfileDropdown && (
                    <div className="profile-dropdown">
                      <div className="profile-dropdown-header">
                        <div className="profile-avatar-large">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-info">
                          <p className="profile-name-text">{user?.name}</p>
                          <p className="profile-email">{user?.email}</p>
                        </div>
                      </div>
                      <div className="profile-dropdown-menu">
                        <button onClick={handleMyProfile} className="dropdown-menu-item">
                          <User size={18} />
                          My Profile
                        </button>
                        <button onClick={handleLogout} className="dropdown-menu-item logout">
                          <LogOut size={18} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <button 
                className="mobile-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)} />}
      
      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-content">
          {/* Mobile User Info */}
          {isAuthenticated && (
            <div className="mobile-user-card">
              <div className="mobile-avatar-large">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="mobile-user-info">
                <p className="mobile-user-name">{user?.name}</p>
                <p className="mobile-user-email">{user?.email}</p>
              </div>
            </div>
          )}
          
          {/* Mobile Nav Links */}
          <ul className="mobile-nav-list">
            <li className="mobile-nav-item">
              <Link to="/" className="mobile-nav-link" onClick={() => handleNavigation('/')}>
                Home
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/about" className="mobile-nav-link" onClick={() => handleNavigation('/about')}>
                About
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/guide" className="mobile-nav-link" onClick={() => handleNavigation('/guide')}>
                Guide
              </Link>
            </li>
            <li className="mobile-nav-item mobile-dropdown">
              <button 
                className="mobile-nav-link mobile-dropdown-trigger"
                onClick={(e) => toggleDropdown(0, e)}
              >
                Packages
                <ChevronDown size={18} className={`mobile-dropdown-icon ${activeDropdown === 0 ? 'rotate' : ''}`} />
              </button>
              <div className={`mobile-dropdown-menu ${activeDropdown === 0 ? 'active' : ''}`}>
                {packageOptions.map((option, index) => (
                  <Link 
                    key={index} 
                    to={option.path} 
                    className="mobile-dropdown-item"
                    onClick={() => handleNavigation(option.path)}
                  >
                    {option.display}
                  </Link>
                ))}
              </div>
            </li>
            <li className="mobile-nav-item">
              <Link to="/testimonials" className="mobile-nav-link" onClick={() => handleNavigation('/testimonials')}>
                Testimonials
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/contact" className="mobile-nav-link" onClick={() => handleNavigation('/contact')}>
                Contact
              </Link>
            </li>
          </ul>
          
          {/* Mobile Auth Buttons or Profile Actions */}
          <div className="mobile-auth-section">
            {!isAuthenticated ? (
              <div className="mobile-auth-buttons">
                <Link to="/signin" className="mobile-btn mobile-btn-outline" onClick={handleSignIn}>
                  Sign In
                </Link>
                <Link to="/signup" className="mobile-btn mobile-btn-primary" onClick={handleSignUp}>
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="mobile-profile-actions">
                <button onClick={handleMyProfile} className="mobile-action-btn profile">
                  <User size={20} />
                  My Profile
                </button>
                <button onClick={handleLogout} className="mobile-action-btn logout">
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;