const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const logger = require("./utils/logger");

const interviewRoutes = require("./routes/interview.routes");
const userAuth = require("./routes/auth.routes");
const templateRoutes = require("./routes/template.routes");

// Trust Proxy for Render
app.set('trust proxy', 1);

// Request logging (MUST BE FIRST)
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});

// CORS (MUST BE BEFORE OTHER MIDDLEWARE)
app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins that have withCredentials: true
        // This mirrors the origin back to the client
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Authorization'],
    optionsSuccessStatus: 200
}));

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cookieParser());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api/", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
};

main().then(() => logger.info("Database Is connected...")).catch((err) => logger.error(err));


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
