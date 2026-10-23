import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants.dart';
import '../../core/theme.dart';
import '../../models/challenge_model.dart';
import '../../providers/challenge_provider.dart';

class ChallengeDetailScreen extends StatefulWidget {
  final ChallengeModel challenge;

  const ChallengeDetailScreen({Key? key, required this.challenge}) : super(key: key);

  @override
  State<ChallengeDetailScreen> createState() => _ChallengeDetailScreenState();
}

class _ChallengeDetailScreenState extends State<ChallengeDetailScreen> {
  final TextEditingController _feedbackController = TextEditingController(
    text: "Field pilot successfully verified on-ground. Water output is clean and meets safe standards.",
  );
  bool _isVerifying = false;

  @override
  void dispose() {
    _feedbackController.dispose();
    super.dispose();
  }

  void _handleVerifyPilot(BuildContext context) async {
    setState(() => _isVerifying = true);
    final provider = Provider.of<ChallengeProvider>(context, listen: false);

    await provider.verifyPilot(widget.challenge.id, _feedbackController.text.trim());

    if (mounted) {
      setState(() => _isVerifying = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("🎉 Field Pilot Verified! Challenge marked as RESOLVED."),
          backgroundColor: Color(0xFF16A34A),
        ),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.challenge;
    final currentStageIdx = c.currentStageIndex;

    final domainInfo = AppConstants.thematicDomains.firstWhere(
      (d) => d['id'] == c.domain,
      orElse: () => AppConstants.thematicDomains[0],
    );

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: Text("Challenge #${c.id}"),
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 60),
        children: [
          // 1. Evidence Image
          Stack(
            children: [
              CachedNetworkImage(
                imageUrl: c.evidenceImageUrl,
                height: 220,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
              Positioned(
                bottom: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.8),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    "📍 Lat: ${c.latitude.toStringAsFixed(4)}°, Lng: ${c.longitude.toStringAsFixed(4)}° • Authentic Evidence",
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ],
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Domain & Urgency Badges
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: domainInfo['bgColor'],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(domainInfo['icon'], size: 14, color: domainInfo['color']),
                          const SizedBox(width: 4),
                          Text(
                            domainInfo['name'],
                            style: TextStyle(color: domainInfo['color'], fontSize: 11.5, fontWeight: FontWeight.w800),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        "Urgency: ${c.urgency}",
                        style: const TextStyle(color: Color(0xFFDC2626), fontSize: 11, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Title
                Text(
                  c.title,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                ),

                const SizedBox(height: 8),

                // Location Details
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 15, color: Color(0xFFEF4444)),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        "${c.panchayat}, ${c.block}, ${c.district}",
                        style: const TextStyle(fontSize: 13, color: Color(0xFF475569), fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Description
                const Text(
                  "Problem Summary & Field Context",
                  style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 4),
                Text(
                  c.description,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF334155), height: 1.4),
                ),

                const SizedBox(height: 20),

                // 2. 8-STAGE NEP 2020 LIFECYCLE STEPPER
                _buildEightStageStepper(currentStageIdx),

                const SizedBox(height: 20),

                // 3. AI Civic Safety Triage & Geodesic Clustering
                _buildCivicTriageAndClusterCard(c),

                const SizedBox(height: 16),

                // 4. Field Pilot & Citizen Sign-Off Box
                if (c.status == "PILOT" || c.citizenVerificationRequested)
                  _buildCitizenSignOffCard(context),

                if (c.status == "RESOLVED")
                  _buildResolvedCard(c),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEightStageStepper(int currentIdx) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "⚡ NEP 2020 8-Stage Lifecycle",
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF0284C7).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  "Stage ${currentIdx + 1}/8",
                  style: const TextStyle(color: Color(0xFF0284C7), fontSize: 11, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...AppConstants.stagesOfInnovation.asMap().entries.map((entry) {
            final idx = entry.key;
            final stage = entry.value;
            final isCompleted = idx < currentIdx;
            final isCurrent = idx == currentIdx;

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Container(
                      width: 26,
                      height: 26,
                      decoration: BoxDecoration(
                        color: isCompleted
                            ? const Color(0xFF16A34A)
                            : isCurrent
                                ? const Color(0xFF0284C7)
                                : const Color(0xFFE2E8F0),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: isCompleted
                            ? const Icon(Icons.check, size: 14, color: Colors.white)
                            : Text(
                                "${stage['step']}",
                                style: TextStyle(
                                  color: isCurrent ? Colors.white : const Color(0xFF64748B),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                      ),
                    ),
                    if (idx < 7)
                      Container(
                        width: 2,
                        height: 28,
                        color: isCompleted ? const Color(0xFF16A34A) : const Color(0xFFE2E8F0),
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          stage['label'],
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: isCurrent
                                ? const Color(0xFF0284C7)
                                : isCompleted
                                    ? const Color(0xFF16A34A)
                                    : const Color(0xFF64748B),
                          ),
                        ),
                        Text(
                          stage['desc'],
                          style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildCivicTriageAndClusterCard(ChallengeModel c) {
    final bool isCritical = c.urgency == "CRITICAL";
    final bool isHigh = c.urgency == "HIGH";

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFCBD5E1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.shield_outlined, color: Color(0xFF0284C7), size: 18),
                  SizedBox(width: 8),
                  Text(
                    "AI Civic Safety & Priority Triage",
                    style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isCritical
                      ? const Color(0xFFFEE2E2)
                      : (isHigh ? const Color(0xFFFFEDD5) : const Color(0xFFE0F2FE)),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isCritical
                        ? const Color(0xFFDC2626)
                        : (isHigh ? const Color(0xFFEA580C) : const Color(0xFF0284C7)),
                  ),
                ),
                child: Text(
                  "● ${c.urgency} PRIORITY",
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: isCritical
                        ? const Color(0xFFDC2626)
                        : (isHigh ? const Color(0xFFEA580C) : const Color(0xFF0284C7)),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Text(
            "Priority is determined deterministically on the server via AI defect analysis and municipal safety rules.",
            style: TextStyle(fontSize: 12, color: Color(0xFF475569)),
          ),
          const Divider(height: 16, color: Color(0xFFE2E8F0)),
          Row(
            children: const [
              Icon(Icons.hub_outlined, color: Color(0xFF16A34A), size: 16),
              SizedBox(width: 6),
              Text(
                "200m Smart Geodesic Deduplication Active",
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF16A34A)),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            "Reports in this 200m perimeter are automatically aggregated into master issue clusters to accelerate dispatch.",
            style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }

  Widget _buildCitizenSignOffCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.verified, color: Color(0xFFD97706), size: 18),
              SizedBox(width: 8),
              Text(
                "Citizen / Gram Panchayat Sign-Off",
                style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Color(0xFF92400E)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            "The university has deployed a field prototype in your village. Please confirm whether the issue is effectively resolved:",
            style: TextStyle(fontSize: 12, color: Color(0xFF78350F)),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _feedbackController,
            maxLines: 2,
            decoration: const InputDecoration(
              filled: true,
              fillColor: Colors.white,
              hintText: "Enter verification remarks & feedback...",
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF16A34A),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: _isVerifying
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.check_circle_outline, size: 18),
              label: const Text(
                "Confirm & Mark as RESOLVED",
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
              ),
              onPressed: _isVerifying ? null : () => _handleVerifyPilot(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResolvedCard(ChallengeModel c) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFDCFCE7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: Row(
        children: [
          const Icon(Icons.verified, color: Color(0xFF16A34A), size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "✓ Closed-Loop Verified & Resolved",
                  style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Color(0xFF15803D)),
                ),
                const SizedBox(height: 2),
                Text(
                  c.citizenFeedbackNotes ?? "Verified successful field deployment by Gram Panchayat.",
                  style: const TextStyle(fontSize: 12, color: Color(0xFF166534)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
