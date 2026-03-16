import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import FloatingMic from "./components/FloatingMic";
import Home from "./pages/Home";
import Abstract from "./pages/Abstract";
import Methodology from "./pages/Methodology";
import Dataset from "./pages/Dataset";
import Results from "./pages/Results";
import LiveDemo from "./pages/LiveDemo";
import Comparison from "./pages/Comparison";
import VoiceAssistant from "./pages/VoiceAssistant";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/abstract" element={<Abstract />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/dataset" element={<Dataset />} />
          <Route path="/results" element={<Results />} />
          <Route path="/live-demo" element={<LiveDemo />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/voice-assistant" element={<VoiceAssistant />} />
        </Routes>
      </main>
      <FloatingMic />
    </div>
  );
}
