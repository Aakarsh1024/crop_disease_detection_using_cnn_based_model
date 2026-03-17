import importlib
import io
import json
import os
import sys
import tempfile
import unittest
import asyncio
from unittest import mock
from fastapi import HTTPException
from PIL import Image
from starlette.datastructures import UploadFile


class HuggingFaceIntegrationTests(unittest.TestCase):
    def setUp(self):
        sys.modules.pop("backend.main", None)
        sys.modules.pop("backend.model.predict", None)

    def test_predict_initializes_model_and_classes_from_hf(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            model_path = os.path.join(tmpdir, "efficientnet_b0_plant.pth")
            class_names_path = os.path.join(tmpdir, "class_names.json")
            calls = []

            with open(model_path, "wb") as f:
                f.write(b"model")
            with open(class_names_path, "w", encoding="utf-8") as f:
                json.dump(["Crop___Healthy", "Crop___Disease"], f)

            def fake_download(repo_id, filename, **kwargs):
                calls.append((repo_id, filename, kwargs))
                if filename == "efficientnet_b0_plant.pth":
                    return model_path
                if filename == "class_names.json":
                    return class_names_path
                raise AssertionError(f"Unexpected filename: {filename}")

            with mock.patch("huggingface_hub.hf_hub_download", side_effect=fake_download):
                predict_module = importlib.import_module("backend.model.predict")

            self.assertEqual(
                predict_module.CLASS_NAMES,
                ["Crop___Healthy", "Crop___Disease"],
            )
            self.assertEqual(predict_module.NUM_CLASSES, 2)
            self.assertEqual(predict_module.MODEL_PATH, model_path)
            self.assertIn(
                (
                    "aakarshhhhh/cropguard-model",
                    "efficientnet_b0_plant.pth",
                    {"local_dir": "/tmp/model", "force_download": False},
                ),
                calls,
            )

    def test_predict_falls_back_to_mock_when_weights_load_fails(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            model_path = os.path.join(tmpdir, "efficientnet_b0_plant.pth")
            with open(model_path, "wb") as f:
                f.write(b"invalid-model-content")

            def fake_download(repo_id, filename, **kwargs):
                if filename == "efficientnet_b0_plant.pth":
                    return model_path
                raise RuntimeError("class names unavailable")

            with mock.patch("huggingface_hub.hf_hub_download", side_effect=fake_download):
                predict_module = importlib.import_module("backend.model.predict")

            predict_module._model = None
            predict_module._using_mock = False

            with mock.patch.object(
                predict_module.torch, "load", side_effect=RuntimeError("bad weights")
            ):
                predictions = predict_module.predict(Image.new("RGB", (224, 224)), top_k=3)

            self.assertEqual(len(predictions), 3)
            self.assertTrue(all("disease" in p and "confidence" in p for p in predictions))

    def test_results_endpoint_returns_hf_results_json(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            model_path = os.path.join(tmpdir, "efficientnet_b0_plant.pth")
            class_names_path = os.path.join(tmpdir, "class_names.json")
            results_path = os.path.join(tmpdir, "real_results.json")

            with open(model_path, "wb") as f:
                f.write(b"model")
            with open(class_names_path, "w", encoding="utf-8") as f:
                json.dump(["Crop___Healthy"], f)

            expected_results = {
                "accuracy": 99.81,
                "precision": 99.8,
                "recall": 99.8,
                "f1_score": 99.8,
                "per_class": {"Crop___Healthy": {"precision": 100.0}},
                "history": {"accuracy": [99.5, 99.81]},
            }
            with open(results_path, "w", encoding="utf-8") as f:
                json.dump(expected_results, f)

            def fake_download(repo_id, filename, **kwargs):
                if filename == "efficientnet_b0_plant.pth":
                    return model_path
                if filename == "class_names.json":
                    return class_names_path
                if filename == "real_results.json":
                    return results_path
                raise AssertionError(f"Unexpected filename: {filename}")

            with mock.patch("huggingface_hub.hf_hub_download", side_effect=fake_download):
                main_module = importlib.import_module("backend.main")
                response = asyncio.run(main_module.get_results())

            self.assertEqual(response, expected_results)

    def test_predict_endpoint_returns_actual_exception_message(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            model_path = os.path.join(tmpdir, "efficientnet_b0_plant.pth")
            class_names_path = os.path.join(tmpdir, "class_names.json")

            with open(model_path, "wb") as f:
                f.write(b"model")
            with open(class_names_path, "w", encoding="utf-8") as f:
                json.dump(["Crop___Healthy"], f)

            def fake_download(repo_id, filename, **kwargs):
                if filename == "efficientnet_b0_plant.pth":
                    return model_path
                if filename == "class_names.json":
                    return class_names_path
                raise AssertionError(f"Unexpected filename: {filename}")

            with mock.patch("huggingface_hub.hf_hub_download", side_effect=fake_download):
                main_module = importlib.import_module("backend.main")

            image_bytes = io.BytesIO()
            Image.new("RGB", (32, 32), color="green").save(image_bytes, format="PNG")
            image_bytes.seek(0)
            upload = UploadFile(
                filename="leaf.png",
                file=image_bytes,
                headers={"content-type": "image/png"},
            )

            with mock.patch.object(main_module, "predict", side_effect=RuntimeError("boom")):
                with self.assertRaises(HTTPException) as ctx:
                    asyncio.run(main_module.predict_disease(upload))

            self.assertEqual(ctx.exception.status_code, 500)
            self.assertEqual(ctx.exception.detail, "boom")


if __name__ == "__main__":
    unittest.main()
