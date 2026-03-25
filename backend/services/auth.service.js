const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User.js");
const { sendVerificationEmail } = require("./email.service");
const { ConflictError, NotFoundError, UnauthorizedError, ForbiddenError, BadRequestError } = require("../utils/errors");

const JWT_EXPIRES_IN = "7d";

exports.registerUser = async ({ email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ConflictError("User already exists");

  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    email,
    password: hashedPassword,
    verificationToken,
    isVerified: false
  });

  await sendVerificationEmail(email, verificationToken);

  return { user };
}

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("User Not Found!");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new UnauthorizedError("Wrong Password!");

  if (!user.isVerified) {
    throw new ForbiddenError("Email not verified");
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { token, user };
}

exports.verifyUserEmail = async (token) => {
  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    throw new BadRequestError("Invalid or expired verification token");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  return user;
};

exports.resendVerification = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("User not found");
  if (user.isVerified) throw new BadRequestError("User already verified");

  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.verificationToken = verificationToken;
  await user.save();

  await sendVerificationEmail(email, verificationToken);
};

exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("User not found");

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await user.save();

  await exports.sendPasswordResetEmail(email, resetToken);
};

exports.resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) throw new BadRequestError("Token is invalid or has expired");

  user.password = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return user;
};
// Helper to avoid circular dependency if email service is needed
exports.sendPasswordResetEmail = require("./email.service").sendPasswordResetEmail;
