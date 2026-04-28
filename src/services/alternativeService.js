const axios = require("axios");

// Your Python server URL
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

/**
 * FETCH AI ALTERNATIVES
 * Calls the Python FastAPI to get similar drugs using Vector Search.
 *
 * @param {string} drugId  - MongoDB ObjectId of the target drug
 * @param {number} topK    - How many results to return (default 5)
 */
const fetchAlternativesFromAI = async (drugId, topK = 5) => {
  try {
    // FIX: Forward top_k so the caller can control result count.
    // Previously it was hardcoded in Python and never passed from Node.
    const response = await axios.get(
      `${PYTHON_API_URL}/drugs-alternatives/${drugId}/`,
      { params: { top_k: topK } }
    );

    return response.data;
  } catch (error) {
    // FIX: Preserve the original error detail instead of swallowing it.
    // A timeout looks different from a 404, which looks different from a crash.
    const status  = error.response?.status;
    const detail  = error.response?.data?.detail;

    console.error(
      `[AlternativeService] Python AI error — status: ${status ?? "no response"}, detail: ${detail ?? error.message}`
    );

    // Surface a cleaner message upward, but keep status context
    const userMessage =
      status === 400 ? "Invalid drug ID supplied to AI engine."
      : status === 404 ? "Drug not found in AI engine."
      : "AI Recommendation Engine is currently unavailable.";

    throw new Error(userMessage);
  }
};

module.exports = {
  fetchAlternativesFromAI,
};