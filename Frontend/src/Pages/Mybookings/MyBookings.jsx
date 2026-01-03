import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../Backend/services/api';
import Swal from 'sweetalert2';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // In a real app, you would get this from authentication/context
  // For demo purposes, we'll use a simple state value or localStorage
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  
  useEffect(() => {
    // If no user email is set, prompt for it
    if (!userEmail) {
      Swal.fire({
        title: 'Enter Your Email',
        input: 'email',
        inputLabel: 'Please enter your email to view your bookings',
        inputPlaceholder: 'Enter your email address',
        showCancelButton: true,
        confirmButtonText: 'View Bookings',
        allowOutsideClick: false,
        validationMessage: 'Please enter a valid email',
        preConfirm: (email) => {
          if (!email) {
            Swal.showValidationMessage('Email is required');
            return false;
          }
          return email;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          setUserEmail(result.value);
          localStorage.setItem('userEmail', result.value);
        }
      });
    } else {
      // Fetch bookings for the user
      fetchUserBookings();
    }
  }, [userEmail]);

  // Fetch user bookings from MongoDB
  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const fetchedBookings = await bookingService.getUserBookings(userEmail);
      setBookings(fetchedBookings);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your bookings. Please try again later.');
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    Swal.fire({
      title: 'Cancel Booking',
      text: 'Are you sure you want to cancel this booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it',
      cancelButtonText: 'No, keep it',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await bookingService.cancelBooking(bookingId);
          
          // Refresh the bookings list
          fetchUserBookings();
          
          Swal.fire(
            'Cancelled!',
            'Your booking has been cancelled.',
            'success'
          );
        } catch (error) {
          console.error('Error cancelling booking:', error);
          Swal.fire(
            'Error',
            'There was a problem cancelling your booking. Please try again.',
            'error'
          );
        }
      }
    });
  };

  // Function to change user email
  const changeUserEmail = () => {
    Swal.fire({
      title: 'Change Email',
      input: 'email',
      inputLabel: 'Enter your email address',
      inputValue: userEmail,
      showCancelButton: true,
      confirmButtonText: 'Change',
      inputPlaceholder: 'Enter your email',
      validationMessage: 'Please enter a valid email'
    }).then((result) => {
      if (result.isConfirmed) {
        setUserEmail(result.value);
        localStorage.setItem('userEmail', result.value);
      }
    });
  };

  if (loading) {
    return (
      <div className="my-bookings loading">
        <div className="loading-spinner">Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div className="my-bookings">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <div className="user-email">
          <p>Showing bookings for: <strong>{userEmail}</strong></p>
          <button className="change-email-btn" onClick={changeUserEmail}>Change Email</button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchUserBookings} className="retry-button">Try Again</button>
        </div>
      )}

      {!error && bookings.length > 0 ? (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className={`booking-card ${booking.bookingStatus.toLowerCase()}`}>
              <div className="booking-status">
                <span className={`status-badge ${booking.bookingStatus.toLowerCase()}`}>
                  {booking.bookingStatus}
                </span>
              </div>
              
              <div className="booking-header">
                <h2>{booking.packageInfo.name}</h2>
                <p className="booking-id"><small>ID: {booking._id}</small></p>
              </div>
              
              <div className="booking-details">
                <div className="booking-info">
                  <p><strong>Duration:</strong> {booking.packageInfo.duration} days</p>
                  <p><strong>Travel Date:</strong> {new Date(booking.userDetails.date).toLocaleDateString()}</p>
                  <p><strong>Number of Travelers:</strong> {booking.userDetails.persons}</p>
                  <p><strong>Total Amount:</strong> ₹{booking.totalAmount.toLocaleString()}</p>
                  <p><strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                </div>
                
                {booking.packageInfo.image && (
                  <div className="booking-image">
                    <img src={booking.packageInfo.image} alt={booking.packageInfo.name} />
                  </div>
                )}
              </div>
              
              {booking.guideInfo && (
                <div className="guide-info">
                  <h3>Your Guide</h3>
                  <p><strong>Name:</strong> {booking.guideInfo.name}</p>
                  <p><strong>Specialization:</strong> {booking.guideInfo.specialization}</p>
                </div>
              )}
              
              <div className="booking-actions">
                <Link to={`/bookings/${booking._id}`} className="view-details-btn">
                  View Details
                </Link>
                
                {booking.bookingStatus === 'confirmed' && (
                  <button 
                    className="cancel-booking-btn"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-bookings">
          <h2>No Bookings Found</h2>
          <p>You don't have any bookings yet. Start planning your next adventure!</p>
          <Link to="/" className="browse-packages-btn">Browse Packages</Link>
        </div>
      )}
    </div>
  );
};

export default MyBookings;