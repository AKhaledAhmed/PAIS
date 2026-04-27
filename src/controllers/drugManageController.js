const drugService = require('../services/drugmanageService');

// HANDLER: Send table data to frontend
const getDrugs = async (req, res) => {
    try {
        const drugs = await drugService.getAllDrugsForAdmin();
        res.status(200).json(drugs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// HANDLER: Send single drug data for the edit page
const getSingleDrug = async (req, res) => {
    try {
        const drug = await drugService.getDrugById(req.params.id);
        res.status(200).json(drug);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

// HANDLER: Process the "Add" or "Edit" form submission
const upsertDrug = async (req, res) => {
    try {
        const result = await drugService.saveToAiEngine(req.body, req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// HANDLER: Process the delete button click
const deleteDrug = async (req, res) => {
    try {
        const result = await drugService.deleteFromDatabase(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getDrugs,
    getSingleDrug,
    upsertDrug,
    deleteDrug
};