import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Components/Header/Header';
import Hero from './Components/Herosection/Hero';
import City from './Components/Popular/City';
import About from './Components/Aboutus/About';
import TripBookingProcess from './Components/Process/TripBookingProcess';
import VideoHero from './Components/Bgvideo/VideoHero';
import Testimonials from './Components/Testimonials/Testimonials';
import SubscribeSection from './Components/Subscribe/SubscribeSection';
import ContactSection from './Components/Contact/ContactSection';
import Footer from './Components/Footer/Footer';
// import './App.css'
// Import your page components
import Tour from './Pages/Tourfile/Tour';
import Guide from './Pages/Guide/Guide';
import Packages from './Components/Packages/Packages';
import TourDestination from './Pages/Tourfile/Tour';
import PaymentSuccess from './Pages/PaymentSuccess/PaymentSuccess';

function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* Home route - shows all main components */}
        <Route path="/" element={
          <>
            <Hero />
            <About />
            <VideoHero />
            <City />
            <TripBookingProcess />
            <Testimonials />
            <SubscribeSection />
            <ContactSection />
          </>
        } />
        
        {/* About page - shows only About and Contact components */}
        <Route path="/about" element={
          <>
            <About />
            <ContactSection />
          </>
        } />
        
        {/* Guide page */}
        <Route path="/guide" element={<Guide />} />
        
        {/* Testimonials page */}
        <Route path="/testimonials" element={<Testimonials />} />
        
        {/* Contact page */}
        <Route path="/contact" element={<ContactSection />} />
        
        {/* Packages main page */}
        <Route path="/packages" element={<Packages />} />
        
        {/* Individual package routes */}
        <Route path="/packages/weekend_tours" element={<Tour packageType="weekend_tours" />} />
        <Route path="/packages/weekend-tours" element={<Navigate replace to="/packages/weekend_tours" />} />
        
        <Route path="/packages/summer_holiday_tour" element={<Tour packageType="summer_holiday_tour" />} />
        <Route path="/packages/summer-holiday-tour" element={<Navigate replace to="/packages/summer_holiday_tour" />} />
        
        <Route path="/packages/kerala_tour" element={<Tour packageType="kerala_tour" />} />
        <Route path="/packages/kerala-tour" element={<Navigate replace to="/packages/kerala_tour" />} />
        
        <Route path="/packages/hill_station_tour" element={<Tour packageType="hill_station_tour" />} />
        <Route path="/packages/hill-station-tour" element={<Navigate replace to="/packages/hill_station_tour" />} />
        
        <Route path="/packages/golden_triangle_tours" element={<Tour packageType="golden_triangle_tours" />} />
        <Route path="/packages/golden-triangle-tours" element={<Navigate replace to="/packages/golden_triangle_tours" />} />
        
        <Route path="/packages/goa_tour" element={<Tour packageType="goa_tour" />} />
        <Route path="/packages/goa-tour" element={<Navigate replace to="/packages/goa_tour" />} />
        
        <Route path="/packages/beach_tours_india" element={<Tour packageType="beach_tours_india" />} />
        <Route path="/packages/beach-tours-india" element={<Navigate replace to="/packages/beach_tours_india" />} />
        
        {/* Routes for individual destinations */}
        <Route path="/packages/:packageType/destination/:destinationIndex" element={<TourDestination />} />
        
        {/* Payment success page */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
