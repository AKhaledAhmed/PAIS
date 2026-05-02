const Inventory = require("../models/inventory");
const StockUpdateLog = require("../models/stockupdateLog"); 

//--------------------------------------------------------------------------------
 /* 1. GET PHARMACY INVENTORY
 * Fetches a specific pharmacy's inventory and populates the master drug details.*/
//--------------------------------------------------------------------------------
const getPharmacyInventory = async (pharmacyId, searchTerm = "") => {
  // Filter strictly to the logged-in pharmacy's ID
  let query = { pharmacyId: pharmacyId };

  // Fetch the inventory records and merge in the Master Drug catalog info
  const inventory = await Inventory.find(query)
    .populate({
      path: 'drugId', // This pulls data from the main Drug collection
      select: 'name category dosageForm composition imageUrl'
    });

  // If a search term is provided, filter the results
  if (searchTerm) {
    return inventory.filter(item => 
      item.drugId && item.drugId.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return inventory;
};

//-------------------------------------------------------------------------------
 /* 2. UPDATE OR ADD INVENTORY ITEM (MERGED WITH AUDIT LOGGING)
 * Updates an existing stock record or creates a new one (upsert).
 * Logs any changes to inventory items for auditing purposes.*/
//-------------------------------------------------------------------------------
const updateInventoryItem = async (pharmacyId, drugId, updateData) => {
  const { stockQuantity, price, notes } = updateData;

  // 1. Fetch old data to calculate changes for the audit log
  let item = await Inventory.findOne({ pharmacyId, drugId });
  const oldQuantity = item ? item.stockQuantity : 0;
  const oldPrice = item ? item.price : 0;

  // Auto-calculate inStock status before saving
  const inStock = stockQuantity > 0;

  // 2. Perform upsert (handles both "Add" and "Edit")
  const updatedItem = await Inventory.findOneAndUpdate(
    { pharmacyId, drugId },
    {
      $set: {
        stockQuantity,
        price,
        notes,
        inStock, 
      }
    },
    { 
      upsert: true,         // Creates a new document if it doesn't exist yet
      new: true,            // Returns the newly updated document
      runValidators: true   // Forces Mongoose to check your min: 0 rules
    } 
  );

  // 3. 🛡️ Log for Admin Audit Trail 🛡️
  // Only create a log if the numbers actually changed
  if (oldQuantity !== stockQuantity || oldPrice !== price) {
    try {
      await StockUpdateLog.create({
        pharmacyId,
        drugId,
        oldQuantity,
        newQuantity: stockQuantity,
        oldPrice,
        newPrice: price,
      });
    } catch (logError) {
      console.error("Failed to save StockUpdateLog:", logError.message);
    }
  }

  return updatedItem;
};

module.exports = {
  getPharmacyInventory,
  updateInventoryItem
};