require('dotenv').config();
const nodemailer = require("nodemailer");

console.log("Email:", process.env.EMAIL);
console.log("Pass length:", process.env.APP_PASS ? process.env.APP_PASS.length : "undefined");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASS,
    },
});

async function main() {
    try {
        console.log("Sending...");
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: process.env.EMAIL, // Send to self
            subject: "Test Email from Interview AI",
            text: "If you receive this, Nodemailer is configured correctly.",
        });
        console.log("Message sent: %s", info.messageId);
    } catch (err) {
        console.error("Error occurred:", err);
    }
}

main();
