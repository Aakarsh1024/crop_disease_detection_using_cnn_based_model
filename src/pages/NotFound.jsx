import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400">
          404
        </h1>
        <p className="mt-4 text-2xl font-semibold text-gray-200">
          Page Not Found
        </p>
        <p className="mt-2 text-gray-400 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-400 hover:to-emerald-500 transition-all"
        >
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
