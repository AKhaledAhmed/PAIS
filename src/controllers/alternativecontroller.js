const altService = require("../services/alternativeService");

/**
 * GET ALTERNATIVES
 * Fetches AI-generated alternatives for a specific drug.
 *
 * Query params:
 *   ?topK=5  (optional, defaults to 5)
 */
const getAlternatives = async (req, res) => {
  try {
    const { drugId } = req.params;

    // FIX: Parse topK from query string and forward it to the service.
    // Previously top_k was accepted by Python but never sent from Node.
    const topK = parseInt(req.query.topK, 10) || 5;

    if (!drugId) {
      return res.status(400).json({
        success: false,
        message: "Drug ID is required",
      });
    }

    const alternatives = await altService.fetchAlternativesFromAI(drugId, topK);

    res.status(200).json({
      success: true,
      count: alternatives.length,
      data: alternatives,
    });
  } catch (error) {
    // Surface the specific message coming from the service (400 vs 404 vs 503)
    const statusCode =
      error.message.includes("Invalid") ? 400
      : error.message.includes("not found") ? 404
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch alternatives",
    });
  }
};

module.exports = {
  getAlternatives,
};