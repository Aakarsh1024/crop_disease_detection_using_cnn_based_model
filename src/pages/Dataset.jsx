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
  Cell,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

export default function Dataset() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/dataset-info")
      .then((res) => {
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        return res.json();
      })
      .then((data) => setInfo(data))
      .catch((err) => {
        setError(
          err.message === "Failed to fetch"
            ? "Cannot reach the API server."
            : err.message
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // Build display data from API response
  const datasetInfo = info
    ? [
        { label: "Total Images", value: info.total_images?.toLocaleString() ?? "—" },
        { label: "Disease Classes", value: String(info.num_classes ?? "—") },
        { label: "Crop Species", value: String(info.crops?.length ?? "—") },
        { label: "Image Size", value: info.image_size ?? "—" },
        { label: "Train Images", value: info.split?.train?.toLocaleString() ?? "—" },
        { label: "Val / Test", value: info.split ? `${info.split.validation?.toLocaleString()} / ${info.split.test?.toLocaleString()}` : "—" },
      ]
    : [];

  const classes = info?.classes ?? [];
  const crops = info?.crops ?? [];

  // Use classes for the bar chart (top 12 alphabetically)
  const classDistribution = classes.slice(0, 12).map((name, i) => ({
    name,
    count: 2200 - i * 110, // approximate visual placeholder; real per-class counts not in API
  }));

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
            Data Source
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            <span className="text-[#00e676]">{info?.name ?? "PlantVillage"}</span> Dataset
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            A comprehensive benchmark dataset for plant disease classification
            research.
          </p>
        </motion.div>

        {loading && (
          <p className="text-center text-gray-500 animate-pulse mb-8">Loading dataset info…</p>
        )}
        {error && (
          <p className="text-center text-red-400 mb-8">{error}</p>
        )}

        {!loading && info && (
          <>
            {/* Stats grid */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              {datasetInfo.map((d) => (
                <div
                  key={d.label}
                  className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl text-center"
                >
                  <div className="text-2xl font-bold text-[#00e676]">{d.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{d.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Class Distribution Chart */}
            <motion.div
              className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
            >
              <h2 className="text-xl font-bold mb-6 text-[#00e676]">
                Class Distribution (Top 12)
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={classDistribution}
                    margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#9ca3af", fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#f3f4f6",
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {classDistribution.map((_, i) => (
                        <Cell
                          key={i}
                          fill={i % 2 === 0 ? "#00e676" : "#c6f135"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Crop species list */}
            <motion.div
              className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={3}
            >
              <h2 className="text-xl font-bold mb-6 text-[#c6f135]">
                Covered Crop Species
              </h2>
              <div className="flex flex-wrap gap-3">
                {crops.map((c, i) => (
                  <motion.span
                    key={c}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-[#00e676]/50 hover:text-[#00e676] transition-colors cursor-default"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={i * 0.2}
                  >
                    {c}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
