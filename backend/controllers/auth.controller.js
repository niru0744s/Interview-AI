const {
  registerUser,
  loginUser,
  verifyUserEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require("../services/auth.service.js");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");
const { BadRequestError, NotFoundError } = require("../utils/errors");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Email and password required");
  }

  const { user } = await registerUser({ email, password });

  res.json({
    message: "Registration successful. Please check your email to verify your account.",
    user: { email: user.email }
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await loginUser({ email, password });

  res.cookie("token", token, cookieOptions);
  res.json({ user: { email: user.email, role: user.role, isVerified: user.isVerified } });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    throw new BadRequestError("Invalid token");
  }

  const user = await verifyUserEmail(token);
  res.json({ message: "Email verified successfully. You can now login.", user: { email: user.email } });
});

exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Email is required");
  }

  await resendVerification(email);
  res.json({ message: "Verification email sent" });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Email is required");
  }

  try {
    await forgotPassword(email);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.json({ message: "If an account exists with this email, a password reset link has been sent." });
    }

    logger.error("Forgot password error", { message: err.message, stack: err.stack });
    throw new BadRequestError("Could not send reset email");
  }

  res.json({ message: "If an account exists with this email, a password reset link has been sent." });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    throw new BadRequestError("Token and new password required");
  }

  await resetPassword(token, password);
  res.json({ message: "Password reset successfully. You can now login." });
});

exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.switchRole = asyncHandler(async (req, res) => {
  const user = req.user;
  user.role = user.role === "candidate" ? "recruiter" : "candidate";
  await user.save();

  res.json({ role: user.role, message: `Switched to ${user.role} role` });
});

exports.deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const User = require("../models/User");

  await User.findByIdAndDelete(userId);

  res.clearCookie("token");
  res.json({ message: "Account and all associated data deleted successfully." });
});
