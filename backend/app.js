const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const interviewRoutes = require("./routes/interview.routes");

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
};

main().then(()=>console.log("Database Is connected...")).catch((err)=>console.log(err));


app.use("/api/interview",interviewRoutes);

module.exports = app;