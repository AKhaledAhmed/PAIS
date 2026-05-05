const mongoose = require("mongoose");
const Drug = require("../models/drug");
const Pharmacy = require("../models/pharmacy");
const Inventory = require("../models/inventory");
const SearchLog = require("../models/SearchLog"); // ✅ ADDED THIS IMPORT
const { getDistrictFromCoords } = require("../utils/locationHelper");

// ── Helper: clean Arabic text and remove diacritics ─────────
const cleanQuery = (text) => {
  if (!text) return "";
  let cleaned = text.toString().trim().toLowerCase();

  cleaned = cleaned.replace(/[\u064B-\u0652]/g, ""); 
  cleaned = cleaned.replace(/[أإآ]/g, "ا");          
  cleaned = cleaned.replace(/[ى]/g, "ي");
  cleaned = cleaned.replace(/[هة]/g, "ه"); 

  return cleaned;
};

// ── Helper: Validate and Parse Coordinates ─────────
const validateCoords = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error("Invalid coordinates provided.");
  }
  return { latitude, longitude };
};

// ── Search Functionality (MERGED) ────────────────────────────

const searchDruglist = async (query, clientId, lat, lng) => {
  const cleanedQuery = cleanQuery(query);
  
  // 1. Fetch drugs from the database[cite: 5]
  const results = await Drug.find({
    $or: [
      { name: { $regex: cleanedQuery, $options: "i" } },
      { name_en: { $regex: cleanedQuery, $options: "i" } }
    ],
  }).limit(20).lean(); 

  // 2. Log the search with location data if available
  if (lat && lng) {
    // We don't 'await' this because we want to return results to the user immediately
    getDistrictFromCoords(lat, lng)
      .then(districtName => {
        return SearchLog.create({
          query: cleanedQuery,
          clientId,
          location: { type: "Point", coordinates: [lng, lat] }, // Standard GeoJSON
          district: districtName, 
          resultCount: results.length
        });
      })
      .catch(err => console.error("Logging Error:", err.message));
  }

  return results;
};

// ── Search Nearby Pharmacies ─────────────────────────────────

const searchnearbyPharmacies = async (lat, lng, clientId = null) => {
  const { latitude, longitude } = validateCoords(lat, lng);

  const pharmacies = await Pharmacy.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude], // GeoJSON order: [lng, lat]
        },
        distanceField: "distanceMeters",
        maxDistance: 5000,             // 5 km radius
        spherical: true,
      },
    },
    {
      $lookup: {
        from: "inventories",
        localField: "_id",
        foreignField: "pharmacyId",
        as: "inventory",
      },
    },
    {
      $addFields: {
        hasInventory: { $gt: [{ $size: "$inventory" }, 0] },
      },
    },
    {
      $match: { hasInventory: true },
    },
    {
      $project: {
        pharmacyName: 1,
        address: 1,
        pharmacyPhone: 1, // ✅ FIXED: Changed from 'phone' to 'pharmacyPhone' to match your schema
        location: 1,
        distanceMeters: 1,
      },
    },
  ]);

  getDistrictFromCoords(latitude, longitude)
    .then(districtName => {
      return SearchLog.create({
        query: "BROWSE_NEARBY",
        clientId,
        location: { type: "Point", coordinates: [longitude, latitude] },
        district: districtName,
        resultCount: pharmacies.length
      });
    })
    .catch(err => console.error("Logging Error:", err.message));

  return pharmacies;
};

// ── View selected drug details ───────────────────────────────
const getDrugDetails = async (drugId, lat, lng, clientId = null) => {
  // 1. Safety Check
  if (!mongoose.Types.ObjectId.isValid(drugId)) {
    throw new Error("INVALID_ID");
  }

  // 2. Fetch the drug details quickly
  const drug = await Drug.findById(drugId).lean();
  
  if (!drug) {
    throw new Error("Drug not found");
  }

  // 3. 🧠 SILENT ANALYTICS: Track the "View" event
  if (lat && lng) {
    getDistrictFromCoords(lat, lng)
      .then(districtName => {
        return SearchLog.create({
          // ✅ We add "VIEW_DRUG: " so your AI knows they clicked it, not just searched it!
          query: `VIEW_DRUG: ${drug.name}`, 
          clientId,
          location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          district: districtName,
          resultCount: 1 // They successfully viewed 1 item
        });
      })
      .catch(err => console.error("Logging Error:", err.message));
  }

  return drug;
};



// ── Get pharmacies that have a specific drug ──────────────────
const getNearbyPharmaciesWithDrug = async (drugId, lat, lng, clientId = null) => {
  if (!mongoose.Types.ObjectId.isValid(drugId)) throw new Error("INVALID_ID");

  const { latitude, longitude } = validateCoords(lat, lng);

  const pharmacies = await Pharmacy.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [longitude, latitude] },
        distanceField: "distanceMeters",
        maxDistance: 5000,
        query: { status: "approved" },
        spherical: true,
      },
    },
    {
      $lookup: {
        from: "inventories",
        let: { pharmacyId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$pharmacyId", "$$pharmacyId"] },
                  { $eq: ["$drugId", new mongoose.Types.ObjectId(drugId)] },
                  { $eq: ["$inStock", true] },
                ],
              },
            },
          },
        ],
        as: "matchingInventory",
      },
    },
    {
      $match: { "matchingInventory.0": { $exists: true } },
    },
    {
      $project: {
        _id: 1,
        pharmacyName: 1,
        address: 1,
        pharmacyPhone: 1,
        coordinates: "$location.coordinates",
        distanceMeters: { $round: ["$distanceMeters", 0] },
        price: { $arrayElemAt: ["$matchingInventory.price", 0] },
      },
    },
  ]);

  getDistrictFromCoords(latitude, longitude)
    .then(districtName => {
      return SearchLog.create({
        query: `CHECK_STOCK: ${drugId}`, 
        clientId,
        location: { type: "Point", coordinates: [longitude, latitude] },
        district: districtName,
        resultCount: pharmacies.length // 0 here means a massive supply gap in this district!
      });
    })
    .catch(err => console.error("Logging Error:", err.message));

  return pharmacies;
};
module.exports = {
  searchDruglist,
  searchnearbyPharmacies,
  getDrugDetails,
  getNearbyPharmaciesWithDrug
};