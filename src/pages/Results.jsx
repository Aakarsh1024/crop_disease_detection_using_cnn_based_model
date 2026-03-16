import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { API_URL } from "../config";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #374151",
  borderRadius: "8px",
  color: "#f3f4f6",
};

export default function Results() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/results`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        return res.json();
      })
      .then((data) => setResults(data))
      .catch((err) => {
        setError(
          err.message === "Failed to fetch"
            ? "Cannot reach the API server."
            : err.message
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const overallMetrics = results
    ? [
        { name: "Accuracy", value: results.accuracy },
        { name: "Precision", value: results.precision },
        { name: "Recall", value: results.recall },
        { name: "F1-Score", value: results.f1_score },
      ]
    : [];

  const trainingHistory = results?.training_history ?? [];

  const perClassF1 = results?.per_class_f1 ?? [];

  const confusionSummary = results?.confusion_summary ?? [];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase text-[#00e676] bg-[#00e676]/10 rounded-full border border-[#00e676]/20">
            Performance Metrics
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Model <span className="text-[#00e676]">Results</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Comprehensive evaluation on the PlantVillage test set.
          </p>
        </motion.div>

        {loading && (
          <p className="text-center text-gray-500 animate-pulse mb-8">Loading results…</p>
        )}
        {error && (
          <p className="text-center text-red-400 mb-8">{error}</p>
        )}

        {!loading && results && (
          <>
            {/* Overall Metrics */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              {overallMetrics.map((m) => (
                <div
                  key={m.name}
                  className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl text-center"
                >
                  <div className="text-3xl font-bold text-[#00e676]">
                    {m.value}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{m.name}</div>
                </div>
              ))}
            </motion.div>

            {/* Training History */}
            {trainingHistory.length > 0 && (
              <motion.div
                className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={2}
              >
                <h2 className="text-xl font-bold mb-6 text-[#00e676]">
                  Training & Validation Accuracy
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trainingHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="epoch"
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        label={{ value: "Epoch", position: "insideBottom", offset: -5, fill: "#6b7280" }}
                      />
                      <YAxis
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        domain={[40, 100]}
                        label={{ value: "Accuracy %", angle: -90, position: "insideLeft", fill: "#6b7280" }}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="train"
                        stroke="#00e676"
                        strokeWidth={2}
                        dot={{ fill: "#00e676", r: 3 }}
                        name="Training"
                      />
                      <Line
                        type="monotone"
                        dataKey="val"
                        stroke="#c6f135"
                        strokeWidth={2}
                        dot={{ fill: "#c6f135", r: 3 }}
                        name="Validation"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Per-class F1 */}
              {perClassF1.length > 0 && (
                <motion.div
                  className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={3}
                >
                  <h2 className="text-lg font-bold mb-6 text-[#c6f135]">
                    Per-Class F1 Score
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={perClassF1}
                        layout="vertical"
                        margin={{ left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        <XAxis
                          type="number"
                          domain={[0.9, 1]}
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fill: "#9ca3af", fontSize: 10 }}
                          width={90}
                        />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="f1" fill="#00e676" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {/* Confusion summary */}
              {confusionSummary.length > 0 && (
                <motion.div
                  className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={4}
                >
                  <h2 className="text-lg font-bold mb-6 text-[#00e676]">
                    Confusion Matrix Summary
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={confusionSummary}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={50}
                          paddingAngle={2}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(1)}%`
                          }
                          labelLine={{ stroke: "#4b5563" }}
                        >
                          {confusionSummary.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
