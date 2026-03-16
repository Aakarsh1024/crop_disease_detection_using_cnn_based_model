import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const mockPredictions = [
  { disease: "Tomato Late Blight", confidence: 92.4 },
  { disease: "Tomato Early Blight", confidence: 4.1 },
  { disease: "Tomato Septoria Leaf Spot", confidence: 2.3 },
  { disease: "Tomato Healthy", confidence: 1.2 },
];

export default function LiveDemo() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setPredictions(null);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handlePredict = useCallback(() => {
    if (!image) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPredictions(mockPredictions);
      setLoading(false);
    }, 1500);
  }, [image]);

  const reset = () => {
    setImage(null);
    setPreview(null);
    setPredictions(null);
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
                    {predictions[0].disease}
                  </h3>
                  <p className="text-xs text-gray-500 mb-6">
                    Top prediction with {predictions[0].confidence}% confidence
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
      </div>
    </div>
  );
}
