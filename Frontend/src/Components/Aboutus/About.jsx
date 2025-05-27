import React, { useEffect, useState, useRef } from 'react';
import './About.css';
import aboutImage from '../../assets/AboutAssets/pic1.jpeg';
import Team1 from '../../assets/AboutAssets/Team1.jpg'
import Team2 from '../../assets/AboutAssets/Team2.avif'
import Team3 from '../../assets/AboutAssets/Team3.jpg'
const AboutPage = React.forwardRef((props, ref) => {
  // Create refs for stats tracking
  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // State for each counter
  const [yearsCount, setYearsCount] = useState(0);
  const [destinationsCount, setDestinationsCount] = useState(0);
  const [travelersCount, setTravelersCount] = useState(0);
  
  // Function to check if element is in viewport
  const isInViewport = (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };
  
  // Handle animation
  useEffect(() => {
    const handleScroll = () => {
      if (hasAnimated) return;
      
      if (statsRef.current && isInViewport(statsRef.current)) {
        setHasAnimated(true);
        
        // Animate years counter (0 to 5)
        let yearsCounter = 0;
        const yearsInterval = setInterval(() => {
          yearsCounter += 1;
          setYearsCount(yearsCounter);
          if (yearsCounter >= 5) clearInterval(yearsInterval);
        }, 200);
        
        // Animate destinations counter (0 to 50)
        let destCounter = 0;
        const destInterval = setInterval(() => {
          destCounter += 1;
          setDestinationsCount(destCounter);
          if (destCounter >= 50) clearInterval(destInterval);
        }, 40);
        
        // Animate travelers counter (0 to 10)
        let travCounter = 0;
        const travInterval = setInterval(() => {
          travCounter += 1;
          setTravelersCount(travCounter);
          if (travCounter >= 10) clearInterval(travInterval);
        }, 200);
      }
    };
    
    // Check on scroll and initial load
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial render
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnimated]);
  
  return (
    <div className="about-page" ref={ref} id="about">
      <div className="about-hero">
        <div className="about-hero-image">
          <img 
            src={aboutImage}
            alt="CityPulse About Us" 
            className="hero-image"
          />
        </div>
        <div className="about-hero-content">
          <h1>Discover CityPulse: Your Global Travel Companion</h1>
          <p>
            CityPulse is more than just a travel agency – we're your gateway to extraordinary experiences 
            and unforgettable journeys. Founded in 2020, we've been dedicated to creating unique, immersive 
            travel experiences that go beyond traditional tourism.
          </p>
          <div className="about-hero-stats" ref={statsRef}>
            <div className="stat">
              <h3 className={hasAnimated ? "animate-stat" : ""}>{yearsCount}+</h3>
              <p>Years of Experience</p>
            </div>
            <div className="stat">
              <h3 className={hasAnimated ? "animate-stat" : ""}>{destinationsCount}+</h3>
              <p>Destinations</p>
            </div>
            <div className="stat">
              <h3 className={hasAnimated ? "animate-stat" : ""}>{travelersCount}k+</h3>
              <p>Happy Travelers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="about-mission">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            At CityPulse, we believe in transforming travel from a mere journey to a life-changing experience. 
            Our mission is to craft personalized, sustainable, and immersive travel experiences that connect 
            travelers with local cultures, landscapes, and communities.
          </p>
        </div>
      </div>

      <div className="about-values">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <h3>Authenticity</h3>
            <p>
              We prioritize genuine, local experiences that offer deep cultural insights 
              and meaningful connections.
            </p>
          </div>
          <div className="value-card">
            <h3>Sustainability</h3>
            <p>
              We are committed to responsible tourism that respects local environments 
              and supports community development.
            </p>
          </div>
          <div className="value-card">
            <h3>Innovation</h3>
            <p>
              We continuously explore new destinations and create unique travel experiences 
              that challenge traditional tourism.
            </p>
          </div>
          <div className="value-card">
            <h3>Customer Care</h3>
            <p>
              Our travelers are our priority. We provide personalized support and 
              ensure comfort throughout the journey.
            </p>
          </div>
        </div>
      </div>

      <div className="about-team">
        <h2>Meet Our Team</h2>
        <div className="team-preview">
          <div className="team-member">
            <img 
              src={Team1}
              alt="Team Member 1" 
              className="team-image"
            />
            <h3>Swathi G</h3>
            <p>Founder & CEO</p>
          </div>
          <div className="team-member">
            <img 
              src={Team3}
              alt="Team Member 2" 
              className="team-image"
            />
            <h3>Kiran Kumar K</h3>
            <p>Chief Experience Officer</p>
          </div>
          <div className="team-member">
            <img 
              src={Team2}
              alt="Team Member 3" 
              className="team-image"
            />
            <h3>Varsha O</h3>
            <p>Head of Sustainable Tourism</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AboutPage;