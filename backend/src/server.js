require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db/db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const progressRoutes = require("./routes/progressRoutes");
const streakRoutes = require("./routes/streakRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/streak", streakRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Gym Tracker API is running" });
});

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected",
            time: result.rows[0].now
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});
app.get("/api/profile", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email FROM users WHERE id = $1",
            [req.user.id]
        );

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get profile"
        });
    }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});