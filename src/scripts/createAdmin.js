const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const env = require("../config/env");
const User = require("../models/User");

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.ADMIN_USERNAME || "Admin";
  const address = process.env.ADMIN_ADDRESS || "";

  if (!env.jwtSecret || !env.mongoUri) {
    throw new Error("Missing JWT_SECRET or MONGO_URI in environment variables.");
  }

  if (!email || !password) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables.");
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  const hashedPassword = await bcrypt.hash(password, 10);

  if (existing) {
    existing.username = username;
    existing.address = address;
    existing.role = "admin";
    existing.password = hashedPassword;
    await existing.save();
    // eslint-disable-next-line no-console
    console.log("Existing user upgraded to admin.");
  } else {
    await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      address,
      role: "admin",
    });
    // eslint-disable-next-line no-console
    console.log("Admin user created.");
  }

  process.exit(0);
}

createAdmin().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to create admin:", error.message);
  process.exit(1);
});
