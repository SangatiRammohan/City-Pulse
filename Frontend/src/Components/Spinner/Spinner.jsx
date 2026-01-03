import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'medium', overlay = false }) => {
  const spinnerSizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  }[size] || 'spinner-medium';

  if (overlay) {
    return (
      <div className="spinner-overlay">
        <div className={`spinner ${spinnerSizeClass}`}>
          <div className="spinner-circle"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`spinner ${spinnerSizeClass}`}>
      <div className="spinner-circle"></div>
    </div>
  );
};

export default Spinner;