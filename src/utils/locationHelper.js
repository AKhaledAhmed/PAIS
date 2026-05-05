const axios = require("axios");

/**
 * 📍 Reverse Geocoding — turns [lat, lng] into a neighborhood name
 * Used silently in searchService for AI Demand Forecasting
 */
const getDistrictFromCoords = async (lat, lng) => {
  // Pulls the key safely from your .env file
  const apiKey = process.env.GEOAPIFY_API_KEY; 
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${apiKey}`;
  
  try {
    const res = await axios.get(url);
    
    // Extracts the most relevant area name (district, suburb, or city)
    const props = res.data.features[0].properties;
    return props.district || props.suburb || props.city || "Unknown Area";
  } catch (err) {
    // If the API fails, we don't want to crash the search, so we return a default string
    console.error("Reverse Geocoding Failed:", err.message);
    return "Unknown Area";
  }
};

/**
 * 📍 Forward Geocoding — turns an Address String into [lat, lng]
 * Used in Pharmacy Registration (Safety Net) to automatically map text to coordinates
 */
const getCoordsFromAddress = async (addressText) => {
  // Pulls the key safely from your .env file
  const apiKey = process.env.GEOAPIFY_API_KEY; 
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressText)}&apiKey=${apiKey}`;
    
  try {   
    const response = await axios.get(url);
    
    // Check if Geoapify actually found a real place
    if (response.data.features && response.data.features.length > 0) {
      // Geoapify returns coordinates in [longitude, latitude] order
      const [lng, lat] = response.data.features[0].geometry.coordinates;
      return { lat, lng };
    }
    
    // If no place was found, throw an error to stop the registration
    throw new Error("LOCATION_NOT_FOUND");
  } catch (error) {
    // This catches network errors or the LOCATION_NOT_FOUND error we threw above
    console.error("Forward Geocoding Failed:", error.message);
    throw new Error("INVALID_ADDRESS");
  }
};

// ✅ Safely export both helpers for use in your controllers and services
module.exports = { getDistrictFromCoords, getCoordsFromAddress };