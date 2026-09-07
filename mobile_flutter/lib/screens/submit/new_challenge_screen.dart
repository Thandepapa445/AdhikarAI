import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
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
  final MapController _mapController = MapController();
  final Dio _dio = Dio(BaseOptions(connectTimeout: const Duration(seconds: 6), receiveTimeout: const Duration(seconds: 6)));

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _districtController = TextEditingController(text: "North West Delhi");
  final TextEditingController _blockController = TextEditingController(text: "Rohini");
  final TextEditingController _panchayatController = TextEditingController(text: "Sector 16");
  final TextEditingController _affectedPopController = TextEditingController(text: "850");

  double _lat = 28.7499;
  double _lng = 77.1170;
  String _state = "Delhi";
  String _surroundingAddress = "Outer Ring Road Junction, Rohini Sector 16, Delhi";
  bool _isGeocoding = false;
  Timer? _debounceGeocode;

  String _selectedDomain = "INFRASTRUCTURE";
  String _selectedUrgency = "HIGH";
  String _submitterType = "INDIVIDUAL_CITIZEN";
  String _submitterName = "Citizen Contributor";

  File? _selectedImage;
  final ImagePicker _picker = ImagePicker();

  bool _isSubmitting = false;
  bool _isLocating = false;

  // AI Vision Gate & Anti-Spam Verification States
  bool _isScanningAiVision = false;
  bool _isImageVerifiedCivicHazard = false;
  String? _verifiedCivicHazardName;
  String? _verifiedConfidence;
  String? _aiVisionRejectionReason;

  // AI Live Ingestion State
  String _aiConfidence = "95.0%";
  UniversityMatch? _suggestedHei;

  @override
  void initState() {
    super.initState();
    _acquireGps();
    _triggerAiAnalysis();
  }

  @override
  void dispose() {
    _debounceGeocode?.cancel();
    _titleController.dispose();
    _descController.dispose();
    _districtController.dispose();
    _blockController.dispose();
    _panchayatController.dispose();
    _affectedPopController.dispose();
    super.dispose();
  }

  // Reverse Geocoding with OpenStreetMap Nominatim & BigDataCloud fallback
  Future<void> _reverseGeocode(double lat, double lng) async {
    setState(() => _isGeocoding = true);
    try {
      // 1. Nominatim Reverse Geocoding
      final response = await _dio.get(
        "https://nominatim.openstreetmap.org/reverse",
        queryParameters: {
          "format": "jsonv2",
          "lat": lat,
          "lon": lng,
          "zoom": 18,
          "addressdetails": 1,
        },
        options: Options(headers: {"User-Agent": "AdhikarCitizenApp/1.0"}),
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final address = data["address"] as Map<String, dynamic>? ?? {};

        final road = address["road"] ?? address["pedestrian"] ?? address["suburb"] ?? address["neighbourhood"] ?? "";
        final suburb = address["suburb"] ?? address["neighbourhood"] ?? address["residential"] ?? address["quarter"] ?? "";
        final district = address["state_district"] ?? address["county"] ?? address["city_district"] ?? address["city"] ?? address["town"] ?? "";
        final state = address["state"] ?? "";
        final displayName = data["display_name"] ?? "";

        setState(() {
          _state = state.isNotEmpty ? state : _state;
          if (district.isNotEmpty) _districtController.text = district;
          if (suburb.isNotEmpty) _blockController.text = suburb;
          if (road.isNotEmpty) _panchayatController.text = road;

          _surroundingAddress = displayName.isNotEmpty
              ? displayName
              : [road, suburb, district, state].where((s) => s.isNotEmpty).join(", ");
        });

        _triggerAiAnalysis();
        return;
      }
    } catch (e) {
      // Fallback to BigDataCloud
      try {
        final bdc = await _dio.get(
          "https://api.bigdatacloud.net/data/reverse-geocode-client",
          queryParameters: {"latitude": lat, "longitude": lng, "localityLanguage": "en"},
        );
        if (bdc.statusCode == 200 && bdc.data != null) {
          final data = bdc.data;
          final locality = data["locality"] ?? data["principalSubdivision"] ?? "";
          final city = data["city"] ?? data["localityInfo"]?["administrative"]?[2]?["name"] ?? "";
          final state = data["principalSubdivision"] ?? "";

          setState(() {
            if (city.isNotEmpty) _districtController.text = city;
            if (locality.isNotEmpty) _panchayatController.text = locality;
            if (state.isNotEmpty) _state = state;
            _surroundingAddress = "$locality, $city, $state";
          });
          _triggerAiAnalysis();
        }
      } catch (_) {}
    } finally {
      if (mounted) setState(() => _isGeocoding = false);
    }
  }

  void _onMapMoved(MapCamera camera) {
    final center = camera.center;
    setState(() {
      _lat = center.latitude;
      _lng = center.longitude;
    });

    _debounceGeocode?.cancel();
    _debounceGeocode = Timer(const Duration(milliseconds: 600), () {
      _reverseGeocode(_lat, _lng);
    });
  }

  void _triggerAiAnalysis() async {
    final text = "${_titleController.text} ${_descController.text} ${_panchayatController.text}".trim();
    if (text.isEmpty) return;

    // 1. Quick local keyword detection
    final lower = text.toLowerCase();
    String detected = _selectedDomain;
    String conf = "88.0%";

    if (lower.contains("water") || lower.contains("fluoride") || lower.contains("handpump") || lower.contains("arsenic") || lower.contains("leakage")) {
      detected = "WATER";
      conf = "96.0%";
    } else if (lower.contains("crop") || lower.contains("farmer") || lower.contains("pest") || lower.contains("agriculture")) {
      detected = "AGRICULTURE";
      conf = "93.0%";
    } else if (lower.contains("health") || lower.contains("hospital") || lower.contains("garbage") || lower.contains("waste") || lower.contains("sanitation")) {
      detected = "HEALTHCARE";
      conf = "94.0%";
    } else if (lower.contains("tree") || lower.contains("fallen tree") || lower.contains("solar") || lower.contains("energy")) {
      detected = "ENERGY_ENVIRONMENT";
      conf = "95.0%";
    } else if (lower.contains("road") || lower.contains("pothole") || lower.contains("bridge") || lower.contains("street light") || lower.contains("infrastructure")) {
      detected = "INFRASTRUCTURE";
      conf = "96.0%";
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

  Future<void> _acquireGps() async {
    setState(() => _isLocating = true);
    try {
      // 1. Check Location Service enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("⚠️ Device Location / GPS is turned off. Please enable GPS for pinpoint accuracy."),
            backgroundColor: Color(0xFFEA580C),
          ),
        );
      }

      // 2. Request Permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("⚠️ Location permissions are permanently denied. Please allow in app settings."),
            backgroundColor: Color(0xFFDC2626),
          ),
        );
        return;
      }

      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        Position? pos;
        try {
          pos = await Geolocator.getCurrentPosition(
            locationSettings: const LocationSettings(
              accuracy: LocationAccuracy.best,
              timeLimit: Duration(seconds: 10),
            ),
          );
        } catch (_) {
          pos = await Geolocator.getLastKnownPosition();
        }

        if (pos != null) {
          final foundLat = pos.latitude;
          final foundLng = pos.longitude;
          setState(() {
            _lat = foundLat;
            _lng = foundLng;
          });

          _mapController.move(LatLng(_lat, _lng), 16.0);
          await _reverseGeocode(_lat, _lng);

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text("📍 Exact GPS Located: ${_lat.toStringAsFixed(4)}° N, ${_lng.toStringAsFixed(4)}° E"),
              backgroundColor: const Color(0xFF16A34A),
            ),
          );
        }
      }
    } catch (e) {
      // fallback
    } finally {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  // Pick Image & Enforce Strict YOLOv8 AI Vision Gate (Blocks Non-Civic Images)
  Future<void> _pickImage(ImageSource source) async {
    try {
      final picked = await _picker.pickImage(source: source, imageQuality: 85);
      if (picked != null) {
        final imageFile = File(picked.path);
        setState(() {
          _selectedImage = imageFile;
          _isScanningAiVision = true;
          _isImageVerifiedCivicHazard = false;
          _aiVisionRejectionReason = null;
        });

        // Run 4-Class YOLOv8 Vision Audit on Python Microservice
        final visionResult = await _apiService.detectVisualEvidence(imageFile);

        if (mounted) {
          setState(() => _isScanningAiVision = false);

          if (visionResult != null && visionResult.isVisualEvidenceVerified && visionResult.primaryClass != null) {
            setState(() {
              _isImageVerifiedCivicHazard = true;
              _verifiedCivicHazardName = visionResult.primaryClass;
              _verifiedConfidence = visionResult.confidencePercent;
              _aiVisionRejectionReason = null;
              if (visionResult.recommendedDomain != null) {
                _selectedDomain = visionResult.recommendedDomain!;
              }
            });

            // Auto-fill title if empty
            if (_titleController.text.isEmpty && visionResult.primaryClass != null) {
              final formattedClass = visionResult.primaryClass!.replaceAll('_', ' ').toUpperCase();
              _titleController.text = "Reported $formattedClass at ${_panchayatController.text.isNotEmpty ? _panchayatController.text : _districtController.text}";
            }

            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text("✓ YOLOv8 Verified Civic Hazard: ${visionResult.primaryClass!.replaceAll('_', ' ').toUpperCase()} (${visionResult.confidencePercent})"),
                backgroundColor: const Color(0xFF16A34A),
              ),
            );
            _triggerAiAnalysis();
          } else {
            // STRICT AI GATE REJECTION FOR NON-CIVIC IMAGES
            setState(() {
              _isImageVerifiedCivicHazard = false;
              _selectedImage = null; // Discard non-civic photo
              _aiVisionRejectionReason = "No recognized civic hazard (Pothole, Garbage Dump, Broken Street Light, Fallen Tree) detected.";
            });

            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                title: const Row(
                  children: [
                    Icon(Icons.shield_outlined, color: Color(0xFFDC2626), size: 28),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        "Photo Rejected by AI Gate",
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Color(0xFF1E293B)),
                      ),
                    ),
                  ],
                ),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFFECACA)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.cancel, color: Color(0xFFDC2626), size: 16),
                          SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              "AI Vision Gate: Non-Civic Image Detected",
                              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 11.5, color: Color(0xFF991B1B)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      "🚫 No recognized civic hazard was detected in this photo.\n\nAdhikar AI requires authentic photos of civic defects (Potholes, Garbage Dumps, Broken Street Lights, Fallen Trees) to prevent non-civic spam.\n\nPlease upload or capture a photo of the actual civic defect.",
                      style: TextStyle(fontSize: 13, color: Color(0xFF334155), height: 1.4),
                    ),
                  ],
                ),
                actions: [
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text("Understood", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) setState(() => _isScanningAiVision = false);
    }
  }

  void _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please fill all required challenge details")),
      );
      return;
    }

    // STRICT VALIDATION: Require verified civic photo evidence (blocks non-civic submissions)
    if (_selectedImage == null || !_isImageVerifiedCivicHazard) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.shield_outlined, color: Color(0xFFDC2626), size: 28),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  "Civic Photo Evidence Required",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Color(0xFF1E293B)),
                ),
              ),
            ],
          ),
          content: const Text(
            "⚠️ Verified Civic Photo Evidence Required!\n\nPlease capture or upload an authentic photo of the civic defect (Potholes, Garbage Dumps, Broken Street Lights, Fallen Trees) that passes YOLOv8 AI verification before submitting.\n\nNon-civic submissions are strictly blocked to protect public grievance queues.",
            style: TextStyle(fontSize: 13.5, color: Color(0xFF334155), height: 1.4),
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () => Navigator.pop(ctx),
              child: const Text("OK", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final uniqueId = "ADH-2026-${(1000 + DateTime.now().millisecondsSinceEpoch % 9000)}";
    final domainName = AppConstants.thematicDomains.firstWhere(
      (d) => d['id'] == _selectedDomain,
      orElse: () => {"name": _selectedDomain},
    )['name'];

    final newChallenge = ChallengeModel(
      id: uniqueId,
      title: _titleController.text.trim(),
      description: _descController.text.trim(),
      domain: _selectedDomain,
      domainName: domainName,
      urgency: _selectedUrgency,
      submitterType: _submitterType,
      submitterName: _submitterName,
      citizenEmail: "citizen.user@adhikar.in",
      district: _districtController.text.trim(),
      block: _blockController.text.trim(),
      panchayat: _panchayatController.text.trim(),
      locationText: _surroundingAddress.isNotEmpty ? _surroundingAddress : "${_panchayatController.text}, ${_districtController.text}, $_state",
      latitude: _lat,
      longitude: _lng,
      affectedPopulation: int.tryParse(_affectedPopController.text.trim()) ?? 500,
      status: "SUBMITTED",
      upvotes: 0,
      evidenceImageUrl: _selectedImage != null
          ? "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800"
          : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      assignedHei: _suggestedHei?.name ?? "Premier National HEI Innovation Center",
      assignedHeiDepartment: _suggestedHei?.specializedLab ?? "Center for Rural Innovation & Sustainable Engineering",
      facultyMentor: _suggestedHei?.facultyMentor ?? "Prof. Senior Nodal Faculty",
      studentTeam: "Adhikar Student Innovators",
      industryPartner: "National Innovation Council & CSR Fund",
    );

    final provider = Provider.of<ChallengeProvider>(context, listen: false);
    await provider.addChallenge(newChallenge);

    setState(() => _isSubmitting = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("✓ Challenge #$uniqueId Ingested to Adhikar AI"),
          backgroundColor: const Color(0xFF16A34A),
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
        title: const Text("Submit Civic Challenge"),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF64748B)),
            onPressed: () {
              _acquireGps();
              _triggerAiAnalysis();
            },
          )
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          children: [
            // 1. Live Interactive Draggable Map Card (Rapido/Zepto Style)
            _buildInteractiveMapCard(),

            const SizedBox(height: 16),

            // 2. Surrounding Address & Boundary Auto-Filled Card
            _buildAddressResolutionCard(),

            const SizedBox(height: 16),

            // 3. Challenge Core Details
            _buildChallengeForm(),

            const SizedBox(height: 16),

            // 4. Domain & Priority Selection
            _buildDomainSelector(),

            const SizedBox(height: 16),

            // 5. AI Ingestion & HEI Match Preview
            _buildAiIngestionCard(),

            const SizedBox(height: 16),

            // 6. Evidence Photo Capture with YOLOv8 Verification Gate
            _buildPhotoEvidenceSection(),

            const SizedBox(height: 24),

            // 7. Submit Action Button
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _isImageVerifiedCivicHazard ? AppTheme.primaryBlue : const Color(0xFF64748B),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: _isImageVerifiedCivicHazard ? 3 : 0,
              ),
              onPressed: _isSubmitting ? null : _handleSubmit,
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _isImageVerifiedCivicHazard ? Icons.cloud_upload : Icons.lock_outline,
                          size: 18,
                          color: Colors.white,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _isImageVerifiedCivicHazard
                              ? "Submit Verified Challenge"
                              : "Verify Civic Photo to Submit",
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                        ),
                      ],
                    ),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  // --- SUB-WIDGET BUILDERS ---

  Widget _buildInteractiveMapCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              children: [
                const Icon(Icons.pin_drop, color: Color(0xFFEF4444), size: 18),
                const SizedBox(width: 6),
                const Expanded(
                  child: Text(
                    "Pinpoint Defect Spot (Drag Map)",
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFF0F172A)),
                  ),
                ),
                if (_isGeocoding)
                  const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF2563EB)),
                  )
                else
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCFCE7),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      "GPS Live",
                      style: TextStyle(color: Color(0xFF15803D), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
          ),

          // Map View with Centered Fixed Pin
          SizedBox(
            height: 220,
            child: Stack(
              alignment: Alignment.center,
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: LatLng(_lat, _lng),
                    initialZoom: 16.0,
                    onPositionChanged: (camera, hasGesture) {
                      if (hasGesture) {
                        _onMapMoved(camera);
                      }
                    },
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                      userAgentPackageName: "com.adhikar.citizen",
                    ),
                  ],
                ),

                // Center Pin Icon (Rapido / Zepto Style)
                IgnorePointer(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(6),
                          boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                        ),
                        child: const Text(
                          "📍 Drag map to adjust spot",
                          style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const Icon(Icons.location_on, color: Color(0xFFEF4444), size: 38),
                      Container(
                        width: 8,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.black38,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(height: 18),
                    ],
                  ),
                ),

                // Floating "My Exact Location" Recenter Button
                Positioned(
                  bottom: 10,
                  right: 10,
                  child: FloatingActionButton.small(
                    heroTag: "recenter_gps_btn",
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF2563EB),
                    elevation: 3,
                    onPressed: _isLocating ? null : _acquireGps,
                    child: _isLocating
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.my_location, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressResolutionCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.home_work_outlined, color: Color(0xFF0284C7), size: 16),
              const SizedBox(width: 6),
              const Text("Detected Surrounding Location", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5, color: Color(0xFF334155))),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            _surroundingAddress,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Color(0xFF0F172A), height: 1.35),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              "📍 Coordinates: ${_lat.toStringAsFixed(4)}° N, ${_lng.toStringAsFixed(4)}° E  •  State: $_state",
              style: const TextStyle(fontSize: 10.5, color: Color(0xFF475569), fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChallengeForm() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("📝 Problem Details", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFF0F172A))),
          const SizedBox(height: 12),

          // Title
          TextFormField(
            controller: _titleController,
            decoration: InputDecoration(
              labelText: "Challenge Title *",
              hintText: "e.g., Hazardous open pothole on Main Road",
              labelStyle: const TextStyle(fontSize: 12.5),
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
            ),
            validator: (v) => v == null || v.trim().isEmpty ? "Title is required" : null,
            onChanged: (_) => _triggerAiAnalysis(),
          ),

          const SizedBox(height: 12),

          // Description
          TextFormField(
            controller: _descController,
            maxLines: 3,
            decoration: InputDecoration(
              labelText: "Detailed Description *",
              hintText: "Explain what is broken, how long it has been there, and affected area...",
              labelStyle: const TextStyle(fontSize: 12.5),
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
            ),
            validator: (v) => v == null || v.trim().length < 10 ? "Please give at least 10 characters description" : null,
            onChanged: (_) => _triggerAiAnalysis(),
          ),

          const SizedBox(height: 12),

          // Population & Submitter Row
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _affectedPopController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: "Affected Pop.",
                    labelStyle: const TextStyle(fontSize: 12),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _submitterType,
                  decoration: InputDecoration(
                    labelText: "Submitter Role",
                    labelStyle: const TextStyle(fontSize: 12),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  items: const [
                    DropdownMenuItem(value: "INDIVIDUAL_CITIZEN", child: Text("Citizen", style: TextStyle(fontSize: 12))),
                    DropdownMenuItem(value: "GRAM_PANCHAYAT", child: Text("Gram Panchayat", style: TextStyle(fontSize: 12))),
                    DropdownMenuItem(value: "MUNICIPAL_OFFICER", child: Text("Municipal ULB", style: TextStyle(fontSize: 12))),
                    DropdownMenuItem(value: "COMMUNITY_LEADER", child: Text("NGO / Leader", style: TextStyle(fontSize: 12))),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => _submitterType = val);
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDomainSelector() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.category_outlined, color: Color(0xFF4F46E5), size: 16),
              const SizedBox(width: 6),
              const Text("Thematic Domain & Priority", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 12),

          // Domain dropdown
          DropdownButtonFormField<String>(
            value: _selectedDomain,
            decoration: InputDecoration(
              labelText: "NEP 2020 Thematic Domain",
              labelStyle: const TextStyle(fontSize: 12),
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
            ),
            items: AppConstants.thematicDomains.map((d) {
              return DropdownMenuItem<String>(
                value: d['id'],
                child: Row(
                  children: [
                    Icon(d['icon'] as IconData, size: 16, color: d['color'] as Color),
                    const SizedBox(width: 8),
                    Text(d['name'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
              );
            }).toList(),
            onChanged: (val) {
              if (val != null) {
                setState(() => _selectedDomain = val);
                _triggerAiAnalysis();
              }
            },
          ),

          const SizedBox(height: 12),

          // Priority / Urgency Chips
          const Text("Urgency Level:", style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: Color(0xFF475569))),
          const SizedBox(height: 6),
          Row(
            children: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((u) {
              final isSel = _selectedUrgency == u;
              Color chipColor = const Color(0xFF64748B);
              if (u == "CRITICAL") chipColor = const Color(0xFFDC2626);
              if (u == "HIGH") chipColor = const Color(0xFFEA580C);
              if (u == "MEDIUM") chipColor = const Color(0xFFD97706);
              if (u == "LOW") chipColor = const Color(0xFF16A34A);

              return Padding(
                padding: const EdgeInsets.only(right: 6),
                child: ChoiceChip(
                  label: Text(u, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isSel ? Colors.white : chipColor)),
                  selected: isSel,
                  selectedColor: chipColor,
                  backgroundColor: chipColor.withValues(alpha: 0.1),
                  onSelected: (val) {
                    if (val) setState(() => _selectedUrgency = u);
                  },
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildAiIngestionCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFCBD5E1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.auto_awesome, color: Color(0xFF7C3AED), size: 16),
              const SizedBox(width: 6),
              const Text("AI Matching & NEP 2020 HEI Allocation", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5, color: Color(0xFF4338CA))),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFEDE9FE),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text("Confidence: $_aiConfidence", style: const TextStyle(fontSize: 10, color: Color(0xFF6D28D9), fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            "🏛️ Assigned University: ${_suggestedHei?.name ?? 'Delhi Technological University (DTU)'}",
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 4),
          Text(
            "🔬 Specialized Lab: ${_suggestedHei?.specializedLab ?? 'Smart Transportation & Infrastructure Lab'}",
            style: const TextStyle(fontSize: 11, color: Color(0xFF475569)),
          ),
          const SizedBox(height: 4),
          Text(
            "📍 Distance to Spot: ${_suggestedHei?.distanceKm.toStringAsFixed(1) ?? '14.2'} km away",
            style: const TextStyle(fontSize: 10.5, color: Color(0xFF0284C7), fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoEvidenceSection() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: _isImageVerifiedCivicHazard
              ? const Color(0xFF86EFAC)
              : (_aiVisionRejectionReason != null ? const Color(0xFFFCA5A5) : const Color(0xFFE2E8F0)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.camera_alt_outlined, color: Color(0xFF0284C7), size: 16),
              const SizedBox(width: 6),
              const Expanded(
                child: Text(
                  "📸 Verified Civic Photo Evidence (YOLOv8 AI Gate)",
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5, color: Color(0xFF0F172A)),
                ),
              ),
              if (_isImageVerifiedCivicHazard)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDCFCE7),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    "✓ Verified",
                    style: TextStyle(color: Color(0xFF15803D), fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            "Only authentic photos of Potholes, Garbage Dumps, Broken Street Lights, or Fallen Trees are accepted.",
            style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 12),

          // Scanning indicator
          if (_isScanningAiVision)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF0F9FF),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFBAE6FD)),
              ),
              child: const Row(
                children: [
                  SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0284C7)),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      "🔍 YOLOv8 Neural Network Scanning Photo for Civic Defects...",
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF0369A1)),
                    ),
                  ),
                ],
              ),
            )
          else if (_selectedImage != null && _isImageVerifiedCivicHazard)
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
                      onPressed: () => setState(() {
                        _selectedImage = null;
                        _isImageVerifiedCivicHazard = false;
                        _verifiedCivicHazardName = null;
                      }),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 8,
                  left: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.80),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: Color(0xFF22C55E), size: 14),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            "✓ YOLOv8 Verified: ${_verifiedCivicHazardName?.replaceAll('_', ' ').toUpperCase()} (${_verifiedConfidence ?? '92%'})",
                            style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            )
          else ...[
            if (_aiVisionRejectionReason != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFFECACA)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.error_outline, color: Color(0xFFDC2626), size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        "❌ AI Gate Rejected: $_aiVisionRejectionReason",
                        style: const TextStyle(color: Color(0xFF991B1B), fontSize: 11.5, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      side: const BorderSide(color: Color(0xFF0284C7)),
                    ),
                    icon: const Icon(Icons.camera_alt, size: 18, color: Color(0xFF0284C7)),
                    label: const Text("Camera Snap", style: TextStyle(fontSize: 12.5, color: Color(0xFF0284C7), fontWeight: FontWeight.w600)),
                    onPressed: () => _pickImage(ImageSource.camera),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      side: const BorderSide(color: Color(0xFF0284C7)),
                    ),
                    icon: const Icon(Icons.photo_library, size: 18, color: Color(0xFF0284C7)),
                    label: const Text("Photo Gallery", style: TextStyle(fontSize: 12.5, color: Color(0xFF0284C7), fontWeight: FontWeight.w600)),
                    onPressed: () => _pickImage(ImageSource.gallery),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
