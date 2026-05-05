const { verifyAccessToken } = require("../utils/tokens");

/**
 * 🔒 Strict Protect — Requires a valid token.
 * Use for: Admin actions, Inventory management, or viewing alternatives.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token has expired. Please refresh.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid access token.",
    });
  }
};

/**
 * 🔓 Optional Protect — Identifies the user if a token exists, but allows guests.
 * Use for: Search and nearby pharmacy routes to track AI Demand.
 */
const optionalProtect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. If no Bearer token is provided, proceed as a guest
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); 
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Try to verify the token
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Attach the user info if valid
    next();
  } catch (err) {
    // 3. If token is expired or fake, we don't block them. 
    // We just treat them as a guest (req.user stays undefined).
    next();
  }
};

/**
 * 🛡️ Role Restriction — Validates user role permissions.
 */
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permission to access this resource.",
      });
    }
    next();
  };
};

// ✅ Don't forget to add optionalProtect to the exports!
module.exports = { protect, restrictTo, optionalProtect };