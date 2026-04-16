import { useState, useEffect } from "react";
import { MOCK_SESSION } from "./lib/mock";
import Dashboard from "./pages/Dashboard";
import LangSelect from "./pages/LangSelect";
import AuthPage from "./pages/AuthPage";
import "./styles/globals.css";

export default function App() {
  const [phase, setPhase] = useState("splash"); // splash | lang | auth | app
  const [fadeOut, setFadeOut] = useState(false);
  const [lang, setLang] = useState("tr");
  const [session] = useState(MOCK_SESSION);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2200);
    const t2 = setTimeout(() => setPhase("lang"), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "splash") return (
    <div className={`splash-shell${fadeOut ? " splash-out" : ""}`}>
      <div className="splash-bg-glow" />
      <div className="splash-content">
        <div className="splash-logo-wrap">
          <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="splash-svg">
            <defs>
              <linearGradient id="sp-wave" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fca5a5" stopOpacity="0"/>
                <stop offset="0.15" stopColor="#f87171"/>
                <stop offset="0.85" stopColor="#ef4444"/>
                <stop offset="1" stopColor="#ef4444" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="sp-dot" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#fca5a5"/>
                <stop offset="1" stopColor="#dc2626"/>
              </linearGradient>
              <filter id="sp-glow">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <path className="sp-wave-path" d="M5 40 H28 L36 16 L46 64 L54 28 L62 52 L70 40 H115"
              stroke="url(#sp-wave)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="60" cy="40" r="16" fill="url(#sp-dot)" filter="url(#sp-glow)" className="sp-dot-anim"/>
            <text x="60" y="46" textAnchor="middle" fill="white" fontSize="17" fontWeight="800" fontFamily="'Outfit',sans-serif">G</text>
          </svg>
        </div>
        <div className="splash-name">Glikova</div>
        <div className="splash-tagline">Kan şekeri takibi</div>
        <div className="splash-dots"><span/><span/><span/></div>
      </div>
    </div>
  );

  if (phase === "lang") return (
    <LangSelect onSelect={(code) => { setLang(code); setPhase("auth"); }} />
  );

  if (phase === "auth") return (
    <AuthPage onAuth={() => setPhase("app")} lang={lang} />
  );

  return <Dashboard session={session} initialLang={lang} />;
}
