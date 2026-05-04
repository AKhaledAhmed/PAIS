const Admin = require("../models/admin");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/tokens");

// ─────────────────────────────────────────────────────────────
// POST /api/auth/admin/login
// ─────────────────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Find admin by email ────────────────────────────────
    const admin = await Admin.findOne({ email }).select("+password +refreshTokens");
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── Verify password ────────────────────────────────────
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── Generate tokens ────────────────────────────────────
    const payload = { id: admin._id, role: "admin" };
    const accessToken =  signAccessToken(payload);
    const refreshToken =  signRefreshToken(payload);

    // ── Persist refresh token ──────────────────────────────
    admin.refreshTokens.push(refreshToken);
    if (admin.refreshTokens.length > 5) {
      admin.refreshTokens = admin.refreshTokens.slice(-5);
    }
    await admin.save({ validateBeforeSave: false });

    // ── Strip sensitive fields ─────────────────────────────
    const adminData = admin.toObject();
    delete adminData.password;
    delete adminData.refreshTokens;

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      data: {
        admin: adminData,
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
      },
    });
  } catch (error) {
    console.error("loginAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/admin/refresh
// Body: { refreshToken }
// ─────────────────────────────────────────────────────────────

const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ success: false, message: "Token required." });

    const decoded = verifyRefreshToken(refreshToken); // Synchronous call
    if (decoded.role !== "admin") return res.status(403).json({ success: false, message: "Access denied." });

    const admin = await Admin.findById(decoded.id).select("+refreshTokens");
    if (!admin || !admin.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, message: "Revoked or invalid token." });
    }

    // Token Rotation
    admin.refreshTokens = admin.refreshTokens.filter((t) => t !== refreshToken);
    const payload = { id: admin._id, role: "admin" };
    const newAccessToken = signAccessToken(payload); 
    const newRefreshToken = signRefreshToken(payload);

    admin.refreshTokens.push(newRefreshToken);
    if (admin.refreshTokens.length > 5) admin.refreshTokens = admin.refreshTokens.slice(-5);
    
    await admin.save({ validateBeforeSave: false }); // Skip validation

    res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: "Session expired." });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/admin/logout
// Body: { refreshToken }
// ─────────────────────────────────────────────────────────────
const logoutAdmin = async (req, res) => {
  try {
    // 1. Safety guard for missing body
    const { refreshToken } = req.body || {}; 

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required to log out.",
      });
    }

    let decoded;
    try {
      // verifyRefreshToken is synchronous based on your tokens.js
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      // If the token is already expired or invalid, the user is effectively 
      // logged out already. We return 200 to clear the frontend state.
      return res.status(200).json({ success: true, message: "Logged out." });
    }

    // 2. Role Verification: Ensure an admin token is being used
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Invalid token role.",
      });
    }

    // 3. Find admin and retrieve hidden tokens array
    const admin = await Admin.findById(decoded.id).select("+refreshTokens");
    
    if (admin) {
      // Remove only the specific token used for this session
      admin.refreshTokens = admin.refreshTokens.filter((t) => t !== refreshToken);
      
      // CRITICAL: This will trigger the pre("save") hook in admin.js
      // Ensure you removed "next" from that async hook to avoid a 500 error
      await admin.save({ validateBeforeSave: false });
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    // Logs the actual crash reason to your terminal for debugging
    console.error("logoutAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/auth/admin/me   (requires valid access token)
// ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin profile not found." 
      });
    }
    return res.status(200).json({ 
      success: true, 
      data: admin 
    });
  } catch (error) {
    console.error("getMe (admin) error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error occurred while fetching profile." 
    });
  }
};

module.exports = {
  loginAdmin,
  refreshAdminToken,
  logoutAdmin,
  getMe,
};