package com.sankalp.backend.service;

import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class SocietalChallengeAIService {

    public String predictDomain(String text) {
        String t = text.toLowerCase();

        if (containsAny(t, "water", "drinking water", "fluoride", "arsenic", "contamination", "pipeline", "groundwater", "filtration", "well", "pond", "irrigation", "check dam", "handpump", "borewell")) {
            return "WATER";
        }
        if (containsAny(t, "crop", "agriculture", "farmer", "lac", "tasar", "silk", "harvest", "cold storage", "mahua", "soil", "pest", "fertilizer", "kisan", "mandi", "horticulture", "seeds", "forest produce")) {
            return "AGRICULTURE";
        }
        if (containsAny(t, "health", "hospital", "clinic", "doctor", "medicine", "sickle cell", "malnutrition", "maternal", "sanitation", "toilet", "hygiene", "telemedicine", "ambulance", "phc", "diagnostic", "disease")) {
            return "HEALTHCARE";
        }
        if (containsAny(t, "solar", "energy", "electricity", "power", "grid", "micro-grid", "biomass", "forest", "fire", "pollution", "air quality", "waste to energy", "battery", "carbon")) {
            return "ENERGY_ENVIRONMENT";
        }
        if (containsAny(t, "mining", "coal", "fly ash", "overburden", "mine water", "acid mine", "rehabilitation", "subsidence", "dust suppression", "quarry")) {
            return "MINING_REHAB";
        }
        if (containsAny(t, "school", "education", "student", "teacher", "classroom", "skill", "vocational", "training", "santhali", "mundari", "ho", "digital learning", "computer", "library")) {
            return "EDUCATION";
        }
        if (containsAny(t, "accessibility", "disability", "assistive", "wheelchair", "blind", "deaf", "mobility", "prosthetic", "divyang", "ramp", "braille")) {
            return "ACCESSIBILITY";
        }
        if (containsAny(t, "road", "bridge", "culvert", "pothole", "transport", "street light", "waste management", "garbage", "drain", "connectivity", "infrastructure")) {
            return "INFRASTRUCTURE";
        }
        if (containsAny(t, "governance", "pds", "ration", "portal", "panchayat", "land records", "mutation", "certificate", "scheme", "subsidy", "service delivery", "grievance")) {
            return "PUBLIC_ADMIN";
        }

        return "WATER";
    }

    public String predictUrgency(String text) {
        String t = text.toLowerCase();
        if (containsAny(t, "critical", "emergency", "fatal", "toxic", "poisoning", "danger", "contamination", "collapse", "severe illness", "epidemic", "arsenic", "fluoride")) {
            return "CRITICAL";
        }
        if (containsAny(t, "urgent", "immediate", "spoilage", "crop failure", "loss", "heavy damage", "broken", "blocked", "shortage")) {
            return "HIGH";
        }
        if (containsAny(t, "upgrade", "improvement", "delay", "manual", "slow")) {
            return "MEDIUM";
        }
        return "LOW";
    }

    public Map<String, String> recommendUniversityRouting(String domain, String district) {
        switch (domain) {
            case "WATER":
                return Map.of(
                        "assignedHei", "BIT Mesra, Ranchi",
                        "department", "Civil & Environmental Engineering (Water FabLab)",
                        "mentor", "Dr. Arvind Sharma (Water & Environmental Engg)",
                        "industryPartner", "Tata Steel Foundation (Water Initiative) & CleanAqua MSME"
                );
            case "AGRICULTURE":
                return Map.of(
                        "assignedHei", "Birsa Agricultural University (BAU) & NIT Jamshedpur",
                        "department", "Department of Agricultural Engineering & FabLab",
                        "mentor", "Dr. Birsa Hansda & Dr. Manoj Gupta",
                        "industryPartner", "Jharkhand AgTech & Rural Innovation Incubator"
                );
            case "MINING_REHAB":
                return Map.of(
                        "assignedHei", "IIT (ISM) Dhanbad",
                        "department", "Department of Environmental Science & Mining Tech",
                        "mentor", "Prof. Alok Kumar & Dr. D. P. Singh",
                        "industryPartner", "Coal India / CCL CSR Division"
                );
            case "HEALTHCARE":
                return Map.of(
                        "assignedHei", "AIIMS Deoghar",
                        "department", "Telemedicine & Remote Diagnostic Innovation Lab",
                        "mentor", "Dr. S. K. Mahato (Community Medicine)",
                        "industryPartner", "Tata Steel Foundation (Health Initiative)"
                );
            case "EDUCATION":
                return Map.of(
                        "assignedHei", "Ranchi University & IIIT Ranchi",
                        "department", "Tribal Language Center & AI EdTech Unit",
                        "mentor", "Dr. Rameshwar Oraon & Dr. Priya Ranjan",
                        "industryPartner", "Tata Steel Foundation (EdTech CSR)"
                );
            default:
                return Map.of(
                        "assignedHei", "NIT Jamshedpur",
                        "department", "Center for Sustainable Technology & Innovation",
                        "mentor", "Dr. Manoj Gupta",
                        "industryPartner", "Heavy Engineering Corporation (HEC) Innovation Wing"
                );
        }
    }

    private boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }
}
