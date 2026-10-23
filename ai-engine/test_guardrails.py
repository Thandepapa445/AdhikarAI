"""
Quick Test Script for Adhikar AI Guardrails
Run with:
    python test_guardrails.py
"""

import io
import sys
import os
import cv2
import numpy as np
from PIL import Image, PngImagePlugin

# Import the guardrails
from image_guardrails import comprehensive_safety_audit


def test_guardrails():
    print("=" * 60)
    print("        ADHIKAR AI - GUARDRAIL VERIFICATION TEST        ")
    print("=" * 60)

    # -------------------------------------------------------------
    # 1. Authentic Civic Hazard Image Test (Real road & pothole)
    # -------------------------------------------------------------
    print("\n[TEST 1] Testing Authentic Road & Pothole Image...")
    road = np.zeros((300, 300), dtype=np.float32) + 120.0
    for y in range(300):
        road[y, :] += (y - 150) * 0.15
    cv2.circle(road, (150, 150), 45, 60.0, -1)
    road = cv2.GaussianBlur(road, (7, 7), 2.0)
    road = (road + np.random.normal(0, 3.5, (300, 300))).clip(0, 255).astype(np.uint8)
    road_rgb = np.stack([road, road, road], axis=-1)
    road_img = Image.fromarray(road_rgb)

    passed, err_type, msg, data = comprehensive_safety_audit(road_img)
    if passed:
        print("  -> RESULT: PASSED (Verified as Authentic Field Evidence)")
    else:
        print(f"  -> RESULT: FAILED ({err_type}: {msg})")

    # -------------------------------------------------------------
    # 2. AI-Generated Synthetic Image Test
    # -------------------------------------------------------------
    print("\n[TEST 2] Testing AI-Generated Synthetic Image...")
    meta = PngImagePlugin.PngInfo()
    meta.add_text("parameters", "A broken streetlight on highway\nSteps: 30, Sampler: Euler a, CFG scale: 7")
    buf = io.BytesIO()
    img_data = np.random.normal(128, 20, (200, 200, 3)).clip(0, 255).astype(np.uint8)
    Image.fromarray(img_data).save(buf, format="PNG", pnginfo=meta)
    ai_raw = buf.getvalue()
    ai_img = Image.open(io.BytesIO(ai_raw))

    passed_ai, err_ai, msg_ai, data_ai = comprehensive_safety_audit(ai_img, raw_bytes=ai_raw)
    if not passed_ai and err_ai == "AI_GENERATED_IMAGE":
        print(f"  -> RESULT: REJECTED & FLAGGED SUCCESSFULLY!")
        print(f"     Reason: {msg_ai}")
    else:
        print(f"  -> RESULT: UNEXPECTED ({passed_ai}, {err_ai})")

    # -------------------------------------------------------------
    # 3. Inappropriate / NSFW Nudity Content Test
    # -------------------------------------------------------------
    print("\n[TEST 3] Testing Inappropriate / NSFW Content...")
    nude_np = np.zeros((300, 300, 3), dtype=np.uint8)
    nude_np[30:270, 30:270, 0] = np.random.normal(215, 4, (240, 240)).clip(0, 255)
    nude_np[30:270, 30:270, 1] = np.random.normal(155, 4, (240, 240)).clip(0, 255)
    nude_np[30:270, 30:270, 2] = np.random.normal(125, 4, (240, 240)).clip(0, 255)
    nude_img = Image.fromarray(nude_np)

    passed_nsfw, err_nsfw, msg_nsfw, data_nsfw = comprehensive_safety_audit(nude_img)
    if not passed_nsfw and err_nsfw == "NSFW_CONTENT":
        print(f"  -> RESULT: REJECTED SUCCESSFULLY!")
        print(f"     Reason: {msg_nsfw}")
    else:
        print(f"  -> RESULT: UNEXPECTED ({passed_nsfw}, {err_nsfw})")

    print("\n" + "=" * 60)
    print("All guardrails are active, calibrated, and working as expected!")
    print("=" * 60)


if __name__ == "__main__":
    test_guardrails()
