import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/theme.dart';
import '../../models/challenge_model.dart';
import '../../providers/challenge_provider.dart';
import '../details/challenge_detail_screen.dart';

class MapViewScreen extends StatefulWidget {
  const MapViewScreen({Key? key}) : super(key: key);

  @override
  State<MapViewScreen> createState() => _MapViewScreenState();
}

class _MapViewScreenState extends State<MapViewScreen> {
  final MapController _mapController = MapController();
  ChallengeModel? _selectedChallenge;

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ChallengeProvider>(context);
    final challenges = provider.challenges;

    // Center on first challenge or default Jharkhand/NCR coordinates
    LatLng centerPos = const LatLng(23.9525, 84.1825);
    if (challenges.isNotEmpty) {
      centerPos = LatLng(challenges.first.latitude, challenges.first.longitude);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("GIS Spatial Intelligence Map"),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: () {
              _mapController.move(centerPos, 11);
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: centerPos,
              initialZoom: 9.5,
              onTap: (_, __) {
                setState(() {
                  _selectedChallenge = null;
                });
              },
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.sankalp.citizen',
              ),
              MarkerLayer(
                markers: challenges.map((c) {
                  final domainInfo = AppConstants.thematicDomains.firstWhere(
                    (d) => d['id'] == c.domain,
                    orElse: () => AppConstants.thematicDomains[0],
                  );

                  final isSelected = _selectedChallenge?.id == c.id;

                  return Marker(
                    point: LatLng(c.latitude, c.longitude),
                    width: isSelected ? 50 : 40,
                    height: isSelected ? 50 : 40,
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedChallenge = c;
                        });
                        _mapController.move(LatLng(c.latitude, c.longitude), 12);
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: domainInfo['color'],
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: isSelected ? 3 : 2),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.3),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(
                          domainInfo['icon'],
                          color: Colors.white,
                          size: isSelected ? 24 : 18,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),

          // Preset Jump Bar
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: Container(
              height: 38,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: AppConstants.campusPresets.map((preset) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ActionChip(
                      backgroundColor: Colors.white,
                      label: Text(
                        "📍 ${preset['label']}",
                        style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                      ),
                      onPressed: () {
                        _mapController.move(LatLng(preset['lat'], preset['lng']), 12.5);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Selected Challenge Overlay Card
          if (_selectedChallenge != null)
            Positioned(
              bottom: 20,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.12),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0284C7).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            "Stage: ${_selectedChallenge!.status}",
                            style: const TextStyle(color: Color(0xFF0284C7), fontSize: 11, fontWeight: FontWeight.w800),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, size: 18),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: () {
                            setState(() {
                              _selectedChallenge = null;
                            });
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _selectedChallenge!.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "📍 ${_selectedChallenge!.panchayat}, ${_selectedChallenge!.block}",
                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => ChallengeDetailScreen(challenge: _selectedChallenge!),
                            ),
                          );
                        },
                        child: const Text("View 8-Stage Progress Details", style: TextStyle(fontSize: 12.5)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
