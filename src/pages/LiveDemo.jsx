import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

/**
 * Apply domain-shift transforms to an image using an offscreen canvas.
 * Returns a Promise that resolves to a Blob (image/png).
 */
function applyDomainShift(file, { brightness, contrast, blur, noise }) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      // brightness & contrast via CSS filter on canvas
      const bVal = 1 + (brightness - 50) / 50; // 0→0, 50→1, 100→2
      const cVal = 1 + (contrast - 50) / 50;
      ctx.filter = `brightness(${bVal}) contrast(${cVal}) blur(${(blur / 100) * 4}px)`;
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";

      // Gaussian-ish noise
      if (noise > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        const std = (noise / 100) * 50;
        for (let i = 0; i < d.length; i += 4) {
          // Box-Muller approximation
          const u1 = Math.random() || 0.001;
          const u2 = Math.random();
          const n = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * std;
          d[i] = Math.min(255, Math.max(0, d[i] + n));
          d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
          d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
        }
        ctx.putImageData(imageData, 0, 0);
      }

      canvas.toBlob((blob) => resolve(blob), "image/png");
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function LiveDemo() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [gradcam, setGradcam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Domain shift state
  const [shiftEnabled, setShiftEnabled] = useState(false);
  const [shiftParams, setShiftParams] = useState({
    brightness: 50,
    contrast: 50,
    blur: 0,
    noise: 0,
  });
  const [shiftLoading, setShiftLoading] = useState(false);
  const shiftTimerRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setPredictions(null);
    setGradcam(null);
    setError(null);
    setShiftEnabled(false);
    setShiftParams({ brightness: 50, contrast: 50, blur: 0, noise: 0 });
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const callPredictAPI = useCallback(async (fileOrBlob) => {
    const formData = new FormData();
    formData.append("file", fileOrBlob, fileOrBlob.name || "image.png");

    const res = await fetch("/api/predict", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      throw new Error(detail?.detail || `Server error (${res.status})`);
    }

    return res.json();
  }, []);

  const handlePredict = useCallback(async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const data = await callPredictAPI(image);
      setPredictions(data.predictions || []);
      setGradcam(data.gradcam || null);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach the API server. Please make sure the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, [image, callPredictAPI]);

  // Domain shift: re-predict when sliders change
  const handleShiftChange = useCallback(
    (key, value) => {
      const next = { ...shiftParams, [key]: Number(value) };
      setShiftParams(next);

      if (!image || !predictions) return;

      // Debounce 400ms
      if (shiftTimerRef.current) clearTimeout(shiftTimerRef.current);
      shiftTimerRef.current = setTimeout(async () => {
        setShiftLoading(true);
        try {
          const blob = await applyDomainShift(image, next);
          const data = await callPredictAPI(blob);
          setPredictions(data.predictions || []);
          setGradcam(data.gradcam || null);
        } catch {
          // keep existing predictions on shift failure
        } finally {
          setShiftLoading(false);
        }
      }, 400);
    },
    [image, predictions, shiftParams, callPredictAPI]
  );

  const reset = () => {
    setImage(null);
    setPreview(null);
    setPredictions(null);
    setGradcam(null);
    setError(null);
    setShiftEnabled(false);
    setShiftParams({ brightness: 50, contrast: 50, blur: 0, noise: 0 });
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase text-[#00e676] bg-[#00e676]/10 rounded-full border border-[#00e676]/20">
            Interactive Demo
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            <span className="text-[#00e676]">Live</span> Prediction
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Upload a leaf image to get instant disease classification with
            confidence scores.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload area */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            {!preview ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                  dragActive
                    ? "border-[#00e676] bg-[#00e676]/5"
                    : "border-gray-700 hover:border-gray-600 bg-gray-900/50"
                }`}
              >
                <svg
                  className="w-12 h-12 text-gray-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-400 text-sm mb-1">
                  Drag & drop a leaf image
                </p>
                <p className="text-gray-600 text-xs">or click to browse</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </label>
            ) : (
              <div className="relative h-80 rounded-2xl overflow-hidden border border-gray-800">
                <img
                  src={preview}
                  alt="Uploaded leaf"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 p-1.5 bg-gray-900/80 rounded-full text-gray-400 hover:text-white transition-colors"
                  aria-label="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {preview && !predictions && (
              <motion.button
                onClick={handlePredict}
                disabled={loading}
                className="mt-4 w-full py-3 bg-[#00e676] text-gray-900 font-semibold rounded-xl hover:bg-[#00c853] disabled:opacity-50 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  "Predict Disease →"
                )}
              </motion.button>
            )}

            {/* Error message */}
            {error && (
              <motion.div
                className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}
          </motion.div>

          {/* Results area */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            <AnimatePresence mode="wait">
              {predictions ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl"
                >
                  <h3 className="text-lg font-bold mb-1 text-[#00e676]">
                    {predictions[0]?.disease}
                  </h3>
                  <p className="text-xs text-gray-500 mb-6">
                    Top prediction with {predictions[0]?.confidence}% confidence
                    {shiftLoading && " (updating…)"}
                  </p>

                  <div className="space-y-4">
                    {predictions.map((p, i) => (
                      <div key={p.disease}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{p.disease}</span>
                          <span
                            className={
                              i === 0 ? "text-[#00e676] font-semibold" : "text-gray-500"
                            }
                          >
                            {p.confidence}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor:
                                i === 0 ? "#00e676" : "#4b5563",
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${p.confidence}%` }}
                            transition={{ duration: 0.8, delay: i * 0.15 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* GradCAM heatmap */}
                  {gradcam && (
                    <div className="mt-6">
                      <p className="text-xs text-gray-500 mb-2">GradCAM Heatmap</p>
                      <img
                        src={`data:image/png;base64,${gradcam}`}
                        alt="GradCAM heatmap"
                        className="w-full rounded-xl border border-gray-800"
                      />
                    </div>
                  )}

                  <button
                    onClick={reset}
                    className="mt-6 w-full py-2.5 border border-gray-700 text-gray-400 rounded-xl hover:border-[#00e676]/50 hover:text-white transition-colors text-sm"
                  >
                    Try Another Image
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  className="flex flex-col items-center justify-center h-80 bg-gray-900/30 border border-gray-800/50 rounded-2xl"
                >
                  <span className="text-5xl mb-4">🔍</span>
                  <p className="text-gray-500 text-sm text-center px-8">
                    Upload a leaf image and click &quot;Predict Disease&quot; to see
                    classification results with confidence scores.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Domain Shift Simulator */}
        {predictions && (
          <motion.div
            className="mt-12"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#c6f135]">
                Domain Shift Simulator
              </h2>
              <button
                onClick={() => setShiftEnabled((v) => !v)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                  shiftEnabled
                    ? "border-[#c6f135] text-[#c6f135] bg-[#c6f135]/10"
                    : "border-gray-700 text-gray-500 hover:border-gray-600"
                }`}
              >
                {shiftEnabled ? "Enabled" : "Enable"}
              </button>
            </div>

            {shiftEnabled && (
              <motion.div
                className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl space-y-5"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                {[
                  { key: "brightness", label: "Brightness" },
                  { key: "contrast", label: "Contrast" },
                  { key: "blur", label: "Blur" },
                  { key: "noise", label: "Noise" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-gray-500">{shiftParams[key]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={shiftParams[key]}
                      onChange={(e) => handleShiftChange(key, e.target.value)}
                      className="w-full accent-[#c6f135]"
                    />
                  </div>
                ))}
                {shiftLoading && (
                  <p className="text-xs text-gray-500 text-center animate-pulse">
                    Re-analyzing with domain shift…
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
