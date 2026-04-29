// מודול חיבור למסד הנתונים MongoDB דרך Mongoose.
const mongoose = require("mongoose");
const env = require("./env");

// פותח חיבור למסד לאחר בדיקה שכתובת החיבור קיימת.
async function connectDB() {
  if (!env.mongoUri) {
    throw new Error("Missing MONGO_URI in environment variables.");
  }

  await mongoose.connect(env.mongoUri);
  // eslint-disable-next-line no-console
  console.log("Connected to MongoDB Atlas");
}

module.exports = connectDB;
