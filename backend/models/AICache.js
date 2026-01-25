const mongoose = require("mongoose");

const aiCacheSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    type: {
        type: String, // 'question' or 'evaluation'
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        index: { expires: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model("AICache", aiCacheSchema);
