import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants.dart';
import '../../core/theme.dart';
import '../../models/challenge_model.dart';
import '../../providers/challenge_provider.dart';
import '../details/challenge_detail_screen.dart';
import '../submit/new_challenge_screen.dart';
import 'map_view_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ChallengeProvider>(context);
    final challenges = provider.challenges;
    final allChallenges = provider.rawChallenges;

    final inRndCount = allChallenges.where((c) => ["ASSIGNED", "RESEARCH", "PROTOTYPE", "TESTING", "PILOT"].contains(c.status)).length;
    final resolvedCount = allChallenges.where((c) => c.status == "RESOLVED").length;

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.auto_awesome, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  "ADHIKAR AI",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
                ),
                Text(
                  "National Innovation & Grievance Portal",
                  style: TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.map_outlined, color: Colors.white),
            tooltip: "GIS Map View",
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const MapViewScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings_ethernet, color: Colors.white),
            tooltip: "Server IP",
            onPressed: () => _showServerIpDialog(context, provider),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            tooltip: "Sync with State Portal",
            onPressed: () => provider.loadChallenges(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => provider.loadChallenges(),
        color: AppTheme.primaryBlue,
        child: ListView(
          padding: const EdgeInsets.only(bottom: 100),
          children: [
            // 1. KPI Banner Card
            _buildKpiBanner(allChallenges.length, inRndCount, resolvedCount),

            // 2. Search Box
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: TextField(
                controller: _searchController,
                onChanged: (val) => provider.setSearchQuery(val),
                decoration: InputDecoration(
                  hintText: "Search by challenge, district or village...",
                  hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                  prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B), size: 20),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            provider.setSearchQuery("");
                          },
                        )
                      : null,
                ),
              ),
            ),

            // 3. Thematic Domain Filter Chips
            _buildDomainChips(provider),

            // 4. Section Title & Stage Count
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Community Challenges (${challenges.length})",
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      "⚡ 8-Stage Pipeline",
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                    ),
                  ),
                ],
              ),
            ),

            // 5. Challenge Cards List
            if (provider.isLoading)
              const Padding(
                padding: EdgeInsets.all(40),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (challenges.isEmpty)
              _buildEmptyState()
            else
              ...challenges.map((c) => _buildChallengeCard(context, c, provider)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.primaryBlue,
        foregroundColor: Colors.white,
        elevation: 4,
        icon: const Icon(Icons.add_a_photo, size: 20),
        label: const Text(
          "Report Societal Issue",
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5),
        ),
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const NewChallengeScreen()),
          );
        },
      ),
    );
  }

  Widget _buildKpiBanner(int total, int inRnd, int resolved) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.12),
            blurRadius: 10,
            offset: const Offset(0, 4),
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
                "Govt. of Jharkhand • State Innovation",
                style: TextStyle(color: Color(0xFF38BDF8), fontSize: 11.5, fontWeight: FontWeight.w700),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF16A34A).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF22C55E), width: 0.8),
                ),
                child: const Text(
                  "● Live Pipeline",
                  style: TextStyle(color: Color(0xFF4ADE80), fontSize: 10.5, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildKpiItem("Total Issues", "$total", Icons.assignment_outlined),
              Container(width: 1, height: 36, color: Colors.white24),
              _buildKpiItem("In R&D Lab", "$inRnd", Icons.science_outlined),
              Container(width: 1, height: 36, color: Colors.white24),
              _buildKpiItem("Verified Pilots", "$resolved", Icons.verified_outlined),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKpiItem(String title, String val, IconData icon) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: const Color(0xFF38BDF8), size: 14),
            const SizedBox(width: 4),
            Text(
              val,
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          title,
          style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 11, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }

  Widget _buildDomainChips(ChallengeProvider provider) {
    return SizedBox(
      height: 42,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: ChoiceChip(
              label: const Text("All Domains"),
              selected: provider.selectedDomain == "ALL",
              selectedColor: const Color(0xFF0F172A),
              backgroundColor: Colors.white,
              labelStyle: TextStyle(
                color: provider.selectedDomain == "ALL" ? Colors.white : const Color(0xFF334155),
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
              onSelected: (_) => provider.setDomainFilter("ALL"),
            ),
          ),
          ...AppConstants.thematicDomains.map((d) {
            final isSelected = provider.selectedDomain == d['id'];
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: ChoiceChip(
                avatar: Icon(d['icon'], size: 14, color: isSelected ? Colors.white : d['color']),
                label: Text(d['name']),
                selected: isSelected,
                selectedColor: d['color'],
                backgroundColor: Colors.white,
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : const Color(0xFF334155),
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
                onSelected: (_) => provider.setDomainFilter(d['id']),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildChallengeCard(BuildContext context, ChallengeModel c, ChallengeProvider provider) {
    final domainInfo = AppConstants.thematicDomains.firstWhere(
      (d) => d['id'] == c.domain,
      orElse: () => AppConstants.thematicDomains[0],
    );

    final stageInfo = AppConstants.stagesOfInnovation.firstWhere(
      (s) => s['key'] == c.status,
      orElse: () => AppConstants.stagesOfInnovation[0],
    );

    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => ChallengeDetailScreen(challenge: c)),
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card Image with Badges
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                  child: CachedNetworkImage(
                    imageUrl: c.evidenceImageUrl,
                    height: 150,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      height: 150,
                      color: const Color(0xFFF1F5F9),
                      child: const Center(child: Icon(Icons.image, color: Colors.grey)),
                    ),
                    errorWidget: (context, url, error) => Container(
                      height: 150,
                      color: const Color(0xFFF1F5F9),
                      child: const Center(child: Icon(Icons.image_not_supported, color: Colors.grey)),
                    ),
                  ),
                ),
                Positioned(
                  top: 10,
                  left: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.75),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(domainInfo['icon'], size: 12, color: Colors.white),
                        const SizedBox(width: 4),
                        Text(
                          domainInfo['name'],
                          style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: c.status == "RESOLVED"
                          ? const Color(0xFF16A34A)
                          : const Color(0xFF0284C7),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      "Stage ${stageInfo['step']}/8: ${stageInfo['label']}",
                      style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w800),
                    ),
                  ),
                ),
              ],
            ),

            // Card Body
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 13, color: Color(0xFFEF4444)),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          "${c.panchayat}, ${c.block}, ${c.district}",
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // HEI Lab Allocation Pill (if assigned)
                  if (c.assignedHei != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.account_balance, size: 14, color: Color(0xFF7C3AED)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              "🎓 ${c.assignedHei}",
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                            ),
                          ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 12),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  const SizedBox(height: 10),

                  // Card Footer
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "👥 ${c.affectedPopulation} Villagers Impacted",
                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                      ),
                      InkWell(
                        onTap: () => provider.upvote(c.id),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.thumb_up, size: 13, color: Color(0xFF2563EB)),
                              const SizedBox(width: 4),
                              Text(
                                "${c.upvotes} Upvotes",
                                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: Color(0xFF2563EB)),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Center(
        child: Column(
          children: const [
            Icon(Icons.inbox, size: 48, color: Color(0xFF94A3B8)),
            SizedBox(height: 12),
            Text(
              "No challenges found in this filter",
              style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF64748B)),
            ),
          ],
        ),
      ),
    );
  }

  void _showServerIpDialog(BuildContext context, ChallengeProvider provider) {
    final controller = TextEditingController(text: AppConstants.defaultHost);
    bool isScanning = false;
    String? scanStatus;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.wifi_tethering, color: Color(0xFF0284C7)),
              SizedBox(width: 8),
              Text("Mobile Hotspot & Server IP", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Connect your laptop to your phone's Mobile Hotspot or same Wi-Fi:",
                  style: TextStyle(fontSize: 12.5, color: Color(0xFF475569)),
                ),
                const SizedBox(height: 12),
                // 1-Tap Auto-Scan for Laptop on Hotspot / Network
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE0F2FE),
                      foregroundColor: const Color(0xFF0284C7),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: isScanning
                        ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.radar, size: 18),
                    label: Text(
                      isScanning ? "Scanning Network..." : "🔍 Auto-Detect Laptop (Hotspot)",
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    onPressed: isScanning
                        ? null
                        : () async {
                            setDialogState(() {
                              isScanning = true;
                              scanStatus = null;
                            });
                            final found = await AppConstants.autoScanForLaptop();
                            setDialogState(() {
                              isScanning = false;
                              if (found != null) {
                                controller.text = found;
                                scanStatus = "✓ Found laptop at $found!";
                              } else {
                                scanStatus = "⚠️ Laptop not found on hotspot. Enter IP manually below.";
                              }
                            });
                          },
                  ),
                ),
                if (scanStatus != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    scanStatus!,
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: scanStatus!.startsWith("✓") ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                    ),
                  ),
                ],
                const SizedBox(height: 14),
                // Quick Preset Chips
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: [
                    ActionChip(
                      label: const Text("📱 Hotspot Gateway (192.168.43.1)", style: TextStyle(fontSize: 11)),
                      onPressed: () => setDialogState(() => controller.text = "192.168.43.1"),
                    ),
                    ActionChip(
                      label: const Text("🏠 Current PC (192.168.1.35)", style: TextStyle(fontSize: 11)),
                      onPressed: () => setDialogState(() => controller.text = "192.168.1.35"),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: controller,
                  decoration: const InputDecoration(
                    labelText: "Server IP / Host",
                    hintText: "e.g., 192.168.43.x or 192.168.1.x",
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7)),
              onPressed: () async {
                final newHost = controller.text.trim();
                if (newHost.isNotEmpty) {
                  await AppConstants.setCustomHost(newHost);
                  if (ctx.mounted) Navigator.pop(ctx);
                  provider.loadChallenges();
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text("✓ Server IP updated to $newHost. Re-syncing..."),
                        backgroundColor: const Color(0xFF16A34A),
                      ),
                    );
                  }
                }
              },
              child: const Text("Save & Connect", style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
