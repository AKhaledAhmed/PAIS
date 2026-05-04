const Client = require("../models/client");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/tokens");

// ─────────────────────────────────────────────────────────────
// POST /api/auth/client/register
// ─────────────────────────────────────────────────────────────
const registerClient = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, gender, password, acceptedTerms } = req.body || {};

    const existing = await Client.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists. Please log in instead.",
      });
    }

    const client = await Client.create({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      password,
      acceptedTerms,
    });

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
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `An account with this ${field} already exists.`,
      });
    }
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/client/login
// ─────────────────────────────────────────────────────────────


const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const client = await Client.findOne({ email }).select("+password +refreshTokens");
    
    if (!client || !(await client.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const payload = { id: client._id, role: "client" };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Maintain session balance[cite: 3]
    client.refreshTokens.push(refreshToken);
    if (client.refreshTokens.length > 5) client.refreshTokens = client.refreshTokens.slice(-5);
    
    await client.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, data: { accessToken, refreshToken, user: client } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};


// ─────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────────────────────
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required." });
    }

    let decoded;
    try {
      // verifyRefreshToken is synchronous in your tokens.js
      decoded = verifyRefreshToken(refreshToken); 
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === "TokenExpiredError" ? "Refresh token expired." : "Invalid token.",
      });
    }

    // 1. Role Check: Ensure this is a client token
    if (decoded.role !== "client") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const client = await Client.findById(decoded.id).select("+refreshTokens");
    
    // 2. Reuse Detection: If token isn't in DB, it might be revoked or already used
    if (!client || !client.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, message: "Token revoked or invalid." });
    }

    // 3. Rotate Tokens: Remove old, add new
    client.refreshTokens = client.refreshTokens.filter((t) => t !== refreshToken);

    const payload = { id: client._id, role: "client" };
    const newAccessToken = signAccessToken(payload); // Synchronous
    const newRefreshToken = signRefreshToken(payload); // Synchronous

    client.refreshTokens.push(newRefreshToken);

    // 4. Limit Array Size: Keep last 5 tokens to prevent document bloating
    if (client.refreshTokens.length > 5) {
      client.refreshTokens = client.refreshTokens.slice(-5);
    }

    await client.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      data: { 
        accessToken: newAccessToken, 
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" 
      },
    });
  } catch (error) {
    console.error("refreshAccessToken error:", error); // Logs actual error to terminal
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────
const logoutClient = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: "Refresh token is required to log out." 
      });
    }

    let decoded;
    try {
      // verifyRefreshToken is synchronous in your tokens.js
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      // If the token is already invalid or expired, the user is effectively 
      // logged out already, so we return a 200 success.
      return res.status(200).json({ success: true, message: "Logged out." });
    }

    // Optional but recommended: Ensure the token belongs to a client
    if (decoded.role !== "client") {
      return res.status(403).json({ success: false, message: "Invalid access." });
    }

    // Find the client and retrieve the hidden refreshTokens array
    const client = await Client.findById(decoded.id).select("+refreshTokens");
    
    if (client) {
      // Remove only the specific token used for this session
      client.refreshTokens = client.refreshTokens.filter((t) => t !== refreshToken);
      
      // CRITICAL: Ensure the Client model's pre-save hook is fixed
      await client.save({ validateBeforeSave: false });
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    // This logs the specific crash reason to your terminal
    console.error("logoutClient error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
};
// ─────────────────────────────────────────────────────────────
// GET /api/auth/client/me
// ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id);
    if (!client) {
      return res.status(404).json({ 
        success: false, 
        message: "Client profile not found." 
      });
    }
    return res.status(200).json({ 
      success: true, 
      data: client 
    });
  } catch (error) {
    console.error("getMe (client) error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error occurred while fetching profile." 
    });
  }
};

module.exports = { registerClient, loginClient, refreshAccessToken, logoutClient, getMe };