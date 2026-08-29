# ============================================================
# ADHIKAR AI - 3-CLASS OBJECT DETECTION MODEL INTEGRATION GUIDE
# ============================================================

Classes:
  - 0: pothole        (Pothole Detection)
  - 1: garbage        (Garbage / Littering Detection)
  - 2: water_leakage  (Water Leakage / Standing Water Detection)

Model Files Included:
  - pothole_garbage_water_yolov8.pt  (Recommended 3-Class Production Model)
  - pothole_garbage_yolov8.pt        (Legacy 2-Class Model: Potholes + Garbage)
  - data.yaml                        (Dataset Class Mapping Config)
  - predict_sample.py                (Python Sample Integration Code)

Quick Setup in Python:
----------------------
1. Install Ultralytics YOLOv8:
   pip install ultralytics opencv-python

2. Sample Code to Run Inference in Backend / API:

   from ultralytics import YOLO

   # Load trained 3-class model
   model = YOLO("pothole_garbage_water_yolov8.pt")

   # Run prediction on an image
   results = model.predict(source="test_image.jpg", conf=0.25)

   for result in results:
       for box in result.boxes:
           class_id = int(box.cls[0])
           class_name = model.names[class_id]
           confidence = float(box.conf[0])
           bbox = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
           print(f"Detected {class_name} ({confidence*100:.1f}%) at {bbox}")
