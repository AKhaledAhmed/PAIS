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
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

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
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
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
    const { refreshToken } = req.body;

    // ── Verify token signature & expiry ───────────────────
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Refresh token has expired. Please log in again."
            : "Invalid refresh token.",
      });
    }

    // ── Ensure it belongs to an admin ──────────────────────
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    // ── Check token exists in DB ───────────────────────────
    const admin = await Admin.findById(decoded.id).select("+refreshTokens");
    if (!admin || !admin.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or has been revoked. Please log in again.",
      });
    }

    // ── Rotate tokens ──────────────────────────────────────
    admin.refreshTokens = admin.refreshTokens.filter((t) => t !== refreshToken);

    const payload = { id: admin._id, role: "admin" };
    const newAccessToken = await signAccessToken(payload);
    const newRefreshToken = await signRefreshToken(payload);

    admin.refreshTokens.push(newRefreshToken);
    await admin.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Tokens refreshed.",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      },
    });
  } catch (error) {
    console.error("refreshAdminToken error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/admin/logout
// Body: { refreshToken }
// ─────────────────────────────────────────────────────────────
const logoutAdmin = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required to log out.",
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      // Already expired — treat as logged out
      return res.status(200).json({ success: true, message: "Logged out." });
    }

    const admin = await Admin.findById(decoded.id).select("+refreshTokens");
    if (admin) {
      admin.refreshTokens = admin.refreshTokens.filter((t) => t !== refreshToken);
      await admin.save({ validateBeforeSave: false });
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
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
      return res.status(404).json({ success: false, message: "Admin not found." });
    }
    return res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.error("getMe (admin) error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  loginAdmin,
  refreshAdminToken,
  logoutAdmin,
  getMe,
};