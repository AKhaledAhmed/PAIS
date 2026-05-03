require("dotenv").config(); //
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const helmet   = require("helmet"); // For setting secure HTTP headers[cite: 8]
const morgan   = require("morgan"); // For logging HTTP requests[cite: 8]

// ── Controllers ──────────────────────────────────────────────[cite: 8]
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
} = require("./controllers/admincontroller"); //[cite: 7, 8]

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

// ── Middleware ───────────────────────────────────────────────[cite: 8]
const { protect, restrictTo } = require("./middleware/auth");

// ── Validators ───────────────────────────────────────────────
const {
  validate,
  clientRegisterRules,
  clientLoginRules,
  pharmacyRegisterRules,
  pharmacyLoginRules,
  loginAdmin: adminLoginRules, // RENAME to avoid conflict with controller[cite: 6, 8]
  refreshRules, 
} = require("./utils/validators");

const app = express();

// ── Global middleware ────────────────────────────────────────[cite: 8]
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Morgan Security Fix: Redact Passwords in Logs ─────────────[cite: 8]
const SENSITIVE_FIELDS = ['password', 'confirmPassword', 'refreshToken'];
morgan.token('body', (req) => {
  if (!req.body || Object.keys(req.body).length === 0) return '';
  const bodyToLog = { ...req.body };
  SENSITIVE_FIELDS.forEach(field => {
    if (bodyToLog[field]) bodyToLog[field] = '********';
  });
  return JSON.stringify(bodyToLog);
});

if (process.env.NODE_ENV !== "production") {
  app.use(morgan(':method :url :status - :response-time ms | Body: :body'));
}

// ── Basic Route ───────────────────────────────────────────────[cite: 8]
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "PAIS API is running!" });
});

// ────────────────────────────────────────────────────────────
// AUTH ROUTES (Client, Pharmacy, Admin)[cite: 8]
// ────────────────────────────────────────────────────────────
app.post("/api/client/register", clientRegisterRules, validate, registerClient);
app.post("/api/client/login",    clientLoginRules,    validate, loginClient);
app.get( "/api/client/me",       protect, getClientMe);

app.post("/api/pharmacy/register", pharmacyRegisterRules, validate, registerPharmacy);
app.post("/api/pharmacy/login",    pharmacyLoginRules,    validate, loginPharmacy);
app.get( "/api/pharmacy/me",       protect, restrictTo("pharmacy"), getPharmacyMe);

// FIX: Added adminLoginRules and validate middleware[cite: 6, 7, 8]
app.post("/api/admin/login",   adminLoginRules, validate, loginAdmin); 
app.get( "/api/admin/me",      protect, restrictTo("admin"), getAdminMe);

// Shared / General Auth[cite: 8]
app.get( "/api/auth/me",      protect, getClientMe);
app.post("/api/auth/logout",  refreshRules, validate, logoutClient);
app.post("/api/auth/refresh", refreshRules, validate, refreshAccessToken);

// ────────────────────────────────────────────────────────────
// SEARCH & AI (Client Facing)[cite: 8]
// ────────────────────────────────────────────────────────────
app.get("/api/search",                        searchDrugs);
app.get("/api/search/nearby",                 getNearbypharmacies);
app.get("/api/search/:drugId/nearby",         getNearbyPharmaciesWithDrug);
app.get("/api/search/:drugId",                getDrugDetails);
app.get("/api/search/:drugId/alternatives",   protect, getAlternatives);

// ────────────────────────────────────────────────────────────
// DRUG MANAGEMENT (Admin)[cite: 8]
// ────────────────────────────────────────────────────────────
app.get(   "/api/drugs",      protect, restrictTo("admin"), getDrugs);
app.post(  "/api/drugs",      protect, restrictTo("admin"), upsertDrug);
app.get(   "/api/drugs/:id",  protect, restrictTo("admin"), getSingleDrug);
app.put(   "/api/drugs/:id",  protect, restrictTo("admin"), upsertDrug);
app.delete("/api/drugs/:id",  protect, restrictTo("admin"), deleteDrug);

// ────────────────────────────────────────────────────────────
// INVENTORY (Pharmacy)[cite: 8]
// ────────────────────────────────────────────────────────────
app.get( "/api/inventory/search-catalog", protect, restrictTo("pharmacy"), searchMasterCatalog);
app.get( "/api/inventory",                protect, restrictTo("pharmacy"), getMyInventory);
app.get( "/api/inventory/item/:drugId",   protect, restrictTo("pharmacy"), getInventoryItem);
app.patch( "/api/inventory/update",       protect, restrictTo("pharmacy"), updateItem);

// ────────────────────────────────────────────────────────────
// Error Handling[cite: 8]
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

// ── Database Connection ──────────────────────────────────────[cite: 8]
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ MongoDB connected");
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

module.exports = app;