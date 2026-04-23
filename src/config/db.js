const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
  if (!env.mongoUri) {
    throw new Error("Missing MONGO_URI in environment variables.");
  }

  await mongoose.connect(env.mongoUri);
  // eslint-disable-next-line no-console
  console.log("Connected to MongoDB Atlas");
}

module.exports = connectDB;
