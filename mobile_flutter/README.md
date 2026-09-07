# 📱 Sankalp AI — Citizen Flutter Mobile App

Official cross-platform mobile application for **Sankalp AI** built using **Flutter (Dart)**. Designed for rural citizens, Gram Panchayat Mukhya leaders, farmer collectives, and women SHGs to report grassroots societal challenges and track their resolution through university engineering labs under NEP 2020.

---

## 🌟 Key Features

1. **1-Tap GPS & Campus Presets**:
   * Auto-detects device GPS coordinates via `geolocator`.
   * Includes 1-tap quick presets for **Ghaziabad (ABESIT)**, **Delhi NCR (DTU)**, and **Jharkhand Pilot (Palamu/Ranchi)**.

2. **Real-Time Multi-Modal AI Ingestion**:
   * **NLP Domain Classification**: Computes live thematic classification with confidence percentages (e.g. `96.0%`).
   * **Intelligent Multi-Factor HEI Matcher**: Automatically ranks universities and displays the top matched FabLab and faculty mentor (e.g., `BIT Mesra Clean Water FabLab • 95.0% Match • 0.3 km away`).

3. **YOLOv8 Computer Vision Evidence Verification**:
   * In-app camera and gallery picker with civic hazard verification.
   * Auto-imprints authentic GPS & timestamp metadata watermark on field images.

4. **8-Stage NEP 2020 Stepper Progress Tracker**:
   * Interactive lifecycle tracking from `Submitted -> Validated -> Assigned to HEI -> Lab Research -> CAD Prototype -> Compliance Testing -> Field Pilot -> Citizen Verified`.

5. **Closed-Loop Citizen Field Pilot Sign-Off**:
   * When a university team deploys a prototype in the village, the citizen or Gram Panchayat confirms operational performance directly in the app to transition the project to `RESOLVED`.

6. **GIS Spatial Intelligence Map**:
   * Full-screen OpenStreetMap with custom cluster pins for nearby societal challenges and university research centers.

---

## 🛠️ Architecture & Tech Stack

* **Framework**: Flutter 3.x / Dart 3.x
* **State Management**: `Provider` (Reactive ChangeNotifier)
* **Networking**: `Dio` (HTTP Client with timeout & retry handling)
* **Maps & GIS**: `flutter_map` + `latlong2` (OpenStreetMap)
* **Image Processing**: `image_picker` + `cached_network_image`
* **Styling & Fonts**: Material 3 + `google_fonts` (Inter)

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
cd mobile_flutter
flutter pub get
```

### 2. Configure Host IP (Optional)
If running on a physical Android or iOS device over Wi-Fi, update `defaultHost` in `lib/core/constants.dart`:
```dart
static const String defaultHost = "YOUR_LAPTOP_WIFI_IP"; // e.g., 10.190.248.96
```
*(For Android Emulator, use `10.0.2.2`)*

### 3. Launch App
```bash
# Run on connected Android / iOS device or Emulator
flutter run

# Run on Chrome Web
flutter run -d chrome

# Run on Windows Desktop
flutter run -d windows
```
