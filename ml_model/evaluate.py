"""
Evaluation script for the crop disease detection CNN model.

Loads a trained model and evaluates it on a test dataset,
producing accuracy, loss, and a classification report.
"""

import os
import argparse

import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix

# Default paths
DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_model", "crop_disease_model.h5")
DEFAULT_TEST_DIR = os.path.join(os.path.dirname(__file__), "..", "dataset", "test")


def evaluate(model_path, test_dir, img_size=(224, 224), batch_size=32):
    """
    Evaluate a trained model on the test dataset.

    Args:
        model_path: Path to the saved model file (.h5).
        test_dir: Path to the test dataset directory.
        img_size: Target image size (height, width).
        batch_size: Batch size for evaluation.
    """
    model = tf.keras.models.load_model(model_path)

    test_datagen = ImageDataGenerator(rescale=1.0 / 255)

    test_generator = test_datagen.flow_from_directory(
        test_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode="categorical",
        shuffle=False,
    )

    # Overall evaluation
    loss, accuracy = model.evaluate(test_generator)
    print(f"\nTest Loss: {loss:.4f}")
    print(f"Test Accuracy: {accuracy:.4f}")

    # Detailed classification report
    predictions = model.predict(test_generator)
    predicted_classes = np.argmax(predictions, axis=1)
    true_classes = test_generator.classes
    class_labels = list(test_generator.class_indices.keys())

    print("\nClassification Report:")
    print(classification_report(true_classes, predicted_classes, target_names=class_labels))

    print("\nConfusion Matrix:")
    cm = confusion_matrix(true_classes, predicted_classes)
    print(cm)

    return {"loss": loss, "accuracy": accuracy, "confusion_matrix": cm}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate crop disease detection model")
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL_PATH, help="Path to trained model")
    parser.add_argument("--test-dir", type=str, default=DEFAULT_TEST_DIR, help="Path to test dataset directory")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    args = parser.parse_args()

    evaluate(args.model, args.test_dir, batch_size=args.batch_size)
