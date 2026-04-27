const axios = require('axios');
const Drug = require('../models/drug');

// Pull the base URL from the .env file, or default to localhost for development
const PYTHON_BASE_URL = process.env.PYTHON_API_URL || "http://localhost:8000";
const PYTHON_API_URL = `${PYTHON_BASE_URL}/drugs-management`;

// LOGIC: Get list for the table
// Note: We exclude the embedding vector here to reduce payload size
const getAllDrugsForAdmin = async () => {
    return await Drug.find().select("-embedding").sort({ name: 1 });
};

// LOGIC: Get one drug for the edit form
// Note: We include the embedding here because the edit form needs it
const getDrugById = async (id) => {
    const drug = await Drug.findById(id);
    if (!drug) throw new Error("Drug not found");
    return drug;
};

// LOGIC: Talk to Python AI and Save
// This function handles both Add (no ID) and Edit (with ID)
const saveToAiEngine = async (drugData, id = null) => {
    // Check if name exists before adding new
    if (!id) {
        const exists = await Drug.findOne({ name: drugData.name });
        if (exists) throw new Error("Drug already exists");
    }

    const url = id ? `${PYTHON_API_URL}/${id}` : `${PYTHON_API_URL}/`;
    const method = id ? 'put' : 'post';

    const response = await axios({
        method: method,
        url: url,
        data: drugData
    });

    return response.data; // This returns the drug + the embedding from Python
};

// LOGIC: Remove from DB
// Note: We also want to tell Python to remove the embedding, but for simplicity, we just delete from DB here. You can enhance this later to also call Python if needed.
const deleteFromDatabase = async (id) => {
    const result = await Drug.findByIdAndDelete(id);
    if (!result) throw new Error("Drug not found");
    return { message: "Deleted successfully" };
};

module.exports = {
    getAllDrugsForAdmin,
    getDrugById,
    saveToAiEngine,
    deleteFromDatabase
};