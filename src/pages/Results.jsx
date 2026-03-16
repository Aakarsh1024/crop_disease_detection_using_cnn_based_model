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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const overallMetrics = [
  { name: "Accuracy", value: 96.5 },
  { name: "Precision", value: 95.8 },
  { name: "Recall", value: 96.1 },
  { name: "F1-Score", value: 95.9 },
];

const trainingHistory = [
  { epoch: 1, train: 52.3, val: 48.1 },
  { epoch: 5, train: 74.6, val: 71.2 },
  { epoch: 10, train: 85.2, val: 82.9 },
  { epoch: 15, train: 90.1, val: 88.7 },
  { epoch: 20, train: 93.4, val: 91.8 },
  { epoch: 25, train: 95.1, val: 93.6 },
  { epoch: 30, train: 96.3, val: 94.9 },
  { epoch: 35, train: 97.0, val: 95.6 },
  { epoch: 40, train: 97.5, val: 96.1 },
  { epoch: 45, train: 97.8, val: 96.5 },
];

const perClassF1 = [
  { name: "Tomato Blight", f1: 0.98 },
  { name: "Potato Late B.", f1: 0.97 },
  { name: "Corn Blight", f1: 0.96 },
  { name: "Apple Scab", f1: 0.95 },
  { name: "Grape Rot", f1: 0.97 },
  { name: "Pepper Bact.", f1: 0.94 },
  { name: "Cherry Mildew", f1: 0.96 },
  { name: "Peach Bact.", f1: 0.93 },
];

const confusionSummary = [
  { name: "True Positive", value: 9632, color: "#00e676" },
  { name: "True Negative", value: 348917, color: "#c6f135" },
  { name: "False Positive", value: 198, color: "#ff5252" },
  { name: "False Negative", value: 253, color: "#ff9800" },
];

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #374151",
  borderRadius: "8px",
  color: "#f3f4f6",
};

export default function Results() {
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

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Per-class F1 */}
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

          {/* Confusion summary */}
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
        </div>
      </div>
    </div>
  );
}
