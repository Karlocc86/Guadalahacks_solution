from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np

# Import all dependencies using pip install -r requirements.txt

app = Flask(__name__)
CORS(app)  # This prevents the annoying CORS block errors with React!

# Load your custom model
model = YOLO('best.pt')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    # Read the image file sent by React
    file = request.files['image']
    image_bytes = file.read()
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Run YOLO with the hackathon settings we discussed
    # Low conf threshold so it forces a prediction, and low iou to clean up duplicates
    results = model(img, conf=0.15, iou=0.30, imgsz=640)
    
    boxes = results[0].boxes
    
    if len(boxes) == 0:
        return jsonify({
            'prediction': 'Clear skin / No injury detected',
            'severity': 'safe'
        })
    
    # HACKATHON SECRET: Grab the box with the highest confidence score
    best_box = max(boxes, key=lambda x: x.conf[0].item())
    class_id = int(best_box.cls[0].item())
    confidence = float(best_box.conf[0].item())
    
    # Map the class IDs to human-readable responses for your frontend UI
    if class_id == 0:
        return jsonify({
            'prediction': 'Potential Snake Bite Detected!',
            'severity': 'emergency',
            'confidence': f"{confidence * 100:.1f}%"
        })
    else:
        return jsonify({
            'prediction': 'Common Skin Injury / Insect Bite',
            'severity': 'warning',
            'confidence': f"{confidence * 100:.1f}%"
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)