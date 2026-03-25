require("dotenv").config({ quiet: true });
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./config/socket");
const { connectDB, disconnectDB } = require("./config/db");
const logger = require("./utils/logger");
require("./cron/creditRefresh"); // Initialize cron jobs

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => callback(null, true),
        credentials: true
    }
});

initSocket(io);

const PORT = process.env.PORT || 5000;
let isShuttingDown = false;

const shutdown = async (signal) => {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;
    logger.info(`${signal} received. Closing server...`);

    server.close(async () => {
        try {
            await disconnectDB();
            logger.info("HTTP server closed");
            process.exit(0);
        } catch (error) {
            logger.error("Error during shutdown", { message: error.message, stack: error.stack });
            process.exit(1);
        }
    });
};

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            logger.info(`App is listening on port ${PORT}`);
        });
    } catch (error) {
        logger.error("Failed to start server", { message: error.message, stack: error.stack });
        process.exit(1);
    }
};

process.on("SIGINT", () => {
    shutdown("SIGINT");
});

process.on("SIGTERM", () => {
    shutdown("SIGTERM");
});

startServer();
