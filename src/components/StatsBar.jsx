import { useMemo } from "react";
import { getStatus, formatValue } from "../lib/bloodSugar";

export default function StatsBar({ readings, unit, t }) {
  const stats = useMemo(() => {
    if (!readings.length) return null;
    const values = readings.map(r => r.value_mgdl);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const inRange = values.filter(v => v >= 70 && v <= 180).length;
    const tir = Math.round((inRange / values.length) * 100);
    return { avg, min, max, tir, count: values.length };
  }, [readings]);

  if (!stats) {
    return <div className="stats-empty"><p>{t.logFirst}</p></div>;
  }

  const latest = readings[0];
  const latestStatus = getStatus(latest.value_mgdl, "mg/dL");

  return (
    <div className="stats-section">
      <div className="latest-card">
        <div className="latest-label">{t.latestReading}</div>
        <div className={`latest-value status-${latestStatus}`}>
          {formatValue(latest.value_mgdl, unit)}
          <span className="latest-unit">{unit}</span>
        </div>
        <div className="latest-meta">
          {new Date(latest.recorded_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
      <div className="mini-stats">
        <div className="mini-stat"><span className="mini-label">{t.avg}</span><span className="mini-value">{formatValue(stats.avg, unit)}</span></div>
        <div className="mini-stat"><span className="mini-label">{t.min}</span><span className="mini-value text-amber">{formatValue(stats.min, unit)}</span></div>
        <div className="mini-stat"><span className="mini-label">{t.max}</span><span className="mini-value text-red">{formatValue(stats.max, unit)}</span></div>
        <div className="mini-stat"><span className="mini-label">{t.tir}</span><span className="mini-value text-green">{stats.tir}%</span></div>
      </div>
    </div>
  );
}
