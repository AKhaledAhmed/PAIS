const Pharmacy = require("../models/pharmacy");
const { sendPharmacyConfirmationEmail } = require("../utils/emailMock");
const { signAccessToken, signRefreshToken } = require("../utils/tokens");
const { getCoordsFromAddress } = require("../utils/locationHelper");

// ─────────────────────────────────────────────────────────────
// POST /api/auth/pharmacy/register
// ─────────────────────────────────────────────────────────────
const registerPharmacy = async (req, res) => {
  try {
    // 1. Destructure all fields, including the missing ownerName, lat, and lng
    const { 
      pharmacyName, 
      ownerName, 
      address, 
      licenseId, 
      pharmacyPhone, // Fixed casing
      password,
      pharmacyEmail, 
      acceptedTerms,
      lat,
      lng
      
    } = req.body;


    let finalLat = lat;
    let finalLng = lng;
    if (!finalLat || !finalLng) {
      try {
        const coords = await getCoordsFromAddress(address); // The Safety Net
        finalLat = coords.lat;
        finalLng = coords.lng;
      } catch (geoError) {
        return res.status(400).json({ success: false, message: "Invalid address." });
      }
    }

    // ── Duplicate checks ───────────────────────────────────
  const existing = await Pharmacy.findOne({ 
      $or: [{ pharmacyEmail }, { licenseId }] 
    });
    
    if (existing) {
      return res.status(409).json({ success: false, message: "Email or License already exists." });
    }
    // ── Save pharmacy ──────────────────────────────────────
    const pharmacy = await Pharmacy.create({
      pharmacyName,
      ownerName,
      address, // Save the text for records
      location: {
        type: "Point",
        coordinates: [finalLng, finalLat], 
      },
      licenseId,
      pharmacyEmail,
      pharmacyPhone,
      password,
      acceptedTerms,
    });

    // ── Fire-and-forget mock email (don't block the response) ──
    let emailPreviewUrl = null;
    try {
      emailPreviewUrl = await sendPharmacyConfirmationEmail(pharmacy);
    } catch (emailErr) {
      console.error("Mock email error (non-fatal):", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Pharmacy registration received. A confirmation email has been sent. Login credentials will be provided after your application is reviewed.",
      data: {
        applicationId: pharmacy.applicationId,
        pharmacyName: pharmacy.pharmacyName,
        location: pharmacy.location,
        licenseId: pharmacy.licenseId,
        pharmacyEmail: pharmacy.pharmacyEmail,
        status: pharmacy.status,
        createdAt: pharmacy.createdAt,
        ...(emailPreviewUrl && { emailPreviewUrl }),
      },
    });
  } catch (error) {
    console.error("registerPharmacy error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const fieldLabel = field === "pharmacyEmail" ? "email address" : field === "licenseId" ? "license ID" : field;

      return res.status(409).json({
        success: false,
        message: `A pharmacy with this ${fieldLabel} is already registered.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/pharmacy/login
// ─────────────────────────────────────────────────────────────
const loginPharmacy = async (req, res) => {
  try {
    const { pharmacyEmail, password } = req.body;

    // 1. Basic validation
    if (!pharmacyEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    // 2. Find pharmacy and explicitly select the hidden password and refreshTokens
    const pharmacy = await Pharmacy.findOne({ pharmacyEmail }).select("+password +refreshTokens");
    if (!pharmacy) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. 🛑 THE APPROVAL CHECK 🛑
    // Prevent login if the admin hasn't physically validated and approved them
    if (pharmacy.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: `Login denied. Your application is currently '${pharmacy.status}'. You can log in once an admin approves it.`,
      });
    }

    // 4. Verify Password
    const isMatch = await pharmacy.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 5. Generate RBAC Tokens
    const payload = { id: pharmacy._id, role: "pharmacy" };
    const accessToken = signAccessToken(payload); 
    const refreshToken = signRefreshToken(payload); 

    // 6. Session Persistence (Sliding Window constraint)
    // Initialize the array if it doesn't exist just to be safe
    if (!pharmacy.refreshTokens) pharmacy.refreshTokens = [];
    
    pharmacy.refreshTokens.push(refreshToken);
    
    // Keep only the last 5 sessions so the array doesn't grow infinitely
    if (pharmacy.refreshTokens.length > 5) {
      pharmacy.refreshTokens = pharmacy.refreshTokens.slice(-5);
    }
    
    // Save without triggering full validation checks
    await pharmacy.save({ validateBeforeSave: false });

    // 7. Strip sensitive data before sending the response
    const pharmacyData = pharmacy.toObject();
    delete pharmacyData.password;
    delete pharmacyData.refreshTokens;

    return res.status(200).json({
      success: true,
      message: "Pharmacy logged in successfully.",
      data: {
        pharmacy: pharmacyData,
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      },
    });

  } catch (error) {
    console.error("loginPharmacy error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/pharmacy/logout
// ─────────────────────────────────────────────────────────────
const logoutPharmacy = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      // If the token is already invalid/expired, they are effectively logged out
      return res.status(200).json({ success: true, message: "Logged out." });
    }

    if (decoded.role !== "pharmacy") {
      return res.status(403).json({ success: false, message: "Invalid access." });
    }

    const pharmacy = await Pharmacy.findById(decoded.id).select("+refreshTokens"); 
    
    if (pharmacy) {
      pharmacy.refreshTokens = pharmacy.refreshTokens.filter(t => t !== refreshToken);
      await pharmacy.save({ validateBeforeSave: false }); 
    }
    
    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("logoutPharmacy error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/pharmacy/me
// ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.user.id).select("-password -refreshTokens");
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found.",
      });
    }
    res.status(200).json({ success: true, data: pharmacy });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = { registerPharmacy, loginPharmacy, logoutPharmacy, getMe };