import importlib
import json
import os
import sys
import tempfile
import unittest
import asyncio
from unittest import mock


class HuggingFaceIntegrationTests(unittest.TestCase):
    def setUp(self):
        sys.modules.pop("backend.main", None)
        sys.modules.pop("backend.model.predict", None)

    def test_predict_initializes_model_and_classes_from_hf(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            model_path = os.path.join(tmpdir, "efficientnet_b0_plant.pth")
            class_names_path = os.path.join(tmpdir, "class_names.json")

            with open(model_path, "wb") as f:
                f.write(b"model")
            with open(class_names_path, "w", encoding="utf-8") as f:
                json.dump(["Crop___Healthy", "Crop___Disease"], f)

            def fake_download(repo_id, filename, **kwargs):
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


if __name__ == "__main__":
    unittest.main()
