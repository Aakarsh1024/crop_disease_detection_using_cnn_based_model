import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const layers = [
  { name: "Input", detail: "224 × 224 × 3 RGB Image", color: "#64748b" },
  { name: "Conv Block 1", detail: "2× Conv2D(32) + BN + MaxPool + Dropout(0.25)", color: "#00e676" },
  { name: "Conv Block 2", detail: "2× Conv2D(64) + BN + MaxPool + Dropout(0.25)", color: "#00e676" },
  { name: "Conv Block 3", detail: "2× Conv2D(128) + BN + MaxPool + Dropout(0.25)", color: "#c6f135" },
  { name: "Flatten", detail: "Feature vector", color: "#64748b" },
  { name: "Dense 512", detail: "ReLU + BatchNorm + Dropout(0.5)", color: "#00e676" },
  { name: "Output", detail: "Dense(38) + Softmax → 38 classes", color: "#c6f135" },
];

const pipelineSteps = [
  {
    step: "01",
    title: "Data Collection",
    desc: "Download PlantVillage dataset with 54,303 leaf images across 14 crop species and 38 disease categories.",
  },
  {
    step: "02",
    title: "Preprocessing & Augmentation",
    desc: "Resize to 224×224, normalize pixel values. Apply rotation (±25°), shifts (20%), zoom (20%), and horizontal flips.",
  },
  {
    step: "03",
    title: "Model Architecture",
    desc: "Build custom CNN with 3 convolutional blocks, batch normalization, dropout regularization, and dense classifier.",
  },
  {
    step: "04",
    title: "Training",
    desc: "Train with Adam optimizer, categorical cross-entropy loss. Use early stopping, learning rate reduction, and model checkpointing.",
  },
  {
    step: "05",
    title: "Evaluation",
    desc: "Evaluate on held-out test set using accuracy, precision, recall, F1-score, and confusion matrix analysis.",
  },
  {
    step: "06",
    title: "Deployment",
    desc: "Serve model via FastAPI backend with React frontend. Support real-time image upload and Grad-CAM visualization.",
  },
];

export default function Methodology() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase text-[#00e676] bg-[#00e676]/10 rounded-full border border-[#00e676]/20">
            Technical Approach
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            <span className="text-[#00e676]">Methodology</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            CNN architecture design and end-to-end training pipeline.
          </p>
        </motion.div>

        {/* CNN Architecture */}
        <motion.div
          className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
        >
          <h2 className="text-xl font-bold mb-6 text-[#00e676]">
            CNN Architecture
          </h2>
          <div className="space-y-3">
            {layers.map((l, i) => (
              <motion.div
                key={l.name}
                className="flex items-center gap-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.3}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: l.color }}
                />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <span className="font-semibold text-white text-sm min-w-[120px]">
                    {l.name}
                  </span>
                  <span className="text-gray-400 text-xs font-mono">
                    {l.detail}
                  </span>
                </div>
                {i < layers.length - 1 && (
                  <span className="hidden sm:block text-gray-600">↓</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Training Pipeline */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={2}
        >
          <h2 className="text-2xl font-bold mb-8 text-center">
            Training <span className="text-[#c6f135]">Pipeline</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pipelineSteps.map((s, i) => (
              <motion.div
                key={s.step}
                className="group p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-[#00e676]/30 transition-colors"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <span className="text-4xl font-black text-[#00e676]/20 block mb-2">
                  {s.step}
                </span>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#00e676] transition-colors">
                  {s.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
