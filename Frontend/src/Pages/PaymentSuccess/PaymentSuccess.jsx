import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Home, Mail, Send } from 'lucide-react';
import { bookingAPI } from '../../services/api';
import Swal from 'sweetalert2';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Get booking details from navigation state
    if (location.state?.bookingDetails) {
      setBookingDetails(location.state.bookingDetails);
    } else {
      // If no booking details, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

const handleDownloadInvoice = async (bookingData) => {
  console.log('📥 Downloading invoice for:', bookingData);
  
  if (!bookingData?.bookingId) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Booking ID not found',
      confirmButtonColor: '#54a15d'
    });
    return;
  }

  try {
    // Use the new downloadInvoice method from bookingAPI
    await bookingAPI.downloadInvoice(bookingData.bookingId);
    
    console.log('✅ Invoice downloaded successfully');
    
    await Swal.fire({
      icon: 'success',
      title: 'Invoice Downloaded!',
      text: 'Your invoice has been downloaded successfully.',
      confirmButtonColor: '#54a15d',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Invoice download error:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Download Failed',
      text: 'Unable to download invoice. Please try again.',
      confirmButtonColor: '#54a15d'
    });
  }
};

  const handleResendEmail = async () => {
    if (!bookingDetails?.bookingId) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Booking ID not found',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    setIsResending(true);
    try {
      await bookingAPI.resendInvoiceEmail(bookingDetails.bookingId);
      
      await Swal.fire({
        icon: 'success',
        title: 'Email Sent!',
        html: `Invoice has been sent to <strong>${bookingDetails.userDetails?.email}</strong>`,
        confirmButtonColor: '#54a15d'
      });
    } catch (error) {
      console.error('Resend email error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Send Email',
        text: 'Unable to send invoice email. Please try again.',
        confirmButtonColor: '#54a15d'
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!bookingDetails) {
    return (
      <div className="payment-success-container">
        <div className="success-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon-wrapper">
          <div className="success-icon">
            <CheckCircle size={80} />
          </div>
        </div>

        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-subtitle">Your booking has been confirmed</p>

        <div className="booking-summary">
          <div className="summary-header">
            <h2>Booking Summary</h2>
            <span className="booking-id-badge">{bookingDetails.bookingId}</span>
          </div>

          <div className="booking-details">
            <div className="detail-row">
              <span className="detail-label">Package:</span>
              <span className="detail-value">{bookingDetails.packageName}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">{bookingDetails.packageInfo?.duration || 'N/A'}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Travelers:</span>
              <span className="detail-value">
                {bookingDetails.travelers?.length || 0} Person(s)
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Customer Name:</span>
              <span className="detail-value">{bookingDetails.userDetails?.name}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{bookingDetails.userDetails?.email}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{bookingDetails.userDetails?.phone}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">{bookingDetails.paymentMethod}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Booking Date:</span>
              <span className="detail-value">
                {formatDate(bookingDetails.bookingTimestamp || new Date())}
              </span>
            </div>

            <div className="detail-row total-row">
              <span className="detail-label">Total Amount:</span>
              <span className="detail-value total-amount">
                ₹{bookingDetails.totalAmount?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {bookingDetails.selectedGuide && (
          <div className="guide-info">
            <h3>Your Guide</h3>
            <div className="guide-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{bookingDetails.selectedGuide.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{bookingDetails.selectedGuide.email}</span>
              </div>
            </div>
          </div>
        )}

        <div className="confirmation-message">
          <Mail size={20} />
          <p>
            A confirmation email with your invoice has been sent to{' '}
            <strong>{bookingDetails.userDetails?.email}</strong>
          </p>
        </div>

        <div className="success-actions">
          <button 
            className="download-invoice-btn" 
            onClick={handleDownloadInvoice}
            disabled={isDownloading}
          >
            <Download size={20} />
            {isDownloading ? 'Downloading...' : 'Download Invoice'}
          </button>

          <button 
            className="resend-email-btn" 
            onClick={handleResendEmail}
            disabled={isResending}
          >
            <Send size={20} />
            {isResending ? 'Sending...' : 'Resend Email'}
          </button>

          <button 
            className="back-to-home-btn" 
            onClick={handleBackToHome}
          >
            <Home size={20} />
            Back to Home
          </button>
        </div>

        <div className="thank-you-message">
          <p>Thank you for choosing City Pulse Tours!</p>
          <p className="small-text">We look forward to making your trip memorable.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;