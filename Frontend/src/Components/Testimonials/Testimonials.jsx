
import React, { useState, useEffect } from 'react';
import './Testimonials.css';

const testimonials = [
  {
    name: "John Doe",
    review: "Amazing experience! The trip was well-organized and exceeded all my expectations.",
  },
  {
    name: "Sarah Smith",
    review: "The service was excellent, and the destinations were breathtaking!",
  },
  {
    name: "Michael Johnson",
    review: "Highly recommend! Everything went smoothly, and I had the best time ever!",
  },
  {
    name: "Emily Williams",
    review: "A fantastic journey from start to finish. Would book again!",
  },
  {
    name: "David Brown",
    review: "Loved every bit of it! The team took care of every little detail.",
  },
  {
    name: "Sophia Davis",
    review: "One of the best travel experiences I’ve ever had. Simply outstanding!",
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Function to move to the next testimonial
  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="testimonials-container">
      <h2 className="testimonials-title">What Our Travelers Say</h2>
      <p className="testimonials-description">
        Read what our happy travelers have to say about their experiences with us.
      </p>

      <div className="testimonial-wrapper">
      

        <div className="testimonial-card">
          <p className="testimonial-text">"{testimonials[activeIndex].review}"</p>
          <h4 className="testimonial-name">- {testimonials[activeIndex].name}</h4>
        </div>

     
      </div>
    </div>
  );
};

export default Testimonials;

