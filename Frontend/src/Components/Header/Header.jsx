import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { User, LogOut, Package } from 'lucide-react';
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
        setActiveDropdown(null);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  useEffect(() => {
    setIsMenuOpen(false);
    setShowProfileDropdown(false);
  }, [location]);
  
  const toggleDropdown = (index, e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      setActiveDropdown(activeDropdown === index ? null : index);
    }
  };
  
  const handleNavigation = (path) => {
    if (navigate) {
      navigate(path);
    }
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handlePackageClick = async (packageKey) => {
    setSelectedPackage(packageKey);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);

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
      confirmButtonColor: '#54a15d',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout'
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
        confirmButtonColor: '#54a15d',
        timer: 1500
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
    <header className="site-header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
            <img src={logo} alt="City Pulse Logo" />
            <span className="logo-text">City Pulse</span>
          </Link>
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
           {isMenuOpen ? '✖' : '☰'}
          </button>
          
          <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`}>
            <ul>
              <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
              <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link></li>
              <li><Link to="/guide" onClick={() => setIsMenuOpen(false)}>Guide</Link></li>
              <li className={`dropdown ${activeDropdown === 3 ? 'active' : ''}`}>
                <Link
                  to="/packages"
                  className="dropdown-trigger"
                  onClick={(e) => {
                    if (window.innerWidth <= 768) {
                      e.preventDefault();
                      toggleDropdown(3, e);
                    } else {
                      setIsMenuOpen(false);
                    }
                  }}
                >
                  Packages
                </Link>
                <div className="dropdown-content">
                  {packageOptions.map((option, index) => (
                    <Link key={index} to={option.path} onClick={() => setIsMenuOpen(false)}>
                      {option.display}
                    </Link>
                  ))}
                </div>
              </li>
              <li><Link to="/testimonials" onClick={() => setIsMenuOpen(false)}>Testimonials</Link></li>
              <li><Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
            </ul>
            
            {/* Mobile Auth Buttons/Profile */}
            {!isAuthenticated ? (
              <div className="mobile-sign-buttons">
                <Link to="/signup" className="sign-button" onClick={handleSignUp}>Sign Up</Link>
                <Link to="/signin" className="sign-button" onClick={handleSignIn}>Sign In</Link>
              </div>
            ) : (
              <div className="mobile-profile-menu">
                <div className="mobile-user-info">
                  <div className="mobile-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="mobile-user-details">
                    <p className="mobile-user-name">{user?.name}</p>
                    <p className="mobile-user-email">{user?.email}</p>
                  </div>
                </div>
                <div className="mobile-profile-actions">
                  <button onClick={handleMyProfile} className="mobile-profile-btn">
                    <User size={18} />
                    My Profile
                  </button>
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </nav>
          
          {/* Desktop Auth Buttons/Profile */}
          {!isAuthenticated ? (
            <div className="desktop-sign-buttons">
              <Link to="/signup" className="sign-button" onClick={handleSignUp}>Sign Up</Link>
              <Link to="/signin" className="sign-button" onClick={handleSignIn}>Sign In</Link>
            </div>
          ) : (
            <div className="profile-dropdown-container">
              <button 
                className="profile-icon-btn"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="profile-name">{user?.name}</span>
              </button>
              
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <p className="dropdown-user-name">{user?.name}</p>
                    <p className="dropdown-user-email">{user?.email}</p>
                  </div>
                  <div className="profile-dropdown-menu">
                    <button onClick={handleMyProfile} className="dropdown-item">
                      <User size={18} />
                      My Profile
                    </button>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;