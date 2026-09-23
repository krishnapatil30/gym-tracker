import { useEffect, useState } from "react";

function Workouts() {
    const [workouts, setWorkouts] = useState([]);
    const [exercises, setExercises] = useState([]);

    const [workoutName, setWorkoutName] = useState("");
    const [workoutDate, setWorkoutDate] = useState("");

    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [sets, setSets] = useState([]);

    const [exerciseId, setExerciseId] = useState("");
    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("");

    const [editingSetId, setEditingSetId] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        loadWorkouts();
        loadExercises();
    }, []);

    const loadWorkouts = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/workouts",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setWorkouts(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadExercises = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/exercises",
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

    const createWorkout = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:5000/api/workouts",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: workoutName,
                        workout_date: workoutDate
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert("Workout created successfully!");

            setWorkoutName("");
            setWorkoutDate("");

            loadWorkouts();

        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
        }
    };

    const openWorkout = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/workouts/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSelectedWorkout(data.workout);
                setSets(data.sets);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addSet = async (e) => {
        e.preventDefault();

        if (!selectedWorkout) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/workouts/${selectedWorkout.id}/sets`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        exercise_id: Number(exerciseId),
                        weight: Number(weight),
                        reps: Number(reps)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert("Set added successfully!");

            setExerciseId("");
            setWeight("");
            setReps("");

            openWorkout(selectedWorkout.id);

        } catch (error) {
            console.error(error);
        }
    };

    const editSet = (set) => {
        setEditingSetId(set.id);
        setWeight(set.weight);
        setReps(set.reps);
    };

    const updateSet = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `http://localhost:5000/api/workouts/sets/${editingSetId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        weight: Number(weight),
                        reps: Number(reps)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert("Set updated successfully!");

            setEditingSetId(null);
            setWeight("");
            setReps("");

            openWorkout(selectedWorkout.id);

        } catch (error) {
            console.error(error);
        }
    };

    const deleteSet = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this set?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/workouts/sets/${id}`,
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

            alert("Set deleted successfully!");

            openWorkout(selectedWorkout.id);

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ marginTop: "40px" }}>

            <h2>Workout Management</h2>

            <h3>Create Workout</h3>

            <form onSubmit={createWorkout}>

                <input
                    type="text"
                    placeholder="Workout Name"
                    value={workoutName}
                    onChange={(e) =>
                        setWorkoutName(e.target.value)
                    }
                    required
                />

                <input
                    type="date"
                    value={workoutDate}
                    onChange={(e) =>
                        setWorkoutDate(e.target.value)
                    }
                    required
                />

                <button type="submit">
                    Create Workout
                </button>

            </form>

            <hr />

            <h3>Your Workouts</h3>

            {workouts.length === 0 ? (
                <p>No workouts found.</p>
            ) : (
                workouts.map((workout) => (
                    <div
                        key={workout.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "15px",
                            marginBottom: "10px"
                        }}
                    >
                        <h3>{workout.name}</h3>

                        <p>
                            Date: {workout.workout_date}
                        </p>

                        <button
                            onClick={() =>
                                openWorkout(workout.id)
                            }
                        >
                            Open Workout
                        </button>
                    </div>
                ))
            )}

            {selectedWorkout && (
                <div style={{ marginTop: "30px" }}>

                    <hr />

                    <h2>
                        {selectedWorkout.name}
                    </h2>

                    <h3>Add Set</h3>

                    <form
                        onSubmit={
                            editingSetId
                                ? updateSet
                                : addSet
                        }
                    >

                        {!editingSetId && (
                            <select
                                value={exerciseId}
                                onChange={(e) =>
                                    setExerciseId(e.target.value)
                                }
                                required
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
                        )}

                        <input
                            type="number"
                            placeholder="Weight"
                            value={weight}
                            onChange={(e) =>
                                setWeight(e.target.value)
                            }
                            required
                        />

                        <input
                            type="number"
                            placeholder="Reps"
                            value={reps}
                            onChange={(e) =>
                                setReps(e.target.value)
                            }
                            required
                        />

                        <button type="submit">
                            {editingSetId
                                ? "Update Set"
                                : "Add Set"}
                        </button>

                        {editingSetId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingSetId(null);
                                    setWeight("");
                                    setReps("");
                                }}
                            >
                                Cancel
                            </button>
                        )}

                    </form>

                    <h3>Sets</h3>

                    {sets.length === 0 ? (
                        <p>No sets added.</p>
                    ) : (
                        sets.map((set) => (
                            <div
                                key={set.id}
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "10px",
                                    marginBottom: "10px"
                                }}
                            >
                                <p>
                                    <strong>
                                        {set.exercise_name}
                                    </strong>
                                </p>

                                <p>
                                    Weight: {set.weight} kg
                                </p>

                                <p>
                                    Reps: {set.reps}
                                </p>

                                <button
                                    onClick={() =>
                                        editSet(set)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        deleteSet(set.id)
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}

                </div>
            )}

        </div>
    );
}

export default Workouts;