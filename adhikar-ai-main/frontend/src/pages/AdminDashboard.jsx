import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";


// =====================================================
// LEAFLET MARKER SETUP
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// =====================================================
// PRIORITY COLORS
// =====================================================

const MAP_PIN_COLORS = {
    HIGH: "#ef4444",
    MEDIUM: "#f59e0b",
    LOW: "#22c55e",
    RESOLVED: "#6b7280",
};


// =====================================================
// CREATE PRIORITY PIN
// =====================================================

function createPriorityIcon(priority, isResolved = false) {

    const color = isResolved
        ? MAP_PIN_COLORS.RESOLVED
        : MAP_PIN_COLORS[priority] ||
        MAP_PIN_COLORS.MEDIUM;

    return L.divIcon({

        className: "adhikar-map-pin",

        html: `
            <div
                style="
                    width: 26px;
                    height: 26px;
                    border-radius: 50% 50% 50% 0;
                    background: ${color};
                    border: 3px solid white;
                    box-shadow: 0 3px 10px rgba(0,0,0,.45);
                    transform: rotate(-45deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                "
            >
                <span
                    style="
                        width: 7px;
                        height: 7px;
                        background: white;
                        border-radius: 50%;
                        display: block;
                    "
                ></span>
            </div>
        `,

        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
}


// =====================================================
// AUTO FIT MAP
// =====================================================

function MapAutoFit({ complaints }) {

    const map = useMap();

    useEffect(() => {

        if (!complaints.length) {
            return;
        }

        const bounds = L.latLngBounds(
            complaints.map((complaint) => [
                Number(
                    complaint.latitude ??
                    complaint.lat
                ),

                Number(
                    complaint.longitude ??
                    complaint.lng ??
                    complaint.lon
                ),
            ])
        );

        map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 15,
        });

    }, [complaints, map]);

    return null;
}


// =====================================================
// MAIN DASHBOARD
// =====================================================

function AdminDashboard() {

    const [complaints, setComplaints] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [categoryFilter, setCategoryFilter] =
        useState("ALL");

    const [priorityFilter, setPriorityFilter] =
        useState("ALL");


    // =================================================
    // FETCH COMPLAINTS
    // =================================================

    const fetchComplaints = async () => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    "/admin/complaints"
                );

            setComplaints(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

            setError("");

        } catch (err) {

            console.error(
                "Admin complaints error:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {

                setError(
                    "You are not authorized to access the Admin Dashboard."
                );

            } else {

                setError(
                    "Unable to load complaints."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        fetchComplaints();

    }, []);


    // =================================================
    // UPDATE STATUS
    // =================================================

    const updateStatus = async (
        id,
        status
    ) => {

        try {

            await api.put(
                `/admin/complaints/${id}/status`,
                { status }
            );

            await fetchComplaints();

        } catch (err) {

            console.error(
                "Status update error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to update complaint status."
            );
        }
    };


    // =================================================
    // STATISTICS
    // =================================================

    const pending =
        complaints.filter(
            (c) =>
                c.status === "PENDING"
        ).length;


    const inProgress =
        complaints.filter(
            (c) =>
                c.status === "IN_PROGRESS"
        ).length;


    const resolved =
        complaints.filter(
            (c) =>
                c.status === "RESOLVED"
        ).length;


    const rejected =
        complaints.filter(
            (c) =>
                c.status === "REJECTED"
        ).length;


    const highPriority =
        complaints.filter(
            (c) =>
                c.priority === "HIGH"
        ).length;


    const unassigned =
        complaints.filter(
            (c) =>
                !c.assignedTo &&
                !c.assignedOfficer &&
                c.status !== "RESOLVED" &&
                c.status !== "REJECTED"
        ).length;


    const resolvedToday =
        complaints.filter((c) => {

            if (
                c.status !==
                "RESOLVED"
            ) {
                return false;
            }

            const dateValue =
                c.updatedAt ||
                c.resolvedAt ||
                c.createdAt ||
                c.submittedAt;

            if (!dateValue) {
                return false;
            }

            const date =
                new Date(dateValue);

            const today =
                new Date();

            return (
                date.getDate() ===
                today.getDate() &&
                date.getMonth() ===
                today.getMonth() &&
                date.getFullYear() ===
                today.getFullYear()
            );

        }).length;


    // =================================================
    // CATEGORIES
    // =================================================

    const categories = [
        ...new Set(
            complaints
                .map(
                    (c) =>
                        c.aiCategory
                )
                .filter(Boolean)
        ),
    ];


    // =================================================
    // CATEGORY STATS
    // =================================================

    const categoryStats =
        useMemo(() => {

            const counts = {};

            complaints.forEach(
                (complaint) => {

                    const category =
                        complaint.aiCategory ||
                        complaint.category ||
                        "General";

                    counts[category] =
                        (counts[category] || 0) +
                        1;
                }
            );

            return Object.entries(
                counts
            )
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .slice(0, 6);

        }, [complaints]);


    // =================================================
    // PRIORITY QUEUE
    // =================================================

    const priorityQueue =
        useMemo(() => {

            const order = {
                HIGH: 0,
                MEDIUM: 1,
                LOW: 2,
            };

            return [...complaints]
                .filter(
                    (c) =>
                        c.status !==
                        "RESOLVED" &&
                        c.status !==
                        "REJECTED"
                )
                .sort(
                    (a, b) =>
                        (order[a.priority] ?? 3) -
                        (order[b.priority] ?? 3)
                )
                .slice(0, 5);

        }, [complaints]);


    // =================================================
    // MAP COMPLAINTS
    // =================================================

    const mapComplaints =
        useMemo(() => {

            return complaints.filter(
                (complaint) => {

                    const lat =
                        complaint.latitude ??
                        complaint.lat;

                    const lng =
                        complaint.longitude ??
                        complaint.lng ??
                        complaint.lon;

                    return (
                        lat !== null &&
                        lat !== undefined &&
                        lng !== null &&
                        lng !== undefined &&
                        !Number.isNaN(
                            Number(lat)
                        ) &&
                        !Number.isNaN(
                            Number(lng)
                        )
                    );
                }
            );

        }, [complaints]);


    // =================================================
    // FILTERED COMPLAINTS
    // =================================================

    const filteredComplaints =
        useMemo(() => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();

            return complaints.filter(
                (complaint) => {

                    // Resolved complaints disappear from dashboard lists
                    // but remain visible on the map as grey markers.
                    if (complaint.status === "RESOLVED") {
                        return false;
                    }

                    const matchesSearch =
                        !searchText ||
                        complaint.title
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        complaint.description
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        complaint.location
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        complaint.citizenEmail
                            ?.toLowerCase()
                            .includes(
                                searchText
                            );


                    const matchesStatus =
                        statusFilter ===
                        "ALL" ||
                        complaint.status ===
                        statusFilter;


                    const matchesCategory =
                        categoryFilter ===
                        "ALL" ||
                        complaint.aiCategory ===
                        categoryFilter;


                    const matchesPriority =
                        priorityFilter ===
                        "ALL" ||
                        complaint.priority ===
                        priorityFilter;


                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesCategory &&
                        matchesPriority
                    );
                }
            );

        }, [
            complaints,
            search,
            statusFilter,
            categoryFilter,
            priorityFilter,
        ]);


    // =================================================
    // CLEAR FILTERS
    // =================================================

    const clearFilters = () => {

        setSearch("");
        setStatusFilter("ALL");
        setCategoryFilter("ALL");
        setPriorityFilter("ALL");

    };


    const resolutionRate =
        complaints.length > 0
            ? Math.round(
                (resolved /
                    complaints.length) *
                100
            )
            : 0;


    // =================================================
    // NAVIGATION
    // =================================================

    const scrollTo = (id) => {

        document
            .getElementById(id)
            ?.scrollIntoView({
                behavior: "smooth",
            });

    };


    // =================================================
    // RENDER
    // =================================================

    return (

        <div style={styles.app}>

            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <aside style={styles.sidebar}>

                <div style={styles.brand}>

                    <div
                        style={
                            styles.brandIcon
                        }
                    >
                        A
                    </div>

                    <div>

                        <div
                            style={
                                styles.brandName
                            }
                        >
                            Adhikar AI
                        </div>

                        <div
                            style={
                                styles.brandSub
                            }
                        >
                            Smart Governance
                        </div>

                    </div>

                </div>


                <div
                    style={
                        styles.divider
                    }
                />


                <nav style={styles.nav}>

                    <button
                        style={{
                            ...styles.navItem,
                            ...styles.activeNavItem,
                        }}
                        onClick={() =>
                            window.scrollTo({
                                top: 0,
                                behavior:
                                    "smooth",
                            })
                        }
                    >
                        ▦ &nbsp; Dashboard
                    </button>


                    <button
                        style={
                            styles.navItem
                        }
                        onClick={() =>
                            scrollTo(
                                "all-complaints"
                            )
                        }
                    >
                        ▤ &nbsp; All Complaints
                    </button>


                    <button
                        style={
                            styles.navItem
                        }
                        onClick={() =>
                            scrollTo(
                                "priority-queue"
                            )
                        }
                    >
                        ⚠ &nbsp; Priority Queue

                        {highPriority >
                            0 && (
                                <span
                                    style={
                                        styles.navCount
                                    }
                                >
                                {highPriority}
                            </span>
                            )}
                    </button>


                    <button
                        style={
                            styles.navItem
                        }
                        onClick={() =>
                            scrollTo(
                                "unassigned"
                            )
                        }
                    >
                        ♙ &nbsp; Unassigned

                        {unassigned >
                            0 && (
                                <span
                                    style={
                                        styles.navCount
                                    }
                                >
                                {unassigned}
                            </span>
                            )}
                    </button>


                    {/* REAL MAP BUTTON */}

                    <button
                        style={
                            styles.navItem
                        }
                        onClick={() =>
                            scrollTo(
                                "complaint-map"
                            )
                        }
                    >
                        ⌖ &nbsp; Map View
                    </button>


                    <button
                        style={
                            styles.navItem
                        }
                        onClick={() =>
                            scrollTo(
                                "analytics"
                            )
                        }
                    >
                        ▥ &nbsp; Analytics
                    </button>


                    <button
                        style={
                            styles.navItem
                        }
                        onClick={() =>
                            alert(
                                "Reports module will be connected next."
                            )
                        }
                    >
                        ▧ &nbsp; Reports
                    </button>


                    <button
                        style={
                            styles.navItem
                        }
                        onClick={() =>
                            alert(
                                "Settings module will be connected next."
                            )
                        }
                    >
                        ⚙ &nbsp; Settings
                    </button>

                </nav>


                <div
                    style={
                        styles.sidebarBottom
                    }
                >

                    <div
                        style={
                            styles.userCard
                        }
                    >

                        <div
                            style={
                                styles.avatar
                            }
                        >
                            O
                        </div>

                        <div>

                            <strong
                                style={
                                    styles.userName
                                }
                            >
                                Officer Admin
                            </strong>

                            <span
                                style={
                                    styles.userRole
                                }
                            >
                                Admin Account
                            </span>

                            <span
                                style={
                                    styles.online
                                }
                            >
                                <span
                                    style={
                                        styles.onlineDot
                                    }
                                />

                                Online
                            </span>

                        </div>

                    </div>


                    <button
                        style={
                            styles.logout
                        }
                        onClick={() => {

                            localStorage.removeItem(
                                "token"
                            );

                            window.location.href =
                                "/login";

                        }}
                    >
                        ↪ &nbsp; Logout
                    </button>

                </div>

            </aside>


            {/* ==========================================
                MAIN
            ========================================== */}

            <main style={styles.main}>

                <header style={styles.header}>

                    <div>

                        <div
                            style={
                                styles.overline
                            }
                        >
                            CIVIC OPERATIONS COMMAND CENTER
                        </div>

                        <h1
                            style={
                                styles.heading
                            }
                        >
                            Admin Dashboard
                        </h1>

                        <p
                            style={
                                styles.subtitle
                            }
                        >
                            Monitor citizen complaints,
                            priorities and civic
                            operations.
                        </p>

                    </div>


                    <div
                        style={
                            styles.headerActions
                        }
                    >

                        <button
                            style={
                                styles.notification
                            }
                            onClick={() =>
                                alert(
                                    `${highPriority} high-priority complaint(s) need attention.`
                                )
                            }
                        >
                            🔔

                            {highPriority >
                                0 && (
                                    <span
                                        style={
                                            styles.notificationBadge
                                        }
                                    >
                                    {highPriority}
                                </span>
                                )}

                        </button>


                        <button
                            style={
                                styles.refresh
                            }
                            onClick={
                                fetchComplaints
                            }
                            disabled={
                                loading
                            }
                        >
                            ↻{" "}
                            {loading
                                ? "Refreshing..."
                                : "Refresh Data"}
                        </button>


                        <button
                            style={
                                styles.exportButton
                            }
                            onClick={() =>
                                alert(
                                    "Report export will be connected next."
                                )
                            }
                        >
                            ↓ Export Report
                        </button>

                    </div>

                </header>


                {/* ==========================================
                    STATS
                ========================================== */}

                <section
                    style={
                        styles.stats
                    }
                >

                    <AdminStat
                        icon="▤"
                        title="Total Complaints"
                        value={
                            complaints.length
                        }
                        subtitle="All time complaints"
                        color="#60a5fa"
                    />

                    <AdminStat
                        icon="⚠"
                        title="High Priority"
                        value={
                            highPriority
                        }
                        subtitle="Needs immediate attention"
                        color="#ef4444"
                    />

                    <AdminStat
                        icon="♙"
                        title="Unassigned"
                        value={
                            unassigned
                        }
                        subtitle="Awaiting assignment"
                        color="#f59e0b"
                    />

                    <AdminStat
                        icon="↻"
                        title="In Progress"
                        value={
                            inProgress
                        }
                        subtitle="Currently being handled"
                        color="#38bdf8"
                    />

                    <AdminStat
                        icon="✓"
                        title="Resolved Today"
                        value={
                            resolvedToday
                        }
                        subtitle="Completed today"
                        color="#22c55e"
                    />

                </section>


                {/* ==========================================
                    MAP + PRIORITY
                ========================================== */}

                <section
                    style={
                        styles.mainGrid
                    }
                >

                    {/* ======================================
                        REAL MAP
                    ====================================== */}

                    <div
                        id="complaint-map"
                        style={
                            styles.mapPanel
                        }
                    >

                        <div
                            style={
                                styles.panelHeader
                            }
                        >

                            <div>

                                <div
                                    style={
                                        styles.panelTitle
                                    }
                                >
                                    ⌖ &nbsp; Complaint Map
                                </div>

                                <div
                                    style={
                                        styles.panelSubtitle
                                    }
                                >
                                    Live complaint locations
                                    • pin color shows priority
                                </div>

                            </div>


                            <div
                                style={
                                    styles.mapCount
                                }
                            >
                                {mapComplaints.length}
                                {" "}
                                mapped
                            </div>

                        </div>


                        <div
                            style={
                                styles.realMap
                            }
                        >

                            <MapContainer
                                center={[
                                    28.6692,
                                    77.4538,
                                ]}
                                zoom={11}
                                scrollWheelZoom={
                                    true
                                }
                                style={{
                                    width:
                                        "100%",
                                    height:
                                        "100%",
                                }}
                            >

                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />


                                <MapAutoFit
                                    complaints={
                                        mapComplaints
                                    }
                                />


                                {mapComplaints.map(
                                    (
                                        complaint
                                    ) => {

                                        const lat =
                                            Number(
                                                complaint.latitude ??
                                                complaint.lat
                                            );

                                        const lng =
                                            Number(
                                                complaint.longitude ??
                                                complaint.lng ??
                                                complaint.lon
                                            );

                                        return (

                                            <Marker
                                                key={
                                                    complaint.id
                                                }
                                                position={[
                                                    lat,
                                                    lng,
                                                ]}
                                                icon={createPriorityIcon(
                                                    complaint.priority,
                                                    complaint.status === "RESOLVED"
                                                )}
                                            >

                                                <Popup>

                                                    <div
                                                        style={
                                                            styles.popup
                                                        }
                                                    >

                                                        <h3>
                                                            #{complaint.id}{" "}
                                                            —{" "}
                                                            {complaint.title ||
                                                                "Civic Complaint"}
                                                        </h3>


                                                        <div>
                                                            <b>
                                                                Priority:
                                                            </b>{" "}
                                                            <span
                                                                style={{
                                                                    color:
                                                                        MAP_PIN_COLORS[
                                                                            complaint.priority
                                                                            ] ||
                                                                        "#f59e0b",
                                                                    fontWeight:
                                                                        "700",
                                                                }}
                                                            >
                                                                {complaint.priority ||
                                                                    "MEDIUM"}
                                                            </span>
                                                        </div>


                                                        <div>
                                                            <b>
                                                                Status:
                                                            </b>{" "}
                                                            {formatStatus(
                                                                complaint.status
                                                            )}
                                                        </div>


                                                        <div>
                                                            <b>
                                                                Category:
                                                            </b>{" "}
                                                            {complaint.aiCategory ||
                                                                complaint.category ||
                                                                "General"}
                                                        </div>


                                                        <div>
                                                            <b>
                                                                Location:
                                                            </b>{" "}
                                                            {complaint.location ||
                                                                "GPS location"}
                                                        </div>


                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    "6px",
                                                                color:
                                                                    "#64748b",
                                                                fontSize:
                                                                    "10px",
                                                            }}
                                                        >
                                                            {lat.toFixed(
                                                                6
                                                            )}
                                                            {" , "}
                                                            {lng.toFixed(
                                                                6
                                                            )}
                                                        </div>

                                                    </div>

                                                </Popup>

                                            </Marker>
                                        );
                                    }
                                )}

                            </MapContainer>

                        </div>


                        {/* MAP LEGEND */}

                        <div
                            style={
                                styles.mapLegend
                            }
                        >

                            <span>
                                <i
                                    style={{
                                        ...styles.legendDot,
                                        background:
                                            "#ef4444",
                                    }}
                                />

                                HIGH
                            </span>


                            <span>
                                <i
                                    style={{
                                        ...styles.legendDot,
                                        background:
                                            "#f59e0b",
                                    }}
                                />

                                MEDIUM
                            </span>


                            <span>
                                <i
                                    style={{
                                        ...styles.legendDot,
                                        background:
                                            "#22c55e",
                                    }}
                                />

                                LOW
                            </span>


                            <span>
                                <i
                                    style={{
                                        ...styles.legendDot,
                                        background:
                                            "#6b7280",
                                    }}
                                />

                                RESOLVED
                            </span>


                            <span
                                style={{
                                    color:
                                        "#666",
                                }}
                            >
                                Click a pin for
                                details
                            </span>

                        </div>

                    </div>


                    {/* ======================================
                        PRIORITY QUEUE
                    ====================================== */}

                    <div
                        id="priority-queue"
                        style={
                            styles.priorityPanel
                        }
                    >

                        <div
                            style={
                                styles.panelHeader
                            }
                        >

                            <div>

                                <div
                                    style={
                                        styles.panelTitle
                                    }
                                >
                                    ⚠ &nbsp; Priority Queue
                                </div>

                                <div
                                    style={
                                        styles.panelSubtitle
                                    }
                                >
                                    Issues requiring
                                    officer attention
                                </div>

                            </div>


                            <button
                                style={
                                    styles.viewAll
                                }
                                onClick={() =>
                                    scrollTo(
                                        "all-complaints"
                                    )
                                }
                            >
                                View All →
                            </button>

                        </div>


                        {priorityQueue.length ===
                        0 ? (

                            <div
                                style={
                                    styles.noPriority
                                }
                            >
                                No active complaints
                                in the priority queue.
                            </div>

                        ) : (

                            <div
                                style={
                                    styles.priorityList
                                }
                            >

                                {priorityQueue.map(
                                    (
                                        complaint
                                    ) => (

                                        <PriorityItem
                                            key={
                                                complaint.id
                                            }
                                            complaint={
                                                complaint
                                            }
                                            updateStatus={
                                                updateStatus
                                            }
                                        />

                                    )
                                )}

                            </div>
                        )}

                    </div>

                </section>


                {/* ==========================================
                    ANALYTICS
                ========================================== */}

                <section
                    id="analytics"
                    style={
                        styles.bottomGrid
                    }
                >

                    <div
                        style={
                            styles.analyticsPanel
                        }
                    >

                        <div
                            style={
                                styles.panelTitle
                            }
                        >
                            ◉ &nbsp; Complaints
                            by Department
                        </div>


                        <div
                            style={
                                styles.departmentBody
                            }
                        >

                            <div
                                style={{
                                    ...styles.donut,
                                    background:
                                        getDonutGradient(
                                            categoryStats
                                        ),
                                }}
                            >

                                <div
                                    style={
                                        styles.donutCenter
                                    }
                                >

                                    <strong>
                                        {
                                            complaints.length
                                        }
                                    </strong>

                                    <span>
                                        Total
                                    </span>

                                </div>

                            </div>


                            <div
                                style={
                                    styles.departmentList
                                }
                            >

                                {categoryStats.length ===
                                0 ? (

                                    <span
                                        style={
                                            styles.mutedText
                                        }
                                    >
                                        No category
                                        data yet.
                                    </span>

                                ) : (

                                    categoryStats.map(
                                        (
                                            [
                                                category,
                                                count,
                                            ],
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    category
                                                }
                                                style={
                                                    styles.departmentRow
                                                }
                                            >

                                                <span
                                                    style={
                                                        styles.departmentName
                                                    }
                                                >

                                                    <i
                                                        style={{
                                                            ...styles.categoryDot,
                                                            background:
                                                                CATEGORY_COLORS[
                                                                index %
                                                                CATEGORY_COLORS.length
                                                                    ],
                                                        }}
                                                    />

                                                    {
                                                        category
                                                    }

                                                </span>


                                                <strong>
                                                    {
                                                        count
                                                    }{" "}

                                                    <small>
                                                        {complaints.length
                                                            ? `${Math.round(
                                                                (count /
                                                                    complaints.length) *
                                                                100
                                                            )}%`
                                                            : "0%"}
                                                    </small>
                                                </strong>

                                            </div>
                                        )
                                    )
                                )}

                            </div>

                        </div>

                    </div>


                    {/* RESOLUTION */}

                    <div
                        style={
                            styles.analyticsPanel
                        }
                    >

                        <div
                            style={
                                styles.panelTitle
                            }
                        >
                            ▥ &nbsp; Resolution
                            Performance
                        </div>


                        <div
                            style={
                                styles.metricList
                            }
                        >

                            <Metric
                                label="Resolved Complaints"
                                value={
                                    resolved
                                }
                                suffix=""
                                positive={
                                    resolved > 0
                                }
                            />


                            <Metric
                                label="Average Resolution Time"
                                value={
                                    resolved >
                                    0
                                        ? "2.8"
                                        : "—"
                                }
                                suffix={
                                    resolved >
                                    0
                                        ? " days"
                                        : ""
                                }
                                positive={
                                    resolved >
                                    0
                                }
                            />


                            <Metric
                                label="Resolution Rate"
                                value={
                                    resolutionRate
                                }
                                suffix="%"
                                positive={
                                    resolutionRate >=
                                    50
                                }
                            />

                        </div>

                    </div>


                    {/* LIVE ACTIVITY */}

                    <div
                        style={
                            styles.analyticsPanel
                        }
                    >

                        <div
                            style={
                                styles.panelHeader
                            }
                        >

                            <div>

                                <div
                                    style={
                                        styles.panelTitle
                                    }
                                >
                                    〽 &nbsp; Live Activity
                                </div>

                                <div
                                    style={
                                        styles.panelSubtitle
                                    }
                                >
                                    Latest system
                                    activity
                                </div>

                            </div>


                            <span
                                style={
                                    styles.liveBadge
                                }
                            >
                                <span
                                    style={
                                        styles.liveDot
                                    }
                                />

                                LIVE
                            </span>

                        </div>


                        <div
                            style={
                                styles.activityList
                            }
                        >

                            {complaints.length ===
                            0 ? (

                                <div
                                    style={
                                        styles.mutedText
                                    }
                                >
                                    No activity
                                    available.
                                </div>

                            ) : (

                                complaints
                                    .slice(0, 5)
                                    .map(
                                        (
                                            complaint,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    complaint.id
                                                }
                                                style={
                                                    styles.activityItem
                                                }
                                            >

                                                <span
                                                    style={{
                                                        ...styles.activityDot,
                                                        background:
                                                            ACTIVITY_COLORS[
                                                            index %
                                                            ACTIVITY_COLORS.length
                                                                ],
                                                    }}
                                                />


                                                <div
                                                    style={
                                                        styles.activityText
                                                    }
                                                >

                                                    <strong>
                                                        {complaint.status ===
                                                        "RESOLVED"
                                                            ? `Complaint #${complaint.id} resolved`
                                                            : complaint.status ===
                                                            "IN_PROGRESS"
                                                                ? `Complaint #${complaint.id} moved to In Progress`
                                                                : `New complaint #${complaint.id} received`}
                                                    </strong>


                                                    <span>
                                                        {complaint.title ||
                                                            "Civic complaint"}
                                                    </span>

                                                </div>


                                                <span
                                                    style={
                                                        styles.activityTime
                                                    }
                                                >
                                                    {formatDate(
                                                        complaint.updatedAt ||
                                                        complaint.createdAt ||
                                                        complaint.submittedAt
                                                    )}
                                                </span>

                                            </div>

                                        )
                                    )
                            )}

                        </div>

                    </div>

                </section>


                {/* ==========================================
                    MANAGEMENT
                ========================================== */}

                <section
                    id="unassigned"
                    style={
                        styles.managementSummary
                    }
                >

                    <div>

                        <span
                            style={
                                styles.sectionEyebrow
                            }
                        >
                            OPERATIONS
                        </span>

                        <h2
                            style={
                                styles.managementTitle
                            }
                        >
                            Complaint Management
                        </h2>

                        <p
                            style={
                                styles.managementText
                            }
                        >
                            {unassigned}
                            {" "}
                            complaint(s) are
                            currently waiting for
                            assignment and{" "}
                            {pending}
                            {" "}
                            are pending.
                        </p>

                    </div>


                    <div
                        style={
                            styles.managementStats
                        }
                    >

                        <div>
                            <strong>
                                {pending}
                            </strong>
                            <span>
                                Pending
                            </span>
                        </div>

                        <div>
                            <strong>
                                {inProgress}
                            </strong>
                            <span>
                                In Progress
                            </span>
                        </div>

                        <div>
                            <strong>
                                {resolved}
                            </strong>
                            <span>
                                Resolved
                            </span>
                        </div>

                        <div>
                            <strong>
                                {rejected}
                            </strong>
                            <span>
                                Rejected
                            </span>
                        </div>

                    </div>

                </section>


                {/* ==========================================
                    ALL COMPLAINTS
                ========================================== */}

                <section
                    id="all-complaints"
                >

                    <div
                        style={
                            styles.resultRow
                        }
                    >

                        <div>

                            <span
                                style={
                                    styles.activityLabel
                                }
                            >
                                COMPLAINT MANAGEMENT
                            </span>

                            <h2
                                style={
                                    styles.sectionTitle
                                }
                            >
                                All Complaints
                            </h2>

                        </div>


                        <span
                            style={
                                styles.resultBadge
                            }
                        >
                            {
                                filteredComplaints.length
                            }{" "}
                            Complaints
                        </span>

                    </div>


                    {/* FILTERS */}

                    <section
                        style={
                            styles.filterCard
                        }
                    >

                        <div
                            style={
                                styles.searchBox
                            }
                        >

                            <span
                                style={
                                    styles.searchIcon
                                }
                            >
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search complaints, location, citizen..."
                                value={
                                    search
                                }
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                style={
                                    styles.search
                                }
                            />

                        </div>


                        <select
                            value={
                                statusFilter
                            }
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            style={
                                styles.select
                            }
                        >

                            <option value="ALL">
                                All Status
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="IN_PROGRESS">
                                In Progress
                            </option>

                            <option value="REJECTED">
                                Rejected
                            </option>

                        </select>


                        <select
                            value={
                                categoryFilter
                            }
                            onChange={(e) =>
                                setCategoryFilter(
                                    e.target.value
                                )
                            }
                            style={
                                styles.select
                            }
                        >

                            <option value="ALL">
                                All Categories
                            </option>

                            {categories.map(
                                (
                                    category
                                ) => (

                                    <option
                                        key={
                                            category
                                        }
                                        value={
                                            category
                                        }
                                    >
                                        {
                                            category
                                        }
                                    </option>

                                )
                            )}

                        </select>


                        <select
                            value={
                                priorityFilter
                            }
                            onChange={(e) =>
                                setPriorityFilter(
                                    e.target.value
                                )
                            }
                            style={
                                styles.select
                            }
                        >

                            <option value="ALL">
                                All Priorities
                            </option>

                            <option value="HIGH">
                                High
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="LOW">
                                Low
                            </option>

                        </select>


                        <button
                            onClick={
                                clearFilters
                            }
                            style={
                                styles.clear
                            }
                        >
                            Clear
                        </button>

                    </section>


                    {error && (

                        <div
                            style={
                                styles.error
                            }
                        >
                            ⚠ {error}
                        </div>

                    )}


                    {loading && (

                        <div
                            style={
                                styles.message
                            }
                        >

                            <div
                                style={
                                    styles.spinner
                                }
                            >
                                ◌
                            </div>

                            <strong>
                                Loading complaints...
                            </strong>

                            <p>
                                Fetching the latest
                                civic complaints.
                            </p>

                        </div>

                    )}


                    {!loading &&
                        !error &&
                        filteredComplaints.length ===
                        0 && (

                            <div
                                style={
                                    styles.message
                                }
                            >

                                <div
                                    style={
                                        styles.emptyIcon
                                    }
                                >
                                    ⌕
                                </div>

                                <strong>
                                    No complaints found
                                </strong>

                                <p>
                                    Try changing your
                                    search or filters.
                                </p>

                            </div>
                        )}


                    {!loading &&
                        filteredComplaints.map(
                            (complaint) => (

                                <ComplaintCard
                                    key={
                                        complaint.id
                                    }
                                    complaint={
                                        complaint
                                    }
                                    updateStatus={
                                        updateStatus
                                    }
                                />

                            )
                        )}

                </section>

            </main>

        </div>
    );
}


// =====================================================
// ADMIN STAT
// =====================================================

function AdminStat({
                       icon,
                       title,
                       value,
                       subtitle,
                       color,
                   }) {

    return (

        <div
            style={
                styles.statCard
            }
        >

            <div
                style={{
                    ...styles.statIcon,
                    color,
                    background:
                        `${color}18`,
                    border:
                        `1px solid ${color}30`,
                }}
            >
                {icon}
            </div>

            <div
                style={
                    styles.statNumber
                }
            >
                {value}
            </div>

            <div
                style={
                    styles.statTitle
                }
            >
                {title}
            </div>

            <div
                style={
                    styles.statSubtitle
                }
            >
                {subtitle}
            </div>

        </div>
    );
}


// =====================================================
// PRIORITY ITEM
// =====================================================

function PriorityItem({
                          complaint,
                          updateStatus,
                      }) {

    return (

        <div
            style={
                styles.priorityItem
            }
        >

            <div
                style={
                    styles.priorityImage
                }
            >

                {complaint.evidenceImageUrl ? (

                    <img
                        src={
                            complaint.evidenceImageUrl
                        }
                        alt=""
                        style={
                            styles.priorityImageImg
                        }
                    />

                ) : (

                    <span>
                        ⚠
                    </span>

                )}

            </div>


            <div
                style={
                    styles.priorityContent
                }
            >

                <div
                    style={
                        styles.priorityTitleRow
                    }
                >

                    <span
                        style={{
                            ...styles.priorityTag,
                            ...getPriorityStyle(
                                complaint.priority
                            ),
                        }}
                    >
                        {
                            complaint.priority ||
                            "MEDIUM"
                        }
                    </span>

                    <span
                        style={
                            styles.priorityId
                        }
                    >
                        #{complaint.id}
                    </span>

                </div>


                <strong
                    style={
                        styles.priorityTitle
                    }
                >
                    {
                        complaint.title ||
                        "Civic complaint"
                    }
                </strong>


                <span
                    style={
                        styles.priorityLocation
                    }
                >
                    ⌖{" "}
                    {
                        complaint.location ||
                        "Location unavailable"
                    }
                </span>

            </div>


            <button
                style={
                    styles.assignButton
                }
                onClick={() =>
                    updateStatus(
                        complaint.id,
                        "IN_PROGRESS"
                    )
                }
            >
                Assign
            </button>

        </div>
    );
}


// =====================================================
// METRIC
// =====================================================

function Metric({
                    label,
                    value,
                    suffix,
                    positive,
                }) {

    return (

        <div
            style={
                styles.metric
            }
        >

            <div>

                <span>
                    {label}
                </span>

                <strong>
                    {value}

                    <small>
                        {suffix}
                    </small>

                </strong>

            </div>


            <div
                style={{
                    ...styles.miniTrend,
                    color:
                        positive
                            ? "#22c55e"
                            : "#94a3b8",
                }}
            >
                {
                    positive
                        ? "↗"
                        : "—"
                }
            </div>

        </div>
    );
}


// =====================================================
// COMPLAINT CARD
// =====================================================

function ComplaintCard({
                           complaint,
                           updateStatus,
                       }) {

    return (

        <article
            style={
                styles.complaintCard
            }
        >

            <div
                style={
                    styles.cardTop
                }
            >

                <div
                    style={
                        styles.titleArea
                    }
                >

                    <div
                        style={
                            styles.complaintNumber
                        }
                    >
                        #{complaint.id}
                    </div>


                    <div
                        style={
                            styles.titleContent
                        }
                    >

                        <h3
                            style={
                                styles.complaintTitle
                            }
                        >
                            {
                                complaint.title
                            }
                        </h3>

                        <span
                            style={
                                styles.complaintId
                            }
                        >
                            Complaint #
                            {
                                complaint.id
                            }
                        </span>

                    </div>

                </div>


                <span
                    style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(
                            complaint.status
                        ),
                    }}
                >
                    •{" "}
                    {
                        formatStatus(
                            complaint.status
                        )
                    }
                </span>

            </div>


            <p
                style={
                    styles.description
                }
            >
                {
                    complaint.description
                }
            </p>


            <div
                style={
                    styles.detailsGrid
                }
            >

                <Detail
                    icon="✦"
                    label="AI CATEGORY"
                    value={
                        complaint.aiCategory ||
                        "N/A"
                    }
                    valueColor="#a78bfa"
                />


                <Detail
                    icon="!"
                    label="PRIORITY"
                    value={
                        complaint.priority ||
                        "N/A"
                    }
                    valueColor={
                        getPriorityColor(
                            complaint.priority
                        )
                    }
                />


                <Detail
                    icon="⌖"
                    label="LOCATION"
                    value={
                        complaint.location ||
                        "N/A"
                    }
                />


                <Detail
                    icon="◉"
                    label="CITIZEN"
                    value={
                        complaint.citizenEmail ||
                        "N/A"
                    }
                />

            </div>


            {complaint.evidenceImageUrl && (

                <div
                    style={
                        styles.evidenceSection
                    }
                >

                    <img
                        src={
                            complaint.evidenceImageUrl
                        }
                        alt="Evidence"
                        style={
                            styles.evidenceImage
                        }
                    />

                </div>

            )}


            <div
                style={
                    styles.cardFooter
                }
            >

                <span>
                    Created:{" "}
                    {
                        formatDate(
                            complaint.createdAt ||
                            complaint.submittedAt
                        )
                    }
                </span>


                <div
                    style={
                        styles.cardActions
                    }
                >

                    {complaint.status ===
                        "PENDING" && (

                            <button
                                style={
                                    styles.actionButton
                                }
                                onClick={() =>
                                    updateStatus(
                                        complaint.id,
                                        "IN_PROGRESS"
                                    )
                                }
                            >
                                Start
                            </button>

                        )}


                    {complaint.status ===
                        "IN_PROGRESS" && (

                            <button
                                style={
                                    styles.resolveButton
                                }
                                onClick={() =>
                                    updateStatus(
                                        complaint.id,
                                        "RESOLVED"
                                    )
                                }
                            >
                                Resolve
                            </button>

                        )}

                </div>

            </div>

        </article>
    );
}


// =====================================================
// DETAIL
// =====================================================

function Detail({
                    icon,
                    label,
                    value,
                    valueColor,
                }) {

    return (

        <div
            style={
                styles.detail
            }
        >

            <span
                style={
                    styles.detailLabel
                }
            >
                {icon}{" "}
                {label}
            </span>

            <strong
                style={{
                    ...styles.detailValue,
                    color:
                        valueColor ||
                        "#d4d4d4",
                }}
            >
                {value}
            </strong>

        </div>
    );
}


// =====================================================
// STATUS STYLE
// =====================================================

function getStatusStyle(
    status
) {

    switch (status) {

        case "PENDING":

            return {
                color: "#fbbf24",
                background:
                    "rgba(251,191,36,.1)",
                border:
                    "1px solid rgba(251,191,36,.2)",
            };

        case "IN_PROGRESS":

            return {
                color: "#38bdf8",
                background:
                    "rgba(56,189,248,.1)",
                border:
                    "1px solid rgba(56,189,248,.2)",
            };

        case "RESOLVED":

            return {
                color: "#4ade80",
                background:
                    "rgba(74,222,128,.1)",
                border:
                    "1px solid rgba(74,222,128,.2)",
            };

        case "REJECTED":

            return {
                color: "#f87171",
                background:
                    "rgba(248,113,113,.1)",
                border:
                    "1px solid rgba(248,113,113,.2)",
            };

        default:

            return {
                color: "#a3a3a3",
                background:
                    "rgba(163,163,163,.1)",
            };
    }
}


// =====================================================
// PRIORITY STYLE
// =====================================================

function getPriorityStyle(
    priority
) {

    switch (priority) {

        case "HIGH":

            return {
                color: "#f87171",
                background:
                    "rgba(239,68,68,.1)",
                border:
                    "1px solid rgba(239,68,68,.2)",
            };

        case "LOW":

            return {
                color: "#4ade80",
                background:
                    "rgba(34,197,94,.1)",
                border:
                    "1px solid rgba(34,197,94,.2)",
            };

        default:

            return {
                color: "#fbbf24",
                background:
                    "rgba(245,158,11,.1)",
                border:
                    "1px solid rgba(245,158,11,.2)",
            };
    }
}


// =====================================================
// PRIORITY COLOR
// =====================================================

function getPriorityColor(
    priority
) {

    return (
        MAP_PIN_COLORS[
            priority
            ] || "#f59e0b"
    );
}


// =====================================================
// FORMAT STATUS
// =====================================================

function formatStatus(
    status
) {

    if (!status) {
        return "Unknown";
    }

    return status
        .replaceAll(
            "_",
            " "
        )
        .replace(
            /\b\w/g,
            (char) =>
                char.toUpperCase()
        );
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(
    value
) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}


// =====================================================
// DONUT GRADIENT
// =====================================================

const CATEGORY_COLORS = [
    "#60a5fa",
    "#a78bfa",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#38bdf8",
];


function getDonutGradient(
    stats
) {

    if (!stats.length) {

        return `
            conic-gradient(
                #252525 0deg 360deg
            )
        `;
    }


    const total =
        stats.reduce(
            (sum, item) =>
                sum + item[1],
            0
        );


    let current = 0;


    const segments =
        stats.map(
            (
                [, count],
                index
            ) => {

                const start =
                    current;

                current +=
                    (count / total) *
                    360;

                return `
                    ${CATEGORY_COLORS[
                index %
                CATEGORY_COLORS.length
                    ]}
                    ${start}deg
                    ${current}deg
                `;
            }
        );


    return `
        conic-gradient(
            ${segments.join(",")}
        )
    `;
}


// =====================================================
// COLORS
// =====================================================

const ACTIVITY_COLORS = [
    "#60a5fa",
    "#a78bfa",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
];


// =====================================================
// STYLES
// =====================================================

const styles = {

    app: {
        minHeight:
            "100vh",
        background:
            "#050505",
        color:
            "#e5e5e5",
        fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },


    sidebar: {
        position:
            "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: "235px",
        background:
            "#090909",
        borderRight:
            "1px solid #202020",
        display:
            "flex",
        flexDirection:
            "column",
        zIndex: 100,
    },


    brand: {
        display:
            "flex",
        alignItems:
            "center",
        gap:
            "11px",
        padding:
            "23px 19px",
    },


    brandIcon: {
        width:
            "36px",
        height:
            "36px",
        borderRadius:
            "9px",
        background:
            "#fbbf24",
        color:
            "#111",
        display:
            "flex",
        alignItems:
            "center",
        justifyContent:
            "center",
        fontWeight:
            "900",
        fontSize:
            "18px",
    },


    brandName: {
        fontSize:
            "16px",
        fontWeight:
            "750",
        color:
            "#fff",
    },


    brandSub: {
        color:
            "#737373",
        fontSize:
            "9px",
        marginTop:
            "2px",
    },


    divider: {
        height:
            "1px",
        background:
            "#202020",
        margin:
            "0 15px 13px",
    },


    nav: {
        display:
            "flex",
        flexDirection:
            "column",
        gap:
            "3px",
        padding:
            "0 10px",
    },


    navItem: {
        width:
            "100%",
        border:
            "none",
        background:
            "transparent",
        color:
            "#8a8a8a",
        padding:
            "11px 12px",
        borderRadius:
            "7px",
        textAlign:
            "left",
        cursor:
            "pointer",
        fontSize:
            "11px",
        display:
            "flex",
        alignItems:
            "center",
        gap:
            "5px",
    },


    activeNavItem: {
        background:
            "#171717",
        color:
            "#fff",
        borderLeft:
            "2px solid #fbbf24",
    },


    navCount: {
        marginLeft:
            "auto",
        minWidth:
            "19px",
        height:
            "19px",
        borderRadius:
            "10px",
        background:
            "#ef4444",
        color:
            "#fff",
        display:
            "flex",
        alignItems:
            "center",
        justifyContent:
            "center",
        fontSize:
            "9px",
        fontWeight:
            "700",
    },


    sidebarBottom: {
        marginTop:
            "auto",
        padding:
            "14px",
    },


    userCard: {
        display:
            "flex",
        gap:
            "9px",
        alignItems:
            "center",
        padding:
            "10px",
        background:
            "#111",
        border:
            "1px solid #222",
        borderRadius:
            "8px",
    },


    avatar: {
        width:
            "31px",
        height:
            "31px",
        borderRadius:
            "50%",
        background:
            "#fbbf24",
        color:
            "#111",
        display:
            "flex",
        alignItems:
            "center",
        justifyContent:
            "center",
        fontWeight:
            "800",
        fontSize:
            "11px",
    },


    userName: {
        display:
            "block",
        fontSize:
            "10px",
        color:
            "#ddd",
    },


    userRole: {
        display:
            "block",
        fontSize:
            "8px",
        color:
            "#666",
        marginTop:
            "2px",
    },


    online: {
        display:
            "flex",
        alignItems:
            "center",
        gap:
            "4px",
        color:
            "#4ade80",
        fontSize:
            "8px",
        marginTop:
            "3px",
    },


    onlineDot: {
        width:
            "5px",
        height:
            "5px",
        borderRadius:
            "50%",
        background:
            "#4ade80",
    },


    logout: {
        width:
            "100%",
        border:
            "none",
        background:
            "transparent",
        color:
            "#737373",
        padding:
            "9px",
        textAlign:
            "left",
        cursor:
            "pointer",
        fontSize:
            "10px",
        marginTop:
            "4px",
    },


    main: {
        marginLeft:
            "235px",
        padding:
            "0 38px 60px",
        minHeight:
            "100vh",
    },


    header: {
        minHeight:
            "105px",
        borderBottom:
            "1px solid #202020",
        display:
            "flex",
        alignItems:
            "center",
        justifyContent:
            "space-between",
        gap:
            "20px",
    },


    overline: {
        color:
            "#737373",
        fontSize:
            "8px",
        letterSpacing:
            "1.5px",
        fontWeight:
            "700",
    },


    heading: {
        margin:
            "5px 0 3px",
        fontSize:
            "27px",
        color:
            "#fff",
        letterSpacing:
            "-0.5px",
    },


    subtitle: {
        margin:
            0,
        color:
            "#737373",
        fontSize:
            "10px",
    },


    headerActions: {
        display:
            "flex",
        alignItems:
            "center",
        gap:
            "7px",
    },


    notification: {
        position:
            "relative",
        width:
            "35px",
        height:
            "35px",
        border:
            "1px solid #292929",
        background:
            "#0d0d0d",
        color:
            "#aaa",
        borderRadius:
            "7px",
        cursor:
            "pointer",
    },


    notificationBadge: {
        position:
            "absolute",
        top:
            "-5px",
        right:
            "-5px",
        minWidth:
            "15px",
        height:
            "15px",
        borderRadius:
            "50%",
        background:
            "#ef4444",
        color:
            "#fff",
        fontSize:
            "8px",
        display:
            "flex",
        alignItems:
            "center",
        justifyContent:
            "center",
    },


    refresh: {
        height:
            "35px",
        padding:
            "0 12px",
        border:
            "1px solid #292929",
        background:
            "#0d0d0d",
        color:
            "#aaa",
        borderRadius:
            "7px",
        cursor:
            "pointer",
        fontSize:
            "10px",
    },


    exportButton: {
        height:
            "35px",
        padding:
            "0 13px",
        border:
            "1px solid #fbbf24",
        background:
            "#fbbf24",
        color:
            "#111",
        borderRadius:
            "7px",
        cursor:
            "pointer",
        fontSize:
            "10px",
        fontWeight:
            "700",
    },


    stats: {
        display:
            "grid",
        gridTemplateColumns:
            "repeat(5, 1fr)",
        gap:
            "10px",
        margin:
            "22px 0",
    },


    statCard: {
        background:
            "#0a0a0a",
        border:
            "1px solid #202020",
        borderRadius:
            "9px",
        padding:
            "15px",
    },


    statIcon: {
        width:
            "28px",
        height:
            "28px",
        borderRadius:
            "7px",
        display:
            "flex",
        alignItems:
            "center",
        justifyContent:
            "center",
        fontSize:
            "12px",
        marginBottom:
            "12px",
    },


    statNumber: {
        color:
            "#fff",
        fontSize:
            "25px",
        fontWeight:
            "750",
    },


    statTitle: {
        color:
            "#ccc",
        fontSize:
            "10px",
        marginTop:
            "2px",
    },


    statSubtitle: {
        color:
            "#5f5f5f",
        fontSize:
            "8px",
        marginTop:
            "4px",
    },


    mainGrid: {
        display:
            "grid",
        gridTemplateColumns:
            "1.55fr 1fr",
        gap:
            "12px",
        marginBottom:
            "12px",
    },


    mapPanel: {
        background:
            "#0a0a0a",
        border:
            "1px solid #202020",
        borderRadius:
            "10px",
        overflow:
            "hidden",
    },


    panelHeader: {
        padding:
            "14px 15px",
        display:
            "flex",
        justifyContent:
            "space-between",
        alignItems:
            "center",
        borderBottom:
            "1px solid #1c1c1c",
    },


    panelTitle: {
        color:
            "#eee",
        fontSize:
            "12px",
        fontWeight:
            "700",
    },


    panelSubtitle: {
        color:
            "#666",
        fontSize:
            "8px",
        marginTop:
            "4px",
    },


    mapCount: {
        color:
            "#aaa",
        background:
            "#151515",
        border:
            "1px solid #292929",
        padding:
            "6px 9px",
        borderRadius:
            "5px",
        fontSize:
            "9px",
    },


    realMap: {
        width:
            "100%",
        height:
            "390px",
    },


    mapLegend: {
        minHeight:
            "43px",
        display:
            "flex",
        alignItems:
            "center",
        gap:
            "17px",
        padding:
            "0 15px",
        borderTop:
            "1px solid #202020",
        fontSize:
            "8px",
        color:
            "#aaa",
        flexWrap:
            "wrap",
    },


    legendDot: {
        display:
            "inline-block",
        width:
            "8px",
        height:
            "8px",
        borderRadius:
            "50%",
        marginRight:
            "5px",
    },


    popup: {
        color:
            "#222",
        fontSize:
            "12px",
        lineHeight:
            "1.6",
    },


    priorityPanel: {
        background:
            "#0a0a0a",
        border:
            "1px solid #202020",
        borderRadius:
            "10px",
        overflow:
            "hidden",
    },


    viewAll: {
        border:
            "none",
        background:
            "transparent",
        color:
            "#fbbf24",
        fontSize:
            "9px",
        cursor:
            "pointer",
    },


    priorityList: {
        padding:
            "5px 12px 12px",
    },


    priorityItem: {
        display:
            "flex",
        alignItems:
            "center",
        gap:
            "9px",
        padding:
            "11px 3px",
        borderBottom:
            "1px solid #181818",
    },


    priorityImage: {
        width:
            "42px",
        height:
            "42px",
        borderRadius:
            "7px",
        background:
            "#151515",
        overflow:
            "hidden",
        display:
            "flex",
        alignItems:
            "center",
        justifyContent:
            "center",
        color:
            "#fbbf24",
        flexShrink:
            0,
    },


    priorityImageImg: {
        width:
            "100%",
        height:
            "100%",
        objectFit:
            "cover",
    },


    priorityContent: {
        flex:
            1,
        minWidth:
            0,
    },


    priorityTitleRow: {
        display:
            "flex",
        alignItems:
            "center",
        gap:
            "6px",
        marginBottom:
            "4px",
    },


    priorityTag: {
        padding:
            "3px 6px",
        borderRadius:
            "4px",
        fontSize:
            "7px",
        fontWeight:
            "800",
    },


    priorityId: {
        color:
            "#555",
        fontSize:
            "8px",
    },


    priorityTitle: {
        display:
            "block",
        color:
            "#ddd",
        fontSize:
            "10px",
        whiteSpace:
            "nowrap",
        overflow:
            "hidden",
        textOverflow:
            "ellipsis",
    },


    priorityLocation: {
        display:
            "block",
        color:
            "#666",
        fontSize:
            "8px",
        marginTop:
            "3px",
        whiteSpace:
            "nowrap",
        overflow:
            "hidden",
        textOverflow:
            "ellipsis",
    },


    assignButton: {
        border:
            "1px solid #333",
        background:
            "#141414",
        color:
            "#bbb",
        padding:
            "6px 8px",
        borderRadius:
            "5px",
        cursor:
            "pointer",
        fontSize:
            "8px",
    },


    noPriority: {
        padding:
            "35px 15px",
        textAlign:
            "center",
        color:
            "#555",
        fontSize:
            "9px",
    },


    bottomGrid: {
        display:
            "grid",
        gridTemplateColumns:
            "repeat(3, 1fr)",
        gap:
            "12px",
        marginBottom:
            "12px",
    },


    analyticsPanel: {
        background:
            "#0a0a0a",
        border:
            "1px solid #202020",
        borderRadius:
            "10px",
        padding:
            "15px",
        minHeight:
            "220px",
        boxSizing:
            "border-box",
    },


    departmentBody: {
        display:
            "flex",
        alignItems:
            "center",
        gap:
            "18px",
        marginTop:
            "22px",
    },


    donut: {
        width:
            "105px",
        height:
            "105px",
        borderRadius:
            "50%",
        display:
            "flex",
        alignItems:
            "center",
        justifyContent:
            "center",
        flexShrink:
            0,
    },


    donutCenter: {
        width:
            "69px",
        height:
            "69px",
        borderRadius:
            "50%",
        background:
            "#0a0a0a",
        display:
            "flex",
        flexDirection:
            "column",
        alignItems:
            "center",
        justifyContent:
            "center",
    },


    departmentList: {
        flex:
            1,
    },


    departmentRow: {
        display:
            "flex",
        justifyContent:
            "space-between",
        alignItems:
            "center",
        padding:
            "7px 0",
        borderBottom:
            "1px solid #181818",
        fontSize:
            "9px",
    },


    departmentName: {
        color:
            "#aaa",
    },


    categoryDot: {
        display:
            "inline-block",
        width:
            "6px",
        height:
            "6px",
        borderRadius:
            "50%",
        marginRight:
            "6px",
    },


    metricList: {
        marginTop:
            "15px",
    },


    metric: {
        display:
            "flex",
        justifyContent:
            "space-between",
        alignItems:
            "center",
        padding:
            "13px 0",
        borderBottom:
            "1px solid #181818",
    },


    metric: {
        display:
            "flex",
        justifyContent:
            "space-between",
        alignItems:
            "center",
        padding:
            "13px 0",
        borderBottom:
            "1px solid #181818",
    },


    miniTrend: {
        fontSize:
            "16px",
    },


    liveBadge: {
        color:
            "#4ade80",
        fontSize:
            "8px",
        display:
            "flex",
        alignItems:
            "center",
        gap:
            "5px",
    },


    liveDot: {
        width:
            "6px",
        height:
            "6px",
        borderRadius:
            "50%",
        background:
            "#4ade80",
    },


    activityList: {
        marginTop:
            "12px",
    },


    activityItem: {
        display:
            "flex",
        alignItems:
            "center",
        gap:
            "8px",
        padding:
            "9px 0",
        borderBottom:
            "1px solid #181818",
    },


    activityDot: {
        width:
            "6px",
        height:
            "6px",
        borderRadius:
            "50%",
        flexShrink:
            0,
    },


    activityText: {
        flex:
            1,
        minWidth:
            0,
    },


    activityTime: {
        color:
            "#555",
        fontSize:
            "7px",
    },


    mutedText: {
        color:
            "#555",
        fontSize:
            "9px",
    },


    managementSummary: {
        display:
            "flex",
        justifyContent:
            "space-between",
        alignItems:
            "center",
        gap:
            "20px",
        background:
            "#0a0a0a",
        border:
            "1px solid #202020",
        borderRadius:
            "10px",
        padding:
            "20px",
        marginBottom:
            "28px",
    },


    sectionEyebrow: {
        color:
            "#fbbf24",
        fontSize:
            "8px",
        letterSpacing:
            "1px",
    },


    managementTitle: {
        margin:
            "5px 0",
        color:
            "#fff",
        fontSize:
            "18px",
    },


    managementText: {
        color:
            "#666",
        fontSize:
            "9px",
        margin:
            0,
    },


    managementStats: {
        display:
            "flex",
        gap:
            "30px",
    },


    resultRow: {
        display:
            "flex",
        justifyContent:
            "space-between",
        alignItems:
            "end",
        marginBottom:
            "14px",
    },


    activityLabel: {
        color:
            "#666",
        fontSize:
            "8px",
        letterSpacing:
            "1px",
    },


    sectionTitle: {
        margin:
            "4px 0 0",
        color:
            "#fff",
        fontSize:
            "19px",
    },


    resultBadge: {
        color:
            "#aaa",
        background:
            "#111",
        border:
            "1px solid #242424",
        padding:
            "6px 9px",
        borderRadius:
            "5px",
        fontSize:
            "8px",
    },


    filterCard: {
        display:
            "flex",
        gap:
            "7px",
        padding:
            "10px",
        background:
            "#0a0a0a",
        border:
            "1px solid #202020",
        borderRadius:
            "9px",
        marginBottom:
            "12px",
    },


    searchBox: {
        flex:
            1,
        display:
            "flex",
        alignItems:
            "center",
        background:
            "#111",
        border:
            "1px solid #242424",
        borderRadius:
            "6px",
        padding:
            "0 9px",
    },


    searchIcon: {
        color:
            "#666",
    },


    search: {
        width:
            "100%",
        border:
            "none",
        outline:
            "none",
        background:
            "transparent",
        color:
            "#ddd",
        padding:
            "8px",
        fontSize:
            "9px",
    },


    select: {
        background:
            "#111",
        border:
            "1px solid #242424",
        color:
            "#aaa",
        borderRadius:
            "6px",
        padding:
            "0 8px",
        fontSize:
            "9px",
        outline:
            "none",
    },


    clear: {
        background:
            "#151515",
        color:
            "#aaa",
        border:
            "1px solid #292929",
        borderRadius:
            "6px",
        padding:
            "0 10px",
        cursor:
            "pointer",
        fontSize:
            "9px",
    },


    complaintCard: {
        background:
            "#0a0a0a",
        border:
            "1px solid #202020",
        borderRadius:
            "10px",
        padding:
            "17px",
        marginBottom:
            "10px",
    },


    cardTop: {
        display:
            "flex",
        justifyContent:
            "space-between",
        alignItems:
            "start",
        gap:
            "15px",
    },


    titleArea: {
        display:
            "flex",
        gap:
            "10px",
    },


    complaintNumber: {
        width:
            "32px",
        height:
            "32px",
        borderRadius:
            "7px",
        background:
            "#171717",
        color:
            "#fbbf24",
        display:
            "flex",
        alignItems:
            "center",
        justifyContent:
            "center",
        fontSize:
            "9px",
        fontWeight:
            "700",
    },


    complaintTitle: {
        margin:
            0,
        color:
            "#eee",
        fontSize:
            "13px",
    },


    complaintId: {
        display:
            "block",
        color:
            "#555",
        fontSize:
            "8px",
        marginTop:
            "3px",
    },


    statusBadge: {
        padding:
            "5px 8px",
        borderRadius:
            "5px",
        fontSize:
            "8px",
        fontWeight:
            "700",
        whiteSpace:
            "nowrap",
    },


    description: {
        color:
            "#888",
        fontSize:
            "9px",
        lineHeight:
            "1.6",
        margin:
            "14px 0",
    },


    detailsGrid: {
        display:
            "grid",
        gridTemplateColumns:
            "repeat(4, 1fr)",
        gap:
            "8px",
        padding:
            "11px 0",
        borderTop:
            "1px solid #181818",
        borderBottom:
            "1px solid #181818",
    },


    detail: {
        minWidth:
            0,
    },


    detailLabel: {
        display:
            "block",
        color:
            "#555",
        fontSize:
            "7px",
        marginBottom:
            "5px",
    },


    detailValue: {
        display:
            "block",
        fontSize:
            "9px",
        overflow:
            "hidden",
        textOverflow:
            "ellipsis",
        whiteSpace:
            "nowrap",
    },


    evidenceSection: {
        marginTop:
            "12px",
    },


    evidenceImage: {
        width:
            "100%",
        maxHeight:
            "180px",
        objectFit:
            "cover",
        borderRadius:
            "7px",
        border:
            "1px solid #242424",
    },


    cardFooter: {
        display:
            "flex",
        justifyContent:
            "space-between",
        alignItems:
            "center",
        marginTop:
            "12px",
        color:
            "#555",
        fontSize:
            "8px",
    },


    cardActions: {
        display:
            "flex",
        gap:
            "6px",
    },


    actionButton: {
        background:
            "rgba(56,189,248,.08)",
        color:
            "#38bdf8",
        border:
            "1px solid rgba(56,189,248,.2)",
        borderRadius:
            "5px",
        padding:
            "6px 10px",
        cursor:
            "pointer",
        fontSize:
            "8px",
    },


    resolveButton: {
        background:
            "rgba(34,197,94,.08)",
        color:
            "#4ade80",
        border:
            "1px solid rgba(34,197,94,.2)",
        borderRadius:
            "5px",
        padding:
            "6px 10px",
        cursor:
            "pointer",
        fontSize:
            "8px",
    },


    message: {
        textAlign:
            "center",
        padding:
            "55px 20px",
        border:
            "1px solid #252525",
        borderRadius:
            "10px",
        background:
            "#0a0a0a",
        color:
            "#737373",
    },


    spinner: {
        fontSize:
            "30px",
        marginBottom:
            "10px",
        color:
            "#fbbf24",
    },


    emptyIcon: {
        fontSize:
            "30px",
        marginBottom:
            "10px",
        color:
            "#fbbf24",
    },


    error: {
        background:
            "rgba(239,68,68,.08)",
        color:
            "#f87171",
        border:
            "1px solid rgba(239,68,68,.25)",
        padding:
            "13px",
        borderRadius:
            "8px",
        marginBottom:
            "15px",
        fontSize:
            "10px",
    },
};


export default AdminDashboard;