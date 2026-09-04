const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const { UnauthorizedError } = require("../utils/errors");

exports.requireAuth = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new UnauthorizedError("Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new UnauthorizedError("Invalid token"));
    }

    // Lazy sync: check if paid plan has expired in real-time
    if (user.plan !== "free" && user.planExpiresAt && new Date(user.planExpiresAt) <= new Date()) {
      if (user.plan === "ultimate") {
        user.credits = 500;
      }
      user.plan = "free";
      user.planExpiresAt = null;
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
