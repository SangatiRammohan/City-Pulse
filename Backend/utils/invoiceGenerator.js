const PDFDocument = require('pdfkit');
const moment = require('moment');

const generateInvoice = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate input
      if (!booking || !booking.bookingId) {
        throw new Error('Invalid booking information');
      }
      
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });
      
      const buffers = [];
      
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Header
      doc.fillColor('#333')
        .fontSize(25)
        .text('TRAVEL INVOICE', { align: 'center' })
        .moveDown(0.5);
      
      // Company Details
      doc.fontSize(10)
        .fillColor('#666')
        .text('Wanderlust Adventures', { align: 'center' })
        .text('123 Travel Street, Exploration City', { align: 'center' })
        .text('Contact: +91 9876543210 | support@wanderlust.com', { align: 'center' })
        .moveDown(1);
      
      // Invoice Details
      doc.fillColor('#333')
        .fontSize(12)
        .text(`Invoice Number: INV-${booking.bookingId}`, { align: 'right' })
        .text(`Date: ${moment(booking.date || new Date()).format('DD MMM YYYY, hh:mm A')}`, { align: 'right' })
        .moveDown(1);
      
      // Customer Details
      doc.fontSize(12)
        .text('Bill To:')
        .fontSize(10)
        .text(`${booking.customerName || 'Customer'}`)
        .text(`Email: ${booking.email || 'N/A'}`)
        .text(`Phone: ${booking.phone || 'N/A'}`)
        .moveDown(1);
      
      // Booking Details
      doc
        .fontSize(12)
        .text('Booking Details:', { underline: true })
        .fontSize(10)
        .text(`Package: ${booking.packageName || 'Standard Package'}`)
        .text(`Booking ID: ${booking.bookingId}`)
        .moveDown(1);
      
      // Payment Details
      doc
        .fontSize(12)
        .text('Payment Summary:', { underline: true })
        .fontSize(10)
        .text(`Payment Method: ${booking.paymentMethod || 'Online Payment'}`)
        .text(`Total Amount: ₹${(booking.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        .moveDown(1);
      
      // Footer
      doc.fontSize(8)
        .fillColor('#666')
        .text('Thank you for choosing Wanderlust Adventures!', { align: 'center' })
        .text('This is a computer-generated invoice', { align: 'center' });
      
      // Add page numbers
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
          .fillColor('#666')
          .text(`Page ${i + 1} of ${pages.count}`,
            doc.page.width - 100,
            doc.page.height - 30,
            { align: 'right' }
          );
      }
      
      doc.end();
    } catch (error) {
      console.error('Invoice generation error:', error);
      reject(error);
    }
  });
};

module.exports = { generateInvoice };