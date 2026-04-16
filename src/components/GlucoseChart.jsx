import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer } from "recharts";
import { convertFromMgDl } from "../lib/bloodSugar";

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="tt-time">{label}</div>
        <div className="tt-value">{payload[0].value} <span>{unit}</span></div>
      </div>
    );
  }
  return null;
};

const TIME_FILTERS = [
  { label: "3H", hours: 3 },
  { label: "6H", hours: 6 },
  { label: "12H", hours: 12 },
  { label: "24H", hours: 24 },
];

export default function GlucoseChart({ readings, unit, t }) {
  const [activeFilter, setActiveFilter] = useState("24H");

  const data = useMemo(() => {
    const filter = TIME_FILTERS.find(f => f.label === activeFilter);
    const cutoff = Date.now() - filter.hours * 60 * 60 * 1000;
    const filtered = [...readings]
      .reverse()
      .filter(r => new Date(r.recorded_at).getTime() >= cutoff);

    // If no readings in range, show last 20
    const source = filtered.length > 0 ? filtered : [...readings].reverse().slice(-20);

    return source.map(r => ({
      time: new Date(r.recorded_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      value: parseFloat(convertFromMgDl(r.value_mgdl, unit)),
      status: r.value_mgdl < 70 ? "low" : r.value_mgdl > 180 ? "high" : "normal",
    }));
  }, [readings, unit, activeFilter]);

  const lowLine = unit === "mmol/L" ? 3.9 : 70;
  const highLine = unit === "mmol/L" ? 10.0 : 180;

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const color = payload.status === "low" ? "#f59e0b" : payload.status === "high" ? "#ef4444" : "#10b981";
    return <circle cx={cx} cy={cy} r={4} fill={color} stroke="transparent" strokeWidth={2} />;
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{t.glucoseTrend}</h3>
        <div className="chart-legend">
          <span className="legend-item low">{t.low}</span>
          <span className="legend-item normal">{t.normal}</span>
          <span className="legend-item high">{t.high}</span>
        </div>
      </div>

      {/* Time filter buttons */}
      <div className="chart-time-filter">
        {TIME_FILTERS.map(f => (
          <button
            key={f.label}
            className={`time-filter-btn${activeFilter === f.label ? " active" : ""}`}
            onClick={() => setActiveFilter(f.label)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          {/* Danger zones - red */}
          <ReferenceArea y1={highLine} fill="#ef444420" strokeOpacity={0} />
          <ReferenceArea y2={lowLine} fill="#f59e0b20" strokeOpacity={0} />
          {/* Safe zone - green */}
          <ReferenceArea y1={lowLine} y2={highLine} fill="#10b98118" strokeOpacity={0} />
          <ReferenceLine y={lowLine} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={highLine} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.6} />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={<CustomDot />} activeDot={{ r: 6, fill: "#10b981" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
