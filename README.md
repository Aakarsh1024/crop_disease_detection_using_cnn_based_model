# Crop Disease Detection Using CNN-Based Model

A web application for detecting crop diseases from leaf images using a Convolutional Neural Network (CNN). The project combines a React frontend with a Python (FastAPI) backend and a TensorFlow/Keras ML pipeline.

## Project Structure

```
├── backend/                # FastAPI backend
│   ├── model/              # Prediction utilities
│   ├── utils/              # Helper modules (e.g., Grad-CAM)
│   ├── main.py             # API entry point
│   └── requirements.txt    # Python dependencies
├── ml_model/               # ML training & evaluation
│   ├── model_architecture.py   # CNN architecture definition
│   ├── train.py            # Training script
│   └── evaluate.py         # Evaluation script
├── src/                    # React frontend source
│   ├── pages/              # Page components
│   └── components/         # Reusable UI components
├── package.json            # Node.js dependencies
├── vite.config.js          # Vite bundler configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md
```

## Features

- **Disease Classification** – Upload a leaf image and get an instant prediction of the disease category.
- **Grad-CAM Visualisation** – See which regions of the image the model focuses on.
- **Interactive Dashboard** – View accuracy metrics, charts, and model comparisons.
- **Voice Assistant** – Hands-free interaction for accessibility.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Python, FastAPI |
| ML | TensorFlow / Keras, scikit-learn |

## Getting Started

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Training the Model

```bash
cd ml_model
python train.py --dataset ../dataset --epochs 50
```

### Evaluating the Model

```bash
cd ml_model
python evaluate.py --model saved_model/crop_disease_model.h5 --test-dir ../dataset/test
```

## License

This project is for educational and research purposes.
