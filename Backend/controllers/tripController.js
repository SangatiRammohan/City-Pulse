const Trip = require('../models/Trip');
const { loadPackageData } = require('../utils/packageDataLoader');
const mongoose = require('mongoose'); // Added for ObjectId validation

const createTrip = async (req, res) => {
  try {
    const { 
      packageType, 
      destinationIndex 
    } = req.body;

    // Validate input
    if (!packageType || destinationIndex === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        requiredFields: ['packageType', 'destinationIndex']
      });
    }
    
    // Ensure destinationIndex is a valid number
    const parsedDestinationIndex = Number(destinationIndex);
    if (isNaN(parsedDestinationIndex) || parsedDestinationIndex < 0) {
      return res.status(400).json({
        message: 'Invalid destination index',
        receivedValue: destinationIndex
      });
    }

    // Load package data dynamically
    const packageData = loadPackageData(packageType);

    if (!packageData) {
      return res.status(404).json({ message: 'Package type not found' });
    }

    // Check if destinations array exists
    if (!packageData.destinations || !Array.isArray(packageData.destinations)) {
      return res.status(500).json({ 
        message: 'Invalid package data structure',
        error: 'Destinations array is missing or invalid'
      });
    }

    const destination = packageData.destinations[parsedDestinationIndex];

    if (!destination) {
      return res.status(404).json({ 
        message: 'Destination not found',
        availableDestinations: packageData.destinations.length
      });
    }

    // Validate price and create trip data
    const price = Number(packageData.price);
    if (isNaN(price)) {
      return res.status(400).json({ 
        message: 'Invalid price in package data',
        receivedValue: packageData.price
      });
    }

    const tripData = {
      packageType,
      destinationIndex: parsedDestinationIndex,
      title: packageData.title || 'Unnamed Trip',
      subtitle: packageData.subtitle || '',
      bannerImage: packageData.bannerImage || '',
      description: packageData.description || '',
      duration: packageData.duration || '',
      price,
      inclusions: Array.isArray(packageData.inclusions) ? packageData.inclusions : [],
      highlights: Array.isArray(packageData.highlights) ? packageData.highlights : [],
      destinationDetails: destination,
      accommodations: Array.isArray(packageData.accommodations) ? packageData.accommodations : [],
      disabilityAccommodations: Array.isArray(packageData.disabilityAccommodations) ? packageData.disabilityAccommodations : []
    };

    // Check for existing trip to prevent duplicates
    const existingTrip = await Trip.findOne({ 
      packageType, 
      destinationIndex: parsedDestinationIndex 
    });

    if (existingTrip) {
      return res.status(409).json({ 
        message: 'Trip already exists',
        existingTripId: existingTrip._id
      });
    }

    // Create and save new trip
    const trip = new Trip(tripData);
    const savedTrip = await trip.save();

    res.status(201).json({
      message: 'Trip created successfully',
      trip: {
        id: savedTrip._id,
        packageType: savedTrip.packageType,
        destination: savedTrip.destinationDetails,
        price: savedTrip.price
      }
    });
  } catch (error) {
    console.error('Trip creation error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({ 
      message: 'Error creating trip', 
      error: 'Internal server error'
    });
  }
};

const getTripByPackageAndDestination = async (req, res) => {
  try {
    const { packageType, destinationIndex } = req.params;

    // Validate input
    if (!packageType || destinationIndex === undefined) {
      return res.status(400).json({ 
        message: 'Missing required parameters',
        requiredParams: ['packageType', 'destinationIndex']
      });
    }

    const parsedDestinationIndex = parseInt(destinationIndex, 10);
    if (isNaN(parsedDestinationIndex) || parsedDestinationIndex < 0) {
      return res.status(400).json({
        message: 'Invalid destination index',
        receivedValue: destinationIndex
      });
    }

    // First, try to find trip in database
    const trip = await Trip.findOne({ 
      packageType, 
      destinationIndex: parsedDestinationIndex 
    }).lean();

    if (trip) {
      return res.status(200).json(trip);
    }

    // If not found in database, load from JSON
    const packageData = loadPackageData(packageType);
    
    if (!packageData) {
      return res.status(404).json({ 
        message: 'Package type not found',
        packageType
      });
    }
    
    // Check if destinations array exists and is valid
    if (!packageData.destinations || !Array.isArray(packageData.destinations)) {
      return res.status(500).json({ 
        message: 'Invalid package data structure',
        error: 'Destinations array is missing or invalid'
      });
    }
    
    if (!packageData.destinations[parsedDestinationIndex]) {
      return res.status(404).json({ 
        message: 'Destination not found',
        packageType,
        destinationIndex: parsedDestinationIndex,
        availableDestinations: packageData.destinations.length
      });
    }

    // Validate price
    const price = Number(packageData.price);
    if (isNaN(price)) {
      console.warn(`Invalid price in package data for ${packageType}: ${packageData.price}`);
    }

    // Create a trip object from JSON data
    const tripData = {
      packageType,
      destinationIndex: parsedDestinationIndex,
      destinationDetails: packageData.destinations[parsedDestinationIndex],
      title: packageData.title || '',
      subtitle: packageData.subtitle || '',
      description: packageData.description || '',
      price: isNaN(price) ? 0 : price,
      bannerImage: packageData.bannerImage || '',
      duration: packageData.duration || '',
      inclusions: Array.isArray(packageData.inclusions) ? packageData.inclusions : [],
      highlights: Array.isArray(packageData.highlights) ? packageData.highlights : []
    };

    res.status(200).json(tripData);
  } catch (error) {
    console.error('Get trip error:', {
      message: error.message,
      name: error.name
    });

    res.status(500).json({ 
      message: 'Error retrieving trip', 
      error: 'Internal server error'
    });
  }
};

const getAllTripsByPackageType = async (req, res) => {
  try {
    const { packageType } = req.params;

    // Validate input
    if (!packageType) {
      return res.status(400).json({ 
        message: 'Package type is required',
        requiredParams: ['packageType']
      });
    }

    // First, try to find trips in database
    const trips = await Trip.find({ packageType }).lean();

    if (trips.length > 0) {
      return res.status(200).json({
        count: trips.length,
        trips
      });
    }

    // If no trips in database, load from JSON
    const packageData = loadPackageData(packageType);

    if (!packageData) {
      return res.status(404).json({ 
        message: 'Package type not found',
        packageType 
      });
    }

    // Check if destinations array exists and is valid
    if (!packageData.destinations || !Array.isArray(packageData.destinations)) {
      return res.status(500).json({ 
        message: 'Invalid package data structure',
        error: 'Destinations array is missing or invalid'
      });
    }

    // Return package data with additional metadata
    res.status(200).json({
      packageType,
      title: packageData.title || '',
      subtitle: packageData.subtitle || '',
      description: packageData.description || '',
      bannerImage: packageData.bannerImage || '',
      destinations: packageData.destinations,
      destinationCount: packageData.destinations.length
    });
  } catch (error) {
    console.error('Get all trips error:', {
      message: error.message,
      name: error.name
    });

    res.status(500).json({ 
      message: 'Error retrieving trips', 
      error: 'Internal server error'
    });
  }
};





// Get a specific trip by ID (placeholder)
const getTripById = async (req, res) => {
  // TODO: Implement actual logic
  return res.status(501).json({ message: 'getTripById not implemented yet.' });
};

// Update a trip (placeholder)
const updateTrip = async (req, res) => {
  // TODO: Implement actual logic
  return res.status(501).json({ message: 'updateTrip not implemented yet.' });
};

// Delete a trip (placeholder)
const deleteTrip = async (req, res) => {
  // TODO: Implement actual logic
  return res.status(501).json({ message: 'deleteTrip not implemented yet.' });
};

// Search trips (placeholder)
const searchTrips = async (params) => {
  // TODO: Implement actual logic
  // For now, just return an empty array or a dummy result
  return [];
};

// Export all controllers
module.exports = {
  createTrip,
  getTripByPackageAndDestination,
  getAllTripsByPackageType,
  getTripById,
  updateTrip,
  deleteTrip,
  searchTrips
};