const express = require("express");
const app = express();
app.set('trust proxy', 1);
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const logger = require("./utils/logger");

const interviewRoutes = require("./routes/interview.routes");
const userAuth = require("./routes/auth.routes");
const templateRoutes = require("./routes/template.routes");
const paymentRoutes = require("./routes/payment.routes");

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Length', 'Authorization'],
    optionsSuccessStatus: 200,
    maxAge: 86400
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cookieParser());

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api/", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/interview", interviewRoutes);
app.use("/api/auth", userAuth);
app.use("/api/templates", templateRoutes);
app.use("/api/payment", paymentRoutes);

// Centralized Error Handling
app.use((err, req, res, next) => {
    logger.error("Request failed", {
        status: err.status || 500,
        message: err.message,
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        stack: err.stack,
        details: err.details,
    });
    const status = err.status || 500;
    const errorMessage =
        process.env.NODE_ENV === "production" && status >= 500
            ? "Internal Server Error"
            : err.message;

    res.status(err.status || 500).json({
        error: errorMessage
    });
});

module.exports = app;
