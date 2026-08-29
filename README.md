# 🇮🇳 SANKALP AI: Jharkhand Societal Innovation & Collaboration Portal
### Smart India Hackathon (SIH PS 26043) • Aligned with National Education Policy (NEP 2020)
### Connecting Grassroots Challenges with Universities (HEIs) & Industry Partners

---

## 🌟 Overview
**Sankalp AI (Jharkhand Innovation Portal)** is a digital collaboration platform empowering citizens, Gram Panchayats (PRIs), Urban Local Bodies (ULBs), and community organizations across Jharkhand to submit societal challenges. The platform automatically classifies issues across **9 thematic domains**, calculates urgency scores, checks for duplicates, and routes problem statements to **Higher Education Institutions (HEIs)** (e.g. BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, BAU Ranchi) and **Industry / CSR Partners** (Tata Steel Foundation, Coal India CSR, AgTech Incubator) to develop, prototype, test, and deploy practical solutions.

---

## 🏗️ 8-Stage NEP 2020 Innovation Lifecycle
1. **Submitted** — Logged by Citizen or Gram Panchayat with geotagged map pin and photo/document evidence.
2. **Validated** — Reviewed and validated by State Nodal Innovation Officer.
3. **Assigned to HEI** — Routed to university multidisciplinary team, specialized fablab, and faculty mentor.
4. **Research & Design** — Field survey, technical schematics, and baseline data collection.
5. **Prototyping** — Fabrication of hardware/software prototype in campus labs with CSR seed grants.
6. **Testing & Validation** — Controlled lab testing, water/soil quality compliance (BIS / FSSAI), and safety certification.
7. **Community Field Pilot** — Live field installation and testing in the target Panchayat/village.
8. **Deployed & Impact Verified** — Full community adoption with official Citizen & Panchayat verification sign-off.

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
The REST API will run on `http://localhost:8080/api`.

### 3. Running the AI YOLOv8 Vision API (Port 5000)
```bash
cd ai-engine
python app.py
```

---

## 🧩 Key Modules
- **🌾 Citizen & Panchayat Dashboard (`/dashboard`)**: KPI impact counters, 8-stage progress mini-stepper, interactive Jharkhand GIS map explorer, deployed technologies showcase, and **Citizen Pilot Sign-off Action**.
- **🎓 University (HEI) & Faculty Portal (`/university`)**: Workspaces for BIT Mesra, IIT ISM, NIT Jamshedpur, BAU Ranchi, multidisciplinary student team builder, FabLab management, and lab test uploads.
- **🛡️ State Nodal Admin Command Center (`/admin`)**: 24-District volume triage queue, AI Deduplication & Clustering, Proximity University Allocation, CSR Seed Grants (₹15L–₹25L) tracking, and SLA audit logs.
- **📱 Mobile App & PWA**: Mobile bottom navigation bar, 1-tap hardware GPS auto-locator, direct camera capture with YOLOv8 vision hazard verification, and vernacular Hindi voice notes.
