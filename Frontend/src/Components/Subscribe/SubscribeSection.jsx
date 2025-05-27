import React from 'react';
import './SubscribeSection.css';

const SubscribeSection = () => {
  return (
    <div className="subscribe-container">
      <div className="subscribe-content">
        <h2>Stay Updated with Our Latest Travel Deals</h2>
        <p>Subscribe to our newsletter and never miss out on amazing travel offers and destinations.</p>

        <div className="subscribe-form">
          <input type="Email" placeholder="Enter your email" className="subscribe-input" />
          <button className="subscribe-button">Subscribe</button>
        </div>
      </div>
    </div>
  );
};

export default SubscribeSection;
