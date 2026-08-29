import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar() {
    const navigate = useNavigate();

    const [role, setRole] = useState("");

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await api.get("/user/me");

                const authorities =
                    response.data?.authorities || [];

                const isAdmin = authorities.some(
                    (authority) =>
                        authority.authority === "ROLE_ADMIN"
                );

                const isOfficer = authorities.some(
                    (authority) =>
                        authority.authority === "ROLE_OFFICER"
                );

                if (isAdmin) {
                    setRole("ADMIN");
                } else if (isOfficer) {
                    setRole("OFFICER");
                } else {
                    setRole("CITIZEN");
                }

            } catch (error) {
                console.error(
                    "Unable to get user role:",
                    error
                );
            }
        };

        getUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav style={styles.navbar}>

            <div>
                <h2 style={styles.logo}>
                    Adhikar AI
                </h2>

                <span style={styles.tagline}>
                    Smart Citizen Governance
                </span>
            </div>

            <div style={styles.right}>

                <span style={styles.role}>
                    {role || "Loading..."}
                </span>

                {role === "ADMIN" ||
                role === "OFFICER" ? (
                    <button
                        onClick={() =>
                            navigate("/admin")
                        }
                        style={styles.dashboardButton}
                    >
                        Officer Dashboard
                    </button>
                ) : null}

                <button
                    onClick={handleLogout}
                    style={styles.logout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

const styles = {
    navbar: {
        height: "70px",
        padding: "0 40px",
        background: "#ffffff",
        borderBottom:
            "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent:
            "space-between",
        boxSizing: "border-box",
    },

    logo: {
        margin: 0,
        color: "#1d4ed8",
        fontSize: "22px",
    },

    tagline: {
        color: "#64748b",
        fontSize: "12px",
    },

    right: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },

    role: {
        color: "#475569",
        fontSize: "14px",
        fontWeight: "600",
        padding: "7px 12px",
        background: "#f1f5f9",
        borderRadius: "20px",
    },

    dashboardButton: {
        padding: "9px 14px",
        border: "none",
        borderRadius: "7px",
        background: "#2563eb",
        color: "white",
        cursor: "pointer",
        fontSize: "13px",
    },

    logout: {
        padding: "9px 16px",
        border: "none",
        borderRadius: "7px",
        background: "#ef4444",
        color: "white",
        cursor: "pointer",
        fontSize: "14px",
    },
};

export default Navbar;