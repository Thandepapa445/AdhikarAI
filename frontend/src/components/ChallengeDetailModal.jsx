import React, { useState } from "react";
import { X, CheckCircle, Clock, MapPin, Building, Users, Briefcase, Award, ThumbsUp, AlertTriangle, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { STAGES_OF_INNOVATION, THEMATIC_DOMAINS } from "../data/jharkhandData";
import { challengeService } from "../services/api";

export default function ChallengeDetailModal({ challenge, onClose, onUpdate }) {
    const [verifying, setVerifying] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    if (!challenge) return null;

    const domainInfo = THEMATIC_DOMAINS.find(d => d.id === challenge.domain) || {
        name: challenge.domainName || challenge.domain,
        icon: "💡",
        color: "#0284c7"
    };

    const currentStageIndex = STAGES_OF_INNOVATION.findIndex(s => s.key === challenge.status);
    const activeStage = currentStageIndex >= 0 ? currentStageIndex : 0;

    const handleVerifyPilot = async () => {
        setVerifying(true);
        const updatedList = await challengeService.verifyPilot(challenge.id, feedbackText);
        setVerifying(false);
        setSuccessMsg("Pilot deployment successfully verified by Citizen / Gram Panchayat! Marked as DEPLOYED & RESOLVED.");
        if (onUpdate) onUpdate(updatedList);
    };

    return (
        <div style={styles.backdrop} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <div style={styles.domainPill}>
                            <span>{domainInfo.icon}</span>
                            <span style={{ fontWeight: 700 }}>{domainInfo.name}</span>
                            <span style={styles.challengeId}>• {challenge.id}</span>
                        </div>
                        <h2 style={styles.title}>{challenge.title}</h2>
                        <div style={styles.metaRow}>
                            <span style={styles.metaItem}>
                                <MapPin size={15} color="#0284c7" />
                                <strong>{challenge.panchayat || "Gram Panchayat"}, {challenge.block}, {challenge.district}</strong>
                            </span>
                            <span style={styles.metaItem}>
                                <Users size={15} color="#16a34a" />
                                <span>Impacts <strong>{challenge.affectedPopulation ? challenge.affectedPopulation.toLocaleString() : "500+"} Villagers</strong></span>
                            </span>
                            <span style={{
                                ...styles.urgencyBadge,
                                ...(challenge.urgency === "CRITICAL" ? styles.urgencyCritical :
                                    challenge.urgency === "HIGH" ? styles.urgencyHigh : styles.urgencyMedium)
                            }}>
                                <AlertTriangle size={13} />
                                {challenge.urgency} URGENCY
                            </span>
                        </div>
                    </div>

                    <button onClick={onClose} style={styles.closeBtn}>
                        <X size={20} color="#64748b" />
                    </button>
                </div>

                {/* Body Content */}
                <div style={styles.body}>
                    {/* 8-Stage Lifecycle Progress Visualizer */}
                    <div style={styles.lifecycleCard}>
                        <div style={styles.lifecycleHeader}>
                            <h3 style={styles.subHeading}>
                                <Award size={18} color="#0284c7" />
                                NEP 2020 Solution Progression Pipeline (8 Stages)
                            </h3>
                            <span style={styles.stageStatusBadge}>
                                Stage {activeStage + 1} of 8: <strong>{STAGES_OF_INNOVATION[activeStage]?.label}</strong>
                            </span>
                        </div>

                        <div style={styles.stepperContainer}>
                            {STAGES_OF_INNOVATION.map((stage, idx) => {
                                const isPassed = idx < activeStage;
                                const isCurrent = idx === activeStage;

                                return (
                                    <div key={stage.key} style={styles.stepItem}>
                                        <div style={{
                                            ...styles.stepCircle,
                                            ...(isPassed ? styles.stepPassed : isCurrent ? styles.stepCurrent : styles.stepUpcoming)
                                        }}>
                                            {isPassed ? <CheckCircle size={16} /> : (idx + 1)}
                                        </div>
                                        <div style={styles.stepInfo}>
                                            <div style={{
                                                ...styles.stepLabel,
                                                fontWeight: isCurrent ? 800 : isPassed ? 600 : 500,
                                                color: isCurrent ? "#0284c7" : isPassed ? "#0f172a" : "#94a3b8"
                                            }}>
                                                {stage.label}
                                            </div>
                                            <div style={styles.stepDesc}>
                                                {stage.desc}
                                            </div>
                                        </div>
                                        {idx < STAGES_OF_INNOVATION.length - 1 && (
                                            <div style={{
                                                ...styles.stepLine,
                                                backgroundColor: idx < activeStage ? "#0284c7" : "#e2e8f0"
                                            }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Collaborative Multi-Stakeholder Roster */}
                    <div style={styles.twoColumnGrid}>
                        {/* Left: Problem & Evidence */}
                        <div style={styles.column}>
                            <div style={styles.card}>
                                <h4 style={styles.cardTitle}>
                                    <FileText size={16} color="#475569" />
                                    Community Problem Statement
                                </h4>
                                <p style={styles.descriptionText}>{challenge.description}</p>

                                <div style={styles.locationDetails}>
                                    <strong>Exact Geolocation:</strong> {challenge.locationText || `${challenge.block}, ${challenge.district}`}
                                    {challenge.lat && challenge.lng && (
                                        <div style={styles.coordPill}>
                                            GPS: {Number(challenge.lat).toFixed(4)}° N, {Number(challenge.lng).toFixed(4)}° E
                                        </div>
                                    )}
                                </div>

                                {challenge.evidenceImageUrl && (
                                    <div style={styles.evidenceBlock}>
                                        <span style={styles.evidenceLabel}>Field Photograph & Evidence:</span>
                                        <img
                                            src={challenge.evidenceImageUrl}
                                            alt="Evidence"
                                            style={styles.evidenceImage}
                                        />
                                    </div>
                                )}

                                <div style={styles.submitterFooter}>
                                    <span>Submitted by: <strong>{challenge.submitterName || "Local Community"}</strong></span>
                                    <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Assigned University & Industry Partner */}
                        <div style={styles.column}>
                            {/* University (HEI) Assignment */}
                            <div style={styles.card}>
                                <div style={styles.heiHeader}>
                                    <div style={styles.heiIconBadge}>
                                        <Building size={20} color="#7c3aed" />
                                    </div>
                                    <div>
                                        <div style={styles.heiSub}>Assigned Higher Education Institution (HEI)</div>
                                        <h4 style={styles.heiName}>{challenge.assignedHei || "Allocation in Progress by Nodal Officer"}</h4>
                                    </div>
                                </div>

                                {challenge.assignedHeiDepartment && (
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailKey}>Department / Lab:</span>
                                        <span style={styles.detailVal}>{challenge.assignedHeiDepartment}</span>
                                    </div>
                                )}
                                {challenge.facultyMentor && (
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailKey}>Faculty Mentor:</span>
                                        <span style={styles.detailVal}><strong>{challenge.facultyMentor}</strong></span>
                                    </div>
                                )}
                                {challenge.studentTeam && (
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailKey}>Student Innovation Team:</span>
                                        <span style={styles.detailVal}>{challenge.studentTeam}</span>
                                    </div>
                                )}
                            </div>

                            {/* Industry / CSR Sponsor */}
                            <div style={styles.card}>
                                <div style={styles.heiHeader}>
                                    <div style={{ ...styles.heiIconBadge, background: "#dcfce7" }}>
                                        <Briefcase size={20} color="#16a34a" />
                                    </div>
                                    <div>
                                        <div style={styles.heiSub}>Industry & CSR Ecosystem Partner</div>
                                        <h4 style={styles.heiName}>{challenge.industryPartner || "CSR Co-sponsorship Under Review"}</h4>
                                    </div>
                                </div>
                                {challenge.prototypeDetails && (
                                    <div style={{ marginTop: "10px", fontSize: "13px", color: "#334155", background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                                        <strong>Prototype Technology:</strong> {challenge.prototypeDetails}
                                    </div>
                                )}
                                {challenge.pilotResults && (
                                    <div style={{ marginTop: "8px", fontSize: "13px", color: "#065f46", background: "#ecfdf5", padding: "10px", borderRadius: "8px", borderLeft: "4px solid #10b981" }}>
                                        <strong>Field Pilot Outcomes:</strong> {challenge.pilotResults}
                                    </div>
                                )}
                            </div>

                            {/* Citizen Verification Action Box (When in PILOT stage) */}
                            {challenge.status === "PILOT" && (
                                <div style={styles.verificationBox}>
                                    <div style={styles.verificationHeader}>
                                        <CheckCircle2 size={20} color="#ea580c" />
                                        <div>
                                            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#9a3412" }}>
                                                Citizen & Panchayat Field Pilot Verification
                                            </h4>
                                            <p style={{ fontSize: "12px", color: "#7c2d12" }}>
                                                The university team has deployed the solution in your village. Please confirm operational performance.
                                            </p>
                                        </div>
                                    </div>

                                    {successMsg ? (
                                        <div style={styles.successBox}>
                                            <CheckCircle size={16} color="#16a34a" />
                                            <span>{successMsg}</span>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: "10px" }}>
                                            <textarea
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                placeholder="Enter feedback (e.g. Water flow is normal, filtration working as expected)..."
                                                style={styles.textarea}
                                                rows={2}
                                            />
                                            <button
                                                onClick={handleVerifyPilot}
                                                disabled={verifying}
                                                style={styles.verifyBtn}
                                            >
                                                {verifying ? "Verifying Deployment..." : "✓ Confirm & Sign-off Field Pilot"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {challenge.status === "RESOLVED" && (
                                <div style={styles.resolvedBanner}>
                                    <CheckCircle2 size={22} color="#16a34a" />
                                    <div>
                                        <strong>Full Community Deployment Verified!</strong>
                                        <div style={{ fontSize: "12px", color: "#166534" }}>
                                            This technology has been successfully adopted in the Panchayat with proven social impact.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.secondaryBtn}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
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
    modal: {
        background: "#ffffff",
        width: "100%",
        maxWidth: "980px",
        maxHeight: "92vh",
        borderRadius: "20px",
        boxShadow: "0 25px 60px rgba(15,23,42,0.3)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
    },
    header: {
        padding: "22px 28px",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        background: "#f8fafc"
    },
    domainPill: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12.5px",
        color: "#0284c7",
        background: "#e0f2fe",
        padding: "4px 10px",
        borderRadius: "20px",
        marginBottom: "8px"
    },
    challengeId: {
        color: "#64748b",
        fontWeight: 500
    },
    title: {
        fontSize: "20px",
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: "8px",
        lineHeight: 1.3
    },
    metaRow: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        fontSize: "13px",
        color: "#475569"
    },
    metaItem: {
        display: "flex",
        alignItems: "center",
        gap: "5px"
    },
    urgencyBadge: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 800
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
    closeBtn: {
        padding: "8px",
        borderRadius: "10px",
        background: "#ffffff",
        border: "1px solid #e2e8f0"
    },
    body: {
        padding: "24px 28px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
    },
    lifecycleCard: {
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "18px 20px"
    },
    lifecycleHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
    },
    subHeading: {
        fontSize: "15px",
        fontWeight: 700,
        color: "#0f172a",
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    stageStatusBadge: {
        fontSize: "12px",
        color: "#0284c7",
        background: "#e0f2fe",
        padding: "4px 10px",
        borderRadius: "12px"
    },
    stepperContainer: {
        display: "flex",
        justifyContent: "space-between",
        position: "relative",
        gap: "6px",
        overflowX: "auto",
        paddingBottom: "8px"
    },
    stepItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        minWidth: "95px",
        position: "relative"
    },
    stepCircle: {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: 700,
        marginBottom: "6px",
        zIndex: 2
    },
    stepPassed: {
        background: "#0284c7",
        color: "#ffffff"
    },
    stepCurrent: {
        background: "#0284c7",
        color: "#ffffff",
        boxShadow: "0 0 0 4px #bae6fd"
    },
    stepUpcoming: {
        background: "#e2e8f0",
        color: "#94a3b8"
    },
    stepInfo: {
        textAlign: "center"
    },
    stepLabel: {
        fontSize: "11px",
        lineHeight: 1.2
    },
    stepDesc: {
        fontSize: "9.5px",
        color: "#64748b",
        marginTop: "2px",
        display: "none"
    },
    stepLine: {
        position: "absolute",
        top: "14px",
        left: "50%",
        width: "100%",
        height: "2px",
        zIndex: 1
    },
    twoColumnGrid: {
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        gap: "20px"
    },
    column: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },
    card: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "16px"
    },
    cardTitle: {
        fontSize: "14px",
        fontWeight: 700,
        color: "#0f172a",
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    descriptionText: {
        fontSize: "13.5px",
        color: "#334155",
        lineHeight: 1.6
    },
    locationDetails: {
        marginTop: "12px",
        fontSize: "12.5px",
        color: "#64748b"
    },
    coordPill: {
        display: "inline-block",
        background: "#f1f5f9",
        padding: "2px 8px",
        borderRadius: "6px",
        fontSize: "11.5px",
        marginTop: "4px",
        color: "#475569"
    },
    evidenceBlock: {
        marginTop: "12px"
    },
    evidenceLabel: {
        fontSize: "12px",
        fontWeight: 600,
        color: "#64748b",
        display: "block",
        marginBottom: "6px"
    },
    evidenceImage: {
        width: "100%",
        height: "170px",
        objectFit: "cover",
        borderRadius: "10px",
        border: "1px solid #e2e8f0"
    },
    submitterFooter: {
        marginTop: "12px",
        paddingTop: "10px",
        borderTop: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        fontSize: "11.5px",
        color: "#94a3b8"
    },
    heiHeader: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "10px"
    },
    heiIconBadge: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: "#ede9fe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    heiSub: {
        fontSize: "11px",
        color: "#64748b",
        fontWeight: 600
    },
    heiName: {
        fontSize: "14px",
        fontWeight: 800,
        color: "#0f172a"
    },
    detailRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "12.5px",
        padding: "5px 0",
        borderBottom: "1px solid #f8fafc"
    },
    detailKey: {
        color: "#64748b"
    },
    detailVal: {
        color: "#0f172a"
    },
    verificationBox: {
        background: "#fff7ed",
        border: "1px solid #fdba74",
        borderRadius: "14px",
        padding: "14px"
    },
    verificationHeader: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px"
    },
    textarea: {
        width: "100%",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        padding: "8px",
        fontSize: "12.5px",
        marginBottom: "8px"
    },
    verifyBtn: {
        width: "100%",
        background: "#ea580c",
        color: "#ffffff",
        padding: "8px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: 700
    },
    successBox: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#15803d",
        fontSize: "12.5px",
        fontWeight: 600,
        marginTop: "8px"
    },
    resolvedBanner: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "#f0fdf4",
        border: "1px solid #86efac",
        borderRadius: "14px",
        padding: "14px"
    },
    footer: {
        padding: "14px 28px",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "flex-end",
        background: "#f8fafc"
    },
    secondaryBtn: {
        padding: "8px 18px",
        borderRadius: "8px",
        background: "#e2e8f0",
        color: "#334155",
        fontWeight: 600,
        fontSize: "13.5px"
    }
};
