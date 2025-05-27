const fs = require('fs');
const path = require('path');

// Dynamic import of JSON files
const importPackageData = () => {
  const dataDir = path.join(__dirname, '../../Frontend/data');
  const packageDataMap = {};

  try {
    // Check if directory exists
    if (!fs.existsSync(dataDir)) {
      console.error(`Data directory not found: ${dataDir}`);
      return {};
    }

    const files = fs.readdirSync(dataDir);
    
    files.forEach(file => {
      if (file.endsWith('_tour.json')) {
        const packageType = file.replace('_tour.json', '').toLowerCase();
        try {
          // Use fs.readFileSync instead of require to avoid caching issues
          const rawData = fs.readFileSync(path.join(dataDir, file), 'utf8');
          const data = JSON.parse(rawData);
          packageDataMap[packageType] = data;
        } catch (importError) {
          console.error(`Error importing package data for ${packageType}:`, importError);
        }
      }
    });
    
    return packageDataMap;
  } catch (error) {
    console.error('Error reading package data directory:', error);
    return {};
  }
};

// Preload package data
const packageDataMap = importPackageData();

function loadPackageData(packageType) {
  if (!packageType) {
    console.warn('No package type provided');
    return null;
  }

  // Convert input to lowercase to handle case variations
  const normalizedPackageType = packageType.toLowerCase();
  
  // Check if package type exists
  const data = packageDataMap[normalizedPackageType];
  
  if (!data) {
    console.warn(`No package data found for type: ${packageType}`);
    return null;
  }

  // Handle different data structures
  try {
    // Check for nested structures
    if (data[normalizedPackageType]) {
      return data[normalizedPackageType];
    }
    
    // Check for destinations key
    if (data.destinations) {
      return data;
    }
    
    // Check first nested object with destinations
    const nestedData = Object.values(data).find(item => item && typeof item === 'object' && item.destinations);
    if (nestedData) {
      return nestedData;
    }
    
    // Return data as-is if no special handling needed
    return data;
  } catch (error) {
    console.error(`Error processing package data for ${packageType}:`, error);
    return null;
  }
}

// Additional utility function to list available package types
function getAvailablePackageTypes() {
  return Object.keys(packageDataMap);
}

// Additional function to validate package data
function validatePackageData(packageType) {
  if (!packageType) return false;
  
  const data = loadPackageData(packageType);
  
  if (!data) return false;
  
  // Basic validation checks
  const requiredFields = ['destinations', 'name', 'description'];
  
  return requiredFields.every(field => {
    if (field === 'destinations') {
      return Array.isArray(data[field]) && data[field].length > 0;
    }
    return data[field] !== undefined;
  });
}

module.exports = {
  loadPackageData,
  packageDataMap,
  getAvailablePackageTypes,
  validatePackageData
};