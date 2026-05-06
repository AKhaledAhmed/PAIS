const inventoryService = require("../services/inventoryService");
const Drug = require("../models/drug");
const Inventory = require("../models/inventory");
const fs = require("fs");
const csv = require("csv-parser"); // You will need to run: npm install csv-parser

/**
 * 1. SEARCH MASTER CATALOG (Optimized with Text Search)
 * Searches the MAIN Drug collection using the high-performance text index.
 */
const searchMasterCatalog = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, error: "Search query is required" });
    }

    // 1. Optional: If you have a cleanQuery utility, you can use it here
    // const cleanedQuery = cleanQuery(query);
    const cleanedQuery = query.trim(); 

    // 2. Fetch drugs from the database using Regex on name and name_en
    const drugs = await Drug.find({
      $or: [
        { name: { $regex: cleanedQuery, $options: "i" } },
        { name_en: { $regex: cleanedQuery, $options: "i" } }
      ]
    })
      .limit(20) // Cap the results to keep the UI snappy
      .lean()    // Strip Mongoose overhead for faster JSON responses
      .select("name name_en category dosageForm composition imageUrl"); // Pick only what the frontend needs

    res.status(200).json({ success: true, count: drugs.length, data: drugs });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ success: false, error: "Failed to search master catalog." });
  }
};
/**
 * 2. GET MY INVENTORY
 * Shows everything the pharmacy currently stocks.
 */
const getMyInventory = async (req, res) => {
  try {
    const searchTerm = req.query.search || "";
    // req.user.id comes from your auth middleware
    const inventory = await inventoryService.getPharmacyInventory(req.user.id, searchTerm);
    
    res.status(200).json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch inventory." });
  }
};

/**
 * 3. GET SINGLE INVENTORY ITEM 
 * Fetches specific details for the frontend edit form.
 */
const getInventoryItem = async (req, res) => {
  try {
    const { drugId } = req.params;
    
    let item = await Inventory.findOne({ 
      pharmacyId: req.user.id, 
      drugId: drugId 
    }).populate("drugId", "name category dosageForm");

    // Return empty defaults if they haven't stocked it yet
    if (!item) {
      return res.status(200).json({
        success: true,
        data: { stockQuantity: 0, price: 0, inStock: false, notes: "" }
      });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch item details." });
  }
};

/**
 * 4. SAVE / UPDATE SINGLE ITEM
 * Updates quantity and price. (Triggers logs and notifications via the service).
 */
const updateItem = async (req, res) => {
  try {
    const { drugId, stockQuantity, price, notes } = req.body;

    // Validate inputs to prevent bad data
    if (stockQuantity < 0 || price < 0) {
      return res.status(400).json({ success: false, error: "Stock and price cannot be negative." });
    }

    const updated = await inventoryService.updateInventoryItem(req.user.id, drugId, {
      stockQuantity,
      price,
      notes
    });

    res.status(200).json({ 
      success: true, 
      message: "Inventory saved successfully.", 
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update inventory item." });
  }
};

/**
 * 5. BULK UPLOAD INVENTORY (CSV)
 * Reads an uploaded CSV file and updates multiple items at once.
 * Expected CSV columns: drugId, stockQuantity, price, notes
 */
const bulkUpload = async (req, res) => {
  try {
    // Requires a middleware like 'multer' on your route to handle the file upload
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Please upload a CSV file." });
    }

    const results = [];
    const errors = [];

    // Parse the CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        let updatedCount = 0;

        // Loop through each row in the CSV
        for (let row of results) {
          try {
            // Convert strings to numbers
            const stockQty = parseInt(row.stockQuantity, 10);
            const priceVal = parseFloat(row.price);

            if (isNaN(stockQty) || isNaN(priceVal) || stockQty < 0 || priceVal < 0) {
              errors.push(`Row for Drug ID ${row.drugId}: Invalid price or quantity.`);
              continue;
            }

            // Call your unified service function (this automatically handles logs and alerts!)
            await inventoryService.updateInventoryItem(req.user.id, row.drugId, {
              stockQuantity: stockQty,
              price: priceVal,
              notes: row.notes || "",
            });
            
            updatedCount++;
          } catch (rowError) {
            errors.push(`Row for Drug ID ${row.drugId}: ${rowError.message}`);
          }
        }

        // Clean up the temporarily uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
          success: true,
          message: `Bulk upload complete. ${updatedCount} items updated.`,
          errors: errors.length > 0 ? errors : null,
        });
      });
  } catch (error) {
    res.status(500).json({ success: false, error: "Bulk upload failed." });
  }
};

module.exports = {
  searchMasterCatalog,
  getMyInventory,
  getInventoryItem,
  updateItem,
  bulkUpload
};