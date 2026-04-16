import { useState } from "react";
import { convertToMgDl } from "../lib/bloodSugar";

export default function ReadingForm({ unit, onAdd, onClose, t }) {
  const [value, setValue] = useState("");
  const [mealContext, setMealContext] = useState("fasting");
  const [recordedAt, setRecordedAt] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mealOptions = [
    { value: "fasting",     label: t.fasting },
    { value: "before_meal", label: t.beforeMeal },
    { value: "after_meal",  label: t.afterMeal },
    { value: "bedtime",     label: t.bedtime },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal <= 0) return setError(t.errInvalid);
    if (unit === "mg/dL" && (numVal < 20 || numVal > 600)) return setError(t.errRangeMg);
    if (unit === "mmol/L" && (numVal < 1.1 || numVal > 33.3)) return setError(t.errRangeMmol);
    setLoading(true);
    try {
      await onAdd({
        value_mgdl: convertToMgDl(numVal, unit),
        meal_context: mealContext,
        recorded_at: new Date(recordedAt).toISOString(),
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h2>{t.logReading}</h2>
          <button className="btn-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="reading-form">
          <div className="field">
            <label>{t.bloodSugar} ({unit})</label>
            <div className="value-input-wrap">
              <input type="number" placeholder={unit === "mg/dL" ? "e.g. 120" : "e.g. 6.7"} value={value} onChange={e => setValue(e.target.value)} step={unit === "mmol/L" ? "0.1" : "1"} required autoFocus />
              <span className="unit-label">{unit}</span>
            </div>
          </div>
          <div className="field">
            <label>{t.mealContext}</label>
            <div className="meal-grid">
              {mealOptions.map(opt => (
                <button type="button" key={opt.value} className={`meal-btn ${mealContext === opt.value ? "selected" : ""}`} onClick={() => setMealContext(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>{t.dateTime}</label>
            <input type="datetime-local" value={recordedAt} onChange={e => setRecordedAt(e.target.value)} required />
          </div>
          <div className="field">
            <label>{t.notes} <span className="optional">{t.optional}</span></label>
            <textarea placeholder={t.notesPlaceholder} value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>
          {error && <div className="alert error">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t.saving : t.saveReading}
          </button>
        </form>
      </div>
    </div>
  );
}
