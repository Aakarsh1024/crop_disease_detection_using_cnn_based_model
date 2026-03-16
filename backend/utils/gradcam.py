"""
GradCAM implementation for EfficientNet models.

Generates class activation heatmaps to visualize which regions
of the input image the model focuses on when making predictions.
"""

import io
import base64

import numpy as np
import cv2
import torch
import torch.nn.functional as F
from PIL import Image


class GradCAM:
    """
    Gradient-weighted Class Activation Mapping for PyTorch models.

    Hooks into a target convolutional layer to capture activations
    and gradients, then produces a heatmap highlighting important
    regions for a given class prediction.
    """

    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module):
        """
        Args:
            model: A PyTorch model in eval mode.
            target_layer: The convolutional layer to visualize.
        """
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

        self._register_hooks()

    def _register_hooks(self):
        """Register forward and backward hooks on the target layer."""

        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()

        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)

    def generate(self, input_tensor: torch.Tensor, class_idx: int = None) -> np.ndarray:
        """
        Generate a GradCAM heatmap for the given input.

        Args:
            input_tensor: Preprocessed input tensor of shape (1, C, H, W).
            class_idx: Target class index. If None, uses the predicted class.

        Returns:
            Heatmap as a NumPy array of shape (H, W) with values in [0, 1].
        """
        self.model.eval()
        output = self.model(input_tensor)

        if class_idx is None:
            class_idx = output.argmax(dim=1).item()

        self.model.zero_grad()
        target = output[0, class_idx]
        target.backward()

        gradients = self.gradients[0]
        activations = self.activations[0]

        weights = gradients.mean(dim=(1, 2))

        cam = torch.zeros(activations.shape[1:], dtype=activations.dtype)
        for i, w in enumerate(weights):
            cam += w * activations[i]

        cam = F.relu(cam)

        cam = cam - cam.min()
        if cam.max() > 0:
            cam = cam / cam.max()

        return cam.cpu().numpy()


def generate_gradcam_base64(
    model: torch.nn.Module,
    target_layer: torch.nn.Module,
    input_tensor: torch.Tensor,
    original_image: np.ndarray,
    class_idx: int = None,
    alpha: float = 0.5,
) -> str:
    """
    Generate a GradCAM overlay and return it as a base64-encoded PNG.

    Args:
        model: PyTorch model in eval mode.
        target_layer: Target convolutional layer for GradCAM.
        input_tensor: Preprocessed input tensor (1, C, H, W).
        original_image: Original image as a NumPy array (H, W, 3), RGB, uint8.
        class_idx: Target class index (None for predicted class).
        alpha: Blending weight for the heatmap overlay.

    Returns:
        Base64-encoded string of the overlay PNG image.
    """
    gradcam = GradCAM(model, target_layer)
    heatmap = gradcam.generate(input_tensor, class_idx)

    h, w = original_image.shape[:2]
    heatmap_resized = cv2.resize(heatmap, (w, h))
    heatmap_color = cv2.applyColorMap(
        (heatmap_resized * 255).astype(np.uint8), cv2.COLORMAP_JET
    )
    heatmap_rgb = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)

    overlay = (
        (1 - alpha) * original_image.astype(np.float32)
        + alpha * heatmap_rgb.astype(np.float32)
    )
    overlay = np.clip(overlay, 0, 255).astype(np.uint8)

    pil_image = Image.fromarray(overlay)
    buffer = io.BytesIO()
    pil_image.save(buffer, format="PNG")
    buffer.seek(0)

    return base64.b64encode(buffer.read()).decode("utf-8")
