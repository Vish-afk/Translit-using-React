import React, { useState, useEffect, useRef } from "react";
import { countries } from "./Countries";

// Browser compatibility for Speech Recognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Translator = () => {
  // State Management
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [fromLang, setFromLang] = useState("en-GB");
  const [toLang, setToLang] = useState("ta-IN");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  
  const recognitionRef = useRef(null);

  // Effect to load available TTS voices from the browser
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Initial call
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Effect for debounced translation
  useEffect(() => {
    if (!fromText) {
      setToText("");
      return;
    }

    setIsLoading(true);
    const timerId = setTimeout(() => {
      const handleTranslate = async () => {
        try {
          const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            fromText
          )}&langpair=${fromLang}|${toLang}`;
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error("Network response was not ok.");
          
          const data = await response.json();
          if (data.responseStatus !== 200) {
            setToText(data.responseDetails || "Translation error");
          } else {
            setToText(data.responseData.translatedText);
          }
        } catch (error) {
          console.error("Translation failed:", error);
          setToText("Error: Could not translate.");
        } finally {
          setIsLoading(false);
        }
      };
      handleTranslate();
    }, 500);

    return () => clearTimeout(timerId);
  }, [fromText, fromLang, toLang]);

  // Swap languages and text
  const handleExchange = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setFromText(toText);
    setToText(fromText);
  };

  // Copy text to clipboard
  const handleCopy = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  // Text-to-Speech (Output) with voice finding
  const handleSpeech = (text, lang) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    if (text) {
      const utterance = new SpeechSynthesisUtterance(text);
      const foundVoice = voices.find(
        (voice) => voice.lang === lang || voice.lang.startsWith(lang + '-')
      );

      if (foundVoice) {
        utterance.voice = foundVoice;
      } else {
        utterance.lang = lang;
        console.warn(`No voice found for language: ${lang}. Using browser default.`);
      }
      speechSynthesis.speak(utterance);
    }
  };

  // Speech-to-Text (Input)
  const handleListen = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = fromLang;
      recognition.continuous = true;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setFromText(transcript);
      };
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  return (
    <>
      <div className="title">TRANSLATE..</div>
      <div className="container">
        <div className="wrapper">
          <div className="text-input">
            <textarea
              spellCheck="false"
              className="from-text"
              value={fromText}
              onChange={(e) => setFromText(e.target.value)}
              placeholder="Enter text"
            ></textarea>
            <textarea
              spellCheck="false"
              className="to-text"
              value={isLoading ? "Translating..." : toText}
              readOnly
              disabled
              placeholder="Translation"
            ></textarea>
          </div>
          <ul className="controls">
            <li className="row from">
              <div className="icons">
                <i
                  className="fas fa-volume-up"
                  onClick={() => handleSpeech(fromText, fromLang)}
                  title="Listen"
                ></i>
                <i
                  className="fas fa-copy"
                  onClick={() => handleCopy(fromText)}
                  title="Copy"
                ></i>
                <i
                  className={`fas fa-microphone ${isListening ? "listening" : ""}`}
                  onClick={handleListen}
                  title="Speak to type"
                ></i>
              </div>
              <select
                value={fromLang}
                onChange={(e) => setFromLang(e.target.value)}
              >
                {Object.entries(countries).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </li>
            <li className="exchange" onClick={handleExchange} title="Swap languages">
              <i className="fas fa-exchange-alt"></i>
            </li>
            <li className="row to">
              <select
                value={toLang}
                onChange={(e) => setToLang(e.target.value)}
              >
                {Object.entries(countries).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="icons">
                <i
                  className="fas fa-volume-up"
                  onClick={() => handleSpeech(toText, toLang)}
                  title="Listen"
                ></i>
                <i
                  className="fas fa-copy"
                  onClick={() => handleCopy(toText)}
                  title="Copy"
                ></i>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Translator;
