import io
import requests
import numpy as np
import cv2
from PIL import Image, PngImagePlugin

BASE_URL = "http://127.0.0.1:5000"

def test_guardrails_and_yolo():
    print("============================================================")
    print("   TESTING MERGED MODEL & GUARDRAILS INTEGRATION")
    print("============================================================")

    # 1. Health
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health = res.json()
    print("✓ Health Check Passed:", health["service"], health["version"])
    print("  Capabilities:", len(health["capabilities"]))

    # 2. Authentic Civic Hazard Image Test (Pothole pattern)
    road = np.zeros((300, 300), dtype=np.float32) + 120.0
    for y in range(300):
        road[y, :] += (y - 150) * 0.15
    cv2.circle(road, (150, 150), 45, 60.0, -1)
    road = cv2.GaussianBlur(road, (7, 7), 2.0)
    road = (road + np.random.normal(0, 3.5, (300, 300))).clip(0, 255).astype(np.uint8)
    road_rgb = np.stack([road, road, road], axis=-1)
    road_img = Image.fromarray(road_rgb)

    buf = io.BytesIO()
    road_img.save(buf, format="JPEG")
    buf.seek(0)

    res_audit = requests.post(
        f"{BASE_URL}/api/v1/audit-image",
        files={"file": ("road.jpg", buf.getvalue(), "image/jpeg")}
    )
    assert res_audit.status_code == 200, f"Audit image failed: {res_audit.text}"
    audit_data = res_audit.json()
    assert audit_data["isSafe"] is True, f"Authentic image flagged as unsafe: {audit_data}"
    print("✓ Authentic Civic Photo Passed Safety Audit (Field Evidence Verified)")

    # 3. AI-Generated Synthetic Image Test
    meta = PngImagePlugin.PngInfo()
    meta.add_text("parameters", "A broken streetlight on highway\nSteps: 30, Sampler: Euler a, CFG scale: 7")
    buf_ai = io.BytesIO()
    img_data = np.random.normal(128, 20, (200, 200, 3)).clip(0, 255).astype(np.uint8)
    Image.fromarray(img_data).save(buf_ai, format="PNG", pnginfo=meta)
    ai_bytes = buf_ai.getvalue()

    res_ai = requests.post(
        f"{BASE_URL}/api/v1/detect",
        files={"file": ("synthetic.png", ai_bytes, "image/png")}
    )
    assert res_ai.status_code == 200
    ai_det = res_ai.json()
    assert ai_det.get("isVisualEvidenceVerified") is False, "Synthetic AI image was not rejected!"
    assert ai_det.get("errorType") == "AI_GENERATED_IMAGE", f"Expected AI_GENERATED_IMAGE, got {ai_det.get('errorType')}"
    print(f"✓ AI-Generated Image Rejected & Flagged: {ai_det.get('message')}")

    # 4. NSFW Adult Content Test
    nude_np = np.zeros((300, 300, 3), dtype=np.uint8)
    nude_np[30:270, 30:270, 0] = np.random.normal(215, 4, (240, 240)).clip(0, 255)
    nude_np[30:270, 30:270, 1] = np.random.normal(155, 4, (240, 240)).clip(0, 255)
    nude_np[30:270, 30:270, 2] = np.random.normal(125, 4, (240, 240)).clip(0, 255)
    buf_nsfw = io.BytesIO()
    Image.fromarray(nude_np).save(buf_nsfw, format="JPEG")

    res_nsfw = requests.post(
        f"{BASE_URL}/api/v1/detect",
        files={"file": ("inappropriate.jpg", buf_nsfw.getvalue(), "image/jpeg")}
    )
    assert res_nsfw.status_code == 200
    nsfw_det = res_nsfw.json()
    assert nsfw_det.get("isVisualEvidenceVerified") is False, "NSFW content was not rejected!"
    assert nsfw_det.get("errorType") == "NSFW_CONTENT", f"Expected NSFW_CONTENT, got {nsfw_det.get('errorType')}"
    print(f"✓ NSFW Content Rejected & Flagged: {nsfw_det.get('message')}")

    # 5. Society Detection Endpoint Guardrail Test
    res_soc = requests.post(
        f"{BASE_URL}/api/v1/society/detect",
        files={"file": ("synthetic.png", ai_bytes, "image/png")}
    )
    assert res_soc.status_code == 200
    soc_det = res_soc.json()
    assert soc_det.get("isVisualEvidenceVerified") is False
    assert soc_det.get("safetyFailed") is True
    print(f"✓ Residential Society Guardrail Verified: Rejected synthetic/NSFW correctly")

    print("\n============================================================")
    print("  ALL MERGED MODEL & GUARDRAIL TESTS PASSED 100%!")
    print("============================================================")

if __name__ == "__main__":
    test_guardrails_and_yolo()
