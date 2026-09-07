class AiAnalysisResult {
  final String domain;
  final String domainName;
  final double confidence;
  final String confidencePercent;
  final String urgency;
  final double urgencyScore;
  final UniversityMatch? topMatchedUniversity;
  final List<UniversityMatch> allRankedUniversities;

  AiAnalysisResult({
    required this.domain,
    required this.domainName,
    required this.confidence,
    required this.confidencePercent,
    required this.urgency,
    required this.urgencyScore,
    this.topMatchedUniversity,
    this.allRankedUniversities = const [],
  });

  factory AiAnalysisResult.fromJson(Map<String, dynamic> json) {
    return AiAnalysisResult(
      domain: json['domain'] ?? 'INFRASTRUCTURE',
      domainName: json['domainName'] ?? 'Rural & Urban Infrastructure',
      confidence: (json['confidence'] != null) ? double.parse(json['confidence'].toString()) : 0.85,
      confidencePercent: json['confidencePercent'] ?? '85.0%',
      urgency: json['urgency'] ?? 'MEDIUM',
      urgencyScore: (json['urgencyScore'] != null) ? double.parse(json['urgencyScore'].toString()) : 0.65,
    );
  }
}

class UniversityMatch {
  final dynamic id;
  final String name;
  final String shortName;
  final String city;
  final String state;
  final double distanceKm;
  final String matchScorePercent;
  final double matchScoreNumeric;
  final String specializedLab;
  final String facultyMentor;
  final String rationale;

  UniversityMatch({
    required this.id,
    required this.name,
    required this.shortName,
    required this.city,
    required this.state,
    required this.distanceKm,
    required this.matchScorePercent,
    required this.matchScoreNumeric,
    required this.specializedLab,
    required this.facultyMentor,
    required this.rationale,
  });

  factory UniversityMatch.fromJson(Map<String, dynamic> json) {
    return UniversityMatch(
      id: json['id'] ?? 1,
      name: json['name'] ?? 'BIT Mesra, Ranchi',
      shortName: json['shortName'] ?? 'BIT Mesra',
      city: json['city'] ?? 'Ranchi',
      state: json['state'] ?? 'Jharkhand',
      distanceKm: (json['distanceKm'] != null) ? double.parse(json['distanceKm'].toString()) : 0.0,
      matchScorePercent: json['matchScorePercent'] ?? '94.0%',
      matchScoreNumeric: (json['matchScoreNumeric'] != null) ? double.parse(json['matchScoreNumeric'].toString()) : 94.0,
      specializedLab: json['specializedLab'] ?? 'Clean Water & Rural Innovation FabLab',
      facultyMentor: json['facultyMentor'] ?? 'Dr. Arvind Sharma',
      rationale: json['rationale'] ?? '',
    );
  }
}

class VisionDetectionResult {
  final bool isVisualEvidenceVerified;
  final String? primaryClass;
  final double highestConfidence;
  final String confidencePercent;
  final String? recommendedDomain;
  final String? suggestedHei;
  final String? message;
  final bool safetyFailed;

  VisionDetectionResult({
    required this.isVisualEvidenceVerified,
    this.primaryClass,
    this.highestConfidence = 0.0,
    this.confidencePercent = '0%',
    this.recommendedDomain,
    this.suggestedHei,
    this.message,
    this.safetyFailed = false,
  });

  factory VisionDetectionResult.fromJson(Map<String, dynamic> json) {
    return VisionDetectionResult(
      isVisualEvidenceVerified: json['isVisualEvidenceVerified'] ?? false,
      primaryClass: json['primaryClass'],
      highestConfidence: (json['highestConfidence'] != null) ? double.parse(json['highestConfidence'].toString()) : 0.0,
      confidencePercent: json['confidencePercent'] ?? '0%',
      recommendedDomain: json['recommendedDomain'],
      suggestedHei: json['suggestedHei'],
      message: json['message'],
      safetyFailed: json['safetyFailed'] ?? false,
    );
  }
}
