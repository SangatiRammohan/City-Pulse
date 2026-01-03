import React, { useState } from 'react';
import { newsletterAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { Mail, Send, CheckCircle } from 'lucide-react';
import './SubscribeSection.css';

const SubscribeSection = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        confirmButtonColor: '#54a15d'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await newsletterAPI.subscribe(email);

      if (response.status === 'success') {
        setIsSubscribed(true);
        
        await Swal.fire({
          icon: 'success',
          title: 'Successfully Subscribed! 🎉',
          html: `
            <p>Thank you for subscribing to our newsletter!</p>
            <p>Check your email <strong>${email}</strong> for a welcome message.</p>
          `,
          confirmButtonColor: '#54a15d',
          timer: 3000
        });

        // Clear email field
        setEmail('');
        
        // Reset subscribed state after 3 seconds
        setTimeout(() => {
          setIsSubscribed(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Subscription Failed',
        text: error.message || 'Unable to subscribe. Please try again.',
        confirmButtonColor: '#54a15d'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="subscribe-container">
      <div className="subscribe-content">
        <div className="subscribe-icon">
          <Mail size={48} />
        </div>
        
        <h2>Stay Updated with Our Latest Travel Deals</h2>
        <p>Subscribe to our newsletter and never miss out on amazing travel offers and destinations.</p>

        <form className="subscribe-form" onSubmit={handleSubscribe}>
          <div className="input-wrapper">
            <Mail className="input-icon" size={20} />
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="subscribe-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isSubscribed}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={`subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
            disabled={isLoading || isSubscribed}
          >
            {isLoading ? (
              <>
                <span className="spinner-small"></span>
                Subscribing...
              </>
            ) : isSubscribed ? (
              <>
                <CheckCircle size={20} />
                Subscribed!
              </>
            ) : (
              <>
                <Send size={20} />
                Subscribe
              </>
            )}
          </button>
        </form>

        <p className="subscribe-note">
          ✓ Get exclusive discounts &nbsp;&nbsp; ✓ New destinations first &nbsp;&nbsp; ✓ Unsubscribe anytime
        </p>
      </div>
    </div>
  );
};

export default SubscribeSection;