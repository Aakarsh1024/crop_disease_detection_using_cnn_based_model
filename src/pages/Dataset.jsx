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

const classDistribution = [
  { name: "Tomato Blight", count: 2127 },
  { name: "Potato Late Blight", count: 1939 },
  { name: "Tomato Leaf Mold", count: 1882 },
  { name: "Tomato Septoria", count: 1745 },
  { name: "Corn Leaf Blight", count: 1676 },
  { name: "Apple Scab", count: 1584 },
  { name: "Grape Black Rot", count: 1423 },
  { name: "Pepper Bacterial", count: 1397 },
  { name: "Cherry Powdery", count: 1052 },
  { name: "Strawberry Scorch", count: 986 },
  { name: "Peach Bacterial", count: 914 },
  { name: "Corn Rust", count: 873 },
];

const datasetInfo = [
  { label: "Total Images", value: "54,303" },
  { label: "Disease Classes", value: "38" },
  { label: "Crop Species", value: "14" },
  { label: "Healthy Classes", value: "12" },
  { label: "Image Size", value: "224 × 224" },
  { label: "Train / Val Split", value: "80 / 20" },
];

const crops = [
  "Apple", "Blueberry", "Cherry", "Corn", "Grape", "Orange", "Peach",
  "Pepper", "Potato", "Raspberry", "Soybean", "Squash", "Strawberry", "Tomato",
];

export default function Dataset() {
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
            <span className="text-[#00e676]">PlantVillage</span> Dataset
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            A comprehensive benchmark dataset for plant disease classification
            research.
          </p>
        </motion.div>

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
      </div>
    </div>
  );
}
