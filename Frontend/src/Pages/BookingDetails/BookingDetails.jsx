import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/api';
import Swal from 'sweetalert2';
import './BookingDetails.css';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const fetchedBooking = await bookingService.getBooking(id);
        setBooking(fetchedBooking);
        setError(null);
      } catch (err) {
        setError('Failed to load booking details. Please try again later.');
        console.error('Error fetching booking:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    }
  }, [id]);

  const handleCancelBooking = async () => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to cancel this booking. This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, cancel it!',
        cancelButtonText: 'No, keep it'
      });

      if (result.isConfirmed) {
        await bookingService.cancelBooking(id);
        Swal.fire(
          'Cancelled!',
          'Your booking has been cancelled successfully.',
          'success'
        );
        navigate('/bookings');
      }
    } catch (err) {
      Swal.fire(
        'Error!',
        'Failed to cancel booking. Please try again later.',
        'error'
      );
      console.error('Error cancelling booking:', err);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading booking details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!booking) {
    return <div className="not-found">Booking not found</div>;
  }

  return (
    <div className="booking-details-container">
      <h2>Booking Details</h2>
      <div className="booking-card">
        <div className="booking-header">
          <h3>Booking #{booking.id}</h3>
          <span className={`status-badge status-${booking.status.toLowerCase()}`}>
            {booking.status}
          </span>
        </div>
        
        <div className="booking-info">
          <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {booking.time}</p>
          <p><strong>Service:</strong> {booking.service.name}</p>
          <p><strong>Price:</strong> ${booking.service.price.toFixed(2)}</p>
          <p><strong>Provider:</strong> {booking.provider.name}</p>
          <p><strong>Location:</strong> {booking.location}</p>
          {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
        </div>

        <div className="booking-actions">
          {booking.status === 'CONFIRMED' && (
            <button 
              className="cancel-button"
              onClick={handleCancelBooking}
            >
              Cancel Booking
            </button>
          )}
          <Link to={`/bookings/${id}/reschedule`} className="reschedule-link">
            Reschedule
          </Link>
          <Link to="/bookings" className="back-link">
            Back to Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;