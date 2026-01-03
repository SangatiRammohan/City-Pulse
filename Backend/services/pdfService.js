const PDFDocument = require('pdfkit');

const generateInvoicePDF = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        bufferPages: true
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Colors
      const primaryGreen = '#54a15d';
      const darkGreen = '#3d7a44';
      const lightGray = '#f5f5f5';
      const textGray = '#333333';

      // Header with gradient effect
      doc.rect(0, 0, doc.page.width, 120).fill(primaryGreen);
      
      // Company name
      doc.fontSize(32)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text('CITY PULSE', 50, 40);
      
      doc.fontSize(12)
         .font('Helvetica')
         .text('Travel & Tours', 50, 80)
         .text('Hyderabad, Telangana, India', 50, 95);

      // Invoice title
      doc.fontSize(28)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text('INVOICE', doc.page.width - 200, 50, { align: 'right' });

      // Move down
      doc.moveDown(4);

      // Invoice details box
      const invoiceBoxY = 140;
      doc.rect(50, invoiceBoxY, doc.page.width - 100, 80)
         .fillAndStroke(lightGray, primaryGreen);

      doc.fontSize(10)
         .fillColor(textGray)
         .font('Helvetica-Bold')
         .text('Invoice Number:', 70, invoiceBoxY + 20)
         .font('Helvetica')
         .text(booking.bookingId, 180, invoiceBoxY + 20);

      doc.font('Helvetica-Bold')
         .text('Invoice Date:', 70, invoiceBoxY + 40)
         .font('Helvetica')
         .text(new Date(booking.bookingTimestamp).toLocaleDateString('en-IN', {
           year: 'numeric',
           month: 'long',
           day: 'numeric'
         }), 180, invoiceBoxY + 40);

      doc.font('Helvetica-Bold')
         .text('Payment Status:', 70, invoiceBoxY + 60)
         .font('Helvetica')
         .fillColor('#4caf50')
         .text('✓ ' + (booking.paymentStatus || 'Completed'), 180, invoiceBoxY + 60);

      // Customer details
      doc.fillColor(textGray);
      const customerBoxY = invoiceBoxY + 100;
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(primaryGreen)
         .text('BILLED TO:', 50, customerBoxY);

      doc.fontSize(10)
         .fillColor(textGray)
         .font('Helvetica-Bold')
         .text(booking.userDetails?.name || 'N/A', 50, customerBoxY + 25)
         .font('Helvetica')
         .text(booking.userDetails?.email || 'N/A', 50, customerBoxY + 42)
         .text(booking.userDetails?.phone || 'N/A', 50, customerBoxY + 59);

      // Package details
      const tableTop = customerBoxY + 100;
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(primaryGreen)
         .text('PACKAGE DETAILS', 50, tableTop);

      // Table header
      const tableHeaderY = tableTop + 30;
      doc.rect(50, tableHeaderY, doc.page.width - 100, 30)
         .fill(primaryGreen);

      doc.fontSize(10)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text('Description', 60, tableHeaderY + 10)
         .text('Duration', 300, tableHeaderY + 10)
         .text('Amount', 450, tableHeaderY + 10, { align: 'right', width: 90 });

      // Table content
      const rowY = tableHeaderY + 40;
      doc.fillColor(textGray)
         .font('Helvetica')
         .fontSize(10)
         .text(booking.packageName, 60, rowY, { width: 220 })
         .text(booking.packageInfo?.duration || 'N/A', 300, rowY)
         .text(`₹${booking.amount?.toLocaleString()}`, 450, rowY, { align: 'right', width: 90 });

      // Travelers list
      if (booking.travelers && booking.travelers.length > 0) {
        doc.fontSize(9)
           .fillColor('#666666')
           .text(`Travelers: ${booking.travelers.map(t => t.name).join(', ')}`, 60, rowY + 20, { width: 480 });
      }

      // Line
      doc.moveTo(50, rowY + 50)
         .lineTo(doc.page.width - 50, rowY + 50)
         .strokeColor('#cccccc')
         .stroke();

      // Total section
      const totalY = rowY + 70;
      
      doc.fontSize(10)
         .fillColor(textGray)
         .font('Helvetica')
         .text('Subtotal:', 350, totalY)
         .text(`₹${booking.amount?.toLocaleString()}`, 450, totalY, { align: 'right', width: 90 });

      doc.text('Tax (0%):', 350, totalY + 20)
         .text('₹0', 450, totalY + 20, { align: 'right', width: 90 });

      // Total with background
      doc.rect(340, totalY + 45, 205, 30)
         .fill(primaryGreen);

      doc.fontSize(12)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text('Total Amount:', 350, totalY + 52)
         .fontSize(14)
         .text(`₹${booking.totalAmount?.toLocaleString()}`, 450, totalY + 52, { align: 'right', width: 90 });

      // Payment details
      doc.fillColor(textGray);
      const paymentY = totalY + 100;
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(primaryGreen)
         .text('PAYMENT DETAILS', 50, paymentY);

      doc.fontSize(10)
         .fillColor(textGray)
         .font('Helvetica')
         .text(`Payment Method: ${booking.paymentMethod}`, 50, paymentY + 25);

      if (booking.paymentDetails?.transactionId) {
        doc.text(`Transaction ID: ${booking.paymentDetails.transactionId}`, 50, paymentY + 42);
      }

      if (booking.paymentDetails?.cardNumber) {
        doc.text(`Card: ${booking.paymentDetails.cardNumber}`, 50, paymentY + 59);
      }

      if (booking.paymentDetails?.upiId) {
        doc.text(`UPI ID: ${booking.paymentDetails.upiId}`, 50, paymentY + 59);
      }

      // Guide information (if available)
      if (booking.selectedGuide) {
        const guideY = paymentY + 90;
        
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(primaryGreen)
           .text('YOUR GUIDE', 50, guideY);

        doc.fontSize(10)
           .fillColor(textGray)
           .font('Helvetica')
           .text(`Name: ${booking.selectedGuide.name}`, 50, guideY + 25)
           .text(`Email: ${booking.selectedGuide.email}`, 50, guideY + 42);
      }

      // Footer
      const footerY = doc.page.height - 100;
      
      doc.rect(0, footerY, doc.page.width, 100)
         .fill(lightGray);

      doc.fontSize(9)
         .fillColor(textGray)
         .font('Helvetica')
         .text('Thank you for choosing City Pulse!', 50, footerY + 20, { align: 'center', width: doc.page.width - 100 });

      doc.fontSize(8)
         .fillColor('#666666')
         .text('For any queries, contact us at citypulse@gmail.com', 50, footerY + 40, { align: 'center', width: doc.page.width - 100 })
         .text('This is a computer-generated invoice and does not require a signature.', 50, footerY + 55, { align: 'center', width: doc.page.width - 100 });

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF,
};