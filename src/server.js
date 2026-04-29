// קובץ ההפעלה הראשי: טוען הגדרות, מתחבר למסד, ומרים את השרת.
const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");

// מפעיל את השרת בצורה בטוחה עם בדיקות תקינות בסיסיות.
async function start() {
  try {
    if (!env.jwtSecret) {
      throw new Error("Missing JWT_SECRET in environment variables.");
    }

    await connectDB();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on http://localhost:${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

start();
