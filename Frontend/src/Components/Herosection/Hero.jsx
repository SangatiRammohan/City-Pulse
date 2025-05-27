import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import for React Router
import "./Hero.css";
import i1 from '../../assets/HeroAssets/bg1.avif';
import i from '../../assets/HeroAssets/bg2.avif';
import i2 from '../../assets/HeroAssets/bg3.jpeg';

const images = [i, i1, i2];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleWatchTour = () => {
    setIsVideoOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoOpen(false);
  };

  // Function to navigate to Packages component
  const navigateToPackages = () => {
    navigate('/packages'); // Adjust the path based on your routing setup
  };

  return (
    <>
      <div className="hero">
        {/* Carousel Images */}
        <div className="carousel">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Slide ${index + 1}`}
              className={`carousel-image ${index === currentIndex ? "active" : ""}`}
            />
          ))}
        </div>

        {/* Overlay Text */}
        <div className="hero-text">
          <h1>
            Your Perfect Tours <span>Around the World</span> Start Here!
          </h1>
          <h2>
            Join our group and individual tours. Enjoy your vacations and get amazing emotions!
          </h2>

          {/* Buttons */}
          <div className="tour-buttons-container">
            <button className="explore-tours-btn" onClick={navigateToPackages}>
              Explore Tours
            </button>
            <button className="watch-tour-btn" onClick={handleWatchTour}>
              <Play className="play-icon" size={20} />
              Watch Tour
            </button>
          </div>
        </div>

        {/* Video Modal */}
        {isVideoOpen && (
          <div className="video-modal" onClick={closeVideoModal}>
            <div className="video-container" onClick={(e) => e.stopPropagation()}>
              <button className="close-video-btn" onClick={closeVideoModal} aria-label="Close video">
                &times;
              </button>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/BcqKFHcx9iY?autoplay=1&rel=0"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Hero;