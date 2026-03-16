"""
Domain shift utilities for testing model robustness.

Provides functions to apply common image transformations
(brightness, contrast, blur, noise) that simulate domain shift
conditions a model might encounter in real-world deployment.
"""

import numpy as np
import cv2


def adjust_brightness(image: np.ndarray, factor: float = 1.3) -> np.ndarray:
    """
    Adjust the brightness of an image.

    Args:
        image: Input image as a NumPy array (BGR or RGB, uint8).
        factor: Brightness multiplier. >1 brightens, <1 darkens.

    Returns:
        Brightness-adjusted image as uint8 NumPy array.
    """
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * factor, 0, 255)
    hsv = hsv.astype(np.uint8)
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)


def adjust_contrast(image: np.ndarray, factor: float = 1.5) -> np.ndarray:
    """
    Adjust the contrast of an image.

    Args:
        image: Input image as a NumPy array (BGR or RGB, uint8).
        factor: Contrast multiplier. >1 increases contrast, <1 decreases.

    Returns:
        Contrast-adjusted image as uint8 NumPy array.
    """
    mean = np.mean(image, axis=(0, 1), keepdims=True)
    adjusted = mean + factor * (image.astype(np.float32) - mean)
    return np.clip(adjusted, 0, 255).astype(np.uint8)


def apply_blur(image: np.ndarray, kernel_size: int = 5) -> np.ndarray:
    """
    Apply Gaussian blur to an image.

    Args:
        image: Input image as a NumPy array (BGR or RGB, uint8).
        kernel_size: Size of the Gaussian kernel (must be odd and positive).

    Returns:
        Blurred image as uint8 NumPy array.
    """
    if kernel_size % 2 == 0:
        kernel_size += 1
    return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)


def add_noise(image: np.ndarray, mean: float = 0, std: float = 25) -> np.ndarray:
    """
    Add Gaussian noise to an image.

    Args:
        image: Input image as a NumPy array (BGR or RGB, uint8).
        mean: Mean of the Gaussian noise distribution.
        std: Standard deviation of the Gaussian noise.

    Returns:
        Noisy image as uint8 NumPy array.
    """
    noise = np.random.normal(mean, std, image.shape).astype(np.float32)
    noisy = image.astype(np.float32) + noise
    return np.clip(noisy, 0, 255).astype(np.uint8)


def apply_all_shifts(image: np.ndarray) -> dict:
    """
    Apply all domain shift transformations to an image.

    Args:
        image: Input image as a NumPy array (BGR or RGB, uint8).

    Returns:
        Dictionary mapping transformation name to the transformed image.
    """
    return {
        "brightness": adjust_brightness(image),
        "contrast": adjust_contrast(image),
        "blur": apply_blur(image),
        "noise": add_noise(image),
    }
