const Razorpay = require("razorpay");

let razorpayInstance = null;

const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || "mock_key_id",
            key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_key_secret",
        });
    }
    return razorpayInstance;
};

module.exports = {
    getRazorpayInstance
};
