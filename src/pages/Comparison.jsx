import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const COLORS = ["#00e676", "#60a5fa", "#f87171", "#c6f135", "#a78bfa"];

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #374151",
  borderRadius: "8px",
  color: "#f3f4f6",
};

/**
 * Build recharts-ready data from the API response.
 */
function buildChartData(models) {
  const metrics = ["Accuracy", "Precision", "Recall", "F1-Score"];
  const keys = ["accuracy", "precision", "recall", "f1_score"];

  const radarData = metrics.map((metric, mi) => {
    const point = { metric };
    models.forEach((m) => {
      point[m.name] = m[keys[mi]];
    });
    return point;
  });

  const barData = models.map((m) => ({
    name: m.name,
    accuracy: m.accuracy,
    inference: m.inference_time_ms,
  }));

  const comparison = models.map((m) => ({
    model: m.name,
    acc: `${m.accuracy}%`,
    params: m.parameters,
    time: `${m.inference_time_ms}ms`,
  }));

  return { radarData, barData, comparison };
}

export default function Comparison() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/models`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setModels(data.models || []);
      })
      .catch((err) => {
        setError(
          err.message === "Failed to fetch"
            ? "Cannot reach the API server."
            : err.message
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const { radarData, barData, comparison } = models.length
    ? buildChartData(models)
    : { radarData: [], barData: [], comparison: [] };

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
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase text-[#c6f135] bg-[#c6f135]/10 rounded-full border border-[#c6f135]/20">
            Benchmarks
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Model <span className="text-[#00e676]">Comparison</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Our custom CNN vs. popular pretrained architectures on the
            PlantVillage dataset.
          </p>
        </motion.div>

        {loading && (
          <p className="text-center text-gray-500 animate-pulse">Loading model data…</p>
        )}
        {error && (
          <p className="text-center text-red-400 mb-8">{error}</p>
        )}

        {!loading && models.length > 0 && (
          <>
            {/* Radar chart */}
            <motion.div
              className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              <h2 className="text-xl font-bold mb-6 text-[#00e676]">
                Multi-Metric Radar
              </h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#1f2937" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[50, 100]}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                    />
                    {models.map((m, i) => (
                      <Radar
                        key={m.name}
                        name={m.name}
                        dataKey={m.name}
                        stroke={COLORS[i % COLORS.length]}
                        fill={COLORS[i % COLORS.length]}
                        fillOpacity={i === 0 ? 0.25 : 0.1}
                        strokeWidth={i === 0 ? 2 : 1.5}
                      />
                    ))}
                    <Legend />
                    <Tooltip contentStyle={tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Bar chart – accuracy comparison */}
            <motion.div
              className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
            >
              <h2 className="text-xl font-bold mb-6 text-[#c6f135]">
                Accuracy & Inference Time
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <YAxis
                      yAxisId="left"
                      domain={[85, 100]}
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                      label={{ value: "Accuracy %", angle: -90, position: "insideLeft", fill: "#6b7280" }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 150]}
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                      label={{ value: "Inference (ms)", angle: 90, position: "insideRight", fill: "#6b7280" }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="accuracy" fill="#00e676" name="Accuracy %" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="inference" fill="#c6f135" name="Inference (ms)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Comparison table */}
            <motion.div
              className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl overflow-x-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={3}
            >
              <h2 className="text-xl font-bold mb-6 text-[#00e676]">
                Detailed Comparison
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Model</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Accuracy</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Params</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Inference</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((r, i) => (
                    <tr
                      key={r.model}
                      className={`border-b border-gray-800/50 ${
                        i === 0 ? "bg-[#00e676]/5" : ""
                      }`}
                    >
                      <td className={`py-3 px-4 font-semibold ${i === 0 ? "text-[#00e676]" : "text-gray-300"}`}>
                        {r.model}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{r.acc}</td>
                      <td className="py-3 px-4 text-gray-300">{r.params}</td>
                      <td className="py-3 px-4 text-gray-300">{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
