package com.sankalp.backend.service;

import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class SocietalChallengeAIService {

    public String predictDomain(String text) {
        String t = text.toLowerCase();

        if (containsAny(t, "water", "drinking water", "fluoride", "arsenic", "contamination", "pipeline", "groundwater", "filtration", "well", "pond", "irrigation", "check dam", "handpump", "borewell", "water leakage")) {
            return "WATER";
        }
        if (containsAny(t, "crop", "agriculture", "farmer", "silk", "harvest", "cold storage", "soil", "pest", "fertilizer", "kisan", "mandi", "horticulture", "seeds", "forest produce")) {
            return "AGRICULTURE";
        }
        if (containsAny(t, "health", "hospital", "clinic", "doctor", "medicine", "sanitation", "toilet", "hygiene", "telemedicine", "ambulance", "phc", "diagnostic", "disease", "garbage", "trash", "waste")) {
            return "HEALTHCARE";
        }
        if (containsAny(t, "solar", "energy", "electricity", "power", "grid", "micro-grid", "biomass", "forest", "fire", "pollution", "air quality", "waste to energy", "battery", "carbon", "tree", "fallen tree")) {
            return "ENERGY_ENVIRONMENT";
        }
        if (containsAny(t, "mining", "coal", "fly ash", "overburden", "mine water", "rehabilitation", "subsidence", "quarry")) {
            return "MINING_REHAB";
        }
        if (containsAny(t, "school", "education", "student", "teacher", "classroom", "skill", "vocational", "training", "digital learning", "computer", "library")) {
            return "EDUCATION";
        }
        if (containsAny(t, "accessibility", "disability", "assistive", "wheelchair", "blind", "deaf", "mobility", "prosthetic", "divyang", "ramp", "braille")) {
            return "ACCESSIBILITY";
        }
        if (containsAny(t, "road", "bridge", "culvert", "pothole", "transport", "street light", "crater", "asphalt", "connectivity", "infrastructure")) {
            return "INFRASTRUCTURE";
        }
        if (containsAny(t, "governance", "pds", "ration", "portal", "panchayat", "municipality", "certificate", "scheme", "subsidy", "service delivery", "grievance")) {
            return "PUBLIC_ADMIN";
        }

        return "INFRASTRUCTURE";
    }

    public String predictUrgency(String text) {
        String t = text.toLowerCase();
        if (containsAny(t, "critical", "emergency", "fatal", "toxic", "poisoning", "danger", "contamination", "collapse", "severe illness", "epidemic", "arsenic", "fluoride")) {
            return "CRITICAL";
        }
        if (containsAny(t, "urgent", "immediate", "spoilage", "crop failure", "loss", "heavy damage", "broken", "blocked", "shortage", "accident")) {
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
                        "assignedHei", "IIT Madras / BIT Mesra",
                        "department", "Clean Water & Rural Innovation FabLab",
                        "mentor", "Prof. T. Pradeep / Dr. Arvind Sharma",
                        "industryPartner", "National Clean Water CSR Initiative"
                );
            case "AGRICULTURE":
                return Map.of(
                        "assignedHei", "IIT Kharagpur & Birsa Agricultural University",
                        "department", "Precision Agriculture & Rural Development Lab",
                        "mentor", "Prof. V. M. Chowdary",
                        "industryPartner", "AgTech & Rural Innovation Incubator"
                );
            case "HEALTHCARE":
                return Map.of(
                        "assignedHei", "AIIMS New Delhi / AIIMS Deoghar",
                        "department", "Centre for Community Medicine & Telehealth",
                        "mentor", "Dr. Sanjay K. Rai",
                        "industryPartner", "National Health & Sanitation Mission"
                );
            case "ENERGY_ENVIRONMENT":
                return Map.of(
                        "assignedHei", "IIT Delhi / DTU Delhi",
                        "department", "Clean Energy & Urban Environmental Lab",
                        "mentor", "Prof. B. K. Panigrahi / Prof. S. K. Garg",
                        "industryPartner", "Clean Energy & Urban Resilience CSR"
                );
            case "EDUCATION":
                return Map.of(
                        "assignedHei", "IIT Bombay / BITS Pilani",
                        "department", "Centre for Technology Alternatives & AI EdTech Unit",
                        "mentor", "Prof. Satish Agnihotri",
                        "industryPartner", "National Digital Literacy Grant"
                );
            case "INFRASTRUCTURE":
            default:
                return Map.of(
                        "assignedHei", "DTU Delhi / ABESIT Ghaziabad",
                        "department", "Smart Infrastructure & Pavement Materials Lab",
                        "mentor", "Prof. S. K. Garg / Dr. Hemant Ahuja",
                        "industryPartner", "Smart Cities & Infrastructure Mission"
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
