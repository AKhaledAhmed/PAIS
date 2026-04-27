const axios = require("axios");

// Your Python server URL
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

/**
 * FETCH AI ALTERNATIVES
 * Calls the Python FastAPI to get similar drugs using Vector Search.
 */
const fetchAlternativesFromAI = async (drugId) => {
  try {
    // Calls the exact route from your main.py
    const response = await axios.get(`${PYTHON_API_URL}/drugs-alternatives/${drugId}/`);
    
    // Returns the list of matching drug documents from Python
    return response.data; 
  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw new Error("AI Recommendation Engine is currently unavailable.");
  }
};

module.exports = {
  fetchAlternativesFromAI
};