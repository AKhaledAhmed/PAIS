require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// ────────────────────────────────────────────────────────────
// 1. Controllers & Services
// ────────────────────────────────────────────────────────────
const {
  registerClient, loginClient, refreshAccessToken, logoutClient, getMe: getClientMe,
} = require("./controllers/clientcontroller");

const {
  registerPharmacy, loginPharmacy, logoutPharmacy, getMe: getPharmacyMe,
} = require("./controllers/pharmacycontroller");

const {
  loginAdmin, logoutAdmin, getMe: getAdminMe,
} = require("./controllers/admincontroller");

const {
  searchDrugs, getNearbypharmacies, getDrugDetails, getNearbyPharmaciesWithDrug,
} = require("./controllers/searchcontroller");

const {
  getDrugs, getSingleDrug, upsertDrug, deleteDrug,
} = require("./controllers/drugManageController");

const {
  searchMasterCatalog, getMyInventory, getInventoryItem, updateItem,
  getPharmacyInventoryForAdmin, bulkUpload
} = require("./controllers/inventorycontroller");

const { getAlternatives } = require("./controllers/alternativecontroller");

const {
  getPharmacies, updateStatus, notifyPharmacyProblem
} = require("./controllers/pharmacyaprovalcontroller");

const { getMyNotifications, markAsRead } = require("./controllers/notificationcontroller");

const { getPharmacyDashboard} = require("./controllers/dashboardcontroller");

const { initAutoRetrain } = require("./services/schedulerService");

// ────────────────────────────────────────────────────────────
// 2. Middleware & Utils
// ────────────────────────────────────────────────────────────
const { optionalProtect, protect, restrictTo } = require("./middleware/auth");
const {
  validate, clientRegisterRules, clientLoginRules,
  pharmacyRegisterRules, pharmacyLoginRules,
  loginAdmin: adminLoginRules, refreshRules,
} = require("./utils/validators");

const app = express();

// ────────────────────────────────────────────────────────────
// 3. Global Middleware
// ────────────────────────────────────────────────────────────
app.use(helmet());
// Replace your existing app.use(cors(...)) block with this
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan Security: Redact Passwords
const SENSITIVE_FIELDS = ['password', 'confirmPassword', 'refreshToken'];
morgan.token('body', (req) => {
  if (!req.body || Object.keys(req.body).length === 0) return '';
  const bodyToLog = { ...req.body };
  SENSITIVE_FIELDS.forEach(f => { if (bodyToLog[f]) bodyToLog[f] = '********'; });
  return JSON.stringify(bodyToLog);
});

if (process.env.NODE_ENV !== "production") {
  app.use(morgan(':method :url :status - :response-time ms | Body: :body'));
}

// ────────────────────────────────────────────────────────────
// 4. Routes
// ────────────────────────────────────────────────────────────
// NOTE: For brevity, I'm only showing a few routes here. The full code includes all routes as defined in the controllers.

// --- Auth Routes ---
app.post("/api/client/register", clientRegisterRules, validate, registerClient);
app.post("/api/client/login", clientLoginRules, validate, loginClient);
app.get("/api/client/me", protect, getClientMe);

app.post("/api/pharmacy/register", pharmacyRegisterRules, validate, registerPharmacy);
app.post("/api/pharmacy/login", pharmacyLoginRules, validate, loginPharmacy);
app.get("/api/pharmacy/me", protect, restrictTo("pharmacy"), getPharmacyMe);

app.post("/api/admin/login", adminLoginRules, validate, loginAdmin);
app.get("/api/admin/me", protect, restrictTo("admin"), getAdminMe);

app.post("/api/auth/logout", refreshRules, validate, logoutClient);
app.post("/api/auth/refresh", refreshRules, validate, refreshAccessToken);

//-────────────────────────────────────────────────────────────
// --- Search & Discovery ---
//-────────────────────────────────────────────────────────────
app.get("/api/search", optionalProtect, searchDrugs);
app.get("/api/search/nearby", optionalProtect, getNearbypharmacies);
app.get("/api/search/:drugId/nearby", optionalProtect, getNearbyPharmaciesWithDrug);
app.get("/api/search/:drugId", optionalProtect, getDrugDetails);
app.get("/api/search/:drugId/alternatives", optionalProtect, getAlternatives);

//-────────────────────────────────────────────────────────────
// --- Drug Management (Admin Only) ---
//-────────────────────────────────────────────────────────────
app.get("/api/drugs", protect, restrictTo("admin"), getDrugs);
app.post("/api/drugs", protect, restrictTo("admin"), upsertDrug);
app.get("/api/drugs/:id", protect, restrictTo("admin"), getSingleDrug);
app.put("/api/drugs/:id", protect, restrictTo("admin"), upsertDrug);
app.delete("/api/drugs/:id", protect, restrictTo("admin"), deleteDrug);

//-────────────────────────────────────────────────────────────
// --- Pharmacy Approval & Admin Actions ---
//-────────────────────────────────────────────────────────────
app.get("/api/admin/pharmacies", protect, restrictTo("admin"), getPharmacies);
app.get("/api/admin/pharmacies/:pharmacyId/inventory", protect, restrictTo("admin"), getPharmacyInventoryForAdmin);
app.patch("/api/admin/pharmacies/:id/status", protect, restrictTo("admin"), updateStatus);
app.post("/api/admin/pharmacies/:id/notify-problem", protect, restrictTo("admin"), notifyPharmacyProblem);

//-────────────────────────────────────────────────────────────
// --- Inventory Management (Pharmacy Only) ---
//-────────────────────────────────────────────────────────────
app.get("/api/inventory/search-catalog", protect, restrictTo("pharmacy"), searchMasterCatalog);
app.get("/api/inventory", protect, restrictTo("pharmacy"), getMyInventory);
app.get("/api/inventory/item/:drugId", protect, restrictTo("pharmacy"), getInventoryItem);
app.patch("/api/inventory/update", protect, restrictTo("pharmacy"), updateItem);
app.post("/api/inventory/bulk-upload", protect, restrictTo("pharmacy"), upload.single("file"), bulkUpload);

//-────────────────────────────────────────────────────────────
// --- Pharmacy Dashboard (AI Powered) ---
//-────────────────────────────────────────────────────────────
app.get("/api/dashboard", protect, restrictTo("pharmacy"), getPharmacyDashboard);

//-────────────────────────────────────────────────────────────
// --- Notifications ---
//-────────────────────────────────────────────────────────────
app.get("/api/notifications", protect, getMyNotifications);
app.patch("/api/notifications/:id/read", protect, markAsRead);

// ── 5. Error Handling ───────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});


//-──────────────────────────────────────────────────────────────
// 6. Start Server & Connect to DB
// ─────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ MongoDB Connected");
  const PORT = process.env.NODE_PORT || 3000;
  initAutoRetrain();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 API Server running on port ${PORT}`);
  });
});

module.exports = app;