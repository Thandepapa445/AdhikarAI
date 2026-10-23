import requests
import json
import time

BASE_BACKEND = "http://localhost:8085"

def run_cross_workflow_tests():
    print("=" * 70)
    print("ADHIKAR AI - CROSS-WORKFLOW ESCALATION & VISIBILITY TEST SUITE")
    print("=" * 70)

    ts = int(time.time())

    # 1. Authenticate Society Resident & Society Manager
    res_mgr = requests.post(f"{BASE_BACKEND}/api/auth/register", json={
        "name": "Manager Cross Test",
        "email": f"mgr_cross_{ts}@greenwood.in",
        "password": "Password123!",
        "role": "SOCIETY_MANAGER",
        "organizationId": 2,
        "organizationName": "Greenwood Heights Residential Society"
    })
    token_mgr = res_mgr.json()["token"]
    headers_mgr = {"Authorization": f"Bearer {token_mgr}"}

    res_res = requests.post(f"{BASE_BACKEND}/api/auth/register", json={
        "name": "Resident Cross Test",
        "email": f"res_cross_{ts}@greenwood.in",
        "password": "Password123!",
        "role": "SOCIETY_RESIDENT",
        "organizationId": 2,
        "organizationName": "Greenwood Heights Residential Society"
    })
    token_res = res_res.json()["token"]
    headers_res = {"Authorization": f"Bearer {token_res}"}

    # 2. Resident creates a society maintenance issue
    print("\n--- Test 1: Create Society Maintenance Ticket ---")
    create_payload = {
        "organizationId": 2,
        "title": f"Main Water Supply Pipeline Burst {ts}",
        "description": "City municipal water pipe supplying society entrance has fractured. Extensive pooling at gate.",
        "category": "WATER_LEAKAGE",
        "buildingTower": f"Main Gate-{ts}",
        "unitFloor": "Compound Entrance",
        "residentName": "Resident Cross Test",
        "residentPhone": "+91 98765 00011",
        "priority": "HIGH"
    }
    res_issue = requests.post(f"{BASE_BACKEND}/api/society/issues", headers=headers_res, json=create_payload)
    assert res_issue.status_code == 200, f"Create issue failed: {res_issue.text}"
    issue_data = res_issue.json()
    issue_id = issue_data["id"]
    print(f"[OK] 1. Society Issue #{issue_id} created successfully.")

    # 3. Escalate to Civic / University Track
    print("\n--- Test 2: Escalate Society Issue to Civic / University Track ---")
    escalate_payload = {
        "reason": "Exceeds society compound maintenance. Requires Municipal Water Board and Civil Engineering team."
    }
    res_escalate = requests.post(f"{BASE_BACKEND}/api/society/issues/{issue_id}/escalate-to-civic",
                                 headers=headers_mgr,
                                 json=escalate_payload)
    assert res_escalate.status_code == 200, f"Escalate failed: {res_escalate.text}"
    escalated_data = res_escalate.json()
    assert escalated_data["isEscalatedToCivic"] == True, "Issue should be flagged as escalated to civic"
    assert escalated_data["linkedChallengeId"] is not None, "linkedChallengeId must be populated"
    linked_ch_id = escalated_data["linkedChallengeId"]
    print(f"[OK] 2. Society Issue #{issue_id} successfully escalated to Civic Challenge #{linked_ch_id}.")

    # 4. Verify Civic Challenge was created in public challenge repository
    print("\n--- Test 3: Verify Cross-Registered Civic Challenge Details ---")
    res_ch = requests.get(f"{BASE_BACKEND}/api/challenges/{linked_ch_id}")
    assert res_ch.status_code == 200, f"Challenge fetch failed: {res_ch.text}"
    ch_data = res_ch.json()
    assert ch_data["originType"] == "SOCIETY_ESCALATED"
    assert ch_data["linkedSocietyIssueId"] == issue_id
    assert ch_data["domain"] == "WATER"
    assert "[Society Escalation]" in ch_data["title"]
    print(f"[OK] 3. Civic Challenge verified: Origin={ch_data['originType']}, Domain={ch_data['domain']}, LinkedSocietyID={ch_data['linkedSocietyIssueId']}")

    # 5. Simulate Academic / Pilot Deployment on Civic Challenge
    print("\n--- Test 4: Bi-Directional Sync: University Deploys Field Pilot ---")
    pilot_payload = {
        "status": "PILOT",
        "assignedHei": "IIT Kharagpur / BIT Mesra Hydraulic Lab",
        "pilotResults": "Heavy-duty pressure bypass valve installed. Line stabilized."
    }
    # Nodal admin registers to update civic status
    res_adm = requests.post(f"{BASE_BACKEND}/api/auth/register", json={
        "name": "Nodal Officer Cross Test",
        "email": f"nodal_cross_{ts}@adhikar.gov.in",
        "password": "Password123!",
        "role": "NODAL_ADMIN",
        "district": "Ranchi"
    })
    token_adm = res_adm.json()["token"]
    headers_adm = {"Authorization": f"Bearer {token_adm}"}

    res_pilot = requests.put(f"{BASE_BACKEND}/api/challenges/{linked_ch_id}/status",
                             headers=headers_adm,
                             json=pilot_payload)
    assert res_pilot.status_code == 200, f"Pilot update failed: {res_pilot.text}"

    # Verify Society Issue synchronized civic stage to PILOT
    res_issue_synced = requests.get(f"{BASE_BACKEND}/api/society/issues/{issue_id}", headers=headers_res)
    assert res_issue_synced.status_code == 200
    synced_data = res_issue_synced.json()
    assert synced_data["civicStage"] == "PILOT", f"Expected civicStage=PILOT but got {synced_data['civicStage']}"
    assert synced_data["status"] == "IN_PROGRESS", f"Expected status=IN_PROGRESS but got {synced_data['status']}"
    print(f"[OK] 4. Civic stage 'PILOT' automatically synchronized to Society Issue #{issue_id}. Status: {synced_data['status']}")

    # 6. Resident Sign-off / Closure Verification
    print("\n--- Test 5: Resident Sign-Off & Bi-Directional Closure Verification ---")
    signoff_payload = {
        "rating": 5,
        "feedback": "Bypass line tested with society maintenance team. Full water pressure restored to all towers."
    }
    res_signoff = requests.post(f"{BASE_BACKEND}/api/society/issues/{issue_id}/sign-off",
                                headers=headers_res,
                                json=signoff_payload)
    assert res_signoff.status_code == 200, f"Sign-off failed: {res_signoff.text}"
    signed_data = res_signoff.json()
    assert signed_data["residentSignOffStatus"] == "VERIFIED"
    assert signed_data["residentRating"] == 5
    assert signed_data["status"] == "CLOSED"

    # Verify Civic Challenge was closed as RESOLVED with sign-off details
    res_ch_closed = requests.get(f"{BASE_BACKEND}/api/challenges/{linked_ch_id}")
    ch_closed_data = res_ch_closed.json()
    assert ch_closed_data["status"] == "RESOLVED"
    assert ch_closed_data["residentSignOffStatus"] == "VERIFIED"
    assert "Verified by Resident" in ch_closed_data["citizenFeedbackNotes"]
    print(f"[OK] 5. Resident sign-off closed both Society Issue #{issue_id} and Civic Challenge #{linked_ch_id} (Status: RESOLVED).")

    print("\n" + "=" * 70)
    print("ALL CROSS-WORKFLOW ESCALATION & SYNCHRONIZATION TESTS PASSED 100%!")
    print("=" * 70)

if __name__ == "__main__":
    run_cross_workflow_tests()
