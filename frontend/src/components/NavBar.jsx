import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, PlusCircle, MapPin, Award, Building2, Bell, LogOut, Layers, CheckCircle2, ShieldCheck, GraduationCap } from "lucide-react";

export default function NavBar({ activeTab, setActiveTab }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);

    const isHome = location.pathname === "/" || location.pathname === "/dashboard";

    const handleLogout = () => {
        localStorage.removeItem("sankalp_token");
        navigate("/login");
    };

    return (
        <header style={styles.header}>
            <div style={styles.topGovBar}>
                <div style={styles.topGovContainer}>
                    <div style={styles.govTag}>
                        <span style={styles.govEmblem}>🇮🇳</span>
                        <span>Government of Jharkhand • Department of Higher, Technical Education & Skill Development</span>
                    </div>
                    <div style={styles.nepBadge}>
                        <Award size={13} style={{ marginRight: 4 }} />
                        <span>NEP 2020 Experiential Social Innovation Initiative</span>
                    </div>
                </div>
            </div>

            <div style={styles.mainNav}>
                <div style={styles.container}>
                    {/* Brand */}
                    <Link to="/dashboard" style={styles.brand}>
                        <div style={styles.logoBadge}>
                            <Sparkles size={22} color="#ffffff" />
                        </div>
                        <div>
                            <div style={styles.brandTitle}>
                                Sankalp <span style={styles.brandHighlight}>AI</span>
                            </div>
                            <div style={styles.brandSubtitle}>
                                Jharkhand Societal Innovation & HEI Collaboration Portal
                            </div>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav style={styles.navLinks}>
                        <button
                            onClick={() => {
                                if (!isHome) navigate("/dashboard");
                                if (setActiveTab) setActiveTab("my-challenges");
                            }}
                            style={{
                                ...styles.navLink,
                                ...(isHome && activeTab === "my-challenges" ? styles.activeNavLink : {})
                            }}
                        >
                            <Layers size={17} />
                            <span>My Challenges</span>
                        </button>

                        <button
                            onClick={() => {
                                if (!isHome) navigate("/dashboard");
                                if (setActiveTab) setActiveTab("community-map");
                            }}
                            style={{
                                ...styles.navLink,
                                ...(isHome && activeTab === "community-map" ? styles.activeNavLink : {})
                            }}
                        >
                            <MapPin size={17} />
                            <span>Jharkhand Map</span>
                        </button>

                        <button
                            onClick={() => {
                                if (!isHome) navigate("/dashboard");
                                if (setActiveTab) setActiveTab("showcase");
                            }}
                            style={{
                                ...styles.navLink,
                                ...(isHome && activeTab === "showcase" ? styles.activeNavLink : {})
                            }}
                        >
                            <CheckCircle2 size={17} />
                            <span>Solved Showcase</span>
                        </button>

                        <button
                            onClick={() => {
                                if (!isHome) navigate("/dashboard");
                                if (setActiveTab) setActiveTab("network");
                            }}
                            style={{
                                ...styles.navLink,
                                ...(isHome && activeTab === "network" ? styles.activeNavLink : {})
                            }}
                        >
                            <Building2 size={17} />
                            <span>Universities & CSR</span>
                        </button>
                    </nav>

                    {/* Action Buttons & Persona Links */}
                    <div style={styles.navActions}>
                        <Link to="/challenges/new" style={styles.submitBtn}>
                            <PlusCircle size={17} />
                            <span>Submit Challenge</span>
                        </Link>

                        {/* Direct Link to University (HEI) Portal */}
                        <Link to="/university" style={styles.universityBtn} title="Higher Education Institutions (HEIs) & Faculty Portal">
                            <GraduationCap size={16} />
                            <span>University Hub</span>
                        </Link>

                        {/* Direct Link to Nodal Admin Portal */}
                        <Link to="/admin" style={styles.adminBtn} title="State Nodal Officer & HEI Governance Command Center">
                            <ShieldCheck size={16} />
                            <span>Nodal Admin</span>
                        </Link>

                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={styles.iconBtn}
                                title="Notifications & Nodal Updates"
                            >
                                <Bell size={18} color="#475569" />
                                <span style={styles.notifBadge}>2</span>
                            </button>

                            {showNotifications && (
                                <div style={styles.notifDropdown}>
                                    <div style={styles.notifHeader}>
                                        <strong>Live Collaboration Updates</strong>
                                    </div>
                                    <div style={styles.notifItem}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0284c7" }}>
                                            BIT Mesra • Water FabLab
                                        </div>
                                        <div style={{ fontSize: 12, color: "#475569" }}>
                                            Prototype filter test results uploaded for Satbarwa Panchayat. Verification requested.
                                        </div>
                                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>2 hours ago</div>
                                    </div>
                                    <div style={styles.notifItem}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
                                            Tata Steel Foundation
                                        </div>
                                        <div style={{ fontSize: 12, color: "#475569" }}>
                                            ₹3.5 Lakhs Pilot Grant approved for Khunti Lac Scraping project.
                                        </div>
                                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>Yesterday</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={styles.userProfile}>
                            <div style={styles.avatar}>GP</div>
                            <div style={styles.userInfo}>
                                <div style={styles.userName}>Citizen / PRI</div>
                                <div style={styles.userRole}>Satbarwa Panchayat</div>
                            </div>
                        </div>

                        <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
                            <LogOut size={16} color="#64748b" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

const styles = {
    header: {
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "#ffffff",
        boxShadow: "0 2px 10px rgba(15,23,42,0.06)",
        borderBottom: "1px solid #e2e8f0"
    },
    topGovBar: {
        background: "linear-gradient(90deg, #0f172a 0%, #1e293b 100%)",
        color: "#cbd5e1",
        fontSize: "11px",
        padding: "5px 0",
        borderBottom: "1px solid #334155"
    },
    topGovContainer: {
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    govTag: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontWeight: 500
    },
    govEmblem: {
        fontSize: "13px"
    },
    nepBadge: {
        display: "flex",
        alignItems: "center",
        color: "#38bdf8",
        fontWeight: 600
    },
    mainNav: {
        padding: "10px 0"
    },
    container: {
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px"
    },
    brand: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textDecoration: "none",
        color: "inherit"
    },
    logoBadge: {
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #0284c7 0%, #16a34a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
    },
    brandTitle: {
        fontSize: "19px",
        fontWeight: 800,
        color: "#0f172a",
        lineHeight: 1.1
    },
    brandHighlight: {
        color: "#0284c7"
    },
    brandSubtitle: {
        fontSize: "10.5px",
        color: "#64748b",
        fontWeight: 500,
        marginTop: "2px"
    },
    navLinks: {
        display: "flex",
        alignItems: "center",
        gap: "2px"
    },
    navLink: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "7px 10px",
        borderRadius: "10px",
        fontSize: "12.5px",
        fontWeight: 600,
        color: "#475569",
        textDecoration: "none"
    },
    activeNavLink: {
        background: "#e0f2fe",
        color: "#0369a1"
    },
    navActions: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    submitBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        color: "#ffffff",
        padding: "8px 12px",
        borderRadius: "10px",
        fontSize: "12.5px",
        fontWeight: 700,
        textDecoration: "none",
        boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
        whiteSpace: "nowrap"
    },
    universityBtn: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        background: "#f5f3ff",
        color: "#7c3aed",
        padding: "7px 11px",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 700,
        textDecoration: "none",
        border: "1px solid #ddd6fe",
        whiteSpace: "nowrap"
    },
    adminBtn: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        background: "#0f172a",
        color: "#38bdf8",
        padding: "7px 11px",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 700,
        textDecoration: "none",
        border: "1px solid #334155",
        whiteSpace: "nowrap"
    },
    iconBtn: {
        width: "34px",
        height: "34px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
    },
    notifBadge: {
        position: "absolute",
        top: "-4px",
        right: "-4px",
        background: "#ef4444",
        color: "#ffffff",
        fontSize: "10px",
        fontWeight: 700,
        width: "17px",
        height: "17px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #ffffff"
    },
    notifDropdown: {
        position: "absolute",
        top: "44px",
        right: 0,
        width: "300px",
        background: "#ffffff",
        borderRadius: "14px",
        boxShadow: "0 12px 36px rgba(15,23,42,0.18)",
        border: "1px solid #e2e8f0",
        padding: "12px",
        zIndex: 100
    },
    notifHeader: {
        fontSize: "12.5px",
        color: "#0f172a",
        paddingBottom: "6px",
        borderBottom: "1px solid #f1f5f9",
        marginBottom: "6px"
    },
    notifItem: {
        padding: "7px",
        borderRadius: "8px",
        background: "#f8fafc",
        marginBottom: "6px"
    },
    userProfile: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 8px 3px 5px",
        borderRadius: "10px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0"
    },
    avatar: {
        width: "26px",
        height: "26px",
        borderRadius: "6px",
        background: "#16a34a",
        color: "#ffffff",
        fontWeight: 700,
        fontSize: "10.5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    userInfo: {
        lineHeight: 1.1
    },
    userName: {
        fontSize: "11.5px",
        fontWeight: 700,
        color: "#0f172a"
    },
    userRole: {
        fontSize: "9.5px",
        color: "#64748b"
    },
    logoutBtn: {
        padding: "7px",
        borderRadius: "8px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0"
    }
};
