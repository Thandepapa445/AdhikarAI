import requests
import json
import io
from PIL import Image

BASE_AI = "http://localhost:5000"
BASE_BACKEND = "http://localhost:8085"

def run_tests():
    import time
    ts = int(time.time())
    base_lat = 20.0000 + ((ts // 5) % 5000) * 0.005
    base_lon = 80.0000 + ((ts // 5) % 5000) * 0.005

    print("=" * 70)
    print("ADHIKAR AI - PHASE 1 AUTOMATED VERIFICATION SUITE")
    print("=" * 70)
    print(f"Test run using base coordinates: lat={base_lat:.4f}, lon={base_lon:.4f}")
    
    # -------------------------------------------------------------
    # 1. AI Engine Assessment Test
    # -------------------------------------------------------------
    print("\n--- Test 1: AI Engine Assessment (/api/v1/detect) ---")
    # Generate a synthetic test image with noise/shape
    img = Image.new("RGB", (640, 640), color=(128, 128, 128))
    # Draw some dark circle
    for x in range(250, 390):
        for y in range(250, 390):
            img.putpixel((x, y), (30, 30, 30))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    
    res = requests.post(f"{BASE_AI}/api/v1/detect", files={"file": ("test.jpg", buf, "image/jpeg")})
    print(f"AI Status: {res.status_code}")
    ai_data = res.json()
    print(f"AI Response keys: {list(ai_data.keys())}")
    print(f"Assigned Priority: {ai_data.get('assignedPriority')}")
    print(f"Suggested Description: {ai_data.get('suggestedDescription')}")
    assert res.status_code == 200, "AI Engine failed"
    print("[OK] Test 1 Passed: AI Engine Assessment responded correctly.")

    # -------------------------------------------------------------
    # 2. Lifecycle: Submit with Edited Description & Server Priority
    # -------------------------------------------------------------
    print("\n--- Test 2: Submit Complaint & Verify Server-Assigned Priority ---")
    edited_desc = "Citizen verified: dangerous deep pothole right in front of market entrance."
    payload_a = {
        "title": "Severe road pothole crater",
        "description": edited_desc,
        "domain": "INFRASTRUCTURE",
        "urgency": "LOW",  # Client attempts to submit LOW, but server safety rules must calculate priority!
        "submitterType": "INDIVIDUAL_CITIZEN",
        "submitterName": f"Aarav Sharma {ts}",
        "citizenEmail": f"aarav.{ts}@adhikar.in",
        "district": "Ranchi",
        "block": "Kanke",
        "panchayat": "Boreya",
        "locationText": "Boreya Main Chowk",
        "latitude": base_lat,
        "longitude": base_lon,
        "affectedPopulation": 1200,
        "evidenceImageUrl": "https://images.unsplash.com/photo-pothole-sample.jpg",
        "aiSuggestedDescription": ai_data.get("suggestedDescription"),
        "modelConfidence": 0.88,
        "priority": "LOW"
    }
    
    res_submit = requests.post(f"{BASE_BACKEND}/api/challenges", json=payload_a)
    print(f"Submit Status: {res_submit.status_code}")
    assert res_submit.status_code in (200, 201), f"Submit failed: {res_submit.text}"
    report_a = res_submit.json()
    report_a_id = report_a["id"]
    print(f"Report A ID: {report_a_id}")
    print(f"Server Priority: {report_a['priority']}")
    print(f"Cluster ID: {report_a.get('clusterId')}")
    print(f"Is Cluster Master: {report_a.get('isClusterMaster')}")
    print(f"AI Suggested Desc stored: {bool(report_a.get('aiSuggestedDescription'))}")
    # Priority should be calculated by server
    assert report_a["isClusterMaster"] == True, "Report A should be cluster master"
    assert report_a["priority"] in ("MODERATE", "HIGH", "CRITICAL"), "Server must calculate authoritative priority"
    print("[OK] Test 2 Passed: Lifecycle submission and server-side priority verified.")

    # -------------------------------------------------------------
    # 3. Retrieve and View Complaint
    # -------------------------------------------------------------
    print("\n--- Test 3: View Complaint by ID ---")
    res_view = requests.get(f"{BASE_BACKEND}/api/challenges/{report_a_id}")
    assert res_view.status_code == 200, "View challenge failed"
    view_data = res_view.json()
    assert view_data["description"] == edited_desc, "Edited description not preserved"
    print(f"View Status: 200 OK, Submitter: {view_data['submitterName']}, Priority: {view_data['priority']}")
    print("[OK] Test 3 Passed: Complaint viewing verified.")

    # -------------------------------------------------------------
    # 4. Duplicate Clustering - Controlled Tests
    # -------------------------------------------------------------
    print("\n--- Test 4: Controlled Duplicate Clustering Tests ---")
    
    # 4A. Unrelated issue at same location (Garbage instead of Pothole)
    payload_diff_domain = {
        "title": "Garbage dump near square",
        "description": "Solid municipal waste piled up.",
        "domain": "HEALTHCARE",
        "urgency": "LOW",
        "submitterType": "INDIVIDUAL_CITIZEN",
        "submitterName": f"Priya Singh {ts}",
        "citizenEmail": f"priya.{ts}@adhikar.in",
        "district": "Ranchi",
        "block": "Kanke",
        "panchayat": "Boreya",
        "latitude": base_lat,
        "longitude": base_lon,
        "evidenceImageUrl": "https://images.unsplash.com/garbage.jpg"
    }
    res_diff = requests.post(f"{BASE_BACKEND}/api/challenges", json=payload_diff_domain).json()
    print(f"Report 4A (Different Domain) - ID: {res_diff['id']}, ClusterMaster: {res_diff['isClusterMaster']}, ClusterID: {res_diff['clusterId']}")
    assert res_diff["isClusterMaster"] == True, "Different domain issue must NOT be merged into pothole cluster"
    assert res_diff["clusterId"] != report_a["clusterId"], "Cluster IDs must be separate for different domains"
    print("[OK] Test 4A Passed: Unrelated nearby issues are NOT merged.")

    # 4B. Distant issue of same domain (>200m away, ~1.5 km away)
    payload_distant = {
        "title": "Pothole on Highway",
        "description": "Deep road pothole 1.5km away.",
        "domain": "INFRASTRUCTURE",
        "urgency": "HIGH",
        "submitterType": "INDIVIDUAL_CITIZEN",
        "submitterName": f"Vikram Das {ts}",
        "citizenEmail": f"vikram.{ts}@adhikar.in",
        "district": "Ranchi",
        "block": "Kanke",
        "panchayat": "Boreya",
        "latitude": base_lat + 0.02, # ~2.2 km north
        "longitude": base_lon,
        "evidenceImageUrl": "https://images.unsplash.com/pothole2.jpg"
    }
    res_distant = requests.post(f"{BASE_BACKEND}/api/challenges", json=payload_distant).json()
    print(f"Report 4B (>200m Away) - ID: {res_distant['id']}, ClusterMaster: {res_distant['isClusterMaster']}, ClusterID: {res_distant['clusterId']}")
    assert res_distant["isClusterMaster"] == True, "Distant issue must NOT be merged"
    assert res_distant["clusterId"] != report_a["clusterId"], "Cluster IDs must be separate for distant reports"
    print("[OK] Test 4B Passed: Distant issues (>200m) are NOT merged.")

    # 4C. Corroborating issue within 200m (same domain, ~25m away)
    payload_corrob = {
        "title": "Same pothole spotted near market",
        "description": "Second citizen reporting the exact same pothole.",
        "domain": "INFRASTRUCTURE",
        "urgency": "HIGH",
        "submitterType": "INDIVIDUAL_CITIZEN",
        "submitterName": f"Neha Verma {ts}",
        "citizenEmail": f"neha.{ts}@adhikar.in",
        "district": "Ranchi",
        "block": "Kanke",
        "panchayat": "Boreya",
        "latitude": base_lat + 0.0002, # ~22m away
        "longitude": base_lon + 0.0001,
        "evidenceImageUrl": "https://images.unsplash.com/pothole_corrob.jpg"
    }
    res_corrob = requests.post(f"{BASE_BACKEND}/api/challenges", json=payload_corrob).json()
    print(f"Report 4C (Corroborating Report) - ID: {res_corrob['id']}, ClusterMaster: {res_corrob['isClusterMaster']}, ClusterID: {res_corrob['clusterId']}")
    assert res_corrob["isClusterMaster"] == False, "Corroborating report within 200m must be marked secondary"
    assert res_corrob["clusterId"] == report_a["clusterId"], "Corroborating report must link to Master Cluster ID"
    
    # Check that Master report duplicateCount incremented
    master_updated = requests.get(f"{BASE_BACKEND}/api/challenges/{report_a_id}").json()
    print(f"Master Updated Duplicate Count: {master_updated.get('duplicateCount')}")
    assert master_updated["duplicateCount"] >= 2, "Master duplicate count must increment"
    print("[OK] Test 4C Passed: Corroborating reports correctly grouped into cluster master.")

    # -------------------------------------------------------------
    # 5. Security & Authorization Enforcement
    # -------------------------------------------------------------
    print("\n--- Test 5: Admin Endpoints Security & Authorization ---")
    
    # 5A. Unauthenticated request to override priority
    res_unauth = requests.put(f"{BASE_BACKEND}/api/challenges/{report_a_id}/override-priority", 
                              json={"priority": "CRITICAL", "reason": "Hacker override attempt"})
    print(f"Unauthenticated override priority status: {res_unauth.status_code}")
    assert res_unauth.status_code in (401, 403), f"Security breach! Unauthenticated user accessed admin endpoint: {res_unauth.status_code}"
    print("[OK] Test 5A Passed: Unauthenticated request to override-priority rejected (401/403).")

    # 5B. Unauthenticated request to separate cluster
    res_unauth_sep = requests.post(f"{BASE_BACKEND}/api/challenges/{res_corrob['id']}/separate-cluster")
    print(f"Unauthenticated separate cluster status: {res_unauth_sep.status_code}")
    assert res_unauth_sep.status_code in (401, 403), f"Security breach! Unauthenticated separate cluster: {res_unauth_sep.status_code}"
    print("[OK] Test 5B Passed: Unauthenticated request to separate-cluster rejected (401/403).")

    # 5C. Register and test with CITIZEN role (Forbidden)
    import time
    ts = int(time.time())
    citizen_email = f"citizen_test_{ts}@adhikar.in"
    reg_cit = requests.post(f"{BASE_BACKEND}/api/auth/register", json={
        "name": "Citizen User",
        "email": citizen_email,
        "password": "Password123!",
        "role": "CITIZEN",
        "district": "Ranchi"
    })
    # Login to get JWT
    login_cit = requests.post(f"{BASE_BACKEND}/api/auth/login", json={
        "email": citizen_email,
        "password": "Password123!"
    }).json()
    cit_token = login_cit.get("token")
    headers_cit = {"Authorization": f"Bearer {cit_token}"}
    
    res_cit_override = requests.put(f"{BASE_BACKEND}/api/challenges/{report_a_id}/override-priority",
                                    headers=headers_cit,
                                    json={"priority": "CRITICAL", "reason": "Citizen override"})
    print(f"Citizen role override priority status: {res_cit_override.status_code}")
    assert res_cit_override.status_code == 403, f"Security breach! Citizen was allowed to override priority: {res_cit_override.status_code}"
    print("[OK] Test 5C Passed: Citizen role forbidden from admin override (403 Forbidden).")

    # 5D. Register and test with NODAL_ADMIN role (Allowed)
    admin_email = f"nodal_admin_{ts}@adhikar.gov.in"
    reg_admin = requests.post(f"{BASE_BACKEND}/api/auth/register", json={
        "name": "Nodal Officer",
        "email": admin_email,
        "password": "AdminPassword123!",
        "role": "NODAL_ADMIN",
        "district": "Ranchi"
    })
    login_admin = requests.post(f"{BASE_BACKEND}/api/auth/login", json={
        "email": admin_email,
        "password": "AdminPassword123!"
    }).json()
    admin_token = login_admin.get("token")
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    
    res_admin_override = requests.put(f"{BASE_BACKEND}/api/challenges/{report_a_id}/override-priority",
                                      headers=headers_admin,
                                      json={"priority": "CRITICAL", "reason": "Official nodal field inspection confirms hazard"})
    print(f"Admin role override priority status: {res_admin_override.status_code}")
    assert res_admin_override.status_code == 200, f"Admin override failed: {res_admin_override.text}"
    override_data = res_admin_override.json()
    assert override_data["priority"] == "CRITICAL", "Priority not updated"
    assert override_data["priorityOverriddenBy"] == admin_email, "OverriddenBy email not recorded"
    print(f"Overridden by: {override_data['priorityOverriddenBy']}, New Priority: {override_data['priority']}")
    print("[OK] Test 5D Passed: Authorized Nodal Admin successfully overrides priority.")

    # 5E. Admin separates cluster report
    res_admin_sep = requests.post(f"{BASE_BACKEND}/api/challenges/{res_corrob['id']}/separate-cluster",
                                  headers=headers_admin)
    print(f"Admin separate cluster status: {res_admin_sep.status_code}")
    assert res_admin_sep.status_code == 200, f"Admin separate failed: {res_admin_sep.text}"
    sep_data = res_admin_sep.json()
    assert sep_data["isClusterMaster"] == True, "Separated report must become its own master"
    assert sep_data["clusterId"] == sep_data["id"], "Separated cluster ID must point to itself"
    print("[OK] Test 5E Passed: Authorized Nodal Admin successfully unlinks report into distinct issue.")

    print("\n" + "=" * 70)
    print("ALL VERIFICATION SUITE CHECKS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
