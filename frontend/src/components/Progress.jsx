import { API_URL } from "../config";
import { useEffect, useState } from "react";

function Progress() {
    const [exercises, setExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState("");
    const [progress, setProgress] = useState(null);
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        try {
            const response = await fetch(
                "${API_URL}/api/exercises",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setExercises(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadProgress = async (exerciseId) => {
        if (!exerciseId) {
            setProgress(null);
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/progress/${exerciseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setProgress(null);
                setMessage(data.message);
                return;
            }

            setMessage("");
            setProgress(data);

        } catch (error) {
            console.error(error);
            setMessage("Failed to load progress.");
        }
    };

    return (
        <div style={{ marginTop: "40px" }}>

            <h2>Progress Tracking</h2>

            <select
                value={selectedExercise}
                onChange={(e) => {
                    setSelectedExercise(e.target.value);
                    loadProgress(e.target.value);
                }}
            >
                <option value="">
                    Select Exercise
                </option>

                {exercises.map((exercise) => (
                    <option
                        key={exercise.id}
                        value={exercise.id}
                    >
                        {exercise.name}
                    </option>
                ))}
            </select>

            {message && (
                <p>{message}</p>
            )}

            {progress && (
                <div style={{ marginTop: "20px" }}>

                    <div
                        style={{
                            border: "1px solid #ccc",
                            padding: "20px",
                            marginBottom: "15px"
                        }}
                    >
                        <h3>Current Session</h3>

                        <p>
                            Weight:{" "}
                            {progress.current_session.weight} kg
                        </p>

                        <p>
                            Reps:{" "}
                            {progress.current_session.reps}
                        </p>

                        <p>
                            Estimated 1RM:{" "}
                            {Number(
                                progress.current_session.estimated_1rm
                            ).toFixed(2)}{" "}
                            kg
                        </p>
                    </div>

                    <div
                        style={{
                            border: "1px solid #ccc",
                            padding: "20px",
                            marginBottom: "15px"
                        }}
                    >
                        <h3>Previous Session</h3>

                        {progress.previous_session ? (
                            <>
                                <p>
                                    Weight:{" "}
                                    {progress.previous_session.weight} kg
                                </p>

                                <p>
                                    Reps:{" "}
                                    {progress.previous_session.reps}
                                </p>

                                <p>
                                    Estimated 1RM:{" "}
                                    {Number(
                                        progress.previous_session.estimated_1rm
                                    ).toFixed(2)}{" "}
                                    kg
                                </p>
                            </>
                        ) : (
                            <p>
                                No previous session available.
                            </p>
                        )}
                    </div>

                    <div
                        style={{
                            border: "1px solid #ccc",
                            padding: "20px",
                            marginBottom: "15px"
                        }}
                    >
                        <h3>Personal Best</h3>

                        <p>
                            Best Weight:{" "}
                            {progress.best_weight} kg
                        </p>

                        <p>
                            Best Reps:{" "}
                            {progress.best_reps}
                        </p>
                    </div>

                    <div
                        style={{
                            border: "1px solid #ccc",
                            padding: "20px"
                        }}
                    >
                        <h3>Progress Status</h3>

                        <p
                            style={{
                                fontSize: "24px",
                                fontWeight: "bold"
                            }}
                        >
                            {progress.status}
                        </p>
                    </div>

                </div>
            )}

        </div>
    );
}

export default Progress;