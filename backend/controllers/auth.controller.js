const { registerUser, loginUser, verifyUserEmail, resendVerification } = require("../services/auth.service.js");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { user } = await registerUser({ email, password });

    res.json({
      message: "Registration successful. Please check your email to verify your account.",
      user: { email: user.email }
    });
  } catch (err) {
    console.error("Registration error:", err);
    if (err.message === "User already exists") {
      return res.status(409).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser({ email, password });
    res.cookie("token", token, cookieOptions);
    res.json({ user: { email: user.email, role: user.role, isVerified: user.isVerified } });
  } catch (err) {
    if (err.message === "User Not Found!") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "Wrong Password!") {
      return res.status(401).json({ error: err.message });
    }
    if (err.message === "Email not verified") {
      return res.status(403).json({ error: "Email not verified. Please check your inbox." });
    }
    res.status(401).json({ error: err.message });
  }
}

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    console.log(`Received verification request for token: ${token}`);

    if (!token) return res.status(400).json({ error: "Invalid token" });

    const user = await verifyUserEmail(token);

    // Redirect to frontend or return success
    // res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    res.json({ message: "Email verified successfully. You can now login.", user: { email: user.email } });
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    await resendVerification(email);
    res.json({ message: "Verification email sent" });
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "User already verified") {
      return res.status(400).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    await require("../services/auth.service.js").forgotPassword(email);

    res.json({ message: "If an account exists with this email, a password reset link has been sent." });
  } catch (err) {
    if (err.message === "User not found") {
      // Don't leak user existence; return success
      return res.json({ message: "If an account exists with this email, a password reset link has been sent." });
    }
    console.error("Forgot password error:", err);
    res.status(400).json({ error: "Could not send reset email" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and new password required" });

    await require("../services/auth.service.js").resetPassword(token, password);

    res.json({ message: "Password reset successfully. You can now login." });
  } catch (err) {
    if (err.message === "Token is invalid or has expired") {
      return res.status(400).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
}

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
}

exports.switchRole = async (req, res) => {
  try {
    const user = req.user;
    user.role = user.role === "candidate" ? "recruiter" : "candidate";
    await user.save();
    res.json({ role: user.role, message: `Switched to ${user.role} role` });
  } catch (err) {
    res.status(500).json({ error: "Failed to switch role" });
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require("../models/User");

    // The pre('findOneAndDelete') hook in User model will handle cascading deletes
    const deletedUser = await User.findByIdAndDelete(userId);
    console.log("Deleted user:", deletedUser);

    res.clearCookie("token");
    res.json({ message: "Account and all associated data deleted successfully." });

  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
};
