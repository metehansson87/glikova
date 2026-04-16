import { useState } from "react";

const LANGS = [
  { code: "tr", label: "Türkçe",    flag: "🇹🇷", sub: "Türkiye" },
  { code: "en", label: "English",   flag: "🇬🇧", sub: "United Kingdom" },
  { code: "de", label: "Deutsch",   flag: "🇩🇪", sub: "Deutschland" },
  { code: "fr", label: "Français",  flag: "🇫🇷", sub: "France" },
  { code: "it", label: "Italiano",  flag: "🇮🇹", sub: "Italia" },
  { code: "es", label: "Español",   flag: "🇪🇸", sub: "España" },
];

const TITLE = {
  tr: "Dil Seçin", en: "Choose Language", de: "Sprache wählen",
  fr: "Choisir la langue", it: "Scegli lingua", es: "Elige idioma"
};
const SUB = {
  tr: "Uygulamayı hangi dilde kullanmak istersiniz?",
  en: "Which language would you like to use?",
  de: "In welcher Sprache möchten Sie die App nutzen?",
  fr: "Dans quelle langue souhaitez-vous utiliser l'app?",
  it: "In quale lingua vuoi usare l'app?",
  es: "¿En qué idioma quieres usar la app?"
};
const BTN = {
  tr: "Devam Et", en: "Continue", de: "Weiter",
  fr: "Continuer", it: "Continua", es: "Continuar"
};

export default function LangSelect({ onSelect }) {
  const [selected, setSelected] = useState("tr");

  return (
    <div className="lang-select-shell">
      <div className="lang-select-bg" />
      <div className="lang-select-content">
        {/* Logo small */}
        <div className="lang-logo">
          <svg viewBox="0 0 60 40" fill="none" className="lang-logo-svg">
            <defs>
              <linearGradient id="ls-wave" x1="0" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fca5a5" stopOpacity="0"/>
                <stop offset="0.2" stopColor="#f87171"/>
                <stop offset="0.8" stopColor="#ef4444"/>
                <stop offset="1" stopColor="#ef4444" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="ls-dot" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#fca5a5"/><stop offset="1" stopColor="#dc2626"/>
              </linearGradient>
            </defs>
            <path d="M2 20 H13 L17 8 L22 32 L27 14 L31 26 L35 20 H58"
              stroke="url(#ls-wave)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="30" cy="20" r="8" fill="url(#ls-dot)"/>
            <text x="30" y="24" textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="'Outfit',sans-serif">G</text>
          </svg>
          <span className="lang-logo-name">Glikova</span>
        </div>

        <div className="lang-select-header">
          <h1 className="lang-title">{TITLE[selected]}</h1>
          <p className="lang-sub">{SUB[selected]}</p>
        </div>

        <div className="lang-grid">
          {LANGS.map(l => (
            <button
              key={l.code}
              className={`lang-item${selected === l.code ? " lang-item-active" : ""}`}
              onClick={() => setSelected(l.code)}
            >
              <span className="lang-flag">{l.flag}</span>
              <span className="lang-label">{l.label}</span>
              <span className="lang-sub-label">{l.sub}</span>
              {selected === l.code && <span className="lang-check">✓</span>}
            </button>
          ))}
        </div>

        <button className="lang-continue-btn" onClick={() => onSelect(selected)}>
          {BTN[selected]} →
        </button>
      </div>
    </div>
  );
}
