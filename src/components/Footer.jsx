import { motion } from "framer-motion";

const techStack = [
  { name: "React", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { name: "Tailwind CSS", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { name: "Vite", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { name: "FastAPI", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { name: "TensorFlow", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { name: "Framer Motion", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900/80 border-t border-gray-800 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Project Name */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
              🌿 CropGuard AI
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Crop Disease Detection Using CNN-Based Model
            </p>
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/Aakarsh1024/crop_disease_detection_using_cnn_based_model"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">View on GitHub</span>
          </a>
        </div>

        {/* Tech Stack Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-gray-500 text-xs mr-1">Built with</span>
          {techStack.map((tech) => (
            <motion.span
              key={tech.name}
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1 text-xs font-medium rounded-full border ${tech.color}`}
            >
              {tech.name}
            </motion.span>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} CropGuard AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
