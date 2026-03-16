import { motion } from "framer-motion";
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

const radarData = [
  { metric: "Accuracy", Ours: 96.5, ResNet50: 95.2, VGG16: 91.3, MobileNetV2: 93.8 },
  { metric: "Precision", Ours: 95.8, ResNet50: 94.6, VGG16: 89.7, MobileNetV2: 92.4 },
  { metric: "Recall", Ours: 96.1, ResNet50: 94.9, VGG16: 90.5, MobileNetV2: 93.1 },
  { metric: "F1-Score", Ours: 95.9, ResNet50: 94.7, VGG16: 90.1, MobileNetV2: 92.7 },
  { metric: "Speed", Ours: 92, ResNet50: 78, VGG16: 65, MobileNetV2: 95 },
  { metric: "Size Eff.", Ours: 90, ResNet50: 70, VGG16: 55, MobileNetV2: 96 },
];

const barData = [
  { name: "Our CNN", accuracy: 96.5, params: 2.1, inference: 45 },
  { name: "ResNet-50", accuracy: 95.2, params: 25.6, inference: 82 },
  { name: "VGG-16", accuracy: 91.3, params: 138, inference: 125 },
  { name: "MobileNetV2", accuracy: 93.8, params: 3.4, inference: 35 },
];

const comparison = [
  { model: "Our CNN", acc: "96.5%", params: "2.1M", time: "45ms", notes: "Best accuracy with small footprint" },
  { model: "ResNet-50", acc: "95.2%", params: "25.6M", time: "82ms", notes: "Strong but heavy" },
  { model: "VGG-16", acc: "91.3%", params: "138M", time: "125ms", notes: "Overfits without fine-tuning" },
  { model: "MobileNetV2", acc: "93.8%", params: "3.4M", time: "35ms", notes: "Fastest, slightly lower accuracy" },
];

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #374151",
  borderRadius: "8px",
  color: "#f3f4f6",
};

export default function Comparison() {
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
                <Radar name="Our CNN" dataKey="Ours" stroke="#00e676" fill="#00e676" fillOpacity={0.25} strokeWidth={2} />
                <Radar name="ResNet-50" dataKey="ResNet50" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} strokeWidth={1.5} />
                <Radar name="VGG-16" dataKey="VGG16" stroke="#f87171" fill="#f87171" fillOpacity={0.1} strokeWidth={1.5} />
                <Radar name="MobileNetV2" dataKey="MobileNetV2" stroke="#c6f135" fill="#c6f135" fillOpacity={0.1} strokeWidth={1.5} />
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
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Notes</th>
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
                  <td className="py-3 px-4 text-gray-500">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}
