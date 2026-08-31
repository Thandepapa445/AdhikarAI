import axios from "axios";
import { INITIAL_SEED_CHALLENGES } from "../data/jharkhandData";

// Dynamically resolve backend via Vite reverse proxy for 100% reliable cross-device communication
const getApiBaseUrl = () => {
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
    const token = localStorage.getItem("sankalp_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ============================================================================
// LOCAL STORAGE BACKED SYNC FOR INSTANT OFFLINE / LIVE EXPERIENCE
// ============================================================================

const STORAGE_KEY = "sankalp_jharkhand_challenges";

export function getLocalChallenges() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.error("Local storage read error", e);
    }
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_CHALLENGES));
    } catch (e) {
        // safety
    }
    return INITIAL_SEED_CHALLENGES;
}

export function saveLocalChallenges(challenges) {
    try {
        if (Array.isArray(challenges)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
        }
    } catch (e) {
        console.warn("Local storage write error", e);
    }
}

// ============================================================================
// HIGH-LEVEL CHALLENGE API METHODS
// ============================================================================

export const challengeService = {
    // Fetch all challenges (syncs backend with local state)
    async getAllChallenges() {
        const localList = getLocalChallenges();
        try {
            const res = await api.get("/challenges");
            if (Array.isArray(res.data) && res.data.length > 0) {
                // Merge by ID so all challenges from both backend and local queue are visible!
                const map = new Map();
                localList.forEach(c => map.set(String(c.id), c));
                res.data.forEach(c => map.set(String(c.id), c));
                const merged = Array.from(map.values());
                saveLocalChallenges(merged);
                return merged;
            }
        } catch (err) {
            // Fallback gracefully to local dataset
        }
        return localList;
    },

    // Fetch citizen's own challenges
    async getMyChallenges(citizenEmail) {
        try {
            const res = await api.get("/challenges/my");
            if (Array.isArray(res.data) && res.data.length > 0) {
                return res.data;
            }
        } catch (err) {
            // Fallback
        }
        const all = getLocalChallenges();
        if (!citizenEmail) return all;
        const my = all.filter(c => c.citizenEmail === citizenEmail);
        return my.length > 0 ? my : all;
    },

    // Submit / Create new societal challenge
    async submitChallenge(challengeData) {
        const newId = challengeData.id || `JH-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
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
                latitude: Number(fullChallenge.lat || fullChallenge.latitude || 23.92),
                longitude: Number(fullChallenge.lng || fullChallenge.longitude || 84.23),
                affectedPopulation: Number(fullChallenge.affectedPopulation || 500),
                evidenceImageUrl: fullChallenge.evidenceImageUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800"
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

    // Allocate HEI to challenge
    async allocateHei(id, heiName, labDepartment, facultyMentor) {
        const list = getLocalChallenges();
        const updated = list.map(c => {
            if (String(c.id) === String(id)) {
                return {
                    ...c,
                    assignedHei: heiName,
                    assignedHeiDepartment: labDepartment,
                    facultyMentor: facultyMentor,
                    status: "ASSIGNED",
                    updatedAt: new Date().toISOString()
                };
            }
            return c;
        });
        saveLocalChallenges(updated);
        try {
            await api.post(`/challenges/${id}/allocate`, { heiName, labDepartment, facultyMentor });
        } catch (e) {
            // silent
        }
        return updated;
    },

    // Citizen verify pilot deployment
    async verifyPilot(id, feedbackText) {
        const list = getLocalChallenges();
        const updated = list.map(c => {
            if (String(c.id) === String(id)) {
                return {
                    ...c,
                    status: "RESOLVED",
                    citizenVerificationRequested: false,
                    citizenFeedbackNotes: feedbackText || "Citizen & Gram Panchayat verified field deployment.",
                    updatedAt: new Date().toISOString()
                };
            }
            return c;
        });
        saveLocalChallenges(updated);
        try {
            await api.post(`/challenges/${id}/verify-pilot`, { feedback: feedbackText });
        } catch (e) {
            // silent
        }
        return updated;
    }
};

export default api;
