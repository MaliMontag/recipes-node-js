// קובץ בניית האפליקציה: מגדיר middlewares, נתיבים, וטיפול בשגיאות.
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const recipesRoutes = require("./routes/recipes.routes");
const categoriesRoutes = require("./routes/categories.routes");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

// נתיב בריאות בסיסי לבדיקה שהשרת פעיל.
app.get("/", (req, res) => {
  res.json({ message: "Recipes API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/categories", categoriesRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
