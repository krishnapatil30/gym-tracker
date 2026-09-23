const express = require("express");
const pool = require("../db/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT workout_date::date AS workout_date
             FROM workouts
             WHERE user_id = $1
             ORDER BY workout_date::date`,
            [req.user.id]
        );

        const dates = result.rows.map(row => row.workout_date);

        if (dates.length === 0) {
            return res.json({
                current_streak: 0,
                longest_streak: 0
            });
        }

        let longestStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < dates.length; i++) {
            const previous = new Date(dates[i - 1]);
            const current = new Date(dates[i]);

            const difference =
                (current - previous) / (1000 * 60 * 60 * 24);

            if (difference === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }

            longestStreak = Math.max(longestStreak, currentStreak);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastDate = new Date(dates[dates.length - 1]);
        lastDate.setHours(0, 0, 0, 0);

        const daysFromToday =
            (today - lastDate) / (1000 * 60 * 60 * 24);

        if (daysFromToday > 1) {
            currentStreak = 0;
        } else {
            currentStreak = 1;

            for (let i = dates.length - 1; i > 0; i--) {
                const current = new Date(dates[i]);
                const previous = new Date(dates[i - 1]);

                const difference =
                    (current - previous) / (1000 * 60 * 60 * 24);

                if (difference === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        res.json({
            current_streak: currentStreak,
            longest_streak: longestStreak
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to calculate streak"
        });
    }
});

module.exports = router;