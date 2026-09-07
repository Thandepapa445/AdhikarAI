import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Sparkles, PlusCircle, Search, Filter, MapPin, Users, Award, Building,
    Briefcase, CheckCircle2, ChevronRight, AlertTriangle, ArrowUpRight,
    TrendingUp, ShieldCheck, FileCheck2, Lightbulb, RefreshCw
} from "lucide-react";
import { THEMATIC_DOMAINS, PARTICIPATING_HEIS, INDIA_STATES_AND_REGIONS, STAGES_OF_INNOVATION, INDUSTRY_CSR_PARTNERS } from "../data/indiaData";
import { challengeService, getLocalChallenges } from "../services/api";
import NavBar from "../components/NavBar";
import ChallengeDetailModal from "../components/ChallengeDetailModal";
import CommunityInnovationMap from "../components/CommunityInnovationMap";
import MobileBottomNav from "../components/MobileBottomNav";

export default function Dashboard() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("my-challenges");
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDomain, setSelectedDomain] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");

    // Modal
    const [selectedChallenge, setSelectedChallenge] = useState(null);

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

    // Impact Statistics
    const totalChallenges = challenges.length;
    const inActiveRnD = challenges.filter(c => ["RESEARCH", "PROTOTYPE", "TESTING"].includes(c.status)).length;
    const inFieldPilot = challenges.filter(c => c.status === "PILOT").length;
    const totalImpacted = useMemo(() => {
        return challenges.reduce((acc, curr) => acc + (Number(curr.affectedPopulation) || 500), 0);
    }, [challenges]);

    // Filtered challenges list
    const filteredChallenges = useMemo(() => {
        return challenges.filter(c => {
            const matchesSearch = !searchTerm ||
                c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.block?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDomain = selectedDomain === "ALL" || c.domain === selectedDomain;
            const matchesStatus = selectedStatus === "ALL" || c.status === selectedStatus;

            return matchesSearch && matchesDomain && matchesStatus;
        });
    }, [challenges, searchTerm, selectedDomain, selectedStatus]);

    return (
        <div style={styles.app}>
            <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main style={styles.main}>
                {/* Hero & Impact Banner */}
                <section className="hero-section" style={styles.heroSection}>
                    <div className="hero-content" style={styles.heroContent}>
                        <div style={styles.heroBadge}>
                            <Sparkles size={14} color="#0284c7" />
                            <span>Adhikar AI • National Citizen Innovation & Grievance Ecosystem</span>
                        </div>
                        <h1 style={styles.heroHeading}>
                            Transforming Grassroots Challenges into <br />
                            <span style={styles.headingGradient}>University Research & Civic Solutions</span>
                        </h1>
                        <p style={styles.heroSub}>
                            Welcome, <strong>Citizen Innovators & Community Representatives</strong>. Submit local challenges across Infrastructure, Sanitation, Water, and Clean Energy to be matched with premier Universities (HEIs) and routed for administrative redressal.
                        </p>

                        <div style={styles.heroButtons}>
                            <button
                                onClick={() => navigate("/challenges/new")}
                                style={styles.primaryCta}
                            >
                                <PlusCircle size={18} />
                                <span>Submit a Societal Challenge</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("community-map")}
                                style={styles.secondaryCta}
                            >
                                <MapPin size={18} />
                                <span>Explore National GIS Map</span>
                            </button>
                        </div>
                    </div>

                    {/* KPI Impact Cards */}
                    <div className="kpi-grid" style={styles.kpiGrid}>
                        <div style={styles.kpiCard}>
                            <div style={styles.kpiHeader}>
                                <span style={styles.kpiTitle}>Total Challenges</span>
                                <div style={{ ...styles.kpiIcon, background: "#e0f2fe", color: "#0284c7" }}>
                                    <FileCheck2 size={18} />
                                </div>
                            </div>
                            <div style={styles.kpiValue}>{totalChallenges}</div>
                            <span style={styles.kpiSub}>Crowdsourced across India</span>
                        </div>

                        <div style={styles.kpiCard}>
                            <div style={styles.kpiHeader}>
                                <span style={styles.kpiTitle}>In University R&D</span>
                                <div style={{ ...styles.kpiIcon, background: "#ede9fe", color: "#7c3aed" }}>
                                    <Building size={18} />
                                </div>
                            </div>
                            <div style={styles.kpiValue}>{inActiveRnD}</div>
                            <span style={styles.kpiSub}>Prototyping in HEI Labs</span>
                        </div>

                        <div style={styles.kpiCard}>
                            <div style={styles.kpiHeader}>
                                <span style={styles.kpiTitle}>Community Pilots</span>
                                <div style={{ ...styles.kpiIcon, background: "#ffedd5", color: "#ea580c" }}>
                                    <Lightbulb size={18} />
                                </div>
                            </div>
                            <div style={styles.kpiValue}>{inFieldPilot}</div>
                            <span style={styles.kpiSub}>Live village field testing</span>
                        </div>

                        <div style={styles.kpiCard}>
                            <div style={styles.kpiHeader}>
                                <span style={styles.kpiTitle}>Citizens Impacted</span>
                                <div style={{ ...styles.kpiIcon, background: "#dcfce7", color: "#16a34a" }}>
                                    <Users size={18} />
                                </div>
                            </div>
                            <div style={styles.kpiValue}>{totalImpacted.toLocaleString()}+</div>
                            <span style={styles.kpiSub}>Villagers & Panchayat beneficiaries</span>
                        </div>
                    </div>
                </section>

                {/* Main Navigation Tabs */}
                <div className="tabs-bar" style={styles.tabsBar}>
                    <button
                        onClick={() => setActiveTab("my-challenges")}
                        style={{
                            ...styles.tabBtn,
                            ...(activeTab === "my-challenges" ? styles.activeTabBtn : {})
                        }}
                    >
                        📋 My Submissions & Pipeline ({challenges.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("community-map")}
                        style={{
                            ...styles.tabBtn,
                            ...(activeTab === "community-map" ? styles.activeTabBtn : {})
                        }}
                    >
                        🗺️ National Community GIS Map
                    </button>

                    <button
                        onClick={() => setActiveTab("showcase")}
                        style={{
                            ...styles.tabBtn,
                            ...(activeTab === "showcase" ? styles.activeTabBtn : {})
                        }}
                    >
                        🌟 Deployed Technology Showcase
                    </button>

                    <button
                        onClick={() => setActiveTab("network")}
                        style={{
                            ...styles.tabBtn,
                            ...(activeTab === "network" ? styles.activeTabBtn : {})
                        }}
                    >
                        🏛️ University (HEI) & CSR Network
                    </button>
                </div>

                {/* TAB 1: MY SUBMISSIONS */}
                {activeTab === "my-challenges" && (
                    <section style={styles.contentSection}>
                        {/* Search & Filter Toolbar */}
                        <div className="toolbar-section" style={styles.toolbar}>
                            <div style={styles.searchBox}>
                                <Search size={16} color="#64748b" />
                                <input
                                    type="text"
                                    placeholder="Search by title, district, block, or keyword..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={styles.searchInput}
                                />
                            </div>

                            <div style={styles.filtersGroup}>
                                <select
                                    value={selectedDomain}
                                    onChange={(e) => setSelectedDomain(e.target.value)}
                                    style={styles.filterSelect}
                                >
                                    <option value="ALL">All 9 Thematic Domains</option>
                                    {THEMATIC_DOMAINS.map(d => (
                                        <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    style={styles.filterSelect}
                                >
                                    <option value="ALL">All 8 Lifecycle Stages</option>
                                    {STAGES_OF_INNOVATION.map(s => (
                                        <option key={s.key} value={s.key}>{s.step}. {s.label}</option>
                                    ))}
                                </select>

                                <button onClick={loadData} style={styles.refreshBtn} title="Sync Updates">
                                    <RefreshCw size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Challenges List Grid */}
                        <div className="challenges-grid" style={styles.challengesGrid}>
                            {filteredChallenges.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <Lightbulb size={36} color="#94a3b8" />
                                    <h3>No challenges match your search filters</h3>
                                    <p>Try resetting filters or submit a new community problem statement.</p>
                                </div>
                            ) : (
                                filteredChallenges.map(challenge => {
                                    const domain = THEMATIC_DOMAINS.find(d => d.id === challenge.domain) || {
                                        icon: "💡",
                                        name: challenge.domainName || challenge.domain,
                                        color: "#0284c7",
                                        bgColor: "#e0f2fe"
                                    };

                                    const stageIndex = STAGES_OF_INNOVATION.findIndex(s => s.key === challenge.status);
                                    const currentStage = STAGES_OF_INNOVATION[stageIndex >= 0 ? stageIndex : 0];

                                    return (
                                        <article
                                            key={challenge.id}
                                            style={styles.challengeCard}
                                            onClick={() => setSelectedChallenge(challenge)}
                                        >
                                            {/* Card Top */}
                                            <div style={styles.cardTop}>
                                                <div style={{ ...styles.domainBadge, background: domain.bgColor, color: domain.color }}>
                                                    <span>{domain.icon}</span>
                                                    <span>{domain.name}</span>
                                                </div>

                                                <span style={{
                                                    ...styles.urgencyBadge,
                                                    ...(challenge.urgency === "CRITICAL" ? styles.urgencyCritical :
                                                        challenge.urgency === "HIGH" ? styles.urgencyHigh : styles.urgencyMedium)
                                                }}>
                                                    {challenge.urgency}
                                                </span>
                                            </div>

                                            {/* Card Title & Desc */}
                                            <h3 style={styles.cardTitle}>{challenge.title}</h3>
                                            <p style={styles.cardDesc}>
                                                {challenge.description?.slice(0, 130)}...
                                            </p>

                                            {/* Location & Impact */}
                                            <div style={styles.cardMetaRow}>
                                                <span style={styles.cardMetaItem}>
                                                    <MapPin size={13} color="#0284c7" />
                                                    {challenge.panchayat || "Panchayat"}, {challenge.district}
                                                </span>
                                                <span style={styles.cardMetaItem}>
                                                    <Users size={13} color="#16a34a" />
                                                    {challenge.affectedPopulation ? challenge.affectedPopulation.toLocaleString() : "500+"} Villagers
                                                </span>
                                            </div>

                                            {/* 8-Stage Progress Mini Visualizer */}
                                            <div style={styles.stageVisualizer}>
                                                <div style={styles.stageVisualHeader}>
                                                    <span style={styles.stageLabel}>
                                                        Stage {currentStage.step}/8: <strong>{currentStage.label}</strong>
                                                    </span>
                                                    <span style={styles.stageStepCount}>
                                                        {Math.round((currentStage.step / 8) * 100)}% Complete
                                                    </span>
                                                </div>
                                                <div style={styles.progressBarBg}>
                                                    <div
                                                        style={{
                                                            ...styles.progressBarFill,
                                                            width: `${(currentStage.step / 8) * 100}%`,
                                                            backgroundColor: currentStage.step === 8 ? "#16a34a" : "#0284c7"
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Assigned University & Industry Partner */}
                                            <div style={styles.collaborationPills}>
                                                {challenge.assignedHei && (
                                                    <div style={styles.heiPill}>
                                                        <Building size={12} color="#7c3aed" />
                                                        <span>{challenge.assignedHei}</span>
                                                    </div>
                                                )}
                                                {challenge.industryPartner && (
                                                    <div style={styles.csrPill}>
                                                        <Briefcase size={12} color="#16a34a" />
                                                        <span>{challenge.industryPartner.split("(")[0]}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Footer / Action */}
                                            <div style={styles.cardFooter}>
                                                {challenge.status === "PILOT" && (
                                                    <span style={styles.pilotVerifyNotice}>
                                                        ⚡ Action: Citizen Field Verification Required
                                                    </span>
                                                )}
                                                <button style={styles.viewBtn}>
                                                    <span>Inspect Full Lifecycle</span>
                                                    <ChevronRight size={15} />
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </div>
                    </section>
                )}

                {/* TAB 2: JHARKHAND GIS MAP */}
                {activeTab === "community-map" && (
                    <section style={styles.contentSection}>
                        <CommunityInnovationMap
                            challenges={challenges}
                            onSelectChallenge={(c) => setSelectedChallenge(c)}
                        />
                    </section>
                )}

                {/* TAB 3: DEPLOYED TECH SHOWCASE */}
                {activeTab === "showcase" && (
                    <section style={styles.contentSection}>
                        <div style={styles.showcaseIntro}>
                            <h2 style={styles.secHeading}>Grassroots Technologies Deployed Across Indian Communities</h2>
                            <p style={styles.secSub}>
                                Real-world social impact achieved through NEP 2020 student research, multidisciplinary university fablabs, and industry CSR partnerships.
                            </p>
                        </div>

                        <div style={styles.showcaseGrid}>
                            {challenges.filter(c => ["RESOLVED", "PILOT"].includes(c.status)).map(item => (
                                <div key={item.id} style={styles.showcaseCard}>
                                    <img
                                        src={item.evidenceImageUrl}
                                        alt={item.title}
                                        style={styles.showcaseImg}
                                    />
                                    <div style={styles.showcaseBody}>
                                        <span style={styles.showcaseTag}>{item.domainName || item.domain}</span>
                                        <h3 style={styles.showcaseTitle}>{item.title}</h3>
                                        <p style={styles.showcaseDesc}>
                                            <strong>Deployed Solution:</strong> {item.prototypeDetails || item.description}
                                        </p>
                                        <div style={styles.showcaseResults}>
                                            <strong>Measured Social Outcome:</strong> {item.pilotResults || "Verified field improvement in Panchayat / Ward."}
                                        </div>
                                        <div style={styles.showcaseFooter}>
                                            <span>🎓 <strong>{item.assignedHei}</strong></span>
                                            <span>📍 {[item.panchayat, item.district, item.state].filter(Boolean).join(", ")}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TAB 4: PARTICIPATING HEIS & CSR ECOSYSTEM */}
                {activeTab === "network" && (
                    <section style={styles.contentSection}>
                        <div style={styles.showcaseIntro}>
                            <h2 style={styles.secHeading}>National Higher Education & Industry Ecosystem</h2>
                            <p style={styles.secSub}>
                                Universities, Institutes of National Importance, and Corporate CSR wings actively collaborating under NEP 2020.
                            </p>
                        </div>

                        <div style={styles.networkGrid}>
                            <div style={styles.networkCol}>
                                <h3 style={styles.networkColTitle}>🏛️ Higher Education Institutions (HEIs)</h3>
                                {PARTICIPATING_HEIS.map(hei => (
                                    <div key={hei.id} style={styles.heiCard}>
                                        <div style={styles.heiCardTop}>
                                            <Building size={20} color="#7c3aed" />
                                            <div>
                                                <h4 style={styles.heiName}>{hei.name}</h4>
                                                <span style={styles.heiLoc}>📍 {hei.district}, {hei.state || "India"}</span>
                                            </div>
                                        </div>
                                        <div style={styles.heiLabsList}>
                                            <strong>Specialized Innovation Centers:</strong>
                                            <ul>
                                                {hei.specializedLabs.map((lab, i) => (
                                                    <li key={i}>{lab}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={styles.networkCol}>
                                <h3 style={styles.networkColTitle}>💼 Industry & Corporate CSR Partners</h3>
                                {INDUSTRY_CSR_PARTNERS.map(ind => (
                                    <div key={ind.id} style={styles.heiCard}>
                                        <div style={styles.heiCardTop}>
                                            <Briefcase size={20} color="#16a34a" />
                                            <div>
                                                <h4 style={styles.heiName}>{ind.name}</h4>
                                                <span style={styles.heiLoc}>{ind.category}</span>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#475569", marginTop: 8 }}>
                                            <strong>Focus Areas:</strong> {ind.focusAreas.join(", ")}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#166534", marginTop: 4, background: "#dcfce7", padding: "6px 8px", borderRadius: "6px" }}>
                                            <strong>Seed Grant Support:</strong> {ind.fundingContribution}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Challenge Detail & Pilot Verification Modal */}
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
            {/* Mobile Bottom Navigation Bar */}
            <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
}

const styles = {
    app: {
        minHeight: "100vh",
        backgroundColor: "#f8fafc"
    },
    main: {
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "24px 20px 80px 20px"
    },
    heroSection: {
        marginBottom: "28px"
    },
    heroContent: {
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: "24px",
        padding: "36px 36px",
        color: "#ffffff",
        boxShadow: "0 10px 30px rgba(15,23,42,0.15)",
        marginBottom: "20px"
    },
    heroBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(56, 189, 248, 0.15)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        color: "#38bdf8",
        fontSize: "12.5px",
        fontWeight: 700,
        padding: "5px 14px",
        borderRadius: "20px",
        marginBottom: "14px"
    },
    heroHeading: {
        fontSize: "30px",
        fontWeight: 800,
        lineHeight: 1.25,
        marginBottom: "12px"
    },
    headingGradient: {
        background: "linear-gradient(90deg, #38bdf8 0%, #4ade80 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
    },
    heroSub: {
        fontSize: "14.5px",
        color: "#94a3b8",
        maxWidth: "880px",
        lineHeight: 1.6,
        marginBottom: "24px"
    },
    heroButtons: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        flexWrap: "wrap"
    },
    primaryCta: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        color: "#ffffff",
        padding: "12px 22px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 700,
        boxShadow: "0 4px 16px rgba(2, 132, 199, 0.4)"
    },
    secondaryCta: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(255, 255, 255, 0.1)",
        color: "#ffffff",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        padding: "12px 20px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 600
    },
    kpiGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px"
    },
    kpiCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "18px 20px",
        boxShadow: "0 2px 10px rgba(15,23,42,0.03)"
    },
    kpiHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px"
    },
    kpiTitle: {
        fontSize: "12.5px",
        fontWeight: 600,
        color: "#64748b"
    },
    kpiIcon: {
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    kpiValue: {
        fontSize: "26px",
        fontWeight: 800,
        color: "#0f172a",
        lineHeight: 1.1,
        marginBottom: "4px"
    },
    kpiSub: {
        fontSize: "11px",
        color: "#94a3b8"
    },
    tabsBar: {
        display: "flex",
        gap: "10px",
        borderBottom: "2px solid #e2e8f0",
        paddingBottom: "10px",
        marginBottom: "24px",
        overflowX: "auto"
    },
    tabBtn: {
        padding: "10px 18px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: 600,
        color: "#64748b",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        whiteSpace: "nowrap"
    },
    activeTabBtn: {
        background: "#0284c7",
        color: "#ffffff",
        borderColor: "#0284c7",
        boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
    },
    contentSection: {
        minHeight: "400px"
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        marginBottom: "20px",
        flexWrap: "wrap"
    },
    searchBox: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "10px",
        padding: "10px 14px",
        flex: 1,
        minWidth: "280px"
    },
    searchInput: {
        border: "none",
        outline: "none",
        fontSize: "13.5px",
        width: "100%",
        color: "#0f172a"
    },
    filtersGroup: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap"
    },
    filterSelect: {
        padding: "10px 14px",
        borderRadius: "10px",
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        fontSize: "13px",
        color: "#0f172a",
        outline: "none"
    },
    refreshBtn: {
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        color: "#475569"
    },
    challengesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "20px"
    },
    challengeCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "22px",
        boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
    },
    cardTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px"
    },
    domainBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: "20px"
    },
    urgencyBadge: {
        fontSize: "11px",
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
    cardTitle: {
        fontSize: "16px",
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: "8px",
        lineHeight: 1.35
    },
    cardDesc: {
        fontSize: "13px",
        color: "#475569",
        lineHeight: 1.5,
        marginBottom: "14px"
    },
    cardMetaRow: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        fontSize: "12px",
        color: "#64748b",
        marginBottom: "16px"
    },
    cardMetaItem: {
        display: "flex",
        alignItems: "center",
        gap: "4px"
    },
    stageVisualizer: {
        background: "#f8fafc",
        border: "1px solid #f1f5f9",
        borderRadius: "10px",
        padding: "10px 12px",
        marginBottom: "14px"
    },
    stageVisualHeader: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "11.5px",
        marginBottom: "6px"
    },
    stageLabel: {
        color: "#334155"
    },
    stageStepCount: {
        color: "#0284c7",
        fontWeight: 700
    },
    progressBarBg: {
        width: "100%",
        height: "6px",
        background: "#e2e8f0",
        borderRadius: "4px",
        overflow: "hidden"
    },
    progressBarFill: {
        height: "100%",
        borderRadius: "4px",
        transition: "width 0.4s ease"
    },
    collaborationPills: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
        marginBottom: "14px"
    },
    heiPill: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        background: "#f5f3ff",
        color: "#7c3aed",
        fontSize: "11.5px",
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: "6px"
    },
    csrPill: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        background: "#f0fdf4",
        color: "#16a34a",
        fontSize: "11.5px",
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: "6px"
    },
    cardFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: "12px",
        borderTop: "1px solid #f1f5f9"
    },
    pilotVerifyNotice: {
        fontSize: "11px",
        color: "#ea580c",
        fontWeight: 700
    },
    viewBtn: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "12.5px",
        fontWeight: 700,
        color: "#0284c7",
        marginLeft: "auto"
    },
    emptyState: {
        gridColumn: "span 2",
        textAlign: "center",
        padding: "60px 20px",
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px dashed #cbd5e1"
    },
    showcaseIntro: {
        marginBottom: "24px"
    },
    secHeading: {
        fontSize: "22px",
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: "6px"
    },
    secSub: {
        fontSize: "14px",
        color: "#64748b"
    },
    showcaseGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "24px"
    },
    showcaseCard: {
        background: "#ffffff",
        borderRadius: "18px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(15,23,42,0.05)"
    },
    showcaseImg: {
        width: "100%",
        height: "200px",
        objectFit: "cover"
    },
    showcaseBody: {
        padding: "20px"
    },
    showcaseTag: {
        fontSize: "11px",
        fontWeight: 700,
        color: "#16a34a",
        background: "#dcfce7",
        padding: "3px 8px",
        borderRadius: "4px",
        display: "inline-block",
        marginBottom: "8px"
    },
    showcaseTitle: {
        fontSize: "16px",
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: "8px"
    },
    showcaseDesc: {
        fontSize: "13px",
        color: "#334155",
        marginBottom: "10px"
    },
    showcaseResults: {
        fontSize: "12.5px",
        color: "#065f46",
        background: "#ecfdf5",
        padding: "10px",
        borderRadius: "8px",
        marginBottom: "14px"
    },
    showcaseFooter: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "12px",
        color: "#64748b",
        paddingTop: "10px",
        borderTop: "1px solid #f1f5f9"
    },
    networkGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px"
    },
    networkCol: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },
    networkColTitle: {
        fontSize: "17px",
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: "4px"
    },
    heiCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "16px",
        boxShadow: "0 2px 8px rgba(15,23,42,0.03)"
    },
    heiCardTop: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "8px"
    },
    heiName: {
        fontSize: "14px",
        fontWeight: 800,
        color: "#0f172a"
    },
    heiLoc: {
        fontSize: "11.5px",
        color: "#64748b"
    },
    heiLabsList: {
        fontSize: "12px",
        color: "#475569",
        paddingLeft: "16px",
        marginTop: "4px"
    }
};
