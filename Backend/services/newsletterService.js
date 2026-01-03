const Newsletter = require('../models/Newsletter');
const { sendEmail } = require('./emailService');

// Subscribe to newsletter
const subscribeToNewsletter = async (email, source = 'website', userId = null) => {
  try {
    // Check if already subscribed
    let subscriber = await Newsletter.findOne({ email });
    
    if (subscriber) {
      if (subscriber.isActive) {
        return {
          success: false,
          message: 'This email is already subscribed to our newsletter'
        };
      } else {
        // Reactivate subscription
        await subscriber.resubscribe();
        return {
          success: true,
          message: 'Welcome back! Your subscription has been reactivated',
          subscriber
        };
      }
    }
    
    // Create new subscriber
    subscriber = new Newsletter({
      email,
      source,
      user: userId,
      subscribedAt: new Date()
    });
    
    await subscriber.save();
    
    // Send welcome email
    await sendWelcomeEmail(email);
    
    return {
      success: true,
      message: 'Successfully subscribed to newsletter!',
      subscriber
    };
    
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
};

// Unsubscribe from newsletter
const unsubscribeFromNewsletter = async (email) => {
  try {
    const subscriber = await Newsletter.findOne({ email });
    
    if (!subscriber) {
      return {
        success: false,
        message: 'Email not found in our subscriber list'
      };
    }
    
    if (!subscriber.isActive) {
      return {
        success: false,
        message: 'This email is already unsubscribed'
      };
    }
    
    await subscriber.unsubscribe();
    
    return {
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    };
    
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email) => {
  try {
    await sendEmail({
      to: email,
      subject: 'Welcome to City Pulse Tours Newsletter! 🌍',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #54a15d, #6fbf73); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; background: #54a15d; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to City Pulse Tours!</h1>
            </div>
            <div class="content">
              <h2>Thank you for subscribing! 🌟</h2>
              <p>You're now part of our travel community and will be the first to know about:</p>
              <ul>
                <li>✈️ Exciting new travel destinations</li>
                <li>💰 Exclusive discounts and special offers</li>
                <li>🏖️ Limited-time travel packages</li>
                <li>📰 Travel tips and destination guides</li>
              </ul>
              <p>Get ready for amazing adventures!</p>
              <a href="http://localhost:5173/packages" class="button">Explore Our Packages</a>
            </div>
            <div class="footer">
              <p>City Pulse Tours | Your Journey, Our Passion</p>
              <p>
                <a href="http://localhost:5173/unsubscribe?email=${email}" style="color: #aaa; text-decoration: none;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    // Don't throw error - subscription should succeed even if email fails
  }
};

// Send new trip notification to all subscribers
const sendNewTripNotification = async (tripDetails) => {
  try {
    const subscribers = await Newsletter.getActiveSubscribers();
    
    if (subscribers.length === 0) {
      console.log('No active subscribers to notify');
      return;
    }
    
    console.log(`📧 Sending new trip notification to ${subscribers.length} subscribers`);
    
    const emailPromises = subscribers
      .filter(sub => sub.preferences.newTrips)
      .map(subscriber => {
        return sendEmail({
          to: subscriber.email,
          subject: `🆕 New Destination Alert: ${tripDetails.name}!`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #54a15d, #6fbf73); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; }
                .trip-image { width: 100%; max-width: 500px; border-radius: 10px; margin: 20px 0; }
                .price { font-size: 32px; color: #54a15d; font-weight: bold; margin: 20px 0; }
                .button { display: inline-block; padding: 15px 40px; background: #54a15d; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                .features { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
                .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🌍 New Destination Just Added!</h1>
                </div>
                <div class="content">
                  <h2>${tripDetails.name}</h2>
                  ${tripDetails.image ? `<img src="${tripDetails.image}" alt="${tripDetails.name}" class="trip-image" />` : ''}
                  <p>${tripDetails.description}</p>
                  
                  <div class="price">
                    ₹${tripDetails.charge?.toLocaleString()} per person
                  </div>
                  
                  <div class="features">
                    <h3>Trip Highlights:</h3>
                    <p><strong>📅 Duration:</strong> ${tripDetails.duration}</p>
                    ${tripDetails.highlights ? `
                      <ul>
                        ${tripDetails.highlights.map(h => `<li>${h}</li>`).join('')}
                      </ul>
                    ` : ''}
                  </div>
                  
                  <p style="text-align: center;">
                    <a href="http://localhost:5173/packages/${tripDetails.packageType}/destination/${tripDetails.index}" class="button">
                      Book Now →
                    </a>
                  </p>
                  
                  <p style="color: #666; font-size: 14px; text-align: center;">
                    ⚡ Limited slots available! Book early to secure your spot.
                  </p>
                </div>
                <div class="footer">
                  <p>City Pulse Tours | Your Journey, Our Passion</p>
                  <p>
                    <a href="http://localhost:5173/unsubscribe?email=${subscriber.email}" style="color: #aaa; text-decoration: none;">Unsubscribe</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `
        }).catch(err => {
          console.error(`Failed to send to ${subscriber.email}:`, err.message);
        });
      });
    
    await Promise.allSettled(emailPromises);
    
    console.log('✅ New trip notifications sent');
    
  } catch (error) {
    console.error('❌ Error sending new trip notifications:', error);
    throw error;
  }
};

// Send discount notification to all subscribers
const sendDiscountNotification = async (discountDetails) => {
  try {
    const subscribers = await Newsletter.getActiveSubscribers();
    
    if (subscribers.length === 0) {
      console.log('No active subscribers to notify');
      return;
    }
    
    console.log(`📧 Sending discount notification to ${subscribers.length} subscribers`);
    
    const emailPromises = subscribers
      .filter(sub => sub.preferences.discounts)
      .map(subscriber => {
        return sendEmail({
          to: subscriber.email,
          subject: `💰 Special Discount: ${discountDetails.percentage}% OFF ${discountDetails.packageName}!`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff6b6b, #feca57); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; }
                .discount-badge { background: #ff6b6b; color: white; font-size: 48px; font-weight: bold; padding: 20px; border-radius: 50%; width: 150px; height: 150px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3); }
                .button { display: inline-block; padding: 15px 40px; background: #54a15d; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                .timer { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #ff6b6b; }
                .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 EXCLUSIVE DISCOUNT!</h1>
                  <p style="font-size: 24px; margin: 0;">Limited Time Offer</p>
                </div>
                <div class="content">
                  <div class="discount-badge">
                    ${discountDetails.percentage}%<br/>OFF
                  </div>
                  
                  <h2 style="text-align: center; margin-top: 30px;">${discountDetails.packageName}</h2>
                  
                  ${discountDetails.validUntil ? `
                    <div class="timer">
                      <h3>⏰ Offer Valid Until:</h3>
                      <p style="font-size: 20px; color: #ff6b6b; margin: 0;">
                        ${new Date(discountDetails.validUntil).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  ` : ''}
                  
                  <p style="font-size: 18px; text-align: center;">
                    ${discountDetails.description || 'Book now and save big on your next adventure!'}
                  </p>
                  
                  ${discountDetails.code ? `
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; border: 2px dashed #54a15d;">
                      <p style="margin: 0; font-size: 14px; color: #666;">Use Promo Code:</p>
                      <p style="font-size: 28px; font-weight: bold; color: #54a15d; margin: 10px 0; letter-spacing: 2px;">
                        ${discountDetails.code}
                      </p>
                    </div>
                  ` : ''}
                  
                  <p style="text-align: center;">
                    <a href="http://localhost:5173/packages" class="button">
                      Explore Packages →
                    </a>
                  </p>
                  
                  <p style="color: #ff6b6b; font-size: 16px; text-align: center; font-weight: bold;">
                    ⚡ Don't miss out - Offer ends soon!
                  </p>
                </div>
                <div class="footer">
                  <p>City Pulse Tours | Your Journey, Our Passion</p>
                  <p>
                    <a href="http://localhost:5173/unsubscribe?email=${subscriber.email}" style="color: #aaa; text-decoration: none;">Unsubscribe</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `
        }).catch(err => {
          console.error(`Failed to send to ${subscriber.email}:`, err.message);
        });
      });
    
    await Promise.allSettled(emailPromises);
    
    console.log('✅ Discount notifications sent');
    
  } catch (error) {
    console.error('❌ Error sending discount notifications:', error);
    throw error;
  }
};

module.exports = {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  sendNewTripNotification,
  sendDiscountNotification,
  sendWelcomeEmail
};