import requests
import json
import time

BASE_BACKEND = "http://localhost:8085"
BASE_AI = "http://localhost:5000"

def run_phase2_tests():
    print("=" * 70)
    print("ADHIKAR AI - PHASE 2 RESIDENTIAL SOCIETY AUTOMATED VERIFICATION")
    print("=" * 70)

    ts = int(time.time())

    # -------------------------------------------------------------
    # Test 1: Register and Authenticate All 4 Roles
    # -------------------------------------------------------------
    print("\n--- Test 1: Role Authentication & Token Verification ---")
    
    # 1A: Civic Citizen
    email_citizen = f"citizen_{ts}@adhikar.in"
    res_cit = requests.post(f"{BASE_BACKEND}/api/auth/register", json={
        "name": "Civic Citizen User",
        "email": email_citizen,
        "password": "Password123!",
        "role": "CITIZEN",
        "district": "Ranchi"
    })
    assert res_cit.status_code == 200, f"Citizen reg failed: {res_cit.text}"
    token_citizen = res_cit.json()["token"]
    role_citizen = res_cit.json()["role"]
    assert role_citizen == "CITIZEN", "Role mismatch for Citizen"
    print(f"[OK] 1A. Civic Citizen authenticated. Role: {role_citizen}")

    # 1B: Civic Nodal Admin
    email_admin = f"admin_{ts}@adhikar.gov.in"
    res_adm = requests.post(f"{BASE_BACKEND}/api/auth/register", json={
        "name": "Civic Nodal Officer",
        "email": email_admin,
        "password": "Password123!",
        "role": "NODAL_ADMIN",
        "district": "Ranchi"
    })
    assert res_adm.status_code == 200, f"Admin reg failed: {res_adm.text}"
    token_admin = res_adm.json()["token"]
    role_admin = res_adm.json()["role"]
    assert role_admin == "NODAL_ADMIN", "Role mismatch for Admin"
    print(f"[OK] 1B. Civic Nodal Admin authenticated. Role: {role_admin}")

    # 1C: Greenwood Heights Society Resident (Org ID: 2)
    email_res = f"resident_{ts}@greenwood.in"
    res_resident = requests.post(f"{BASE_BACKEND}/api/auth/register", json={
        "name": "Aarav Roy",
        "email": email_res,
        "password": "Password123!",
        "role": "SOCIETY_RESIDENT",
        "organizationId": 2,
        "organizationName": "Greenwood Heights Residential Society"
    })
    assert res_resident.status_code == 200, f"Resident reg failed: {res_resident.text}"
    token_resident = res_resident.json()["token"]
    role_resident = res_resident.json()["role"]
    assert role_resident == "SOCIETY_RESIDENT", "Role mismatch for Society Resident"
    print(f"[OK] 1C. Society Resident authenticated. Role: {role_resident}, Org ID: 2")

    # 1D: Greenwood Heights Society Manager (Org ID: 2)
    email_mgr = f"manager_{ts}@greenwood.in"
    res_mgr = requests.post(f"{BASE_BACKEND}/api/auth/register", json={
        "name": "Col. Rajesh Verma",
        "email": email_mgr,
        "password": "Password123!",
        "role": "SOCIETY_MANAGER",
        "organizationId": 2,
        "organizationName": "Greenwood Heights Residential Society"
    })
    assert res_mgr.status_code == 200, f"Manager reg failed: {res_mgr.text}"
    token_mgr = res_mgr.json()["token"]
    role_mgr = res_mgr.json()["role"]
    assert role_mgr == "SOCIETY_MANAGER", "Role mismatch for Society Manager"
    print(f"[OK] 1D. Society Manager authenticated. Role: {role_mgr}, Org ID: 2")

    # 1E: Palm Meadows Society Resident (Org ID: 3, for Tenant Isolation Test)
    email_palm = f"palm_resident_{ts}@palm.in"
    res_palm = requests.post(f"{BASE_BACKEND}/api/auth/register", json={
        "name": "Vikram Sen",
        "email": email_palm,
        "password": "Password123!",
        "role": "SOCIETY_RESIDENT",
        "organizationId": 3,
        "organizationName": "Palm Meadows Luxury Condos"
    })
    token_palm = res_palm.json()["token"]
    print(f"[OK] 1E. Palm Meadows Resident authenticated. Role: SOCIETY_RESIDENT, Org ID: 3")

    headers_citizen = {"Authorization": f"Bearer {token_citizen}"}
    headers_resident = {"Authorization": f"Bearer {token_resident}"}
    headers_mgr = {"Authorization": f"Bearer {token_mgr}"}
    headers_palm = {"Authorization": f"Bearer {token_palm}"}

    # -------------------------------------------------------------
    # Test 2: Society-Specific Safety Triage & Guidance
    # -------------------------------------------------------------
    print("\n--- Test 2: Society AI Safety Triage & Emergency Guidance ---")
    
    # 2A: Exposed Wiring Hazard -> Escalate to CRITICAL
    issue_wire_payload = {
        "organizationId": 2,
        "title": "Sparking distribution board in corridor",
        "description": "Exposed wires sparking intermittently with burning plastic odor.",
        "category": "WIRING_HAZARD",
        "buildingTower": "Tower A",
        "unitFloor": "3rd Floor Lobby",
        "residentName": "Aarav Roy",
        "residentPhone": "+91 98765 11223",
        "priority": "LOW" # User attempted low priority!
    }
    res_wire = requests.post(f"{BASE_BACKEND}/api/society/issues", headers=headers_resident, json=issue_wire_payload)
    assert res_wire.status_code == 200, f"Create wire issue failed: {res_wire.text}"
    wire_data = res_wire.json()
    assert wire_data["priority"] == "CRITICAL", f"Expected CRITICAL but got {wire_data['priority']}"
    assert wire_data["safetyFlags"] == "ELECTRICAL_LIFE_SAFETY"
    assert "CRITICAL ELECTRICAL RISK" in wire_data["emergencyGuidance"]
    print(f"[OK] 2A. Exposed wiring escalated to CRITICAL with emergency guidance: '{wire_data['emergencyGuidance'][:45]}...'")

    # 2B: Elevator trapped passengers -> CRITICAL
    tower_b = f"Tower B-{ts}"
    issue_lift_payload = {
        "organizationId": 2,
        "title": f"Passengers stuck in lift cabin {ts}",
        "description": "2 residents trapped between 4th and 5th floor. Cabin fan is stopped.",
        "category": "ELEVATOR_LIFT",
        "buildingTower": tower_b,
        "unitFloor": "Lift Shaft 2",
        "residentName": "Aarav Roy",
        "residentPhone": "+91 98765 11223"
    }
    res_lift = requests.post(f"{BASE_BACKEND}/api/society/issues", headers=headers_resident, json=issue_lift_payload)
    lift_data = res_lift.json()
    assert lift_data["priority"] == "CRITICAL"
    assert lift_data["safetyFlags"] == "PASSENGER_ENTRAPMENT"
    print(f"[OK] 2B. Elevator passenger entrapment correctly assigned CRITICAL priority.")

    # -------------------------------------------------------------
    # Test 3: Tower Duplicate Clustering within Same Society
    # -------------------------------------------------------------
    print("\n--- Test 3: Tower-Level Duplicate Issue Clustering ---")
    
    # 3A: Second resident in Tower B reports same elevator issue
    corrob_lift_payload = {
        "organizationId": 2,
        "title": f"Lift not moving at 4th floor {ts}",
        "description": "Neighbor reporting passenger lift 2 is stopped.",
        "category": "ELEVATOR_LIFT",
        "buildingTower": tower_b,
        "unitFloor": "4th Floor",
        "residentName": "Sunita Verma",
        "residentPhone": "+91 98765 99887"
    }
    res_corrob = requests.post(f"{BASE_BACKEND}/api/society/issues", headers=headers_resident, json=corrob_lift_payload)
    corrob_data = res_corrob.json()
    assert corrob_data["isClusterMaster"] == False, "Corroborating ticket must not be cluster master"
    assert corrob_data["clusterId"] == lift_data["clusterId"], f"Expected clusterId={lift_data['clusterId']} but got {corrob_data['clusterId']}"
    
    # Verify Master's duplicateCount incremented
    target_cluster_id = lift_data["clusterId"]
    master_updated = requests.get(f"{BASE_BACKEND}/api/society/issues/{target_cluster_id}", headers=headers_resident).json()
    assert master_updated["duplicateCount"] >= 2, "Master duplicate count should be >= 2"
    print(f"[OK] 3. Corroborating Tower B elevator report linked to Cluster Master #{target_cluster_id}. Duplicate Count: {master_updated['duplicateCount']}")

    # -------------------------------------------------------------
    # Test 4: Multi-Tenant Data Isolation & Security Restrictions
    # -------------------------------------------------------------
    print("\n--- Test 4: Tenant Data Isolation & Cross-Org Access Rejection ---")
    
    # 4A: Resident of Palm Meadows (Org ID: 3) tries to access Greenwood Heights ticket (Org ID: 2)
    res_cross = requests.get(f"{BASE_BACKEND}/api/society/issues/{lift_data['id']}", headers=headers_palm)
    print(f"Cross-Org Access Status: {res_cross.status_code}")
    assert res_cross.status_code == 403, f"Security breach! Cross-org user was not forbidden: {res_cross.status_code}"
    print(f"[OK] 4A. Cross-organization read access rejected (403 Forbidden).")

    # 4B: Civic Citizen tries to access Society Manager status update endpoint
    res_cit_hack = requests.put(f"{BASE_BACKEND}/api/society/issues/{lift_data['id']}/status",
                                headers=headers_citizen,
                                json={"status": "RESOLVED"})
    print(f"Civic Citizen Access to Society Manager API Status: {res_cit_hack.status_code}")
    assert res_cit_hack.status_code == 403, f"Security breach! Citizen accessed manager endpoint: {res_cit_hack.status_code}"
    print(f"[OK] 4B. Civic Citizen forbidden from Society Manager endpoints (403 Forbidden).")

    # 4C: Society Resident tries to call Civic Nodal Admin priority override
    res_soc_hack = requests.put(f"{BASE_BACKEND}/api/challenges/1/override-priority",
                                headers=headers_resident,
                                json={"priority": "CRITICAL"})
    print(f"Society Resident Access to Civic Nodal Admin API Status: {res_soc_hack.status_code}")
    assert res_soc_hack.status_code == 403, f"Security breach! Society resident accessed civic admin endpoint: {res_soc_hack.status_code}"
    print(f"[OK] 4C. Society Resident forbidden from Civic Nodal Admin endpoints (403 Forbidden).")

    # -------------------------------------------------------------
    # Test 5: Society Manager Workflow, Audit Trail & Real Metrics
    # -------------------------------------------------------------
    print("\n--- Test 5: Society Manager Workflow, Audit Trail & Metrics ---")
    
    # 5A: Manager assigns staff and acknowledges issue
    update_ack = requests.put(f"{BASE_BACKEND}/api/society/issues/{lift_data['id']}/status",
                              headers=headers_mgr,
                              json={
                                  "status": "IN_PROGRESS",
                                  "assignedStaffName": "Otis Care Response Team",
                                  "assignedStaffRole": "Elevator & Lift OEM Specialist",
                                  "assignedStaffPhone": "+91 1800 220 334",
                                  "resolutionNotes": "OEM emergency technician on site. Brake interlocking sensor reset."
                              })
    assert update_ack.status_code == 200, f"Manager update failed: {update_ack.text}"
    ack_data = update_ack.json()
    assert ack_data["status"] == "IN_PROGRESS"
    assert ack_data["assignedStaffName"] == "Otis Care Response Team"
    print(f"[OK] 5A. Manager assigned 'Otis Care Response Team' and transitioned status to IN_PROGRESS.")

    # 5B: Manager marks issue as RESOLVED
    update_res = requests.put(f"{BASE_BACKEND}/api/society/issues/{lift_data['id']}/status",
                              headers=headers_mgr,
                              json={
                                  "status": "RESOLVED",
                                  "resolutionNotes": "Lift cabin door realigned. Cabin test completed across all floors. Safety clearance signed."
                              })
    assert update_res.status_code == 200
    res_data = update_res.json()
    assert res_data["status"] == "RESOLVED"
    assert res_data["resolvedAt"] is not None
    print(f"[OK] 5B. Manager marked ticket as RESOLVED with timestamp {res_data['resolvedAt']}.")

    # 5C: Verify Immutable Audit Log Trail
    res_audits = requests.get(f"{BASE_BACKEND}/api/society/issues/{lift_data['id']}/audits", headers=headers_mgr)
    assert res_audits.status_code == 200
    audits = res_audits.json()
    assert len(audits) >= 2, f"Expected at least 2 audit entries, found {len(audits)}"
    print(f"[OK] 5C. Verified {len(audits)} immutable audit records logged for Ticket #{lift_data['id']}.")

    # 5D: Manager unlinks secondary report from cluster
    res_sep = requests.post(f"{BASE_BACKEND}/api/society/issues/{corrob_data['id']}/separate-cluster", headers=headers_mgr)
    assert res_sep.status_code == 200
    sep_data = res_sep.json()
    assert sep_data["isClusterMaster"] == True
    assert sep_data["clusterId"] == corrob_data["id"]
    print(f"[OK] 5D. Secondary report #{corrob_data['id']} successfully unlinked into independent cluster master.")

    # 5E: Real KPI Dashboard Metrics Calculation
    res_metrics = requests.get(f"{BASE_BACKEND}/api/society/metrics", headers=headers_mgr)
    assert res_metrics.status_code == 200
    metrics = res_metrics.json()
    assert metrics["totalIssues"] >= 2
    assert metrics["resolvedIssues"] >= 1
    print(f"[OK] 5E. Authentic Metrics verified: Total={metrics['totalIssues']}, Resolved={metrics['resolvedIssues']}, AvgResolutionHours={metrics['averageResolutionHours']} hrs.")

    print("\n" + "=" * 70)
    print("ALL PHASE 2 VERIFICATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_phase2_tests()
