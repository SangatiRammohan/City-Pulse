import React from 'react';
import './DisabilityPopup.css';

const DisabilityPopup = ({ onYes, onNo, onClose }) => {
  return (
    <div className="disability-popup-overlay">
      <div className="disability-popup-content">
        <h2>Accessibility Information</h2>
        <p>Do you or anyone in your group have any disabilities or special requirements?</p>
        <div className="disability-popup-buttons">
          <button className="primary-button" onClick={onYes}>Yes</button>
          <button className="secondary-button" onClick={onNo}>No</button>
          <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    </div>
  );
};

export default DisabilityPopup;