import os
from PIL import Image
from ultralytics import YOLO
from image_guardrails import comprehensive_safety_audit


DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(__file__), "weights", "best.pt")


def run_detection(
        image_path: str,
        model_path: str = DEFAULT_MODEL_PATH
):
    """
    Run Adhikar AI 4-Class Object Detection Model on an input image
    with pre-inference NSFW content moderation and AI-generation forensic verification.
    """
    if not os.path.exists(image_path):
        print(f"Error: Image '{image_path}' not found.")
        return []

    print(f"Auditing visual evidence: '{image_path}'...")
    try:
        with open(image_path, "rb") as f:
            raw_bytes = f.read()
        pil_img = Image.open(image_path).convert("RGB")
        
        # Stage 1: Safety & Authenticity Audit
        passed, err_type, err_msg, audit_data = comprehensive_safety_audit(pil_img, raw_bytes=raw_bytes)
        if not passed:
            print(f"\n[REJECTED] Photo Evidence Failed AI Safety Gate: {err_type}")
            print(f"Reason: {err_msg}")
            return {
                "verified": False,
                "errorType": err_type,
                "message": err_msg,
                "audit": audit_data
            }
        print("✓ Passed visual clarity, NSFW moderation, and synthetic AI generation checks.")
    except Exception as e:
        print(f"Warning during pre-inference safety audit: {e}")

    print(f"Loading AI model from {model_path}...")
    if not os.path.exists(model_path):
        print(f"Warning: Model file '{model_path}' not found.")
        return []

    model = YOLO(model_path)

    print("Running YOLOv8 hazard detection...")
    results = model.predict(source=image_path, conf=0.10, save=False)

    detections = []
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            class_name = model.names[class_id]
            confidence = float(box.conf[0].item())
            x1, y1, x2, y2 = [round(coord, 2) for coord in box.xyxy[0].tolist()]

            detections.append({
                "class_id": class_id,
                "class_name": class_name,
                "confidence": round(confidence, 4),
                "bbox": [x1, y1, x2, y2]
            })

    print(f"\nDetections for '{image_path}':")
    if not detections:
        print("No objects detected.")
    for item in detections:
        print(
            f" - [{item['class_name'].upper()}] "
            f"Confidence: {item['confidence'] * 100:.1f}% "
            f"Box: {item['bbox']}"
        )

    return detections


if __name__ == "__main__":
    print("Adhikar AI Model Inference Module")
    sample_file = "pothole-test.webp"
    if os.path.exists(sample_file):
        run_detection(sample_file)
    else:
        print(f"Module loaded. Pass an image path to run_detection(image_path).")

    