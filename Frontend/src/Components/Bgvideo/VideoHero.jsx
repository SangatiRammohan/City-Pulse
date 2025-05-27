import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './VideoHero.css';

const VideoHero = () => {
  const navigate = useNavigate(); // Initialize navigate function

  // Function to navigate to Packages component
  const navigateToPackages = () => {
    navigate('/packages'); // Adjust the path based on your routing setup
  };

  return (
    <div className="video-hero-container">
      <video 
        className="background-video" 
        autoPlay 
        loop 
        muted 
        playsInline
        height={100}
      >
        <source 
          src="https://videos.pexels.com/video-files/16292445/16292445-uhd_2560_1440_24fps.mp4"
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>
      
      <div className="video-hero-overlay"></div>
      
      <div className="video-hero-content">
        <h1 className="video-hero-title">
          Discover Extraordinary Journeys
        </h1>
        
        <p className="video-hero-description">
          Embark on unforgettable adventures that transform your perspective. 
          CityPulse offers immersive travel experiences that connect you with 
          the world's most breathtaking destinations.
        </p>
        
        <button className="explore-tours-btn" onClick={navigateToPackages}>
          Explore Tours
        </button>
      </div>
    </div>
  );
};

export default VideoHero;