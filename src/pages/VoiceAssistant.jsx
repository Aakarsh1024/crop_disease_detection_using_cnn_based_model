import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const commandExamples = [
  { cmd: "Show results", desc: "Navigate to model results" },
  { cmd: "Upload image", desc: "Open the live demo page" },
  { cmd: "Compare models", desc: "View model comparison" },
  { cmd: "Show dataset info", desc: "Navigate to dataset page" },
  { cmd: "Go to methodology", desc: "View methodology" },
  { cmd: "Go home", desc: "Return to home page" },
];

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm CropGuard Voice Assistant. Try saying a command like \"Show results\" or \"Compare models\". Note: Voice recognition requires browser support.",
    },
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const processCommand = useCallback((text) => {
    const lower = text.toLowerCase();
    let response = `I heard: "${text}". `;

    if (lower.includes("result")) {
      response += 'Navigating to Results page. Our model achieves 96.5% accuracy!';
    } else if (lower.includes("upload") || lower.includes("demo") || lower.includes("predict")) {
      response += 'Opening Live Demo. You can upload a leaf image for instant prediction.';
    } else if (lower.includes("compar")) {
      response += 'Showing Model Comparison. Our CNN outperforms VGG-16 and matches ResNet-50.';
    } else if (lower.includes("dataset") || lower.includes("data")) {
      response += 'The PlantVillage dataset contains 54,303 images across 38 disease classes.';
    } else if (lower.includes("method")) {
      response += 'Our methodology uses a custom 6-layer CNN with batch normalization and dropout.';
    } else if (lower.includes("home")) {
      response += 'Returning to the home page.';
    } else if (lower.includes("abstract")) {
      response += 'Showing the research abstract and problem statement.';
    } else {
      response += 'I can help you navigate the app. Try "Show results", "Compare models", or "Upload image".';
    }
    return response;
  }, []);

  const toggleListening = useCallback(() => {
    if (listening) {
      setListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Speech recognition is not supported in your browser. Please try Chrome or Edge.",
        },
      ]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(text);

      if (event.results[0].isFinal) {
        setMessages((prev) => [
          ...prev,
          { role: "user", text },
          { role: "assistant", text: processCommand(text) },
        ]);
        setTranscript("");
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Could not capture audio. Please check microphone permissions.",
        },
      ]);
    };

    recognition.onend = () => setListening(false);

    recognition.start();
  }, [listening, processCommand]);

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase text-[#c6f135] bg-[#c6f135]/10 rounded-full border border-[#c6f135]/20">
            Accessibility
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Voice <span className="text-[#00e676]">Assistant</span>
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Hands-free navigation and information using voice commands.
          </p>
        </motion.div>

        {/* Chat area */}
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
        >
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#00e676]/20 text-[#00e676] rounded-br-md"
                        : "bg-gray-800 text-gray-300 rounded-bl-md"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {transcript && (
              <div className="flex justify-end">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm bg-[#00e676]/10 text-[#00e676]/70 rounded-br-md italic">
                  {transcript}...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Mic bar */}
          <div className="border-t border-gray-800 p-4 flex items-center justify-center">
            <button
              onClick={toggleListening}
              className={`relative p-5 rounded-full transition-all ${
                listening
                  ? "bg-[#00e676] text-gray-900 shadow-lg shadow-[#00e676]/30"
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              aria-label={listening ? "Stop listening" : "Start listening"}
            >
              {listening && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#00e676]"
                  animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Command examples */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={2}
        >
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-400">
            Example Commands
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {commandExamples.map((c, i) => (
              <motion.div
                key={c.cmd}
                className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-[#00e676]/30 transition-colors"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.3}
              >
                <p className="font-medium text-sm text-[#00e676]">
                  &quot;{c.cmd}&quot;
                </p>
                <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
