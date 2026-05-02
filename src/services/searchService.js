const mongoose = require("mongoose");
const Drug = require("../models/drug");
const Pharmacy = require("../models/pharmacy");
const Inventory = require("../models/inventory");
const SearchLog = require("../models/SearchLog"); // ✅ ADDED THIS IMPORT

// ── Helper: clean Arabic text and remove diacritics ─────────
const cleanQuery = (text) => {
  if (!text) return "";
  let cleaned = text.toString().trim().toLowerCase();

  cleaned = cleaned.replace(/[\u064B-\u0652]/g, ""); // Remove tashkeel
  cleaned = cleaned.replace(/[أإآ]/g, "ا");          // Normalize Alef
  cleaned = cleaned.replace(/[ى]/g, "ي");            // Normalize Yaa
  cleaned = cleaned.replace(/[هة]/g, "ه");           // Normalize Taa/Haa

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
// Example: /search?q=paracetamol
const searchDruglist = async (query, clientId) => {
  const cleanedQuery = cleanQuery(query);

  // 1. Search for drugs matching the cleaned query
  const results = await Drug.find({
    $or: [
      { name: { $regex: cleanedQuery, $options: "i" } },
      { name_en: { $regex: cleanedQuery, $options: "i" } },
      { category: { $regex: cleanedQuery, $options: "i" } },
    ],
  }).lean();

  // 2. 🧠 Log for AI Demand Forecasting 🧠
  try {
    if (cleanedQuery) {
      await SearchLog.create({
        query: cleanedQuery, // Using your cleaned text for better AI stats
        clientId: clientId || null,
        results: results.map(drug => drug._id),
        resultCount: results.length
      });
    }
  } catch (logError) {
    console.error("Failed to save SearchLog:", logError.message);
  }

  return results;
};

// ── Search Nearby Pharmacies ─────────────────────────────────
// Example: /search/nearby?latitude=30.0444&longitude=31.2357
const searchnearbyPharmacies = async (lat, lng) => {
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
        query: { status: "approved" },
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
        phone: 1,
        location: 1,
        distanceMeters: 1,
      },
    },
  ]);

  return pharmacies;
};

// ── View selected drug details ───────────────────────────────
// Example: /drug/:id
const getDrugDetails = async (drugId) => {
  const drug = await Drug.findById(drugId);
  if (!drug) {
    throw new Error("Drug not found");
  }
  return drug;
};

// ── Get pharmacies that have a specific drug ──────────────────
// Example: /drug/:id/nearby?latitude=30.0444&longitude=31.2357
const getNearbyPharmaciesWithDrug = async (drugId, lat, lng) => {
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

  return pharmacies;
};

module.exports = {
  searchDruglist,
  searchnearbyPharmacies,
  getDrugDetails,
  getNearbyPharmaciesWithDrug
};