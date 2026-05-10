const dashboardService = require('../services/dashboardService');

const getPharmacyDashboard = async (req, res) => {
  // 1. Double check if req.user exists and has an ID
  const pharmacyId = req.user?._id || req.user?.id;

  if (!pharmacyId) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed: Pharmacy ID is missing."
    });
  }

  try {
    const data = await dashboardService.getDashboardAnalytics(pharmacyId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message,
      tip: "Verify that the Python FastAPI server is active on port 8000." 
    });
  }
};

module.exports = { getPharmacyDashboard };