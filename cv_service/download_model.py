import os
import urllib.request

MODEL_URL = "https://github.com/ultralytics/yolov5/releases/download/v7.0/yolov5n.onnx"
MODEL_PATH = os.path.join(os.path.dirname(__file__), "yolov5n.onnx")
LABELS_PATH = os.path.join(os.path.dirname(__file__), "coco.txt")

COCO_CLASSES = [
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light",
    "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow",
    "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee",
    "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard",
    "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
    "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch",
    "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone",
    "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear",
    "hair drier", "toothbrush"
]

def download_model():
    print("Downloading YOLOv5n ONNX model (~7.5 MB)...")
    if not os.path.exists(MODEL_PATH):
        try:
            urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
            print(f"SUCCESS: Downloaded model to {MODEL_PATH}")
        except Exception as e:
            print(f"ERROR: Failed to download model: {e}")
            raise e
    else:
        print("Model file already exists.")

def write_labels():
    print("Writing COCO classes labels...")
    with open(LABELS_PATH, "w") as f:
        for cls in COCO_CLASSES:
            f.write(cls + "\n")
    print(f"SUCCESS: Written classes list to {LABELS_PATH}")

if __name__ == "__main__":
    download_model()
    write_labels()
