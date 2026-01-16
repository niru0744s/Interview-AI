require("dotenv").config({quiet:true});
const app = require("./app");
const http = require("http");
const {Server} = require("socket.io");
const initSocket = require("./config/socket");

const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: "*"
    }
});

initSocket(io);

app.listen(process.env.PORT,(req,res)=>{
    console.log(`App is listening to port ${process.env.PORT}`);
});