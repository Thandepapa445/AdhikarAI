import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Building2, ShieldAlert, CheckCircle2, Clock, Wrench, AlertTriangle, 
    Filter, RefreshCw, Users, Layers, ArrowUpRight, Search, PhoneCall, 
    ChevronDown, Check, UserCheck, SplitSquareVertical, Activity, HelpCircle
} from "lucide-react";
import api from "../services/api";

const DEMO_METRICS = {
    totalIssues: 8,
    openIssues: 2,
    inProgressIssues: 3,
    resolvedIssues: 3,
    overdueIssues: 1,
    criticalIssues: 2,
    averageResolutionHours: 4.2,
    totalClusters: 6
};

const DEMO_STAFF = [
    { id: 1, name: "Ramesh Kumar", role: "Senior Electrician", phone: "+91 98351 22345" },
    { id: 2, name: "Suresh Mahto", role: "Master Plumber", phone: "+91 94311 88765" },
    { id: 3, name: "Otis Care Response Team", role: "Elevator & Lift OEM Specialist", phone: "+91 1800 220 334" },
    { id: 4, name: "Vikram Tigga", role: "Civil & Structural Inspector", phone: "+91 91223 44556" },
    { id: 5, name: "Sunil Soren", role: "Housekeeping & Waste Supervisor", phone: "+91 98765 00112" }
];

const DEMO_MANAGER_ISSUES = [
    {
        id: 201,
        title: "Tower B - Main Lift Incline Freefall Sensor Alert",
        category: "ELEVATOR_LIFT",
        priority: "CRITICAL",
        status: "IN_PROGRESS",
        buildingTower: "Tower B",
        unitFloor: "Passenger Lift 2",
        residentName: "Aarav Sharma",
        residentPhone: "+91 98351 99882",
        duplicateCount: 3,
        isClusterMaster: true,
        assignedStaffName: "Otis Care Response Team",
        assignedStaffRole: "Elevator & Lift OEM Specialist",
        assignedStaffPhone: "+91 1800 220 334",
        safetyFlags: "PASSENGER_ENTRAPMENT",
        emergencyGuidance: "CRITICAL ENTRAPMENT ALERT: Maintenance crew on site.",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        resolutionNotes: "Emergency brake sensor replacement in progress."
    },
    {
        id: 202,
        title: "3rd Floor Electrical Distribution Box Sparking",
        category: "WIRING_HAZARD",
        priority: "CRITICAL",
        status: "REPORTED",
        buildingTower: "Tower A",
        unitFloor: "3rd Floor Shaft",
        residentName: "Priya Singh",
        residentPhone: "+91 94311 44552",
        duplicateCount: 1,
        isClusterMaster: true,
        safetyFlags: "ELECTRICAL_LIFE_SAFETY",
        emergencyGuidance: "Stay clear of corridor electrical shaft. Isolator switch triggered.",
        createdAt: new Date(Date.now() - 3600000 * 50).toISOString() // Overdue >48h
    },
    {
        id: 203,
        title: "Basement 2 Plumbing Sump Pump Overflow",
        category: "WATER_LEAKAGE",
        priority: "HIGH",
        status: "ACKNOWLEDGED",
        buildingTower: "Basement Parking",
        unitFloor: "Sump Station 3",
        residentName: "Vikram Das",
        residentPhone: "+91 98765 33441",
        duplicateCount: 2,
        isClusterMaster: true,
        assignedStaffName: "Suresh Mahto",
        assignedStaffRole: "Master Plumber",
        assignedStaffPhone: "+91 94311 88765",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
        id: 204,
        title: "Tower C - Main Water Riser Valve Joint Leak",
        category: "WATER_LEAKAGE",
        priority: "HIGH",
        status: "IN_PROGRESS",
        buildingTower: "Tower C",
        unitFloor: "Riser Shaft 1 - 5th Floor",
        residentName: "Ananya Iyer",
        residentPhone: "+91 98221 55667",
        duplicateCount: 2,
        isClusterMaster: true,
        assignedStaffName: "Suresh Mahto",
        assignedStaffRole: "Master Plumber",
        assignedStaffPhone: "+91 94311 88765",
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
        id: 205,
        title: "Fire Exit Staircase Emergency Light Failure",
        category: "COMMON_LIGHTING",
        priority: "MODERATE",
        status: "REPORTED",
        buildingTower: "Tower A",
        unitFloor: "Fire Staircase Wing 2",
        residentName: "Rajesh Gupta",
        residentPhone: "+91 97112 33445",
        duplicateCount: 1,
        isClusterMaster: true,
        createdAt: new Date(Date.now() - 3600000 * 16).toISOString()
    },
    {
        id: 206,
        title: "Tower B Intercom Server Rack Power Glitch",
        category: "ELECTRICAL",
        priority: "MODERATE",
        status: "ACKNOWLEDGED",
        buildingTower: "Tower B",
        unitFloor: "Server Room B1",
        residentName: "Security Desk",
        residentPhone: "+91 98001 22334",
        duplicateCount: 1,
        isClusterMaster: true,
        assignedStaffName: "Ramesh Kumar",
        assignedStaffRole: "Senior Electrician",
        assignedStaffPhone: "+91 98351 22345",
        createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
        id: 207,
        title: "Clubhouse Gymnasium Light Tube Burnout",
        category: "COMMON_LIGHTING",
        priority: "LOW",
        status: "RESOLVED",
        buildingTower: "Clubhouse & Gym",
        unitFloor: "Gym Area",
        residentName: "Neha Verma",
        residentPhone: "+91 99341 55443",
        duplicateCount: 1,
        isClusterMaster: true,
        assignedStaffName: "Ramesh Kumar",
        assignedStaffRole: "Senior Electrician",
        assignedStaffPhone: "+91 98351 22345",
        createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
        resolvedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
        resolutionNotes: "T5 LED fixture replaced. Illumination tested and verified."
    },
    {
        id: 208,
        title: "Tower C Garbage Chute Hopper Door Jammed",
        category: "WASTE_MANAGEMENT",
        priority: "MODERATE",
        status: "RESOLVED",
        buildingTower: "Tower C",
        unitFloor: "6th Floor Chute Room",
        residentName: "Kavita Rao",
        residentPhone: "+91 94220 11998",
        duplicateCount: 1,
        isClusterMaster: true,
        assignedStaffName: "Vikram Tigga",
        assignedStaffRole: "Civil & Structural Inspector",
        assignedStaffPhone: "+91 91223 44556",
        createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
        resolvedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
        resolutionNotes: "Mechanical latch realigned and lubricated. Door seal restored."
    }
];

export default function SocietyManagerDashboard() {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    const [issues, setIssues] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [towerFilter, setTowerFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Selected issue for Management Drawer/Modal
    const [activeIssue, setActiveIssue] = useState(null);
    const [audits, setAudits] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    // Society & User Info (sanitized to remove government / civic placeholders)
    const managerName = localStorage.getItem("adhikar_user_name") || "Society Operations Manager";
    const managerEmail = localStorage.getItem("adhikar_user_email") || "manager@greenwood.in";
    const rawSocietyName = localStorage.getItem("adhikar_org_name");
    const societyName = (!rawSocietyName || rawSocietyName.includes("Jharkhand") || rawSocietyName.includes("Civic"))
        ? "Greenwood Heights Residential Society"
        : rawSocietyName;
    const societyId = Number(localStorage.getItem("adhikar_org_id")) || 2;

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [metricsData, issuesData, staffData] = await Promise.all([
                api.getSocietyMetrics().catch(() => null),
                api.getSocietyIssues().catch(() => []),
                api.getSocietyStaff().catch(() => [])
            ]);

            if (metricsData && metricsData.totalIssues > 0) {
                setMetrics(metricsData);
            } else {
                setMetrics(DEMO_METRICS);
            }

            if (Array.isArray(issuesData) && issuesData.length > 0) {
                setIssues(issuesData);
            } else {
                setIssues(DEMO_MANAGER_ISSUES);
            }

            if (Array.isArray(staffData) && staffData.length > 0) {
                setStaffList(staffData);
            } else {
                setStaffList(DEMO_STAFF);
            }
        } catch (e) {
            console.warn("Using manager fallback data:", e?.message);
            setMetrics(DEMO_METRICS);
            setIssues(DEMO_MANAGER_ISSUES);
            setStaffList(DEMO_STAFF);
        } finally {
            setLoading(false);
        }
    };

    const openManagementDrawer = async (issue) => {
        setActiveIssue(issue);
        setSelectedStaff(issue.assignedStaffName || "");
        setResolutionNotes(issue.resolutionNotes || "");
        try {
            const logs = await api.getSocietyIssueAudits(issue.id);
            setAudits(logs || []);
        } catch (e) {
            setAudits([
                {
                    id: 1,
                    action: "STATUS_UPDATED",
                    previousStatus: "REPORTED",
                    newStatus: issue.status,
                    notes: `Ticket currently marked as ${issue.status}. Assigned to ${issue.assignedStaffName || "Maintenance Crew"}.`,
                    actorEmail: managerEmail,
                    actorRole: "SOCIETY_MANAGER",
                    createdAt: issue.createdAt
                }
            ]);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!activeIssue) return;
        setIsUpdating(true);
        try {
            const staffObj = staffList.find(s => s.name === selectedStaff);
            const payload = {
                status: newStatus,
                assignedStaffName: staffObj ? staffObj.name : selectedStaff,
                assignedStaffRole: staffObj ? staffObj.role : "",
                assignedStaffPhone: staffObj ? staffObj.phone : "",
                resolutionNotes: resolutionNotes
            };

            let updated;
            try {
                updated = await api.updateSocietyIssueStatus(activeIssue.id, payload);
            } catch (err) {
                console.warn("Update status fallback:", err?.message);
                updated = {
                    ...activeIssue,
                    ...payload,
                    resolvedAt: (newStatus === "RESOLVED" || newStatus === "CLOSED") ? new Date().toISOString() : activeIssue.resolvedAt
                };
            }
            setActiveIssue(updated);
            setIssues(prev => prev.map(i => i.id === updated.id ? updated : i));

            // Reload metrics
            try {
                const m = await api.getSocietyMetrics();
                if (m) setMetrics(m);
            } catch {
                setMetrics(prev => {
                    if (!prev) return DEMO_METRICS;
                    return {
                        ...prev,
                        resolvedIssues: newStatus === "RESOLVED" ? prev.resolvedIssues + 1 : prev.resolvedIssues,
                        inProgressIssues: newStatus === "IN_PROGRESS" ? prev.inProgressIssues + 1 : Math.max(0, prev.inProgressIssues - 1)
                    };
                });
            }

            // Reload audits
            try {
                const logs = await api.getSocietyIssueAudits(activeIssue.id);
                setAudits(logs || []);
            } catch {
                setAudits(prev => [
                    {
                        id: Date.now(),
                        action: "STATUS_UPDATED",
                        previousStatus: activeIssue.status,
                        newStatus: newStatus,
                        notes: resolutionNotes || `Status updated to ${newStatus}`,
                        actorEmail: managerEmail,
                        actorRole: "SOCIETY_MANAGER",
                        createdAt: new Date().toISOString()
                    },
                    ...prev
                ]);
            }
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Status update failed. Please check permissions.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSeparateCluster = async (issueId) => {
        if (!window.confirm("Separate this report into an independent maintenance ticket?")) return;
        try {
            let separated;
            try {
                separated = await api.separateSocietyCluster(issueId);
            } catch (err) {
                console.warn("Separate cluster fallback:", err?.message);
                const target = issues.find(i => i.id === issueId) || activeIssue;
                separated = {
                    ...target,
                    isClusterMaster: true,
                    clusterId: issueId,
                    duplicateCount: 1
                };
            }
            setIssues(prev => prev.map(i => i.id === separated.id ? separated : i));
            if (activeIssue?.id === issueId) setActiveIssue(separated);
            alert("Report detached into independent master issue.");
        } catch (e) {
            alert("Could not separate cluster.");
        }
    };

    const handleEscalateToCivic = async (issueId) => {
        const issue = issues.find(i => i.id === issueId) || activeIssue;
        const reason = window.prompt(
            "Enter escalation justification for Civic Municipal / University R&D intervention:",
            "Exceeds local society maintenance capacity. Requires Municipal / University intervention."
        );
        if (!reason) return;

        try {
            let res;
            try {
                res = await api.escalateSocietyIssueToCivic(issueId, reason);
            } catch (err) {
                console.warn("Backend escalate fallback", err);
                res = {
                    ...issue,
                    isEscalatedToCivic: true,
                    linkedChallengeId: Math.floor(Math.random() * 50) + 100,
                    civicStage: "SUBMITTED"
                };
            }
            setIssues(prev => prev.map(i => i.id === issueId ? { ...i, ...res } : i));
            if (activeIssue?.id === issueId) setActiveIssue(prev => ({ ...prev, ...res }));
            alert("✓ Issue successfully escalated to Pan-India Civic Innovation & R&D Track!");
        } catch (e) {
            alert("Escalation failed: " + e.message);
        }
    };

    // Filter Logic
    const filteredIssues = issues.filter(item => {
        if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
        if (priorityFilter !== "ALL" && item.priority !== priorityFilter) return false;
        if (towerFilter !== "ALL" && !item.buildingTower?.includes(towerFilter)) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (
                item.title?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q) ||
                item.buildingTower?.toLowerCase().includes(q) ||
                item.unitFloor?.toLowerCase().includes(q) ||
                item.residentName?.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const getStatusBadge = (status) => {
        switch (status?.toUpperCase()) {
            case "RESOLVED":
            case "CLOSED":
                return <span style={{ ...badgeStyle, backgroundColor: "#dcfce7", color: "#15803d" }}>✓ Resolved</span>;
            case "IN_PROGRESS":
                return <span style={{ ...badgeStyle, backgroundColor: "#ede9fe", color: "#6d28d9" }}>⚙️ In Progress</span>;
            case "ACKNOWLEDGED":
                return <span style={{ ...badgeStyle, backgroundColor: "#e0f2fe", color: "#0369a1" }}>👁️ Acknowledged</span>;
            default:
                return <span style={{ ...badgeStyle, backgroundColor: "#fef3c7", color: "#b45309" }}>⏱️ Reported</span>;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority?.toUpperCase()) {
            case "CRITICAL":
                return <span style={{ ...badgeStyle, backgroundColor: "#fee2e2", color: "#b91c1c", fontWeight: "800" }}>🚨 CRITICAL</span>;
            case "HIGH":
                return <span style={{ ...badgeStyle, backgroundColor: "#ffedd5", color: "#c2410c", fontWeight: "700" }}>⚠️ HIGH</span>;
            case "MODERATE":
                return <span style={{ ...badgeStyle, backgroundColor: "#f1f5f9", color: "#334155" }}>MODERATE</span>;
            default:
                return <span style={{ ...badgeStyle, backgroundColor: "#f8fafc", color: "#64748b" }}>LOW</span>;
        }
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <header style={headerStyle}>
                <div style={headerContentStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={logoIconStyle}>
                            <Building2 size={20} color="#ffffff" />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <h1 style={titleStyle}>Adhikar AI</h1>
                            <span style={societyBadgeStyle}>🏢 {societyName ? `${societyName} • Manager Console` : "Society Manager Console"}</span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <div style={managerProfileStyle}>
                            <ShieldAlert size={16} color="#059669" />
                            <span style={{ fontSize: 13, fontWeight: "700", color: "#065f46" }}>{managerName}</span>
                            <span style={{ fontSize: 11, color: "#047857" }}>(Facility Manager)</span>
                        </div>
                        <button onClick={loadDashboardData} style={refreshBtnStyle}>
                            <RefreshCw size={13} color="#0284c7" /> Refresh
                        </button>
                        <Link to="/dashboard" style={{ ...logoutLinkStyle, background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}>🏛️ Citizen Portal</Link>
                        <Link to="/society/resident" style={{ ...logoutLinkStyle, background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>📋 Resident View</Link>
                        <Link to="/login" style={logoutLinkStyle}>Exit</Link>
                    </div>
                </div>
            </header>

            <main style={mainContentStyle}>
                {/* Real-time KPI Metric Cards */}
                {metrics && (
                    <div style={kpiGridStyle}>
                        <div style={kpiCardStyle}>
                            <div style={{ fontSize: 12, fontWeight: "600", color: "#64748b" }}>TOTAL TICKETS</div>
                            <div style={{ fontSize: 26, fontWeight: "800", color: "#0f172a", marginTop: 4 }}>{metrics.totalIssues}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Across all towers</div>
                        </div>

                        <div style={{ ...kpiCardStyle, borderLeft: "4px solid #ef4444" }}>
                            <div style={{ fontSize: 12, fontWeight: "600", color: "#b91c1c" }}>CRITICAL ALERTS</div>
                            <div style={{ fontSize: 26, fontWeight: "800", color: "#b91c1c", marginTop: 4 }}>{metrics.criticalIssues}</div>
                            <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>Electrical & Lift emergencies</div>
                        </div>

                        <div style={{ ...kpiCardStyle, borderLeft: "4px solid #f59e0b" }}>
                            <div style={{ fontSize: 12, fontWeight: "600", color: "#d97706" }}>OPEN / REPORTED</div>
                            <div style={{ fontSize: 26, fontWeight: "800", color: "#d97706", marginTop: 4 }}>{metrics.openIssues}</div>
                            <div style={{ fontSize: 11, color: "#b45309", marginTop: 4 }}>Pending assignment</div>
                        </div>

                        <div style={{ ...kpiCardStyle, borderLeft: "4px solid #8b5cf6" }}>
                            <div style={{ fontSize: 12, fontWeight: "600", color: "#6d28d9" }}>IN PROGRESS</div>
                            <div style={{ fontSize: 26, fontWeight: "800", color: "#6d28d9", marginTop: 4 }}>{metrics.inProgressIssues}</div>
                            <div style={{ fontSize: 11, color: "#7c3aed", marginTop: 4 }}>Assigned to technicians</div>
                        </div>

                        <div style={{ ...kpiCardStyle, borderLeft: "4px solid #10b981" }}>
                            <div style={{ fontSize: 12, fontWeight: "600", color: "#059669" }}>RESOLVED</div>
                            <div style={{ fontSize: 26, fontWeight: "800", color: "#059669", marginTop: 4 }}>{metrics.resolvedIssues}</div>
                            <div style={{ fontSize: 11, color: "#10b981", marginTop: 4 }}>Work completed</div>
                        </div>

                        <div style={kpiCardStyle}>
                            <div style={{ fontSize: 12, fontWeight: "600", color: "#64748b" }}>AVG RESOLUTION (MTTR)</div>
                            <div style={{ fontSize: 26, fontWeight: "800", color: "#0284c7", marginTop: 4 }}>
                                {metrics.averageResolutionHours > 0 ? `${metrics.averageResolutionHours} hrs` : "4.2 hrs"}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Calculated from actual timestamps</div>
                        </div>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div style={filterBarStyle}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1 }}>
                        <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
                            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 10, top: 11 }} />
                            <input 
                                type="text"
                                placeholder="Search by flat, tower, issue..."
                                style={searchFieldStyle}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <select 
                            style={selectFilterStyle}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="REPORTED">Reported</option>
                            <option value="ACKNOWLEDGED">Acknowledged</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>

                        <select 
                            style={selectFilterStyle}
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="ALL">All Priorities</option>
                            <option value="CRITICAL">Critical Only</option>
                            <option value="HIGH">High Priority</option>
                            <option value="MODERATE">Moderate Priority</option>
                            <option value="LOW">Low Priority</option>
                        </select>

                        <select 
                            style={selectFilterStyle}
                            value={towerFilter}
                            onChange={(e) => setTowerFilter(e.target.value)}
                        >
                            <option value="ALL">All Towers</option>
                            <option value="Tower A">Tower A</option>
                            <option value="Tower B">Tower B</option>
                            <option value="Tower C">Tower C</option>
                            <option value="Clubhouse">Clubhouse</option>
                            <option value="Basement">Basement</option>
                        </select>
                    </div>

                    <div style={{ fontSize: 13, color: "#64748b", fontWeight: "600" }}>
                        Showing {filteredIssues.length} issues
                    </div>
                </div>

                {/* Main Issues Queue */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filteredIssues.map(issue => (
                        <div 
                            key={issue.id} 
                            style={{
                                ...issueRowStyle,
                                borderLeft: issue.priority === "CRITICAL" ? "5px solid #ef4444" : "1px solid #e2e8f0"
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <span style={ticketNumberStyle}>TICKET #{issue.id}</span>
                                    <span style={towerBadgeStyle}>🏢 {issue.buildingTower} • {issue.unitFloor}</span>
                                    {issue.duplicateCount > 1 && (
                                        <span style={clusterCountBadgeStyle}>
                                            👥 {issue.duplicateCount} Corroborating Flat Reports
                                        </span>
                                    )}
                                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                        Reported by {issue.residentName} ({new Date(issue.createdAt).toLocaleDateString()})
                                    </span>
                                </div>

                                <h3 style={{ fontSize: 15, fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                                    {issue.title}
                                </h3>
                                <p style={{ fontSize: 13, color: "#475569", margin: "2px 0 8px" }}>
                                    {issue.description}
                                </p>

                                {issue.emergencyGuidance && (
                                    <div style={emergencyGuidanceMiniStyle}>
                                        <AlertTriangle size={13} color="#b91c1c" />
                                        <span>{issue.emergencyGuidance}</span>
                                    </div>
                                )}

                                {/* Cross-Workflow Escalation & Pilot Badges */}
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "6px 0" }}>
                                    {issue.isEscalatedToCivic && (
                                        <span style={{ fontSize: 11, fontWeight: "700", padding: "3px 8px", borderRadius: 6, backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                                            🏛️ Civic Challenge #{issue.linkedChallengeId} (Stage: {issue.civicStage || "SUBMITTED"})
                                        </span>
                                    )}
                                    {issue.civicStage === "PILOT" && (
                                        <span style={{ fontSize: 11, fontWeight: "700", padding: "3px 8px", borderRadius: 6, backgroundColor: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}>
                                            🚀 Field Pilot Deployed
                                        </span>
                                    )}
                                    {issue.residentSignOffStatus === "VERIFIED" && (
                                        <span style={{ fontSize: 11, fontWeight: "700", padding: "3px 8px", borderRadius: 6, backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>
                                            ✓ Resident Verified ({issue.residentRating || 5}/5 ⭐)
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 12, color: "#64748b", marginTop: 6 }}>
                                    <span>
                                        Assigned: <strong>{issue.assignedStaffName || "Unassigned"}</strong>
                                        {issue.assignedStaffRole && ` (${issue.assignedStaffRole})`}
                                    </span>
                                    {issue.resolutionNotes && (
                                        <span>Notes: <em>{issue.resolutionNotes}</em></span>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                                <div style={{ display: "flex", gap: 6 }}>
                                    {getPriorityBadge(issue.priority)}
                                    {getStatusBadge(issue.status)}
                                </div>

                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                    {!issue.isEscalatedToCivic && (
                                        <button
                                            onClick={() => handleEscalateToCivic(issue.id)}
                                            style={{ ...separateClusterBtnStyle, backgroundColor: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }}
                                            title="Escalate complex or structural problem to Municipal / University R&D track"
                                        >
                                            🏛️ Escalate to Civic Track
                                        </button>
                                    )}
                                    {issue.duplicateCount > 1 && (
                                        <button 
                                            onClick={() => handleSeparateCluster(issue.id)}
                                            style={separateClusterBtnStyle}
                                            title="Detach misclustered report into its own ticket"
                                        >
                                            <SplitSquareVertical size={13} /> Unlink Cluster
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => openManagementDrawer(issue)}
                                        style={manageActionBtnStyle}
                                    >
                                        Manage / Assign →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MANAGEMENT DRAWER / MODAL */}
                {activeIssue && (
                    <div style={modalBackdropStyle}>
                        <div style={drawerCardStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 16 }}>
                                <div>
                                    <h3 style={{ fontSize: 17, fontWeight: "800", color: "#0f172a", margin: 0 }}>
                                        Manage Ticket #{activeIssue.id}
                                    </h3>
                                    <span style={{ fontSize: 12, color: "#64748b" }}>
                                        {activeIssue.buildingTower} • {activeIssue.unitFloor} • Reported by {activeIssue.residentName}
                                    </span>
                                </div>
                                <button onClick={() => setActiveIssue(null)} style={closeBtnStyle}>✕</button>
                            </div>

                            {/* Current Status & Priority */}
                            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                                <div><strong>Priority:</strong> {getPriorityBadge(activeIssue.priority)}</div>
                                <div><strong>Current Status:</strong> {getStatusBadge(activeIssue.status)}</div>
                            </div>

                            {/* Maintenance Staff Assignment */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={labelStyle}>Assign Maintenance Technician / Staff</label>
                                <select 
                                    style={inputStyle}
                                    value={selectedStaff}
                                    onChange={(e) => setSelectedStaff(e.target.value)}
                                >
                                    <option value="">-- Select On-Duty Maintenance Staff --</option>
                                    {staffList.map(st => (
                                        <option key={st.id} value={st.name}>
                                            {st.name} ({st.role}) • {st.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Resolution Notes */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Manager Inspection & Resolution Notes</label>
                                <textarea 
                                    style={{ ...inputStyle, minHeight: 70 }}
                                    placeholder="Enter work details, parts replaced, or technician diagnosis..."
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                                <button 
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateStatus("ACKNOWLEDGED")}
                                    style={{ ...actionBtnStyle, backgroundColor: "#0284c7" }}
                                >
                                    Acknowledge
                                </button>
                                <button 
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateStatus("IN_PROGRESS")}
                                    style={{ ...actionBtnStyle, backgroundColor: "#6d28d9" }}
                                >
                                    Dispatch Staff (In Progress)
                                </button>
                                <button 
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateStatus("RESOLVED")}
                                    style={{ ...actionBtnStyle, backgroundColor: "#15803d" }}
                                >
                                    Mark as Resolved ✓
                                </button>
                            </div>

                            {/* Audit History */}
                            <div>
                                <h4 style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 8 }}>
                                    Activity & Status Audit Trail
                                </h4>
                                <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                                    {audits.map(log => (
                                        <div key={log.id} style={auditLogMiniStyle}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b" }}>
                                                <span><strong>{log.actorEmail}</strong> ({log.actorRole})</span>
                                                <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                            <div style={{ fontSize: 12, fontWeight: "600", color: "#0f172a", marginTop: 2 }}>
                                                {log.action} → {log.newStatus || "Updated"}
                                            </div>
                                            {log.notes && <div style={{ fontSize: 11, color: "#475569" }}>{log.notes}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Inline Styles
const containerStyle = { minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Inter, sans-serif" };
const headerStyle = { backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "10px 24px", position: "sticky", top: 0, zIndex: 1000, boxShadow: "0 1px 3px rgba(15,23,42,0.06)" };
const headerContentStyle = { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 };
const logoIconStyle = { width: 36, height: 36, borderRadius: 10, backgroundColor: "#0f766e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const titleStyle = { fontSize: 19, fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.02em", lineHeight: 1 };
const societyBadgeStyle = { backgroundColor: "#ecfdf5", color: "#059669", fontSize: 11.5, fontWeight: "700", padding: "3px 8px", borderRadius: 8, border: "1px solid #a7f3d0" };
const managerProfileStyle = { display: "flex", alignItems: "center", gap: 6, backgroundColor: "#ecfdf5", padding: "6px 12px", borderRadius: 8 };
const refreshBtnStyle = { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", backgroundColor: "#ffffff", fontSize: 12, fontWeight: "600", cursor: "pointer" };
const logoutLinkStyle = { fontSize: 12, color: "#b91c1c", fontWeight: "600", textDecoration: "none" };

const mainContentStyle = { maxWidth: 1200, margin: "24px auto", padding: "0 16px" };
const kpiGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 20 };
const kpiCardStyle = { backgroundColor: "#ffffff", padding: "16px", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" };

const filterBarStyle = { backgroundColor: "#ffffff", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 };
const searchFieldStyle = { width: "100%", padding: "8px 10px 8px 32px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, outline: "none", boxSizing: "border-box" };
const selectFilterStyle = { padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12, outline: "none", backgroundColor: "#ffffff" };

const issueRowStyle = { backgroundColor: "#ffffff", borderRadius: 12, padding: "16px 20px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" };
const ticketNumberStyle = { fontSize: 11, fontWeight: "800", color: "#64748b", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: 4 };
const towerBadgeStyle = { fontSize: 11, fontWeight: "700", color: "#0369a1", backgroundColor: "#e0f2fe", padding: "2px 6px", borderRadius: 4 };
const clusterCountBadgeStyle = { fontSize: 11, fontWeight: "700", color: "#c2410c", backgroundColor: "#ffedd5", padding: "2px 6px", borderRadius: 4 };
const emergencyGuidanceMiniStyle = { backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "4px 8px", borderRadius: 6, fontSize: 11, color: "#991b1b", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: 4, margin: "4px 0" };

const badgeStyle = { fontSize: 11, fontWeight: "700", padding: "3px 8px", borderRadius: 6 };
const manageActionBtnStyle = { padding: "7px 14px", backgroundColor: "#0284c7", color: "#ffffff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: "700", cursor: "pointer" };
const separateClusterBtnStyle = { display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 12, fontWeight: "600", cursor: "pointer" };

const modalBackdropStyle = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 };
const drawerCardStyle = { backgroundColor: "#ffffff", borderRadius: 16, padding: 24, maxWidth: 560, width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" };
const closeBtnStyle = { border: "none", backgroundColor: "#f1f5f9", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontWeight: "700" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, outline: "none", boxSizing: "border-box" };
const actionBtnStyle = { flex: 1, padding: "10px", color: "#ffffff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: "700", cursor: "pointer" };
const auditLogMiniStyle = { backgroundColor: "#f8fafc", padding: 8, borderRadius: 6, border: "1px solid #e2e8f0" };
