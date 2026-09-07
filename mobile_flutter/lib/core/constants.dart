import 'package:flutter/material.dart';

class AppConstants {
  // Backend and AI Endpoints
  // Use 10.0.2.2 for Android Emulator, or your laptop Wi-Fi IP for physical mobile devices
  static const String defaultHost = "10.190.248.96";
  static const String apiBaseUrl = "http://$defaultHost:8080/api";
  static const String aiServiceUrl = "http://$defaultHost:5000/api/v1";

  // App Metadata
  static const String appName = "Sankalp AI";
  static const String appTagline = "NEP 2020 Societal Innovation & Citizen Portal";
  static const String governmentSubtitle = "State Innovation Council • Govt. of Jharkhand";

  // 9 Thematic Domains
  static const List<Map<String, dynamic>> thematicDomains = [
    {
      "id": "WATER",
      "name": "Water Resources & Management",
      "icon": Icons.water_drop,
      "color": Color(0xFF0284C7),
      "bgColor": Color(0xFFE0F2FE),
    },
    {
      "id": "AGRICULTURE",
      "name": "Agriculture & Rural Livelihoods",
      "icon": Icons.agriculture,
      "color": Color(0xFF16A34A),
      "bgColor": Color(0xFFDCFCE7),
    },
    {
      "id": "HEALTHCARE",
      "name": "Healthcare & Sanitation",
      "icon": Icons.local_hospital,
      "color": Color(0xFFE11D48),
      "bgColor": Color(0xFFFFE4E6),
    },
    {
      "id": "ENERGY_ENVIRONMENT",
      "name": "Clean Energy & Environment",
      "icon": Icons.solar_power,
      "color": Color(0xFFD97706),
      "bgColor": Color(0xFFFEF3C7),
    },
    {
      "id": "MINING_REHAB",
      "name": "Mining & Environmental Rehab",
      "icon": Icons.terrain,
      "color": Color(0xFF7C3AED),
      "bgColor": Color(0xFFF3E8FF),
    },
    {
      "id": "INFRASTRUCTURE",
      "name": "Rural & Urban Infrastructure",
      "icon": Icons.add_road,
      "color": Color(0xFF0D9488),
      "bgColor": Color(0xFFCCFBF1),
    },
    {
      "id": "EDUCATION",
      "name": "Education & Skill Development",
      "icon": Icons.school,
      "color": Color(0xFF2563EB),
      "bgColor": Color(0xFFDBEAFE),
    },
    {
      "id": "ACCESSIBILITY",
      "name": "Accessibility & Assistive Tech",
      "icon": Icons.accessibility_new,
      "color": Color(0xFF4F46E5),
      "bgColor": Color(0xFFE0E7FF),
    },
    {
      "id": "PUBLIC_ADMIN",
      "name": "Public Admin & e-Governance",
      "icon": Icons.account_balance,
      "color": Color(0xFF475569),
      "bgColor": Color(0xFFF1F5F9),
    },
  ];

  // 8 Stages of NEP 2020 Innovation Lifecycle
  static const List<Map<String, dynamic>> stagesOfInnovation = [
    {"key": "SUBMITTED", "label": "Submitted", "desc": "Citizen reported via Mobile/GPS", "step": 1},
    {"key": "VALIDATED", "label": "AI Validated", "desc": "NLP & YOLOv8 verified by Admin", "step": 2},
    {"key": "ASSIGNED", "label": "Assigned to HEI", "desc": "Allocated to University FabLab", "step": 3},
    {"key": "RESEARCH", "label": "Lab Research", "desc": "Literature & feasibility analysis", "step": 4},
    {"key": "PROTOTYPE", "label": "CAD Prototype", "desc": "Student engineering prototype built", "step": 5},
    {"key": "TESTING", "label": "Compliance Testing", "desc": "Lab safety & quality validation", "step": 6},
    {"key": "PILOT", "label": "Field Pilot", "desc": "Deployed on-ground in village", "step": 7},
    {"key": "RESOLVED", "label": "Citizen Verified", "desc": "Gram Panchayat confirmed resolution", "step": 8},
  ];

  // 1-Tap Campus Location Presets
  static const List<Map<String, dynamic>> campusPresets = [
    {
      "label": "Ghaziabad (ABESIT Hub)",
      "district": "Ghaziabad",
      "block": "Vijay Nagar",
      "panchayat": "Near ABESIT Campus, NH-09",
      "lat": 28.6360,
      "lng": 77.4470,
      "hei": "ABESIT Group of Institutions",
      "distance": "0.0 km"
    },
    {
      "label": "Delhi NCR (DTU Hub)",
      "district": "North West Delhi",
      "block": "Rohini / Bawana",
      "panchayat": "Shahbad Daulatpur (DTU)",
      "lat": 28.7501,
      "lng": 77.1177,
      "hei": "Delhi Technological University",
      "distance": "0.0 km"
    },
    {
      "label": "Jharkhand Pilot Hub",
      "district": "Palamu",
      "block": "Satbarwa",
      "panchayat": "Satbarwa Khurd",
      "lat": 23.9525,
      "lng": 84.1825,
      "hei": "BIT Mesra / BAU Ranchi",
      "distance": "0.0 km"
    },
  ];
}
