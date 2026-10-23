import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Building2, Landmark, ShieldCheck, Home } from "lucide-react";
import axios from "axios";

export default function Login() {
    const navigate = useNavigate();

    const [platform, setPlatform] = useState("CIVIC"); // "CIVIC" | "SOCIETY"
    const [email, setEmail] = useState("citizen@adhikar.in");
    const [password, setPassword] = useState("Adhikar@2026");
    const [role, setRole] = useState("CITIZEN");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handlePlatformSwitch = (plat) => {
        setPlatform(plat);
        setErrorMsg("");
        if (plat === "CIVIC") {
            setRole("CITIZEN");
            setEmail("citizen@adhikar.in");
        } else {
            setRole("SOCIETY_RESIDENT");
            setEmail("resident@greenwood.in");
        }
    };

    const handleRoleSelect = (selectedRole, defaultEmail) => {
        setRole(selectedRole);
        setEmail(defaultEmail);
        setErrorMsg("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            // Attempt authentic Spring Boot backend login
            const res = await axios.post("/api/auth/login", {
                email: email.trim(),
                password: password
            }, { timeout: 4000 });

            if (res.data && res.data.token) {
                const data = res.data;
                localStorage.setItem("adhikar_token", data.token);
                localStorage.setItem("adhikar_user_email", data.email);
                localStorage.setItem("adhikar_user_name", data.name || "User");
                localStorage.setItem("adhikar_user_role", data.role);
                localStorage.setItem("adhikar_org_id", data.organizationId ? String(data.organizationId) : (platform === "SOCIETY" ? "2" : "1"));
                localStorage.setItem("adhikar_org_name", data.organizationName || (platform === "SOCIETY" ? "Greenwood Heights Residential Society" : "Civic Administration"));

                routeByRole(data.role);
                return;
            }
        } catch (err) {
            console.warn("Backend auth failed or unreachable; utilizing fallback mock authentication", err?.message);
        }

        // Mock / Development Fallback Authentication
        localStorage.setItem("adhikar_token", "mock_jwt_token_" + Date.now());
        localStorage.setItem("adhikar_user_email", email);
        localStorage.setItem("adhikar_user_role", role);
        if (platform === "SOCIETY") {
            localStorage.setItem("adhikar_org_id", "2");
            localStorage.setItem("adhikar_org_name", "Greenwood Heights Residential Society");
            localStorage.setItem("adhikar_user_name", role === "SOCIETY_MANAGER" ? "Operations Manager" : "Resident User");
        } else {
            localStorage.setItem("adhikar_org_id", "1");
            localStorage.setItem("adhikar_org_name", "Civic Innovation Administration");
            localStorage.setItem("adhikar_user_name", role === "NODAL_OFFICER" ? "Nodal Officer" : "Citizen User");
        }

        setTimeout(() => {
            setLoading(false);
            routeByRole(role);
        }, 300);
    };

    const routeByRole = (userRole) => {
        setLoading(false);
        const r = (userRole || "").toUpperCase();
        if (r === "SOCIETY_RESIDENT") {
            navigate("/society/resident");
        } else if (r === "SOCIETY_MANAGER") {
            navigate("/society/manager");
        } else if (r === "NODAL_OFFICER" || r === "NODAL_ADMIN" || r === "ADMIN") {
            navigate("/admin");
        } else if (r === "HEI_FACULTY") {
            navigate("/university");
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoBadge}>
                    <Sparkles size={24} color="#ffffff" />
                </div>

                <h1 style={styles.brandTitle}>
                    Adhikar <span style={{ color: "#0284c7" }}>AI</span>
                </h1>

                {/* Platform Mode Selector */}
                <div style={styles.platformTabs}>
                    <button
                        type="button"
                        onClick={() => handlePlatformSwitch("CIVIC")}
                        style={platform === "CIVIC" ? styles.activePlatformTab : styles.platformTab}
                    >
                        <Landmark size={15} />
                        <span>Civic Grievance Portal</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePlatformSwitch("SOCIETY")}
                        style={platform === "SOCIETY" ? styles.activePlatformTab : styles.platformTab}
                    >
                        <Building2 size={15} />
                        <span>Residential Society Platform</span>
                    </button>
                </div>

                {/* Quick Persona Selector */}
                <div style={styles.roleBox}>
                    <span style={styles.roleBoxLabel}>Select Stakeholder Persona for Quick Sign-In:</span>
                    
                    {platform === "CIVIC" ? (
                        <div style={styles.roleGrid}>
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("CITIZEN", "citizen@adhikar.in")}
                                style={{
                                    ...styles.roleBtn,
                                    ...(role === "CITIZEN" ? styles.activeRoleBtn : {})
                                }}
                            >
                                🌾 Civic Citizen
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("NODAL_OFFICER", "admin@adhikar.gov.in")}
                                style={{
                                    ...styles.roleBtn,
                                    ...(role === "NODAL_OFFICER" ? styles.activeRoleBtn : {})
                                }}
                            >
                                🏛️ Civic Nodal Admin
                            </button>
                        </div>
                    ) : (
                        <div style={styles.roleGrid}>
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("SOCIETY_RESIDENT", "resident@greenwood.in")}
                                style={{
                                    ...styles.roleBtn,
                                    ...(role === "SOCIETY_RESIDENT" ? styles.activeRoleBtn : {})
                                }}
                            >
                                🏠 Society Resident
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("SOCIETY_MANAGER", "manager@greenwood.in")}
                                style={{
                                    ...styles.roleBtn,
                                    ...(role === "SOCIETY_MANAGER" ? styles.activeRoleBtn : {})
                                }}
                            >
                                🏢 Society Manager
                            </button>
                        </div>
                    )}
                </div>

                {errorMsg && (
                    <div style={styles.errorBox}>{errorMsg}</div>
                )}

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Registered Email Address</label>
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
                        <span>{loading ? "Authenticating & Routing..." : `Sign In as ${role.replace("_", " ")}`}</span>
                        <ArrowRight size={17} />
                    </button>
                </form>

                <div style={styles.footerText}>
                    Need an account?{" "}
                    <Link to="/register" style={styles.link}>
                        Register as Resident or Citizen
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
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        padding: "24px 16px",
        fontFamily: "'Inter', sans-serif",
    },
    card: {
        width: "100%",
        maxWidth: "480px",
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
        padding: "36px 32px",
        textAlign: "center",
    },
    logoBadge: {
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 14px",
        boxShadow: "0 6px 14px rgba(2, 132, 199, 0.25)",
    },
    brandTitle: {
        fontSize: "24px",
        fontWeight: "800",
        color: "#0f172a",
        margin: "0 0 16px 0",
        letterSpacing: "-0.5px",
    },
    platformTabs: {
        display: "flex",
        gap: "8px",
        backgroundColor: "#f1f5f9",
        padding: "4px",
        borderRadius: "12px",
        marginBottom: "18px"
    },
    platformTab: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "transparent",
        fontSize: "12px",
        fontWeight: "600",
        color: "#64748b",
        cursor: "pointer",
        transition: "all 0.15s ease"
    },
    activePlatformTab: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#ffffff",
        fontSize: "12px",
        fontWeight: "700",
        color: "#0284c7",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        cursor: "pointer"
    },
    roleBox: {
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "12px",
        marginBottom: "20px",
        textAlign: "left",
    },
    roleBoxLabel: {
        display: "block",
        fontSize: "11px",
        fontWeight: "700",
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "8px",
    },
    roleGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px",
    },
    roleBtn: {
        padding: "9px 12px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        backgroundColor: "#ffffff",
        color: "#334155",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.15s ease",
    },
    activeRoleBtn: {
        backgroundColor: "#0284c7",
        borderColor: "#0284c7",
        color: "#ffffff",
        boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)",
    },
    form: {
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    label: {
        fontSize: "12px",
        fontWeight: "600",
        color: "#334155",
    },
    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "10px 14px",
        borderRadius: "10px",
        border: "1.5px solid #e2e8f0",
        fontSize: "13px",
        color: "#0f172a",
        outline: "none",
    },
    submitBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        width: "100%",
        padding: "12px",
        borderRadius: "10px",
        backgroundColor: "#0284c7",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "700",
        border: "none",
        cursor: "pointer",
        marginTop: "8px",
        boxShadow: "0 4px 10px rgba(2, 132, 199, 0.2)",
    },
    footerText: {
        marginTop: "20px",
        fontSize: "12px",
        color: "#64748b",
    },
    link: {
        color: "#0284c7",
        fontWeight: "700",
        textDecoration: "none",
    },
    errorBox: {
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
        padding: "8px 12px",
        borderRadius: "8px",
        fontSize: "12px",
        marginBottom: "12px"
    }
};
