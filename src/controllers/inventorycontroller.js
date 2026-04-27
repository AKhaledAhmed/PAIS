const inventoryService = require("../services/inventoryService");
const Drug = require("../models/drug");
const Inventory = require("../models/inventory");

/**
 * 1. SEARCH MASTER CATALOG (To find new drugs to add)
 * The pharmacy types a name in the search bar. This searches the MAIN Drug 
 * collection so they can find a drug to click "Edit/Add" on.
 */
const searchMasterCatalog = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Search the main drug database by name using Regex (case-insensitive)
    const drugs = await Drug.find({ 
      name: { $regex: query, $options: "i" } 
    }).select("name category dosageForm composition imageUrl");

    res.status(200).json({ success: true, count: drugs.length, data: drugs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 2. GET MY INVENTORY (To show the pharmacy's table/list)
 * Shows everything the pharmacy currently stocks (or previously stocked).
 */
const getMyInventory = async (req, res) => {
  try {
    const searchTerm = req.query.search || "";
    // req.user.id comes from your `protect` auth middleware
    const inventory = await inventoryService.getPharmacyInventory(req.user.id, searchTerm);
    
    res.status(200).json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 3. GET SINGLE INVENTORY ITEM (When they click "Edit")
 * Fetches the specific details so the frontend form can be pre-filled 
 * with the current price and quantity.
 */
const getInventoryItem = async (req, res) => {
  try {
    const { drugId } = req.params;
    
    let item = await Inventory.findOne({ 
      pharmacyId: req.user.id, 
      drugId: drugId 
    }).populate("drugId", "name category dosageForm");

    // If they haven't added it to their inventory yet, return empty defaults
    if (!item) {
      return res.status(200).json({
        success: true,
        data: { stockQuantity: 0, price: 0, inStock: false, notes: "" }
      });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 4. SAVE / UPDATE (When they click "Save")
 * Updates the quantity, price, and auto-calculates inStock.
 */
const updateItem = async (req, res) => {
  try {
    const { drugId, stockQuantity, price, notes } = req.body;

    // Validate inputs
    if (stockQuantity < 0 || price < 0) {
      return res.status(400).json({ success: false, error: "Values cannot be negative" });
    }

    const updated = await inventoryService.updateInventoryItem(req.user.id, drugId, {
      stockQuantity,
      price,
      notes
    });

    res.status(200).json({ 
      success: true, 
      message: "Inventory saved successfully", 
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  searchMasterCatalog,
  getMyInventory,
  getInventoryItem,
  updateItem
};