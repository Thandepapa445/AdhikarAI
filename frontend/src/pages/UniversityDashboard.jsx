import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Building2, Users, Award, Briefcase, FileText, CheckCircle2,
    Clock, UploadCloud, PlusCircle, ArrowRight, ShieldCheck, MapPin,
    AlertTriangle, Sparkles, SlidersHorizontal, ChevronRight, Eye,
    Lightbulb, BookOpen, Layers, Laptop, Cpu
} from "lucide-react";
import { THEMATIC_DOMAINS, PARTICIPATING_HEIS, INDUSTRY_CSR_PARTNERS, STAGES_OF_INNOVATION } from "../data/jharkhandData";
import { challengeService, getLocalChallenges, saveLocalChallenges } from "../services/api";
import ChallengeDetailModal from "../components/ChallengeDetailModal";

export default function UniversityDashboard() {
    const navigate = useNavigate();

    // Default logged in HEI
    const [currentHei, setCurrentHei] = useState(PARTICIPATING_HEIS[0]); // BIT Mesra, Ranchi
    const [activeTab, setActiveTab] = useState("assigned-projects");
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    // Selected Challenge for Detail Modal
    const [selectedChallenge, setSelectedChallenge] = useState(null);

    // Milestone update modal state
    const [updatingChallenge, setUpdatingChallenge] = useState(null);
    const [newPrototypeDetails, setNewPrototypeDetails] = useState("");
    const [newLabResults, setNewLabResults] = useState("");
    const [targetStage, setTargetStage] = useState("PROTOTYPE");

    // Student Team Management
    const [studentTeams, setStudentTeams] = useState([
        {
            id: "TEAM-01",
            name: "HydroTech Innovators",
            challengeId: "JH-2026-0101",
            lead: "Aman Verma (B.Tech Civil & Env, 4th Year)",
            members: ["Pooja Soren (B.Tech Chemical)", "Rahul Singh (B.Tech Mechanical)", "Neha Gupta (M.Tech Water Engg)"],
            mentor: "Dr. Arvind Sharma",
            lab: "Clean Water & Geo-Hydrology FabLab",
            csrGrant: "Tata Steel Foundation (₹3.5L)"
        },
        {
            id: "TEAM-02",
            name: "KrishiShakti Agro Innovators",
            challengeId: "JH-2026-0102",
            lead: "Sanjay Mahato (B.Tech Mechanical)",
            members: ["Rani Kumari (B.Tech Electronics)", "Amit Oraon (B.Tech Agro-Tech)"],
            mentor: "Dr. Manoj Gupta & Dr. Birsa Hansda",
            lab: "Agri-Machinery Prototyping Workshop",
            csrGrant: "Jharkhand AgTech Incubator (₹2.8L)"
        },
        {
            id: "TEAM-03",
            name: "BhashaSetu EdTech Team",
            challengeId: "JH-2026-0105",
            lead: "Suman Murmu (B.Tech CS & AI)",
            members: ["Anil Hembrom (B.Tech IT)", "Priyanka Roy (M.A. Tribal Studies)"],
            mentor: "Dr. Rameshwar Oraon",
            lab: "Tribal Languages & Vernacular EdTech Lab",
            csrGrant: "Tata Steel Foundation (EdTech)"
        }
    ]);

    const loadData = async () => {
        setLoading(true);
        const data = await challengeService.getAllChallenges();
        setChallenges(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
            challengeService.getAllChallenges().then(data => {
                if (data && data.length > 0) {
                    setChallenges(data);
                }
            }).catch(() => {});
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Filter challenges relevant to this university or show all available
    const heiChallenges = useMemo(() => {
        const filtered = challenges.filter(c =>
            c.assignedHei?.toLowerCase().includes(currentHei.shortName.toLowerCase().split(",")[0]) ||
            c.assignedHei?.toLowerCase().includes("bit mesra") ||
            currentHei.domains.includes(c.domain) ||
            c.status === "SUBMITTED"
        );
        return filtered.length > 0 ? filtered : challenges;
    }, [challenges, currentHei]);

    // KPIs for University
    const activeProjectsCount = heiChallenges.filter(c => ["ASSIGNED", "RESEARCH", "PROTOTYPE", "TESTING", "PILOT"].includes(c.status)).length;
    const completedPilotsCount = heiChallenges.filter(c => c.status === "RESOLVED").length;
    const studentCount = studentTeams.reduce((acc, t) => acc + t.members.length + 1, 0);

    // University action: advance project stage & add lab deliverables
    const handleSaveDeliverable = async () => {
        if (!updatingChallenge) return;

        const updated = await challengeService.updateChallengeStatus(
            updatingChallenge.id,
            targetStage,
            {
                prototypeDetails: newPrototypeDetails || updatingChallenge.prototypeDetails,
                pilotResults: newLabResults || updatingChallenge.pilotResults,
                citizenVerificationRequested: targetStage === "PILOT"
            }
        );

        setChallenges(updated);
        alert(`🚀 Deliverable & Milestone saved! Challenge #${updatingChallenge.id} advanced to ${targetStage}.`);
        setUpdatingChallenge(null);
        setNewPrototypeDetails("");
        setNewLabResults("");
    };

    return (
        <div style={styles.app}>
            {/* University Header */}
            <header style={styles.heiHeader}>
                <div style={styles.headerContainer}>
                    <div style={styles.headerLeft}>
                        <div style={styles.heiAvatar}>
                            <Building2 size={24} color="#ffffff" />
                        </div>
                        <div>
                            <div style={styles.heiTitle}>
                                {currentHei.name} <span style={styles.heiTag}>HEI Innovation Portal</span>
                            </div>
                            <div style={styles.heiSub}>
                                NEP 2020 Multidisciplinary R&D, Prototyping & Student Innovation Center • Govt. of Jharkhand
                            </div>
                        </div>
                    </div>

                    <div style={styles.headerRight}>
                        {/* University Selector Switcher */}
                        <select
                            value={currentHei.id}
                            onChange={(e) => {
                                const found = PARTICIPATING_HEIS.find(h => h.id === e.target.value);
                                if (found) setCurrentHei(found);
                            }}
                            style={styles.heiSelect}
                        >
                            {PARTICIPATING_HEIS.map(h => (
                                <option key={h.id} value={h.id}>🎓 {h.shortName}</option>
                            ))}
                        </select>

                        {/* Switch View Buttons */}
                        <button onClick={() => navigate("/dashboard")} style={styles.switchBtn}>
                            <span>🌾 Citizen View</span>
                        </button>
                        <button onClick={() => navigate("/admin")} style={{ ...styles.switchBtn, background: "#0f172a", color: "#38bdf8" }}>
                            <span>🛡️ Nodal Admin</span>
                        </button>

                        <div style={styles.mentorBadge}>
                            <div style={styles.mentorAvatar}>DR</div>
                            <div>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>Dr. Arvind Sharma</div>
                                <div style={{ fontSize: "10px", color: "#cbd5e1" }}>Lead Faculty Mentor</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main style={styles.main}>
                {/* University KPI Banner */}
                <section style={styles.kpiGrid}>
                    <div style={styles.kpiCard}>
                        <div style={styles.kpiTop}>
                            <span style={styles.kpiLabel}>Assigned Challenges</span>
                            <div style={{ ...styles.kpiIcon, background: "#ede9fe", color: "#7c3aed" }}>
                                <FileText size={16} />
                            </div>
                        </div>
                        <div style={{ ...styles.kpiVal, color: "#7c3aed" }}>{heiChallenges.length}</div>
                        <span style={styles.kpiSub}>State Nodal Allocations</span>
                    </div>

                    <div style={styles.kpiCard}>
                        <div style={styles.kpiTop}>
                            <span style={styles.kpiLabel}>Active Student Teams</span>
                            <div style={{ ...styles.kpiIcon, background: "#e0f2fe", color: "#0284c7" }}>
                                <Users size={16} />
                            </div>
                        </div>
                        <div style={{ ...styles.kpiVal, color: "#0284c7" }}>{studentTeams.length} Teams</div>
                        <span style={styles.kpiSub}>{studentCount} Student Innovators</span>
                    </div>

                    <div style={styles.kpiCard}>
                        <div style={styles.kpiTop}>
                            <span style={styles.kpiLabel}>Active Lab Prototyping</span>
                            <div style={{ ...styles.kpiIcon, background: "#ffedd5", color: "#ea580c" }}>
                                <Cpu size={16} />
                            </div>
                        </div>
                        <div style={{ ...styles.kpiVal, color: "#ea580c" }}>{activeProjectsCount}</div>
                        <span style={styles.kpiSub}>FabLab Hardware & Software</span>
                    </div>

                    <div style={styles.kpiCard}>
                        <div style={styles.kpiTop}>
                            <span style={styles.kpiLabel}>CSR Grants Disbursed</span>
                            <div style={{ ...styles.kpiIcon, background: "#dcfce7", color: "#16a34a" }}>
                                <Briefcase size={16} />
                            </div>
                        </div>
                        <div style={{ ...styles.kpiVal, color: "#16a34a" }}>₹12.5 Lakhs</div>
                        <span style={styles.kpiSub}>Tata Steel & CCL CSR</span>
                    </div>

                    <div style={styles.kpiCard}>
                        <div style={styles.kpiTop}>
                            <span style={styles.kpiLabel}>Verified Deployments</span>
                            <div style={{ ...styles.kpiIcon, background: "#ccfbf1", color: "#0d9488" }}>
                                <CheckCircle2 size={16} />
                            </div>
                        </div>
                        <div style={{ ...styles.kpiVal, color: "#0d9488" }}>{completedPilotsCount}</div>
                        <span style={styles.kpiSub}>Panchayat Signed-off</span>
                    </div>
                </section>

                {/* Tabs */}
                <div style={styles.tabsNav}>
                    <button
                        onClick={() => setActiveTab("assigned-projects")}
                        style={{ ...styles.tabBtn, ...(activeTab === "assigned-projects" ? styles.activeTabBtn : {}) }}
                    >
                        🔬 Assigned Challenge Workspaces ({heiChallenges.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("student-teams")}
                        style={{ ...styles.tabBtn, ...(activeTab === "student-teams" ? styles.activeTabBtn : {}) }}
                    >
                        👥 Multidisciplinary Student Teams
                    </button>
                    <button
                        onClick={() => setActiveTab("fablabs")}
                        style={{ ...styles.tabBtn, ...(activeTab === "fablabs" ? styles.activeTabBtn : {}) }}
                    >
                        🛠️ Campus FabLabs & Equipment
                    </button>
                    <button
                        onClick={() => setActiveTab("csr-mentors")}
                        style={{ ...styles.tabBtn, ...(activeTab === "csr-mentors" ? styles.activeTabBtn : {}) }}
                    >
                        💼 Industry Mentors & CSR Grants
                    </button>
                    <button
                        onClick={() => setActiveTab("ip-portfolio")}
                        style={{ ...styles.tabBtn, ...(activeTab === "ip-portfolio" ? styles.activeTabBtn : {}) }}
                    >
                        📜 Patents & NEP 2020 Credits
                    </button>
                </div>

                {/* TAB 1: ASSIGNED CHALLENGES WORKSPACE */}
                {activeTab === "assigned-projects" && (
                    <section>
                        <div style={styles.workspaceIntro}>
                            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                                Assigned State Challenges & Innovation Workspaces
                            </h2>
                            <p style={{ fontSize: "13px", color: "#64748b" }}>
                                Higher Education Institutions (HEIs) manage problem formulation, lab schematics, hardware prototyping, lab testing, and Panchayat field pilot deployment under NEP 2020.
                            </p>
                        </div>

                        <div style={styles.projectListGrid}>
                            {heiChallenges.map(challenge => {
                                const domainObj = THEMATIC_DOMAINS.find(d => d.id === challenge.domain) || { icon: "💡", color: "#0284c7" };
                                const stageIndex = STAGES_OF_INNOVATION.findIndex(s => s.key === challenge.status);
                                const stageObj = STAGES_OF_INNOVATION[stageIndex >= 0 ? stageIndex : 0];

                                return (
                                    <div key={challenge.id} style={styles.projectCard}>
                                        <div style={styles.cardHeader}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={styles.challengeIdBadge}>{challenge.id}</span>
                                                <span style={{ fontSize: "12px", color: domainObj.color, fontWeight: 700 }}>
                                                    {domainObj.icon} {challenge.domainName || challenge.domain}
                                                </span>
                                            </div>
                                            <span style={{
                                                ...styles.urgencyBadge,
                                                ...(challenge.urgency === "CRITICAL" ? styles.urgencyCritical :
                                                    challenge.urgency === "HIGH" ? styles.urgencyHigh : styles.urgencyMedium)
                                            }}>
                                                {challenge.urgency} URGENCY
                                            </span>
                                        </div>

                                        <h3 style={styles.projectTitle}>{challenge.title}</h3>
                                        <p style={styles.projectDesc}>{challenge.description}</p>

                                        {/* Geolocation & Panchayat info */}
                                        <div style={styles.villageInfoBox}>
                                            <MapPin size={14} color="#0284c7" />
                                            <span>
                                                Target Field Location: <strong>{challenge.panchayat || "Gram Panchayat"}, {challenge.block}, {challenge.district}</strong>
                                                &nbsp;(Impacts {challenge.affectedPopulation ? challenge.affectedPopulation.toLocaleString() : "500+"} Villagers)
                                            </span>
                                        </div>

                                        {/* 8-Stage Progress Bar */}
                                        <div style={styles.stageBox}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: 6 }}>
                                                <span style={{ color: "#334155" }}>
                                                    Current Stage: <strong>Stage {stageObj.step}/8 — {stageObj.label}</strong>
                                                </span>
                                                <span style={{ color: "#7c3aed", fontWeight: 700 }}>
                                                    {stageObj.desc}
                                                </span>
                                            </div>
                                            <div style={styles.progressBg}>
                                                <div
                                                    style={{
                                                        ...styles.progressFill,
                                                        width: `${(stageObj.step / 8) * 100}%`,
                                                        background: stageObj.step === 8 ? "#16a34a" : "#7c3aed"
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Deliverables summary */}
                                        {challenge.prototypeDetails && (
                                            <div style={styles.deliverablePill}>
                                                <strong>🛠️ Lab Prototype:</strong> {challenge.prototypeDetails}
                                            </div>
                                        )}
                                        {challenge.pilotResults && (
                                            <div style={{ ...styles.deliverablePill, background: "#ecfdf5", color: "#065f46", borderLeft: "3px solid #10b981" }}>
                                                <strong>🧪 Test & Field Results:</strong> {challenge.pilotResults}
                                            </div>
                                        )}

                                        {/* University Action Buttons */}
                                        <div style={styles.cardActions}>
                                            <button
                                                onClick={() => setSelectedChallenge(challenge)}
                                                style={styles.actionBtnInspect}
                                            >
                                                <Eye size={14} /> Full Evidence
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setUpdatingChallenge(challenge);
                                                    setNewPrototypeDetails(challenge.prototypeDetails || "");
                                                    setNewLabResults(challenge.pilotResults || "");
                                                }}
                                                style={styles.actionBtnUpdate}
                                            >
                                                <UploadCloud size={14} /> Upload Lab Deliverable & Advance Stage
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* TAB 2: MULTIDISCIPLINARY STUDENT TEAMS */}
                {activeTab === "student-teams" && (
                    <section>
                        <div style={styles.workspaceIntro}>
                            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                                Multidisciplinary Student Innovation Teams (NEP 2020)
                            </h2>
                            <p style={{ fontSize: "13px", color: "#64748b" }}>
                                Cross-departmental student teams working under faculty mentorship with industry seed grants.
                            </p>
                        </div>

                        <div style={styles.teamsGrid}>
                            {studentTeams.map(team => (
                                <div key={team.id} style={styles.teamCard}>
                                    <div style={styles.teamHeader}>
                                        <div style={styles.teamIconBadge}>🎓</div>
                                        <div>
                                            <h3 style={styles.teamName}>{team.name}</h3>
                                            <span style={styles.teamId}>Linked to Challenge: <strong>{team.challengeId}</strong></span>
                                        </div>
                                    </div>

                                    <div style={styles.teamDetailRow}>
                                        <strong>Team Lead:</strong> <span>{team.lead}</span>
                                    </div>
                                    <div style={styles.teamDetailRow}>
                                        <strong>Faculty Mentor:</strong> <span>{team.mentor}</span>
                                    </div>
                                    <div style={styles.teamDetailRow}>
                                        <strong>Specialized Lab:</strong> <span>{team.lab}</span>
                                    </div>
                                    <div style={styles.teamDetailRow}>
                                        <strong>Industry Sponsor:</strong> <span>{team.csrGrant}</span>
                                    </div>

                                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                                        <strong style={{ fontSize: "12px", color: "#0f172a", display: "block", marginBottom: 4 }}>
                                            Student Team Members:
                                        </strong>
                                        <ul style={{ fontSize: "12px", color: "#475569", paddingLeft: 18 }}>
                                            {team.members.map((m, i) => (
                                                <li key={i}>{m}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TAB 3: CAMPUS FABLABS */}
                {activeTab === "fablabs" && (
                    <section>
                        <div style={styles.workspaceIntro}>
                            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                                {currentHei.name} — Specialized Innovation FabLabs
                            </h2>
                            <p style={{ fontSize: "13px", color: "#64748b" }}>
                                Advanced campus laboratories equipped for hardware prototyping, water chemistry, micro-grids, and AI analytics.
                            </p>
                        </div>

                        <div style={styles.teamsGrid}>
                            {currentHei.specializedLabs.map((lab, i) => (
                                <div key={i} style={styles.teamCard}>
                                    <div style={styles.teamHeader}>
                                        <div style={{ ...styles.teamIconBadge, background: "#ede9fe", color: "#7c3aed" }}>🔬</div>
                                        <div>
                                            <h3 style={styles.teamName}>{lab}</h3>
                                            <span style={styles.teamId}>Active Campus Facility</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: "12.5px", color: "#475569", marginTop: 8, lineHeight: 1.5 }}>
                                        Equipped for prototype validation, rapid prototyping, sensor calibration, and sample quality compliance before field deployment in Jharkhand Panchayats.
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TAB 4: CSR & INDUSTRY MENTORS */}
                {activeTab === "csr-mentors" && (
                    <section>
                        <div style={styles.workspaceIntro}>
                            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                                Industry Co-Sponsors & CSR Mentorship Network
                            </h2>
                        </div>
                        <div style={styles.teamsGrid}>
                            {INDUSTRY_CSR_PARTNERS.map(ind => (
                                <div key={ind.id} style={styles.teamCard}>
                                    <div style={styles.teamHeader}>
                                        <div style={{ ...styles.teamIconBadge, background: "#dcfce7", color: "#16a34a" }}>💼</div>
                                        <div>
                                            <h3 style={styles.teamName}>{ind.name}</h3>
                                            <span style={styles.teamId}>{ind.category}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#334155", marginTop: 8 }}>
                                        <strong>Funding & Equipment Support:</strong> {ind.fundingContribution}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: 4 }}>
                                        <strong>Focus Areas:</strong> {ind.focusAreas.join(", ")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TAB 5: IP & NEP 2020 OUTCOMES */}
                {activeTab === "ip-portfolio" && (
                    <section>
                        <div style={styles.workspaceIntro}>
                            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                                Intellectual Property (IP) & Measurable Social Outcomes
                            </h2>
                        </div>
                        <div style={styles.teamsGrid}>
                            <div style={styles.teamCard}>
                                <h3 style={styles.teamName}>📜 Patents Filed & Commercialization</h3>
                                <p style={{ fontSize: "12.5px", color: "#475569", marginTop: 6 }}>
                                    • Patent App #2026310482: <em>"Gravity-Fed Nano-Activated Alumina Fluoride Adsorption Media"</em> (BIT Mesra & Tata Steel).
                                    <br />
                                    • Patent App #2026310719: <em>"Solar-Assisted Sticklac Scraping and Grade-Separation Drum"</em> (BAU & NIT JSR).
                                </p>
                            </div>

                            <div style={styles.teamCard}>
                                <h3 style={styles.teamName}>🚀 Student Startups Incubated</h3>
                                <p style={{ fontSize: "12.5px", color: "#475569", marginTop: 6 }}>
                                    • <strong>CleanAqua Solutions Pvt Ltd</strong>: Incubated at BIT Mesra FabLab. Deploying low-cost handpump arsenic/fluoride cartridges across Palamu & Sahibganj.
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Modal: Upload Lab Deliverable & Advance Stage */}
            {updatingChallenge && (
                <div style={styles.backdrop} onClick={() => setUpdatingChallenge(null)}>
                    <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
                            Upload Lab Deliverable & Advance Project Stage
                        </h3>
                        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: 16 }}>
                            Challenge: <strong>{updatingChallenge.title}</strong>
                        </p>

                        <div style={{ marginBottom: 14 }}>
                            <label style={styles.label}>Select Target Project Stage *</label>
                            <select
                                value={targetStage}
                                onChange={(e) => setTargetStage(e.target.value)}
                                style={styles.selectInput}
                            >
                                <option value="RESEARCH">Stage 4: Research & Design (Schematics & Field Survey)</option>
                                <option value="PROTOTYPE">Stage 5: Prototyping (Hardware/Software Fabrication)</option>
                                <option value="TESTING">Stage 6: Testing & Validation (Lab Quality Certification)</option>
                                <option value="PILOT">Stage 7: Community Field Pilot (Deploy in Village Panchayat)</option>
                                <option value="RESOLVED">Stage 8: Deployed & Impact Verified</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label style={styles.label}>Prototype Specifications / Technology Details</label>
                            <textarea
                                value={newPrototypeDetails}
                                onChange={(e) => setNewPrototypeDetails(e.target.value)}
                                placeholder="Describe the technical fabrication, motor rating, filter media, software stack..."
                                rows={2}
                                style={styles.textarea}
                            />
                        </div>

                        <div style={{ marginBottom: 18 }}>
                            <label style={styles.label}>Lab Testing / Chemical Analysis Results</label>
                            <textarea
                                value={newLabResults}
                                onChange={(e) => setNewLabResults(e.target.value)}
                                placeholder="e.g. Lab tested: Fluoride reduced from 4.8 mg/L to 0.62 mg/L. Passed BIS 10500 standards..."
                                rows={2}
                                style={styles.textarea}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button onClick={() => setUpdatingChallenge(null)} style={styles.cancelBtn}>
                                Cancel
                            </button>
                            <button onClick={handleSaveDeliverable} style={styles.saveBtn}>
                                ✓ Save Deliverable & Update Milestone
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
                        const updated = newList.find(c => c.id === selectedChallenge.id);
                        if (updated) setSelectedChallenge(updated);
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
    heiHeader: {
        background: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)",
        borderBottom: "1px solid #6b21a8",
        padding: "14px 0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
    },
    headerContainer: {
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },
    heiAvatar: {
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(124, 58, 237, 0.4)"
    },
    heiTitle: {
        fontSize: "18px",
        fontWeight: 800,
        color: "#ffffff"
    },
    heiTag: {
        fontSize: "11.5px",
        color: "#c084fc",
        background: "rgba(192, 132, 252, 0.2)",
        padding: "2px 8px",
        borderRadius: "10px",
        marginLeft: "6px"
    },
    heiSub: {
        fontSize: "11px",
        color: "#cbd5e1"
    },
    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap"
    },
    heiSelect: {
        padding: "8px 12px",
        borderRadius: "10px",
        border: "1px solid #7c3aed",
        background: "#2e1065",
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: 600,
        outline: "none"
    },
    switchBtn: {
        padding: "8px 12px",
        borderRadius: "10px",
        background: "rgba(255, 255, 255, 0.15)",
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: 700,
        border: "1px solid rgba(255, 255, 255, 0.25)"
    },
    mentorBadge: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(255,255,255,0.1)",
        padding: "4px 10px 4px 6px",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.2)"
    },
    mentorAvatar: {
        width: "28px",
        height: "28px",
        borderRadius: "8px",
        background: "#a855f7",
        color: "#ffffff",
        fontWeight: 800,
        fontSize: "11px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    main: {
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "24px 20px 80px 20px"
    },
    kpiGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "16px",
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
        background: "#7c3aed",
        color: "#ffffff",
        borderColor: "#7c3aed",
        boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)"
    },
    workspaceIntro: {
        marginBottom: "18px"
    },
    projectListGrid: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "18px"
    },
    projectCard: {
        background: "#ffffff",
        borderRadius: "18px",
        border: "1px solid #e2e8f0",
        padding: "22px",
        boxShadow: "0 2px 10px rgba(15,23,42,0.03)"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px"
    },
    challengeIdBadge: {
        fontSize: "12px",
        fontWeight: 800,
        color: "#0284c7",
        background: "#e0f2fe",
        padding: "3px 8px",
        borderRadius: "6px"
    },
    urgencyBadge: {
        fontSize: "10.5px",
        fontWeight: 800,
        padding: "3px 8px",
        borderRadius: "6px"
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
    projectTitle: {
        fontSize: "16.5px",
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: "6px"
    },
    projectDesc: {
        fontSize: "13px",
        color: "#475569",
        lineHeight: 1.5,
        marginBottom: "12px"
    },
    villageInfoBox: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12.5px",
        color: "#334155",
        background: "#f8fafc",
        padding: "8px 12px",
        borderRadius: "8px",
        marginBottom: "14px"
    },
    stageBox: {
        background: "#fdf4ff",
        border: "1px solid #f5d0fe",
        borderRadius: "10px",
        padding: "10px 14px",
        marginBottom: "12px"
    },
    progressBg: {
        width: "100%",
        height: "6px",
        background: "#f0abfc",
        borderRadius: "4px",
        overflow: "hidden"
    },
    progressFill: {
        height: "100%",
        borderRadius: "4px",
        transition: "width 0.4s ease"
    },
    deliverablePill: {
        fontSize: "12.5px",
        color: "#334155",
        background: "#f1f5f9",
        padding: "8px 12px",
        borderRadius: "8px",
        marginBottom: "8px"
    },
    cardActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "14px",
        paddingTop: "12px",
        borderTop: "1px solid #f1f5f9"
    },
    actionBtnInspect: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "8px 14px",
        borderRadius: "8px",
        background: "#f1f5f9",
        color: "#475569",
        fontSize: "12.5px",
        fontWeight: 600
    },
    actionBtnUpdate: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        borderRadius: "8px",
        background: "#7c3aed",
        color: "#ffffff",
        fontSize: "12.5px",
        fontWeight: 700,
        boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)"
    },
    teamsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "18px"
    },
    teamCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(15,23,42,0.03)"
    },
    teamHeader: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "12px"
    },
    teamIconBadge: {
        width: "38px",
        height: "38px",
        borderRadius: "10px",
        background: "#e0f2fe",
        color: "#0284c7",
        fontSize: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    teamName: {
        fontSize: "15px",
        fontWeight: 800,
        color: "#0f172a"
    },
    teamId: {
        fontSize: "11.5px",
        color: "#64748b"
    },
    teamDetailRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "12.5px",
        padding: "4px 0",
        borderBottom: "1px solid #f8fafc"
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
    modalCard: {
        background: "#ffffff",
        borderRadius: "20px",
        padding: "26px 28px",
        width: "100%",
        maxWidth: "560px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.3)"
    },
    label: {
        fontSize: "12px",
        fontWeight: 700,
        color: "#334155",
        display: "block",
        marginBottom: "6px"
    },
    selectInput: {
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
    saveBtn: {
        padding: "9px 18px",
        borderRadius: "8px",
        background: "#7c3aed",
        color: "#ffffff",
        fontWeight: 700,
        fontSize: "13px"
    }
};
