import React from "react";
import { Link } from "react-router-dom";
import "./Packages.css";
import p1 from '../../assets/Tours/GoldenTriangle/Golden-Triangle-Holiday-Tour-logo.jpg'
import p2 from '../../assets/Tours/weekend/weekend-tour-logo.jpg'
import p3 from '../../assets/Tours/HillStation/Hillstation-logo.jpg'
import p4 from '../../assets/Tours/kerala/Kerala-Image-logo.jpg'
import p5 from '../../assets/Tours/Goa/goa-logo.jpg'
import p6 from '../../assets/Tours/Summer/Summer-logo.jpg'
import p7 from '../../assets/Tours/beach/Beach-logo.jpg'

const Packages = () => {
  const tourPackages = [
    {
      name: "Golden Triangle Tours",
      image: p1,
      path: "golden-triangle-tours",
    },
    {
      name: "Weekend Tours",
      image: p2,
      path: "weekend-tours",
    },
    {
      name: "Hill Station Tours",
      image: p3,
      path: "hill-station-tour",
    },
    {
      name: "Kerala Tour",
      image: p4,
      path: "kerala-tour",
    },
    {
      name: "Goa Tour",
      image: p5,
      path: "goa-tour",
    },
    {
      name: "Summer Holiday Tour",
      image: p6,
      path: "summer-holiday-tour",
    },
    {
      name: "Beach Vacation Tours",
      image: p7,
      path: "beach-tours-india",
    },
  ];

  return (
    <div className="packages-container">
      {/* Title & Description */}
      <div className="packages-header">
        <h1>City Tours</h1>
        <p>
          Explore the best destinations with our specially curated tour
          packages. Experience breathtaking landscapes, vibrant cultures, and
          unforgettable adventures.
        </p>
      </div>

      {/* Tour Cards */}
      <div className="packages-grid">
        {tourPackages.map((tour, index) => (
          <Link
            to={`/packages/${tour.path}`}
            key={index}
            className="package-card"
          >
            <img src={tour.image} alt={tour.name} />
            <div className="package-overlay">
              <h3>{tour.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Packages;