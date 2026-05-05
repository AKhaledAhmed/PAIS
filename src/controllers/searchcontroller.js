const searchService = require("../services/searchService");

/**
 * 🔍 Search for drugs by name
 * GET /api/search?q=panadol&lat=30.0&lng=31.0
 */
const searchDrugs = async (req, res) => {
  try {
    const { q, lat, lng } = req.query; 
    const clientId = req.user?.id || null;

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: "Search query 'q' is required." });
    }

    // ✅ Passes all 4 parameters for the silent SearchLog
    const results = await searchService.searchDruglist(q, clientId, lat, lng);

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

/**
 * 📍 Auto-load nearby pharmacies (Home Screen)
 * GET /api/search/nearby?lat=30.0&lng=31.0
 */
const getNearbypharmacies = async (req, res) => {
  try {
    const { lat, lng } = req.query; 
    const clientId = req.user?.id || null;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "lat and lng are required." });
    }

    // ✅ Passes clientId for BROWSE_NEARBY logging
    const pharmacies = await searchService.searchnearbyPharmacies(lat, lng, clientId);

    return res.status(200).json({
      success: true,
      count: pharmacies.length,
      data: pharmacies,
    });
  } catch (error) {
    console.error("getNearby error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * 💊 View specific drug details
 * GET /api/drug/:drugId?lat=30.0&lng=31.0
 */
const getDrugDetails = async (req, res) => {
  try {
    const { drugId } = req.params;
    const { lat, lng } = req.query;
    const clientId = req.user?.id || null;
    
    // ✅ Service now takes coords to log WHICH neighborhood is viewing WHICH drug
    const drugDetails = await searchService.getDrugDetails(drugId, lat, lng, clientId);
      
    return res.status(200).json({ success: true, data: drugDetails });
  } catch (error) {
    if (error.message === "Drug not found" || error.message === "INVALID_ID") {
      return res.status(404).json({ success: false, message: "Drug not found." });
    }
    console.error("getDrugDetails error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * 🏥 Find specific stock for a drug
 * GET /api/drug/:drugId/nearby?lat=30.0&lng=31.0
 */
const getNearbyPharmaciesWithDrug = async (req, res) => {
  try {
    const { drugId } = req.params;
    // ✅ FIXED: Changed req.body to req.query
    const { lat, lng } = req.query; 
    const clientId = req.user?.id || null;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "lat and lng are required." });
    }

    // ✅ Passes clientId for CHECK_STOCK logging
    const pharmacies = await searchService.getNearbyPharmaciesWithDrug(drugId, lat, lng, clientId);

    return res.status(200).json({
      success: true,
      count: pharmacies.length,
      data: pharmacies,
    });
  } catch (error) {
    if (error.message === "INVALID_ID") {
      return res.status(400).json({ success: false, message: "Invalid drug ID." });
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