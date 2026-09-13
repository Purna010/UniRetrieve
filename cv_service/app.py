import os
import cv2
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)


MODEL_PATH = os.path.join(os.path.dirname(__file__), "yolov5n.onnx")
LABELS_PATH = os.path.join(os.path.dirname(__file__), "coco.txt")


net = None
classes = []


if os.path.exists(MODEL_PATH) and os.path.exists(LABELS_PATH):
    try:
        net = cv2.dnn.readNetFromONNX(MODEL_PATH)
        net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
        with open(LABELS_PATH, "r") as f:
            classes = [line.strip() for line in f.readlines()]
        print("SUCCESS: OpenCV DNN loaded YOLOv5n model successfully.")
    except Exception as e:
        print(f"ERROR: Error loading YOLO model: {e}")
else:
    print("WARNING: YOLOv5n ONNX model or labels not found. Run download_model.py first.")


COCO_MAP = {

    "laptop": ("Electronics", "Laptop", ["electronics", "laptop", "device"]),
    "cell phone": ("Electronics", "Cell Phone", ["electronics", "phone", "device"]),
    "mouse": ("Electronics", "Computer Mouse", ["electronics", "mouse", "accessory"]),
    "keyboard": ("Electronics", "Keyboard", ["electronics", "keyboard", "accessory"]),
    "tv": ("Electronics", "Display Screen", ["electronics", "screen", "monitor"]),
    "remote": ("Electronics", "Remote Control", ["electronics", "remote", "accessory"]),
    "microwave": ("Electronics", "Microwave", ["electronics", "device", "appliance"]),
    "oven": ("Electronics", "Oven", ["electronics", "device", "appliance"]),
    "refrigerator": ("Electronics", "Refrigerator", ["electronics", "device", "appliance"]),

    "backpack": ("Bags & Luggage", "Backpack", ["bag", "backpack", "carrier"]),
    "handbag": ("Bags & Luggage", "Handbag", ["bag", "purse", "accessory"]),
    "suitcase": ("Bags & Luggage", "Suitcase", ["bag", "suitcase", "luggage"]),

    "umbrella": ("Accessories", "Umbrella", ["umbrella", "accessory", "utility"]),
    "tie": ("Accessories", "Necktie", ["clothing", "tie", "accessory"]),
    "clock": ("Accessories", "Clock / Watch", ["clock", "timepiece", "accessory"]),

    "bottle": ("Personal Items", "Bottle", ["bottle", "personal", "drinkware"]),
    "cup": ("Personal Items", "Cup / Mug", ["cup", "mug", "personal", "drinkware"]),
    "wine glass": ("Personal Items", "Glassware", ["glass", "drinkware", "personal"]),
    "bowl": ("Personal Items", "Bowl", ["bowl", "personal", "kitchen"]),
    "scissors": ("Personal Items", "Scissors", ["scissors", "utility", "tool"]),
    "teddy bear": ("Personal Items", "Soft Toy / Teddy Bear", ["toy", "teddy", "personal"]),
    "toothbrush": ("Personal Items", "Toothbrush", ["toothbrush", "personal", "hygiene"]),
    "hair drier": ("Personal Items", "Hair Drier", ["hairdrier", "personal", "appliance"]),
    "vase": ("Personal Items", "Vase / Pot", ["vase", "decor", "personal"]),

    "book": ("Books & Stationery", "Book", ["book", "stationery", "academic"]),

    "frisbee": ("Sports Equipment", "Frisbee", ["sports", "frisbee", "equipment"]),
    "skis": ("Sports Equipment", "Skis", ["sports", "skis", "equipment"]),
    "snowboard": ("Sports Equipment", "Snowboard", ["sports", "snowboard", "equipment"]),
    "sports ball": ("Sports Equipment", "Sports Ball", ["sports", "ball", "equipment"]),
    "kite": ("Sports Equipment", "Kite", ["sports", "kite", "equipment"]),
    "baseball bat": ("Sports Equipment", "Baseball Bat", ["sports", "bat", "equipment"]),
    "baseball glove": ("Sports Equipment", "Baseball Glove", ["sports", "glove", "equipment"]),
    "skateboard": ("Sports Equipment", "Skateboard", ["sports", "skateboard", "equipment"]),
    "surfboard": ("Sports Equipment", "Surfboard", ["sports", "surfboard", "equipment"]),
    "tennis racket": ("Sports Equipment", "Tennis Racket", ["sports", "racket", "equipment"]),
}

def get_dominant_color(img):
    """Resizes the image to 10x10 and finds the closest standard item color."""
    try:
        small_img = cv2.resize(img, (10, 10))
        small_img = cv2.cvtColor(small_img, cv2.COLOR_BGR2RGB)
        

        r = np.mean(small_img[:, :, 0])
        g = np.mean(small_img[:, :, 1])
        b = np.mean(small_img[:, :, 2])
        

        colors = [
            {"name": "Red", "r": 200, "g": 40, "b": 40},
            {"name": "Green", "r": 40, "g": 180, "b": 40},
            {"name": "Blue", "r": 40, "g": 80, "b": 200},
            {"name": "Black", "r": 35, "g": 35, "b": 40},
            {"name": "White", "r": 235, "g": 235, "b": 235},
            {"name": "Gray", "r": 120, "g": 120, "b": 120},
            {"name": "Brown", "r": 110, "g": 70, "b": 40},
            {"name": "Yellow", "r": 230, "g": 200, "b": 40},
            {"name": "Orange", "r": 230, "g": 120, "b": 30},
            {"name": "Purple", "r": 130, "g": 40, "b": 160},
        ]
        
        min_diff = float("inf")
        closest_color = "Black"
        
        for c in colors:
            diff = np.sqrt((r - c["r"])**2 + (g - c["g"])**2 + (b - c["b"])**2)
            if diff < min_diff:
                min_diff = diff
                closest_color = c["name"]
                
        return closest_color
    except Exception as e:
        print(f"Error calculating color: {e}")
        return "Black"

@app.route('/classify', methods=['POST'])
def classify():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
        
    file = request.files['image']
    filename = request.form.get('filename', '').lower()
    

    try:
        file_bytes = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    except Exception as e:
        return jsonify({"error": f"Failed to read image content: {e}"}), 400
        
    if image is None:
        return jsonify({"error": "Could not decode image"}), 400
        

    dominant_color = get_dominant_color(image)
    

    detected_objects = []
    
    if net is not None:
        try:

            blob = cv2.dnn.blobFromImage(image, 1/255.0, (640, 640), swapRB=True, crop=False)
            net.setInput(blob)
            outputs = net.forward()
            

            rows = outputs[0]
            boxes = []
            confidences = []
            class_ids = []
            
            for r in rows:
                confidence = r[4]
                if confidence >= 0.25:
                    classes_scores = r[5:]
                    class_id = np.argmax(classes_scores)
                    if classes_scores[class_id] > 0.25:
                        conf = classes_scores[class_id] * confidence
                        if conf > 0.3:
                            cx, cy, w, h = r[0], r[1], r[2], r[3]

                            boxes.append([cx, cy, w, h])
                            confidences.append(float(conf))
                            class_ids.append(int(class_id))
            

            indices = cv2.dnn.NMSBoxes(boxes, confidences, 0.3, 0.45)
            if len(indices) > 0:
                flat_indices = indices.flatten() if hasattr(indices, 'flatten') else [i[0] if isinstance(i, (list, np.ndarray)) else i for i in indices]
                for idx in flat_indices:
                    label = classes[class_ids[idx]]
                    conf = confidences[idx]
                    detected_objects.append({
                        "label": label,
                        "confidence": conf
                    })
        except Exception as e:
            print(f"WARNING: Error running YOLO model inference: {e}")


    category = "Other"
    title = f"{dominant_color} Item"
    tags = [dominant_color.lower()]
    confidence = 0
    yolo_matched = False
    
    if detected_objects:

        detected_objects = sorted(detected_objects, key=lambda x: x["confidence"], reverse=True)
        for obj in detected_objects:
            lbl = obj["label"]
            if lbl in COCO_MAP:
                cat_name, item_title, item_tags = COCO_MAP[lbl]
                category = cat_name
                title = f"{dominant_color} {item_title}"
                tags = list(set(item_tags + [dominant_color.lower(), lbl]))
                confidence = int(obj["confidence"] * 100)
                yolo_matched = True
                break


    if not yolo_matched and filename:
        MAPPING_RULES = [
            {
                "keywords": ['phone', 'cellular', 'dial', 'smartphone', 'iphone', 'handheld', 'mobile', 'laptop', 'notebook', 'computer', 'screen', 'monitor', 'keyboard', 'mouse', 'headphone', 'earphone', 'buds', 'headset', 'charger', 'cable', 'wire', 'usb', 'drive'],
                "category": 'Electronics',
                "title": 'Electronic Device',
                "tags": ['electronics', 'device', 'tech']
            },
            {
                "keywords": ['backpack', 'knapsack', 'rucksack', 'bag', 'purse', 'handbag', 'wallet', 'suitcase', 'luggage', 'duffel', 'briefcase', 'pouch', 'satchel', 'sack', 'tote'],
                "category": 'Bags & Luggage',
                "title": 'Bag / Backpack',
                "tags": ['bag', 'backpack', 'carrier']
            },
            {
                "keywords": ['glasses', 'spectacles', 'sunglasses', 'goggles', 'watch', 'clock', 'smartwatch', 'key', 'keychain', 'ring', 'necklace', 'bracelet', 'earring', 'jewelry', 'belt', 'scarf', 'tie', 'accessory'],
                "category": 'Accessories',
                "title": 'Accessory',
                "tags": ['accessory', 'wearable']
            },
            {
                "keywords": ['card', 'identity', 'license', 'document', 'passport', 'id', 'aadhaar', 'pan', 'ticket', 'pass', 'badge', 'credential'],
                "category": 'Documents & Cards',
                "title": 'Identity / Document',
                "tags": ['document', 'card', 'id']
            },
            {
                "keywords": ['bottle', 'flask', 'thermos', 'mug', 'cup', 'canteen', 'jar', 'umbrella', 'cosmetic', 'perfume', 'makeup', 'comb', 'brush', 'lipstick', 'mirror', 'sanitizer', 'soap', 'towel', 'personal'],
                "category": 'Personal Items',
                "title": 'Personal Item',
                "tags": ['personal', 'utility']
            },
            {
                "keywords": ['jacket', 'coat', 'sweater', 'shirt', 'clothing', 'jean', 'skirt', 'dress', 'hat', 'cap', 'shoe', 'boot', 'sandal', 'sock', 'glove', 't-shirt', 'pullover', 'apparel', 'garment', 'sneaker'],
                "category": 'Clothing',
                "title": 'Clothing / Apparel',
                "tags": ['clothing', 'apparel', 'wearable']
            },
            {
                "keywords": ['book', 'notebook', 'textbook', 'journal', 'pen', 'pencil', 'stationery', 'marker', 'eraser', 'ruler', 'scissors', 'stapler', 'folder', 'paper', 'envelope'],
                "category": 'Books & Stationery',
                "title": 'Book / Stationery',
                "tags": ['book', 'stationery', 'academic']
            },
            {
                "keywords": ['ball', 'bat', 'racket', 'glove', 'helmet', 'net', 'skateboard', 'bicycle', 'bike', 'jersey', 'cleats', 'pads', 'frisbee', 'dumbbell', 'weight', 'sports', 'athletics', 'fitness'],
                "category": 'Sports Equipment',
                "title": 'Sports Equipment',
                "tags": ['sports', 'equipment', 'athletics']
            }
        ]
        
        for rule in MAPPING_RULES:
            if any(k in filename for k in rule["keywords"]):
                category = rule["category"]
                title = f"{dominant_color} {rule['title']}"
                tags = list(set(rule["tags"] + [dominant_color.lower()]))
                confidence = 75
                yolo_matched = True
                break

    if not yolo_matched:
        confidence = 50

    return jsonify({
        "category": category,
        "title": title,
        "tags": tags,
        "confidence": confidence,
        "dominantColor": dominant_color,
        "yoloDetections": detected_objects
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "yolo_classifier",
        "modelLoaded": net is not None,
        "classesCount": len(classes)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)

