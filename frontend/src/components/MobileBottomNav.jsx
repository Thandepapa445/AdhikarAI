import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Plus, MapPin, Layers, CheckCircle2, ShieldCheck, GraduationCap } from "lucide-react";

export default function MobileBottomNav({ activeTab, setActiveTab }) {
    const location = useLocation();
    const navigate = useNavigate();

    const isDashboard = location.pathname === "/" || location.pathname === "/dashboard";
    const isNew = location.pathname === "/challenges/new";
    const isUniversity = location.pathname === "/university";
    const isAdmin = location.pathname === "/admin";

    return (
        <nav style={styles.mobileNav}>
            <button
                onClick={() => {
                    if (!isDashboard) navigate("/dashboard");
                    if (setActiveTab) setActiveTab("my-challenges");
                }}
                style={{
                    ...styles.navBtn,
                    ...(isDashboard && activeTab === "my-challenges" ? styles.activeNavBtn : {})
                }}
            >
                <Home size={20} />
                <span>Home</span>
            </button>

            <button
                onClick={() => {
                    if (!isDashboard) navigate("/dashboard");
                    if (setActiveTab) setActiveTab("community-map");
                }}
                style={{
                    ...styles.navBtn,
                    ...(isDashboard && activeTab === "community-map" ? styles.activeNavBtn : {})
                }}
            >
                <MapPin size={20} />
                <span>GIS Map</span>
            </button>

            {/* Elevated Center Submit Action */}
            <Link to="/challenges/new" style={styles.submitCenterBtn} title="Report Local Problem">
                <div style={styles.plusCircle}>
                    <Plus size={24} color="#ffffff" strokeWidth={3} />
                </div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#0284c7", marginTop: "2px" }}>
                    Submit
                </span>
            </Link>

            <button
                onClick={() => {
                    if (!isDashboard) navigate("/dashboard");
                    if (setActiveTab) setActiveTab("showcase");
                }}
                style={{
                    ...styles.navBtn,
                    ...(isDashboard && activeTab === "showcase" ? styles.activeNavBtn : {})
                }}
            >
                <CheckCircle2 size={20} />
                <span>Showcase</span>
            </button>

            <button
                onClick={() => navigate("/university")}
                style={{
                    ...styles.navBtn,
                    ...(isUniversity ? styles.activeNavBtn : {})
                }}
            >
                <GraduationCap size={20} />
                <span>HEI Hub</span>
            </button>
        </nav>
    );
}

const styles = {
    mobileNav: {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 1500,
        boxShadow: "0 -4px 20px rgba(15, 23, 42, 0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)"
    },
    navBtn: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "none",
        border: "none",
        color: "#64748b",
        fontSize: "10.5px",
        fontWeight: 600,
        gap: "2px",
        padding: "6px 10px",
        cursor: "pointer",
        flex: 1
    },
    activeNavBtn: {
        color: "#0284c7",
        fontWeight: 800
    },
    submitCenterBtn: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        marginTop: "-20px",
        flex: 1
    },
    plusCircle: {
        width: "46px",
        height: "46px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 16px rgba(2, 132, 199, 0.4)",
        border: "3px solid #ffffff"
    }
};
