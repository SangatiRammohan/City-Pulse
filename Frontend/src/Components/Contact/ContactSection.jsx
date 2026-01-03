import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { contactAPI } from "../../services/api";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ContactSection.css";

const ContactSection = () => {
  const [openAccordion, setOpenAccordion] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [focusedInput, setFocusedInput] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      await Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Submitting contact form:', formData);

      const response = await contactAPI.submit(formData);

      console.log('✅ Contact form submitted successfully:', response);

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Message Sent Successfully! 🎉',
        html: `
          <p>Thank you for contacting us, <strong>${formData.name}</strong>!</p>
          <p>We've received your message and will get back to you within 24 hours.</p>
          <p style="color: #666; font-size: 0.9rem; margin-top: 1rem;">
            A confirmation email has been sent to <strong>${formData.email}</strong>
          </p>
        `,
        confirmButtonColor: '#54a15d',
        confirmButtonText: 'Got it!',
        timer: 5000
      });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        message: "",
      });

    } catch (error) {
      console.error('❌ Contact form submission error:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.message || 'Failed to send message. Please try again or contact us directly.',
        confirmButtonColor: '#54a15d'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FAQItems = [
    { question: "Who lead your tours?", answer: "Our experienced local guides lead all tours." },
    { question: "Do all guides speak English?", answer: "Yes, all our guides are fluent in English." },
    { question: "Do your guides adapt to their public?", answer: "Our guides tailor experiences for different audiences." },
    { question: "Do you offer any discount if I book several tours?", answer: "We provide group discounts for multiple bookings." },
    { question: "What if I need to cancel my reservation?", answer: "Cancellations are subject to our refund policy." },
  ];

  const officeLocations = [
    {
      title: "Delhi Office",
      address: "Delhi headquarters, 700927",
      hours: "Monday - Friday: 8 am - 6 pm",
      phone: "+91 8888888888",
      email: "citypulsetours01@gmail.com",
      coordinates: { lat: 28.6139, lng: 77.2090 },
      icon: "🏢"
    },
    {
      title: "Hyderabad Office",
      address: "Madhapur, 500092",
      hours: "Monday - Friday: 8 am - 6 pm",
      phone: "+91 8888888888",
      email: "citypulsetours01@gmail.com",
      coordinates: { lat: 17.4433, lng: 78.3753 },
      icon: "🏛️"
    },
    {
      title: "Kerala Office",
      address: "Coimbatore, 455678",
      hours: "Monday - Friday: 8 am - 6 pm",
      phone: "+91 8888888888",
      email: "citypulsetours01@gmail.com",
      coordinates: { lat: 10.8505, lng: 76.2711 },
      icon: "🏪"
    }
  ];

  return (
    <div className="contact-section">
      {/* Hero Header */}
      <div className="contact-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="contact-heading">Get In Touch</h1>
          <p className="contact-subtitle">We'd love to hear from you. Our team is always here to help.</p>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>

      {/* Office Locations */}
      <div className="offices-wrapper">
        <div className="section-header">
          <span className="section-label">Our Locations</span>
          <h2 className="section-title">Visit Our Offices</h2>
        </div>
        <div className="office-locations">
          {officeLocations.map((office, index) => (
            <div className="office-card" key={index}>
              <div className="office-header">
                <div className="office-icon-badge">
                  <span className="office-icon">{office.icon}</span>
                </div>
                <h3 className="office-title">{office.title}</h3>
              </div>
              <div className="office-info">
                <div className="info-row">
                  <span className="info-icon">📍</span>
                  <span className="info-text">{office.address}</span>
                </div>
                <div className="info-row">
                  <span className="info-icon">🕒</span>
                  <span className="info-text">{office.hours}</span>
                </div>
                <div className="info-row">
                  <span className="info-icon">📞</span>
                  <span className="info-text">{office.phone}</span>
                </div>
                <div className="info-row">
                  <span className="info-icon">📧</span>
                  <span className="info-text">{office.email}</span>
                </div>
              </div>
              <div className="office-hover-effect"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <div className="map-container">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {officeLocations.map((office, index) => (
              <Marker key={index} position={office.coordinates}>
                <Popup>
                  <div className="custom-popup">
                    <h3>{office.title}</h3>
                    <p>{office.address}</p>
                    <p>{office.hours}</p>
                    <p>{office.phone}</p>
                    <p>{office.email}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* FAQ and Form Section */}
      <div className="content-section">
        <div className="faq-container">
          <div className="section-header">
            <span className="section-label">FAQ</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="accordion">
            {FAQItems.map((item, index) => (
              <div className={`accordion-item ${openAccordion === index ? 'active' : ''}`} key={index}>
                <div
                  className="accordion-header"
                  onClick={() => toggleAccordion(index)}
                >
                  <span className="accordion-question">{item.question}</span>
                  <span className="accordion-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <div className="accordion-content">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-container">
          <div className="section-header">
            <span className="section-label">Message Us</span>
            <h2 className="section-title">Send Us a Message</h2>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className={`form-field ${formData.name || focusedInput === 'name' ? 'has-value' : ''}`}>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                disabled={isSubmitting}
                required
              />
              <label htmlFor="name">Full Name *</label>
              <span className="form-field-border"></span>
            </div>

            <div className={`form-field ${formData.phone || focusedInput === 'phone' ? 'has-value' : ''}`}>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => setFocusedInput(null)}
                disabled={isSubmitting}
              />
              <label htmlFor="phone">Phone Number (Optional)</label>
              <span className="form-field-border"></span>
            </div>

            <div className={`form-field ${formData.email || focusedInput === 'email' ? 'has-value' : ''}`}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                disabled={isSubmitting}
                required
              />
              <label htmlFor="email">Email Address *</label>
              <span className="form-field-border"></span>
            </div>

            <div className={`form-field form-field-textarea ${formData.message || focusedInput === 'message' ? 'has-value' : ''}`}>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput('message')}
                onBlur={() => setFocusedInput(null)}
                disabled={isSubmitting}
                required
              ></textarea>
              <label htmlFor="message">Your Message *</label>
              <span className="form-field-border"></span>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner"></span>
                  <span className="btn-text">Sending...</span>
                </>
              ) : (
                <>
                  <span className="btn-text">Send Message</span>
                  <span className="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M17.5 2.5L8.75 11.25M17.5 2.5L12.5 17.5L8.75 11.25M17.5 2.5L2.5 7.5L8.75 11.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;