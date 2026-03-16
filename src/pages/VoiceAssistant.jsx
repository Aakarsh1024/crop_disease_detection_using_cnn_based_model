import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const COMMANDS = {
  home: { path: "/", response: "Navigating to the home page." },
  abstract: { path: "/abstract", response: "Opening the abstract page." },
  methodology: { path: "/methodology", response: "Opening the methodology page." },
  dataset: { path: "/dataset", response: "Opening the dataset page." },
  results: { path: "/results", response: "Navigating to the results page." },
  demo: { path: "/live-demo", response: "Opening the live demo page." },
  comparison: { path: "/comparison", response: "Opening the comparison page." },
};

const commandExamples = [
  { cmd: "Go to home", desc: "Navigate to the home page", category: "Navigation" },
  { cmd: "Go to abstract", desc: "Open the abstract page", category: "Navigation" },
  { cmd: "Go to methodology", desc: "View methodology", category: "Navigation" },
  { cmd: "Go to dataset", desc: "Navigate to dataset page", category: "Navigation" },
  { cmd: "Go to results", desc: "Navigate to model results", category: "Navigation" },
  { cmd: "Go to demo", desc: "Open the live demo", category: "Navigation" },
  { cmd: "Go to comparison", desc: "View model comparison", category: "Navigation" },
  { cmd: "What is this project about", desc: "Hear the project abstract", category: "Information" },
  { cmd: "How accurate is your model", desc: "Hear accuracy stats", category: "Information" },
  { cmd: "Start demo", desc: "Jump to the live demo", category: "Shortcut" },
  { cmd: "Open comparison", desc: "Jump to model comparison", category: "Shortcut" },
  { cmd: "Help", desc: "List all available commands", category: "Utility" },
];

function processCommand(text) {
  const lower = text.toLowerCase().trim();
  let navigateTo = null;

  const goToMatch = lower.match(
    /go\s+to\s+(home|abstract|methodology|dataset|results|demo|comparison)/
  );
  if (goToMatch) {
    const page = goToMatch[1];
    const cmd = COMMANDS[page];
    return { response: cmd.response, navigateTo: cmd.path };
  }

  if (lower.includes("what is this project") || lower.includes("about")) {
    return {
      response:
        "This project uses Convolutional Neural Networks to detect crop diseases from leaf images. " +
        "It is trained on the PlantVillage dataset with over 54,000 images spanning 38 disease classes across 14 crop species.",
      navigateTo: null,
    };
  }

  if (lower.includes("accurate") || lower.includes("accuracy")) {
    return {
      response:
        "Our CNN model achieves 96.5% accuracy on the test set, with an inference time of approximately 45 milliseconds per image.",
      navigateTo: null,
    };
  }

  if (lower.includes("start demo")) {
    return { response: "Starting the live demo.", navigateTo: "/live-demo" };
  }

  if (lower.includes("open comparison")) {
    return {
      response: "Opening the model comparison page.",
      navigateTo: "/comparison",
    };
  }

  if (lower.includes("help")) {
    return {
      response:
        'Available commands: "Go to home", "Go to abstract", "Go to methodology", "Go to dataset", "Go to results", "Go to demo", "Go to comparison", ' +
        '"What is this project about", "How accurate is your model", "Start demo", "Open comparison", "Help".',
      navigateTo: null,
    };
  }

  if (lower.includes("result")) {
    return { response: COMMANDS.results.response, navigateTo: COMMANDS.results.path };
  }
  if (lower.includes("demo") || lower.includes("upload") || lower.includes("predict")) {
    return { response: COMMANDS.demo.response, navigateTo: COMMANDS.demo.path };
  }
  if (lower.includes("compar")) {
    return { response: COMMANDS.comparison.response, navigateTo: COMMANDS.comparison.path };
  }
  if (lower.includes("dataset") || lower.includes("data")) {
    return { response: COMMANDS.dataset.response, navigateTo: COMMANDS.dataset.path };
  }
  if (lower.includes("method")) {
    return { response: COMMANDS.methodology.response, navigateTo: COMMANDS.methodology.path };
  }
  if (lower.includes("home")) {
    return { response: COMMANDS.home.response, navigateTo: COMMANDS.home.path };
  }
  if (lower.includes("abstract")) {
    return { response: COMMANDS.abstract.response, navigateTo: COMMANDS.abstract.path };
  }

  return {
    response: 'Sorry, I didn\'t understand that. Say "help" to see available commands.',
    navigateTo: null,
  };
}

/* Animated waveform bars */
function Waveform() {
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-[#00e676] rounded-full"
          animate={{ height: ["8px", "24px", "8px"] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function VoiceAssistant() {
  const navigate = useNavigate();
  // "idle" | "listening" | "speaking"
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: 'Hello! I\'m CropGuard Voice Assistant. Try saying a command like "Go to results" or "Help". Note: Voice recognition requires browser support.',
    },
  ]);
  const [supported, setSupported] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.onstart = () => setStatus("speaking");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    window.speechSynthesis.speak(utterance);
  }, []);

  const toggleListening = useCallback(() => {
    if (status === "listening") {
      if (recognitionRef.current) recognitionRef.current.stop();
      setStatus("idle");
      return;
    }

    if (!supported) {
      const msg =
        "Speech recognition is not supported in your browser. Please try Chrome or Edge.";
      setMessages((prev) => [...prev, { role: "assistant", text: msg }]);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(text);

      if (event.results[0].isFinal) {
        const { response, navigateTo } = processCommand(text);
        setMessages((prev) => [
          ...prev,
          { role: "user", text },
          { role: "assistant", text: response },
        ]);
        setTranscript("");
        speak(response);
        if (navigateTo) {
          setTimeout(() => navigate(navigateTo), 600);
        }
      }
    };

    recognition.onerror = () => {
      setStatus("idle");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Could not capture audio. Please check microphone permissions.",
        },
      ]);
    };

    recognition.onend = () => {
      setStatus((prev) => (prev === "listening" ? "idle" : prev));
    };

    recognition.start();
  }, [status, supported, speak, navigate]);

  const statusLabel =
    status === "listening"
      ? "Listening..."
      : status === "speaking"
      ? "Speaking..."
      : "Idle";

  const statusColor =
    status === "listening"
      ? "text-[#00e676]"
      : status === "speaking"
      ? "text-[#c6f135]"
      : "text-gray-500";

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

        {/* Status indicator */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-6"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.5}
        >
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              status === "listening"
                ? "bg-[#00e676] animate-pulse"
                : status === "speaking"
                ? "bg-[#c6f135] animate-pulse"
                : "bg-gray-600"
            }`}
          />
          <span className={`text-sm font-medium ${statusColor}`}>
            {statusLabel}
          </span>
        </motion.div>

        {/* Waveform */}
        <AnimatePresence>
          {status === "listening" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Waveform />
            </motion.div>
          )}
        </AnimatePresence>

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
                    <span className="block text-[10px] uppercase tracking-wider mb-1 opacity-50">
                      {m.role === "user" ? "You said" : "Assistant"}
                    </span>
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
                status === "listening"
                  ? "bg-[#00e676] text-gray-900 shadow-lg shadow-[#00e676]/30"
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              aria-label={
                status === "listening" ? "Stop listening" : "Start listening"
              }
            >
              {status === "listening" && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#00e676]"
                  animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Available voice commands */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={2}
        >
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-400">
            Available Voice Commands
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
                custom={i * 0.15}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm text-[#00e676]">
                    &quot;{c.cmd}&quot;
                  </p>
                  <span className="text-[10px] uppercase tracking-wider text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                    {c.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Browser support notice */}
        {!supported && (
          <motion.div
            className="mt-8 p-4 bg-red-900/20 border border-red-800/30 rounded-xl text-center text-sm text-red-400"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            Your browser does not support the Web Speech API. Please use Google
            Chrome or Microsoft Edge for voice assistant features.
          </motion.div>
        )}
      </div>
    </div>
  );
}
