import React from 'react';
import './DisabilityAccomodations.css';

const DisabilityAccommodations = ({ selectedPackage, onContinue, onClose }) => {
  return (
    <div className="accommodations-container">
      <h2>Accessibility Accommodations</h2>
      <p className="package-name">For your trip to: {selectedPackage?.name || 'Selected destination'}</p>
      <p>We offer the following accommodations for this package:</p>
      <ul className="accommodations-list">
        <li>Wheelchair accessible transportation</li>
        <li>Accessible hotel rooms</li>
        <li>Special dietary requirements</li>
        <li>Assistance with mobility</li>
      </ul>
      <p className="note">Our team will contact you to discuss your specific needs.</p>
      <div className="accommodations-buttons">
        <button className="primary-button" onClick={onContinue}>Continue</button>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default DisabilityAccommodations;