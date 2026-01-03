import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Guide.css";

import guide1 from '../../assets/GuideAssets/NarayanaMurthi.jpg'
import guide2 from '../../assets/GuideAssets/LaxmiReddy.jpg'
import guide3 from '../../assets/GuideAssets/PriyaNair.jpg'
import guide4 from '../../assets/GuideAssets/Saraswathi.jpg'
import guide5 from '../../assets/GuideAssets/VamsiKrishna.jpg'
import guide6 from '../../assets/GuideAssets/VenkayyaNaidu.jpg'
 export const guides = [
  {
    id: 1,
    name: "Narayana Murthi",
    image: guide1,
    description: "Experienced tour guide with 10+ years of experience in historical sites.",
    email: "Narayana.Murthi@example.com",
    instagram: "@NarayanaMurthi_tours",
    facebook: "facebook.com/NarayanaMurthitours",
    available: true,
    x: "@Narayana_Murthi_guide",
    bio: "NarayanaMurthi has been leading tours across historical sites for over a decade. With his background in history and archaeology, he brings ancient stories to life while ensuring everyone has a comfortable and enriching experience.",
    specialties: ["Historical sites", "Museum tours", "Architectural walks"],
    languages: ["English", "Hindi", "Bengali"],
    reviews: [
      { author: "Sarah M.", rating: 5, text: "NarayanaMurthi was incredibly knowledgeable and made our tour fascinating!" },
      { author: "James K.", rating: 5, text: "Best historical tour I've ever taken. John is a walking encyclopedia." }
    ]
  },
  {
    id: 2,
    name: "Laxmi Reddy",
    image: guide2,
    description: "Specialist in adventure tours and wildlife safaris.",
    email: "Laxmi.Reddy@example.com",
    instagram: "@LaxmiReddy_adventures",
    facebook: "facebook.com/LaxmiReddytours",
    x: "@LaxmiReddy_guide",
    available: true,
    bio: "Laxmi Reddy is an adrenaline junkie with a deep love for nature. She has led expeditions in four continents and is certified in wilderness first aid, making her the perfect guide for your next adventure.",
    specialties: ["Wildlife safaris", "Hiking expeditions", "Extreme sports tours"],
    languages: ["English", "Hindi","Telugu"],
    reviews: [
      { author: "Michael T.", rating: 5, text: "Laxmi Reddy made our safari unforgettable. Her knowledge of wildlife is impressive!" },
      { author: "Lisa R.", rating: 4, text: "Great adventure guide, very safety conscious while still making it exciting." }
    ]
  },
  {
    id: 3,
    name: "Priya Nair",
    image: guide3,
    description: "Expert in cultural tours and local cuisines.",
    email: "PriyaNair@example.com",
    instagram: "@PriyaNair_culture",
    facebook: "facebook.com/PriyaNairtours",
    x: "@PriyaNair_guide",
    available: true,
    bio: "With a background in culinary arts and cultural anthropology, Priya specializes in immersive experiences that engage all your senses. Her food tours have been featured in several travel magazines.",
    specialties: ["Food tours", "Cultural immersion", "Artisan workshops"],
    languages: ["English", "Hindi", "Tamil"],
    reviews: [
      { author: "Emma J.", rating: 5, text: "priya's food tour was the highlight of our trip! We discovered places we would never have found on our own." },
      { author: "Robert P.", rating: 5, text: "Incredible knowledge of local cuisine and culture. Highly recommend!" }
    ]
  },
  {
    id: 4,
    name: "Saraswathi",
    image: guide4,
    description: "Certified hiking and trekking guide with mountain experience.",
    email: "Saraswathi@example.com",
    instagram: "@Saraswathi_hiking",
    facebook: "facebook.com/Saraswathitours",
    x: "@Saraswathi_guide",
    available: false,
    bio: "Saraswathi has conquered some of the world's most challenging peaks and now shares her passion for mountains with others. She's certified in mountain rescue and is known for her patience with beginners.",
    specialties: ["Mountain trekking", "Alpine climbing", "Winter hiking"],
    languages: ["English", "malayalam", "Hindi"],
    reviews: [
      { author: "Daniel F.", rating: 5, text: "Saraswathi made our first serious hike feel safe and enjoyable. Her knowledge of the trails is excellent." },
      { author: "Sophia L.", rating: 4, text: "Great guide for challenging treks. Very supportive and encouraging." }
    ]
  },
  {
    id: 5,
    name: "Vamsi Krishna",
    image: guide5,
    description: "Passionate about city tours and architectural history.",
    email: "VamsiKrishna@example.com",
    instagram: "@VamsiKrishna_city",
    facebook: "facebook.com/VamsiKrishnatours",
    x: "@VamsiKrishna_guide",
    available: true,
    bio: "Vamsi holds a degree in Architecture and has an eye for urban design. His tours highlight both famous landmarks and hidden gems, offering insights into how cities evolve over time.",
    specialties: ["Urban exploration", "Architectural tours", "Photography walks"],
    languages: ["English", "Telugu", "Tamil"],
    reviews: [
      { author: "Jennifer R.", rating: 5, text: "Vamsi showed us aspects of the city I've walked past for years but never noticed. Fascinating tour!" },
      { author: "Kevin M.", rating: 5, text: "His knowledge of architecture and urban history is impressive. Excellent guide." }
    ]
  },
  {
    id: 6,
    name: "Venkayya Naidu",
    image: guide6,
    description: "Fluent in multiple languages for international travelers.",
    email: "VenkayyaNaidu@example.com",
    available: false,
    instagram: "@VenkayyaNaidu_global",
    facebook: "facebook.com/VenkayyaNaidutours",
    x: "@VenkayyaNaidu_guide",
    bio: "Having lived in six countries, Sophia specializes in bridging cultural gaps. He's known for creating customized experiences that help travelers connect deeply with local communities.",
    specialties: ["Cultural interpretation", "Custom itineraries", "Language immersion"],
    languages: ["English", "Marati", "Kanada", "Telugu", "Hindi"],
    reviews: [
      { author: "Amir K.", rating: 5, text: "Naidu's language skills made our trip so much smoother. He helped us connect with locals in a way we couldn't have otherwise." },
      { author: "Charlotte W.", rating: 5, text: "The perfect guide for international travelers. His cultural insights are invaluable." }
    ]
  }
];

// Global variable to store the selected guide
let selectedGuide = null;

// Function to get the selected guide
export const getSelectedGuide = () => selectedGuide;

// Function to set the selected guide
export const setSelectedGuide = (guide) => {
  selectedGuide = guide;
};

const Guide = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedGuideLocal, setSelectedGuideLocal] = useState(null);
  const navigate = useNavigate();

  const handleLearnMoreClick = (e, guide) => {
    e.preventDefault();
    setSelectedGuideLocal(guide);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedGuideLocal(null);
    document.body.style.overflow = "auto";
  };

  // const handleBookNowClick = () => {
  //   if (selectedGuideLocal) {
  //     setSelectedGuide(selectedGuideLocal); // Set the global selected guide
  //   }
  //   closeModal();
  //   navigate("/packages");
  // };

  const renderStars = (rating) => {
    return Array(rating)
      .fill()
      .map((_, i) => (
        <span key={i} className="star">
          ★
        </span>
      ));
  };

  return (
    <div className="guides-page">
      <div className="guides-hero">
        <div className="guides-hero-content">
          <h1>Meet Our Professional Tour Guides</h1>
          <p>Experienced, knowledgeable, and passionate about sharing our world with you</p>
        </div>
      </div>

      <div className="guides-container">
        <div className="guides-grid">
          {guides.map((guide) => (
            <div className="guide-card" key={guide.id}>
              <div className="guide-card-image">
                <img src={guide.image} alt={guide.name} />
                <div className="guide-lang-badges">
                  {guide.languages.slice(0, 3).map((lang, idx) => (
                    <span key={idx} className="lang-badge">
                      {lang}
                    </span>
                  ))}
                  {guide.languages.length > 3 && (
                    <span className="lang-badge lang-badge-more">+{guide.languages.length - 3}</span>
                  )}
                </div>
              </div>
              <div className="guide-card-content">
                <h3>{guide.name}</h3>
                <p className="guide-description">{guide.description}</p>
                <div className="guide-specialties">
                  {guide.specialties.slice(0, 2).map((specialty, idx) => (
                    <span key={idx} className="specialty-tag">
                      {specialty}
                    </span>
                  ))}
                </div>
                <div className="guide-card-footer">
                  <div className="guide-rating">
                    {renderStars(
                      Math.round(
                        guide.reviews.reduce((acc, review) => acc + review.rating, 0) /
                          guide.reviews.length
                      )
                    )}
                    <span className="review-count">({guide.reviews.length})</span>
                  </div>
                  <button
                    className="learn-more-btn"
                    onClick={(e) => handleLearnMoreClick(e, guide)}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedGuideLocal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="guide-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
              &times;
            </button>

            <div className="modal-scrollable">
              <div className="modal-header">
                <div className="modal-guide-image">
                  <img src={selectedGuideLocal.image} alt={selectedGuideLocal.name} />
                </div>
                <div className="modal-guide-info">
                  <h2>{selectedGuideLocal.name}</h2>
                  <p className="modal-guide-desc">{selectedGuideLocal.description}</p>
                  <div className="modal-guide-langs">
                    {selectedGuideLocal.languages.map((lang, idx) => (
                      <span key={idx} className="modal-lang-badge">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-body">
                <section className="modal-section">
                  <h3>About</h3>
                  <p>{selectedGuideLocal.bio}</p>
                </section>

                <section className="modal-section">
                  <h3>Specialties</h3>
                  <div className="modal-specialties">
                    {selectedGuideLocal.specialties.map((specialty, idx) => (
                      <span key={idx} className="modal-specialty">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </section>

                {/* <div className="modal-actions">
                  <button className="book-tour-btn" onClick={handleBookNowClick}>
                    Book Tour with {selectedGuideLocal.name.split(" ")[0]}
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guide;