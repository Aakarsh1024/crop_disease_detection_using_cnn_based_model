import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const contributions = [
  "Custom CNN architecture optimized for leaf disease classification",
  "Comprehensive evaluation on the PlantVillage dataset with 38 classes",
  "Data augmentation pipeline improving model generalization",
  "Grad-CAM visualization for interpretable predictions",
  "Real-time web-based inference system with FastAPI backend",
  "Comparative analysis against ResNet-50, VGG-16, and MobileNetV2",
];

export default function Abstract() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase text-[#c6f135] bg-[#c6f135]/10 rounded-full border border-[#c6f135]/20">
            Research Overview
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Project <span className="text-[#00e676]">Abstract</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            A comprehensive study on automated crop disease detection using deep
            convolutional neural networks.
          </p>
        </motion.div>

        {/* Abstract text */}
        <motion.div
          className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
        >
          <h2 className="text-xl font-bold mb-4 text-[#00e676]">Abstract</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Plant diseases cause significant agricultural losses worldwide,
            threatening food security and farmer livelihoods. Early and accurate
            detection is critical but traditional methods rely on expert visual
            inspection, which is time-consuming and error-prone.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            This project presents a Convolutional Neural Network (CNN) based
            approach for automated detection and classification of crop diseases
            from leaf images. We design a custom CNN architecture with six
            convolutional layers, batch normalization, and strategic dropout
            regularization, trained on the PlantVillage dataset containing
            54,000+ images across 38 disease categories spanning 14 crop
            species.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Our model achieves <strong className="text-[#00e676]">96.5% classification accuracy</strong>,
            outperforming several baseline approaches. We further integrate
            Gradient-weighted Class Activation Mapping (Grad-CAM) for model
            interpretability and deploy the system as a real-time web
            application with a React frontend and FastAPI backend.
          </p>
        </motion.div>

        {/* Problem Statement */}
        <motion.div
          className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={2}
        >
          <h2 className="text-xl font-bold mb-4 text-[#c6f135]">
            Problem Statement
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Crop diseases are responsible for up to <strong>30% of global yield losses</strong> annually. 
            Smallholder farmers, who produce over 70% of the world&apos;s food, often lack
            access to plant pathology experts, leading to delayed diagnosis and
            inappropriate treatment.
          </p>
          <p className="text-gray-300 leading-relaxed">
            The challenge is to build an automated, accessible, and accurate
            system that can identify diseases from a simple photograph of a
            plant leaf, enabling timely intervention and reducing crop losses.
          </p>
        </motion.div>

        {/* Key Contributions */}
        <motion.div
          className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={3}
        >
          <h2 className="text-xl font-bold mb-6 text-[#00e676]">
            Key Contributions
          </h2>
          <ul className="space-y-4">
            {contributions.map((c, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.5}
              >
                <span className="mt-1 w-2 h-2 rounded-full bg-[#00e676] shrink-0" />
                <span className="text-gray-300 text-sm leading-relaxed">
                  {c}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
