import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const COMMANDS = {
  home: { path: "/", response: "Navigating to the home page." },
  abstract: { path: "/abstract", response: "Opening the abstract page." },
  methodology: { path: "/methodology", response: "Opening the methodology page." },
  dataset: { path: "/dataset", response: "Opening the dataset page." },
  results: { path: "/results", response: "Navigating to the results page." },
  demo: { path: "/live-demo", response: "Opening the live demo page." },
  comparison: { path: "/comparison", response: "Opening the comparison page." },
};

function processCommand(text) {
  const lower = text.toLowerCase().trim();
  let response = "";
  let navigateTo = null;

  // Navigation: "go to <page>"
  const goToMatch = lower.match(
    /go\s+to\s+(home|abstract|methodology|dataset|results|demo|comparison)/
  );
  if (goToMatch) {
    const page = goToMatch[1];
    const cmd = COMMANDS[page];
    return { response: cmd.response, navigateTo: cmd.path };
  }

  // "what is this project about"
  if (lower.includes("what is this project") || lower.includes("about")) {
    response =
      "This project uses Convolutional Neural Networks to detect crop diseases from leaf images. " +
      "It is trained on the PlantVillage dataset with over 54,000 images spanning 38 disease classes across 14 crop species.";
    return { response, navigateTo: null };
  }

  // "how accurate is your model"
  if (lower.includes("accurate") || lower.includes("accuracy")) {
    response =
      "Our CNN model achieves 96.5% accuracy on the test set, with an inference time of approximately 45 milliseconds per image.";
    return { response, navigateTo: null };
  }

  // "start demo"
  if (lower.includes("start demo")) {
    return { response: "Starting the live demo.", navigateTo: "/live-demo" };
  }

  // "open comparison"
  if (lower.includes("open comparison")) {
    return {
      response: "Opening the model comparison page.",
      navigateTo: "/comparison",
    };
  }

  // "help"
  if (lower.includes("help")) {
    response =
      'Available commands: "Go to home", "Go to abstract", "Go to methodology", "Go to dataset", "Go to results", "Go to demo", "Go to comparison", ' +
      '"What is this project about", "How accurate is your model", "Start demo", "Open comparison", "Help".';
    return { response, navigateTo: null };
  }

  // Keyword fallbacks
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

  response =
    'Sorry, I didn\'t understand that. Say "help" to see available commands.';
  return { response, navigateTo: null };
}

export default function FloatingMic() {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [assistantText, setAssistantText] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [supported, setSupported] = useState(true);
  const bubbleTimer = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const showResponse = useCallback(
    (text) => {
      setAssistantText(text);
      setShowBubble(true);
      speak(text);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      bubbleTimer.current = setTimeout(() => setShowBubble(false), 6000);
    },
    [speak]
  );

  const toggleListening = useCallback(() => {
    if (listening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setListening(false);
      return;
    }

    if (!supported) {
      showResponse(
        "Speech recognition is not supported in your browser. Please try Chrome or Edge."
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
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
        const { response, navigateTo } = processCommand(text);
        showResponse(response);
        setTranscript("");
        if (navigateTo) {
          setTimeout(() => navigate(navigateTo), 600);
        }
      }
    };

    recognition.onerror = () => {
      setListening(false);
      showResponse("Could not capture audio. Please check microphone permissions.");
    };

    recognition.onend = () => setListening(false);

    recognition.start();
  }, [listening, supported, showResponse, navigate]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Assistant response bubble */}
      <AnimatePresence>
        {showBubble && assistantText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="max-w-xs p-3 bg-gray-800 border border-gray-700 rounded-2xl rounded-br-md text-sm text-gray-300 shadow-xl"
          >
            {assistantText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript bubble */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="max-w-xs px-3 py-2 bg-[#00e676]/10 border border-[#00e676]/20 rounded-2xl rounded-br-md text-sm text-[#00e676]/80 italic shadow-xl"
          >
            {transcript}...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic button */}
      <button
        onClick={toggleListening}
        className={`relative p-4 rounded-full shadow-lg transition-all ${
          listening
            ? "bg-[#00e676] text-gray-900 shadow-[#00e676]/40"
            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
        }`}
        aria-label={listening ? "Stop listening" : "Start voice assistant"}
      >
        {listening && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#00e676]"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </button>
    </div>
  );
}
