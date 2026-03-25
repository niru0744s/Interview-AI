const mongoose = require("mongoose");
const logger = require("../utils/logger");

let hasConnected = false;

const connectDB = async () => {
  if (hasConnected) {
    return mongoose.connection;
  }

  await mongoose.connect(process.env.MONGO_URL);
  hasConnected = true;
  logger.info("Database connected");
  return mongoose.connection;
};

const disconnectDB = async () => {
  if (!hasConnected) {
    return;
  }

  await mongoose.connection.close();
  hasConnected = false;
  logger.info("Database connection closed");
};

module.exports = {
  connectDB,
  disconnectDB,
};
