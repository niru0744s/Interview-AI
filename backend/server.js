require("dotenv").config({ quiet: true });
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./config/socket");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

initSocket(io);

server.listen(process.env.PORT, () => {
    console.log(`App is listening to port ${process.env.PORT}`);
});