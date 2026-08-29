package com.adhikar.backend.service;

import org.springframework.stereotype.Service;

@Service
public class ComplaintAIService {

    public String predictCategory(String text) {

        String complaint = text.toLowerCase();

        /*
         * WATER
         * Check before roads because complaints like
         * "water leakage on road" contain both keywords.
         */
        if (containsAny(
                complaint,
                "water",
                "pipeline",
                "sewage",
                "drain",
                "drainage",
                "leakage",
                "leak",
                "drinking water",
                "water supply",
                "water shortage",
                "waterlogging"
        )) {
            return "WATER";
        }

        /*
         * ELECTRICITY
         */
        if (containsAny(
                complaint,
                "light",
                "streetlight",
                "street light",
                "electricity",
                "electric",
                "power",
                "pole",
                "transformer",
                "voltage",
                "power cut",
                "blackout"
        )) {
            return "ELECTRICITY";
        }

        /*
         * SANITATION
         */
        if (containsAny(
                complaint,
                "garbage",
                "waste",
                "dustbin",
                "sanitation",
                "dirty",
                "dump",
                "trash",
                "litter"
        )) {
            return "SANITATION";
        }

        /*
         * SAFETY
         */
        if (containsAny(
                complaint,
                "crime",
                "theft",
                "robbery",
                "police",
                "unsafe",
                "accident",
                "danger",
                "harassment"
        )) {
            return "SAFETY";
        }

        /*
         * ENVIRONMENT
         */
        if (containsAny(
                complaint,
                "park",
                "tree",
                "pollution",
                "environment",
                "air pollution",
                "noise pollution"
        )) {
            return "ENVIRONMENT";
        }

        /*
         * ROADS
         * Checked after more specific categories.
         */
        if (containsAny(
                complaint,
                "road",
                "pothole",
                "footpath",
                "traffic",
                "highway",
                "road damage",
                "broken road",
                "road crack",
                "street damage"
        )) {
            return "ROADS";
        }

        return "GENERAL";
    }


    public String predictPriority(String text) {

        String complaint = text.toLowerCase();

        /*
         * HIGH PRIORITY
         */
        if (containsAny(
                complaint,
                "urgent",
                "emergency",
                "danger",
                "accident",
                "fire",
                "crime",
                "unsafe",
                "critical",
                "life threatening",
                "life-threatening",
                "immediate danger"
        )) {
            return "HIGH";
        }

        /*
         * MEDIUM PRIORITY
         */
        if (containsAny(
                complaint,
                "not working",
                "broken",
                "blocked",
                "overflow",
                "leak",
                "leakage",
                "damaged",
                "not available",
                "shortage",
                "failure"
        )) {
            return "MEDIUM";
        }

        /*
         * LOW PRIORITY
         */
        return "LOW";
    }


    private boolean containsAny(
            String text,
            String... keywords
    ) {

        for (String keyword : keywords) {

            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }
}