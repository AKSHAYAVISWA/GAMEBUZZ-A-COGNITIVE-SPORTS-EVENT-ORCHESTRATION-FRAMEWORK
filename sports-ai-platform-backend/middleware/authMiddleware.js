const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Token format: "Bearer <token>"
    const actualToken = token.split(" ")[1];
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    // ✅ FETCH FULL USER FROM DB
    const user = await User.findById(decoded.userId || decoded.id);
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = user; // ✅ MONGOOSE DOCUMENT (HAS signature)
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Role-based access
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ msg: "Access denied: Insufficient role" });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };
