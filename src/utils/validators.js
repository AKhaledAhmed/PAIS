const { body, validationResult } = require("express-validator");

// ── Reusable middleware: collect and return validation errors ──
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Client Registration Rules ──────────────────────────────
const clientRegisterRules = [
  body("firstName")
    .trim()
    .notEmpty().withMessage("First name is required")
    .isLength({ max: 50 }).withMessage("First name must be under 50 characters"),

  body("lastName")
    .trim()
    .notEmpty().withMessage("Last name is required")
    .isLength({ max: 50 }).withMessage("Last name must be under 50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^\+?[0-9\s\-().]{7,20}$/).withMessage("Must be a valid phone number"),

  body("age")
    .notEmpty().withMessage("Age is required")
    .isInt({ min: 1, max: 120 }).withMessage("Age must be between 1 and 120"),

  body("gender")
    .notEmpty().withMessage("Gender is required")
    .isBoolean().withMessage("Gender must be a boolean (true = male, false = female)"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain at least one special character"),

  body("confirmPassword")
    .notEmpty().withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  body("acceptedTerms")
    .notEmpty().withMessage("You must accept the terms and conditions")
    .isBoolean().withMessage("acceptedTerms must be a boolean")
    .custom((value) => {
      if (value !== true && value !== "true") {
        throw new Error("You must accept the terms and conditions");
      }
      return true;
    }),

  // ── Location fields: accepted from frontend, never saved to DB ──
  body("lat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a number between -90 and 90"),

  body("lng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a number between -180 and 180"),
];

// ── Pharmacy Registration Rules ───────────────────────────
const pharmacyRegisterRules = [
  body("pharmacyName")
    .trim()
    .notEmpty().withMessage("Pharmacy name is required")
    .isLength({ max: 100 }).withMessage("Pharmacy name must be under 100 characters"),

  body("ownerName")
    .trim()
    .notEmpty().withMessage("Owner name is required")
    .isLength({ max: 100 }).withMessage("Owner name must be under 100 characters"),

  body("location")
    .trim()
    .notEmpty().withMessage("Location is required")
    .isLength({ max: 200 }).withMessage("Location must be under 200 characters"),

  body("licenseId")
    .trim()
    .notEmpty().withMessage("License ID is required")
    .isLength({ max: 50 }).withMessage("License ID must be under 50 characters"),

  body("pharmacyEmail")
    .trim()
    .notEmpty().withMessage("Pharmacy email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("pharmacyPhone")
    .trim()
    .notEmpty().withMessage("Pharmacy phone number is required")
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage("Please enter a valid phone number in E.164 format"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),

  // ── Coordinates from Geoapify map picker ──────────────────
  body("lat")
    .notEmpty().withMessage("Latitude is required (pick a location on the map)")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a number between -90 and 90"),

  body("lng")
    .notEmpty().withMessage("Longitude is required (pick a location on the map)")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a number between -180 and 180"),

  body("acceptedTerms")
    .notEmpty().withMessage("You must accept the terms and conditions")
    .isBoolean().withMessage("acceptedTerms must be a boolean")
    .custom((value) => {
      if (value !== true && value !== "true") {
        throw new Error("You must accept the terms and conditions");
      }
      return true;
    }),
];

// ── Client Login Rules ────────────────────────────────────
const clientLoginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

// ── Pharmacy Login Rules ──────────────────────────────────
const pharmacyLoginRules = [
  body("pharmacyEmail")
    .trim()
    .notEmpty().withMessage("Pharmacy email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

// ── Admin Login Rules ─────────────────────────────────────
const loginAdmin = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required"),

  body("password")
    .notEmpty().withMessage("Password is required"),
];
// ── Refresh Token Rules ───────────────────────────────────
const refreshRules = [
  body("refreshToken")
    .notEmpty().withMessage("Refresh token is required"),
];

module.exports = {
  validate,
  clientRegisterRules,
  pharmacyRegisterRules,
  clientLoginRules,
  pharmacyLoginRules,
  loginAdmin,
  refreshRules,
};