require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const helmet   = require("helmet");
const morgan   = require("morgan");

// ── Controllers ──────────────────────────────────────────────
const {
  registerClient,
  loginClient,
  refreshAccessToken,
  logoutClient,
  getMe: getClientMe,
} = require("./controllers/clientcontroller");

const {
  registerPharmacy,
  loginPharmacy,
  logoutPharmacy,
  getMe: getPharmacyMe,
} = require("./controllers/pharmacycontroller");

const {
  loginAdmin,
  refreshAdminToken,
  logoutAdmin,
  getMe: getAdminMe,
} = require("./controllers/admincontroller");

const {
  searchDrugs,
  getNearbypharmacies,
  getDrugDetails,
  getNearbyPharmaciesWithDrug,
} = require("./controllers/searchcontroller");

const {
  getDrugs,
  getSingleDrug,
  upsertDrug,
  deleteDrug,
} = require("./controllers/drugManageController");

const {
  searchMasterCatalog,
  getMyInventory,
  getInventoryItem,
  updateItem
} = require("./controllers/inventorycontroller");

const { getAlternatives } = require("./controllers/alternativecontroller");

// ── Middleware ───────────────────────────────────────────────
const { protect, restrictTo } = require("./middleware/auth");

// ── Validators ───────────────────────────────────────────────
const {
  validate,
  clientRegisterRules,
  clientLoginRules,
  pharmacyRegisterRules,
  pharmacyLoginRules,
  refreshRules, // Ensure this is imported for token routes
} = require("./utils/validators");

const app = express();

// ── Global middleware ────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// ── Basic Route ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "PAIS API is running!" });
});

// ────────────────────────────────────────────────────────────
// AUTH ROUTES (Client, Pharmacy, Admin)
// ────────────────────────────────────────────────────────────
app.post("/api/client/register", clientRegisterRules, validate, registerClient);
app.post("/api/client/login",    clientLoginRules,    validate, loginClient);
app.get( "/api/client/me",       protect, getClientMe);

app.post("/api/pharmacy/register", pharmacyRegisterRules, validate, registerPharmacy);
app.post("/api/pharmacy/login",    pharmacyLoginRules,    validate, loginPharmacy);
app.get( "/api/pharmacy/me",       protect, restrictTo("pharmacy"), getPharmacyMe);

app.post("/api/admin/login",   loginAdmin);
app.get( "/api/admin/me",      protect, restrictTo("admin"), getAdminMe);

// Shared / General Auth
app.get( "/api/auth/me",      protect, getClientMe);

// EDITED: Added validation to logout to prevent crashes on undefined req.body
app.post("/api/auth/logout",  refreshRules, validate, logoutClient);

// EDITED: Added missing refresh token route
app.post("/api/auth/refresh", refreshRules, validate, refreshAccessToken);

// ────────────────────────────────────────────────────────────
// SEARCH & AI
// ────────────────────────────────────────────────────────────
app.get("/api/search",                        searchDrugs);
app.get("/api/search/nearby",                 getNearbypharmacies);
app.get("/api/search/:drugId/nearby",         getNearbyPharmaciesWithDrug);
app.get("/api/search/:drugId/alternatives",   protect, getAlternatives);
app.get("/api/search/:drugId",                getDrugDetails);

// ────────────────────────────────────────────────────────────
// DRUG MANAGEMENT (Admin)
// ────────────────────────────────────────────────────────────
app.get(   "/api/drugs",      protect, restrictTo("admin"), getDrugs);
app.post(  "/api/drugs",      protect, restrictTo("admin"), upsertDrug);
app.get(   "/api/drugs/:id",  protect, restrictTo("admin"), getSingleDrug);
app.put(   "/api/drugs/:id",  protect, restrictTo("admin"), upsertDrug);
app.delete("/api/drugs/:id",  protect, restrictTo("admin"), deleteDrug);

// ────────────────────────────────────────────────────────────
// INVENTORY (Pharmacy)
// ────────────────────────────────────────────────────────────
app.get(   "/api/inventory",        protect, restrictTo("pharmacy"), getMyInventory);
app.patch( "/api/inventory/update", protect, restrictTo("pharmacy"), updateItem);

// ────────────────────────────────────────────────────────────
// Error Handling
// ────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ MongoDB connected");
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

module.exports = app;