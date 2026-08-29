import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Login() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            // Login
            const loginResponse = await api.post(
                "/auth/login",
                form
            );

            const token = loginResponse.data.token;

            // Save JWT
            localStorage.setItem("token", token);

            // Get current user
            const userResponse = await api.get("/user/me");

            const user = userResponse.data;

            console.log("Logged in user:", user);

            // Check authorities
            const isAdminOrOfficer =
                Array.isArray(user.authorities) &&
                user.authorities.some(
                    (authority) =>
                        authority.authority === "ROLE_ADMIN" ||
                        authority.authority === "ROLE_OFFICER"
                );

            console.log(
                "Admin/Officer:",
                isAdminOrOfficer
            );

            // Direct browser redirect
            if (isAdminOrOfficer) {
                window.location.href = "/admin";
            } else {
                window.location.href = "/dashboard";
            }

        } catch (err) {
            console.error("Login error:", err);

            localStorage.removeItem("token");

            setError(
                err.response?.data?.message ||
                "Invalid email or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>

            <div style={styles.card}>

                <h1 style={styles.title}>
                    Adhikar AI
                </h1>

                <p style={styles.subtitle}>
                    Citizen Complaint Management
                </p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />

                    {error && (
                        <p style={styles.error}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                <p style={styles.register}>
                    Don't have an account?{" "}
                    <Link to="/register">
                        Register
                    </Link>
                </p>

            </div>

        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f1f5f9",
    },

    card: {
        width: "380px",
        padding: "40px",
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    },

    title: {
        margin: 0,
        color: "#2563eb",
        fontSize: "32px",
        textAlign: "center",
    },

    subtitle: {
        color: "#64748b",
        marginBottom: "30px",
        textAlign: "center",
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
        marginBottom: "15px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        fontSize: "15px",
    },

    button: {
        width: "100%",
        padding: "12px",
        background: "#2563eb",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "600",
    },

    error: {
        color: "#dc2626",
        fontSize: "14px",
        textAlign: "center",
    },

    register: {
        marginTop: "20px",
        textAlign: "center",
        color: "#64748b",
    },
};

export default Login;