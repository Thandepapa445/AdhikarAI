import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, PlusCircle, MapPin, Building2, Bell, LogOut, Layers, CheckCircle2, ShieldCheck, GraduationCap } from "lucide-react";

export default function NavBar({ activeTab, setActiveTab }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);

    const isHome = location.pathname === "/" || location.pathname === "/dashboard";

    const handleTabClick = (tabKey) => {
        if (isHome && setActiveTab) {
            setActiveTab(tabKey);
        } else {
            navigate(`/dashboard?tab=${tabKey}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adhikar_token");
        localStorage.removeItem("sankalp_token");
        navigate("/login");
    };

    return (
        <header style={styles.header}>
            <div className="main-nav" style={styles.mainNav}>
                <div className="nav-container" style={styles.container}>
                    {/* Brand */}
                    <Link to="/dashboard" style={styles.brand} title="Adhikar AI - Home">
                        <div className="brand-logo" style={styles.logoBadge}>
                            <Sparkles size={20} color="#ffffff" />
                        </div>
                        <div className="brand-title-text" style={styles.brandTitle}>
                            Adhikar <span style={styles.brandHighlight}>AI</span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="nav-links-desktop" style={styles.navLinks}>
                        <button
                            onClick={() => handleTabClick("my-challenges")}
                            style={{
                                ...styles.navLink,
                                ...(isHome && (!activeTab || activeTab === "my-challenges") ? styles.activeNavLink : {})
                            }}
                        >
                            <Layers size={16} />
                            <span>My Grievances</span>
                        </button>

                        <button
                            onClick={() => handleTabClick("community-map")}
                            style={{
                                ...styles.navLink,
                                ...(isHome && activeTab === "community-map" ? styles.activeNavLink : {})
                            }}
                        >
                            <MapPin size={16} />
                            <span>National Map</span>
                        </button>

                        <button
                            onClick={() => handleTabClick("showcase")}
                            style={{
                                ...styles.navLink,
                                ...(isHome && activeTab === "showcase" ? styles.activeNavLink : {})
                            }}
                        >
                            <CheckCircle2 size={16} />
                            <span>Solved Showcase</span>
                        </button>

                        <button
                            onClick={() => handleTabClick("network")}
                            style={{
                                ...styles.navLink,
                                ...(isHome && activeTab === "network" ? styles.activeNavLink : {})
                            }}
                        >
                            <Building2 size={16} />
                            <span>Universities & CSR</span>
                        </button>
                    </nav>

                    {/* Action Buttons & Persona Links */}
                    <div className="nav-actions-group" style={styles.navActions}>
                        <Link to="/challenges/new" className="submit-challenge-nav-btn" style={styles.submitBtn}>
                            <PlusCircle size={16} />
                            <span>Submit Challenge</span>
                        </Link>

                        {/* Direct Link to Residential Society Maintenance Portal */}
                        <Link to="/society/resident" style={styles.societyNavBtn} title="Residential Society Maintenance Portal">
                            <Building2 size={15} />
                            <span>Society Portal</span>
                        </Link>

                        {/* Direct Link to University (HEI) Portal */}
                        <Link to="/university" style={styles.universityBtn} title="Higher Education Institutions (HEIs) & Faculty Portal">
                            <GraduationCap size={15} />
                            <span>University Hub</span>
                        </Link>

                        {/* Direct Link to Nodal Admin Portal */}
                        <Link to="/admin" style={styles.adminBtn} title="State Nodal Officer & HEI Governance Command Center">
                            <ShieldCheck size={15} />
                            <span>Nodal Admin</span>
                        </Link>

                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={styles.iconBtn}
                                title="Notifications & Nodal Updates"
                            >
                                <Bell size={17} color="#475569" />
                                <span style={styles.notifBadge}>2</span>
                            </button>

                            {showNotifications && (
                                <div style={styles.notifDropdown}>
                                    <div style={styles.notifHeader}>
                                        <strong>Live Collaboration Updates</strong>
                                    </div>
                                    <div style={styles.notifItem}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0284c7" }}>
                                            DTU Delhi • Urban Mobility Lab
                                        </div>
                                        <div style={{ fontSize: 12, color: "#475569" }}>
                                            Field pilot deployed for community infrastructure challenge. Verification requested.
                                        </div>
                                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>2 hours ago</div>
                                    </div>
                                    <div style={styles.notifItem}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
                                            National Innovation Fund
                                        </div>
                                        <div style={{ fontSize: 12, color: "#475569" }}>
                                            ₹3.5 Lakhs Pilot Grant approved for low-cost water filtration project.
                                        </div>
                                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>Yesterday</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={styles.userProfile}>
                            <div style={styles.avatar}>IN</div>
                            <div style={styles.userInfo}>
                                <div style={styles.userName}>Citizen / Resident</div>
                                <div style={styles.userRole}>Adhikar Network</div>
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
        boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        borderBottom: "1px solid #e2e8f0"
    },
    mainNav: {
        padding: "10px 0"
    },
    container: {
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px"
    },
    brand: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        textDecoration: "none",
        color: "inherit",
        flexShrink: 0
    },
    logoBadge: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: "linear-gradient(135deg, #0284c7 0%, #16a34a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 3px 10px rgba(2, 132, 199, 0.25)",
        flexShrink: 0
    },
    brandTitle: {
        fontSize: "20px",
        fontWeight: 800,
        color: "#0f172a",
        letterSpacing: "-0.02em",
        lineHeight: 1
    },
    brandHighlight: {
        color: "#0284c7"
    },
    navLinks: {
        display: "flex",
        alignItems: "center",
        gap: "4px"
    },
    navLink: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "7px 11px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#475569",
        textDecoration: "none",
        background: "none",
        border: "none",
        cursor: "pointer",
        transition: "all 0.15s ease"
    },
    activeNavLink: {
        background: "#e0f2fe",
        color: "#0369a1",
        fontWeight: 700
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
        padding: "8px 13px",
        borderRadius: "9px",
        fontSize: "12.5px",
        fontWeight: 700,
        textDecoration: "none",
        boxShadow: "0 3px 12px rgba(2, 132, 199, 0.3)",
        whiteSpace: "nowrap"
    },
    societyNavBtn: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        background: "#ecfdf5",
        color: "#059669",
        padding: "7px 11px",
        borderRadius: "9px",
        fontSize: "12px",
        fontWeight: 700,
        textDecoration: "none",
        border: "1px solid #a7f3d0",
        whiteSpace: "nowrap",
    },
    universityBtn: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        background: "#f5f3ff",
        color: "#7c3aed",
        padding: "7px 11px",
        borderRadius: "9px",
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
        borderRadius: "9px",
        fontSize: "12px",
        fontWeight: 700,
        textDecoration: "none",
        border: "1px solid #334155",
        whiteSpace: "nowrap"
    },
    iconBtn: {
        width: "34px",
        height: "34px",
        borderRadius: "9px",
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "pointer"
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
        borderRadius: "9px",
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
        border: "1px solid #e2e8f0",
        cursor: "pointer"
    }
};
