# 🇮🇳 ADHIKAR AI (अधिकार AI)
### National Citizen Innovation, Grievance Redressal & Academic R&D Ecosystem
### Aligned with National Education Policy (NEP 2020) & Ministry of Electronics and IT (MeitY)

---

## 🌟 Overview
**Adhikar AI (अधिकार AI)** is a Pan-India digital collaboration and grievance redressal platform empowering citizens, residents, Gram Panchayats, Urban Local Bodies (ULBs), and community organizations across all states and union territories of India to report civic defects and crowdsource complex grassroots challenges.

The system features:
1. **4-Class YOLOv8 Vision AI**: Real-time detection and verification of Potholes, Garbage Dumps, Broken Streetlights, and Fallen Trees.
2. **Pure 1-Tap Auto-GPS Geolocation**: Instant device GPS lock and reverse geocoding to auto-fill State, District, Block/Ward, and Area anywhere in India.
3. **Dual-Track Triaging**:
   - **Track A (Civic Direct Redressal)**: Dispatches routine municipal hazards (potholes, garbage, lighting) directly to Urban Local Bodies / PWD.
   - **Track B (University Capstone R&D)**: Routes complex grassroots problems to premier Universities & HEIs (IITs, NITs, DTU, BITS, AIIMS, State Tech Universities) under the 8-Stage NEP 2020 Student Capstone lifecycle.
4. **Citizen Field Verification**: Complete closure loop requiring resident confirmation.

---

## 🏗️ 8-Stage NEP 2020 Innovation Lifecycle
1. **Submitted** — Geotagged via 1-Tap Live GPS and verified via 4-Class YOLOv8 computer vision.
2. **Validated** — Multi-factor NLP domain triage and 100m geodesic deduplication.
3. **Assigned to HEI** — Routed to matched multidisciplinary student innovation team and specialized university lab.
4. **Research & Design** — Field survey, technical scoping, and engineering design.
5. **Prototyping** — Fabrication of functional hardware/software prototype in university lab with CSR/Govt grant.
6. **Testing & Validation** — Controlled lab testing, safety certification, and quality validation.
7. **Community Field Pilot** — Live on-ground installation and pilot testing in target area/ward.
8. **Deployed & Impact Verified** — Official citizen sign-off confirming field resolution.

---

## 🚀 Quick Start Guide

### 1. Running the Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev -- --host
```
Open your browser or phone at `http://localhost:5173`.

### 2. Running the Backend REST API (Port 8080)
```bash
cd backend
./gradlew bootRun
```
The REST API runs on `http://localhost:8080/api`.

### 3. Running the AI YOLOv8 Vision API (Port 5000)
```bash
cd ai-engine
python app.py
```
The AI Engine runs on `http://localhost:5000`.

### 4. Running the Flutter Mobile App
```bash
cd mobile_flutter
flutter run
```

---

## 🧩 Key Portals & Interfaces
- **🌾 Citizen & Submitter Portal (`/dashboard`)**: KPI impact counters, 8-stage progress tracker, interactive Pan-India GIS map, deployed showcase, and Citizen Field Sign-off.
- **🎓 University (HEI) & Faculty Portal (`/university`)**: Workspaces for premier institutions across India, student team builder, lab deliverable uploads, and milestone management.
- **🛡️ Nodal Admin Command Center (`/admin`)**: Pan-India volume triage queue, AI Deduplication & Clustering, Proximity University Allocation, CSR Grants tracking, and audit logs.
- **📱 Flutter Mobile App (`mobile_flutter/`)**: 1-Tap live GPS auto-locator, direct camera snap with 4-class YOLOv8 AI verification, and vernacular voice notes.
