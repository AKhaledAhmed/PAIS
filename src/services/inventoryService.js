const Inventory = require("../models/inventory");
const Drug = require("../models/drug"); // MISSING IMPORT FIXED
const StockUpdateLog = require("../models/stockupdateLog");
const Notification = require("../models/notification");

/**
 * 1. GET PHARMACY INVENTORY (Optimized)
 * Fetches inventory items with database-side filtering for better performance.
 */
const getPharmacyInventory = async (pharmacyId, searchTerm = "") => {
  let query = { pharmacyId: pharmacyId };

  // ── OPTIMIZATION: Filter in the Database, not in memory ──
  if (searchTerm) {
    // Find drug IDs that match the search term first
    const matchingDrugs = await Drug.find({ 
      name: { $regex: searchTerm, $options: "i" } 
    }).select("_id");
    
    // Only fetch inventory records linked to those drug IDs
    query.drugId = { $in: matchingDrugs.map(d => d._id) };
  }

  return await Inventory.find(query)
    .populate({
      path: 'drugId',
      select: 'name category dosageForm composition imageUrl'
    });
};

/**
 * 2. UPDATE OR ADD INVENTORY ITEM
 * Remains strictly for Pharmacies; Admin has no access to this write operation.
 */
const updateInventoryItem = async (pharmacyId, drugId, updateData) => {
  const { stockQuantity, price, notes } = updateData;

  // ── PRICE VALIDATION: Pharmacy price must not exceed the master drug price ──
  const masterDrug = await Drug.findById(drugId).select("price name");
  if (!masterDrug) {
    throw new Error(`Drug with ID ${drugId} does not exist in the master catalog.`);
  }
  if (price > masterDrug.price) {
    throw new Error(
      `Price for "${masterDrug.name}" cannot exceed the master catalog price of ${masterDrug.price}. Provided: ${price}.`
    );
  }

  let item = await Inventory.findOne({ pharmacyId, drugId });
  const oldQuantity = item ? item.stockQuantity : 0;
  const oldPrice = item ? item.price : 0;
  const inStock = stockQuantity > 0;

  const updatedItem = await Inventory.findOneAndUpdate(
    { pharmacyId, drugId },
    { $set: { stockQuantity, price, notes, inStock } },
    { upsert: true, new: true, runValidators: true } 
  );

  // Pharmacy Audit Log (Internal)
  if (oldQuantity !== stockQuantity || oldPrice !== price) {
    try {
      await StockUpdateLog.create({
        pharmacyId, drugId, oldQuantity,
        newQuantity: stockQuantity, oldPrice, newPrice: price,
      });
    } catch (e) { console.error("StockUpdateLog failed:", e.message); }
  }

  // Low Stock Notification
  const LOW_STOCK_THRESHOLD = 10;
  if (stockQuantity <= LOW_STOCK_THRESHOLD && (oldQuantity > LOW_STOCK_THRESHOLD || !item)) {
    try {
      await updatedItem.populate('drugId', 'name'); // Requires Drug model import
      const drugName = updatedItem.drugId ? updatedItem.drugId.name : "a specific drug";

      await Notification.create({
        recipientId: pharmacyId,
        recipientModel: 'Pharmacy',
        type: 'STOCK_ALERT',
        content: `Stock Alert: You only have ${stockQuantity} units left of ${drugName}.`
      });
    } catch (e) { console.error("Notification failed:", e.message); }
  }

  return updatedItem;
};

module.exports = { getPharmacyInventory, updateInventoryItem };