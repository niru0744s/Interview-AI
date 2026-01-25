const { registerUser, loginUser } = require("../services/auth.service.js");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { token } = await registerUser({ email, password });
    res.json({ token, message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token } = await loginUser({ email, password });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}
