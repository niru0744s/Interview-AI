const express = require("express");
const app = express();
app.set('trust proxy', 1);
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const logger = require("./utils/logger");

const interviewRoutes = require("./routes/interview.routes");
const userAuth = require("./routes/auth.routes");
const templateRoutes = require("./routes/template.routes");

// CORS (Allow dynamic origin with credentials)
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Length', 'Authorization'],
    optionsSuccessStatus: 200,
    maxAge: 86400 // Cache preflight response for 24 hours
}));

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cookieParser());

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api/", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection (Moved to bottom of middleware setup to avoid blocking)
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        logger.info("Database Is connected...");
    } catch (err) {
        logger.error("Database connection error:", err);
    }
};
connectDB();

app.use("/api/interview", interviewRoutes);
app.use("/api/auth", userAuth);
app.use("/api/templates", templateRoutes);

// Centralized Error Handling
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message
    });
});

module.exports = app;
