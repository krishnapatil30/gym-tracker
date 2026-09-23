const express = require("express");
const pool = require("../db/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, muscle_group, equipment } = req.body;

        if (!name || !muscle_group || !equipment) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO exercises
            (user_id, name, muscle_group, equipment)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [req.user.id, name, muscle_group, equipment]
        );

        res.status(201).json({
            message: "Exercise added successfully",
            exercise: result.rows[0]
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to add exercise"
        });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM exercises WHERE user_id = $1 ORDER BY id DESC",
            [req.user.id]
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get exercises"
        });
    }
});

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { name, muscle_group, equipment } = req.body;

        const result = await pool.query(
            `UPDATE exercises
            SET name = $1, muscle_group = $2, equipment = $3
            WHERE id = $4 AND user_id = $5
            RETURNING *`,
            [name, muscle_group, equipment, req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Exercise not found"
            });
        }

        res.json({
            message: "Exercise updated successfully",
            exercise: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update exercise"
        });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM exercises WHERE id = $1 AND user_id = $2 RETURNING *",
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Exercise not found"
            });
        }

        res.json({
            message: "Exercise deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete exercise"
        });
    }
});

module.exports = router;