const Client = require("../models/client");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/tokens");

// ─────────────────────────────────────────────────────────────
// POST /api/auth/client/register
// ─────────────────────────────────────────────────────────────
const registerClient = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, gender, password, acceptedTerms } = req.body || {}; //

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
      gender: gender === true || gender === "true",
      password,
      acceptedTerms: acceptedTerms === true || acceptedTerms === "true",
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
    const { email, password } = req.body || {}; //

    const client = await Client.findOne({ email }).select("+password +refreshTokens");
    if (!client || !(await client.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const payload = { id: client._id, role: "client" };
    // Fixed: Ensure these are awaited
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    client.refreshTokens.push(refreshToken);
    if (client.refreshTokens.length > 5) {
      client.refreshTokens = client.refreshTokens.slice(-5);
    }
    await client.save({ validateBeforeSave: false });

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
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────────────────────
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body || {}; //

    let decoded;
    try {
      // Fixed: Added await
      decoded = await verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === "TokenExpiredError" ? "Expired." : "Invalid.",
      });
    }

    const client = await Client.findById(decoded.id).select("+refreshTokens");
    if (!client || !client.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, message: "Revoked token." });
    }

    client.refreshTokens = client.refreshTokens.filter((t) => t !== refreshToken);

    const payload = { id: client._id, role: "client" };
    // Fixed: Added await
    const newAccessToken = await signAccessToken(payload);
    const newRefreshToken = await signRefreshToken(payload);

    client.refreshTokens.push(newRefreshToken);
    await client.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    console.error("refreshAccessToken error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────
const logoutClient = async (req, res) => {
  try {
    const { refreshToken } = req.body || {}; //

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Token required." });
    }

    let decoded;
    try {
      // Fixed: Added await
      decoded = await verifyRefreshToken(refreshToken);
    } catch {
      return res.status(200).json({ success: true, message: "Logged out." });
    }

    const client = await Client.findById(decoded.id).select("+refreshTokens");
    if (client) {
      client.refreshTokens = client.refreshTokens.filter((t) => t !== refreshToken);
      await client.save({ validateBeforeSave: false });
    }

    return res.status(200).json({ success: true, message: "Logged out." });
  } catch (error) {
    console.error("logoutClient error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const getMe = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id);
    if (!client) return res.status(404).json({ success: false, message: "Not found." });
    return res.status(200).json({ success: true, data: client });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { registerClient, loginClient, refreshAccessToken, logoutClient, getMe };