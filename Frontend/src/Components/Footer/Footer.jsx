import React from 'react';
import './Footer.css';
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import f1 from '../../assets/FooterAssets/F1.jpg';
import f2 from '../../assets/FooterAssets/F2.jpg';
import f3 from '../../assets/FooterAssets/F3.jpg';
import f4 from '../../assets/FooterAssets/F4.jpg';
import f5 from '../../assets/FooterAssets/F5.jpg';
import f6 from '../../assets/FooterAssets/F6.jpg';
import logo from '../../assets/HeaderAssets/logo.png';

const Footer = () => {
  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'About', path: '/about' },
    { title: 'Tours', path: '/packages' },
    { title: 'Contact', path: '/contact' }
  ];

  const tourTypes = [
    { title: 'Weekend Tours', path: '/packages/weekend_tours' },
    { title: 'Hill Station Tours', path: '/packages/hill_station_tour' },
    { title: 'Goa Tour', path: '/packages/goa_tour' },
    { title: 'Kerala Tour', path: '/packages/kerala_tour' },
    { title: 'Golden Triangular Tours', path: '/packages/golden_triangle_tours' },
    { title: 'Summer Holiday Tour', path: '/packages/summer_holiday_tour' },
    { title: 'Beach Vacation Tours', path: '/packages/beach_tours_india' }
  ];

  const instagramPhotos = [f1, f2, f3, f4, f5, f6];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Add newsletter submission logic here
    console.log('Newsletter subscription submitted');
  };

  // Scroll to top when navigation links are clicked
  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo Section */}
        <div className="footer-section logo-section">
          <div className="footer-logo">
            <img src={logo} alt="Travel Company Logo" className="logo-image" />
            <p className="logo-tagline">Explore the World with Us</p>
            <p className="company-description">
              Discover amazing destinations and create unforgettable memories with our expertly crafted travel experiences. Your journey starts here.
            </p>
            <div className="social-media">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section navigation-section">
          <h4>Quick Links</h4>
          <ul>
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link to={link.path} onClick={handleLinkClick}>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Tours Section */}
        <div className="footer-section tours-section">
          <h4>Our Tours</h4>
          <ul>
            {tourTypes.map((tour, index) => (
              <li key={index}>
                <Link to={tour.path} onClick={handleLinkClick}>
                  {tour.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Newsletter Section */}
        <div className="footer-section newsletter-section">
          <h4>Contact & Newsletter</h4>
          
          {/* Contact Information */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="contact-info">
              <FaPhone className="contact-icon" />
              <a href="tel:+1234567890" className="contact-link">+91 (999) 999-9999</a>
            </div>
            <div className="contact-info">
              <FaEnvelope className="contact-icon" />
              <a href="mailto:info@travelcompany.com" className="contact-link">Citypulse@gmail.com</a>
            </div>
          </div>

          {/* Newsletter */}
          <p>Subscribe to our newsletter for the latest travel deals and destinations.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Enter your email"
              required
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>

          {/* Instagram Photos */}
          <h4>Instagram</h4>
          <div className="instagram-photo">
            {instagramPhotos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Instagram post ${index + 1}`}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="copyright">
          © {new Date().getFullYear()} Travel Company. All Rights Reserved.
        </div>
        <div className="footer-links">
          <Link to="/privacy" onClick={handleLinkClick}>Privacy Policy</Link>
          <Link to="/terms" onClick={handleLinkClick}>Terms of Service</Link>
          <Link to="/sitemap" onClick={handleLinkClick}>Sitemap</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;