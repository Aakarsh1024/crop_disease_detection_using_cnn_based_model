"""
FastAPI backend for Crop Disease Detection.

Provides endpoints for image-based disease prediction, model
comparison data, and dataset statistics.
"""

import io
import traceback
import json

import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from huggingface_hub import hf_hub_download
from PIL import Image

from model.predict import (
    predict,
    preprocess_image,
    get_model_and_layer,
    CLASS_NAMES,
    format_class_name,
)
from utils.gradcam import generate_gradcam_base64

app = FastAPI(
    title="Crop Disease Detection API",
    description="Backend API for crop disease detection using EfficientNet-B0",
    version="1.0.0",
)

HF_REPO_ID = "aakarshhhhh/cropguard-model"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    print("Server started - model will load on first request")


# ---------------------------------------------------------------------------
# POST /api/predict
# ---------------------------------------------------------------------------
@app.post("/api/predict")
async def predict_disease(file: UploadFile = File(...)):
    """
    Accept an uploaded image and return disease predictions.

    Returns the top-5 predictions with confidence scores and,
    when available, a GradCAM heatmap overlay (base64 PNG).
    """
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not a valid image.",
        )

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the uploaded image.",
        )

    print(
        f"[api/predict] Prediction started for file={file.filename}, "
        f"content_type={file.content_type}"
    )

    try:
        predictions = predict(image, top_k=5)
    except Exception as e:
        print(f"[api/predict] Prediction error: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    # Attempt GradCAM generation (non-critical – skip on error)
    gradcam_image = None
    try:
        model, target_layer = get_model_and_layer()
        input_tensor = preprocess_image(image)
        original_np = np.array(image)
        gradcam_image = generate_gradcam_base64(
            model, target_layer, input_tensor, original_np
        )
    except Exception:
        pass  # GradCAM is optional; don't fail the request

    return {
        "predictions": predictions,
        "disease": predictions[0]["disease"] if predictions else "Unknown",
        "confidence": predictions[0]["confidence"] if predictions else 0,
        "gradcam": gradcam_image,
    }


@app.options("/api/predict")
async def predict_options():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )


# ---------------------------------------------------------------------------
# GET /api/models
# ---------------------------------------------------------------------------
@app.get("/api/models")
async def get_models():
    """
    Return comparison data for all evaluated models.

    This is static / pre-computed data used by the frontend
    comparison dashboard.
    """
    models_data = [
        {
            "name": "EfficientNet-B0",
            "accuracy": 99.81,
            "precision": 96.2,
            "recall": 96.0,
            "f1_score": 96.1,
            "parameters": "5.3M",
            "inference_time_ms": 12,
        },
        {
            "name": "ResNet-50",
            "accuracy": 94.8,
            "precision": 94.5,
            "recall": 94.3,
            "f1_score": 94.4,
            "parameters": "25.6M",
            "inference_time_ms": 18,
        },
        {
            "name": "VGG-16",
            "accuracy": 92.3,
            "precision": 92.0,
            "recall": 91.8,
            "f1_score": 91.9,
            "parameters": "138M",
            "inference_time_ms": 25,
        },
        {
            "name": "MobileNet-V2",
            "accuracy": 93.7,
            "precision": 93.4,
            "recall": 93.1,
            "f1_score": 93.2,
            "parameters": "3.4M",
            "inference_time_ms": 8,
        },
        {
            "name": "Custom CNN",
            "accuracy": 90.1,
            "precision": 89.8,
            "recall": 89.5,
            "f1_score": 89.6,
            "parameters": "2.1M",
            "inference_time_ms": 10,
        },
    ]

    return {"models": models_data}


@app.get("/api/results")
async def get_results():
    """
    Return full evaluation metrics from HuggingFace-hosted results.
    """
    try:
        results_path = hf_hub_download(
            repo_id=HF_REPO_ID,
            filename="real_results.json",
        )
        with open(results_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to load results data.",
        )


# ---------------------------------------------------------------------------
# GET /api/dataset-info
# ---------------------------------------------------------------------------
@app.get("/api/dataset-info")
async def get_dataset_info():
    """
    Return dataset statistics for the PlantVillage dataset.
    """
    class_list = [format_class_name(c) for c in CLASS_NAMES]

    return {
        "name": "PlantVillage Dataset",
        "total_images": 54303,
        "num_classes": len(CLASS_NAMES),
        "classes": class_list,
        "split": {
            "train": 43442,
            "validation": 5431,
            "test": 5430,
        },
        "image_size": "224x224",
        "crops": [
            "Apple", "Blueberry", "Cherry", "Corn", "Grape",
            "Orange", "Peach", "Pepper", "Potato", "Raspberry",
            "Soybean", "Squash", "Strawberry", "Tomato",
        ],
    }
