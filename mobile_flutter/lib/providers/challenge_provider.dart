import 'package:flutter/material.dart';
import '../models/challenge_model.dart';
import '../services/api_service.dart';

class ChallengeProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<ChallengeModel> _challenges = [];
  bool _isLoading = false;
  String _selectedDomain = "ALL";
  String _selectedStage = "ALL";
  String _searchQuery = "";

  List<ChallengeModel> get challenges {
    return _challenges.where((c) {
      final matchSearch = _searchQuery.isEmpty ||
          c.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          c.district.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          c.block.toLowerCase().contains(_searchQuery.toLowerCase());

      final matchDomain = _selectedDomain == "ALL" || c.domain == _selectedDomain;
      final matchStage = _selectedStage == "ALL" || c.status == _selectedStage;

      return matchSearch && matchDomain && matchStage;
    }).toList();
  }

  List<ChallengeModel> get rawChallenges => _challenges;
  bool get isLoading => _isLoading;
  String get selectedDomain => _selectedDomain;
  String get selectedStage => _selectedStage;
  String get searchQuery => _searchQuery;

  // Seed default data for offline initial view
  void initializeWithDefaults() {
    if (_challenges.isEmpty) {
      _challenges = [
        ChallengeModel(
          id: "JH-2026-0101",
          title: "Severe Fluoride & Arsenic Contamination in Rural Handpumps",
          description: "Over 8 handpumps in Satbarwa village are dispensing fluoride-contaminated water, causing dental and skeletal fluorosis across 1,200 villagers. Clean filtration and decentralized water ATM needed.",
          domain: "WATER",
          domainName: "Water Resources & Management",
          urgency: "CRITICAL",
          submitterType: "GRAM_PANCHAYAT_MUKHYA",
          submitterName: "Mukhya Rameshwar Oraon",
          citizenEmail: "rameshwar.palamu@sankalp.gov.in",
          district: "Palamu",
          block: "Satbarwa",
          panchayat: "Satbarwa Khurd",
          locationText: "Ward 4, Near Primary School, Satbarwa",
          latitude: 23.9214,
          longitude: 84.2389,
          affectedPopulation: 1200,
          status: "PILOT",
          evidenceImageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800",
          upvotes: 48,
          assignedHei: "BIT Mesra, Ranchi",
          assignedHeiDepartment: "Clean Water & Rural Innovation FabLab",
          facultyMentor: "Dr. Arvind Sharma (Water & Environmental Engg)",
          studentTeam: "HydroPure Student Innovation Team",
          industryPartner: "Tata Steel Foundation (Water Initiative)",
          prototypeDetails: "Solar-Powered Multi-Stage Nano-Filtration Vessel (V2.4)",
          pilotResults: "Installed at Community Well #4; Arsenic dropped from 0.08 ppm to safe 0.002 ppm.",
          citizenVerificationRequested: true,
        ),
        ChallengeModel(
          id: "JH-2026-0102",
          title: "Lac Harvesting & Post-Harvest Cold Chain Storage Failures",
          description: "Tribal lac cultivators in Khunti facing 35% produce degradation due to lack of localized solar-powered climate-controlled storage chambers.",
          domain: "AGRICULTURE",
          domainName: "Agriculture & Rural Livelihoods",
          urgency: "HIGH",
          submitterType: "FARMER_COLLECTIVE",
          submitterName: "Birsa Munda Kisan Samiti",
          citizenEmail: "kisan.khunti@sankalp.gov.in",
          district: "Khunti",
          block: "Torpa",
          panchayat: "Dormo",
          locationText: "Torpa Weekly Haat Mandi",
          latitude: 22.8847,
          longitude: 85.0934,
          affectedPopulation: 850,
          status: "PROTOTYPE",
          evidenceImageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800",
          upvotes: 34,
          assignedHei: "Birsa Agricultural University (BAU), Ranchi",
          assignedHeiDepartment: "Precision AgriTech & Bio-Organic Pest Lab",
          facultyMentor: "Dr. Rekha Kumari (Agronomy & Soil Science)",
          studentTeam: "AgriTech Capstone Team #3",
          industryPartner: "Jharkhand State Livelihood Promotion Society (JSLPS)",
          prototypeDetails: "Phase-Change Material (PCM) Solar Cold Chamber",
        ),
        ChallengeModel(
          id: "JH-2026-0103",
          title: "Chronic Potholes and Waterlogging near NH-09",
          description: "Major road degradation creating heavy water stagnation and severe commuter accidents during monsoon season.",
          domain: "INFRASTRUCTURE",
          domainName: "Rural & Urban Infrastructure",
          urgency: "HIGH",
          submitterType: "INDIVIDUAL_CITIZEN",
          submitterName: "Ankit Verma",
          citizenEmail: "ankit.ghaziabad@sankalp.gov.in",
          district: "Ghaziabad",
          block: "Vijay Nagar",
          panchayat: "Near ABESIT Campus",
          locationText: "NH-09 Highway Junction, Ghaziabad",
          latitude: 28.6360,
          longitude: 77.4470,
          affectedPopulation: 2500,
          status: "ASSIGNED",
          evidenceImageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800",
          upvotes: 29,
          assignedHei: "ABESIT Group of Institutions, Ghaziabad",
          assignedHeiDepartment: "Smart Transportation & AI Infrastructure Lab",
          facultyMentor: "Dr. Rizwan Khan (AI & Infrastructure Systems)",
          studentTeam: "CivicTech Pioneers",
          industryPartner: "Crossings Infrastructure CSR Wing",
        ),
      ];
      notifyListeners();
    }
  }

  // Load from Backend API
  Future<void> loadChallenges() async {
    _isLoading = true;
    notifyListeners();

    try {
      final list = await _apiService.fetchChallenges();
      if (list.isNotEmpty) {
        _challenges = list;
      } else {
        initializeWithDefaults();
      }
    } catch (e) {
      initializeWithDefaults();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Add / Create Challenge
  Future<ChallengeModel?> addChallenge(ChallengeModel challenge) async {
    _challenges.insert(0, challenge);
    notifyListeners();

    final result = await _apiService.submitChallenge(challenge);
    if (result != null) {
      final index = _challenges.indexWhere((c) => c.id.toString() == challenge.id.toString());
      if (index >= 0) {
        _challenges[index] = result;
      }
      notifyListeners();
    }
    return result;
  }

  // Upvote
  Future<void> upvote(dynamic id) async {
    final index = _challenges.indexWhere((c) => c.id.toString() == id.toString());
    if (index >= 0) {
      _challenges[index] = _challenges[index].copyWith(
        upvotes: _challenges[index].upvotes + 1,
      );
      notifyListeners();
      await _apiService.upvoteChallenge(id);
    }
  }

  // Update Status / Stage
  Future<void> updateStage(dynamic id, String newStatus, {Map<String, dynamic>? extra}) async {
    final index = _challenges.indexWhere((c) => c.id.toString() == id.toString());
    if (index >= 0) {
      _challenges[index] = _challenges[index].copyWith(
        status: newStatus,
        prototypeDetails: extra?['prototypeDetails'],
        pilotResults: extra?['pilotResults'],
      );
      notifyListeners();
      await _apiService.updateStatus(id, newStatus, extra: extra);
    }
  }

  // Citizen Verify Pilot Sign-Off
  Future<void> verifyPilot(dynamic id, String feedback) async {
    final index = _challenges.indexWhere((c) => c.id.toString() == id.toString());
    if (index >= 0) {
      _challenges[index] = _challenges[index].copyWith(
        status: "RESOLVED",
        citizenVerificationRequested: false,
        citizenFeedbackNotes: feedback,
      );
      notifyListeners();
      await _apiService.verifyPilot(id, feedback);
    }
  }

  // Filters
  void setDomainFilter(String domain) {
    _selectedDomain = domain;
    notifyListeners();
  }

  void setStageFilter(String stage) {
    _selectedStage = stage;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }
}
