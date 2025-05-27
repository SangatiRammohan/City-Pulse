import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import api from '../../services/api'
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
    
    // Basic validation
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return;
    }

    if (!cardDetails.cardHolderName || cardDetails.cardHolderName.trim() === '') {
      alert('Please enter card holder name');
      return;
    }

    if (!cardDetails.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
      alert('Please enter a valid expiry date (MM/YY)');
      return;
    }

    if (!cardDetails.cvv || !/^\d{3}$/.test(cardDetails.cvv)) {
      alert('Please enter a valid 3-digit CVV');
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
    
    // Basic validation
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return;
    }

    if (!cardDetails.cardHolderName || cardDetails.cardHolderName.trim() === '') {
      alert('Please enter card holder name');
      return;
    }

    if (!cardDetails.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
      alert('Please enter a valid expiry date (MM/YY)');
      return;
    }

    if (!cardDetails.cvv || !/^\d{3}$/.test(cardDetails.cvv)) {
      alert('Please enter a valid 3-digit CVV');
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
    
    // Basic UPI ID validation
    if (!upiDetails.upiId || !/^[a-zA-Z0-9.-]+@[a-zA-Z0-9]+$/.test(upiDetails.upiId)) {
      alert('Please enter a valid UPI ID');
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
    
    // Basic validation
    if (!bankDetails.bank) {
      alert('Please select a bank');
      return;
    }

    if (!bankDetails.username || bankDetails.username.trim() === '') {
      alert('Please enter your net banking username');
      return;
    }

    if (!bankDetails.password || bankDetails.password.length < 6) {
      alert('Please enter a valid password');
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

// PaymentSuccess Placeholder Component (for reference)
const PaymentSuccess = ({ 
  bookingId, 
  amount, 
  packageName, 
  travelers, 
  paymentMethod,
  onDownloadInvoice, // Pass the function as a prop
  onBackToHome, // Pass the back-to-home function as a prop
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


const PaymentForm = ({ selectedPackage, selectedGuide, onClose, invoiceDownloadEndpoint }) => {
  
  
  const handleDownloadInvoice = async () => {
    try {
      // Request invoice download from backend
      const response = await axios.get(`/api/bookings/invoice/${bookingDetails.bookingId}`, {


        responseType: 'blob'
      });
  
      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${bookingDetails.bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      // Show success toast
      Swal.fire({
        icon: 'success',
        title: 'Invoice Downloaded',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      console.error('Invoice download error:', error);
  
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Could not download invoice. Please try again.',
        confirmButtonColor: '#3085d6',
      });
    }
  };

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
      confirmButtonColor: '#3085d6',
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


 const handlePaymentMethodSubmit = async (paymentDetails) => {
  try {
    // Generate booking ID
    const bookingId = `TRP${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Prepare travelers array (expand as needed)
    const travelersArr = Array.from({ length: Number(formData.travelers) }, (_, i) => ({
      name: formData.name,
      // Add more traveler fields if needed (age, gender, etc.)
    }));

    // Prepare booking details to match backend expectations
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
        date: formData.date || new Date().toISOString(),
      },
      paymentMethod: paymentDetails.paymentType || paymentDetails.method || formData.paymentMethod,
      paymentDetails: {
        ...paymentDetails,
        method: paymentDetails.paymentType || paymentDetails.method || formData.paymentMethod
      },
      selectedGuide,
      bookingTimestamp: new Date().toISOString()
    };

    // Send booking data using configured axios instance
    const response = await api.post('/bookings/create', finalBookingDetails);

    // Show success alert
    await Swal.fire({
      icon: 'success',
      title: 'Payment Successful!',
      text: `Your booking is confirmed. Booking ID: ${bookingId}`,
      confirmButtonColor: '#3085d6',
    });

    // Update state
    setBookingDetails(response);
    setPaymentCompleted(true);

  } catch (error) {
    console.error('Payment processing error:', error);

    // More detailed error handling
    const errorMessage = error.response
      ? error.response.data.message
      : 'Network error. Please check your connection.';

    // Show error alert
    await Swal.fire({
      icon: 'error',
      title: 'Payment Failed',
      text: errorMessage,
      confirmButtonColor: '#3085d6',
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

    const PaymentForm = paymentForms[formData.paymentMethod];
    
    return PaymentForm ? (
      <PaymentForm onSubmit={handlePaymentMethodSubmit} />
    ) : null;
  };



  const handleBackToHome = () => {
    onClose();
  };

  const totalCost = selectedPackage ? selectedPackage.charge * formData.travelers : 0;

  if (paymentCompleted && bookingDetails) {
    return (
      <PaymentSuccess 
        bookingId={bookingDetails.bookingId}
        amount={bookingDetails.amount}
        packageName={bookingDetails.packageName}
        travelers={formData.travelers}
        paymentMethod={bookingDetails.paymentMethod}
        onDownloadInvoice={handleDownloadInvoice} // Pass the function here
        onBackToHome={handleBackToHome} // Pass the back-to-home function
      />
    );
  }

  return (
    <div className="payment-container">
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
