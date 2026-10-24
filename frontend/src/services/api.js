import axios from "axios";
import { INITIAL_SEED_CHALLENGES } from "../data/indiaData";

// Dynamically resolve backend via Vite reverse proxy for 100% reliable cross-device communication
const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    return "/api";
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 8000,
});

api.interceptors.request.use((config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem("adhikar_token") || localStorage.getItem("sankalp_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ============================================================================
// LOCAL STORAGE BACKED SYNC FOR INSTANT OFFLINE / LIVE EXPERIENCE
// ============================================================================

const STORAGE_KEY = "adhikar_ai_challenges_v2";

const isJunkChallenge = (c) => {
    if (!c) return true;
    const txt = `${c.title || ""} ${c.description || ""} ${c.submitterName || ""}`.toLowerCase();
    return (
        txt.includes("baoa") ||
        txt.includes("hjsj") ||
        txt.includes("hrhw") ||
        txt.includes("fqgh") ||
        txt.includes("bwhr") ||
        txt.includes("abhru") ||
        txt.includes("leaning here and there") ||
        txt.includes("kirtiii") ||
        txt.includes("crops surfers")
    );
};

export const isFakeSeedChallenge = (c) => {
    if (!c) return true;
    const sid = String(c.id || "");
    const email = String(c.citizenEmail || "").toLowerCase();
    const title = String(c.title || "").toLowerCase();
    return (
        sid === "1" || sid === "2" || sid === "3" || sid === "4" || sid === "5" ||
        sid === "ADH-2026-1041" || sid === "ADH-2026-1042" || sid === "ADH-2026-1043" || sid === "ADH-2026-1044" || sid === "ADH-2026-1045" ||
        email === "aditya.sharma@adhikar.in" ||
        email === "pooja.verma@adhikar.in" ||
        email === "rohan.nair@adhikar.in" ||
        email === "manoj.mukhya@adhikar.in" ||
        email === "sunita.devi@adhikar.in" ||
        title.includes("deep hazardous pothole cluster") ||
        title.includes("unattended solid waste garbage accumulation near residential market") ||
        title.includes("non-functional public streetlight fixtures creating dark nocturnal corridor") ||
        title.includes("fallen tree and heavy timber obstructing public roadway") ||
        title.includes("fluoride and arsenic contamination in village borewells")
    );
};

export function getLocalChallenges() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const clean = parsed.filter(c => !isJunkChallenge(c) && !isFakeSeedChallenge(c));
                return clean;
            }
        }
    } catch (e) {
        console.error("Local storage read error", e);
    }
    return [];
}

export function saveLocalChallenges(challenges) {
    try {
        if (Array.isArray(challenges)) {
            const clean = challenges.filter(c => !isJunkChallenge(c) && !isFakeSeedChallenge(c));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
        }
    } catch (e) {
        console.warn("Local storage write error", e);
    }
}

export const challengeService = {
    async login(credentials) {
        const res = await api.post("/auth/login", credentials);
        if (res.data?.token) {
            localStorage.setItem("adhikar_token", res.data.token);
            localStorage.setItem("adhikar_user_email", res.data.email);
            localStorage.setItem("adhikar_user_role", res.data.role);
            localStorage.setItem("adhikar_user_name", res.data.name || "User");
        }
        return res.data;
    },
    // Fetch all challenges (backend is primary authoritative source)
    async getAllChallenges() {
        try {
            const res = await api.get("/challenges");
            if (Array.isArray(res.data)) {
                const clean = res.data.filter(c => !isJunkChallenge(c) && !isFakeSeedChallenge(c));
                saveLocalChallenges(clean);
                return clean;
            }
        } catch (err) {
            // Fallback gracefully to local dataset if offline
        }
        return getLocalChallenges();
    },

    // Fetch citizen's own challenges
    async getMyChallenges(citizenEmail) {
        try {
            const res = await api.get("/challenges/my");
            if (Array.isArray(res.data)) {
                return res.data.filter(c => !isFakeSeedChallenge(c));
            }
        } catch (err) {
            // Fallback
        }
        const all = getLocalChallenges();
        if (!citizenEmail) return all;
        return all.filter(c => c.citizenEmail === citizenEmail);
    },

    // Submit / Create new societal challenge
    async submitChallenge(challengeData) {
        const newId = challengeData.id || `ADH-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
        const fullChallenge = {
            ...challengeData,
            id: newId,
            status: challengeData.status || "SUBMITTED",
            createdAt: challengeData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            upvotes: challengeData.upvotes || 1
        };

        // Always prepend to local storage immediately so it appears on all tabs instantly
        const list = getLocalChallenges();
        const updated = [fullChallenge, ...list.filter(c => String(c.id) !== String(newId))];
        saveLocalChallenges(updated);

        try {
            // Send to Spring Boot Backend
            const res = await api.post("/challenges", {
                title: fullChallenge.title,
                description: fullChallenge.description,
                domain: fullChallenge.domain,
                urgency: fullChallenge.urgency,
                submitterType: fullChallenge.submitterType,
                submitterName: fullChallenge.submitterName,
                district: fullChallenge.district,
                block: fullChallenge.block,
                panchayat: fullChallenge.panchayat,
                locationText: fullChallenge.locationText,
                latitude: Number(fullChallenge.lat || fullChallenge.latitude || 28.6139),
                longitude: Number(fullChallenge.lng || fullChallenge.longitude || 77.2090),
                affectedPopulation: Number(fullChallenge.affectedPopulation || 500),
                evidenceImageUrl: fullChallenge.evidenceImageUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800",
                priority: fullChallenge.priority || fullChallenge.urgency || "MODERATE",
                estimatedSeverity: fullChallenge.estimatedSeverity,
                modelConfidence: fullChallenge.modelConfidence,
                priorityExplanation: fullChallenge.priorityExplanation,
                aiSuggestedDescription: fullChallenge.aiSuggestedDescription,
                needsHumanReview: fullChallenge.needsHumanReview,
                safetyFlags: fullChallenge.safetyFlags
            });
            if (res.data) {
                const map = new Map();
                map.set(String(res.data.id), res.data);
                updated.forEach(c => {
                    if (String(c.id) !== String(newId) && String(c.id) !== String(res.data.id)) {
                        map.set(String(c.id), c);
                    }
                });
                const merged = Array.from(map.values());
                saveLocalChallenges(merged);
                return res.data;
            }
        } catch (err) {
            console.warn("Backend sync pending, challenge stored in active reactive local cache.", err?.message);
        }

        return fullChallenge;
    },

    // Alias for createChallenge to ensure 100% compatibility
    async createChallenge(challengeData) {
        return this.submitChallenge(challengeData);
    },

    // Upvote a community challenge
    async upvoteChallenge(id) {
        const list = getLocalChallenges();
        const updated = list.map(c => {
            if (String(c.id) === String(id)) {
                return { ...c, upvotes: (c.upvotes || 0) + 1 };
            }
            return c;
        });
        saveLocalChallenges(updated);
        try {
            await api.post(`/challenges/${id}/upvote`);
        } catch (e) {
            // silent
        }
        return updated;
    },

    // Generic Stage Progression Updater (Advances through all 8 Stages)
    async updateChallengeStatus(id, newStatus, extraData = {}) {
        const payload = { status: newStatus, ...extraData };
        try {
            const res = await api.put(`/challenges/${id}/status`, payload);
            if (res.data) {
                const list = getLocalChallenges();
                const merged = list.map(c => String(c.id) === String(id) ? res.data : c);
                saveLocalChallenges(merged);
                return merged;
            }
        } catch (e) {
            console.error("Backend status update failed:", e?.response?.data || e?.message);
            if (e?.response && (e.response.status === 401 || e.response.status === 403)) {
                throw new Error(e.response.data?.message || "Unauthorized: Administrative privileges required to advance stage.");
            }
            console.warn("Backend status update fallback to local storage", e?.message);
        }
        const list = getLocalChallenges();
        const updated = list.map(c => String(c.id) === String(id) ? { ...c, status: newStatus, ...extraData, updatedAt: new Date().toISOString() } : c);
        saveLocalChallenges(updated);
        return updated;
    },

    // Allocate HEI to challenge
    async allocateHei(id, heiName, labDepartment, facultyMentor, extra = {}) {
        return this.updateChallengeStatus(id, "ASSIGNED", {
            assignedHei: heiName,
            assignedHeiDepartment: labDepartment,
            facultyMentor: facultyMentor,
            ...extra
        });
    },

    // Citizen verify pilot deployment
    async verifyPilot(id, feedbackText) {
        try {
            const res = await api.post(`/challenges/${id}/verify-pilot`, {
                feedback: feedbackText || "Citizen field verification confirmed by local resident & authority."
            });
            if (res.data) {
                const list = getLocalChallenges();
                const merged = list.map(c => String(c.id) === String(id) ? res.data : c);
                saveLocalChallenges(merged);
                return merged;
            }
        } catch (e) {
            console.error("verifyPilot failed:", e?.response?.data || e?.message);
            throw e;
        }
        return this.updateChallengeStatus(id, "RESOLVED", {
            citizenVerificationRequested: false,
            citizenFeedbackNotes: feedbackText || "Citizen field verification confirmed by local resident & authority."
        });
    },

    // Duplicate complaint clusters
    async getClusters() {
        try {
            const res = await api.get("/challenges/clusters");
            if (Array.isArray(res.data)) return res.data;
        } catch (e) {
            console.warn("Failed to fetch clusters from backend", e?.message);
        }
        return getLocalChallenges().filter(c => c.isClusterMaster !== false);
    },

    async getClusterReports(clusterId) {
        try {
            const res = await api.get(`/challenges/clusters/${clusterId}/reports`);
            if (Array.isArray(res.data)) return res.data;
        } catch (e) {
            console.warn("Failed to fetch cluster reports from backend", e?.message);
        }
        return getLocalChallenges().filter(c => String(c.clusterId) === String(clusterId) || String(c.id) === String(clusterId));
    },

    async overridePriority(id, priority, reason) {
        try {
            const res = await api.put(`/challenges/${id}/override-priority`, { priority, reason });
            if (res.data) {
                const list = getLocalChallenges().map(c => String(c.id) === String(id) ? res.data : c);
                saveLocalChallenges(list);
                return res.data;
            }
        } catch (e) {
            console.warn("Override priority fallback", e?.message);
        }
        return this.updateChallengeStatus(id, undefined, { priority, priorityOverrideReason: reason });
    },

    async separateCluster(id) {
        try {
            const res = await api.post(`/challenges/${id}/separate-cluster`);
            if (res.data) {
                const list = getLocalChallenges().map(c => String(c.id) === String(id) ? res.data : c);
                saveLocalChallenges(list);
                return res.data;
            }
        } catch (e) {
            console.warn("Separate cluster fallback", e?.message);
        }
        return this.updateChallengeStatus(id, undefined, { isClusterMaster: true, duplicateCount: 1 });
    },

    // =========================================================================
    // PHASE 2: RESIDENTIAL SOCIETY MAINTENANCE PLATFORM API
    // =========================================================================

    async getSocieties() {
        try {
            const res = await api.get("/society/organizations");
            if (Array.isArray(res.data)) return res.data;
        } catch (e) {
            console.warn("Failed to load societies", e?.message);
        }
        return [
            { id: 2, name: "Greenwood Heights Residential Society", code: "SOC-GREENWOOD", city: "Ranchi" },
            { id: 3, name: "Palm Meadows Luxury Condos", code: "SOC-PALM", city: "Ranchi" }
        ];
    },

    async createSocietyIssue(issueData) {
        const res = await api.post("/society/issues", issueData);
        return res.data;
    },

    async getSocietyIssues(params = {}) {
        const res = await api.get("/society/issues", { params });
        return res.data;
    },

    async getMySocietyIssues() {
        const res = await api.get("/society/issues/my");
        return res.data;
    },

    async getSocietyIssueDetails(id) {
        const res = await api.get(`/society/issues/${id}`);
        return res.data;
    },

    async getSocietyIssueAudits(id) {
        const res = await api.get(`/society/issues/${id}/audits`);
        return res.data;
    },

    async updateSocietyIssueStatus(id, updateData) {
        const res = await api.put(`/society/issues/${id}/status`, updateData);
        return res.data;
    },

    async separateSocietyCluster(id) {
        const res = await api.post(`/society/issues/${id}/separate-cluster`);
        return res.data;
    },

    async escalateSocietyIssueToCivic(id, reason) {
        const res = await api.post(`/society/issues/${id}/escalate-to-civic`, { reason });
        return res.data;
    },

    async signOffSocietyIssue(id, rating, feedback) {
        const res = await api.post(`/society/issues/${id}/sign-off`, { rating, feedback });
        return res.data;
    },

    async getSocietyMetrics() {
        const res = await api.get("/society/metrics");
        return res.data;
    },

    async getSocietyStaff() {
        const res = await api.get("/society/staff");
        return res.data;
    },

    async assessSocietyEvidence(file, categoryHint, textHint) {
        const formData = new FormData();
        if (file) formData.append("file", file);
        if (categoryHint) formData.append("category", categoryHint);
        if (textHint) formData.append("text", textHint);

        try {
            const res = await axios.post("/yolo-api/v1/society/detect", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 10000
            });
            return res.data;
        } catch (e) {
            console.warn("Society AI assessment fallback", e?.message);
            // Fallback deterministic assessment
            const hint = (categoryHint || textHint || "").toLowerCase();
            if (hint.includes("electric") || hint.includes("spark") || hint.includes("wire")) {
                return {
                    assignedPriority: "CRITICAL",
                    category: "WIRING_HAZARD",
                    estimatedSeverity: "CRITICAL - Life Safety Hazard",
                    priorityExplanation: "Exposed / sparking electrical hazard. Dispatched to licensed electrician.",
                    suggestedDescription: "Exposed electrical wiring or sparking hazard observed in the tower common area. Keep distance.",
                    safetyFlags: ["ELECTRICAL_LIFE_SAFETY"],
                    emergencyGuidance: "CRITICAL: Stay at least 3 meters away. Main circuit breaker isolation requested."
                };
            }
            if (hint.includes("lift") || hint.includes("elevator")) {
                return {
                    assignedPriority: "HIGH",
                    category: "ELEVATOR_LIFT",
                    estimatedSeverity: "HIGH - Elevator Outage",
                    priorityExplanation: "Elevator breakdown in tower. Technician dispatched.",
                    suggestedDescription: "Elevator is non-operational in this tower. OEM technician intervention requested.",
                    safetyFlags: ["ELEVATOR_OUTAGE"],
                    emergencyGuidance: "Do not attempt manual door forcing. Use service lift or stairs."
                };
            }
            return {
                assignedPriority: "MODERATE",
                category: "OTHER",
                estimatedSeverity: "STANDARD - Maintenance Inspection",
                priorityExplanation: "Standard maintenance issue queued for facility manager review.",
                suggestedDescription: "A maintenance issue has been reported in this residential area. Please inspect and resolve.",
                safetyFlags: ["ROUTINE_MAINTENANCE"]
            };
        }
    }
};

Object.assign(api, challengeService);
export default api;
