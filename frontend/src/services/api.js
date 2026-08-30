import axios from "axios";
import { INITIAL_SEED_CHALLENGES } from "../data/jharkhandData";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 3000,
});

api.interceptors.request.use((config) => {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_CHALLENGES));
    return INITIAL_SEED_CHALLENGES;
}

export function saveLocalChallenges(challenges) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
    } catch (e) {
        console.error("Local storage save error", e);
    }
}

// ============================================================================
// HIGH-LEVEL CHALLENGE API METHODS
// ============================================================================

export const challengeService = {
    // Fetch all challenges (syncs backend with local state)
    async getAllChallenges() {
        try {
            const res = await api.get("/challenges");
            if (Array.isArray(res.data) && res.data.length > 0) {
                saveLocalChallenges(res.data);
                return res.data;
            }
        } catch (err) {
            // Fallback gracefully to local dataset
        }
        return getLocalChallenges();
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
        const newId = challengeData.id || `JH-2026-${String(Math.floor(100 + Math.random() * 900))}`;
        const fullChallenge = {
            ...challengeData,
            id: newId,
            status: challengeData.status || "SUBMITTED",
            createdAt: challengeData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            upvotes: challengeData.upvotes || 1
        };

        // Always prepend to local storage immediately for instant UI reactive update
        const list = getLocalChallenges();
        const updated = [fullChallenge, ...list.filter(c => c.id !== newId)];
        saveLocalChallenges(updated);

        try {
            const res = await api.post("/challenges", fullChallenge);
            if (res.data) {
                const merged = [res.data, ...list.filter(c => c.id !== res.data.id)];
                saveLocalChallenges(merged);
                return res.data;
            }
        } catch (err) {
            console.warn("Backend not available, challenge stored locally.");
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
            if (c.id === id) {
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
            if (c.id === id) {
                return {
                    ...c,
                    assignedHei: heiName,
                    assignedHeiDepartment: labDepartment,
                    facultyMentor: facultyMentor,
                    status: "ASSIGNED_TO_HEI",
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
            if (c.id === id) {
                return {
                    ...c,
                    status: "DEPLOYED_VERIFIED",
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
