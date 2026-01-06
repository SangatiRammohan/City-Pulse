import React from 'react';
import { Routes, Route, Navigate, useLocation,useEffect } from 'react-router-dom';
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
import Tour from './Pages/Tourfile/Tour';
import Guide from './Pages/Guide/Guide';
import Packages from './Components/Packages/Packages';
import TourDestination from './Pages/Tourfile/Tour';
import PaymentSuccess from './Pages/PaymentSuccess/PaymentSuccess';
import SignIn from './Pages/SignIn/SignIn';
import SignUp from './Pages/SignUp/SignUp';
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword';
import ResetPassword from './Pages/ResetPassword/ResetPassword';
import MyProfile from './Pages/MyProfile/MyProfile';
import VerifyOTP from './Pages/VerifyOTP/VerifyOTP';
import fixLeafletIcons from './utils/leafletIconFix';



// Layout wrapper component
const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

// Auth layout component (no header/footer)
const AuthLayout = ({ children }) => {
  return <>{children}</>;
};

function App() {
  const location = useLocation();
   useEffect(() => {
    fixLeafletIcons();
  }, []);
  
  // Check if current route is auth page
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  return (
    <>
      <Routes>
        {/* Auth routes - No Header/Footer */}
        <Route path="/signin" element={<AuthLayout><SignIn /></AuthLayout>} />
        <Route path="/signup" element={<AuthLayout><SignUp /></AuthLayout>} />
        <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
        <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
                <Route path="/verify-otp" element={<VerifyOTP />} />

        
        {/* All other routes - With Header/Footer */}
        <Route path="/" element={
          <MainLayout>
            <Hero />
            <About />
            <VideoHero />
            <City />
            <TripBookingProcess />
            <Testimonials />
            <SubscribeSection />
            <ContactSection />
          </MainLayout>
        } />
        
        {/* Profile page */}
        <Route path="/profile" element={
          <MainLayout>
            <MyProfile />
          </MainLayout>
        } />
        
        {/* About page */}
        <Route path="/about" element={
          <MainLayout>
            <About />
            <ContactSection />
          </MainLayout>
        } />
        
        {/* Guide page */}
        <Route path="/guide" element={
          <MainLayout>
            <Guide />
          </MainLayout>
        } />
        
        {/* Testimonials page */}
        <Route path="/testimonials" element={
          <MainLayout>
            <Testimonials />
          </MainLayout>
        } />
        
        {/* Contact page */}
        <Route path="/contact" element={
          <MainLayout>
            <ContactSection />
          </MainLayout>
        } />
        
        {/* Packages main page */}
        <Route path="/packages" element={
          <MainLayout>
            <Packages />
          </MainLayout>
        } />
        
        {/* Individual package routes */}
        <Route path="/packages/weekend_tours" element={
          <MainLayout>
            <Tour packageType="weekend_tours" />
          </MainLayout>
        } />
        <Route path="/packages/weekend-tours" element={<Navigate replace to="/packages/weekend_tours" />} />
        
        <Route path="/packages/summer_holiday_tour" element={
          <MainLayout>
            <Tour packageType="summer_holiday_tour" />
          </MainLayout>
        } />
        <Route path="/packages/summer-holiday-tour" element={<Navigate replace to="/packages/summer_holiday_tour" />} />
        
        <Route path="/packages/kerala_tour" element={
          <MainLayout>
            <Tour packageType="kerala_tour" />
          </MainLayout>
        } />
        <Route path="/packages/kerala-tour" element={<Navigate replace to="/packages/kerala_tour" />} />
        
        <Route path="/packages/hill_station_tour" element={
          <MainLayout>
            <Tour packageType="hill_station_tour" />
          </MainLayout>
        } />
        <Route path="/packages/hill-station-tour" element={<Navigate replace to="/packages/hill_station_tour" />} />
        
        <Route path="/packages/golden_triangle_tours" element={
          <MainLayout>
            <Tour packageType="golden_triangle_tours" />
          </MainLayout>
        } />
        <Route path="/packages/golden-triangle-tours" element={<Navigate replace to="/packages/golden_triangle_tours" />} />
        
        <Route path="/packages/goa_tour" element={
          <MainLayout>
            <Tour packageType="goa_tour" />
          </MainLayout>
        } />
        <Route path="/packages/goa-tour" element={<Navigate replace to="/packages/goa_tour" />} />
        
        <Route path="/packages/beach_tours_india" element={
          <MainLayout>
            <Tour packageType="beach_tours_india" />
          </MainLayout>
        } />
        <Route path="/packages/beach-tours-india" element={<Navigate replace to="/packages/beach_tours_india" />} />
        
        {/* Routes for individual destinations */}
        <Route path="/packages/:packageType/destination/:destinationIndex" element={
          <MainLayout>
            <TourDestination />
          </MainLayout>
        } />
        
        {/* Payment success page */}
        <Route path="/payment-success" element={
          <MainLayout>
            <PaymentSuccess />
          </MainLayout>
        } />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;