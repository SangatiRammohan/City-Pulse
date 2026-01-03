import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { authAPI } from '../../services/api';
import api from '../../services/api';
import './PaymentForm.css';

// Credit Card Form Component
const CreditCardForm = ({ onSubmit }) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Card',
        text: 'Please enter a valid 16-digit card number',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    if (!cardDetails.cardHolderName || cardDetails.cardHolderName.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please enter card holder name',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    if (!cardDetails.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'Please enter a valid expiry date (MM/YY)',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    if (!cardDetails.cvv || !/^\d{3}$/.test(cardDetails.cvv)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid CVV',
        text: 'Please enter a valid 3-digit CVV',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    onSubmit({ ...cardDetails, paymentType: 'Credit Card' });
  };

  return (
    <form id="creditForm" onSubmit={handleSubmit} className="payment-method-form">
      <div className="form-group">
        <label htmlFor="cardNumber">Card Number</label>
        <input 
          type="text" 
          id="cardNumber" 
          name="cardNumber" 
          placeholder="1234 5678 9012 3456"
          value={cardDetails.cardNumber}
          onChange={handleChange}
          maxLength="19"
        />
      </div>
      <div className="form-group">
        <label htmlFor="cardHolderName">Card Holder Name</label>
        <input 
          type="text" 
          id="cardHolderName" 
          name="cardHolderName" 
          placeholder="John Doe"
          value={cardDetails.cardHolderName}
          onChange={handleChange}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expiryDate">Expiry Date</label>
          <input 
            type="text" 
            id="expiryDate" 
            name="expiryDate" 
            placeholder="MM/YY"
            value={cardDetails.expiryDate}
            onChange={handleChange}
            maxLength="5"
          />
        </div>
        <div className="form-group">
          <label htmlFor="cvv">CVV</label>
          <input 
            type="text" 
            id="cvv" 
            name="cvv" 
            placeholder="123"
            value={cardDetails.cvv}
            onChange={handleChange}
            maxLength="3"
          />
        </div>
      </div>
    </form>
  );
};

// Debit Card Form Component
const DebitCardForm = ({ onSubmit }) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Card',
        text: 'Please enter a valid 16-digit card number',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    if (!cardDetails.cardHolderName || cardDetails.cardHolderName.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please enter card holder name',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    if (!cardDetails.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'Please enter a valid expiry date (MM/YY)',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    if (!cardDetails.cvv || !/^\d{3}$/.test(cardDetails.cvv)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid CVV',
        text: 'Please enter a valid 3-digit CVV',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    onSubmit({ ...cardDetails, paymentType: 'Debit Card' });
  };

  return (
    <form id="debitForm" onSubmit={handleSubmit} className="payment-method-form">
      <div className="form-group">
        <label htmlFor="cardNumber">Card Number</label>
        <input 
          type="text" 
          id="cardNumber" 
          name="cardNumber" 
          placeholder="1234 5678 9012 3456"
          value={cardDetails.cardNumber}
          onChange={handleChange}
          maxLength="19"
        />
      </div>
      <div className="form-group">
        <label htmlFor="cardHolderName">Card Holder Name</label>
        <input 
          type="text" 
          id="cardHolderName" 
          name="cardHolderName" 
          placeholder="John Doe"
          value={cardDetails.cardHolderName}
          onChange={handleChange}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expiryDate">Expiry Date</label>
          <input 
            type="text" 
            id="expiryDate" 
            name="expiryDate" 
            placeholder="MM/YY"
            value={cardDetails.expiryDate}
            onChange={handleChange}
            maxLength="5"
          />
        </div>
        <div className="form-group">
          <label htmlFor="cvv">CVV</label>
          <input 
            type="text" 
            id="cvv" 
            name="cvv" 
            placeholder="123"
            value={cardDetails.cvv}
            onChange={handleChange}
            maxLength="3"
          />
        </div>
      </div>
    </form>
  );
};

// UPI Form Component
const UPIForm = ({ onSubmit }) => {
  const [upiDetails, setUPIDetails] = useState({
    upiId: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUPIDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!upiDetails.upiId || !/^[a-zA-Z0-9.-]+@[a-zA-Z0-9]+$/.test(upiDetails.upiId)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid UPI ID',
        text: 'Please enter a valid UPI ID',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    onSubmit({ ...upiDetails, paymentType: 'UPI' });
  };

  return (
    <form id="upiForm" onSubmit={handleSubmit} className="payment-method-form">
      <div className="form-group">
        <label htmlFor="upiId">UPI ID</label>
        <input 
          type="text" 
          id="upiId" 
          name="upiId" 
          placeholder="youremail@upi"
          value={upiDetails.upiId}
          onChange={handleChange}
        />
      </div>
    </form>
  );
};

// Net Banking Form Component
const NetBankingForm = ({ onSubmit }) => {
  const [bankDetails, setBankDetails] = useState({
    bank: '',
    username: '',
    password: ''
  });

  const bankList = [
    'State Bank of India', 
    'HDFC Bank', 
    'ICICI Bank', 
    'Axis Bank', 
    'Punjab National Bank'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!bankDetails.bank) {
      Swal.fire({
        icon: 'error',
        title: 'Bank Not Selected',
        text: 'Please select a bank',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    if (!bankDetails.username || bankDetails.username.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Missing Username',
        text: 'Please enter your net banking username',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    if (!bankDetails.password || bankDetails.password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Please enter a valid password (minimum 6 characters)',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    onSubmit({ ...bankDetails, paymentType: 'Net Banking' });
  };

  return (
    <form id="netbankingForm" onSubmit={handleSubmit} className="payment-method-form">
      <div className="form-group">
        <label htmlFor="bank">Select Bank</label>
        <select 
          id="bank" 
          name="bank"
          value={bankDetails.bank}
          onChange={handleChange}
        >
          <option value="">Select Your Bank</option>
          {bankList.map((bank, index) => (
            <option key={index} value={bank}>{bank}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="username">Net Banking Username</label>
        <input 
          type="text" 
          id="username" 
          name="username" 
          placeholder="Net Banking Username"
          value={bankDetails.username}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          placeholder="Net Banking Password"
          value={bankDetails.password}
          onChange={handleChange}
        />
      </div>
    </form>
  );
};

// Payment Success Component
const PaymentSuccess = ({ 
  bookingId, 
  amount, 
  packageName, 
  travelers, 
  paymentMethod,
  onDownloadInvoice,
  onBackToHome,
}) => {
  return (
    <div className="payment-success">
      <h2>Payment Successful!</h2>
      <div className="success-details">
        <p><strong>Booking ID:</strong> {bookingId}</p>
        <p><strong>Package:</strong> {packageName}</p>
        <p><strong>Travelers:</strong> {travelers}</p>
        <p><strong>Amount Paid:</strong> ₹{amount ? amount.toLocaleString() : 'N/A'}</p>
        <p><strong>Payment Method:</strong> {paymentMethod}</p>
      </div>
      <div className="success-actions">
        <button onClick={onDownloadInvoice}>Download Invoice</button>
        <button onClick={onBackToHome}>Back to Home</button>
      </div>
    </div>
  );
};

// Main Payment Form Component
const PaymentForm = ({ selectedPackage, selectedGuide, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelers: 1,
    paymentMethod: ''
  });

  const [showPaymentMethodForm, setShowPaymentMethodForm] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // ✅ Check authentication on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      setCheckingAuth(true);
      
      const authenticated = authAPI.isAuthenticated();
      const storedUser = authAPI.getStoredUser();

      console.log('🔐 Authentication check:', { authenticated, user: storedUser });

      if (!authenticated || !storedUser) {
        // User not logged in - show login prompt
        const result = await Swal.fire({
          icon: 'info',
          title: 'Login Required',
          html: `
            <div style="text-align: center;">
              <p style="margin-bottom: 1rem; font-size: 1rem;">You need to sign in to continue with your booking.</p>
              <p style="color: #666; font-size: 0.9rem;">Create an account or sign in to manage your bookings easily.</p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonColor: '#54a15d',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Sign In Now',
          cancelButtonText: 'Cancel Booking',
          allowOutsideClick: false
        });

        if (result.isConfirmed) {
          // Save current booking data for after login
          sessionStorage.setItem('pendingBooking', JSON.stringify({
            selectedPackage,
            selectedGuide
          }));
          
          console.log('💾 Saved pending booking to sessionStorage');
          
          // Redirect to signin with return URL
          navigate('/signin', { 
            state: { 
              returnTo: window.location.pathname,
              message: 'Please sign in to continue your booking'
            },
            replace: true
          });
        } else {
          // User cancelled - close payment form
          onClose();
        }
        return;
      }

      // User is authenticated
      setIsAuthenticated(true);
      setUser(storedUser);
      
      console.log('✅ User authenticated:', storedUser.name);
      
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        name: storedUser.name || '',
        email: storedUser.email || '',
        phone: storedUser.phone || ''
      }));

    } catch (error) {
      console.error('❌ Authentication check error:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'Unable to verify your login status. Please try again.',
        confirmButtonColor: '#54a15d'
      });
      
      onClose();
    } finally {
      setCheckingAuth(false);
    }
  };

  // ✅ FIXED: Download Invoice Function - Downloads PDF AND Sends Email
  const handleDownloadInvoice = async () => {
    try {
      console.log('📥 Downloading invoice for:', bookingDetails);
      
      if (!bookingDetails || !bookingDetails.bookingId) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Booking ID not found',
          confirmButtonColor: '#54a15d'
        });
        return;
      }

      // Show loading
      Swal.fire({
        title: 'Downloading Invoice...',
        text: 'Please wait while we prepare your invoice',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // ✅ Download PDF using blob response type
      const response = await api.get(`/bookings/invoice/${bookingDetails.bookingId}`, {
        responseType: 'blob' // Important: Receive as blob for PDF
      });

      console.log('📄 Invoice PDF received');

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${bookingDetails.bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('✅ Invoice downloaded successfully');

      // Close loading and show success
      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: 'Invoice Downloaded!',
        html: `
          <p>Your invoice has been downloaded successfully.</p>
          <p>A copy has also been sent to <strong>${bookingDetails.userDetails?.email || formData.email}</strong></p>
        `,
        confirmButtonColor: '#54a15d',
        timer: 3000
      });

    } catch (error) {
      console.error('Invoice download error:', error);

      Swal.close();

      await Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: error.message || 'Could not download invoice. Please try again.',
        confirmButtonColor: '#54a15d',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleMainFormSubmit = (e) => {
    e.preventDefault();
    if (validateMainForm()) {
      setShowPaymentMethodForm(true);
    }
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
      confirmButtonColor: '#54a15d',
    });
  };

  const validateMainForm = () => {
    const { name, email, phone, travelers, paymentMethod } = formData;
    
    if (!name || name.trim() === '') {
      showErrorAlert('Please enter your full name');
      return false;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showErrorAlert('Please enter a valid email address');
      return false;
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      showErrorAlert('Please enter a valid 10-digit phone number');
      return false;
    }

    if (travelers < 1) {
      showErrorAlert('Number of travelers must be at least 1');
      return false;
    }

    if (!paymentMethod) {
      showErrorAlert('Please select a payment method');
      return false;
    }

    return true;
  };

  // ✅ FIXED: Payment Method Submit Function
  const handlePaymentMethodSubmit = async (paymentDetails) => {
    try {
      // Generate booking ID
      const bookingId = `TRP${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // Prepare travelers array
      const travelersArr = Array.from({ length: Number(formData.travelers) }, (_, i) => ({
        name: formData.name,
      }));

      // Prepare booking details
      const finalBookingDetails = {
        bookingId,
        packageName: selectedPackage?.name || 'Selected Package',
        amount: selectedPackage ? selectedPackage.charge * Number(formData.travelers) : 0,
        travelers: travelersArr,
        selectedPackage: selectedPackage,
        totalAmount: selectedPackage ? selectedPackage.charge * Number(formData.travelers) : 0,
        packageInfo: {
          name: selectedPackage?.name || 'Selected Package',
          charge: selectedPackage?.charge,
          duration: selectedPackage?.duration,
        },
        userDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          persons: Number(formData.travelers),
          date: new Date().toISOString(),
        },
        paymentMethod: paymentDetails.paymentType || paymentDetails.method || formData.paymentMethod,
        paymentDetails: {
          ...paymentDetails,
          method: paymentDetails.paymentType || paymentDetails.method || formData.paymentMethod
        },
        selectedGuide,
        bookingTimestamp: new Date().toISOString()
      };

      console.log('📤 Sending booking data:', finalBookingDetails);

      // ✅ Send booking data using configured api instance
      const response = await api.post('/bookings/create', finalBookingDetails);

      console.log('✅ Booking response:', response.data);

      // Show success alert
      await Swal.fire({
        icon: 'success',
        title: 'Payment Successful!',
        text: `Your booking is confirmed. Booking ID: ${bookingId}`,
        confirmButtonColor: '#54a15d',
      });

      // ✅ FIXED: Set booking details with correct structure
      setBookingDetails({
        bookingId: response.data.bookingId || bookingId,
        packageName: response.data.packageName || finalBookingDetails.packageName,
        amount: response.data.amount || finalBookingDetails.amount,
        paymentMethod: response.data.paymentMethod || finalBookingDetails.paymentMethod,
        userDetails: finalBookingDetails.userDetails,
        ...response.data.data // Include all other booking data
      });
      
      setPaymentCompleted(true);

    } catch (error) {
      console.error('Payment processing error:', error);

      const errorMessage = error.response?.data?.message || error.message || 'Payment failed. Please try again.';

      await Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: errorMessage,
        confirmButtonColor: '#54a15d',
      });
    }
  };

  const renderPaymentMethodForm = () => {
    const paymentForms = {
      'credit': CreditCardForm,
      'debit': DebitCardForm,
      'upi': UPIForm,
      'netbanking': NetBankingForm
    };

    const PaymentFormComponent = paymentForms[formData.paymentMethod];
    
    return PaymentFormComponent ? (
      <PaymentFormComponent onSubmit={handlePaymentMethodSubmit} />
    ) : null;
  };

  const handleBackToHome = () => {
    // Clear any pending booking data
    sessionStorage.removeItem('pendingBooking');
    onClose();
    navigate('/');
  };

  const totalCost = selectedPackage ? selectedPackage.charge * formData.travelers : 0;

  // ✅ Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="payment-container">
        <div className="auth-checking">
          <div className="spinner"></div>
          <p>Verifying your session...</p>
        </div>
      </div>
    );
  }

  // ✅ Don't render form if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Payment Success Screen
  if (paymentCompleted && bookingDetails) {
    return (
      <PaymentSuccess 
        bookingId={bookingDetails.bookingId}
        amount={bookingDetails.amount}
        packageName={bookingDetails.packageName}
        travelers={formData.travelers}
        paymentMethod={bookingDetails.paymentMethod}
        onDownloadInvoice={handleDownloadInvoice}
        onBackToHome={handleBackToHome}
      />
    );
  }

  // Main Payment Form
  return (
    <div className="payment-container">
      {/* ✅ Show user info banner */}
      <div className="user-info-banner">
        <p>📝 Booking as: <strong>{user?.name}</strong> ({user?.email})</p>
      </div>

      <h2>Payment Details</h2>

      <div className="payment-summary">
        <h3>Trip Summary</h3>
        <div className="summary-details">
          <div className="summary-row">
            <span>Package:</span>
            <span>{selectedPackage?.name || 'Selected package'}</span>
          </div>
          <div className="summary-row">
            <span>Duration:</span>
            <span>{selectedPackage?.duration || 0} days</span>
          </div>
          <div className="summary-row">
            <span>Price per person:</span>
            <span>₹{selectedPackage?.charge?.toLocaleString() || 0}</span>
          </div>
          {selectedGuide && (
            <div className="summary-row">
              <span>Guide:</span>
              <span>{selectedGuide.name}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total (for {formData.travelers} traveler{formData.travelers > 1 ? 's' : ''}):</span>
            <span>₹{totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {!showPaymentMethodForm ? (
        <form className="payment-form" onSubmit={handleMainFormSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name"
              name="name"
              placeholder="Full Name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input 
              type="tel" 
              id="phone"
              name="phone"
              placeholder="Phone Number" 
              value={formData.phone}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="travelers">Number of Travelers</label>
            <input 
              type="number" 
              id="travelers"
              name="travelers"
              min="1" 
              value={formData.travelers}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select 
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="">Select Payment Method</option>
              <option value="credit">Credit Card</option>
              <option value="debit">Debit Card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>
          
          <div className="form-buttons">
            <button type="submit" className="submit-button">Proceed to Payment</button>
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
          </div>
        </form>
      ) : (
        <div>
          <h3>Complete Your Payment</h3>
          {renderPaymentMethodForm()}
          <div className="form-buttons">
            <button 
              type="submit" 
              className="submit-button" 
              form={`${formData.paymentMethod}Form`}
            >
              Complete Payment
            </button>
            <button 
              type="button" 
              onClick={() => setShowPaymentMethodForm(false)} 
              className="cancel-button"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;