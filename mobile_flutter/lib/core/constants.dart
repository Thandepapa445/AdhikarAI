import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';

class AppConstants {
  static String customHost = "";

  // Backend and AI Endpoints
  // Automatically uses 'localhost' on Web / Desktop and active hotspot IP on physical devices
  static String get defaultHost {
    if (kIsWeb) return "localhost";
    if (customHost.isNotEmpty) return customHost;
    return "192.168.1.35";
  }

  static String get apiBaseUrl => "http://$defaultHost:8085/api";
  static String get aiServiceUrl => "http://$defaultHost:5000/api/v1";

  static Future<void> loadCustomHost() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString("custom_server_host") ?? "";
      if (saved == "10.67.57.96") {
        await prefs.remove("custom_server_host");
        customHost = "";
      } else {
        customHost = saved;
      }
    } catch (_) {}
  }

  static Future<void> setCustomHost(String host) async {
    customHost = host.trim();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString("custom_server_host", customHost);
    } catch (_) {}
  }

  /// Automatically scans common subnets (Mobile Hotspot, Home Wi-Fi, Windows Hotspot)
  /// to locate the running Spring Boot backend.
  static Future<String?> autoScanForLaptop() async {
    final List<String> candidateIps = [
      if (customHost.isNotEmpty) customHost,
      "192.168.1.35",
      "192.168.1.41",
      // Android Mobile Hotspot range (phone is 192.168.43.1, laptop is 192.168.43.2..30)
      for (int i = 2; i <= 35; i++) "192.168.43.$i",
      // Windows Mobile Hotspot range
      for (int i = 2; i <= 15; i++) "192.168.137.$i",
      // iOS Personal Hotspot range
      for (int i = 2; i <= 10; i++) "172.20.10.$i",
    ];

    final dio = Dio(BaseOptions(
      connectTimeout: const Duration(milliseconds: 500),
      receiveTimeout: const Duration(milliseconds: 500),
    ));

    for (int batchStart = 0; batchStart < candidateIps.length; batchStart += 8) {
      final batch = candidateIps.sublist(
        batchStart,
        (batchStart + 8 > candidateIps.length) ? candidateIps.length : batchStart + 8,
      );

      final futures = batch.map((ip) async {
        try {
          final res = await dio.get("http://$ip:8085/api/challenges");
          if (res.statusCode == 200) {
            return ip;
          }
        } catch (_) {}
        return null;
      });

      final results = await Future.wait(futures);
      for (final match in results) {
        if (match != null) {
          await setCustomHost(match);
          return match;
        }
      }
    }
    return null;
  }

  // App Metadata
  static const String appName = "Adhikar AI";
  static const String appTagline = "National Citizen Innovation & Grievance Ecosystem";
  static const String governmentSubtitle = "NEP 2020 Social Innovation & Citizen Portal";

  // 9 Thematic Domains
  static const List<Map<String, dynamic>> thematicDomains = [
    {
      "id": "INFRASTRUCTURE",
      "name": "Roads & Urban/Rural Infrastructure",
      "icon": Icons.add_road,
      "color": Color(0xFF4F46E5),
      "bgColor": Color(0xFFE0E7FF),
    },
    {
      "id": "HEALTHCARE",
      "name": "Sanitation & Public Health",
      "icon": Icons.local_hospital,
      "color": Color(0xFFE11D48),
      "bgColor": Color(0xFFFFE4E6),
    },
    {
      "id": "WATER",
      "name": "Water Resources & Management",
      "icon": Icons.water_drop,
      "color": Color(0xFF0284C7),
      "bgColor": Color(0xFFE0F2FE),
    },
    {
      "id": "ENERGY_ENVIRONMENT",
      "name": "Clean Energy & Environmental Safety",
      "icon": Icons.solar_power,
      "color": Color(0xFFD97706),
      "bgColor": Color(0xFFFEF3C7),
    },
    {
      "id": "AGRICULTURE",
      "name": "Agriculture & Rural Livelihoods",
      "icon": Icons.agriculture,
      "color": Color(0xFF16A34A),
      "bgColor": Color(0xFFDCFCE7),
    },
    {
      "id": "EDUCATION",
      "name": "Education & Skill Development",
      "icon": Icons.school,
      "color": Color(0xFF7C3AED),
      "bgColor": Color(0xFFEDE9FE),
    },
    {
      "id": "ACCESSIBILITY",
      "name": "Accessibility & Assistive Tech",
      "icon": Icons.accessibility_new,
      "color": Color(0xFF0D9488),
      "bgColor": Color(0xFFCCFBF1),
    },
    {
      "id": "PUBLIC_ADMIN",
      "name": "Public Admin & Civic Governance",
      "icon": Icons.account_balance,
      "color": Color(0xFFEA580C),
      "bgColor": Color(0xFFFFEDD5),
    },
    {
      "id": "MINING_REHAB",
      "name": "Mining & Environmental Rehab",
      "icon": Icons.terrain,
      "color": Color(0xFF475569),
      "bgColor": Color(0xFFF1F5F9),
    },
  ];

  // 8 Stages of NEP 2020 Innovation Lifecycle
  static const List<Map<String, dynamic>> stagesOfInnovation = [
    {"key": "SUBMITTED", "label": "Submitted", "desc": "Citizen reported via Mobile 1-Tap GPS", "step": 1},
    {"key": "VALIDATED", "label": "AI Validated", "desc": "NLP & 4-Class YOLOv8 verified", "step": 2},
    {"key": "ASSIGNED", "label": "Assigned to HEI", "desc": "Allocated to University FabLab", "step": 3},
    {"key": "RESEARCH", "label": "Lab Research", "desc": "Literature & student scoping", "step": 4},
    {"key": "PROTOTYPE", "label": "CAD Prototype", "desc": "Engineering prototype built", "step": 5},
    {"key": "TESTING", "label": "Compliance Testing", "desc": "Lab safety & quality validation", "step": 6},
    {"key": "PILOT", "label": "Field Pilot", "desc": "Deployed on-ground in local area", "step": 7},
    {"key": "RESOLVED", "label": "Citizen Verified", "desc": "Citizen confirmed resolution", "step": 8},
  ];
}
