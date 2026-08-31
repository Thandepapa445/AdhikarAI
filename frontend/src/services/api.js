import axios from "axios";
import { INITIAL_SEED_CHALLENGES } from "../data/jharkhandData";

// Dynamically resolve backend host so both phone (via Wi-Fi IP) and laptop (localhost) hit the same Spring Boot server!
const getApiBaseUrl = () => {
    if (typeof window !== "undefined" && window.location && window.location.hostname) {
        return `http://${window.location.hostname}:8080/api`;
    }
    return "http://localhost:8080/api";
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 4000,
});

api.interceptors.request.use((config) => {
    config.baseURL = getApiBaseUrl(); // dynamically update base url
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
        // quota safety
    }
    return INITIAL_SEED_CHALLENGES;
}

export function saveLocalChallenges(challenges) {
    try {
        // Keep challenges compact to prevent any browser quota / memory full errors
        const compactList = (challenges || []).slice(0, 30).map(c => ({
            ...c,
            // truncate overly long base64 strings in local storage if present
            evidenceImageUrl: (c.evidenceImageUrl && c.evidenceImageUrl.length > 100000)
                ? c.evidenceImageUrl.substring(0, 50000)
                : (c.evidenceImageUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800")
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compactList));
    } catch (e) {
        console.warn("Local storage quota exceeded. Purging older items to free space...", e);
        try {
            // Keep only latest 10 items
            const smaller = (challenges || []).slice(0, 10);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(smaller));
        } catch (err) {
            console.error("Failed to write to local storage", err);
        }
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
                // Merge backend challenges with local state
                const localList = getLocalChallenges();
                const backendIds = new Set(res.data.map(c => String(c.id)));
                const uniqueLocal = localList.filter(c => !backendIds.has(String(c.id)));
                const merged = [...res.data, ...uniqueLocal];
                saveLocalChallenges(merged);
                return merged;
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
                const merged = [res.data, ...list.filter(c => c.id !== res.data.id && c.id !== newId)];
                saveLocalChallenges(merged);
                return res.data;
            }
        } catch (err) {
            console.warn("Backend sync pending, challenge saved in local reactive queue.", err?.message);
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
