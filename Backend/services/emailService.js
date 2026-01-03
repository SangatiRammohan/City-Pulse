const nodemailer = require('nodemailer');

// Email configuration from environment variables
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

console.log('📧 Email Service Configuration:', {
  host: emailConfig.host,
  port: emailConfig.port,
  user: emailConfig.auth.user,
  passwordConfigured: !!emailConfig.auth.pass
});

// Base email sending function
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    console.log('📧 Attempting to send email to:', to);
    console.log('📧 Creating email transporter with config:', {
      host: emailConfig.host,
      port: emailConfig.port,
      user: emailConfig.auth.user,
      passwordLength: emailConfig.auth.pass?.length
    });

    const transporter = nodemailer.createTransport(emailConfig);

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    const mailOptions = {
      from: process.env.EMAIL_FROM || emailConfig.auth.user,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

// Send booking confirmation email with invoice
const sendBookingConfirmation = async (booking, pdfBuffer) => {
  try {
    const customerEmail = booking.userDetails?.email;
    
    if (!customerEmail) {
      throw new Error('Customer email not found');
    }

    await sendEmail({
      to: customerEmail,
      subject: `Booking Confirmation - ${booking.bookingId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #54a15d, #6fbf73); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #54a15d; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Thank you for choosing City Pulse Tours</p>
            </div>
            <div class="content">
              <h2>Hello ${booking.userDetails?.name}!</h2>
              <p>Your booking has been confirmed. Here are your booking details:</p>
              <ul>
                <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
                <li><strong>Package:</strong> ${booking.packageName}</li>
                <li><strong>Amount Paid:</strong> ₹${booking.totalAmount?.toLocaleString()}</li>
                <li><strong>Payment Method:</strong> ${booking.paymentMethod}</li>
              </ul>
              <p>Your invoice is attached to this email.</p>
              <p style="text-align: center; margin-top: 30px;">
                <a href="#" class="button">View Trip Details</a>
              </p>
            </div>
            <div class="footer">
              <p>City Pulse Tours | Your Journey, Our Passion</p>
              <p>📞 +91 8888888888 | 📧 citypulsetours01@gmail.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: pdfBuffer ? [{
        filename: `Invoice-${booking.bookingId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }] : []
    });

    console.log('✅ Booking confirmation email sent successfully');
  } catch (error) {
    console.error('❌ Error sending booking confirmation:', error);
    throw error;
  }
};

// Send booking notification to company
const sendBookingNotificationToCompany = async (booking) => {
  try {
    const companyEmail = process.env.COMPANY_EMAIL || process.env.EMAIL_USER;
    
    console.log('📧 Sending booking notification to company:', companyEmail);
    
    // Format payment details for display
    const formatPaymentDetails = () => {
      const payment = booking.paymentDetails;
      
      if (booking.paymentMethod === 'Credit Card' || booking.paymentMethod === 'Debit Card' || booking.paymentMethod === 'credit' || booking.paymentMethod === 'debit') {
        return `
          <strong>Payment Type:</strong> ${payment.paymentType || booking.paymentMethod}<br/>
          <strong>Card Number:</strong> ${payment.cardNumber || 'N/A'}<br/>
          <strong>Card Holder:</strong> ${payment.cardHolderName || 'N/A'}<br/>
          <strong>Transaction ID:</strong> ${payment.transactionId || 'N/A'}
        `;
      } else if (booking.paymentMethod === 'UPI' || booking.paymentMethod === 'upi') {
        return `
          <strong>Payment Type:</strong> UPI<br/>
          <strong>UPI ID:</strong> ${payment.upiId || 'N/A'}<br/>
          <strong>Transaction ID:</strong> ${payment.transactionId || 'N/A'}
        `;
      } else if (booking.paymentMethod === 'Net Banking' || booking.paymentMethod === 'netbanking') {
        return `
          <strong>Payment Type:</strong> Net Banking<br/>
          <strong>Bank:</strong> ${payment.bank || 'N/A'}<br/>
          <strong>Username:</strong> ${payment.username || 'N/A'}<br/>
          <strong>Transaction ID:</strong> ${payment.transactionId || 'N/A'}
        `;
      } else {
        return `
          <strong>Payment Type:</strong> ${booking.paymentMethod}<br/>
          <strong>Transaction ID:</strong> ${payment.transactionId || 'N/A'}
        `;
      }
    };

    await sendEmail({
      to: companyEmail,
      subject: `💰 New Booking Payment Received - ${booking.bookingId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: #f5f5f5;
              padding: 20px;
            }
            .container { 
              max-width: 700px; 
              margin: 0 auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #54a15d, #6fbf73); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .header .amount {
              font-size: 42px;
              font-weight: bold;
              margin: 15px 0 5px 0;
            }
            .badge {
              display: inline-block;
              background: rgba(255,255,255,0.2);
              padding: 8px 20px;
              border-radius: 20px;
              font-size: 14px;
              margin-top: 10px;
            }
            .content { 
              padding: 40px 30px; 
            }
            .section {
              background: #f8f9fa;
              border-left: 4px solid #54a15d;
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #54a15d;
              margin: 0 0 15px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-top: 15px;
            }
            .info-item {
              background: white;
              padding: 12px;
              border-radius: 6px;
              border: 1px solid #e0e0e0;
            }
            .info-label {
              font-size: 11px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              display: block;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 15px;
              color: #333;
              font-weight: 600;
            }
            .payment-section {
              background: #fff9e6;
              border-left: 4px solid #ffc107;
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
            }
            .travelers-list {
              list-style: none;
              padding: 0;
              margin: 10px 0 0 0;
            }
            .travelers-list li {
              background: white;
              padding: 10px 15px;
              margin-bottom: 8px;
              border-radius: 6px;
              border-left: 3px solid #54a15d;
            }
            .guide-section {
              background: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
            }
            .action-buttons {
              text-align: center;
              margin: 30px 0;
            }
            .button {
              display: inline-block;
              background: #54a15d;
              color: white;
              padding: 14px 35px;
              text-decoration: none;
              border-radius: 6px;
              margin: 0 10px;
              font-weight: bold;
            }
            .footer { 
              background: #f8f9fa; 
              padding: 25px; 
              text-align: center; 
              font-size: 12px;
              color: #666;
              border-top: 1px solid #e0e0e0;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 15px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              margin-left: 10px;
            }
            .status-confirmed {
              background: #d4edda;
              color: #155724;
            }
            .status-paid {
              background: #d1ecf1;
              color: #0c5460;
            }
            .highlight-box {
              background: white;
              border: 2px dashed #54a15d;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 New Payment Received!</h1>
              <div class="amount">₹${booking.totalAmount.toLocaleString()}</div>
              <div class="badge">
                <span class="status-badge status-confirmed">${booking.bookingStatus}</span>
                <span class="status-badge status-paid">${booking.paymentStatus}</span>
              </div>
            </div>
            
            <div class="content">
              <div class="highlight-box">
                <h2 style="margin: 0 0 10px 0; color: #54a15d;">Booking ID: ${booking.bookingId}</h2>
                <p style="margin: 0; color: #666; font-size: 14px;">
                  Received on ${new Date(booking.bookingTimestamp).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <!-- Customer Details -->
              <div class="section">
                <div class="section-title">👤 Customer Details</div>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Name</span>
                    <span class="info-value">${booking.userDetails?.name || 'N/A'}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Email</span>
                    <span class="info-value">${booking.userDetails?.email || 'N/A'}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Phone</span>
                    <span class="info-value">${booking.userDetails?.phone || 'N/A'}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Total Travelers</span>
                    <span class="info-value">${booking.userDetails?.persons || booking.travelers?.length || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <!-- Package Details -->
              <div class="section">
                <div class="section-title">📦 Package Details</div>
                <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">${booking.packageName}</h3>
                  ${booking.packageInfo?.duration ? `<p style="margin: 5px 0; color: #666;">⏱️ Duration: ${booking.packageInfo.duration}</p>` : ''}
                  <p style="margin: 5px 0; color: #666;">💵 Price per person: ₹${booking.packageInfo?.charge?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>

              <!-- Payment Details -->
              <div class="payment-section">
                <div class="section-title" style="color: #856404;">💳 Payment Details</div>
                <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
                  ${formatPaymentDetails()}
                  <hr style="margin: 15px 0; border: none; border-top: 1px solid #e0e0e0;"/>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong style="color: #856404;">Total Amount:</strong>
                    </div>
                    <div style="font-size: 24px; font-weight: bold; color: #54a15d;">
                      ₹${booking.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Travelers List -->
              ${booking.travelers && booking.travelers.length > 0 ? `
                <div class="section">
                  <div class="section-title">👥 Travelers (${booking.travelers.length})</div>
                  <ul class="travelers-list">
                    ${booking.travelers.map((traveler, index) => `
                      <li>
                        <strong>${index + 1}. ${traveler.name}</strong>
                        ${traveler.age ? ` - ${traveler.age} years` : ''}
                        ${traveler.gender ? ` - ${traveler.gender}` : ''}
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}

              <!-- Guide Details -->
              ${booking.selectedGuide ? `
                <div class="guide-section">
                  <div class="section-title" style="color: #1976d2;">🧑‍✈️ Assigned Guide</div>
                  <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">${booking.selectedGuide.name}</h3>
                    ${booking.selectedGuide.email ? `<p style="margin: 5px 0; color: #666;">📧 ${booking.selectedGuide.email}</p>` : ''}
                    ${booking.selectedGuide.phone ? `<p style="margin: 5px 0; color: #666;">📞 ${booking.selectedGuide.phone}</p>` : ''}
                    ${booking.selectedGuide.languages ? `<p style="margin: 5px 0; color: #666;">🗣️ Languages: ${booking.selectedGuide.languages.join(', ')}</p>` : ''}
                  </div>
                </div>
              ` : ''}

              <!-- Action Buttons -->
              <div class="action-buttons">
                <a href="mailto:${booking.userDetails?.email}" class="button">
                  📧 Email Customer
                </a>
                <a href="tel:${booking.userDetails?.phone}" class="button" style="background: #2196f3;">
                  📞 Call Customer
                </a>
              </div>

              <!-- Important Notice -->
              <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin-top: 30px;">
                <h3 style="margin: 0 0 10px 0; color: #856404;">⚡ Action Required</h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
                  <li>Confirm the booking with the customer within 2 hours</li>
                  <li>Verify payment details in your payment gateway</li>
                  ${booking.selectedGuide ? '<li>Notify the assigned guide about this booking</li>' : '<li>Assign a guide to this booking if needed</li>'}
                  <li>Prepare travel itinerary and send to customer</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0; font-weight: bold; color: #333;">City Pulse Tours - Booking Management System</p>
              <p style="margin: 10px 0 0 0;">
                This is an automated notification. Booking ID: <strong>${booking.bookingId}</strong>
              </p>
              <p style="margin: 5px 0 0 0; color: #999; font-size: 11px;">
                Transaction completed at ${new Date().toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Booking notification sent to company:', companyEmail);

  } catch (error) {
    console.error('❌ Error sending booking notification to company:', error);
    throw error;
  }
};

// Send contact form email to company
const sendContactFormEmail = async (contactData) => {
  try {
    const { name, phone, email, message } = contactData;
    
    const companyEmail = process.env.COMPANY_EMAIL || process.env.EMAIL_USER;
    
    // Email to company
    await sendEmail({
      to: companyEmail,
      subject: `🆕 New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: #f5f5f5;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #54a15d, #6fbf73); 
              color: white; 
              padding: 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content { 
              padding: 30px; 
            }
            .info-block {
              background: #f8f9fa;
              border-left: 4px solid #54a15d;
              padding: 15px;
              margin: 15px 0;
              border-radius: 5px;
            }
            .info-label {
              font-weight: bold;
              color: #54a15d;
              display: block;
              margin-bottom: 5px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-value {
              color: #333;
              font-size: 16px;
            }
            .message-block {
              background: white;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .footer { 
              background: #f8f9fa; 
              padding: 20px; 
              text-align: center; 
              font-size: 12px;
              color: #666;
              border-top: 1px solid #e0e0e0;
            }
            .action-button {
              display: inline-block;
              background: #54a15d;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 New Contact Form Submission</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">City Pulse Tours</p>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 25px;">
                You have received a new inquiry from your website contact form.
              </p>
              
              <div class="info-block">
                <span class="info-label">👤 Full Name</span>
                <span class="info-value">${name}</span>
              </div>
              
              <div class="info-block">
                <span class="info-label">📧 Email Address</span>
                <span class="info-value">
                  <a href="mailto:${email}" style="color: #54a15d; text-decoration: none;">${email}</a>
                </span>
              </div>
              
              ${phone ? `
                <div class="info-block">
                  <span class="info-label">📞 Phone Number</span>
                  <span class="info-value">
                    <a href="tel:${phone}" style="color: #54a15d; text-decoration: none;">${phone}</a>
                  </span>
                </div>
              ` : ''}
              
              <div class="info-block">
                <span class="info-label">📅 Submission Date</span>
                <span class="info-value">${new Date().toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              
              <div class="message-block">
                <span class="info-label">💬 Message</span>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap; line-height: 1.6;">
                  ${message}
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:${email}" class="action-button">Reply to Customer</a>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                <strong style="color: #856404;">⚡ Quick Action Required:</strong>
                <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">
                  Please respond to this inquiry within 24 hours for better customer satisfaction.
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">City Pulse Tours - Customer Relationship Management</p>
              <p style="margin: 5px 0 0 0; color: #999;">
                This is an automated notification from your website contact form.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Contact form email sent to company:', companyEmail);

    // Send confirmation email to customer
    await sendEmail({
      to: email,
      subject: 'Thank you for contacting City Pulse Tours! 🌍',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: #f5f5f5;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #54a15d, #6fbf73); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content { 
              padding: 40px 30px; 
            }
            .highlight-box {
              background: #f0f8f1;
              border-left: 4px solid #54a15d;
              padding: 20px;
              margin: 25px 0;
              border-radius: 5px;
            }
            .footer { 
              background: #f8f9fa; 
              padding: 25px; 
              text-align: center; 
              font-size: 12px;
              color: #666;
              border-top: 1px solid #e0e0e0;
            }
            .button {
              display: inline-block;
              background: #54a15d;
              color: white;
              padding: 14px 35px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Message Received!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">
                Thank you for reaching out to us
              </p>
            </div>
            
            <div class="content">
              <h2 style="color: #54a15d; margin-top: 0;">Hello ${name}! 👋</h2>
              
              <p style="font-size: 16px; line-height: 1.8;">
                Thank you for contacting City Pulse Tours. We've received your message and our team will review it shortly.
              </p>
              
              <div class="highlight-box">
                <h3 style="margin: 0 0 10px 0; color: #54a15d; font-size: 18px;">📝 Your Message Summary</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">
                  <strong>Submitted on:</strong> ${new Date().toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                  <strong>Your message:</strong><br/>
                  <span style="color: #333; font-style: italic;">"${message.substring(0, 150)}${message.length > 150 ? '...' : ''}"</span>
                </p>
              </div>
              
              <p style="font-size: 15px; line-height: 1.8;">
                <strong>What happens next?</strong>
              </p>
              <ul style="line-height: 2; color: #555;">
                <li>Our team will review your inquiry within 24 hours</li>
                <li>You'll receive a detailed response via email at <strong>${email}</strong></li>
                ${phone ? `<li>If needed, we may call you at <strong>${phone}</strong></li>` : ''}
                <li>Feel free to explore our packages while you wait!</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5173/packages" class="button">Explore Our Packages</a>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0; font-weight: bold; color: #333;">City Pulse Tours</p>
              <p style="margin: 10px 0;">Your Journey, Our Passion 🌍</p>
              <p style="margin-top: 20px; color: #999;">
                📞 +91 8888888888 | 📧 citypulsetours01@gmail.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Confirmation email sent to customer:', email);

    return {
      success: true,
      message: 'Contact form submitted successfully'
    };

  } catch (error) {
    console.error('❌ Error sending contact form email:', error);
    throw error;
  }
};

// Add this function to your existing emailService.js

// Send password reset OTP email
const sendPasswordResetOTP = async (email, otp, userName) => {
  try {
    await sendEmail({
      to: email,
      subject: 'Password Reset Code - City Pulse Tours',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: #f5f5f5;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #54a15d, #6fbf73); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content { 
              padding: 40px 30px; 
            }
            .otp-box {
              background: linear-gradient(135deg, #f8f9fa, #e9ecef);
              border: 3px dashed #54a15d;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 48px;
              font-weight: bold;
              color: #54a15d;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
              margin: 10px 0;
            }
            .warning-box {
              background: #fff3cd;
              border: 1px solid #ffc107;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
            }
            .footer { 
              background: #f8f9fa; 
              padding: 25px; 
              text-align: center; 
              font-size: 12px;
              color: #666;
              border-top: 1px solid #e0e0e0;
            }
            .timer {
              background: #e7f5e8;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Code</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">
                City Pulse Tours
              </p>
            </div>
            
            <div class="content">
              <h2 style="color: #54a15d; margin-top: 0;">Hello ${userName || 'there'}! 👋</h2>
              
              <p style="font-size: 16px; line-height: 1.8;">
                We received a request to reset your password for your City Pulse Tours account. 
                Use the verification code below to reset your password:
              </p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">
                  Your Verification Code
                </p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 13px; color: #888;">
                  Enter this code on the password reset page
                </p>
              </div>
              
              <div class="timer">
                <p style="margin: 0; font-size: 15px; color: #54a15d;">
                  ⏰ This code will expire in <strong>15 minutes</strong>
                </p>
              </div>
              
              <div class="warning-box">
                <strong style="color: #856404;">⚠️ Important Security Information:</strong>
                <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
                  <li>This code is valid for <strong>15 minutes only</strong></li>
                  <li>You can try entering the code up to <strong>5 times</strong></li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share this code with anyone</li>
                  <li>Our support team will never ask for this code</li>
                </ul>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If you're having trouble, you can request a new code or contact our support team for assistance.
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0; font-weight: bold; color: #333;">City Pulse Tours</p>
              <p style="margin: 10px 0;">Your Journey, Our Passion 🌍</p>
              <p style="margin-top: 20px; color: #999;">
                📞 +91 8888888888 | 📧 citypulsetours01@gmail.com
              </p>
              <p style="margin: 15px 0 0 0; color: #999; font-size: 11px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Password reset OTP email sent to:', email);
    return { success: true };

  } catch (error) {
    console.error('❌ Error sending password reset OTP email:', error);
    throw error;
  }
};

// Update your module.exports to include the new function
module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendContactFormEmail,
  sendBookingNotificationToCompany,
  sendPasswordResetOTP  // ✅ Add this (remove sendPasswordResetEmail if you had it)
};