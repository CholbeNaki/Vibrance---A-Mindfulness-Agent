const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");


dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

const uploadsRoot = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsRoot, { recursive: true });
app.use("/uploads", express.static(uploadsRoot));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/reminder", require("./routes/reminderRoutes"));
app.use("/api/meditations", require("./routes/meditationRoutes"));
app.use("/api/journal", require("./routes/journalRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/articles", require("./routes/articleRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/integrations", require("./routes/integrationRoutes"));
app.use("/api/home", require("./routes/homeRoutes"));

app.get("/", (req, res) => {
  res.send("Vibrance API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));