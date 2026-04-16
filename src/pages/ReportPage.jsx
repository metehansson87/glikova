import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const REPORT_PROMPTS = {
  en: (stats) => `You are a clinical diabetes educator. Analyze the following CGM (Continuous Glucose Monitor) data and write a clear, empathetic 4-paragraph report for the patient. Do NOT use bullet points or headers — write in flowing paragraphs only.

CGM Data Summary (${stats.days} days, ${stats.total} readings):
- Average glucose: ${stats.mean} mg/dL
- Min: ${stats.min} mg/dL, Max: ${stats.max} mg/dL
- Variability (std dev): ${stats.std} mg/dL
- Time in Range (70-180 mg/dL): ${stats.tir}%
- Time below range (<70): ${stats.low}% (${stats.lowCount} readings)
- Time above range (>180): ${stats.high}% (${stats.highCount} readings)
- Morning avg (6-12h): ${stats.morning} mg/dL
- Afternoon avg (12-18h): ${stats.afternoon} mg/dL
- Evening avg (18-24h): ${stats.evening} mg/dL
- Night avg (0-6h): ${stats.night} mg/dL

Paragraph 1: General overview of glucose control quality.
Paragraph 2: Time-in-range analysis and what it means for the patient.
Paragraph 3: Day-part patterns — when glucose is highest/lowest and why that might be.
Paragraph 4: Risk warnings if any (hypoglycemia, hyperglycemia spikes) and actionable recommendations.

Be warm, supportive, and non-alarmist. Use plain language a non-medical person can understand.`,

  tr: (stats) => `Sen bir klinik diyabet eğitimcisisin. Aşağıdaki CGM (Sürekli Glikoz İzleme) verilerini analiz et ve hasta için sıcak, anlayışlı 4 paragraflık bir rapor yaz. Madde işareti veya başlık KULLANMA — yalnızca düz paragraflar yaz.

CGM Veri Özeti (${stats.days} gün, ${stats.total} ölçüm):
- Ortalama glikoz: ${stats.mean} mg/dL
- Min: ${stats.min} mg/dL, Maks: ${stats.max} mg/dL
- Değişkenlik (std sapma): ${stats.std} mg/dL
- Hedef aralıkta geçirilen süre (70-180 mg/dL): ${stats.tir}%
- Düşük aralık (<70): ${stats.low}% (${stats.lowCount} ölçüm)
- Yüksek aralık (>180): ${stats.high}% (${stats.highCount} ölçüm)
- Sabah ort. (6-12): ${stats.morning} mg/dL
- Öğleden sonra ort. (12-18): ${stats.afternoon} mg/dL
- Akşam ort. (18-24): ${stats.evening} mg/dL
- Gece ort. (0-6): ${stats.night} mg/dL

1. Paragraf: Glikoz kontrolünün genel kalitesine dair genel bir bakış.
2. Paragraf: Hedef aralık süresi analizi ve bunun hasta için ne anlama geldiği.
3. Paragraf: Gün içi örüntüler — glikozun ne zaman yüksek/düşük olduğu ve olası nedenleri.
4. Paragraf: Varsa risk uyarıları (hipoglisemi, hiperglisemi atakları) ve uygulanabilir öneriler.

Sıcak, destekleyici ve abartısız ol. Tıbbi bilgisi olmayan birinin anlayabileceği sade bir dil kullan.`,

  de: (stats) => `Du bist ein klinischer Diabetes-Berater. Analysiere die folgenden CGM-Daten und schreibe einen klaren, einfühlsamen 4-Absatz-Bericht für den Patienten. Verwende KEINE Aufzählungspunkte oder Überschriften — schreibe nur in fließenden Absätzen.

CGM-Datenzusammenfassung (${stats.days} Tage, ${stats.total} Messungen):
- Durchschnittliche Glukose: ${stats.mean} mg/dL
- Min: ${stats.min} mg/dL, Max: ${stats.max} mg/dL
- Variabilität (Standardabweichung): ${stats.std} mg/dL
- Zeit im Zielbereich (70-180 mg/dL): ${stats.tir}%
- Zeit unter Zielbereich (<70): ${stats.low}% (${stats.lowCount} Messungen)
- Zeit über Zielbereich (>180): ${stats.high}% (${stats.highCount} Messungen)
- Morgen (6-12h): ${stats.morning} mg/dL
- Nachmittag (12-18h): ${stats.afternoon} mg/dL
- Abend (18-24h): ${stats.evening} mg/dL
- Nacht (0-6h): ${stats.night} mg/dL

Absatz 1: Allgemeiner Überblick über die Glukosekontrolle.
Absatz 2: Zeit-im-Zielbereich-Analyse.
Absatz 3: Tageszeit-Muster.
Absatz 4: Risikowarnungen und Empfehlungen.`,

  fr: (stats) => `Tu es un éducateur clinique en diabétologie. Analyse les données CGM suivantes et rédige un rapport de 4 paragraphes clair et empathique pour le patient. N'utilise PAS de puces ni de titres — écris uniquement en paragraphes fluides.

Résumé des données CGM (${stats.days} jours, ${stats.total} mesures):
- Glycémie moyenne: ${stats.mean} mg/dL
- Min: ${stats.min} mg/dL, Max: ${stats.max} mg/dL
- Variabilité: ${stats.std} mg/dL
- Temps dans la cible (70-180): ${stats.tir}%
- En dessous de la cible (<70): ${stats.low}%
- Au-dessus de la cible (>180): ${stats.high}%
- Matin (6-12h): ${stats.morning} mg/dL
- Après-midi (12-18h): ${stats.afternoon} mg/dL
- Soir (18-24h): ${stats.evening} mg/dL
- Nuit (0-6h): ${stats.night} mg/dL`,

  it: (stats) => `Sei un educatore clinico del diabete. Analizza i seguenti dati CGM e scrivi un report chiaro ed empatico di 4 paragrafi per il paziente. NON usare elenchi puntati o intestazioni — scrivi solo in paragrafi fluenti.

Riepilogo dati CGM (${stats.days} giorni, ${stats.total} misurazioni):
- Glucosio medio: ${stats.mean} mg/dL
- Min: ${stats.min} mg/dL, Max: ${stats.max} mg/dL
- Variabilità: ${stats.std} mg/dL
- Tempo nel range (70-180): ${stats.tir}%
- Sotto il range (<70): ${stats.low}%
- Sopra il range (>180): ${stats.high}%
- Mattina (6-12h): ${stats.morning} mg/dL
- Pomeriggio (12-18h): ${stats.afternoon} mg/dL
- Sera (18-24h): ${stats.evening} mg/dL
- Notte (0-6h): ${stats.night} mg/dL`,

  es: (stats) => `Eres un educador clínico en diabetes. Analiza los siguientes datos CGM y escribe un informe claro y empático de 4 párrafos para el paciente. NO uses viñetas ni encabezados — escribe solo en párrafos fluidos.

Resumen de datos CGM (${stats.days} días, ${stats.total} lecturas):
- Glucosa promedio: ${stats.mean} mg/dL
- Mín: ${stats.min} mg/dL, Máx: ${stats.max} mg/dL
- Variabilidad: ${stats.std} mg/dL
- Tiempo en rango (70-180): ${stats.tir}%
- Por debajo del rango (<70): ${stats.low}%
- Por encima del rango (>180): ${stats.high}%
- Mañana (6-12h): ${stats.morning} mg/dL
- Tarde (12-18h): ${stats.afternoon} mg/dL
- Noche (18-24h): ${stats.evening} mg/dL
- Madrugada (0-6h): ${stats.night} mg/dL`,
};

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Find header row
        let headerIdx = 0;
        for (let i = 0; i < Math.min(rows.length, 5); i++) {
          if (rows[i].some(c => String(c).toLowerCase().includes("glucose") || String(c).toLowerCase().includes("glikoz") || String(c).toLowerCase().includes("reading"))) {
            headerIdx = i;
            break;
          }
        }

        const headers = rows[headerIdx].map(h => String(h).toLowerCase());
        const timeIdx = headers.findIndex(h => h.includes("time") || h.includes("zaman") || h.includes("date"));
        const glucoseIdx = headers.findIndex(h => h.includes("glucose") || h.includes("reading") || h.includes("glikoz") || h.includes("sensor"));

        if (timeIdx === -1 || glucoseIdx === -1) throw new Error("Could not find time or glucose columns.");

        const readings = [];
        for (let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          const rawTime = row[timeIdx];
          const rawGlucose = parseFloat(row[glucoseIdx]);
          if (!rawTime || isNaN(rawGlucose)) continue;

          let time;
          if (typeof rawTime === "number") {
            // Excel serial date
            time = new Date(Math.round((rawTime - 25569) * 86400 * 1000));
          } else {
            const cleaned = String(rawTime).replace(/\s*GMT[+-]\d+/i, "").trim();
            time = new Date(cleaned);
          }
          if (isNaN(time.getTime())) continue;
          readings.push({ time, glucose: rawGlucose });
        }

        if (readings.length < 10) throw new Error("Not enough valid readings found.");
        resolve(readings);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("File read error."));
    reader.readAsArrayBuffer(file);
  });
}

function calcStats(readings) {
  const values = readings.map(r => r.glucose);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const lowCount = values.filter(v => v < 70).length;
  const highCount = values.filter(v => v > 180).length;
  const normalCount = values.filter(v => v >= 70 && v <= 180).length;
  const total = values.length;

  const byHour = (h1, h2) => {
    const sub = readings.filter(r => r.time.getHours() >= h1 && r.time.getHours() < h2).map(r => r.glucose);
    return sub.length ? Math.round(sub.reduce((a, b) => a + b, 0) / sub.length) : null;
  };

  const days = Math.max(1, Math.round((Math.max(...readings.map(r => r.time)) - Math.min(...readings.map(r => r.time))) / (1000 * 60 * 60 * 24)));

  return {
    total, days,
    mean: Math.round(mean),
    std: Math.round(std),
    min, max,
    tir: Math.round((normalCount / total) * 100),
    low: Math.round((lowCount / total) * 100),
    high: Math.round((highCount / total) * 100),
    lowCount, highCount,
    morning: byHour(6, 12),
    afternoon: byHour(12, 18),
    evening: byHour(18, 24),
    night: byHour(0, 6),
  };
}

export default function ReportPage({ lang, t }) {
  const [file, setFile] = useState(null);
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parseError, setParseError] = useState("");
  const inputRef = useRef();

  const handleFile = async (f) => {
    setFile(f);
    setStats(null);
    setReport("");
    setError("");
    setParseError("");
    try {
      const readings = await parseExcel(f);
      setStats(calcStats(readings));
    } catch (err) {
      setParseError(err.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const generateReport = async () => {
    if (!stats) return;
    setLoading(true);
    setReport("");
    setError("");

    const promptFn = REPORT_PROMPTS[lang] || REPORT_PROMPTS.en;
    const prompt = promptFn(stats);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      if (!text) throw new Error("No response from AI.");
      setReport(text);
    } catch (err) {
      setError("Could not generate report. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const LABELS = {
    en: { title: "CGM Report", upload: "Upload your CGM Excel file", dragHint: "Drag & drop or click to upload", formats: "Supports: SiBionics, Dexcom, FreeStyle Libre exports", analyze: "Generate AI Report", generating: "Generating report…", statsTitle: "Data Summary", days: "Days", readings: "Readings", avg: "Avg", tir: "TIR", low: "Low", high: "High", reportTitle: "Your Report", disclaimer: "⚠️ This report is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider.", copy: "Copy Report" },
    tr: { title: "CGM Raporu", upload: "CGM Excel dosyanızı yükleyin", dragHint: "Sürükleyip bırakın veya tıklayın", formats: "Desteklenen: SiBionics, Dexcom, FreeStyle Libre", analyze: "AI Raporu Oluştur", generating: "Rapor oluşturuluyor…", statsTitle: "Veri Özeti", days: "Gün", readings: "Ölçüm", avg: "Ort.", tir: "Hedef", low: "Düşük", high: "Yüksek", reportTitle: "Raporunuz", disclaimer: "⚠️ Bu rapor yalnızca bilgilendirme amaçlıdır ve tıbbi tavsiye niteliği taşımaz. Her zaman sağlık uzmanınıza danışın.", copy: "Raporu Kopyala" },
    de: { title: "CGM-Bericht", upload: "CGM-Excel-Datei hochladen", dragHint: "Drag & Drop oder klicken", formats: "Unterstützt: SiBionics, Dexcom, FreeStyle Libre", analyze: "KI-Bericht erstellen", generating: "Bericht wird erstellt…", statsTitle: "Datenzusammenfassung", days: "Tage", readings: "Messungen", avg: "Ø", tir: "TIB", low: "Niedrig", high: "Hoch", reportTitle: "Ihr Bericht", disclaimer: "⚠️ Dieser Bericht dient nur zur Information und stellt keine medizinische Beratung dar.", copy: "Bericht kopieren" },
    fr: { title: "Rapport CGM", upload: "Télécharger votre fichier Excel CGM", dragHint: "Glisser-déposer ou cliquer", formats: "Compatible: SiBionics, Dexcom, FreeStyle Libre", analyze: "Générer le rapport IA", generating: "Génération en cours…", statsTitle: "Résumé des données", days: "Jours", readings: "Mesures", avg: "Moy", tir: "TIR", low: "Bas", high: "Élevé", reportTitle: "Votre rapport", disclaimer: "⚠️ Ce rapport est à titre informatif uniquement et ne constitue pas un avis médical.", copy: "Copier le rapport" },
    it: { title: "Report CGM", upload: "Carica il tuo file Excel CGM", dragHint: "Trascina o clicca per caricare", formats: "Supporta: SiBionics, Dexcom, FreeStyle Libre", analyze: "Genera Report AI", generating: "Generazione in corso…", statsTitle: "Riepilogo dati", days: "Giorni", readings: "Misurazioni", avg: "Med", tir: "TIR", low: "Basso", high: "Alto", reportTitle: "Il tuo report", disclaimer: "⚠️ Questo report è solo informativo e non costituisce un consiglio medico.", copy: "Copia report" },
    es: { title: "Informe CGM", upload: "Sube tu archivo Excel CGM", dragHint: "Arrastra y suelta o haz clic", formats: "Compatible: SiBionics, Dexcom, FreeStyle Libre", analyze: "Generar informe IA", generating: "Generando informe…", statsTitle: "Resumen de datos", days: "Días", readings: "Lecturas", avg: "Prom", tir: "TIR", low: "Bajo", high: "Alto", reportTitle: "Tu informe", disclaimer: "⚠️ Este informe es solo informativo y no constituye asesoramiento médico.", copy: "Copiar informe" },
  };

  const L = LABELS[lang] || LABELS.en;

  return (
    <div className="report-page">
      <h2 className="report-title">{L.title}</h2>

      {/* Upload area */}
      <div
        className={`upload-zone ${file ? "has-file" : ""}`}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
        />
        {file ? (
          <>
            <div className="upload-icon">✅</div>
            <div className="upload-filename">{file.name}</div>
            <div className="upload-hint">{stats ? `${stats.total} readings · ${stats.days} days` : "Parsing…"}</div>
          </>
        ) : (
          <>
            <div className="upload-icon">📊</div>
            <div className="upload-label">{L.upload}</div>
            <div className="upload-hint">{L.dragHint}</div>
            <div className="upload-formats">{L.formats}</div>
          </>
        )}
      </div>

      {parseError && <div className="alert error">{parseError}</div>}

      {/* Stats summary */}
      {stats && (
        <div className="report-stats">
          <div className="report-stat-grid">
            <div className="rstat"><span className="rstat-val">{stats.days}</span><span className="rstat-label">{L.days}</span></div>
            <div className="rstat"><span className="rstat-val">{stats.total}</span><span className="rstat-label">{L.readings}</span></div>
            <div className="rstat"><span className="rstat-val">{stats.mean}</span><span className="rstat-label">{L.avg}</span></div>
            <div className="rstat tir"><span className="rstat-val text-green">{stats.tir}%</span><span className="rstat-label">{L.tir}</span></div>
            <div className="rstat"><span className="rstat-val text-amber">{stats.low}%</span><span className="rstat-label">{L.low}</span></div>
            <div className="rstat"><span className="rstat-val text-red">{stats.high}%</span><span className="rstat-label">{L.high}</span></div>
          </div>

          <button className="btn-primary" onClick={generateReport} disabled={loading}>
            {loading ? L.generating : L.analyze}
          </button>
        </div>
      )}

      {error && <div className="alert error">{error}</div>}

      {/* Report output */}
      {report && (
        <div className="report-output">
          <div className="report-output-header">
            <h3>{L.reportTitle}</h3>
            <button className="btn-copy" onClick={() => navigator.clipboard.writeText(report)}>
              {L.copy}
            </button>
          </div>
          <div className="report-text">
            {report.split("\n\n").filter(p => p.trim()).map((para, i) => (
              <p key={i}>{para.trim()}</p>
            ))}
          </div>
          <div className="report-disclaimer">{L.disclaimer}</div>
        </div>
      )}
    </div>
  );
}
