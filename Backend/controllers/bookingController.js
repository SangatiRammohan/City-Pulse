const express = require('express');
const { generateInvoice } = require('../utils/invoiceGenerator');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const router = express.Router();

// Endpoint to download invoice
router.get('/invoice/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    
    try {
        // Validate bookingId format (MongoDB ObjectId validation)
        if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                error: 'Invalid booking ID',
                message: 'Please provide a valid booking ID'
            });
        }
        
        // Fetch booking details from the database with error handling
        const booking = await Booking.findById(bookingId)
            .select('customer invoice details paymentStatus') // Added paymentStatus field
            .lean(); // Use .lean() for performance optimization
        
        if (!booking) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Booking with ID ${bookingId} not found`
            });
        }
        
        // Check if booking has required data for invoice generation
        if (!booking.customer || !booking.details) {
            return res.status(422).json({
                error: 'Incomplete Booking Data',
                message: 'This booking does not have sufficient information to generate an invoice'
            });
        }
        
        // Generate the invoice PDF
        let invoicePDF;
        try {
            invoicePDF = await generateInvoice(booking);
            
            // Check if the invoice generation returned valid data
            if (!invoicePDF || !Buffer.isBuffer(invoicePDF)) {
                throw new Error('Invalid invoice data returned');
            }
        } catch (invoiceError) {
            console.error('Invoice generation error:', invoiceError);
            return res.status(500).json({
                error: 'Invoice Generation Failed',
                message: 'Unable to generate invoice due to an internal error'
            });
        }
        
        // Secure filename generation
        const sanitizedBookingId = bookingId.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `Invoice_${sanitizedBookingId}_${timestamp}.pdf`;
        
        // Set the response headers for PDF download
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': invoicePDF.length,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        // Send the PDF as a response
        return res.send(invoicePDF);
    } catch (error) {
        console.error('Error processing invoice download:', {
            bookingId,
            errorName: error.name,
            errorMessage: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
        
        return res.status(500).json({
            error: 'Server Error',
            message: 'An unexpected error occurred while processing the invoice',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Additional endpoint to check if invoice is available
router.get('/invoice-status/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    
    try {
        // Validate bookingId format
        if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                error: 'Invalid booking ID',
                message: 'Please provide a valid booking ID'
            });
        }
        
        // Check if booking exists and has required invoice data
        const booking = await Booking.findById(bookingId)
            .select('customer details paymentStatus')
            .lean();
        
        if (!booking) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Booking with ID ${bookingId} not found`
            });
        }
        
        // Determine invoice availability
        const invoiceAvailable = booking.customer && 
                                booking.details && 
                                booking.paymentStatus === 'paid';
        
        return res.status(200).json({
            bookingId,
            invoiceAvailable,
            missingData: !booking.customer || !booking.details ? 
                ['customer', 'details'].filter(field => !booking[field]) : 
                [],
            paymentStatus: booking.paymentStatus || 'unknown'
        });
    } catch (error) {
        console.error('Error checking invoice status:', {
            bookingId,
            error: error.message
        });
        
        return res.status(500).json({
            error: 'Server Error',
            message: 'An unexpected error occurred while checking invoice status'
        });
    }
});

module.exports = router;