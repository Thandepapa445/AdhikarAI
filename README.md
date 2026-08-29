# 🇮🇳 SANKALP AI: Jharkhand Societal Innovation & Collaboration Portal
### Connecting Grassroots Challenges with Universities (HEIs) & Industry under NEP 2020

---

## 🌟 Overview
**Sankalp AI (Jharkhand Innovation Portal)** is a digital collaboration platform empowering citizens, Gram Panchayats (PRIs), Urban Local Bodies (ULBs), and community organizations across Jharkhand to submit societal challenges. The platform automatically classifies issues across **9 thematic domains**, calculates urgency scores, checks for duplicates, and routes problem statements to **Higher Education Institutions (HEIs)** (e.g. BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, BAU Ranchi) and **Industry / CSR Partners** (Tata Steel Foundation, Coal India CSR, AgTech Incubator) to develop, prototype, test, and deploy practical solutions.

---

## 🏗️ 8-Stage NEP 2020 Innovation Lifecycle
1. **Submitted** — Logged by Citizen or Gram Panchayat with geotagged map pin and photo/document evidence.
2. **Validated** — Reviewed and validated by State Nodal Innovation Officer.
3. **Assigned to HEI** — Routed to university multidisciplinary team, specialized fablab, and faculty mentor.
4. **Research & Design** — Field survey, technical schematics, and baseline data collection.
5. **Prototyping** — Fabrication of hardware/software prototype in campus labs.
6. **Testing & Validation** — Controlled lab testing, water/soil quality compliance, and safety certification.
7. **Community Field Pilot** — Live field installation and testing in the target Panchayat/village.
8. **Deployed & Impact Verified** — Full community adoption with official Citizen & Panchayat verification sign-off.

---

## 🚀 Quick Start Guide

### 1. Running the Frontend
```bash
cd "jharkhand-societal-innovation-portal/frontend"
npm run dev
```
Open your browser at `http://localhost:5173`.

### 2. Running the Backend
```bash
cd "jharkhand-societal-innovation-portal/backend"
./gradlew bootRun
```
The REST API will run on `http://localhost:8080/api`.

---

## 🧩 Key Modules
- **Citizen & Panchayat Dashboard (`/dashboard`)**: KPI impact counters, 8-stage progress mini-stepper, interactive Jharkhand GIS map explorer, and deployed technologies showcase.
- **Smart Submission Portal (`/challenges/new`)**: 24-District cascade, interactive Leaflet GPS pin drop, 9 thematic domains, live AI categorization preview, and duplicate detection alerts.
- **Challenge Detail & Pilot Verification Modal**: Inspect assigned university faculty, student innovators, CSR funding, and submit citizen pilot sign-off feedback.
