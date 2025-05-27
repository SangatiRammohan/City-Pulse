const express = require('express');
const {
  createTrip,
  getTripByPackageAndDestination,
  getAllTripsByPackageType,
  getTripById,
  updateTrip,
  deleteTrip,
  searchTrips // Added this import
} = require('../controllers/tripController');
const {
  validateTripCreation,
  validateTripParams,
  validateTripUpdate
} = require('../middleware/tripValidation');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// Search trips with query parameters - Moved this route to the top
router.get(
  '/search',
  validateTripParams, // Optional: add validation for search parameters
  async (req, res) => {
    try {
      const {
        packageType,
        destination,
        minPrice,
        maxPrice,
        startDate,
        endDate
      } = req.query;
      
      const searchResults = await searchTrips({
        packageType,
        destination,
        minPrice,
        maxPrice,
        startDate,
        endDate
      });
      
      res.status(200).json(searchResults);
    } catch (error) {
      res.status(500).json({
        message: 'Error searching trips',
        error: error.message
      });
    }
  }
);

// Create a new trip (admin/guide only)
// router.post('/bookings/create', bookingController.createBooking);

// Get trip by package type and destination index
router.get(
  '/:packageType/destination/:destinationIndex',
  validateTripParams,
  getTripByPackageAndDestination
);

// Get all trips for a specific package type
router.get(
  '/:packageType',
  validateTripParams,
  getAllTripsByPackageType
);

// Get a specific trip by ID
router.get(
  '/:id',
  // authenticate, // Optional: add authentication if needed
  getTripById
);

// Update a trip (admin/guide only)
// router.patch(
//   '/:id',
//   // authenticate,
//   // authorize(['admin', 'guide']),
//   validateTripUpdate,
//   updateTrip
// );

// Delete a trip (admin only)
router.delete(
  '/:id',
  // authenticate,
  authorize(['admin']),
  deleteTrip
);

module.exports = router;