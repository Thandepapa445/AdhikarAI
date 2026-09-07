import 'dart:io';
import 'package:dio/dio.dart';
import '../core/constants.dart';
import '../models/challenge_model.dart';
import '../models/ai_result_model.dart';

class ApiService {
  final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 6),
      receiveTimeout: const Duration(seconds: 6),
      headers: {"Content-Type": "application/json"},
    ),
  );

  // 1. Fetch All Challenges
  Future<List<ChallengeModel>> fetchChallenges() async {
    try {
      final res = await _dio.get('${AppConstants.apiBaseUrl}/challenges');
      if (res.statusCode == 200 && res.data is List) {
        return (res.data as List).map((c) => ChallengeModel.fromJson(c)).toList();
      }
    } catch (e) {
      // Fallback
    }
    return [];
  }

  // 2. Submit New Challenge
  Future<ChallengeModel?> submitChallenge(ChallengeModel challenge) async {
    try {
      final res = await _dio.post(
        '${AppConstants.apiBaseUrl}/challenges',
        data: challenge.toJson(),
      );
      if (res.statusCode == 200 && res.data != null) {
        return ChallengeModel.fromJson(res.data);
      }
    } catch (e) {
      // Return local entity if offline
    }
    return challenge;
  }

  // 3. Update Challenge Stage
  Future<ChallengeModel?> updateStatus(dynamic id, String status, {Map<String, dynamic>? extra}) async {
    try {
      final payload = {"status": status, ...?extra};
      final res = await _dio.put(
        '${AppConstants.apiBaseUrl}/challenges/$id/status',
        data: payload,
      );
      if (res.statusCode == 200 && res.data != null) {
        return ChallengeModel.fromJson(res.data);
      }
    } catch (e) {
      // Fallback
    }
    return null;
  }

  // 4. Upvote Challenge
  Future<bool> upvoteChallenge(dynamic id) async {
    try {
      final res = await _dio.post('${AppConstants.apiBaseUrl}/challenges/$id/upvote');
      return res.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // 5. Citizen Field Pilot Verification Sign-Off
  Future<bool> verifyPilot(dynamic id, String feedback) async {
    try {
      final res = await _dio.post(
        '${AppConstants.apiBaseUrl}/challenges/$id/verify-pilot',
        data: {"feedback": feedback},
      );
      return res.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // 6. Python AI Multi-Modal NLP Analysis
  Future<AiAnalysisResult?> analyzeNlp(String text) async {
    try {
      final res = await _dio.post(
        '${AppConstants.aiServiceUrl}/analyze-challenge',
        data: {"text": text},
      );
      if (res.statusCode == 200 && res.data != null) {
        return AiAnalysisResult.fromJson(res.data);
      }
    } catch (e) {
      // Local heuristic fallback
    }
    return null;
  }

  // 7. Multi-Factor Spatial HEI Matching
  Future<UniversityMatch?> matchUniversity({
    required String domain,
    required double lat,
    required double lon,
    required String title,
    required String description,
  }) async {
    try {
      final res = await _dio.post(
        '${AppConstants.aiServiceUrl}/match-university',
        data: {
          "domain": domain,
          "latitude": lat,
          "longitude": lon,
          "title": title,
          "description": description,
        },
      );
      if (res.statusCode == 200 && res.data != null && res.data['topMatch'] != null) {
        return UniversityMatch.fromJson(res.data['topMatch']);
      }
    } catch (e) {
      // Fallback
    }
    return null;
  }

  // 8. YOLOv8 Civic Hazard Vision Audit & Safety Check
  Future<VisionDetectionResult?> detectVisualEvidence(File imageFile) async {
    try {
      String fileName = imageFile.path.split('/').last;
      FormData formData = FormData.fromMap({
        "file": await MultipartFile.fromFile(imageFile.path, filename: fileName),
      });

      final res = await _dio.post(
        '${AppConstants.aiServiceUrl}/detect',
        data: formData,
      );
      if (res.statusCode == 200 && res.data != null) {
        return VisionDetectionResult.fromJson(res.data);
      }
    } catch (e) {
      // Fallback
    }
    return null;
  }
}
