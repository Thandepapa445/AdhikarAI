from ultralytics import YOLO


def run_detection(
        image_path: str,
        model_path: str = "models/pothole_garbage_water_yolov8.pt"
):
    """
    Run Sankalp AI 3-Class Object Detection Model on an input image.

    Classes:
        0: pothole
        1: garbage
        2: water_leakage
    """

    print("Loading AI model...")

    # Load trained YOLOv8 model
    model = YOLO(model_path)

    print("Running detection...")

    # Run inference
    results = model.predict(source=image_path, conf=0.10, save=False)
    

    detections = []

    for result in results:
        for box in result.boxes:

            class_id = int(box.cls[0].item())
            class_name = model.names[class_id]

            confidence = float(box.conf[0].item())

            x1, y1, x2, y2 = [
                round(coord, 2)
                for coord in box.xyxy[0].tolist()
            ]

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

    print("Sankalp AI Model Inference Module")

    run_detection(
        "water-test.jpeg",
        "models/pothole_garbage_water_yolov8.pt"
    )