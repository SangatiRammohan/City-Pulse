import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Tour.css';
import Spinner from '../../Components/Spinner/Spinner'; // Import the Spinner component

// Import separate components
import DisabilityPopup from '../DisabilityPopup/DisabilityPopup';
import DisabilityAccommodations from '../DisabilityAccommodations/DisabilityAccomodations';
import GuideSelection from '../Guide/GuideSelection';
import PaymentForm from '../PaymentForm/PaymentForm';

// Directly import all package data files
import weekendToursData from '../../../data/Weekend_tour.json';
import summerholiday from '../../../data/summer_holiday_tour.json';
import keralatour from '../../../data/kerala_tour.json';
import hillStation from '../../../data/hill_station_tour.json';
import goldenTriangle from '../../../data/golden_triangle_tours.json';
import goatour from '../../../data/goa_tour.json';
import beachTour from '../../../data/beach_tours_india.json';

// Create a map of all available package data
const packageDataMap = {
  'weekend_tours': weekendToursData,
  'summer_holiday_tour': summerholiday,
  'kerala_tour': keralatour,
  'hill_station_tour': hillStation,
  'golden_triangle_tours': goldenTriangle,
  'goa_tour': goatour,
  'beach_tours_india': beachTour
};

const Tour = ({ packageType: propPackageType, destinationIndex: propDestinationIndex }) => {
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState();
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { packageType: paramPackageType, destinationIndex: paramDestinationIndex } = useParams();
  const [showDisabilityPopup, setShowDisabilityPopup] = useState(false);
  const [showDisabilityAccommodations, setShowDisabilityAccommodations] = useState(false);
  const [showGuideSelection, setShowGuideSelection] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  
  // Use prop packageType if provided, otherwise use the URL parameter
  const packageType = propPackageType || paramPackageType || 'beach_tours_india';
  
  // Use the prop destinationIndex if provided, otherwise use the URL parameter
  const destinationIndex = propDestinationIndex !== undefined 
    ? propDestinationIndex 
    : paramDestinationIndex !== undefined 
      ? parseInt(paramDestinationIndex, 10) 
      : undefined;

  useEffect(() => {
    const loadPackageData = () => {
      try {
        setLoading(true);
        
        // Get package data from our map
        const data = packageDataMap[packageType];
        
        if (data) {
          // Handle nested structure in beach_tours_india.json
          let mainData;
          
          if (packageType === 'beach_tours_india' && data.beach_tours_india) {
            mainData = data.beach_tours_india;
          } else if (data.destinations) {
            // If data already has destinations array
            mainData = data;
          } else if (Object.values(data)[0] && Object.values(data)[0].destinations) {
            // If first value in data object has destinations
            mainData = Object.values(data)[0];
          } else {
            // Fallback
            mainData = data;
          }
          
          setPackageData(mainData);
          
          // If destinationIndex is provided and valid, set the selected destination
          if (destinationIndex !== undefined && 
              mainData.destinations && 
              mainData.destinations[destinationIndex]) {
            setSelectedDestination(mainData.destinations[destinationIndex]);
          } else {
            setSelectedDestination(null);
          }
          
          setLoading(false);
        } else {
          throw new Error(`Package type '${packageType}' not found`);
        }
      } catch (err) {
        console.error("Error loading package data:", err);
        setError(`Failed to load package data: ${err.message}`);
        setLoading(false);
      }
    };
    
    loadPackageData();
  }, [packageType, destinationIndex]);

  const handleBookNow = () => {
    setShowDisabilityPopup(true);
  };

  const handleDisabilityYes = () => {
    setShowDisabilityPopup(false);
    setShowDisabilityAccommodations(true);
  };

  const handleDisabilityNo = () => {
    setShowDisabilityPopup(false);
    
    if (selectedGuide) {
      // If a guide is already selected, skip guide selection
      Swal.fire({
        title: 'Guide Already Selected',
        text: `${selectedGuide.name} has already been assigned to your trip.`,
        icon: 'info',
        confirmButtonText: 'Continue to Payment'
      }).then(() => {
        setShowPaymentForm(true);
      });
    } else {
      // If no guide is selected, proceed to guide selection
      setShowGuideSelection(true);
    }
  };

  const handleContinueToGuideSelection = () => {
    setShowDisabilityAccommodations(false);
    setShowGuideSelection(true);
  };

  const handleGuideSelect = (guide) => {
    setSelectedGuide(guide);
    setShowGuideSelection(false);

    // Show sweet alert for guide confirmation
    Swal.fire({
      title: 'Guide Assigned',
      text: `${guide.name} has been assigned to your trip!`,
      icon: 'success',
      confirmButtonText: 'Continue to Payment'
    }).then((result) => {
      if (result.isConfirmed) {
        setShowPaymentForm(true);
      }
    });
  };

  const handleNoGuidesAvailable = () => {
    setShowGuideSelection(false);

    // Show notification toast
    Swal.fire({
      title: 'No Guide Selected',
      text: 'You will proceed without a guide. Our customer service team will be available for assistance during your trip.',
      icon: 'info',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000
    });

    // Redirect to payment form without a guide
    setShowPaymentForm(true);
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedGuide(null);
    // Redirect to home or another appropriate page
    navigate('/');
  };

  const handleCloseModal = () => {
    setShowDisabilityPopup(false);
    setShowDisabilityAccommodations(false);
    setShowGuideSelection(false);
    setShowPaymentForm(false);
  };

  if (loading) {
    return (
      <div className="package-container loading">
        <Spinner size="large" overlay={true} />
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="package-container error">
        <h2>Error</h2>
        <p>{error || "Package not found"}</p>
        <Link to="/" className="back-to-home">Back to Home</Link>
      </div>
    );
  }

  // If we're showing a specific destination
  if (selectedDestination) {
    return (
      <div className="tour-container">
        <div className="tour-hero" style={{ backgroundImage: `url(${selectedDestination.image || packageData.bannerImage})` }}>
          <div className="tour-hero-overlay">
            <h1 className="tour-title">{selectedDestination.name}</h1>
            <p className="tour-subtitle">{packageData.subtitle}</p>
            <Link to={`/packages/${packageType}`} className="back-button">
              Back to all {packageData.title} packages
            </Link>
          </div>
        </div>

        <div className="tour-content-container">
          <div className="tour-details">
            <div className="tour-info-section">
              <h2>Tour Overview</h2>
              <p>{selectedDestination.description}</p>
            </div>

            {selectedDestination.dayWisePlan && selectedDestination.dayWisePlan.length > 0 && (
              <div className="tour-info-section">
                <h2>Itinerary</h2>
                <div className="itinerary-timeline">
                  {selectedDestination.dayWisePlan.map((day, index) => (
                    <div key={index} className="itinerary-day">
                      <div className="day-number">Day {day.day || index + 1}</div>
                      <div className="day-content">
                        <h3>{day.title || `Day ${day.day || index + 1}`}</h3>
                        <div className="day-activities">
                          <ul>
                            {day.activities && day.activities.map((activity, actIndex) => (
                              <li key={actIndex}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="tour-sidebar">
            <div className="tour-booking-card">
              <h2>Tour Details</h2>
              <div className="booking-details">
                <div className="booking-detail">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{selectedDestination.duration || packageData.duration}</span>
                </div>
                <div className="booking-detail">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">
                    ₹{selectedDestination.charge?.toLocaleString() || packageData.price?.replace('Starting from ', '') || 'Contact for pricing'}
                  </span>
                </div>
                {selectedDestination.totalUsers && (
                  <div className="booking-detail">
                    <span className="detail-label">Total Users:</span>
                    <span className="detail-value">{selectedDestination.totalUsers.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <button className="book-now-button" onClick={handleBookNow}>Book Now</button>
            </div>

            <div className="tour-info-card">
              <h3>What's Included</h3>
              <ul className="included-list">
                {(packageData.inclusions || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {packageData.highlights && packageData.highlights.length > 0 && (
              <div className="tour-info-card">
                <h3>Tour Highlights</h3>
                <ul className="highlights-list">
                  {packageData.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showDisabilityPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <DisabilityPopup 
                onYes={handleDisabilityYes} 
                onNo={handleDisabilityNo} 
                onClose={() => setShowDisabilityPopup(false)} 
              />
            </div>
          </div>
        )}

        {showDisabilityAccommodations && (
          <div className="popup-overlay">
            <div className="popup-content">
              <DisabilityAccommodations 
                selectedPackage={selectedDestination} 
                onContinue={handleContinueToGuideSelection} 
                onClose={handleCloseModal} 
              />
            </div>
          </div>
        )}

        {showGuideSelection && (
          <div className="popup-overlay">
            <div className="popup-content">
              <GuideSelection 
                selectedPackage={selectedDestination} 
                onGuideSelect={handleGuideSelect} 
                onClose={() => setShowGuideSelection(false)} 
                onNoGuides={handleNoGuidesAvailable}
              />
            </div>
          </div>
        )}

        {showPaymentForm && (
          <div className="popup-overlay">
            <div className="popup-content payment-popup">
              <PaymentForm 
                selectedPackage={selectedDestination} 
                selectedGuide={selectedGuide} 
                onClose={() => setShowPaymentForm(false)} 
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main package view with all destinations
  return (
    <div className="package-container">
      <div className="package-header">
        <h1>{packageData.title || 'Beach Tours'}</h1>
        <p className="package-subtitle">{packageData.subtitle || ''}</p>
      </div>

      {packageData.bannerImage && (
        <div className="package-banner">
          <img src={packageData.bannerImage} alt={packageData.title || 'Tour Package'} />
        </div>
      )}

      <div className="package-content">
        {packageData.description && (
          <div className="package-description">
            <h2>Description</h2>
            <p>{packageData.description}</p>
          </div>
        )}

        <div className="package-details">
          {packageData.duration && (
            <div className="detail-item">
              <h3>Duration</h3>
              <p>{packageData.duration}</p>
            </div>
          )}

          {packageData.price && (
            <div className="detail-item">
              <h3>Price</h3>
              <p>{packageData.price}</p>
            </div>
          )}

          {packageData.inclusions && packageData.inclusions.length > 0 && (
            <div className="detail-item">
              <h3>Inclusions</h3>
              <ul>
                {packageData.inclusions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {packageData.destinations && packageData.destinations.length > 0 && (
          <div className="destinations-section">
            <h2>Beach Destinations</h2>
            <div className="destinations-grid">
              {packageData.destinations.map((destination, index) => (
                <div key={index} className="destination-card">
                  {destination.image && (
                    <div className="destination-image">
                      <img src={destination.image} alt={destination.name} />
                    </div>
                  )}
                  <div className="destination-info">
                    <h3>{destination.name}</h3>
                    {destination.description && (
                      <p className="destination-description">
                        {destination.description.length > 100 
                          ? `${destination.description.substring(0, 100)}...` 
                          : destination.description}
                      </p>
                    )}
                    <div className="destination-details">
                      {destination.duration && (
                        <span className="duration-tag">{destination.duration}</span>
                      )}
                      {destination.charge && (
                        <span className="price-tag">₹{destination.charge.toLocaleString()}</span>
                      )}
                    </div>
                    <Link 
                      to={`/packages/${packageType}/destination/${index}`} 
                      className="view-details-button"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {packageData.highlights && packageData.highlights.length > 0 && (
          <div className="highlights-section">
            <h2>Highlights</h2>
            <ul className="highlights-list">
              {packageData.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}
        
        {packageData.accommodations && packageData.accommodations.length > 0 && (
          <div className="accommodations-section">
            <h2>Accommodation Options</h2>
            <div className="accommodations-grid">
              {packageData.accommodations.map((accommodation, index) => (
                <div key={index} className="accommodation-card">
                  <h3>{accommodation.name}</h3>
                  <p>{accommodation.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tour;