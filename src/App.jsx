import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import LangSelect from "./pages/LangSelect";

// Splash screen
function Splash() {
  return (
    <div className="splash-screen">
      <div className="splash-logo">
        <svg viewBox="0 0 200 134" fill="none" xmlns="http://www.w3.org/2000/svg" className="splash-svg">
          <defs>
            <linearGradient id="sg-wave" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fca5a5" stopOpacity="0"/>
              <stop offset="0.2" stopColor="#f87171"/>
              <stop offset="0.8" stopColor="#ef4444"/>
              <stop offset="1" stopColor="#ef4444" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="sg-dot" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#fca5a5"/><stop offset="1" stopColor="#dc2626"/>
            </linearGradient>
          </defs>
          <path className="splash-wave" d="M10 67 H42 L54 33 L71 101 L83 54 L96 80 L108 67 H190"
            stroke="url(#sg-wave)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <circle cx="100" cy="67" r="18" fill="url(#sg-dot)" className="splash-dot"/>
          <text x="100" y="74" textAnchor="middle" fill="white" fontSize="18" fontWeight="800" fontFamily="'Outfit',sans-serif">G</text>
        </svg>
        <div className="splash-name">Glikova</div>
        <div className="splash-tagline">Kan Şekeri Takibi</div>
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("splash"); // splash | lang | auth | app
  const [lang, setLang] = useState("tr");
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Splash timer
    const timer = setTimeout(() => {
      setPhase(prev => prev === "splash" ? "lang" : prev);
    }, 2200);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // If already logged in, skip to app
  useEffect(() => {
    if (session && phase === "lang") setPhase("app");
    if (session && phase === "auth") setPhase("app");
  }, [session, phase]);

  if (!isSupabaseConfigured) {
    return (
      <div className="splash-screen">
        <div className="splash-logo">
          <div className="splash-name">Konfigurasyon Eksik</div>
          <div className="splash-tagline">
            `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` degerlerini `.env`
            dosyasina ekleyip uygulamayi yeniden baslatin.
          </div>
        </div>
      </div>
    );
  }

  if (phase === "splash") return <Splash />;
  if (phase === "lang") return <LangSelect onSelect={(l) => { setLang(l); setPhase("auth"); }} />;
  if (phase === "auth") return <AuthPage lang={lang} onAuth={() => {}} />;
  return <Dashboard session={session} initialLang={lang} />;
}
