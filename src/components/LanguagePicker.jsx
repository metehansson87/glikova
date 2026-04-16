import { useState, useRef, useEffect } from "react";
import { LANGUAGES } from "../lib/i18n";

export default function LanguagePicker({ lang, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find(l => l.code === lang);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="lang-picker" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen(o => !o)}>
        <span className="lang-flag">{current.flag}</span>
        <span className="lang-code">{current.code.toUpperCase()}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={open ? "chevron open" : "chevron"}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="lang-dropdown">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              className={`lang-option ${l.code === lang ? "active" : ""}`}
              onClick={() => { onChange(l.code); setOpen(false); }}
            >
              <span className="lang-flag">{l.flag}</span>
              <span className="lang-name">{l.label}</span>
              {l.code === lang && <span className="lang-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
