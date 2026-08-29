import os
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# Load trained 3-Class YOLOv8 model for visual evidence audit
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "pothole_garbage_water_yolov8.pt")
print(f"Loading Sankalp AI YOLOv8 Vision Model from {MODEL_PATH}...")

try:
    vision_model = YOLO(MODEL_PATH)
    print("✓ YOLOv8 Vision Model loaded successfully.")
except Exception as e:
    print(f"Warning: Model file not loaded automatically: {e}")
    vision_model = None

# Class Mapping to Jharkhand Thematic Domains
DOMAIN_MAPPING = {
    "water_leakage": {
        "domain": "WATER",
        "domainName": "Water Resources & Management",
        "defaultUrgency": "HIGH",
        "suggestedHei": "BIT Mesra (Clean Water FabLab)"
    },
    "pothole": {
        "domain": "INFRASTRUCTURE",
        "domainName": "Rural & Urban Infrastructure",
        "defaultUrgency": "MEDIUM",
        "suggestedHei": "NIT Jamshedpur (Low-Cost Road Materials Lab)"
    },
    "garbage": {
        "domain": "HEALTHCARE",
        "domainName": "Healthcare & Sanitation",
        "defaultUrgency": "MEDIUM",
        "suggestedHei": "Ranchi University (Community Health Wing)"
    }
}

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "Sankalp AI Multi-Modal Evidence Verification Engine",
        "modelLoaded": vision_model is not None,
        "classes": ["pothole", "garbage", "water_leakage"]
    })

@app.route("/api/v1/detect", methods=["POST"])
def detect_visual_evidence():
    """
    Accepts an uploaded image file or image URL and runs YOLOv8 inference to verify
    whether the uploaded photo contains physical evidence of the reported civic hazard.
    """
    if "file" not in request.files and not request.json:
        return jsonify({"error": "No image file or URL provided"}), 400

    if vision_model is None:
        return jsonify({
            "verified": True,
            "detections": [],
            "message": "AI Vision engine running in mock verification mode."
        })

    try:
        # Read image from multipart upload
        if "file" in request.files:
            file = request.files["file"]
            img_bytes = file.read()
            image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        else:
            image_url = request.json.get("image_url")
            image = image_url

        # Run YOLO inference
        results = vision_model.predict(source=image, conf=0.15, save=False)
        detections = []

        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0].item())
                class_name = vision_model.names[class_id]
                conf = float(box.conf[0].item())
                bbox = [round(x, 2) for x in box.xyxy[0].tolist()]

                domain_rec = DOMAIN_MAPPING.get(class_name, {
                    "domain": "INFRASTRUCTURE",
                    "domainName": "Rural & Urban Infrastructure",
                    "defaultUrgency": "MEDIUM",
                    "suggestedHei": "BIT Mesra"
                })

                detections.append({
                    "class_id": class_id,
                    "class_name": class_name,
                    "confidence": round(conf, 4),
                    "confidencePercent": f"{conf * 100:.1f}%",
                    "bbox": bbox,
                    "recommendedDomain": domain_rec["domain"],
                    "domainName": domain_rec["domainName"],
                    "suggestedHei": domain_rec["suggestedHei"]
                })

        is_verified = len(detections) > 0
        primary_detection = detections[0] if is_verified else None

        return jsonify({
            "isVisualEvidenceVerified": is_verified,
            "totalDetections": len(detections),
            "primaryClass": primary_detection["class_name"] if primary_detection else None,
            "highestConfidence": primary_detection["confidence"] if primary_detection else 0.0,
            "recommendedDomain": primary_detection["recommendedDomain"] if primary_detection else None,
            "suggestedHei": primary_detection["suggestedHei"] if primary_detection else None,
            "allDetections": detections
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
