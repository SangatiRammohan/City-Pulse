import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './City.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";


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


import Weekendimage from "../../assets/PopularAssets/Weekend.jpeg"
import summerimage from "../../assets/PopularAssets/summer.jpeg"
import keralaimage from "../../assets/PopularAssets/Kerala.jpeg"
import hillstationimage from  "../../assets/PopularAssets/Hill station.jpeg"
import goldenimage from "../../assets/PopularAssets/Golden triangle.jpeg"
import goaimage from "../../assets/PopularAssets/Goa.jpeg"
import beachimage from "../../assets/PopularAssets/beach.jpg"

const City = () => {
  const navigate = useNavigate();
  // Move the tour data to state so we can update it
  const [tourdata, setTourdata] = useState([]);

  // Base tour data (template)
  const baseTourData = [
    {
      "id": 1,
      "image":Weekendimage,
      "date": "March 3-6, 2025",
      "title": "weekend_tours",
      "description": "Explore exciting weekend getaways to rejuvenate and unwind.",
      "price": "700",
      "group_size": "10-15 Group",
      "duration": "4 days"
    },
    {
      "id": 2,
      "image":summerimage,
      "date": "March 3-6, 2025",
      "title": 'summer_holiday_tour',
      "description": "Beat the heat with our specially curated summer holiday packages.",
      "price": "700",
      "group_size": "10-15 Group",
      "duration": "4 days"
    },
    {
      "id": 3,
      "image":keralaimage,
      "date": "March 3-6, 2025",
      "title": 'kerala_tour',
      "description": "Experience the beauty of God's own country with our Kerala packages.",
      "price": "700",
      "group_size": "10-15 Group",
      "duration": "4 days"
    },
    {
      "id": 4,
      "image":hillstationimage,
      "date": "March 3-6, 2025",
      "title": 'hill_station_tour',
      "description": "Escape to the serene heights of India's most beautiful hill stations.",
      "price": "700",
      "group_size": "10-15 Group",
      "duration": "4 days"
    },
    {
      "id": 5,
      "image": goldenimage,
      "date": "March 3-6, 2025",
      "title": 'golden_triangle_tours',
      "description": "Discover the rich cultural heritage of Delhi, Agra and Jaipur.",
      "price": "850",
      "group_size": "8-12 Group",
      "duration": "5 days"
    },
    {
      "id": 6,
      "image": goaimage,
      "date": "April 10-15, 2025",
      "title": 'goa_tour',
      "description": "Enjoy sun, sand and surf in India's favorite beach destination.",
      "price": "950",
      "group_size": "6-10 Group",
      "duration": "6 days"
    },
    {
      "id": 7,
      "image": beachimage,
      "date": "May 15-20, 2025",
      "title": 'beach_tours_india',
      "description": "Explore the beautiful coastlines and beaches across India.",
      "price": "850",
      "group_size": "8-12 Group",
      "duration": "6 days"
    }
  ];

  // Generate dynamic tour dates based on current date
  const generateDynamicTourDates = () => {
    const currentDate = new Date();
    
    return baseTourData.map(tour => {
      // Create a new tour object to avoid mutating the original
      const updatedTour = { ...tour };
      
      // Calculate new start date (add days based on tour ID to spread them out)
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() + (tour.id * 4)); // Spread tours 4 days apart
      
      // Calculate end date based on duration
      const endDate = new Date(startDate);
      const durationDays = parseInt(tour.duration.split(' ')[0]);
      endDate.setDate(startDate.getDate() + durationDays - 1);
      
      // Format dates as "Month Day-Day, Year"
      const startMonth = startDate.toLocaleString('default', { month: 'long' });
      const startDay = startDate.getDate();
      const endDay = endDate.getDate();
      const year = startDate.getFullYear();
      
      // If the tour spans months, include both month names
      if (startDate.getMonth() !== endDate.getMonth()) {
        const endMonth = endDate.toLocaleString('default', { month: 'long' });
        updatedTour.date = `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
      } else {
        updatedTour.date = `${startMonth} ${startDay}-${endDay}, ${year}`;
      }
      
      return updatedTour;
    });
  };

  // Update tour dates when component mounts
  useEffect(() => {
    const updatedTours = generateDynamicTourDates();
    setTourdata(updatedTours);
  }, []); // Empty dependency array means this runs once on component mount


  const handleTourSelection = (tourTitle) => {
    const packageData = packageDataMap[tourTitle];
    if (!packageData) {
      console.error(`No package data found for tour: ${tourTitle}`);
      return;
    }

    // Navigate to the Tour component with the selected package data
    navigate(`/packages/${tourTitle}`, {
      state: { packageData }
    });
  };

  // Custom previous arrow component
  const PrevArrow = (props) => {
    const { className, onClick } = props;
    return (
      <div className="slick-arrow custom-prev-arrow" onClick={onClick}>
        <i className="prev-icon">❮</i>
      </div>
    );
  };

  // Custom next arrow component
  const NextArrow = (props) => {
    const { className, onClick } = props;
    return (
      <div className="slick-arrow custom-next-arrow" onClick={onClick}>
        <i className="next-icon">❯</i>
      </div>
    );
  };

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ],
    customPaging: i => (
      <div className="custom-dot"></div>
    )
  };

  return (
    <>
      <main className='mainsection'>
        <div className="populartour">
          <h3>Most Popular</h3>
          <h1>Explore our Top Destinations</h1>
          <span className="line"></span>
          <h5>Check best tours starting shortly</h5>
        </div>
        
        <div className="tourCarousel">
          <Slider {...settings}>
            {tourdata.map((tour) => (
              <div className="tourCard-wrapper" key={tour.id}>
                <div className="tourCards">
                  <div className="tour-image-container">
                    <img src={tour.image} alt={tour.title} />
                    <div className="tour-date">{tour.date}</div>
                  </div>
                  <div className="tourdetails">
                    <h2>{tour.title.replace(/_/g, ' ')}</h2>
                    <p className="tour-description">{tour.description}</p>
                    <div className="tourtime">
                      <div className="tour-info">
                        <span className="info-icon">💰</span>
                        <p className="tourdays">{tour.price}</p>
                      </div>
                      <div className="tour-info">
                        <span className="info-icon">👥</span>
                        <p className="tourdays">{tour.group_size}</p>
                      </div>
                      <div className="tour-info">
                        <span className="info-icon">⏱️</span>
                        <p className="tourdays">{tour.duration}</p>
                      </div>
                    </div>
                    <button 
                      className='tourbtn' 
                      onClick={() => handleTourSelection(tour.title)}
                    >
                      Explore Tour
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </main>
    </>
  );
};

export default City;