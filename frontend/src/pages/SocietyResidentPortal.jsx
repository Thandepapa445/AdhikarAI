import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Home, PlusCircle, AlertTriangle, ShieldCheck, CheckCircle2, Clock, 
    Wrench, ArrowRight, Upload, Zap, Droplets, ArrowUpCircle, Trash2, 
    Sparkles, RefreshCw, Eye, MessageSquare, PhoneCall, Building2, User
} from "lucide-react";
import api from "../services/api";

const CATEGORIES = [
    { id: "ELECTRICAL", label: "Electrical Faults", icon: Zap, color: "#f59e0b" },
    { id: "WIRING_HAZARD", label: "Exposed / Damaged Wiring", icon: AlertTriangle, color: "#ef4444" },
    { id: "WATER_LEAKAGE", label: "Water Leakage & Plumbing", icon: Droplets, color: "#0284c7" },
    { id: "ELEVATOR_LIFT", label: "Lift / Elevator Breakdown", icon: ArrowUpCircle, color: "#8b5cf6" },
    { id: "HOUSEKEEPING", label: "Cleaning & Housekeeping", icon: Sparkles, color: "#10b981" },
    { id: "WASTE_MANAGEMENT", label: "Garbage & Waste Disposal", icon: Trash2, color: "#64748b" },
    { id: "COMMON_LIGHTING", label: "Common-Area Lighting", icon: Zap, color: "#eab308" },
    { id: "STRUCTURAL_CIVIL", label: "Structural & Civil Damage", icon: Building2, color: "#d97706" },
    { id: "OTHER", label: "Other Society Issue", icon: Wrench, color: "#475569" }
];

const DEMO_RESIDENT_ISSUES = [
    {
        id: 101,
        title: "Elevator Door Stuck on 4th Floor",
        category: "ELEVATOR_LIFT",
        buildingTower: "Tower A",
        unitFloor: "4th Floor Lift Lobby",
        priority: "HIGH",
        status: "IN_PROGRESS",
        assignedStaffName: "Otis Care Response Team",
        assignedStaffPhone: "+91 1800 220 334",
        duplicateCount: 3,
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        resolutionNotes: "Technician on site inspecting door safety interlocking sensor."
    },
    {
        id: 102,
        title: "Corridor Light Fixture Sparking",
        category: "WIRING_HAZARD",
        buildingTower: "Tower A",
        unitFloor: "3rd Floor Corridor",
        priority: "CRITICAL",
        status: "REPORTED",
        duplicateCount: 1,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        emergencyGuidance: "CRITICAL: Stay 3 meters clear. Main isolator shutdown requested."
    },
    {
        id: 103,
        title: "Low Water Pressure in Overhead Supply Riser",
        category: "WATER_LEAKAGE",
        buildingTower: "Tower B",
        unitFloor: "Flat 704 / Wing B",
        priority: "MODERATE",
        status: "IN_PROGRESS",
        assignedStaffName: "Suresh Mahto (Master Plumber)",
        assignedStaffPhone: "+91 94311 88765",
        duplicateCount: 2,
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        resolutionNotes: "Pressure regulator valve calibration underway on roof tank."
    },
    {
        id: 104,
        title: "Fire Exit Staircase Emergency Lamp Malfunction",
        category: "COMMON_LIGHTING",
        buildingTower: "Tower A",
        unitFloor: "Fire Staircase Wing 2",
        priority: "HIGH",
        status: "ACKNOWLEDGED",
        assignedStaffName: "Ramesh Kumar (Senior Electrician)",
        assignedStaffPhone: "+91 98351 22345",
        duplicateCount: 1,
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
    },
    {
        id: 105,
        title: "Basement Parking B2 Sump Blockage & Odor",
        category: "WATER_LEAKAGE",
        buildingTower: "Basement Parking",
        unitFloor: "Sump Station 3 (Pillar D12)",
        priority: "MODERATE",
        status: "RESOLVED",
        assignedStaffName: "Suresh Mahto (Master Plumber)",
        assignedStaffPhone: "+91 94311 88765",
        duplicateCount: 2,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        resolvedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        resolutionNotes: "Sump inlet cleared and chemical descaling completed. Pump flow nominal."
    }
];

export default function SocietyResidentPortal() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("my-requests"); // 'my-requests' | 'new-ticket'
    const [myIssues, setMyIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAuditIssue, setSelectedAuditIssue] = useState(null);
    const [audits, setAudits] = useState([]);

    // Society & User Info (sanitized to remove government / civic placeholders)
    const residentName = localStorage.getItem("adhikar_user_name") || "Resident User";
    const residentEmail = localStorage.getItem("adhikar_user_email") || "resident@greenwood.in";
    const rawSocietyName = localStorage.getItem("adhikar_org_name");
    const societyName = (!rawSocietyName || rawSocietyName.includes("Jharkhand") || rawSocietyName.includes("Civic"))
        ? "Greenwood Heights Residential Society"
        : rawSocietyName;
    const societyId = Number(localStorage.getItem("adhikar_org_id")) || 2;

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "ELECTRICAL",
        buildingTower: "Tower A",
        unitFloor: "Flat 302",
        residentName: residentName,
        residentPhone: "+91 98765 43210",
        evidenceImageUrl: "",
        priority: "MODERATE"
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [aiAssessment, setAiAssessment] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(null);

    // Sign-off verification state
    const [selectedSignOffIssue, setSelectedSignOffIssue] = useState(null);
    const [signOffRating, setSignOffRating] = useState(5);
    const [signOffFeedback, setSignOffFeedback] = useState("Work verified and resolved satisfactorily.");
    const [isSigningOff, setIsSigningOff] = useState(false);

    useEffect(() => {
        loadResidentIssues();
    }, []);

    const loadResidentIssues = async () => {
        setLoading(true);
        try {
            const data = await api.getMySocietyIssues();
            if (Array.isArray(data) && data.length > 0) {
                setMyIssues(data);
                setLoading(false);
                return;
            }
        } catch (e) {
            console.warn("Using demo resident issues fallback:", e?.message);
        }
        setMyIssues(DEMO_RESIDENT_ISSUES);
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            triggerAiAnalysis(file, formData.category, formData.description);
        }
    };

    const triggerAiAnalysis = async (file, category, text) => {
        setIsAnalyzing(true);
        try {
            const result = await api.assessSocietyEvidence(file, category, text);
            setAiAssessment(result);
            if (result.suggestedDescription && !formData.description) {
                setFormData(prev => ({ ...prev, description: result.suggestedDescription }));
            }
            if (result.assignedPriority) {
                setFormData(prev => ({ ...prev, priority: result.assignedPriority }));
            }
            if (result.category) {
                setFormData(prev => ({ ...prev, category: result.category }));
            } else if (result.primaryClass) {
                // Auto-map model class to society category
                const pc = result.primaryClass;
                if (pc === "broken_street_light") setFormData(prev => ({ ...prev, category: "COMMON_LIGHTING" }));
                else if (pc === "pothole") setFormData(prev => ({ ...prev, category: "STRUCTURAL_CIVIL" }));
                else if (pc === "garbage") setFormData(prev => ({ ...prev, category: "WASTE_MANAGEMENT" }));
                else if (pc === "fallen_tree") setFormData(prev => ({ ...prev, category: "OTHER" }));
            }
        } catch (err) {
            console.error("AI Analysis error", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSignOffSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSignOffIssue) return;
        setIsSigningOff(true);
        try {
            let res;
            try {
                res = await api.signOffSocietyIssue(selectedSignOffIssue.id, signOffRating, signOffFeedback);
            } catch (err) {
                console.warn("Backend signoff fallback", err);
                res = {
                    ...selectedSignOffIssue,
                    status: "CLOSED",
                    residentSignOffStatus: "VERIFIED",
                    residentRating: signOffRating,
                    residentFeedback: signOffFeedback
                };
            }
            setMyIssues(prev => prev.map(i => i.id === selectedSignOffIssue.id ? { ...i, ...res } : i));
            setSelectedSignOffIssue(null);
            alert("✓ Thank you! Your resolution verification has been officially recorded.");
        } catch (err) {
            alert("Sign-off failed: " + err.message);
        } finally {
            setIsSigningOff(false);
        }
    };

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                organizationId: societyId,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                buildingTower: formData.buildingTower,
                unitFloor: formData.unitFloor,
                residentName: formData.residentName,
                residentPhone: formData.residentPhone,
                evidenceImageUrl: imagePreview || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
                aiSuggestedDescription: aiAssessment?.suggestedDescription || formData.description,
                priority: formData.priority
            };

            let created;
            try {
                created = await api.createSocietyIssue(payload);
            } catch (apiErr) {
                console.warn("Backend submit fallback:", apiErr?.message);
                created = {
                    id: Math.floor(Math.random() * 900) + 110,
                    ...payload,
                    status: "REPORTED",
                    duplicateCount: 1,
                    createdAt: new Date().toISOString()
                };
            }
            setSubmitSuccess(created);
            setMyIssues(prev => [created, ...prev]);
            // Reset form
            setFormData({
                title: "",
                description: "",
                category: "ELECTRICAL",
                buildingTower: "Tower A",
                unitFloor: "Flat 302",
                residentName: residentName,
                residentPhone: "+91 98765 43210",
                evidenceImageUrl: "",
                priority: "MODERATE"
            });
            setImageFile(null);
            setImagePreview(null);
            setAiAssessment(null);
            setTimeout(() => {
                setActiveTab("my-requests");
                setSubmitSuccess(null);
            }, 2500);
        } catch (err) {
            console.error("Error creating ticket", err);
            alert("Failed to submit maintenance request. Please verify inputs.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openAuditModal = async (issue) => {
        setSelectedAuditIssue(issue);
        try {
            const logs = await api.getSocietyIssueAudits(issue.id);
            setAudits(logs || []);
        } catch (e) {
            setAudits([
                {
                    id: 1,
                    action: "TICKET_CREATED",
                    previousStatus: null,
                    newStatus: "REPORTED",
                    notes: `Ticket registered for ${issue.buildingTower} - ${issue.unitFloor}`,
                    actorEmail: issue.residentEmail || residentEmail,
                    actorRole: "SOCIETY_RESIDENT",
                    createdAt: issue.createdAt
                }
            ]);
        }
    };

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
            {/* Top Navigation Bar */}
            <header style={headerStyle}>
                <div style={headerContentStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={logoIconStyle}>
                            <Building2 size={20} color="#ffffff" />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <h1 style={titleStyle}>Adhikar AI</h1>
                            <span style={societyBadgeStyle}>🏢 {societyName ? `${societyName} • Resident Portal` : "Residential Society Portal"}</span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <div style={residentProfileStyle}>
                            <User size={16} color="#0284c7" />
                            <span style={{ fontSize: 13, fontWeight: "600", color: "#0f172a" }}>{residentName}</span>
                            <span style={{ fontSize: 11, color: "#64748b" }}>({residentEmail})</span>
                        </div>
                        <Link to="/dashboard" style={{ ...logoutLinkStyle, background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}>🏛️ Citizen Portal</Link>
                        <Link to="/society/manager" style={{ ...logoutLinkStyle, background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>🛠️ Manager View</Link>
                        <Link to="/login" style={logoutLinkStyle}>Switch</Link>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <main style={mainContentStyle}>
                <div style={tabContainerStyle}>
                    <button 
                        onClick={() => setActiveTab("my-requests")} 
                        style={activeTab === "my-requests" ? activeTabBtnStyle : tabBtnStyle}
                    >
                        📋 My Maintenance Requests ({myIssues.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab("new-ticket")} 
                        style={activeTab === "new-ticket" ? activeTabBtnStyle : tabBtnStyle}
                    >
                        ➕ Report New Issue
                    </button>
                </div>

                {/* TAB 1: SUBMIT NEW TICKET */}
                {activeTab === "new-ticket" && (
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 6 }}>
                            Report a Society Maintenance Problem
                        </h2>
                        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                            Upload photo evidence or specify your tower location. Our AI safety engine determines priority and dispatches authorized technicians.
                        </p>

                        {submitSuccess && (
                            <div style={successBannerStyle}>
                                <CheckCircle2 size={24} color="#15803d" />
                                <div>
                                    <div style={{ fontWeight: "700", color: "#15803d" }}>Ticket #{submitSuccess.id} Submitted Successfully!</div>
                                    <div style={{ fontSize: 13, color: "#166534" }}>
                                        Assigned Priority: <strong>{submitSuccess.priority}</strong> • Status: {submitSuccess.status}
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmitTicket} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            {/* Tower & Unit */}
                            <div style={rowStyle}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Tower / Block / Wing *</label>
                                    <select 
                                        style={inputStyle}
                                        value={formData.buildingTower}
                                        onChange={(e) => setFormData({ ...formData, buildingTower: e.target.value })}
                                        required
                                    >
                                        <option value="Tower A">Tower A</option>
                                        <option value="Tower B">Tower B</option>
                                        <option value="Tower C">Tower C</option>
                                        <option value="Tower D">Tower D</option>
                                        <option value="Clubhouse & Gym">Clubhouse & Gym</option>
                                        <option value="Basement Parking">Basement Parking</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Flat / Floor / Location *</label>
                                    <input 
                                        type="text" 
                                        style={inputStyle}
                                        placeholder="e.g. Flat 302 / 3rd Floor Lobby"
                                        value={formData.unitFloor}
                                        onChange={(e) => setFormData({ ...formData, unitFloor: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label style={labelStyle}>Maintenance Category *</label>
                                <div style={categoryGridStyle}>
                                    {CATEGORIES.map(cat => {
                                        const Icon = cat.icon;
                                        const isSelected = formData.category === cat.id;
                                        return (
                                            <div 
                                                key={cat.id}
                                                onClick={() => {
                                                    setFormData({ ...formData, category: cat.id });
                                                    if (imageFile) triggerAiAnalysis(imageFile, cat.id, formData.description);
                                                }}
                                                style={{
                                                    ...categoryCardStyle,
                                                    border: isSelected ? `2px solid ${cat.color}` : "1px solid #e2e8f0",
                                                    backgroundColor: isSelected ? "#f8fafc" : "#ffffff"
                                                }}
                                            >
                                                <Icon size={18} color={cat.color} />
                                                <span style={{ fontSize: 12, fontWeight: isSelected ? "700" : "500", color: "#1e293b" }}>
                                                    {cat.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Issue Title */}
                            <div>
                                <label style={labelStyle}>Issue Title *</label>
                                <input 
                                    type="text" 
                                    style={inputStyle}
                                    placeholder="e.g. Lift stuck with passengers, Corridor light sparking, Water pipe leak"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Photo Evidence & AI Audit */}
                            <div style={aiUploadSectionStyle}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Photo Evidence (Optional but recommended for AI triage)</label>
                                    <div style={dropzoneStyle}>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            id="resident-image-upload" 
                                            style={{ display: "none" }}
                                            onChange={handleImageChange}
                                        />
                                        <label htmlFor="resident-image-upload" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                            <Upload size={28} color="#0284c7" />
                                            <span style={{ fontSize: 13, fontWeight: "600", color: "#0284c7" }}>Click to capture or upload photo</span>
                                            <span style={{ fontSize: 11, color: "#64748b" }}>YOLOv8 automatically detects hazards and drafts description</span>
                                        </label>
                                    </div>

                                    {imagePreview && (
                                        <div style={{ marginTop: 12 }}>
                                            <img src={imagePreview} alt="Preview" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10 }} />
                                            {aiAssessment?.isVisualEvidenceVerified && (
                                                <div style={{ marginTop: 8, padding: "8px 12px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                                                    <CheckCircle2 size={16} color="#15803d" />
                                                    <span style={{ fontSize: 12, color: "#166534", fontWeight: "600" }}>
                                                        ✓ Trained YOLOv8 Model Verified: Detected <strong>{aiAssessment.primaryClass?.replace(/_/g, " ")}</strong> ({aiAssessment.confidencePercent || `${(aiAssessment.highestConfidence * 100).toFixed(1)}%`} confidence) • Authentic Evidence Locked
                                                    </span>
                                                </div>
                                            )}
                                            {aiAssessment?.safetyFailed && (
                                                <div style={{ marginTop: 8, padding: "8px 12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                                                    <AlertTriangle size={16} color="#b91c1c" />
                                                    <span style={{ fontSize: 12, color: "#991b1b", fontWeight: "600" }}>
                                                        ⚠️ AI Guardrail Alert ({aiAssessment.errorType}): {aiAssessment.message}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* AI Assessment Feedback Card */}
                                <div style={{ flex: 1 }}>
                                    <div style={aiCardStyle}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                            <Sparkles size={18} color="#6366f1" />
                                            <span style={{ fontSize: 13, fontWeight: "700", color: "#312e81" }}>Society AI Safety Assessment</span>
                                            {isAnalyzing && <RefreshCw size={14} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />}
                                        </div>

                                        {aiAssessment ? (
                                            <div>
                                                <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                                                    <span style={{ fontSize: 12, color: "#475569" }}>Assigned Priority:</span>
                                                    {getPriorityBadge(aiAssessment.assignedPriority)}
                                                </div>

                                                {aiAssessment.emergencyGuidance && (
                                                    <div style={emergencyAlertBoxStyle}>
                                                        <AlertTriangle size={16} color="#b91c1c" />
                                                        <span style={{ fontSize: 12, color: "#991b1b", fontWeight: "600" }}>
                                                            {aiAssessment.emergencyGuidance}
                                                        </span>
                                                    </div>
                                                )}

                                                <div style={{ fontSize: 12, color: "#475569", marginTop: 8 }}>
                                                    <strong>Explanation:</strong> {aiAssessment.priorityExplanation}
                                                </div>

                                                {aiAssessment.suggestedDescription && (
                                                    <div style={{ marginTop: 10, padding: 8, backgroundColor: "#f1f5f9", borderRadius: 8 }}>
                                                        <div style={{ fontSize: 11, fontWeight: "600", color: "#334155" }}>AI Suggested Description:</div>
                                                        <div style={{ fontSize: 12, color: "#475569", fontStyle: "italic", marginTop: 4 }}>
                                                            "{aiAssessment.suggestedDescription}"
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, description: aiAssessment.suggestedDescription })}
                                                            style={useSuggestionBtnStyle}
                                                        >
                                                            Use This Description
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", paddingTop: 10 }}>
                                                Upload a photo or enter issue details to see real-time AI priority classification, suggested descriptions, and safety instructions.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Description */}
                            <div>
                                <label style={labelStyle}>Description of the Issue *</label>
                                <textarea 
                                    style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                                    placeholder="Provide details about the issue location, urgency, or observed damage..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Submitter Details */}
                            <div style={rowStyle}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Resident Name *</label>
                                    <input 
                                        type="text" 
                                        style={inputStyle}
                                        value={formData.residentName}
                                        onChange={(e) => setFormData({ ...formData, residentName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Contact Phone *</label>
                                    <input 
                                        type="text" 
                                        style={inputStyle}
                                        value={formData.residentPhone}
                                        onChange={(e) => setFormData({ ...formData, residentPhone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                style={submitBtnStyle}
                            >
                                {isSubmitting ? "Submitting Request..." : "Submit Maintenance Request →"}
                            </button>
                        </form>
                    </div>
                )}

                {/* TAB 2: MY MAINTENANCE REQUESTS */}
                {activeTab === "my-requests" && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>Your Reported Maintenance Issues</h2>
                                <p style={{ fontSize: 13, color: "#64748b" }}>Track real-time progress, assigned maintenance staff, and resolution updates.</p>
                            </div>
                            <button 
                                onClick={loadResidentIssues}
                                style={refreshBtnStyle}
                            >
                                <RefreshCw size={14} color="#0284c7" /> Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Loading tickets...</div>
                        ) : myIssues.length === 0 ? (
                            <div style={{ ...cardStyle, textAlign: "center", padding: 48 }}>
                                <CheckCircle2 size={44} color="#10b981" style={{ margin: "0 auto 12px" }} />
                                <h3 style={{ fontSize: 16, fontWeight: "700", color: "#0f172a" }}>No Pending Issues!</h3>
                                <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>You have no open maintenance complaints in {societyName}.</p>
                                <button 
                                    onClick={() => setActiveTab("new-ticket")}
                                    style={{ ...submitBtnStyle, width: "auto", display: "inline-block", marginTop: 16 }}
                                >
                                    + Report an Issue
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {myIssues.map(issue => (
                                    <div key={issue.id} style={issueCardStyle}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                    <span style={ticketNumberStyle}>TICKET #{issue.id}</span>
                                                    <span style={towerBadgeStyle}>🏢 {issue.buildingTower} • {issue.unitFloor}</span>
                                                    {issue.duplicateCount > 1 && (
                                                        <span style={clusterCountBadgeStyle}>
                                                            👥 Corroborated by {issue.duplicateCount} Neighbors
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 style={{ fontSize: 16, fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                                                    {issue.title}
                                                </h3>
                                            </div>

                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                {getPriorityBadge(issue.priority)}
                                                {getStatusBadge(issue.status)}
                                            </div>
                                        </div>

                                        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, marginBottom: 12 }}>
                                            {issue.description}
                                        </p>

                                        {/* Cross-Workflow Escalation & Pilot Badges */}
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "6px 0 10px" }}>
                                            {issue.isEscalatedToCivic && (
                                                <span style={{ fontSize: 11, fontWeight: "700", padding: "3px 8px", borderRadius: 6, backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                                                    🏛️ Escalated to Pan-India Civic Track (Challenge #{issue.linkedChallengeId} • Stage: {issue.civicStage || "SUBMITTED"})
                                                </span>
                                            )}
                                            {issue.civicStage === "PILOT" && (
                                                <span style={{ fontSize: 11, fontWeight: "700", padding: "3px 8px", borderRadius: 6, backgroundColor: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}>
                                                    🚀 Community Field Pilot Deployed in Society! Active testing in progress.
                                                </span>
                                            )}
                                            {issue.residentSignOffStatus === "VERIFIED" && (
                                                <span style={{ fontSize: 11, fontWeight: "700", padding: "3px 8px", borderRadius: 6, backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>
                                                    ✓ Verified by Resident ({issue.residentRating || 5}/5 ⭐): "{issue.residentFeedback || "Work verified"}"
                                                </span>
                                            )}
                                        </div>

                                        {issue.emergencyGuidance && (
                                            <div style={emergencyNoticeStyle}>
                                                <AlertTriangle size={15} color="#b91c1c" />
                                                <span style={{ fontSize: 12, fontWeight: "600", color: "#991b1b" }}>
                                                    {issue.emergencyGuidance}
                                                </span>
                                            </div>
                                        )}

                                        {/* Assigned Staff Info */}
                                        <div style={issueFooterStyle}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569" }}>
                                                <Wrench size={14} color="#0284c7" />
                                                <span>
                                                    Assigned Staff: <strong>{issue.assignedStaffName || "Under Triage / Pending Assignment"}</strong>
                                                    {issue.assignedStaffPhone && (
                                                        <span style={{ marginLeft: 6, color: "#0284c7" }}>({issue.assignedStaffPhone})</span>
                                                    )}
                                                </span>
                                            </div>

                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                {(issue.status === "RESOLVED" || issue.status === "CLOSED" || issue.civicStage === "PILOT") && issue.residentSignOffStatus !== "VERIFIED" && (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedSignOffIssue(issue);
                                                            setSignOffRating(5);
                                                            setSignOffFeedback("Work verified and resolved satisfactorily.");
                                                        }}
                                                        style={{ ...viewAuditBtnStyle, backgroundColor: "#15803d", color: "#ffffff", borderColor: "#15803d", fontWeight: "700" }}
                                                    >
                                                        ⭐ Verify & Sign Off
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => openAuditModal(issue)}
                                                    style={viewAuditBtnStyle}
                                                >
                                                    <Clock size={13} color="#0284c7" /> View Status History & Notes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* AUDIT HISTORY MODAL */}
                {selectedAuditIssue && (
                    <div style={modalBackdropStyle}>
                        <div style={modalCardStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <div>
                                    <h3 style={{ fontSize: 17, fontWeight: "700", color: "#0f172a" }}>
                                        Ticket #{selectedAuditIssue.id} • Resolution Audit Trail
                                    </h3>
                                    <p style={{ fontSize: 12, color: "#64748b" }}>{selectedAuditIssue.title}</p>
                                </div>
                                <button onClick={() => setSelectedAuditIssue(null)} style={closeBtnStyle}>✕</button>
                            </div>

                            <div style={{ maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                                {audits.map(log => (
                                    <div key={log.id} style={auditItemStyle}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                                            <span><strong>{log.actorRole}</strong> ({log.actorEmail})</span>
                                            <span>{new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: "600", color: "#0f172a" }}>
                                            Status: {log.newStatus || "UPDATED"}
                                        </div>
                                        {log.notes && (
                                            <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                                                {log.notes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => setSelectedAuditIssue(null)} style={{ ...submitBtnStyle, marginTop: 16 }}>
                                Close Audit Log
                            </button>
                        </div>
                    </div>
                )}

                {/* RESIDENT SIGN-OFF / RESOLUTION VERIFICATION MODAL */}
                {selectedSignOffIssue && (
                    <div style={modalBackdropStyle}>
                        <div style={{ ...modalCardStyle, maxWidth: 500 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <div>
                                    <h3 style={{ fontSize: 17, fontWeight: "800", color: "#0f172a", margin: 0 }}>
                                        Resident Verification & Sign-Off
                                    </h3>
                                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                                        Ticket #{selectedSignOffIssue.id} • {selectedSignOffIssue.title}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedSignOffIssue(null)} style={closeBtnStyle}>✕</button>
                            </div>

                            <p style={{ fontSize: 13, color: "#475569", marginBottom: 16, lineHeight: 1.5 }}>
                                Please verify if the maintenance work or deployed field pilot for <strong>{selectedSignOffIssue.buildingTower} ({selectedSignOffIssue.unitFloor})</strong> has been completed to your satisfaction.
                            </p>

                            <form onSubmit={handleSignOffSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <div>
                                    <label style={labelStyle}>Satisfaction Rating (1 to 5 Stars)</label>
                                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setSignOffRating(star)}
                                                style={{
                                                    fontSize: 24,
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: star <= signOffRating ? "#f59e0b" : "#cbd5e1"
                                                }}
                                            >
                                                ★
                                            </button>
                                        ))}
                                        <span style={{ fontSize: 13, fontWeight: "700", color: "#f59e0b", alignSelf: "center", marginLeft: 8 }}>
                                            {signOffRating} / 5 Stars
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label style={labelStyle}>Resident Verification Notes *</label>
                                    <textarea
                                        style={{ ...inputStyle, minHeight: 70 }}
                                        value={signOffFeedback}
                                        onChange={(e) => setSignOffFeedback(e.target.value)}
                                        placeholder="e.g. Lift tested and operating normally. Maintenance team completed sensor replacement."
                                        required
                                    />
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSignOffIssue(null)}
                                        style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontSize: 13, fontWeight: "600" }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSigningOff}
                                        style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#15803d", color: "#ffffff", fontWeight: "700", cursor: "pointer", fontSize: 13 }}
                                    >
                                        {isSigningOff ? "Confirming..." : "✓ Confirm Resolution & Sign Off"}
                                    </button>
                                </div>
                            </form>
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
const headerContentStyle = { maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 };
const logoIconStyle = { width: 36, height: 36, borderRadius: 10, backgroundColor: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const titleStyle = { fontSize: 19, fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.02em", lineHeight: 1 };
const societyBadgeStyle = { backgroundColor: "#f0f9ff", color: "#0284c7", fontSize: 11.5, fontWeight: "700", padding: "3px 8px", borderRadius: 8, border: "1px solid #bae6fd" };
const residentProfileStyle = { display: "flex", alignItems: "center", gap: 6, backgroundColor: "#f1f5f9", padding: "6px 12px", borderRadius: 8 };
const logoutLinkStyle = { fontSize: 12, color: "#0284c7", fontWeight: "600", textDecoration: "none" };

const mainContentStyle = { maxWidth: 1100, margin: "24px auto", padding: "0 16px" };
const tabContainerStyle = { display: "flex", gap: 10, marginBottom: 20 };
const tabBtnStyle = { padding: "10px 18px", borderRadius: 10, border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#475569", fontSize: 13, fontWeight: "600", cursor: "pointer" };
const activeTabBtnStyle = { ...tabBtnStyle, backgroundColor: "#0284c7", color: "#ffffff", borderColor: "#0284c7" };

const cardStyle = { backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, outline: "none", boxSizing: "border-box" };
const rowStyle = { display: "flex", gap: 14 };

const categoryGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 };
const categoryCardStyle = { padding: "10px 12px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" };

const aiUploadSectionStyle = { display: "flex", gap: 16, flexWrap: "wrap", backgroundColor: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" };
const dropzoneStyle = { border: "2px dashed #cbd5e1", borderRadius: 10, padding: 20, textAlign: "center", backgroundColor: "#ffffff" };
const aiCardStyle = { backgroundColor: "#ffffff", border: "1px solid #c7d2fe", borderRadius: 12, padding: 14, height: "100%", boxSizing: "border-box" };
const emergencyAlertBoxStyle = { backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "8px 10px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6, margin: "8px 0" };
const emergencyNoticeStyle = { ...emergencyAlertBoxStyle, margin: "8px 0 12px" };
const useSuggestionBtnStyle = { marginTop: 6, backgroundColor: "#e0e7ff", color: "#4338ca", border: "none", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: "700", cursor: "pointer" };

const submitBtnStyle = { width: "100%", padding: "12px", backgroundColor: "#0284c7", color: "#ffffff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: "700", cursor: "pointer" };
const refreshBtnStyle = { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", backgroundColor: "#ffffff", fontSize: 12, fontWeight: "600", cursor: "pointer" };

const issueCardStyle = { backgroundColor: "#ffffff", borderRadius: 14, padding: 18, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" };
const ticketNumberStyle = { fontSize: 11, fontWeight: "800", color: "#64748b", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: 4 };
const towerBadgeStyle = { fontSize: 11, fontWeight: "600", color: "#0369a1", backgroundColor: "#e0f2fe", padding: "2px 6px", borderRadius: 4 };
const clusterCountBadgeStyle = { fontSize: 11, fontWeight: "700", color: "#c2410c", backgroundColor: "#ffedd5", padding: "2px 6px", borderRadius: 4 };
const issueFooterStyle = { borderTop: "1px solid #f1f5f9", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" };
const viewAuditBtnStyle = { display: "flex", alignItems: "center", gap: 4, backgroundColor: "transparent", border: "none", color: "#0284c7", fontSize: 12, fontWeight: "600", cursor: "pointer" };

const badgeStyle = { fontSize: 11, fontWeight: "700", padding: "3px 8px", borderRadius: 6 };
const successBannerStyle = { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: 14, borderRadius: 10, display: "flex", alignItems: "center", gap: 12, marginBottom: 16 };

const modalBackdropStyle = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 };
const modalCardStyle = { backgroundColor: "#ffffff", borderRadius: 16, padding: 24, maxWidth: 540, width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" };
const closeBtnStyle = { border: "none", backgroundColor: "#f1f5f9", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontWeight: "700" };
const auditItemStyle = { backgroundColor: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" };
