import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

function AnimatedCounter({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  { label: "Disease Classes", value: 38, suffix: "" },
  { label: "Training Images", value: 54303, suffix: "+" },
  { label: "Model Accuracy", value: 96.5, suffix: "%" },
  { label: "Inference Time", value: 45, suffix: "ms" },
];

const highlights = [
  {
    icon: "🔬",
    title: "Deep CNN Architecture",
    desc: "Custom 6-layer CNN with batch normalization and dropout for robust feature extraction from leaf images.",
  },
  {
    icon: "📊",
    title: "PlantVillage Dataset",
    desc: "Trained on 54,000+ images spanning 38 disease classes across 14 crop species.",
  },
  {
    icon: "⚡",
    title: "Real-Time Inference",
    desc: "Optimized pipeline delivers predictions in under 50ms with confidence scoring.",
  },
  {
    icon: "🎯",
    title: "Grad-CAM Visualization",
    desc: "Interpretable AI with gradient-weighted class activation maps highlighting disease regions.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00e676]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#c6f135]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider uppercase text-[#00e676] bg-[#00e676]/10 rounded-full border border-[#00e676]/20">
              CNN-Based Research Project
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Crop Disease Detection
            <br />
            <span className="bg-gradient-to-r from-[#00e676] to-[#c6f135] bg-clip-text text-transparent">
              Using Deep Learning
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            An intelligent system that identifies plant diseases from leaf
            images using Convolutional Neural Networks, achieving 96.5%
            accuracy across 38 disease classes.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <Link
              to="/live-demo"
              className="px-8 py-3 bg-[#00e676] text-gray-900 font-semibold rounded-xl hover:bg-[#00c853] transition-colors shadow-lg shadow-[#00e676]/20"
            >
              Try Live Demo →
            </Link>
            <Link
              to="/methodology"
              className="px-8 py-3 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:border-[#00e676]/50 hover:text-white transition-colors"
            >
              View Methodology
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#00e676] to-[#c6f135] bg-clip-text text-transparent">
                <AnimatedCounter end={s.value} suffix={s.suffix} />
              </div>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            Project{" "}
            <span className="text-[#00e676]">Highlights</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                className="group p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-[#00e676]/30 transition-colors"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <span className="text-3xl mb-3 block">{h.icon}</span>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#00e676] transition-colors">
                  {h.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {h.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
