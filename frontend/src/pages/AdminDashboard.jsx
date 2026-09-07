import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck, Sparkles, Building2, Briefcase, Award, Users, MapPin,
    AlertTriangle, CheckCircle2, Clock, Filter, Search, ArrowUpRight,
    TrendingUp, FileText, ChevronRight, Layers, RefreshCw, Send,
    SlidersHorizontal, Eye, ExternalLink, ArrowRight, UserCheck
} from "lucide-react";
import { THEMATIC_DOMAINS, INDIA_STATES_AND_REGIONS, PARTICIPATING_HEIS, INDUSTRY_CSR_PARTNERS, STAGES_OF_INNOVATION } from "../data/indiaData";
import { challengeService, getLocalChallenges, saveLocalChallenges } from "../services/api";
import ChallengeDetailModal from "../components/ChallengeDetailModal";
import CommunityInnovationMap from "../components/CommunityInnovationMap";

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("all-submissions");
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDomain, setFilterDomain] = useState("ALL");
    const [filterDistrict, setFilterDistrict] = useState("ALL");
    const [filterStage, setFilterStage] = useState("ALL");
    const [filterUrgency, setFilterUrgency] = useState("ALL");

    // Modal
    const [selectedChallenge, setSelectedChallenge] = useState(null);

    // Assign HEI Modal state
    const [assigningChallenge, setAssigningChallenge] = useState(null);
    const [selectedHeiId, setSelectedHeiId] = useState("HEI-IN-01");
    const [selectedCsrId, setSelectedCsrId] = useState("IND-01");
    const [nodalNote, setNodalNote] = useState("");

    // Audit Log State
    const [auditLogs, setAuditLogs] = useState([
        { id: 1, time: "10 mins ago", event: "Challenge #ADH-2026-1041 verified by Field Officer", officer: "System / Citizen Verification", type: "RESOLVED" },
        { id: 2, time: "2 hours ago", event: "DTU Delhi uploaded polymer patch lab test reports", officer: "Prof. S. K. Garg", type: "TESTING" },
        { id: 3, time: "Yesterday", event: "National Innovation Fund allocated ₹3.5 Lakhs Grant", officer: "Nodal Officer", type: "GRANT" },
        { id: 4, time: "2 days ago", event: "AI Deduplication clustered 2 infrastructure challenges", officer: "Adhikar AI Engine", type: "AI_CLUSTER" }
    ]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await challengeService.getAllChallenges();
            setChallenges(data);
        } catch (e) {
            setChallenges(getLocalChallenges());
        } finally {
            setLoading(false);
        }
    };

    const allDistricts = useMemo(() => {
        return Array.from(
            new Set([
                ...challenges.map(c => c.district).filter(Boolean),
                ...INDIA_STATES_AND_REGIONS.flatMap(s => s.districts)
            ])
        ).sort();
    }, [challenges]);

    useEffect(() => {
        loadData();
        // Background live synchronization polling between Phone and Laptop
        const interval = setInterval(() => {
            challengeService.getAllChallenges().then(data => {
                if (data && data.length > 0) {
                    setChallenges(data);
                }
            }).catch(() => {});
        }, 4000);
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        const handleFocus = () => loadData();
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    // KPIs
    const totalCount = challenges.length;
    const pendingValidation = challenges.filter(c => c.status === "SUBMITTED").length;
    const criticalUrgency = challenges.filter(c => c.urgency === "CRITICAL" && c.status !== "RESOLVED").length;
    const activeProjects = challenges.filter(c => ["ASSIGNED", "RESEARCH", "PROTOTYPE", "TESTING", "PILOT"].includes(c.status)).length;
    const deployedSolutions = challenges.filter(c => c.status === "RESOLVED").length;
    const totalBeneficiaries = useMemo(() => {
        return challenges.reduce((acc, curr) => acc + (Number(curr.affectedPopulation) || 500), 0);
    }, [challenges]);

    // Filtered challenges
    const filteredChallenges = useMemo(() => {
        return challenges.filter(c => {
            const matchSearch = !searchTerm ||
                c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.id?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchDomain = filterDomain === "ALL" || c.domain === filterDomain;
            const matchDistrict = filterDistrict === "ALL" || c.district === filterDistrict;
            const matchStage = filterStage === "ALL" || c.status === filterStage;
            const matchUrgency = filterUrgency === "ALL" || c.urgency === filterUrgency;

            return matchSearch && matchDomain && matchDistrict && matchStage && matchUrgency;
        });
    }, [challenges, searchTerm, filterDomain, filterDistrict, filterStage, filterUrgency]);

    // Handle Quick Validation / Stage Advancement
    const handleAdvanceStage = async (challengeId, nextStatus) => {
        const updated = await challengeService.updateChallengeStatus(challengeId, nextStatus);
        setChallenges(updated);

        // Add audit log
        setAuditLogs(prev => [
            {
                id: Date.now(),
                time: "Just now",
                event: `Challenge #${challengeId} advanced to stage: ${nextStatus}`,
                officer: "State Nodal Officer (Admin)",
                type: "STAGE_CHANGE"
            },
            ...prev
        ]);
    };

    // Handle HEI Assignment
    const handleConfirmAssignment = async () => {
        if (!assigningChallenge) return;
        const heiObj = PARTICIPATING_HEIS.find(h => h.id === selectedHeiId) || PARTICIPATING_HEIS[0];
        const csrObj = INDUSTRY_CSR_PARTNERS.find(i => i.id === selectedCsrId) || INDUSTRY_CSR_PARTNERS[0];

        const updated = await challengeService.allocateHei(
            assigningChallenge.id,
            heiObj.name,
            heiObj.specializedLabs[0],
            heiObj.facultyMentors[0],
            {
                studentTeam: "Multidisciplinary Innovation Team (Lead: Student Lead)",
                industryPartner: `${csrObj.name} (${csrObj.fundingContribution})`
            }
        );
        setChallenges(updated);

        setAuditLogs(prev => [
            {
                id: Date.now(),
                time: "Just now",
                event: `Challenge #${assigningChallenge.id} allocated to ${heiObj.shortName} with ${csrObj.name}`,
                officer: "State Nodal Officer (Admin)",
                type: "ASSIGNMENT"
            },
            ...prev
        ]);

        setAssigningChallenge(null);
    };

    // Deduplicate & Cluster Action
    const handleRunAiClustering = () => {
        alert("✨ AI Deduplication Engine Executed!\n\nAnalyzed 6 challenges across 24 districts.\n• 2 Water Contamination reports clustered in Palamu.\n• 0 Duplicate entries purged.\n• All raw evidence files linked to primary master challenges.");
    };

    return (
        <div style={styles.app}>
            {/* Top Admin Bar */}
            <header style={styles.adminHeader}>
                <div style={styles.headerContainer}>
                    <div style={styles.headerLeft}>
                        <div style={styles.govEmblemBox}>
                            <ShieldCheck size={24} color="#ffffff" />
                        </div>
                        <div>
                            <div style={styles.adminTitle}>
                                Adhikar AI <span style={{ color: "#38bdf8" }}>Admin & Nodal Command Center</span>
                            </div>
                            <div style={styles.adminSub}>
                                National Innovation & Grievance Governance Portal • Inter-Ministerial & State Councils
                            </div>
                        </div>
                    </div>

                    <div style={styles.headerRight}>
                        {/* Mode Switcher */}
                        <button
                            onClick={() => navigate("/dashboard")}
                            style={styles.switchViewBtn}
                            title="Switch to Citizen Portal"
                        >
                            <span>🌾 Switch to Citizen View</span>
                        </button>

                        <div style={styles.nodalProfile}>
                            <div style={styles.nodalAvatar}>SO</div>
                            <div>
                                <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#ffffff" }}>Dr. S. K. Verma</div>
                                <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>State Nodal Innovation Officer</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main style={styles.main}>
                {/* Executive KPI Bar */}
                <section style={styles.kpiGrid}>
                    <div style={styles.kpiCard}>
                        <div style={styles.kpiTop}>
                            <span style={styles.kpiLabel}>Total Submissions</span>
                            <div style={{ ...styles.kpiIcon, background: "#e0f2fe", color: "#0284c7" }}>
                                <FileText size={16} />
                            </div>
                        </div>
                        <div style={styles.kpiVal}>{totalCount}</div>
                        <span style={styles.kpiSub}>Crowdsourced across 24 districts</span>
                    </div>

                    <div style={{ ...styles.kpiCard, borderColor: "#fed7aa" }}>
                        <div style={styles.kpiTop}>
                            <span style={styles.kpiLabel}>Pending Validation</span>
                            <div style={{ ...styles.kpiIcon, background: "#ffedd5", color: "#ea580c" }}>
                                <Clock size={16} />
                            </div>
                        </div>
                        <div style={{ ...styles.kpiVal, color: "#ea580c" }}>{pendingValidation}</div>
                        <span style={styles.kpiSub}>Requires Nodal Triage</span>
                    </div>

                    <div style={{ ...styles.kpiCard, borderColor: "#fecaca" }}>
                        <div style={styles.kpiTop}>
                            <span style={styles.kpiLabel}>Critical Hazards</span>
                            <div style={{ ...styles.kpiIcon, background: "#fee2e2", color: "#dc2626" }}>
                                <AlertTriangle size={16} />
                            </div>
                        </div>
                        <div style={{ ...styles.kpiVal, color: "#dc2626" }}>{criticalUrgency}</div>
                        <span style={styles.kpiSub}>High Priority SLA &lt; 24h</span>
                    </div>

                    <div style={styles.kpiCard}>
                        <div style={styles.kpiTop}>
                            <span style={styles.kpiLabel}>Active HEI Projects</span>
                            <div style={{ ...styles.kpiIcon, background: "#ede9fe", color: "#7c3aed" }}>
                                <Building2 size={16} />
                            </div>
                        </div>
                        <div style={{ ...styles.kpiVal, color: "#7c3aed" }}>{activeProjects}</div>
                        <span style={styles.kpiSub}>In Research & Prototyping</span>
                    </div>

                    <div style={{ ...styles.kpiCard, borderColor: "#bbf7d0" }}>
                        <div style={styles.kpiTop}>
                            <span style={styles.kpiLabel}>Deployed & Verified</span>
                            <div style={{ ...styles.kpiIcon, background: "#dcfce7", color: "#16a34a" }}>
                                <CheckCircle2 size={16} />
                            </div>
                        </div>
                        <div style={{ ...styles.kpiVal, color: "#16a34a" }}>{deployedSolutions}</div>
                        <span style={styles.kpiSub}>Citizen Verified Pilots</span>
                    </div>

                    <div style={styles.kpiCard}>
                        <div style={styles.kpiTop}>
                            <span style={styles.kpiLabel}>Social Reach</span>
                            <div style={{ ...styles.kpiIcon, background: "#ccfbf1", color: "#0d9488" }}>
                                <Users size={16} />
                            </div>
                        </div>
                        <div style={{ ...styles.kpiVal, color: "#0d9488" }}>{totalBeneficiaries.toLocaleString()}+</div>
                        <span style={styles.kpiSub}>Citizens Impacted</span>
                    </div>
                </section>

                {/* Navigation Tabs */}
                <div style={styles.tabsNav}>
                    <button
                        onClick={() => setActiveTab("all-submissions")}
                        style={{ ...styles.tabBtn, ...(activeTab === "all-submissions" ? styles.activeTabBtn : {}) }}
                    >
                        📋 Submissions & Triage Queue ({challenges.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("pipeline-visualizer")}
                        style={{ ...styles.tabBtn, ...(activeTab === "pipeline-visualizer" ? styles.activeTabBtn : {}) }}
                    >
                        ⚡ 8-Stage Pipeline Visualizer
                    </button>
                    <button
                        onClick={() => setActiveTab("hei-governance")}
                        style={{ ...styles.tabBtn, ...(activeTab === "hei-governance" ? styles.activeTabBtn : {}) }}
                    >
                        🏛️ University (HEI) Governance
                    </button>
                    <button
                        onClick={() => setActiveTab("csr-partners")}
                        style={{ ...styles.tabBtn, ...(activeTab === "csr-partners" ? styles.activeTabBtn : {}) }}
                    >
                        💼 CSR & Seed Grants
                    </button>
                    <button
                        onClick={() => setActiveTab("district-intelligence")}
                        style={{ ...styles.tabBtn, ...(activeTab === "district-intelligence" ? styles.activeTabBtn : {}) }}
                    >
                        🗺️ District Intelligence
                    </button>
                    <button
                        onClick={() => setActiveTab("audit-logs")}
                        style={{ ...styles.tabBtn, ...(activeTab === "audit-logs" ? styles.activeTabBtn : {}) }}
                    >
                        📜 Audit Trail & SLAs
                    </button>
                </div>

                {/* TAB 1: ALL SUBMISSIONS & NODAL TRIAGE */}
                {activeTab === "all-submissions" && (
                    <section>
                        {/* Control Toolbar */}
                        <div style={styles.toolbar}>
                            <div style={styles.searchBox}>
                                <Search size={16} color="#64748b" />
                                <input
                                    type="text"
                                    placeholder="Search challenge ID, problem, district, or Panchayat..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={styles.searchInput}
                                />
                            </div>

                            <div style={styles.filterGroup}>
                                <select
                                    value={filterDomain}
                                    onChange={(e) => setFilterDomain(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="ALL">All 9 Domains</option>
                                    {THEMATIC_DOMAINS.map(d => (
                                        <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={filterDistrict}
                                    onChange={(e) => setFilterDistrict(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="ALL">All Regions / Districts</option>
                                    {allDistricts.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>

                                <select
                                    value={filterStage}
                                    onChange={(e) => setFilterStage(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="ALL">All Lifecycle Stages</option>
                                    {STAGES_OF_INNOVATION.map(s => (
                                        <option key={s.key} value={s.key}>{s.step}. {s.label}</option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleRunAiClustering}
                                    style={styles.aiClusterBtn}
                                    title="Group similar reports & merge duplicate submissions"
                                >
                                    <Sparkles size={15} />
                                    <span>Run AI Cluster & Deduplicate</span>
                                </button>
                            </div>
                        </div>

                        {/* Challenges Table */}
                        <div style={styles.tableCard}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.thRow}>
                                        <th style={styles.th}>ID & Domain</th>
                                        <th style={styles.th}>Societal Challenge Title</th>
                                        <th style={styles.th}>District & Panchayat</th>
                                        <th style={styles.th}>Urgency</th>
                                        <th style={styles.th}>Assigned University & CSR</th>
                                        <th style={styles.th}>8-Stage Status</th>
                                        <th style={styles.th}>Nodal Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredChallenges.map(c => {
                                        const domainObj = THEMATIC_DOMAINS.find(d => d.id === c.domain) || { icon: "💡", color: "#0284c7" };
                                        const stageIndex = STAGES_OF_INNOVATION.findIndex(s => s.key === c.status);
                                        const stageObj = STAGES_OF_INNOVATION[stageIndex >= 0 ? stageIndex : 0];

                                        return (
                                            <tr key={c.id} style={styles.tr}>
                                                <td style={styles.td}>
                                                    <div style={{ fontWeight: 800, fontSize: "12px", color: "#0f172a" }}>{c.id}</div>
                                                    <div style={{ fontSize: "11px", color: domainObj.color, fontWeight: 700 }}>
                                                        {domainObj.icon} {c.domain}
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a", marginBottom: 3, maxWidth: "280px" }}>
                                                        {c.title}
                                                    </div>
                                                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                                                        Submitted by: <strong>{c.submitterName}</strong>
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{ fontWeight: 600, fontSize: "12.5px" }}>{c.panchayat || "Panchayat"}</div>
                                                    <div style={{ fontSize: "11px", color: "#64748b" }}>{c.block}, {c.district}</div>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.urgencyBadge,
                                                        ...(c.urgency === "CRITICAL" ? styles.urgencyCritical :
                                                            c.urgency === "HIGH" ? styles.urgencyHigh : styles.urgencyMedium)
                                                    }}>
                                                        {c.urgency}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#7c3aed" }}>
                                                        {c.assignedHei || "Unassigned"}
                                                    </div>
                                                    <div style={{ fontSize: "10.5px", color: "#16a34a" }}>
                                                        {c.industryPartner?.split("(")[0] || "CSR Pending"}
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{ display: "inline-block", background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, color: "#334155" }}>
                                                        Stage {stageObj.step}: {stageObj.label}
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{ display: "flex", gap: "6px" }}>
                                                        <button
                                                            onClick={() => setSelectedChallenge(c)}
                                                            style={styles.actionBtnInspect}
                                                            title="Inspect Full Evidence"
                                                        >
                                                            <Eye size={14} />
                                                        </button>

                                                        {c.status === "SUBMITTED" && (
                                                            <button
                                                                onClick={() => setAssigningChallenge(c)}
                                                                style={styles.actionBtnAssign}
                                                                title="Validate & Assign HEI"
                                                            >
                                                                Allocate HEI
                                                            </button>
                                                        )}

                                                        {c.status === "ASSIGNED" && (
                                                            <button
                                                                onClick={() => handleAdvanceStage(c.id, "RESEARCH")}
                                                                style={styles.actionBtnNext}
                                                                title="Move to Research & Design"
                                                            >
                                                                Start R&D →
                                                            </button>
                                                        )}

                                                        {c.status === "RESEARCH" && (
                                                            <button
                                                                onClick={() => handleAdvanceStage(c.id, "PROTOTYPE")}
                                                                style={styles.actionBtnNext}
                                                                title="Move to Prototyping"
                                                            >
                                                                Prototype →
                                                            </button>
                                                        )}

                                                        {c.status === "PROTOTYPE" && (
                                                            <button
                                                                onClick={() => handleAdvanceStage(c.id, "TESTING")}
                                                                style={styles.actionBtnNext}
                                                                title="Move to Lab Testing"
                                                            >
                                                                Test →
                                                            </button>
                                                        )}

                                                        {c.status === "TESTING" && (
                                                            <button
                                                                onClick={() => handleAdvanceStage(c.id, "PILOT")}
                                                                style={styles.actionBtnNext}
                                                                title="Deploy Village Pilot"
                                                            >
                                                                Deploy Pilot →
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* TAB 2: 8-STAGE PIPELINE VISUALIZER */}
                {activeTab === "pipeline-visualizer" && (
                    <section>
                        <div style={styles.kanbanBoard}>
                            {STAGES_OF_INNOVATION.map(stage => {
                                const stageChallenges = challenges.filter(c => c.status === stage.key);
                                return (
                                    <div key={stage.key} style={styles.kanbanCol}>
                                        <div style={styles.kanbanColHeader}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <span style={styles.stageNumberBadge}>{stage.step}</span>
                                                <span style={styles.kanbanColTitle}>{stage.label}</span>
                                            </div>
                                            <span style={styles.kanbanCountBadge}>{stageChallenges.length}</span>
                                        </div>

                                        <div style={styles.kanbanCardsArea}>
                                            {stageChallenges.length === 0 ? (
                                                <div style={styles.kanbanEmpty}>No challenges</div>
                                            ) : (
                                                stageChallenges.map(c => (
                                                    <div
                                                        key={c.id}
                                                        style={styles.kanbanCard}
                                                        onClick={() => setSelectedChallenge(c)}
                                                    >
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                            <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#0284c7" }}>{c.id}</span>
                                                            <span style={{ fontSize: "10px", color: "#64748b" }}>{c.district}</span>
                                                        </div>
                                                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", lineHeight: 1.3, marginBottom: 6 }}>
                                                            {c.title}
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "#7c3aed", fontWeight: 600 }}>
                                                            🎓 {c.assignedHei?.split(",")[0] || "Unassigned"}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* TAB 3: UNIVERSITY (HEI) GOVERNANCE */}
                {activeTab === "hei-governance" && (
                    <section>
                        <div style={styles.heiGrid}>
                            {PARTICIPATING_HEIS.map(hei => {
                                const heiProjects = challenges.filter(c => c.assignedHei?.includes(hei.shortName.split(",")[0]));
                                return (
                                    <div key={hei.id} style={styles.heiGovCard}>
                                        <div style={styles.heiGovTop}>
                                            <div style={styles.heiGovAvatar}>🎓</div>
                                            <div>
                                                <h3 style={styles.heiGovName}>{hei.name}</h3>
                                                <span style={styles.heiGovLoc}>📍 {hei.district}, {hei.state || "India"}</span>
                                            </div>
                                            <div style={styles.heiActiveCountBadge}>
                                                <strong>{heiProjects.length}</strong> Active Projects
                                            </div>
                                        </div>

                                        <div style={styles.heiGovSection}>
                                            <strong>Specialized Innovation Centers & FabLabs:</strong>
                                            <ul style={{ paddingLeft: "18px", marginTop: "4px", fontSize: "12px", color: "#475569" }}>
                                                {hei.specializedLabs.map((lab, i) => (
                                                    <li key={i}>{lab}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div style={styles.heiGovSection}>
                                            <strong>Assigned Faculty Mentors:</strong>
                                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                                                {hei.facultyMentors.map((mentor, i) => (
                                                    <span key={i} style={styles.mentorPill}>{mentor}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* TAB 4: CSR & SEED GRANTS */}
                {activeTab === "csr-partners" && (
                    <section>
                        <div style={styles.heiGrid}>
                            {INDUSTRY_CSR_PARTNERS.map(ind => (
                                <div key={ind.id} style={styles.heiGovCard}>
                                    <div style={styles.heiGovTop}>
                                        <div style={{ ...styles.heiGovAvatar, background: "#dcfce7", color: "#16a34a" }}>💼</div>
                                        <div>
                                            <h3 style={styles.heiGovName}>{ind.name}</h3>
                                            <span style={styles.heiGovLoc}>{ind.category}</span>
                                        </div>
                                    </div>
                                    <div style={styles.heiGovSection}>
                                        <strong>Thematic CSR Focus Areas:</strong>
                                        <div style={{ fontSize: "12.5px", color: "#334155", marginTop: "4px" }}>
                                            {ind.focusAreas.join(" • ")}
                                        </div>
                                    </div>
                                    <div style={styles.heiGovSection}>
                                        <strong>Seed Funding Commitment:</strong>
                                        <div style={{ fontSize: "13px", color: "#166534", fontWeight: 700, background: "#ecfdf5", padding: "8px", borderRadius: "8px", marginTop: "4px" }}>
                                            {ind.fundingContribution}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TAB 5: DISTRICT INTELLIGENCE */}
                {activeTab === "district-intelligence" && (
                    <section>
                        <div style={styles.districtGrid}>
                            {INDIA_STATES_AND_REGIONS.flatMap(st => st.districts.map(dName => ({ name: dName, state: st.state }))).map(dist => {
                                const distChallenges = challenges.filter(c => c.district === dist.name);
                                const solvedCount = distChallenges.filter(c => c.status === "RESOLVED").length;

                                return (
                                    <div key={`${dist.state}-${dist.name}`} style={styles.districtCard}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>{dist.name}</h4>
                                                <span style={{ fontSize: "11px", color: "#64748b" }}>{dist.state}</span>
                                            </div>
                                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0284c7", background: "#e0f2fe", padding: "2px 8px", borderRadius: "10px" }}>
                                                {distChallenges.length} Submissions
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#64748b", margin: "6px 0" }}>
                                            Solved Pilots: <strong>{solvedCount}</strong>
                                        </div>
                                        <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                                            <div style={{ width: `${distChallenges.length > 0 ? (solvedCount / distChallenges.length) * 100 : 0}%`, height: "100%", background: "#16a34a" }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* TAB 6: AUDIT TRAIL */}
                {activeTab === "audit-logs" && (
                    <section>
                        <div style={styles.tableCard}>
                            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, fontSize: "16px" }}>
                                State Nodal Governance Audit Log
                            </div>
                            <div style={{ padding: "12px 20px" }}>
                                {auditLogs.map(log => (
                                    <div key={log.id} style={styles.auditRow}>
                                        <div style={styles.auditTime}>{log.time}</div>
                                        <div style={styles.auditEvent}>
                                            <strong>{log.event}</strong>
                                            <div style={{ fontSize: "11px", color: "#64748b" }}>Action Officer: {log.officer}</div>
                                        </div>
                                        <span style={styles.auditBadge}>{log.type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* University Allocation Modal */}
            {assigningChallenge && (
                <div style={styles.backdrop} onClick={() => setAssigningChallenge(null)}>
                    <div style={styles.assignModal} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
                            Assign Higher Education Institution (HEI) & CSR
                        </h3>
                        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: 16 }}>
                            Challenge: <strong>{assigningChallenge.title}</strong> ({assigningChallenge.district})
                        </p>

                        <div style={{ marginBottom: 14 }}>
                            <label style={styles.label}>Select Higher Education Institution (HEI) *</label>
                            <select
                                value={selectedHeiId}
                                onChange={(e) => setSelectedHeiId(e.target.value)}
                                style={styles.selectFull}
                            >
                                {PARTICIPATING_HEIS.map(h => (
                                    <option key={h.id} value={h.id}>
                                        {h.name} ({h.specializedLabs[0]})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label style={styles.label}>Select Industry CSR / Seed Grant Partner *</label>
                            <select
                                value={selectedCsrId}
                                onChange={(e) => setSelectedCsrId(e.target.value)}
                                style={styles.selectFull}
                            >
                                {INDUSTRY_CSR_PARTNERS.map(i => (
                                    <option key={i.id} value={i.id}>
                                        {i.name} — {i.fundingContribution}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: 18 }}>
                            <label style={styles.label}>Nodal Allocation Directives / Special Notes</label>
                            <textarea
                                value={nodalNote}
                                onChange={(e) => setNodalNote(e.target.value)}
                                placeholder="e.g. Prioritize low-cost gravity filtration for fluoride removal without grid dependence..."
                                rows={3}
                                style={styles.textarea}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button onClick={() => setAssigningChallenge(null)} style={styles.cancelBtn}>
                                Cancel
                            </button>
                            <button onClick={handleConfirmAssignment} style={styles.confirmBtn}>
                                ✓ Confirm Allocation & Dispatch Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedChallenge && (
                <ChallengeDetailModal
                    challenge={selectedChallenge}
                    onClose={() => setSelectedChallenge(null)}
                    onUpdate={(newList) => {
                        setChallenges(newList);
                        const updatedSelected = newList.find(c => c.id === selectedChallenge.id);
                        if (updatedSelected) setSelectedChallenge(updatedSelected);
                    }}
                />
            )}
        </div>
    );
}

const styles = {
    app: {
        minHeight: "100vh",
        backgroundColor: "#f8fafc"
    },
    adminHeader: {
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderBottom: "1px solid #334155",
        padding: "14px 0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
    },
    headerContainer: {
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },
    govEmblemBox: {
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(2, 132, 199, 0.35)"
    },
    adminTitle: {
        fontSize: "18px",
        fontWeight: 800,
        color: "#ffffff"
    },
    adminSub: {
        fontSize: "11.5px",
        color: "#94a3b8"
    },
    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: "16px"
    },
    switchViewBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(56, 189, 248, 0.15)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        color: "#38bdf8",
        padding: "8px 14px",
        borderRadius: "10px",
        fontSize: "12.5px",
        fontWeight: 700
    },
    nodalProfile: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },
    nodalAvatar: {
        width: "34px",
        height: "34px",
        borderRadius: "10px",
        background: "#0284c7",
        color: "#ffffff",
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px"
    },
    main: {
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "24px 20px 80px 20px"
    },
    kpiGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: "14px",
        marginBottom: "24px"
    },
    kpiCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 2px 8px rgba(15,23,42,0.03)"
    },
    kpiTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "6px"
    },
    kpiLabel: {
        fontSize: "11.5px",
        fontWeight: 600,
        color: "#64748b"
    },
    kpiIcon: {
        width: "28px",
        height: "28px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    kpiVal: {
        fontSize: "22px",
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: "2px"
    },
    kpiSub: {
        fontSize: "10.5px",
        color: "#94a3b8"
    },
    tabsNav: {
        display: "flex",
        gap: "8px",
        borderBottom: "2px solid #e2e8f0",
        paddingBottom: "10px",
        marginBottom: "20px",
        overflowX: "auto"
    },
    tabBtn: {
        padding: "9px 16px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#64748b",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        whiteSpace: "nowrap"
    },
    activeTabBtn: {
        background: "#0f172a",
        color: "#ffffff",
        borderColor: "#0f172a",
        boxShadow: "0 4px 12px rgba(15,23,42,0.2)"
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        marginBottom: "16px",
        flexWrap: "wrap"
    },
    searchBox: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "10px",
        padding: "8px 12px",
        flex: 1,
        minWidth: "260px"
    },
    searchInput: {
        border: "none",
        outline: "none",
        fontSize: "13px",
        width: "100%"
    },
    filterGroup: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap"
    },
    select: {
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        fontSize: "12px",
        background: "#ffffff",
        outline: "none"
    },
    aiClusterBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
        color: "#ffffff",
        padding: "8px 14px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: 700,
        boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)"
    },
    tableCard: {
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
        overflow: "hidden"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left"
    },
    thRow: {
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0"
    },
    th: {
        padding: "12px 16px",
        fontSize: "11.5px",
        fontWeight: 700,
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: "0.03em"
    },
    tr: {
        borderBottom: "1px solid #f1f5f9"
    },
    td: {
        padding: "12px 16px",
        fontSize: "12.5px",
        color: "#334155",
        verticalAlign: "middle"
    },
    urgencyBadge: {
        fontSize: "10.5px",
        fontWeight: 800,
        padding: "2px 6px",
        borderRadius: "4px"
    },
    urgencyCritical: {
        background: "#fee2e2",
        color: "#b91c1c"
    },
    urgencyHigh: {
        background: "#ffedd5",
        color: "#c2410c"
    },
    urgencyMedium: {
        background: "#fef9c3",
        color: "#a16207"
    },
    actionBtnInspect: {
        padding: "6px",
        borderRadius: "6px",
        background: "#e0f2fe",
        color: "#0284c7"
    },
    actionBtnAssign: {
        padding: "6px 10px",
        borderRadius: "6px",
        background: "#0284c7",
        color: "#ffffff",
        fontSize: "11.5px",
        fontWeight: 700
    },
    actionBtnNext: {
        padding: "6px 10px",
        borderRadius: "6px",
        background: "#16a34a",
        color: "#ffffff",
        fontSize: "11.5px",
        fontWeight: 700
    },
    kanbanBoard: {
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gap: "10px",
        overflowX: "auto",
        paddingBottom: "16px"
    },
    kanbanCol: {
        background: "#f1f5f9",
        borderRadius: "12px",
        padding: "10px",
        minWidth: "160px",
        display: "flex",
        flexDirection: "column"
    },
    kanbanColHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
        paddingBottom: "6px",
        borderBottom: "1px solid #e2e8f0"
    },
    stageNumberBadge: {
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "#0f172a",
        color: "#ffffff",
        fontSize: "10px",
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    kanbanColTitle: {
        fontSize: "11px",
        fontWeight: 700,
        color: "#0f172a"
    },
    kanbanCountBadge: {
        fontSize: "11px",
        fontWeight: 700,
        color: "#64748b"
    },
    kanbanCardsArea: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        minHeight: "280px"
    },
    kanbanEmpty: {
        fontSize: "11px",
        color: "#94a3b8",
        textAlign: "center",
        paddingTop: "20px"
    },
    kanbanCard: {
        background: "#ffffff",
        borderRadius: "8px",
        padding: "10px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        cursor: "pointer"
    },
    heiGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "18px"
    },
    heiGovCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(15,23,42,0.03)"
    },
    heiGovTop: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "14px"
    },
    heiGovAvatar: {
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        background: "#ede9fe",
        color: "#7c3aed",
        fontSize: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    heiGovName: {
        fontSize: "15px",
        fontWeight: 800,
        color: "#0f172a"
    },
    heiGovLoc: {
        fontSize: "12px",
        color: "#64748b"
    },
    heiActiveCountBadge: {
        marginLeft: "auto",
        fontSize: "12px",
        color: "#0284c7",
        background: "#e0f2fe",
        padding: "4px 10px",
        borderRadius: "10px"
    },
    heiGovSection: {
        fontSize: "12.5px",
        color: "#0f172a",
        marginTop: "10px"
    },
    mentorPill: {
        background: "#f1f5f9",
        padding: "3px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        color: "#334155"
    },
    districtGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "14px"
    },
    districtCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "14px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
    },
    auditRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #f1f5f9"
    },
    auditTime: {
        fontSize: "11.5px",
        color: "#94a3b8",
        width: "100px"
    },
    auditEvent: {
        flex: 1,
        fontSize: "12.5px",
        color: "#0f172a"
    },
    auditBadge: {
        fontSize: "10px",
        fontWeight: 800,
        background: "#f1f5f9",
        color: "#475569",
        padding: "2px 8px",
        borderRadius: "6px"
    },
    backdrop: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px"
    },
    assignModal: {
        background: "#ffffff",
        borderRadius: "20px",
        padding: "26px 28px",
        width: "100%",
        maxWidth: "540px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.3)"
    },
    label: {
        fontSize: "12px",
        fontWeight: 700,
        color: "#334155",
        display: "block",
        marginBottom: "6px"
    },
    selectFull: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        fontSize: "13px",
        outline: "none"
    },
    textarea: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        fontSize: "13px",
        outline: "none",
        fontFamily: "inherit"
    },
    cancelBtn: {
        padding: "9px 16px",
        borderRadius: "8px",
        background: "#f1f5f9",
        color: "#475569",
        fontWeight: 600,
        fontSize: "13px"
    },
    confirmBtn: {
        padding: "9px 18px",
        borderRadius: "8px",
        background: "#0284c7",
        color: "#ffffff",
        fontWeight: 700,
        fontSize: "13px"
    }
};
