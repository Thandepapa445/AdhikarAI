import '../core/constants.dart';

class ChallengeModel {
  final dynamic id;
  final String title;
  final String description;
  final String domain;
  final String domainName;
  final String urgency;
  final String submitterType;
  final String submitterName;
  final String citizenEmail;
  final String district;
  final String block;
  final String panchayat;
  final String locationText;
  final double latitude;
  final double longitude;
  final int affectedPopulation;
  final String status;
  final String evidenceImageUrl;
  final int upvotes;
  final String? assignedHei;
  final String? assignedHeiDepartment;
  final String? facultyMentor;
  final String? studentTeam;
  final String? industryPartner;
  final String? prototypeDetails;
  final String? pilotResults;
  final bool citizenVerificationRequested;
  final String? citizenFeedbackNotes;
  final String? createdAt;
  final String? updatedAt;

  ChallengeModel({
    required this.id,
    required this.title,
    required this.description,
    required this.domain,
    required this.domainName,
    required this.urgency,
    required this.submitterType,
    required this.submitterName,
    required this.citizenEmail,
    required this.district,
    required this.block,
    required this.panchayat,
    required this.locationText,
    required this.latitude,
    required this.longitude,
    required this.affectedPopulation,
    required this.status,
    required this.evidenceImageUrl,
    required this.upvotes,
    this.assignedHei,
    this.assignedHeiDepartment,
    this.facultyMentor,
    this.studentTeam,
    this.industryPartner,
    this.prototypeDetails,
    this.pilotResults,
    this.citizenVerificationRequested = false,
    this.citizenFeedbackNotes,
    this.createdAt,
    this.updatedAt,
  });

  factory ChallengeModel.fromJson(Map<String, dynamic> json) {
    return ChallengeModel(
      id: json['id'] ?? 'JH-${DateTime.now().millisecondsSinceEpoch}',
      title: json['title'] ?? 'Community Challenge',
      description: json['description'] ?? '',
      domain: json['domain'] ?? 'INFRASTRUCTURE',
      domainName: json['domainName'] ?? 'Rural & Urban Infrastructure',
      urgency: json['urgency'] ?? 'MEDIUM',
      submitterType: json['submitterType'] ?? 'INDIVIDUAL_CITIZEN',
      submitterName: json['submitterName'] ?? 'Local Citizen',
      citizenEmail: json['citizenEmail'] ?? 'citizen@jharkhand.gov.in',
      district: json['district'] ?? 'Ghaziabad',
      block: json['block'] ?? 'Vijay Nagar',
      panchayat: json['panchayat'] ?? 'Local Ward',
      locationText: json['locationText'] ?? '',
      latitude: (json['latitude'] != null) ? double.parse(json['latitude'].toString()) : 28.6360,
      longitude: (json['longitude'] != null) ? double.parse(json['longitude'].toString()) : 77.4470,
      affectedPopulation: json['affectedPopulation'] ?? 500,
      status: json['status'] ?? 'SUBMITTED',
      evidenceImageUrl: json['evidenceImageUrl'] ?? 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800',
      upvotes: json['upvotes'] ?? 1,
      assignedHei: json['assignedHei'],
      assignedHeiDepartment: json['assignedHeiDepartment'],
      facultyMentor: json['facultyMentor'],
      studentTeam: json['studentTeam'],
      industryPartner: json['industryPartner'],
      prototypeDetails: json['prototypeDetails'],
      pilotResults: json['pilotResults'],
      citizenVerificationRequested: json['citizenVerificationRequested'] ?? false,
      citizenFeedbackNotes: json['citizenFeedbackNotes'],
      createdAt: json['createdAt'] ?? DateTime.now().toIso8601String(),
      updatedAt: json['updatedAt'] ?? DateTime.now().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'domain': domain,
      'domainName': domainName,
      'urgency': urgency,
      'submitterType': submitterType,
      'submitterName': submitterName,
      'citizenEmail': citizenEmail,
      'district': district,
      'block': block,
      'panchayat': panchayat,
      'locationText': locationText,
      'latitude': latitude,
      'longitude': longitude,
      'affectedPopulation': affectedPopulation,
      'status': status,
      'evidenceImageUrl': evidenceImageUrl,
      'upvotes': upvotes,
      'assignedHei': assignedHei,
      'assignedHeiDepartment': assignedHeiDepartment,
      'facultyMentor': facultyMentor,
      'studentTeam': studentTeam,
      'industryPartner': industryPartner,
      'prototypeDetails': prototypeDetails,
      'pilotResults': pilotResults,
      'citizenVerificationRequested': citizenVerificationRequested,
      'citizenFeedbackNotes': citizenFeedbackNotes,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  ChallengeModel copyWith({
    String? status,
    int? upvotes,
    String? assignedHei,
    String? assignedHeiDepartment,
    String? facultyMentor,
    String? prototypeDetails,
    String? pilotResults,
    bool? citizenVerificationRequested,
    String? citizenFeedbackNotes,
  }) {
    return ChallengeModel(
      id: id,
      title: title,
      description: description,
      domain: domain,
      domainName: domainName,
      urgency: urgency,
      submitterType: submitterType,
      submitterName: submitterName,
      citizenEmail: citizenEmail,
      district: district,
      block: block,
      panchayat: panchayat,
      locationText: locationText,
      latitude: latitude,
      longitude: longitude,
      affectedPopulation: affectedPopulation,
      status: status ?? this.status,
      evidenceImageUrl: evidenceImageUrl,
      upvotes: upvotes ?? this.upvotes,
      assignedHei: assignedHei ?? this.assignedHei,
      assignedHeiDepartment: assignedHeiDepartment ?? this.assignedHeiDepartment,
      facultyMentor: facultyMentor ?? this.facultyMentor,
      studentTeam: studentTeam ?? this.studentTeam,
      industryPartner: industryPartner ?? this.industryPartner,
      prototypeDetails: prototypeDetails ?? this.prototypeDetails,
      pilotResults: pilotResults ?? this.pilotResults,
      citizenVerificationRequested: citizenVerificationRequested ?? this.citizenVerificationRequested,
      citizenFeedbackNotes: citizenFeedbackNotes ?? this.citizenFeedbackNotes,
      createdAt: createdAt,
      updatedAt: DateTime.now().toIso8601String(),
    );
  }

  int get currentStageIndex {
    final idx = AppConstants.stagesOfInnovation.indexWhere((s) => s['key'] == status);
    return idx >= 0 ? idx : 0;
  }
}
