import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet"; // Leaflet library
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS
import "./ContactSection.css";

const ContactSection = () => {
  const [openAccordion, setOpenAccordion] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // Add your form submission logic here
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
      email: "CityPulse@gmail.com",
      coordinates: { lat: 28.6139, lng: 77.2090 },
    },
    {
      title: "Hyderabad Office",
      address: "Madhapur, 500092",
      hours: "Monday - Friday: 8 am - 6 pm",
      phone: "+91 8888888888",
      email: "CityPulse@gmail.com",
      coordinates: { lat: 17.4433, lng: 78.3753 },
    },
    {
      title: "Kerala Office",
      address: "Coimbatore, 455678",
      hours: "Monday - Friday: 8 am - 6 pm",
      phone: "+91 8888888888",
      email: "CityPulse@gmail.com",
      coordinates: { lat: 10.8505, lng: 76.2711 },
    }
  ];

  return (
    <div className="contact-section">
      <h1 className="contact-heading">Contact Us</h1>

      <div className="contact-container">
        <div className="office-locations">
          {officeLocations.map((office, index) => (
            <div className="office-card" key={index}>
              <h2>{office.title}</h2>
              <p><span className="icon">📍</span> {office.address}</p>
              <p><span className="icon">🕒</span> {office.hours}</p>
              <p><span className="icon">📞</span> {office.phone}</p>
              <p><span className="icon">📧</span> {office.email}</p>
            </div>
          ))}
        </div>

        <div className="map-container">
          {/* Leaflet Map */}
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ width: '100%', height: '400px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Add markers */}
            {officeLocations.map((office, index) => (
              <Marker key={index} position={office.coordinates}>
                <Popup>
                  <h3>{office.title}</h3>
                  <p>{office.address}</p>
                  <p>{office.hours}</p>
                  <p>{office.phone}</p>
                  <p>{office.email}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="faq-form-container">
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="accordion">
            {FAQItems.map((item, index) => (
              <div className="accordion-item" key={index}>
                <div
                  className={`accordion-header ${openAccordion === index ? 'active' : ''}`}
                  onClick={() => toggleAccordion(index)}
                >
                  <span>{item.question}</span>
                  <span className="accordion-icon">{openAccordion === index ? "−" : "+"}</span>
                </div>
                {openAccordion === index && (
                  <div className="accordion-content">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="contact-form">
          <h2>Send Us a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
