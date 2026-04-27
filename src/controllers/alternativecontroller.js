const altService = require("../services/alternativeService");

/**
 * GET ALTERNATIVES
 * Fetches AI-generated alternatives for a specific drug.
 */
const getAlternatives = async (req, res) => {
  try {
    const { drugId } = req.params;

    if (!drugId) {
      return res.status(400).json({ 
        success: false, 
        message: "Drug ID is required" 
      });
    }

    // Call the service to bridge with Python
    const alternatives = await altService.fetchAlternativesFromAI(drugId);

    // Send the results back to the client
    res.status(200).json({
      success: true,
      count: alternatives.length,
      data: alternatives
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to fetch alternatives" 
    });
  }
};

module.exports = {
  getAlternatives
};