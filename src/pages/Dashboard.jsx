import { useState, useEffect } from "react";
import { useReadings } from "../hooks/useReadings.mock.js";
import { useSubscription } from "../hooks/useSubscription.mock.js";
import ReadingForm from "../components/ReadingForm";
import ReadingsList from "../components/ReadingsList";
import GlucoseChart from "../components/GlucoseChart";
import PaywallBanner from "../components/PaywallBanner.mock.jsx";
import StatsBar from "../components/StatsBar";
import InfoPage from "./InfoPage";
import SettingsPage from "./SettingsPage";
import PremiumPage from "./PremiumPage";
import { T } from "../lib/i18n";

export default function Dashboard({ session, initialLang = "en" }) {
  const { isPremium, loading: subLoading } = useSubscription(session);
  const { readings, loading, showPaywall, addReading, deleteReading } = useReadings(session, isPremium);
  const [unit, setUnit] = useState("mg/dL");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showInfo, setShowInfo] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem("glikova_lang") || initialLang);
  const [darkMode, setDarkMode] = useState(true);

  const t = T[lang] || T.en;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("glikova_lang", lang);
  }, [lang]);

  const handleSignOut = () => window.location.reload();

  const handleShare = async () => {
    try {
      // Try native share first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: "Glikova — Kan Şekeri Takibi",
          text: `Son ölçümüm: ${readings[0] ? readings[0].value_mgdl + " mg/dL" : "-"} | Glikova ile takip ediyorum`,
          url: window.location.href,
        });
      } else {
        // Fallback: screenshot via html2canvas if available, else copy link
        await navigator.clipboard.writeText(window.location.href);
        alert("Link kopyalandı!");
      }
    } catch (e) {
      // User cancelled or error
    }
  };

  if (subLoading) return null;

  // Info overlay — açıldığında üstte geri butonu göster
  if (showInfo) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <div className="header-left">
            <button onClick={() => setShowInfo(false)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",color:"var(--text-primary)",fontSize:"15px",fontWeight:"600"}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>
              {lang === "tr" ? "Geri" : "Back"}
            </button>
          </div>
          <div className="header-right">
            <span style={{fontSize:"15px",fontWeight:"600",color:"var(--text-primary)"}}>
              {lang === "tr" ? "Sağlık Makaleleri" : "Health Articles"}
            </span>
          </div>
        </header>
        <main className="app-main">
          <InfoPage lang={lang} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <div className="logo-sm">
            <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-pulse-svg">
              <defs>
                <linearGradient id="glg-wave" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fca5a5" stopOpacity="0"/>
                  <stop offset="0.25" stopColor="#f87171"/>
                  <stop offset="0.75" stopColor="#ef4444"/>
                  <stop offset="1" stopColor="#ef4444" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="glg-dot" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#fca5a5"/><stop offset="1" stopColor="#dc2626"/>
                </linearGradient>
              </defs>
              <path className="logo-wave-path" d="M2 16 H10 L13 8 L17 24 L20 13 L23 19 L26 16 H46"
                stroke="url(#glg-wave)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="24" cy="16" r="4" fill="url(#glg-dot)" className="logo-dot"/>
              <text x="24" y="19.5" textAnchor="middle" fill="white" fontSize="5" fontWeight="800" fontFamily="'Outfit',sans-serif">G</text>
            </svg>
          </div>
          <span className="app-title">Glikova</span>
          {isPremium && <span className="badge-premium">{t.premium}</span>}
        </div>
        <div className="header-right">
          <button className="share-btn" onClick={handleShare} title="Paylaş">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>
          <div className="unit-toggle">
            <button className={unit === "mg/dL" ? "active" : ""} onClick={() => setUnit("mg/dL")}>mg/dL</button>
            <button className={unit === "mmol/L" ? "active" : ""} onClick={() => setUnit("mmol/L")}>mmol/L</button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {activeTab === "dashboard" && (
          <>
            <StatsBar readings={readings} unit={unit} t={t} />
            {readings.length > 0 && <GlucoseChart readings={readings} unit={unit} t={t} />}
            {showPaywall && !isPremium && <PaywallBanner session={session} t={t} />}
          </>
        )}
        {activeTab === "history" && (
          <>
            {showPaywall && !isPremium && <PaywallBanner session={session} t={t} />}
            <ReadingsList readings={readings} unit={unit} onDelete={deleteReading} loading={loading} isPremium={isPremium} showPaywall={showPaywall} t={t} />
          </>
        )}
        {activeTab === "premium" && <PremiumPage lang={lang} isPremium={isPremium} />}
        {activeTab === "settings" && (
          <SettingsPage lang={lang} setLang={setLang} isPremium={isPremium} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} onSignOut={handleSignOut} onOpenInfo={() => setShowInfo(true)} />
        )}
      </main>

      {showForm && (
        <ReadingForm unit={unit} session={session} onAdd={addReading} onClose={() => setShowForm(false)} t={t} />
      )}

      <nav className="bottom-nav">
        <button className={activeTab === "dashboard" ? "nav-item active" : "nav-item"} onClick={() => setActiveTab("dashboard")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          <span>{lang === "tr" ? "Ana Sayfa" : "Home"}</span>
        </button>
        <button className={activeTab === "history" ? "nav-item active" : "nav-item"} onClick={() => setActiveTab("history")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>{t.history}</span>
        </button>
        <button className="nav-item add-btn" onClick={() => setShowForm(true)}>
          <div className="add-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
        </button>
        <button className={activeTab === "premium" ? "nav-item active nav-item-premium" : "nav-item nav-item-premium"} onClick={() => setActiveTab("premium")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>{isPremium ? "✓ Pro" : "Premium"}</span>
        </button>
        <button className={activeTab === "settings" ? "nav-item active" : "nav-item"} onClick={() => setActiveTab("settings")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>{lang === "tr" ? "Ayarlar" : "Settings"}</span>
        </button>
      </nav>
    </div>
  );
}
