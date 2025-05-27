import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import "./Header.css";
import AuthModal from './AuthModal'; // Import our new component
import logo from '../../assets/HeaderAssets/logo.png'
const Header = ({ navigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const location = useLocation();
  
  // Auth modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isMenuOpen && !e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-btn')) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen]);

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
  
  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
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
      const packageData = await import(`../../packagesData/${packageKey}.json`);
      setPackageData(packageData);
    } catch (error) {
      console.error("Error loading package data:", error);
    }
  };
  
  // Handle auth button clicks
  const openSignInModal = (e) => {
    e.preventDefault();
    setAuthMode('signin');
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };
  
  const openSignUpModal = (e) => {
    e.preventDefault();
    setAuthMode('signup');
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };
  
  // Map package options to their corresponding paths
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
      <header className="site-header">
        <div className="container">
          <div className="header-content">
            {/* Logo - clicking on logo returns to Home */}
            <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
              <img src={logo} alt="OpticView Logo" />
              <span className="logo-text">City Pluse</span>
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
             {isMenuOpen ? '✖' : '☰'}
            </button>
            
            {/* Navigation */}
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
              
              {/* Mobile-only sign buttons */}
              <div className="mobile-sign-buttons">
                <Link to="#" className="sign-button" onClick={openSignUpModal}>Sign Up</Link>
                <Link to="#" className="sign-button" onClick={openSignInModal}>Sign In</Link>
              </div>
            </nav>
            
            {/* Desktop-only sign buttons */}
            <div className="desktop-sign-buttons">
              <Link to="#" className="sign-button" onClick={openSignUpModal}>Sign Up</Link>
              <Link to="#" className="sign-button" onClick={openSignInModal}>Sign In</Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
      />
    </>
  );
};

export default Header;