import { API_URL } from "../config";
import { useEffect, useState } from "react";


function Exercises() {
    const [exercises, setExercises] = useState([]);

    const [name, setName] = useState("");
    const [muscleGroup, setMuscleGroup] = useState("");
    const [equipment, setEquipment] = useState("");

    const [editingId, setEditingId] = useState(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingId
            ? `${API_URL}/api/exercises/${editingId}`
            : "${API_URL}/api/exercises";

        const method = editingId ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    muscle_group: muscleGroup,
                    equipment
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert(
                editingId
                    ? "Exercise updated successfully!"
                    : "Exercise added successfully!"
            );

            clearForm();
            loadExercises();

        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
        }
    };

    const editExercise = (exercise) => {
        setEditingId(exercise.id);
        setName(exercise.name);
        setMuscleGroup(exercise.muscle_group);
        setEquipment(exercise.equipment);
    };

    const deleteExercise = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this exercise?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/exercises/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert("Exercise deleted successfully!");

            loadExercises();

        } catch (error) {
            console.error(error);
        }
    };

    const clearForm = () => {
        setName("");
        setMuscleGroup("");
        setEquipment("");
        setEditingId(null);
    };

    return (
        <div style={{ marginTop: "40px" }}>

            <h2>Exercise Management</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Exercise Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Muscle Group"
                    value={muscleGroup}
                    onChange={(e) =>
                        setMuscleGroup(e.target.value)
                    }
                    required
                />

                <input
                    type="text"
                    placeholder="Equipment"
                    value={equipment}
                    onChange={(e) =>
                        setEquipment(e.target.value)
                    }
                    required
                />

                <button type="submit">
                    {editingId
                        ? "Update Exercise"
                        : "Add Exercise"}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={clearForm}
                    >
                        Cancel
                    </button>
                )}

            </form>

            <hr />

            <h3>Your Exercises</h3>

            {exercises.length === 0 ? (
                <p>No exercises found.</p>
            ) : (
                exercises.map((exercise) => (
                    <div
                        key={exercise.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "15px",
                            marginBottom: "10px"
                        }}
                    >
                        <h3>{exercise.name}</h3>

                        <p>
                            Muscle Group: {exercise.muscle_group}
                        </p>

                        <p>
                            Equipment: {exercise.equipment}
                        </p>

                        <button
                            onClick={() =>
                                editExercise(exercise)
                            }
                        >
                            Edit
                        </button>

                        <button
                            onClick={() =>
                                deleteExercise(exercise.id)
                            }
                        >
                            Delete
                        </button>
                    </div>
                ))
            )}

        </div>
    );
}

export default Exercises;