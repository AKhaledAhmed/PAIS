const searchService = require("../services/searchService");

// ── Search Controller ─────────────────────────────────────
// Example: GET /search?q=paracetamol
const searchDrugs = async (req, res) => {
  try {
    const { q } = req.query;
 
    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search query parameter 'q'.",
      });
    }
 
    // Pass clientId if the user is authenticated; null for anonymous searches
    const clientId = req.user?.id || null;
 
    // FIXED: Matched exact service name 'searchDruglist'
    const results = await searchService.searchDruglist(q, clientId);
 
    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("searchDrugs error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Validate and parse latitude and longitude
// Example: GET /search/nearby?lat=30.0444&lng=31.2357
const getNearbypharmacies = async (req, res) => {
  try {
    const { lat, lng } = req.body;
 
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "lat and lng query parameters are required.",
      });
    }
 
    // FIXED: Matched exact service name 'searchnearbyPharmacies'
    const pharmacies = await searchService.searchnearbyPharmacies(lat, lng);
 
    return res.status(200).json({
      success: true,
      count: pharmacies.length,
      data: pharmacies,
    });
  } catch (error) {
    if (error.message === "INVALID_COORDINATES") {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates. lat must be −90 to 90, lng must be −180 to 180.",
      });
    }
    console.error("getNearby error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Example: GET /drug/:drugId
const getDrugDetails = async (req, res) => {
  try {
    const { drugId } = req.params;
    
    // This perfectly matches the service!
    const drugDetails = await searchService.getDrugDetails(drugId);
      
      if (!drugDetails) {
        return res.status(404).json({
          success: false,
          message: "Drug not found.",
        });
      }
 
    return res.status(200).json({
      success: true,
      data: drugDetails,
    });
  } catch (error) {
    // Catching the "Drug not found" error thrown by the service
    if (error.message === "Drug not found" || error.message === "INVALID_ID") {
      return res.status(404).json({
        success: false,
        message: "Drug not found or invalid ID format.",
      });
    }
    console.error("getDrugDetails error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Get nearby pharmacies that have the drug in their inventory
// Example: GET /drug/:drugId/nearby?lat=30.0444&lng=31.2357
// searchcontroller.js
const getNearbyPharmaciesWithDrug = async (req, res) => {
  try {
    const { drugId } = req.params;
    const { lat, lng } = req.body; // ✅ GET params, not body

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "lat and lng query parameters are required.",
      });
    }

    const pharmacies = await searchService.getNearbyPharmaciesWithDrug(drugId, lat, lng);

    return res.status(200).json({
      success: true,
      count: pharmacies.length,
      data: pharmacies,
    });
  } catch (error) {
    if (error.message === "INVALID_ID") {         // ✅ added
      return res.status(400).json({
        success: false,
        message: "Invalid drug ID format.",
      });
    }
    if (error.message === "INVALID_COORDINATES") {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates. lat must be −90 to 90, lng must be −180 to 180.",
      });
    }
    console.error("getNearbyPharmaciesWithDrug error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  searchDrugs,
  getNearbypharmacies,
  getDrugDetails,
  getNearbyPharmaciesWithDrug,
};