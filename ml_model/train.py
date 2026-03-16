"""
Training script for the crop disease detection CNN model.

Loads image data from the dataset directory, applies augmentation,
trains the model, and saves the trained weights.
"""

import os
import argparse

import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau

from model_architecture import build_model

# Default paths
DEFAULT_DATASET_DIR = os.path.join(os.path.dirname(__file__), "..", "dataset")
DEFAULT_MODEL_OUTPUT = os.path.join(os.path.dirname(__file__), "saved_model", "crop_disease_model.h5")


def get_data_generators(dataset_dir, img_size=(224, 224), batch_size=32):
    """
    Create training and validation data generators with augmentation.

    Args:
        dataset_dir: Path to dataset root containing class sub-directories.
        img_size: Target image size (height, width).
        batch_size: Number of images per batch.

    Returns:
        Tuple of (train_generator, val_generator).
    """
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=25,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        validation_split=0.2,
    )

    train_generator = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode="categorical",
        subset="training",
    )

    val_generator = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode="categorical",
        subset="validation",
    )

    return train_generator, val_generator


def train(dataset_dir, output_path, epochs=50, batch_size=32):
    """
    Train the crop disease detection model.

    Args:
        dataset_dir: Path to the dataset directory.
        output_path: Path to save the trained model.
        epochs: Maximum number of training epochs.
        batch_size: Batch size for training.
    """
    train_gen, val_gen = get_data_generators(dataset_dir, batch_size=batch_size)
    num_classes = train_gen.num_classes

    model = build_model(num_classes=num_classes)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    callbacks = [
        EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        ModelCheckpoint(output_path, monitor="val_accuracy", save_best_only=True),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6),
    ]

    history = model.fit(
        train_gen,
        epochs=epochs,
        validation_data=val_gen,
        callbacks=callbacks,
    )

    print(f"Model saved to {output_path}")
    return history


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train crop disease detection model")
    parser.add_argument("--dataset", type=str, default=DEFAULT_DATASET_DIR, help="Path to dataset directory")
    parser.add_argument("--output", type=str, default=DEFAULT_MODEL_OUTPUT, help="Path to save trained model")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    args = parser.parse_args()

    train(args.dataset, args.output, args.epochs, args.batch_size)
