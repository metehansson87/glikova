import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
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

export default function GlucoseChart({ readings, unit, t }) {
  const data = useMemo(() => {
    return [...readings].reverse().slice(-20).map(r => ({
      time: new Date(r.recorded_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      value: parseFloat(convertFromMgDl(r.value_mgdl, unit)),
      status: r.value_mgdl < 70 ? "low" : r.value_mgdl > 180 ? "high" : "normal",
    }));
  }, [readings, unit]);

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
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <ReferenceLine y={lowLine} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={highLine} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={<CustomDot />} activeDot={{ r: 6, fill: "#10b981" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
