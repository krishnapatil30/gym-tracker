const express = require("express");
const pool = require("../db/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const workouts = await pool.query(
            `SELECT COUNT(*) AS total_workouts
             FROM workouts
             WHERE user_id = $1`,
            [userId]
        );

        const exercises = await pool.query(
            `SELECT COUNT(*) AS total_exercises
             FROM workout_sets ws
             JOIN workouts w ON ws.workout_id = w.id
             WHERE w.user_id = $1`,
            [userId]
        );

        const volume = await pool.query(
            `SELECT COALESCE(SUM(ws.weight * ws.reps), 0) AS total_volume
             FROM workout_sets ws
             JOIN workouts w ON ws.workout_id = w.id
             WHERE w.user_id = $1`,
            [userId]
        );

        const thisWeek = await pool.query(
            `SELECT COUNT(*) AS workouts_this_week
             FROM workouts
             WHERE user_id = $1
             AND workout_date >= CURRENT_DATE - INTERVAL '6 days'
             AND workout_date <= CURRENT_DATE`,
            [userId]
        );

        res.json({
            total_workouts: Number(workouts.rows[0].total_workouts),
            total_exercises_performed: Number(exercises.rows[0].total_exercises),
            total_volume: Number(volume.rows[0].total_volume),
            workouts_this_week: Number(thisWeek.rows[0].workouts_this_week)
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to load dashboard"
        });
    }
});

module.exports = router;