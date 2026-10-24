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

  // Seed default data for offline initial view (empty list - genuine data only)
  void initializeWithDefaults() {
    _challenges = [];
    notifyListeners();
  }

  // Load from Backend API
  Future<void> loadChallenges() async {
    _isLoading = true;
    notifyListeners();

    try {
      final list = await _apiService.fetchChallenges();
      _challenges = list;
    } catch (e) {
      _challenges = [];
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
