import React, { useState } from 'react';
import './GuideSelection.css';
import { guides } from './Guide.jsx'; // Changed to named import

const GuideSelection = ({ selectedPackage, onGuideSelect, onClose }) => {
  const [selectedGuideId, setSelectedGuideId] = useState(null);
  
  // Add fallback in case guides is undefined or not an array
  const guidesArray = Array.isArray(guides) ? guides : [];
  
  const handleSelectGuide = (guide) => {
    setSelectedGuideId(guide.id);
    setTimeout(() => onGuideSelect(guide), 500);
  };
  

  
  return (
    <div className="guide-selection-container">
      <h2>Select Your Guide</h2>
      <p className="guide-selection-intro">
        Choose a guide for your {selectedPackage?.name || 'trip'}:
      </p>
      
      <div className="guides-grid">
        {guidesArray.map(guide => (
          <div 
            key={guide.id}
            className={`guide-card ${selectedGuideId === guide.id ? 'selected' : ''}`}
            onClick={() => setSelectedGuideId(guide.id)}
          >
            <div className="guide-avatar">
              <img src={guide.image} alt={guide.name} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
            </div>
            <div className="guide-info">
              <h3>{guide.name}</h3>
              <div className="guide-details">
                <div className="guide-detail">
                  <span className="guide-detail-label">Languages:</span>
                  <span className="guide-detail-value">{guide.languages?.join(", ") || 'N/A'}</span>
                </div>
                <div className="guide-detail">
                  <span className="guide-detail-label">Specialties:</span>
                  <span className="guide-detail-value">{guide.specialties?.join(", ") || 'N/A'}</span>
                </div>
                <div className="guide-detail">
                  <span className="guide-detail-label">Available:</span>
                  <span className={`guide-detail-value ${guide.available ? 'available' : 'unavailable'}`}>
                    {guide.available ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <p className="guide-bio">{guide.bio}</p>
            </div>
            <button 
              className={`select-guide-button ${!guide.available ? 'disabled' : ''}`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                if (guide.available) {
                  handleSelectGuide(guide);
                }
              }}
              disabled={!guide.available}
            >
              {guide.available ? 'Select' : 'Unavailable'}
            </button>
          </div>
        ))}
      </div>
      
      <div className="guide-selection-buttons">

        <button className="guide-button cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GuideSelection;