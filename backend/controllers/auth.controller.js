const { registerUser, loginUser } = require("../services/auth.service.js");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { token, user } = await registerUser({ email, password });
    res.cookie("token", token, cookieOptions);
    res.json({
      user: { email: user.email, role: user.role },
      message: "User registered successfully"
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser({ email, password });
    res.cookie("token", token, cookieOptions);
    res.json({ user: { email: user.email, role: user.role } });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

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
