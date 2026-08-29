import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchComplaints = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                "/complaints/my"
            );

            setComplaints(response.data);
            setError("");
        } catch (err) {
            console.error(
                "My complaints error:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            setError(
                "Unable to load your complaints."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const pending = complaints.filter(
        (c) => c.status === "PENDING"
    ).length;

    const inProgress = complaints.filter(
        (c) => c.status === "IN_PROGRESS"
    ).length;

    const resolved = complaints.filter(
        (c) => c.status === "RESOLVED"
    ).length;

    return (
        <div style={styles.app}>

            {/* ================= SIDEBAR ================= */}

            <aside style={styles.sidebar}>

                <div style={styles.brand}>
                    <div style={styles.brandIcon}>
                        A
                    </div>

                    <div>
                        <div style={styles.brandName}>
                            Adhikar AI
                        </div>

                        <div style={styles.brandSub}>
                            Smart Governance
                        </div>
                    </div>
                </div>

                <div style={styles.sidebarDivider} />

                <nav style={styles.nav}>

                    <button
                        style={{
                            ...styles.navItem,
                            ...styles.activeNavItem,
                        }}
                    >
                        <span style={styles.navIcon}>
                            ▦
                        </span>

                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            document
                                .getElementById(
                                    "complaints"
                                )
                                ?.scrollIntoView({
                                    behavior: "smooth",
                                })
                        }
                        style={styles.navItem}
                    >
                        <span style={styles.navIcon}>
                            ▤
                        </span>

                        Complaints
                    </button>

                    <button
                        style={styles.navItem}
                        onClick={() =>
                            alert(
                                "Map View will be available soon."
                            )
                        }
                    >
                        <span style={styles.navIcon}>
                            ◉
                        </span>

                        Map View

                        <span style={styles.comingSoon}>
                            Soon
                        </span>
                    </button>

                    <button
                        style={styles.navItem}
                        onClick={() =>
                            alert(
                                "Analytics will be available soon."
                            )
                        }
                    >
                        <span style={styles.navIcon}>
                            ▥
                        </span>

                        Analytics

                        <span style={styles.comingSoon}>
                            Soon
                        </span>
                    </button>

                    <button
                        style={styles.navItem}
                        onClick={() =>
                            alert(
                                "Reports will be available soon."
                            )
                        }
                    >
                        <span style={styles.navIcon}>
                            ▧
                        </span>

                        Reports

                        <span style={styles.comingSoon}>
                            Soon
                        </span>
                    </button>

                    <button
                        style={styles.navItem}
                        onClick={() =>
                            alert(
                                "Settings will be available soon."
                            )
                        }
                    >
                        <span style={styles.navIcon}>
                            ⚙
                        </span>

                        Settings

                        <span style={styles.comingSoon}>
                            Soon
                        </span>
                    </button>

                </nav>

                <div style={styles.sidebarBottom}>

                    <div style={styles.userBox}>

                        <div style={styles.avatar}>
                            C
                        </div>

                        <div style={styles.userInfo}>

                            <strong style={styles.userName}>
                                Citizen
                            </strong>

                            <span style={styles.userRole}>
                                Citizen Account
                            </span>

                        </div>

                    </div>

                    <button
                        onClick={() => {
                            localStorage.removeItem(
                                "token"
                            );

                            navigate("/login");
                        }}
                        style={styles.logout}
                    >
                        <span>
                            ↪
                        </span>

                        Logout
                    </button>

                </div>

            </aside>

            {/* ================= MAIN ================= */}

            <main style={styles.main}>

                {/* TOP BAR */}

                <header style={styles.topbar}>

                    <div>
                        <span style={styles.pageLabel}>
                            Overview
                        </span>

                        <h1 style={styles.heading}>
                            Dashboard
                        </h1>

                        <p style={styles.subtitle}>
                            Track your civic complaints
                            and their current status.
                        </p>
                    </div>

                    <div style={styles.topActions}>

                        <button
                            style={styles.notification}
                            onClick={() =>
                                alert(
                                    "No new notifications."
                                )
                            }
                        >
                            🔔
                        </button>

                        <button
                            style={styles.refresh}
                            onClick={fetchComplaints}
                            disabled={loading}
                        >
                            ↻ Refresh
                        </button>

                        <button
                            style={styles.newComplaint}
                            onClick={() =>
                                navigate(
                                    "/complaints/new"
                                )
                            }
                        >
                            + New Complaint
                        </button>

                    </div>

                </header>

                {/* ================= STATS ================= */}

                <section style={styles.stats}>

                    <StatCard
                        title="Total Complaints"
                        value={complaints.length}
                        icon="▤"
                        color="#2563eb"
                        background="#eff6ff"
                    />

                    <StatCard
                        title="Pending"
                        value={pending}
                        icon="◷"
                        color="#d97706"
                        background="#fffbeb"
                    />

                    <StatCard
                        title="In Progress"
                        value={inProgress}
                        icon="↻"
                        color="#4f46e5"
                        background="#eef2ff"
                    />

                    <StatCard
                        title="Resolved"
                        value={resolved}
                        icon="✓"
                        color="#16a34a"
                        background="#f0fdf4"
                    />

                </section>

                {/* ================= QUICK ACTION ================= */}

                <section style={styles.welcomeCard}>

                    <div style={styles.welcomeLeft}>

                        <div style={styles.welcomeIcon}>
                            ✦
                        </div>

                        <div>

                            <h2 style={styles.welcomeTitle}>
                                Need to report a civic issue?
                            </h2>

                            <p style={styles.welcomeText}>
                                Submit a complaint and let
                                Adhikar AI classify its
                                category and priority.
                            </p>

                        </div>

                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                "/complaints/new"
                            )
                        }
                        style={styles.reportButton}
                    >
                        Report an Issue →
                    </button>

                </section>

                {/* ================= ERROR ================= */}

                {error && (
                    <div style={styles.error}>
                        ⚠ {error}
                    </div>
                )}

                {/* ================= COMPLAINTS ================= */}

                <section
                    id="complaints"
                    style={styles.complaintsSection}
                >

                    <div style={styles.sectionHeader}>

                        <div>

                            <span style={styles.sectionEyebrow}>
                                YOUR ACTIVITY
                            </span>

                            <h2 style={styles.sectionTitle}>
                                Recent Complaints
                            </h2>

                        </div>

                        <span style={styles.countBadge}>
                            {complaints.length}{" "}
                            {complaints.length === 1
                                ? "Complaint"
                                : "Complaints"}
                        </span>

                    </div>

                    {loading && (
                        <div style={styles.loading}>
                            <div style={styles.loader} />

                            <span>
                                Loading your complaints...
                            </span>
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        complaints.length === 0 && (
                            <div style={styles.empty}>

                                <div style={styles.emptyIcon}>
                                    📋
                                </div>

                                <h3 style={styles.emptyTitle}>
                                    No complaints yet
                                </h3>

                                <p style={styles.emptyText}>
                                    You haven't submitted
                                    any complaints yet.
                                </p>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/complaints/new"
                                        )
                                    }
                                    style={
                                        styles.emptyButton
                                    }
                                >
                                    + Submit Your First
                                    Complaint
                                </button>

                            </div>
                        )}

                    {!loading &&
                        complaints.map(
                            (complaint) => (
                                <ComplaintCard
                                    key={complaint.id}
                                    complaint={
                                        complaint
                                    }
                                />
                            )
                        )}

                </section>

            </main>

        </div>
    );
}


/* =====================================================
   COMPLAINT CARD
===================================================== */

function ComplaintCard({ complaint }) {

    const formattedDate =
        complaint.createdAt
            ? new Date(
                complaint.createdAt
            ).toLocaleString()
            : "N/A";

    return (
        <article style={styles.complaint}>

            {/* CARD HEADER */}

            <div style={styles.cardHeader}>

                <div style={styles.cardTitleArea}>

                    <div style={styles.complaintNumber}>
                        #{complaint.id}
                    </div>

                    <div>

                        <h3 style={styles.title}>
                            {complaint.title}
                        </h3>

                        <span style={styles.submitted}>
                            Submitted {formattedDate}
                        </span>

                    </div>

                </div>

                <span
                    style={{
                        ...styles.status,
                        ...getStatusStyle(
                            complaint.status
                        ),
                    }}
                >
                    <span style={styles.statusDot}>
                        ●
                    </span>

                    {formatStatus(
                        complaint.status
                    )}
                </span>

            </div>

            {/* DESCRIPTION */}

            <p style={styles.description}>
                {complaint.description}
            </p>

            {/* DETAILS */}

            <div style={styles.details}>

                <Detail
                    icon="✦"
                    label="AI Category"
                    value={
                        complaint.aiCategory ||
                        "N/A"
                    }
                    color="#7c3aed"
                />

                <Detail
                    icon="!"
                    label="Priority"
                    value={
                        complaint.priority ||
                        "N/A"
                    }
                    color={
                        complaint.priority ===
                        "HIGH"
                            ? "#dc2626"
                            : complaint.priority ===
                            "MEDIUM"
                                ? "#d97706"
                                : "#16a34a"
                    }
                />

                <Detail
                    icon="⌖"
                    label="Location"
                    value={
                        complaint.location ||
                        "N/A"
                    }
                    color="#475569"
                />

            </div>

            {/* EVIDENCE */}

            {complaint.evidenceImageUrl && (
                <div style={styles.evidence}>

                    <div style={styles.evidenceHeader}>

                        <div>
                            <span style={styles.evidenceLabel}>
                                EVIDENCE
                            </span>

                            <strong>
                                Uploaded Image
                            </strong>
                        </div>

                        <a
                            href={
                                complaint.evidenceImageUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            style={styles.viewEvidence}
                        >
                            View full image ↗
                        </a>

                    </div>

                    <a
                        href={
                            complaint.evidenceImageUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img
                            src={
                                complaint.evidenceImageUrl
                            }
                            alt="Complaint evidence"
                            style={styles.evidenceImage}
                        />
                    </a>

                </div>
            )}

            {/* STATUS TIMELINE */}

            <StatusProgress
                status={complaint.status}
            />

        </article>
    );
}


/* =====================================================
   STATUS PROGRESS
===================================================== */

function StatusProgress({ status }) {

    const steps = [
        {
            key: "PENDING",
            label: "Submitted",
        },
        {
            key: "IN_PROGRESS",
            label: "In Progress",
        },
        {
            key: "RESOLVED",
            label: "Resolved",
        },
    ];

    const statusIndex =
        status === "PENDING"
            ? 0
            : status === "IN_PROGRESS"
                ? 1
                : status === "RESOLVED"
                    ? 2
                    : -1;

    return (
        <div style={styles.progress}>

            {steps.map(
                (step, index) => {

                    const completed =
                        index <= statusIndex;

                    return (
                        <div
                            key={step.key}
                            style={styles.progressStep}
                        >

                            <div
                                style={{
                                    ...styles.circle,
                                    backgroundColor:
                                        completed
                                            ? "#2563eb"
                                            : "#e2e8f0",
                                    color:
                                        completed
                                            ? "#ffffff"
                                            : "#94a3b8",
                                }}
                            >
                                {completed
                                    ? "✓"
                                    : index + 1}
                            </div>

                            <span
                                style={{
                                    ...styles.stepLabel,
                                    color:
                                        completed
                                            ? "#2563eb"
                                            : "#94a3b8",
                                }}
                            >
                                {step.label}
                            </span>

                            {index <
                                steps.length - 1 && (
                                    <div
                                        style={{
                                            ...styles.line,
                                            backgroundColor:
                                                index <
                                                statusIndex
                                                    ? "#2563eb"
                                                    : "#e2e8f0",
                                        }}
                                    />
                                )}

                        </div>
                    );
                }
            )}

        </div>
    );
}


/* =====================================================
   DETAIL
===================================================== */

function Detail({
                    icon,
                    label,
                    value,
                    color,
                }) {
    return (
        <div style={styles.detail}>

            <div
                style={{
                    ...styles.detailIcon,
                    color: color,
                }}
            >
                {icon}
            </div>

            <div>

                <span style={styles.detailLabel}>
                    {label}
                </span>

                <strong
                    style={{
                        ...styles.detailValue,
                        color: color,
                    }}
                >
                    {value}
                </strong>

            </div>

        </div>
    );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
                      title,
                      value,
                      icon,
                      color,
                      background,
                  }) {
    return (
        <div style={styles.statCard}>

            <div style={styles.statTop}>

                <div
                    style={{
                        ...styles.statIcon,
                        color: color,
                        backgroundColor:
                        background,
                    }}
                >
                    {icon}
                </div>

            </div>

            <div
                style={{
                    ...styles.statNumber,
                    color: "#0f172a",
                }}
            >
                {value}
            </div>

            <div style={styles.statTitle}>
                {title}
            </div>

        </div>
    );
}


/* =====================================================
   HELPERS
===================================================== */

function formatStatus(status) {

    if (!status) {
        return "Unknown";
    }

    return status
        .toLowerCase()
        .replace("_", " ")
        .replace(
            /^\w/,
            (c) => c.toUpperCase()
        );
}


function getStatusStyle(status) {

    const map = {

        PENDING: {
            backgroundColor: "#fff7ed",
            color: "#c2410c",
        },

        IN_PROGRESS: {
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
        },

        RESOLVED: {
            backgroundColor: "#f0fdf4",
            color: "#15803d",
        },

        REJECTED: {
            backgroundColor: "#fef2f2",
            color: "#b91c1c",
        },

    };

    return (
        map[status] ||
        map.PENDING
    );
}


/* =====================================================
   STYLES
===================================================== */

const styles = {

    /* APP */

    app: {
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#f5f7fb",
        color: "#0f172a",
        fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    /* SIDEBAR */

    sidebar: {
        width: "245px",
        minHeight: "100vh",
        background:
            "linear-gradient(180deg, #0b1b2a 0%, #071522 100%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
        boxShadow:
            "4px 0 20px rgba(15, 23, 42, 0.12)",
    },

    brand: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "24px 20px",
    },

    brandIcon: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, #2563eb, #4f46e5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "19px",
        fontWeight: "800",
        boxShadow:
            "0 5px 15px rgba(37, 99, 235, 0.3)",
    },

    brandName: {
        fontSize: "17px",
        fontWeight: "700",
        letterSpacing: "-0.2px",
    },

    brandSub: {
        color: "#8da0b4",
        fontSize: "10px",
        marginTop: "2px",
    },

    sidebarDivider: {
        height: "1px",
        backgroundColor:
            "rgba(255,255,255,0.08)",
        margin: "0 16px 16px",
    },

    nav: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        padding: "0 12px",
    },

    navItem: {
        width: "100%",
        border: "none",
        backgroundColor: "transparent",
        color: "#aab8c7",
        padding: "11px 13px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textAlign: "left",
        fontSize: "13px",
        cursor: "pointer",
        transition: "0.2s",
    },

    activeNavItem: {
        background:
            "linear-gradient(90deg, #2563eb, #3b82f6)",
        color: "#ffffff",
        boxShadow:
            "0 5px 14px rgba(37, 99, 235, 0.25)",
    },

    navIcon: {
        width: "20px",
        textAlign: "center",
        fontSize: "16px",
    },

    comingSoon: {
        marginLeft: "auto",
        fontSize: "9px",
        color: "#64748b",
        backgroundColor:
            "rgba(255,255,255,0.06)",
        padding: "3px 5px",
        borderRadius: "4px",
    },

    sidebarBottom: {
        marginTop: "auto",
        padding: "16px 12px 20px",
    },

    userBox: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px",
        marginBottom: "8px",
        borderRadius: "9px",
        backgroundColor:
            "rgba(255,255,255,0.05)",
    },

    avatar: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700",
        fontSize: "13px",
    },

    userInfo: {
        display: "flex",
        flexDirection: "column",
    },

    userName: {
        fontSize: "12px",
        color: "#ffffff",
    },

    userRole: {
        fontSize: "10px",
        color: "#7f93a7",
        marginTop: "2px",
    },

    logout: {
        width: "100%",
        border: "none",
        backgroundColor: "transparent",
        color: "#aab8c7",
        padding: "9px 12px",
        borderRadius: "7px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        gap: "10px",
        alignItems: "center",
        fontSize: "12px",
    },

    /* MAIN */

    main: {
        marginLeft: "245px",
        width: "calc(100% - 245px)",
        minHeight: "100vh",
        padding: "0 38px 50px",
        boxSizing: "border-box",
    },

    topbar: {
        minHeight: "105px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom:
            "1px solid #e5eaf1",
        marginBottom: "28px",
    },

    pageLabel: {
        color: "#64748b",
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        fontWeight: "600",
    },

    heading: {
        margin: "4px 0 2px",
        fontSize: "27px",
        fontWeight: "700",
        letterSpacing: "-0.6px",
        color: "#0f172a",
    },

    subtitle: {
        margin: 0,
        color: "#64748b",
        fontSize: "13px",
    },

    topActions: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
    },

    notification: {
        width: "38px",
        height: "38px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "15px",
    },

    refresh: {
        height: "38px",
        padding: "0 13px",
        border: "1px solid #dbe2ea",
        backgroundColor: "#ffffff",
        color: "#475569",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600",
    },

    newComplaint: {
        height: "38px",
        padding: "0 15px",
        border: "none",
        background:
            "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "#ffffff",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600",
        boxShadow:
            "0 4px 10px rgba(37, 99, 235, 0.2)",
    },

    /* STATS */

    stats: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "15px",
        marginBottom: "20px",
    },

    statCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5eaf1",
        borderRadius: "11px",
        padding: "18px",
        boxShadow:
            "0 2px 8px rgba(15, 23, 42, 0.025)",
    },

    statTop: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "12px",
    },

    statIcon: {
        width: "34px",
        height: "34px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        fontWeight: "700",
    },

    statNumber: {
        fontSize: "27px",
        fontWeight: "750",
        lineHeight: "1",
    },

    statTitle: {
        color: "#64748b",
        fontSize: "12px",
        marginTop: "7px",
    },

    /* WELCOME */

    welcomeCard: {
        background:
            "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)",
        border: "1px solid #dbeafe",
        borderRadius: "12px",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "30px",
    },

    welcomeLeft: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
    },

    welcomeIcon: {
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        backgroundColor: "#ffffff",
        color: "#4f46e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        boxShadow:
            "0 3px 10px rgba(79, 70, 229, 0.08)",
    },

    welcomeTitle: {
        margin: 0,
        fontSize: "14px",
        color: "#1e293b",
    },

    welcomeText: {
        margin: "4px 0 0",
        fontSize: "11px",
        color: "#64748b",
    },

    reportButton: {
        border: "none",
        backgroundColor: "#ffffff",
        color: "#2563eb",
        padding: "9px 13px",
        borderRadius: "7px",
        fontSize: "11px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow:
            "0 2px 7px rgba(15, 23, 42, 0.06)",
    },

    /* SECTION */

    complaintsSection: {
        scrollMarginTop: "20px",
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "end",
        marginBottom: "15px",
    },

    sectionEyebrow: {
        fontSize: "10px",
        color: "#94a3b8",
        letterSpacing: "1px",
        fontWeight: "700",
    },

    sectionTitle: {
        margin: "4px 0 0",
        fontSize: "19px",
        color: "#0f172a",
    },

    countBadge: {
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        color: "#64748b",
        borderRadius: "20px",
        padding: "6px 10px",
        fontSize: "11px",
    },

    /* COMPLAINT */

    complaint: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5eaf1",
        borderRadius: "12px",
        padding: "21px",
        marginBottom: "15px",
        boxShadow:
            "0 2px 10px rgba(15, 23, 42, 0.025)",
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
    },

    cardTitleArea: {
        display: "flex",
        alignItems: "flex-start",
        gap: "11px",
    },

    complaintNumber: {
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        backgroundColor: "#eff6ff",
        color: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        fontWeight: "700",
        flexShrink: 0,
    },

    title: {
        margin: 0,
        color: "#0f172a",
        fontSize: "15px",
        fontWeight: "700",
    },

    submitted: {
        display: "block",
        marginTop: "4px",
        color: "#94a3b8",
        fontSize: "10px",
    },

    status: {
        padding: "6px 10px",
        borderRadius: "20px",
        fontSize: "10px",
        fontWeight: "700",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: "5px",
    },

    statusDot: {
        fontSize: "7px",
    },

    description: {
        color: "#475569",
        lineHeight: "1.65",
        fontSize: "12px",
        margin: "18px 0",
        maxWidth: "900px",
    },

    details: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, 1fr)",
        gap: "10px",
        borderTop: "1px solid #f1f5f9",
        paddingTop: "15px",
    },

    detail: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },

    detailIcon: {
        width: "28px",
        height: "28px",
        borderRadius: "7px",
        backgroundColor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: "700",
    },

    detailLabel: {
        display: "block",
        color: "#94a3b8",
        fontSize: "9px",
        textTransform: "uppercase",
        letterSpacing: "0.4px",
    },

    detailValue: {
        display: "block",
        marginTop: "2px",
        fontSize: "12px",
    },

    /* EVIDENCE */

    evidence: {
        marginTop: "17px",
        paddingTop: "17px",
        borderTop: "1px solid #f1f5f9",
    },

    evidenceHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
    },

    evidenceLabel: {
        display: "block",
        color: "#94a3b8",
        fontSize: "9px",
        letterSpacing: "0.7px",
        marginBottom: "2px",
    },

    viewEvidence: {
        color: "#2563eb",
        textDecoration: "none",
        fontSize: "10px",
        fontWeight: "600",
    },

    evidenceImage: {
        width: "170px",
        height: "105px",
        objectFit: "cover",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        display: "block",
        cursor: "pointer",
    },

    /* PROGRESS */

    progress: {
        display: "flex",
        alignItems: "center",
        marginTop: "19px",
        paddingTop: "17px",
        borderTop: "1px solid #f1f5f9",
    },

    progressStep: {
        display: "flex",
        alignItems: "center",
        flex: 1,
    },

    circle: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        fontWeight: "700",
        flexShrink: 0,
    },

    stepLabel: {
        marginLeft: "6px",
        fontSize: "10px",
        fontWeight: "600",
        whiteSpace: "nowrap",
    },

    line: {
        height: "2px",
        flex: 1,
        margin: "0 8px",
        borderRadius: "3px",
    },

    /* STATES */

    loading: {
        minHeight: "150px",
        backgroundColor: "#ffffff",
        border: "1px solid #e5eaf1",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        color: "#64748b",
        fontSize: "12px",
    },

    loader: {
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        border:
            "2px solid #dbeafe",
        borderTopColor: "#2563eb",
    },

    empty: {
        backgroundColor: "#ffffff",
        border: "1px solid #e5eaf1",
        borderRadius: "12px",
        padding: "55px 20px",
        textAlign: "center",
    },

    emptyIcon: {
        width: "50px",
        height: "50px",
        margin: "0 auto 12px",
        borderRadius: "12px",
        backgroundColor: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "23px",
    },

    emptyTitle: {
        margin: 0,
        fontSize: "16px",
        color: "#0f172a",
    },

    emptyText: {
        color: "#64748b",
        fontSize: "12px",
        margin: "7px 0 17px",
    },

    emptyButton: {
        padding: "10px 15px",
        border: "none",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        borderRadius: "7px",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "600",
    },

    error: {
        backgroundColor: "#fef2f2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "20px",
        fontSize: "12px",
    },
};

export default Dashboard;