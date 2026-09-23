const express = require("express");
const pool = require("../db/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, workout_date } = req.body;

        if (!name || !workout_date) {
            return res.status(400).json({
                message: "Name and workout date are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO workouts (user_id, name, workout_date)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [req.user.id, name, workout_date]
        );

        res.status(201).json({
            message: "Workout created successfully",
            workout: result.rows[0]
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to create workout"
        });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM workouts
             WHERE user_id = $1
             ORDER BY workout_date DESC, id DESC`,
            [req.user.id]
        );

        res.json(result.rows);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to get workouts"
        });
    }
});

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const workoutResult = await pool.query(
            `SELECT * FROM workouts
             WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.id]
        );

        if (workoutResult.rows.length === 0) {
            return res.status(404).json({
                message: "Workout not found"
            });
        }

        const setsResult = await pool.query(
            `SELECT 
                ws.id,
                ws.exercise_id,
                e.name AS exercise_name,
                e.muscle_group,
                e.equipment,
                ws.weight,
                ws.reps
             FROM workout_sets ws
             JOIN exercises e ON ws.exercise_id = e.id
             WHERE ws.workout_id = $1
             ORDER BY ws.id`,
            [req.params.id]
        );

        res.json({
            workout: workoutResult.rows[0],
            sets: setsResult.rows
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to get workout"
        });
    }
});
router.post("/:id/sets", authMiddleware, async (req, res) => {
    try {
        const { exercise_id, weight, reps } = req.body;

        if (!exercise_id || weight === undefined || !reps) {
            return res.status(400).json({
                message: "Exercise, weight and reps are required"
            });
        }

        const workout = await pool.query(
            "SELECT * FROM workouts WHERE id = $1 AND user_id = $2",
            [req.params.id, req.user.id]
        );

        if (workout.rows.length === 0) {
            return res.status(404).json({
                message: "Workout not found"
            });
        }

        const exercise = await pool.query(
            "SELECT * FROM exercises WHERE id = $1 AND user_id = $2",
            [exercise_id, req.user.id]
        );

        if (exercise.rows.length === 0) {
            return res.status(404).json({
                message: "Exercise not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO workout_sets
            (workout_id, exercise_id, weight, reps)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [req.params.id, exercise_id, weight, reps]
        );

        res.status(201).json({
            message: "Set added successfully",
            set: result.rows[0]
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to add set"
        });
    }
});
router.put("/sets/:setId", authMiddleware, async (req, res) => {
    try {
        const { weight, reps } = req.body;

        const result = await pool.query(
            `UPDATE workout_sets ws
             SET weight = $1, reps = $2
             FROM workouts w
             WHERE ws.id = $3
             AND ws.workout_id = w.id
             AND w.user_id = $4
             RETURNING ws.*`,
            [weight, reps, req.params.setId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Set not found"
            });
        }

        res.json({
            message: "Set updated successfully",
            set: result.rows[0]
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to update set"
        });
    }
});
router.delete("/sets/:setId", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM workout_sets ws
             USING workouts w
             WHERE ws.id = $1
             AND ws.workout_id = w.id
             AND w.user_id = $2
             RETURNING ws.*`,
            [req.params.setId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Set not found"
            });
        }

        res.json({
            message: "Set deleted successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to delete set"
        });
    }
});

module.exports = router;