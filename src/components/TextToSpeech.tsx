"use client";

import { useState } from "react";

interface TextToSpeechProps {
  text: string;
}

export default function TextToSpeech({ text }: TextToSpeechProps) {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!text || typeof window === "undefined") return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 1;
    utterance.pitch = 1;

    setSpeaking(true);
    utterance.onend = () => setSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={speaking}
      className="px-3 py-1.5 rounded-full bg-accent text-white text-[11px] md:text-xs font-medium shadow-neu hover:opacity-90 disabled:opacity-50 transition"
    >
      {speaking ? "Lecture en cours..." : "Lire à voix haute"}
    </button>
  );
}
