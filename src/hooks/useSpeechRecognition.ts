"use client";

import { useState, useCallback, useRef } from 'react';

interface SpeechRecognitionCallbacks {
  onResult: (text: string) => void;
  onUnsupported: () => void;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const callbacksRef = useRef<SpeechRecognitionCallbacks>({ onResult: () => {}, onUnsupported: () => {} });

  const handleMicClick = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      callbacksRef.current.onUnsupported();
      return;
    }
    const recognition = new SR();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setIsListening(false);
      const transcript = event.results[0]![0]!.transcript;
      callbacksRef.current.onResult(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, []);

  return { isListening, handleMicClick, callbacksRef };
}
