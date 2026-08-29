import { INITIAL_SEED_CHALLENGES } from "../data/mobileData";

const BACKEND_URL = "http://10.0.2.2:8080/api"; // Android emulator to host localhost
const VISION_URL = "http://10.0.2.2:5000/api/v1";

let inMemoryChallenges = [...INITIAL_SEED_CHALLENGES];

export const mobileApiService = {
    async getChallenges() {
        try {
            const res = await fetch(`${BACKEND_URL}/challenges`);
            if (res.ok) {
                const data = await res.json();
                inMemoryChallenges = data;
                return data;
            }
        } catch (e) {
            // Offline fallback
        }
        return inMemoryChallenges;
    },

    async createChallenge(challengeData) {
        const newChallenge = {
            id: `JH-2026-${String(inMemoryChallenges.length + 101).padStart(4, "0")}`,
            ...challengeData,
            status: "SUBMITTED",
            createdAt: new Date().toISOString(),
            upvotes: 1
        };

        try {
            const res = await fetch(`${BACKEND_URL}/challenges`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(challengeData)
            });
            if (res.ok) {
                const created = await res.json();
                inMemoryChallenges.unshift(created);
                return created;
            }
        } catch (e) {
            // Offline fallback
        }

        inMemoryChallenges.unshift(newChallenge);
        return newChallenge;
    },

    async verifyPilot(challengeId, feedback) {
        inMemoryChallenges = inMemoryChallenges.map(c => {
            if (c.id === challengeId) {
                return {
                    ...c,
                    status: "RESOLVED",
                    citizenVerificationRequested: false,
                    citizenFeedbackNotes: feedback || "Field pilot verified by Citizen & Gram Panchayat Mukhya.",
                    updatedAt: new Date().toISOString()
                };
            }
            return c;
        });

        try {
            await fetch(`${BACKEND_URL}/challenges/${challengeId}/verify-pilot`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedback })
            });
        } catch (e) {}

        return inMemoryChallenges.find(c => c.id === challengeId);
    },

    async detectHazardWithYOLO(imageUri) {
        try {
            const formData = new FormData();
            formData.append("file", {
                uri: imageUri,
                name: "evidence.jpg",
                type: "image/jpeg"
            });

            const res = await fetch(`${VISION_URL}/detect`, {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                return await res.json();
            }
        } catch (e) {}

        // Mock verification response
        return {
            isVisualEvidenceVerified: true,
            primaryClass: "water_leakage",
            highestConfidence: 0.892,
            confidencePercent: "89.2%",
            recommendedDomain: "WATER",
            suggestedHei: "BIT Mesra (Clean Water FabLab)"
        };
    }
};
