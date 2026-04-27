const express = require("express");
const router = express.Router();

// ── Controller Imports ────────────────────────────────────
const {
  registerClient,
  loginClient,
  refreshAccessToken,
  logoutClient,
  getMe,
} = require("../controllers/clientcontrollers"); // Make sure file name matches your project

const { 
  registerPharmacy, 
  loginPharmacy 
} = require("../controllers/pharmacycontroller"); // Added loginPharmacy

// ── Middleware Imports ────────────────────────────────────
const {
  validate,
  clientRegisterRules,
  pharmacyRegisterRules,
  clientLoginRules,    // Updated from loginRules
  pharmacyLoginRules,  // Added for pharmacy login
  refreshRules,
} = require("../validators"); // Make sure the path points to your validators.js

const { protect } = require("../middleware/auth");

// ──────────────────────────────────────────────────────────
// ROUTES
// ──────────────────────────────────────────────────────────

// ── Client Registration ──
// POST /api/auth/client/register
router.post(
  "/client/register",
  clientRegisterRules,
  validate,
  registerClient
);

// ── Pharmacy Registration ──
// POST /api/auth/pharmacy/register
router.post(
  "/pharmacy/register",
  pharmacyRegisterRules,
  validate,
  registerPharmacy
);

// ── Client Login ──
// POST /api/auth/client/login
router.post(
  "/client/login",     // Updated from just "/login" to be specific
  clientLoginRules,    // Using the split client rule
  validate,
  loginClient
);

// ── Pharmacy Login ──
// POST /api/auth/pharmacy/login
router.post(
  "/pharmacy/login",   // Added missing route
  pharmacyLoginRules,  // Using the split pharmacy rule
  validate,
  loginPharmacy
);

// ── Refresh Access Token ──
// POST /api/auth/refresh
router.post(
  "/refresh",
  refreshRules,
  validate,
  refreshAccessToken
);

// ── Logout ──
// POST /api/auth/logout
router.post("/logout", logoutClient);

// ── Get Current Authenticated Client ──
// GET /api/auth/me   (requires Bearer access token)
router.get("/me", protect, getMe);

module.exports = router;