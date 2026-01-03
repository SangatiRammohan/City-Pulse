import React, { useState } from 'react';
import './TripBookingProcess.css';

const TripProcess = () => {
  const [activeStep, setActiveStep] = useState(0);

  const processSteps = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: 'Destination Discovery',
      description: 'Explore unique destinations tailored to your interests.',
      detailedDescription: 'Our expert team carefully curates destinations that match your personal travel preferences, ensuring a truly memorable experience.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: 'Personalized Itinerary',
      description: 'Craft a custom journey matching your style.',
      detailedDescription: 'We design a unique travel plan that considers your interests, budget, and desired experiences, creating a truly personalized adventure.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Booking & Confirmation',
      description: 'Secure your trip with easy booking.',
      detailedDescription: 'Streamlined booking process with instant confirmations, transparent pricing, and dedicated support to ensure a smooth experience.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Experience & Memories',
      description: 'Create unforgettable travel memories.',
      detailedDescription: 'Immerse yourself in unique experiences, create lasting memories, and return home with stories that will be cherished for a lifetime.'
    }
  ];

  const handleStepClick = (index) => {
    setActiveStep(index);
  };

  return (
    <div className="trip-process-container">
      <h1 className="trip-process-title">Your Journey Begins Here</h1>
      
      <div className="process-timeline">
        {processSteps.map((step, index) => (
          <div 
            key={index} 
            className={`process-step ${activeStep === index ? 'active' : ''}`}
            onClick={() => handleStepClick(index)}
          >
            <div className="process-step-icon">
              {step.icon}
            </div>
            <h3 className="process-step-title">{step.title}</h3>
            <p className="process-step-description">{step.description}</p>
            <p className="process-step-detaileddescription">{step.detailedDescription}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripProcess;