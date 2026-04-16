// mg/dL thresholds
export const THRESHOLDS = {
  LOW: 70,
  HIGH: 180,
};

export function getStatus(value, unit = "mg/dL") {
  const mgdl = unit === "mmol/L" ? value * 18.0182 : value;
  if (mgdl < THRESHOLDS.LOW) return "low";
  if (mgdl > THRESHOLDS.HIGH) return "high";
  return "normal";
}

export function convertToMgDl(value, unit) {
  return unit === "mmol/L" ? parseFloat((value * 18.0182).toFixed(1)) : value;
}

export function convertFromMgDl(value, unit) {
  return unit === "mmol/L" ? parseFloat((value / 18.0182).toFixed(1)) : value;
}

export function formatValue(value, unit) {
  const converted = convertFromMgDl(value, unit);
  return unit === "mmol/L" ? converted.toFixed(1) : converted;
}

export const STATUS_CONFIG = {
  low: { label: "Low", color: "#f59e0b", bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  normal: { label: "Normal", color: "#10b981", bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  high: { label: "High", color: "#ef4444", bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
};

export function isWithin3Days(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffDays = (now - date) / (1000 * 60 * 60 * 24);
  return diffDays <= 3;
}
