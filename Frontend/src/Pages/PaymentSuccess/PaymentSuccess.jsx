import React from 'react';
import { CheckCircle } from 'lucide-react';
import './PaymentSuccess.css';

const PaymentSuccess = ({
  bookingId,
  amount,
  packageName,
  travelers,
  paymentMethod,
  onDownloadInvoice,
  onBackToHome
}) => {
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon">
          <CheckCircle size={64} color="var(--primary-green)" />
        </div>
        <h2>Payment Successful!</h2>
        <div className="booking-details">
          <div className="detail-row">
            <span>Booking ID:</span>
            <span>{bookingId}</span>
          </div>
          <div className="detail-row">
            <span>Package:</span>
            <span>{packageName}</span>
          </div>
          <div className="detail-row">
            <span>Travelers:</span>
            <span>{travelers}</span>
          </div>
          <div className="detail-row">
            <span>Total Amount:</span>
            <span>₹{amount.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span>Payment Method:</span>
            <span>{paymentMethod}</span>
          </div>
          <div className="detail-row">
            <span>Date of Booking:</span>
            <span>{formatDate(new Date())}</span>
          </div>
        </div>
        <div className="success-actions">
          {onDownloadInvoice && (
            <button 
              className="download-invoice" 
              onClick={onDownloadInvoice}
            >
              Download Invoice
            </button>
          )}
          {onBackToHome && (
            <button 
              className="back-to-home" 
              onClick={onBackToHome}
            >
              Back to Home
            </button>
          )}
        </div>
        <p className="confirmation-message">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;