import React, { useState, useEffect } from "react";
import { countries } from "./Countries";

const Translator = () => {
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [fromLang, setFromLang] = useState("en-GB");
  const [toLang, setToLang] = useState("bn-IN");

  useEffect(() => {
    // Reset translation when source text changes
    if (!fromText) {
      setToText("");
    }
  }, [fromText]);

  const handleExchange = () => {
    // Swap languages and texts
    setFromLang(toLang);
    setToLang(fromLang);
    setFromText(toText);
    setToText(fromText);
  };

  const handleTranslate = async () => {
    if (!fromText) return;
    setToText("Translating...");
    const apiUrl = `https://api.mymemory.translated.net/get?q=${fromText}&langpair=${fromLang}|${toLang}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    setToText(data.responseData.translatedText);
  };

  const handleCopy = (text, lang) => {
    navigator.clipboard.writeText(text);
  };

  const handleSpeech = (text, lang) => {
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  };

  return (
    <>
        <div className="title">
            <span>T</span>
            <span>R</span>
            <span>A</span>
            <span>N</span>
            <span>S</span>
            <span>L</span>
            <span>I</span>
            <span>T</span>
            <span>.</span>
            <span>.</span>
            <span>.</span>
        </div>
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
                value={toText}
                readOnly
                placeholder="Translation"
            ></textarea>
            </div>
            <ul className="controls">
            <li className="row from">
                <div className="icons">
                <i
                    className="fas fa-volume-up"
                    onClick={() => handleSpeech(fromText, fromLang)}
                ></i>
                <i
                    className="fas fa-copy"
                    onClick={() => handleCopy(fromText, fromLang)}
                ></i>
                </div>
                <select
                value={fromLang}
                onChange={(e) => setFromLang(e.target.value)}
                >
                {Object.keys(countries).map((country_code) => (
                    <option key={country_code} value={country_code}>
                    {countries[country_code]}
                    </option>
                ))}
                </select>
            </li>
            <li className="exchange" onClick={handleExchange}>
                <i className="fas fa-exchange-alt"></i>
            </li>
            <li className="row to">
                <select
                value={toLang}
                onChange={(e) => setToLang(e.target.value)}
                >
                {Object.keys(countries).map((country_code) => (
                    <option key={country_code} value={country_code}>
                    {countries[country_code]}
                    </option>
                ))}
                </select>
                <div className="icons">
                <i
                    className="fas fa-volume-up"
                    onClick={() => handleSpeech(toText, toLang)}
                ></i>
                <i
                    className="fas fa-copy"
                    onClick={() => handleCopy(toText, toLang)}
                ></i>
                </div>
            </li>
            </ul>
        </div>
        <button onClick={handleTranslate}>Translate Text</button>
        </div>
    </>
  );
};

export default Translator;
