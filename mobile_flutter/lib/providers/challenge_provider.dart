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
          id: "ADH-2026-1041",
          title: "Deep Hazardous Pothole Cluster and Asphalt Breakdown on Arterial Road",
          description: "Severe road crater and pavement collapse on main commuter thoroughfare. Heavy monsoon runoff has eroded the sub-base, causing severe bike skidding risks and severe traffic bottlenecks.",
          domain: "INFRASTRUCTURE",
          domainName: "Roads & Urban/Rural Infrastructure",
          urgency: "HIGH",
          submitterType: "INDIVIDUAL_CITIZEN",
          submitterName: "Aditya Sharma",
          citizenEmail: "aditya.sharma@adhikar.in",
          district: "North West Delhi",
          block: "Rohini",
          panchayat: "Sector 16",
          locationText: "Outer Ring Road Junction, Rohini Sector 16, Delhi",
          latitude: 28.7499,
          longitude: 77.1170,
          affectedPopulation: 4500,
          status: "PILOT",
          evidenceImageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800",
          upvotes: 48,
          assignedHei: "Delhi Technological University (DTU), Delhi",
          assignedHeiDepartment: "Urban Mobility & Clean Energy Innovation Hub",
          facultyMentor: "Prof. S. K. Garg",
          studentTeam: "CivicTech Pioneers",
          industryPartner: "Smart Cities & Infrastructure Mission",
          prototypeDetails: "Rapid Cold-Mix Polymer Composite Patch",
          pilotResults: "Installed across 40m road crater section; durability verified under heavy bus transit.",
          citizenVerificationRequested: true,
        ),
        ChallengeModel(
          id: "ADH-2026-1042",
          title: "Unattended Solid Waste Garbage Accumulation Near Residential Market",
          description: "Overflowing municipal garbage dump creating severe hygiene risks, foul odor, and street dog menace outside primary school. Requires immediate mechanical clearance and permanent smart segregation bins.",
          domain: "HEALTHCARE",
          domainName: "Sanitation & Public Health",
          urgency: "HIGH",
          submitterType: "COMMUNITY_SHG",
          submitterName: "Pooja Verma",
          citizenEmail: "pooja.verma@adhikar.in",
          district: "Ghaziabad",
          block: "Vijay Nagar",
          panchayat: "Sector 11",
          locationText: "Near ABESIT Campus, NH-09, Vijay Nagar, Ghaziabad",
          latitude: 28.6360,
          longitude: 77.4470,
          affectedPopulation: 2800,
          status: "PROTOTYPE",
          evidenceImageUrl: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800",
          upvotes: 34,
          assignedHei: "ABESIT Group of Institutions, Ghaziabad",
          assignedHeiDepartment: "Smart Infrastructure & Road Materials Lab",
          facultyMentor: "Dr. Hemant Ahuja",
          studentTeam: "Swachh Bharat Innovation Team",
          industryPartner: "Urban Local Body Environmental Fund",
          prototypeDetails: "Solar-Compacting Smart Waste Segregator",
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
