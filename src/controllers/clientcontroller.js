const Client = require("../models/client");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/tokens");



// ─────────────────────────────────────────────────────────────
// POST /api/auth/client/register
// ─────────────────────────────────────────────────────────────
const registerClient = async (req, res) => {
    try {
        const {firstName, lastName, email, phone, dateOfBirth, gender, password, acceptedTerms } = req.body;

    // ── Duplicate email check ──────────────────────────────
    const existing = await Client.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists. Please log in instead.",
      });
    }

    // ── Create client ──────────────────────────────────────
    const client = await Client.create({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),// Ensure it's stored as a Date object
      gender: gender === true || gender === "true",
      password,
      acceptedTerms: acceptedTerms === true || acceptedTerms === "true",
    });

    // ── Strip sensitive fields from response ───────────────
    const clientData = client.toObject();
    delete clientData.password;
    delete clientData.refreshTokens;

    return res.status(201).json({
      success: true,
      message: "Registration successful! You can now log in.",
      data: clientData,
    });
    } catch (error) {
    console.error("registerClient error:", error);
     
    // Mongoose duplicate key
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `An account with this ${field} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};



// ─────────────────────────────────────────────────────────────
// POST /api/auth/client/login
// ─────────────────────────────────────────────────────────────
const loginClient = async (req, res) => {
    try {
        const { email, password } = req.body;

    // ── Find client by email ───────────────────────────────
    const client = await Client.findOne({ email }).select("+password +refreshTokens");
    if (!client) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
    
    // ── Verify password ────────────────────────────────────
    const isMatch = await client.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── Generate tokens ────────────────────────────────────
    const payload = { id: client._id, role: "client" };
    // Fixed code:
const accessToken = await signAccessToken({ id: client._id, role: "client" });
const refreshToken = await signRefreshToken({ id: client._id, role: "client" });

     // ── Persist refresh token in DB ────────────────────────
    client.refreshTokens.push(refreshToken);
    // Keep only the last 5 sessions (optional: prevent unlimited growth)
    if (client.refreshTokens.length > 5) {
      client.refreshTokens = client.refreshTokens.slice(-5);
    }
    await client.save({ validateBeforeSave: false });

    // ── Build safe client object ───────────────────────────
    const clientData = client.toObject();
    delete clientData.password;
    delete clientData.refreshTokens;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        client: clientData,
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      },
    });
  } catch (error) {
    console.error("loginClient error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};



// ─────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// Body: { refreshToken }
// ─────────────────────────────────────────────────────────────
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // ── Verify token signature & expiry ───────────────────
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === "TokenExpiredError"
          ? "Refresh token has expired. Please log in again."
          : "Invalid refresh token.",
      });
    }

    // ── Check token exists in DB (rotation / revocation) ──
    const client = await Client.findById(decoded.id).select("+refreshTokens");
    if (!client || !client.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or has been revoked. Please log in again.",
      });
    }

    // ── Rotate: remove old token, issue new pair ───────────
    client.refreshTokens = client.refreshTokens.filter((t) => t !== refreshToken);

    const payload = { id: client._id, role: "client" };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    client.refreshTokens.push(newRefreshToken);
    await client.save({ validateBeforeSave: false });

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
    console.error("refreshAccessToken error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};



// ─────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Body: { refreshToken }   — invalidates that specific session
// ─────────────────────────────────────────────────────────────
const logoutClient = async (req, res) => {
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
      // Token is invalid/expired — treat as already logged out
      return res.status(200).json({ success: true, message: "Logged out." });
    }

    const client = await Client.findById(decoded.id).select("+refreshTokens");
    if (client) {
      client.refreshTokens = client.refreshTokens.filter((t) => t !== refreshToken);
      await client.save({ validateBeforeSave: false });
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("logoutClient error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};




// ─────────────────────────────────────────────────────────────
// GET /api/auth/me   (protected — needs valid access token)
// ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id);
    if (!client) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, data: client });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  registerClient,
  loginClient,
  refreshAccessToken,
  logoutClient,
  getMe,
};