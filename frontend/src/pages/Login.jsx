import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("citizen@adhikar.in");
    const [password, setPassword] = useState("Adhikar@2026");
    const [role, setRole] = useState("CITIZEN");
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = (selectedRole, defaultEmail) => {
        setRole(selectedRole);
        setEmail(defaultEmail);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);

        localStorage.setItem("adhikar_token", "mock_jwt_token_" + Date.now());
        localStorage.setItem("sankalp_token", "mock_jwt_token_" + Date.now());
        localStorage.setItem("adhikar_user_email", email);
        localStorage.setItem("adhikar_user_role", role);

        setTimeout(() => {
            setLoading(false);
            if (role === "NODAL_OFFICER") {
                navigate("/admin");
            } else if (role === "HEI_FACULTY") {
                navigate("/university");
            } else {
                navigate("/dashboard");
            }
        }, 300);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.govBadge}>
                    <span>🇮🇳 National Innovation & Grievance Portal • NEP 2020</span>
                </div>

                <div style={styles.logoBadge}>
                    <Sparkles size={24} color="#ffffff" />
                </div>

                <h1 style={styles.brandTitle}>
                    Adhikar <span style={{ color: "#0284c7" }}>AI</span>
                </h1>
                <p style={styles.brandSubtitle}>
                    National Citizen Innovation & Grievance Redressal Ecosystem
                </p>

                {/* Quick Role Demo Selector */}
                <div style={styles.roleBox}>
                    <span style={styles.roleBoxLabel}>Select Stakeholder Persona for Quick Access:</span>
                    <div style={styles.roleGrid}>
                        <button
                            type="button"
                            onClick={() => handleRoleSelect("CITIZEN", "citizen@adhikar.in")}
                            style={{
                                ...styles.roleBtn,
                                ...(role === "CITIZEN" ? styles.activeRoleBtn : {})
                            }}
                        >
                            🌾 Citizen / Resident
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleSelect("HEI_FACULTY", "faculty@iitd.ac.in")}
                            style={{
                                ...styles.roleBtn,
                                ...(role === "HEI_FACULTY" ? styles.activeRoleBtn : {})
                            }}
                        >
                            🎓 University (HEI) Faculty / Student
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleSelect("NODAL_OFFICER", "admin@adhikar.gov.in")}
                            style={{
                                ...styles.roleBtn,
                                ...(role === "NODAL_OFFICER" ? styles.activeRoleBtn : {})
                            }}
                        >
                            🏛️ Nodal Officer (Admin)
                        </button>
                    </div>
                </div>

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Official / Registered Email ID</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="name@adhikar.in"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.submitBtn}
                    >
                        <span>{loading ? "Authenticating..." : "Sign In to Innovation Portal"}</span>
                        <ArrowRight size={17} />
                    </button>
                </form>

                <div style={styles.footerText}>
                    New Citizen or Panchayat Head?{" "}
                    <Link to="/register" style={styles.link}>
                        Register Citizen Account
                    </Link>
                </div>
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
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: "20px"
    },
    card: {
        background: "#ffffff",
        borderRadius: "24px",
        padding: "36px 32px",
        width: "100%",
        maxWidth: "460px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        textAlign: "center"
    },
    govBadge: {
        fontSize: "11px",
        fontWeight: 700,
        color: "#0369a1",
        background: "#e0f2fe",
        padding: "4px 12px",
        borderRadius: "20px",
        display: "inline-block",
        marginBottom: "16px"
    },
    logoBadge: {
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #0284c7 0%, #16a34a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 12px auto",
        boxShadow: "0 6px 16px rgba(2, 132, 199, 0.35)"
    },
    brandTitle: {
        fontSize: "24px",
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: "4px"
    },
    brandSubtitle: {
        fontSize: "12px",
        color: "#64748b",
        marginBottom: "20px"
    },
    roleBox: {
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "12px",
        marginBottom: "18px",
        textAlign: "left"
    },
    roleBoxLabel: {
        fontSize: "11px",
        fontWeight: 700,
        color: "#475569",
        display: "block",
        marginBottom: "8px"
    },
    roleGrid: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "6px"
    },
    roleBtn: {
        padding: "7px 10px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        fontSize: "12px",
        fontWeight: 600,
        color: "#334155",
        textAlign: "left"
    },
    activeRoleBtn: {
        background: "#e0f2fe",
        borderColor: "#0284c7",
        color: "#0369a1"
    },
    form: {
        textAlign: "left"
    },
    inputGroup: {
        marginBottom: "14px"
    },
    label: {
        fontSize: "12px",
        fontWeight: 600,
        color: "#334155",
        display: "block",
        marginBottom: "5px"
    },
    input: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "10px",
        border: "1px solid #cbd5e1",
        fontSize: "13.5px",
        color: "#0f172a",
        outline: "none"
    },
    submitBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        color: "#ffffff",
        padding: "12px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 700,
        boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
        marginTop: "10px"
    },
    footerText: {
        marginTop: "18px",
        fontSize: "12.5px",
        color: "#64748b"
    },
    link: {
        color: "#0284c7",
        fontWeight: 700,
        textDecoration: "none"
    }
};
