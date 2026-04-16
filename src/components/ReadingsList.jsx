import { formatValue, getStatus, STATUS_CONFIG } from "../lib/bloodSugar";

function ReadingCard({ reading, unit, onDelete, t }) {
  const status = getStatus(reading.value_mgdl, "mg/dL");
  const cfg = STATUS_CONFIG[status];
  const date = new Date(reading.recorded_at);
  const mealLabels = {
    fasting: t.fasting.replace(/^[^\s]+\s/, ""),
    before_meal: t.beforeMeal.replace(/^[^\s]+\s/, ""),
    after_meal: t.afterMeal.replace(/^[^\s]+\s/, ""),
    bedtime: t.bedtime.replace(/^[^\s]+\s/, ""),
  };

  return (
    <div className={`reading-card ${cfg.border}`}>
      <div className="reading-left">
        <div className={`status-dot ${status}`} />
        <div>
          <div className="reading-meta">{mealLabels[reading.meal_context] ?? reading.meal_context}</div>
          <div className="reading-time">
            {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </div>
          {reading.notes && <div className="reading-notes">{reading.notes}</div>}
        </div>
      </div>
      <div className="reading-right">
        <div className={`reading-value ${cfg.text}`}>{formatValue(reading.value_mgdl, unit)}</div>
        <div className={`reading-badge ${cfg.bg} ${cfg.text}`}>{cfg.label}</div>
        <button className="btn-delete" onClick={() => onDelete(reading.id)} title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
    </div>
  );
}

export default function ReadingsList({ readings, unit, onDelete, loading, showPaywall, t }) {
  if (loading) return <div className="empty-state">Loading…</div>;
  if (readings.length === 0 && !showPaywall) {
    return <div className="empty-state"><div className="empty-icon">📊</div><p>{t.noReadings}</p></div>;
  }
  return (
    <div className="readings-list">
      {showPaywall && <div className="paywall-row"><span>{t.olderHidden}</span></div>}
      {readings.map(r => <ReadingCard key={r.id} reading={r} unit={unit} onDelete={onDelete} t={t} />)}
    </div>
  );
}
