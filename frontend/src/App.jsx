import { useEffect, useState } from "react";
import Exercises from "./components/Exercises";
import Workouts from "./components/Workouts";
import Progress from "./components/Progress";

function App() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [dashboard, setDashboard] = useState(null);
    const [streak, setStreak] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (isLoggedIn) {
            loadDashboard();
            loadStreak();
        }
    }, [isLoggedIn]);

    const handleAuth = async (e) => {
        e.preventDefault();

        const url = isLogin
            ? "http://localhost:5000/api/auth/login"
            : "http://localhost:5000/api/auth/register";

        const body = isLogin
            ? { email, password }
            : { name, email, password };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            if (isLogin) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                setIsLoggedIn(true);
            } else {
                alert("Registration successful! Please login.");

                setIsLogin(true);
                setName("");
                setPassword("");
            }

        } catch (error) {
            console.error(error);
            alert("Cannot connect to backend.");
        }
    };

    const loadDashboard = async () => {
        const currentToken = localStorage.getItem("token");

        try {
            const response = await fetch(
                "http://localhost:5000/api/dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setDashboard(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadStreak = async () => {
        const currentToken = localStorage.getItem("token");

        try {
            const response = await fetch(
                "http://localhost:5000/api/streak",
                {
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setStreak(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setDashboard(null);
        setStreak(null);
        setIsLoggedIn(false);
    };

    // LOGIN / REGISTER SCREEN
    if (!isLoggedIn) {
        return (
            <div style={styles.authContainer}>
                <div style={styles.authCard}>

                    <h1>Gym Tracker</h1>

                    <h2>
                        {isLogin ? "Login" : "Create Account"}
                    </h2>

                    <form onSubmit={handleAuth}>

                        {!isLogin && (
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                style={styles.input}
                                required
                            />
                        )}

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            style={styles.input}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            style={styles.input}
                            required
                        />

                        <button
                            type="submit"
                            style={styles.button}
                        >
                            {isLogin ? "Login" : "Register"}
                        </button>

                    </form>

                    <p>
                        {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}
                    </p>

                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setName("");
                            setEmail("");
                            setPassword("");
                        }}
                        style={styles.linkButton}
                    >
                        {isLogin
                            ? "Create Account"
                            : "Login"}
                    </button>

                </div>
            </div>
        );
    }

    // DASHBOARD
    return (
        <div style={styles.container}>

            <div style={styles.dashboard}>

                <div style={styles.header}>

                    <div>
                        <h1>Gym Tracker</h1>
                        <p>Welcome, {user?.name}</p>
                    </div>

                    <button
                        onClick={logout}
                        style={styles.logout}
                    >
                        Logout
                    </button>

                </div>

                <h2 style={{
    marginBottom: "18px",
    fontSize: "24px",
    color: "#172033"
}}>
    Dashboard
</h2>

                {!dashboard ? (
                    <p>Loading dashboard...</p>
                ) : (
                    <div style={styles.grid}>

                        <div style={styles.statCard}>
                            <h3 style={{ color: "#64748b", fontSize: "14px" }}>
    TOTAL WORKOUTS
</h3>
                            <p style={styles.number}>
                                {dashboard.total_workouts}
                            </p>
                        </div>

                        <div style={styles.statCard}>
                            <h3 style={{ color: "#64748b", fontSize: "14px" }}>
    EXERCISES PERFORMED
</h3>
                            <p style={styles.number}>
                                {dashboard.total_exercises_performed}
                            </p>
                        </div>

                        <div style={styles.statCard}>
                            <h3 style={{ color: "#64748b", fontSize: "14px" }}>
    TOTAL VOLUME
</h3>
                            <p style={styles.number}>
                                {dashboard.total_volume}
                            </p>
                        </div>

                        <div style={styles.statCard}>
                            <h3 style={{ color: "#64748b", fontSize: "14px" }}>
    WORKOUTS THIS WEEK
</h3>
                            <p style={styles.number}>
                                {dashboard.workouts_this_week}
                            </p>
                        </div>

                    </div>
                )}

                <h2 style={{
    marginBottom: "18px",
    fontSize: "24px",
    color: "#172033"
}}>
    Workout Streak
</h2>

                {!streak ? (
                    <p>Loading streak...</p>
                ) : (
                    <div style={styles.grid}>

                        <div style={styles.statCard}>
                            <h3 style={{ color: "#64748b", fontSize: "14px" }}>
    CURRENT STREAK
</h3>
                            <p style={styles.number}>
                                {streak.current_streak} 🔥
                            </p>
                        </div>

                        <div style={styles.statCard}>
                            <h3 style={{ color: "#64748b", fontSize: "14px" }}>
    LONGEST STREAK
</h3>
                            <p style={styles.number}>
                                {streak.longest_streak}
                            </p>
                        </div>

                    </div>
                )}
                <Exercises />
                <Workouts />
                <Progress />
      
            </div>
        </div>
    );
}

const styles = {
    authContainer: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f172a, #1e3a8a)"
    },

    authCard: {
        width: "380px",
        padding: "40px",
        backgroundColor: "white",
        borderRadius: "18px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        textAlign: "center"
    },

    input: {
        width: "100%",
        padding: "13px 14px",
        marginBottom: "14px",
        boxSizing: "border-box",
        border: "1px solid #d8dee9",
        borderRadius: "8px",
        fontSize: "14px"
    },

    button: {
        width: "100%",
        padding: "13px",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "15px"
    },

    linkButton: {
        background: "none",
        border: "none",
        color: "#2563eb",
        cursor: "pointer",
        fontWeight: "600"
    },

    container: {
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        padding: "35px 20px"
    },

    dashboard: {
        maxWidth: "1100px",
        margin: "auto"
    },

    header: {
        background: "linear-gradient(135deg, #0f172a, #1e40af)",
        color: "white",
        padding: "28px 32px",
        borderRadius: "18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.15)"
    },

    logout: {
        padding: "10px 20px",
        backgroundColor: "white",
        color: "#172033",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600"
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "18px",
        marginBottom: "35px"
    },

    statCard: {
        backgroundColor: "white",
        padding: "22px",
        borderRadius: "14px",
        border: "1px solid #e5e9f0",
        boxShadow: "0 5px 18px rgba(15,23,42,0.06)"
    },

    number: {
        fontSize: "30px",
        fontWeight: "700",
        margin: "10px 0 0",
        color: "#2563eb"
    }
};

export default App;