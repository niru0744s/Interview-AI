const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASS?.trim(),
    },
});

exports.sendVerificationEmail = async (to, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: '"Interview AI" <' + process.env.EMAIL + '>',
        to: to,
        subject: "Verify your Interview AI account",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4F46E5;">Welcome to Interview AI!</h1>
                <p>Please click the button below to verify your email address and activate your account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                </div>
                <p style="color: #666; font-size: 14px;">If you didn't create an account, you can ignore this email.</p>
            </div>
        `,
    };

    try {
        console.log(`Attempting to send verification email to: ${to}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${to}. MessageId: ${info.messageId}`);
    } catch (error) {
        console.error("Error sending verification email detailed:", error);
        throw new Error("Could not send verification email");
    }
};

exports.sendPasswordResetEmail = async (to, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: '"Interview AI" <' + process.env.EMAIL + '>',
        to: to,
        subject: "Reset your Interview AI password",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4F46E5;">Password Reset Request</h1>
                <p>You requested to reset your password. Please click the button below to set a new password.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            </div>
        `,
    };

    try {
        console.log(`Attempting to send password reset email to: ${to}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${to}. MessageId: ${info.messageId}`);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Could not send password reset email");
    }
};
