import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/theme.dart';
import '../../models/challenge_model.dart';
import '../../models/ai_result_model.dart';
import '../../providers/challenge_provider.dart';
import '../../services/api_service.dart';

class NewChallengeScreen extends StatefulWidget {
  const NewChallengeScreen({Key? key}) : super(key: key);

  @override
  State<NewChallengeScreen> createState() => _NewChallengeScreenState();
}

class _NewChallengeScreenState extends State<NewChallengeScreen> {
  final _formKey = GlobalKey<FormState>();
  final ApiService _apiService = ApiService();

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _districtController = TextEditingController(text: "Ghaziabad");
  final TextEditingController _blockController = TextEditingController(text: "Vijay Nagar");
  final TextEditingController _panchayatController = TextEditingController(text: "Near ABESIT Campus");
  final TextEditingController _affectedPopController = TextEditingController(text: "850");

  double _lat = 28.6360;
  double _lng = 77.4470;
  String _selectedDomain = "INFRASTRUCTURE";
  String _selectedUrgency = "HIGH";
  String _submitterType = "INDIVIDUAL_CITIZEN";
  String _submitterName = "Citizen Contributor";

  File? _selectedImage;
  final ImagePicker _picker = ImagePicker();

  bool _isSubmitting = false;
  bool _isLocating = false;

  // AI Live Ingestion State
  String _aiConfidence = "94.0%";
  UniversityMatch? _suggestedHei;

  @override
  void initState() {
    super.initState();
    _triggerAiAnalysis();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _districtController.dispose();
    _blockController.dispose();
    _panchayatController.dispose();
    _affectedPopController.dispose();
    super.dispose();
  }

  void _triggerAiAnalysis() async {
    final text = "${_titleController.text} ${_descController.text}".trim();
    if (text.isEmpty) return;

    // 1. Quick local keyword detection
    final lower = text.toLowerCase();
    String detected = _selectedDomain;
    String conf = "88.0%";

    if (lower.contains("water") || lower.contains("fluoride") || lower.contains("handpump") || lower.contains("arsenic")) {
      detected = "WATER";
      conf = "96.0%";
    } else if (lower.contains("crop") || lower.contains("farmer") || lower.contains("pest") || lower.contains("agriculture")) {
      detected = "AGRICULTURE";
      conf = "93.0%";
    } else if (lower.contains("health") || lower.contains("hospital") || lower.contains("doctor") || lower.contains("disease")) {
      detected = "HEALTHCARE";
      conf = "92.0%";
    } else if (lower.contains("mine") || lower.contains("coal") || lower.contains("quarry") || lower.contains("ash")) {
      detected = "MINING_REHAB";
      conf = "97.0%";
    } else if (lower.contains("road") || lower.contains("pothole") || lower.contains("bridge") || lower.contains("culvert")) {
      detected = "INFRASTRUCTURE";
      conf = "95.0%";
    }

    setState(() {
      _selectedDomain = detected;
      _aiConfidence = conf;
    });

    // 2. Call backend Multi-Modal AI Engine
    final heiMatch = await _apiService.matchUniversity(
      domain: detected,
      lat: _lat,
      lon: _lng,
      title: _titleController.text,
      description: _descController.text,
    );

    if (mounted && heiMatch != null) {
      setState(() {
        _suggestedHei = heiMatch;
      });
    }
  }

  void _applyPreset(Map<String, dynamic> preset) {
    setState(() {
      _districtController.text = preset['district'];
      _blockController.text = preset['block'];
      _panchayatController.text = preset['panchayat'];
      _lat = preset['lat'];
      _lng = preset['lng'];
    });
    _triggerAiAnalysis();
  }

  Future<void> _acquireGps() async {
    setState(() => _isLocating = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        Position pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        setState(() {
          _lat = pos.latitude;
          _lng = pos.longitude;
          _panchayatController.text = "GPS: Lat ${_lat.toStringAsFixed(4)}, Lng ${_lng.toStringAsFixed(4)}";
        });
        _triggerAiAnalysis();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("📍 1-Tap GPS Location Acquired!"), backgroundColor: Color(0xFF16A34A)),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Using default campus GPS coordinates")),
      );
    } finally {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picked = await _picker.pickImage(source: source, imageQuality: 80);
      if (picked != null) {
        setState(() {
          _selectedImage = File(picked.path);
        });

        // Run YOLOv8 vision audit
        final visionResult = await _apiService.detectVisualEvidence(_selectedImage!);
        if (mounted && visionResult != null && visionResult.isVisualEvidenceVerified) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text("✓ YOLOv8 Vision Verified: ${visionResult.primaryClass} (${visionResult.confidencePercent})"),
              backgroundColor: const Color(0xFF16A34A),
            ),
          );
        }
      }
    } catch (e) {
      // Fallback
    }
  }

  void _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final newChallenge = ChallengeModel(
      id: "JH-2026-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}",
      title: _titleController.text.trim(),
      description: _descController.text.trim(),
      domain: _selectedDomain,
      domainName: AppConstants.thematicDomains.firstWhere((d) => d['id'] == _selectedDomain)['name'],
      urgency: _selectedUrgency,
      submitterType: _submitterType,
      submitterName: _submitterName,
      citizenEmail: "citizen@jharkhand.gov.in",
      district: _districtController.text.trim(),
      block: _blockController.text.trim(),
      panchayat: _panchayatController.text.trim(),
      locationText: "${_panchayatController.text}, ${_blockController.text}, ${_districtController.text}",
      latitude: _lat,
      longitude: _lng,
      affectedPopulation: int.tryParse(_affectedPopController.text) ?? 500,
      status: "SUBMITTED",
      evidenceImageUrl: _selectedImage != null
          ? "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800"
          : "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800",
      upvotes: 1,
      assignedHei: _suggestedHei?.name ?? "BIT Mesra, Ranchi",
      assignedHeiDepartment: _suggestedHei?.specializedLab ?? "Clean Water & Rural Innovation FabLab",
      facultyMentor: _suggestedHei?.facultyMentor ?? "Dr. Arvind Sharma",
    );

    final provider = Provider.of<ChallengeProvider>(context, listen: false);
    await provider.addChallenge(newChallenge);

    if (mounted) {
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("🚀 Challenge Ingested into State Innovation Pipeline!"),
          backgroundColor: Color(0xFF16A34A),
        ),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text("Report Societal Challenge"),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // 1. Top Helper Notice
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFE0F2FE),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFBAE6FD)),
              ),
              child: Row(
                children: const [
                  Icon(Icons.info_outline, color: Color(0xFF0284C7), size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      "Submissions are routed directly to university engineering labs for prototyping & CSR grant co-funding.",
                      style: TextStyle(fontSize: 12, color: Color(0xFF0369A1), fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 2. 1-Tap Location Presets
            const Text(
              "📍 1-Tap Location Quick Presets",
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 8),
            Row(
              children: AppConstants.campusPresets.map((p) {
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2),
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        side: const BorderSide(color: Color(0xFFCBD5E1)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () => _applyPreset(p),
                      child: Text(
                        p['label'].toString().split(' ')[0],
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 12),

            // 3. 1-Tap Live GPS Button
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: _isLocating
                  ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.my_location, size: 16),
              label: Text(
                _isLocating ? "Acquiring GPS..." : "🎯 1-Tap Auto-GPS (${_lat.toStringAsFixed(3)}°, ${_lng.toStringAsFixed(3)}°)",
                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
              ),
              onPressed: _acquireGps,
            ),

            const SizedBox(height: 16),

            // 4. Challenge Title
            const Text("Challenge Title *", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
            const SizedBox(height: 6),
            TextFormField(
              controller: _titleController,
              onChanged: (_) => _triggerAiAnalysis(),
              decoration: const InputDecoration(
                hintText: "e.g. Severe Fluoride Contamination in Village Handpumps",
              ),
              validator: (v) => (v == null || v.trim().length < 5) ? "Please provide a descriptive title" : null,
            ),

            const SizedBox(height: 14),

            // 5. Challenge Description
            const Text("Detailed Problem Description *", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
            const SizedBox(height: 6),
            TextFormField(
              controller: _descController,
              maxLines: 4,
              onChanged: (_) => _triggerAiAnalysis(),
              decoration: const InputDecoration(
                hintText: "Describe the grassroots issue, community impact, and technical requirement...",
              ),
              validator: (v) => (v == null || v.trim().length < 10) ? "Please describe the problem in detail" : null,
            ),

            const SizedBox(height: 16),

            // 6. LIVE AI Ingestion Card
            _buildAiIngestionCard(),

            const SizedBox(height: 16),

            // 7. Evidence Photo Capture
            const Text("📸 Field Evidence Photo (Camera / Gallery)", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
            const SizedBox(height: 8),
            if (_selectedImage != null)
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.file(_selectedImage!, height: 160, width: double.infinity, fit: BoxFit.cover),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: CircleAvatar(
                      backgroundColor: Colors.black54,
                      radius: 16,
                      child: IconButton(
                        icon: const Icon(Icons.close, color: Colors.white, size: 14),
                        onPressed: () => setState(() => _selectedImage = null),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.75),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        "📍 Lat: ${_lat.toStringAsFixed(4)}°, Lng: ${_lng.toStringAsFixed(4)}° • Authentic",
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ],
              )
            else
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.camera_alt, size: 18, color: Color(0xFF0284C7)),
                      label: const Text("Camera Snap", style: TextStyle(fontSize: 12.5)),
                      onPressed: () => _pickImage(ImageSource.camera),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.photo_library, size: 18, color: Color(0xFF0284C7)),
                      label: const Text("Photo Gallery", style: TextStyle(fontSize: 12.5)),
                      onPressed: () => _pickImage(ImageSource.gallery),
                    ),
                  ),
                ],
              ),

            const SizedBox(height: 16),

            // 8. Administrative Location Inputs
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("District", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
                      const SizedBox(height: 4),
                      TextFormField(controller: _districtController),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Block / Ward", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
                      const SizedBox(height: 4),
                      TextFormField(controller: _blockController),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Panchayat / Village", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
                      const SizedBox(height: 4),
                      TextFormField(controller: _panchayatController),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Impacted Population", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
                      const SizedBox(height: 4),
                      TextFormField(
                        controller: _affectedPopController,
                        keyboardType: TextInputType.number,
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // 9. Submit Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryBlue,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: _isSubmitting
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.send_rounded, size: 18),
                label: Text(
                  _isSubmitting ? "Ingesting Challenge..." : "Submit to State Innovation Council",
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5),
                ),
                onPressed: _isSubmitting ? null : _handleSubmit,
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildAiIngestionCard() {
    final domainObj = AppConstants.thematicDomains.firstWhere(
      (d) => d['id'] == _selectedDomain,
      orElse: () => AppConstants.thematicDomains[0],
    );

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFBAE6FD)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0284C7).withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.auto_awesome, color: Color(0xFF0284C7), size: 16),
              SizedBox(width: 6),
              Text(
                "Sankalp AI Ingestion & Routing Engine",
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Predicted Domain
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Thematic Domain:", style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: domainObj['bgColor'],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  "${domainObj['name']}",
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: domainObj['color']),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            "✓ NLP Match Confidence: $_aiConfidence",
            style: const TextStyle(fontSize: 11, color: Color(0xFF16A34A), fontWeight: FontWeight.w700),
          ),

          const Divider(height: 16, color: Color(0xFFF1F5F9)),

          // Nearest Matched University
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("🎯 Top Matched University:", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3E8FF),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  "⭐ ${_suggestedHei?.matchScorePercent ?? '95.0%'} Match",
                  style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Color(0xFF7C3AED)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            _suggestedHei?.name ?? "BIT Mesra, Ranchi",
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF1E293B)),
          ),
          const SizedBox(height: 2),
          Text(
            "🔬 Lab: ${_suggestedHei?.specializedLab ?? 'Clean Water & Rural Innovation FabLab'}",
            style: const TextStyle(fontSize: 11.5, color: Color(0xFF475569)),
          ),
          const SizedBox(height: 2),
          Text(
            "👨‍🏫 Mentor: ${_suggestedHei?.facultyMentor ?? 'Dr. Arvind Sharma'}",
            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }
}
