const express = require("express");
const pool = require("../db/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:exerciseId", authMiddleware, async (req, res) => {
    try {
        const exerciseId = req.params.exerciseId;
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT 
                w.id AS workout_id,
                w.workout_date,
                ws.weight,
                ws.reps,
                (ws.weight * (1 + ws.reps / 30.0)) AS estimated_1rm
             FROM workout_sets ws
             JOIN workouts w ON ws.workout_id = w.id
             WHERE ws.exercise_id = $1
             AND w.user_id = $2
             ORDER BY w.workout_date DESC, ws.weight DESC`,
            [exerciseId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No progress data found"
            });
        }

        const current = result.rows[0];

        const previous = result.rows.find(
            row => row.workout_id !== current.workout_id
        );

        let status = "→ Maintained";

        if (previous) {
            if (Number(current.estimated_1rm) > Number(previous.estimated_1rm)) {
                status = "↑ Improved";
            } else if (Number(current.estimated_1rm) < Number(previous.estimated_1rm)) {
                status = "↓ Decreased";
            }
        }

        const bestWeight = Math.max(
            ...result.rows.map(row => Number(row.weight))
        );

        const bestReps = Math.max(
            ...result.rows.map(row => Number(row.reps))
        );

        res.json({
            exercise_id: Number(exerciseId),
            previous_session: previous || null,
            current_session: current,
            best_weight: bestWeight,
            best_reps: bestReps,
            status
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to load progress"
        });
    }
});

module.exports = router;