"""
Prediction module for crop disease detection.

Loads a PyTorch EfficientNet-B0 model fine-tuned on the
PlantVillage dataset and provides inference utilities with
mock-data fallback when no trained weights are available.
"""

import os
import random
import json

import numpy as np
import torch
import torch.nn.functional as F
from torchvision import transforms, models
from PIL import Image
from huggingface_hub import hf_hub_download


# 38 PlantVillage disease classes
DEFAULT_CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites_Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

CLASS_NAMES = DEFAULT_CLASS_NAMES
NUM_CLASSES = len(CLASS_NAMES)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "weights")
MODEL_PATH = os.path.join(MODEL_DIR, "efficientnet_b0_plant.pth")
HF_REPO_ID = "aakarshhhhh/cropguard-model"
HF_MODEL_FILENAME = "efficientnet_b0_plant.pth"
HF_CLASS_NAMES_FILENAME = "class_names.json"

# ImageNet normalization constants used by torchvision pretrained models
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Preprocessing pipeline
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])

# Module-level model cache
_model = None
_using_mock = False


def _initialize_assets() -> None:
    """Download model weights and class names from HuggingFace."""
    global CLASS_NAMES, NUM_CLASSES, MODEL_PATH

    os.makedirs(MODEL_DIR, exist_ok=True)

    try:
        MODEL_PATH = hf_hub_download(
            repo_id=HF_REPO_ID,
            filename=HF_MODEL_FILENAME,
            local_dir=MODEL_DIR,
        )
    except Exception:
        pass

    try:
        class_names_path = hf_hub_download(
            repo_id=HF_REPO_ID,
            filename=HF_CLASS_NAMES_FILENAME,
            local_dir=MODEL_DIR,
        )
        with open(class_names_path, "r", encoding="utf-8") as f:
            class_names = json.load(f)
        if isinstance(class_names, list) and class_names:
            CLASS_NAMES = class_names
            NUM_CLASSES = len(CLASS_NAMES)
    except Exception:
        pass


def format_class_name(raw: str) -> str:
    """Convert raw class name to human-readable format."""
    parts = raw.split("___")
    crop = parts[0].replace("_", " ")
    condition = parts[1].replace("_", " ") if len(parts) > 1 else ""
    return f"{crop} - {condition}".strip(" -")


def build_efficientnet(num_classes: int = NUM_CLASSES) -> torch.nn.Module:
    """
    Build an EfficientNet-B0 model adapted for the given number of classes.

    Args:
        num_classes: Number of output classes.

    Returns:
        A PyTorch EfficientNet-B0 model.
    """
    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = torch.nn.Linear(in_features, num_classes)
    return model


def load_model() -> torch.nn.Module:
    """
    Load the trained EfficientNet-B0 model.

    Falls back to an uninitialised model (mock mode) when no
    saved weights file is found, so the API can still return
    demo predictions.

    Returns:
        PyTorch model in eval mode.
    """
    global _model, _using_mock

    if _model is not None:
        return _model

    model = build_efficientnet()

    if os.path.isfile(MODEL_PATH):
        state = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
        model.load_state_dict(state)
        _using_mock = False
    else:
        _using_mock = True

    model.eval()
    _model = model
    return _model


def preprocess_image(image: Image.Image) -> torch.Tensor:
    """
    Preprocess a PIL image for model input.

    Args:
        image: A PIL Image (any mode/size).

    Returns:
        A tensor of shape (1, 3, 224, 224).
    """
    if image.mode != "RGB":
        image = image.convert("RGB")
    return preprocess(image).unsqueeze(0)


def predict(image: Image.Image, top_k: int = 5) -> list[dict]:
    """
    Run inference and return top-k predictions.

    If the model weights are not available, returns plausible
    mock predictions for demonstration purposes.

    Args:
        image: A PIL Image.
        top_k: Number of top predictions to return.

    Returns:
        List of dicts with ``disease`` (str) and ``confidence`` (float, 0-100).
    """
    if _using_mock and _model is not None:
        return _mock_predictions(top_k)

    model = load_model()

    if _using_mock:
        return _mock_predictions(top_k)

    tensor = preprocess_image(image)

    with torch.no_grad():
        logits = model(tensor)
        probs = F.softmax(logits, dim=1)[0]

    top_probs, top_indices = torch.topk(probs, top_k)

    results = []
    for prob, idx in zip(top_probs, top_indices):
        results.append({
            "disease": format_class_name(CLASS_NAMES[idx.item()]),
            "confidence": round(prob.item() * 100, 2),
        })

    return results


def get_model_and_layer():
    """
    Return the loaded model and its last convolutional layer
    (for GradCAM visualisation).

    Returns:
        Tuple of (model, target_layer).
    """
    model = load_model()
    target_layer = model.features[-1]
    return model, target_layer


def _mock_predictions(top_k: int = 5) -> list[dict]:
    """Generate plausible mock predictions for demo mode."""
    indices = random.sample(range(NUM_CLASSES), min(top_k, NUM_CLASSES))
    names = [format_class_name(CLASS_NAMES[i]) for i in indices]

    # Generate Dirichlet-distributed scores so they are realistic
    raw = [random.random() ** 0.5 for _ in names]
    raw.sort(reverse=True)
    total = sum(raw)
    confidences = [round((r / total) * 100, 2) for r in raw]

    return [
        {"disease": name, "confidence": conf}
        for name, conf in zip(names, confidences)
    ]


_initialize_assets()
