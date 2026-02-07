require("dotenv").config({ quiet: true });
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./config/socket");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

initSocket(io);

server.listen(process.env.PORT, () => {
    console.log(`App is listening to port ${process.env.PORT}`);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
