import { useState, useRef } from "react";
import { mockStore } from "../lib/mock";
import * as XLSX from "xlsx";
import { LANGUAGES } from "../lib/i18n";

// ── CGM Excel parser ──────────────────────────────────────────────
function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        let headerIdx = 0;
        for (let i = 0; i < Math.min(rows.length, 5); i++) {
          if (rows[i].some(c => /glucose|glikoz|reading/i.test(String(c)))) { headerIdx = i; break; }
        }
        const headers = rows[headerIdx].map(h => String(h).toLowerCase());
        const tIdx = headers.findIndex(h => /time|zaman|date/.test(h));
        const gIdx = headers.findIndex(h => /glucose|reading|glikoz|sensor/.test(h));
        if (tIdx === -1 || gIdx === -1) throw new Error("Kolon bulunamadı.");
        const readings = [];
        for (let i = headerIdx + 1; i < rows.length; i++) {
          const g = parseFloat(rows[i][gIdx]);
          if (isNaN(g)) continue;
          const raw = rows[i][tIdx];
          let t = typeof raw === "number"
            ? new Date(Math.round((raw - 25569) * 86400000))
            : new Date(String(raw).replace(/\s*GMT[+-]\d+/i, "").trim());
          if (isNaN(t.getTime())) continue;
          readings.push({ time: t, glucose: g });
        }
        if (readings.length < 10) throw new Error("Yeterli veri yok.");
        resolve(readings);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.readAsArrayBuffer(file);
  });
}

function calcStats(readings) {
  const v = readings.map(r => r.glucose);
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const std = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length);
  const byH = (h1, h2) => { const s = readings.filter(r => r.time.getHours() >= h1 && r.time.getHours() < h2).map(r => r.glucose); return s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : mean; };
  const days = Math.max(1, Math.round((Math.max(...readings.map(r => r.time)) - Math.min(...readings.map(r => r.time))) / 86400000));
  const lowCount = v.filter(x => x < 70).length;
  const highCount = v.filter(x => x > 180).length;
  return { total: v.length, days, mean: Math.round(mean), std: Math.round(std), min: Math.min(...v), max: Math.max(...v), tir: Math.round(v.filter(x => x >= 70 && x <= 180).length / v.length * 100), low: Math.round(lowCount / v.length * 100), high: Math.round(highCount / v.length * 100), lowCount, highCount, morning: byH(6, 12), afternoon: byH(12, 18), evening: byH(18, 24), night: byH(0, 6) };
}

const PROMPTS = {
  en: s => `You are a clinical diabetes educator. Write a warm, empathetic 4-paragraph report for a patient based on their CGM data. No bullet points or headers — flowing paragraphs only.\n\nCGM Summary (${s.days} days, ${s.total} readings): avg ${s.mean} mg/dL, min ${s.min}, max ${s.max}, std ${s.std}. TIR (70-180): ${s.tir}%. Low (<70): ${s.low}% (${s.lowCount}). High (>180): ${s.high}% (${s.highCount}). Morning: ${s.morning}, Afternoon: ${s.afternoon}, Evening: ${s.evening}, Night: ${s.night} mg/dL.\n\nParagraph 1: Overall glucose control. Paragraph 2: Time-in-range analysis. Paragraph 3: Daily patterns. Paragraph 4: Risk warnings and actionable tips. Be supportive and use plain language.`,
  tr: s => `Sen klinik bir diyabet eğitimcisisin. Hastanın CGM verilerine dayanarak sıcak, anlayışlı 4 paragraflık bir rapor yaz. Madde işareti veya başlık kullanma — yalnızca düz paragraflar.\n\nCGM Özeti (${s.days} gün, ${s.total} ölçüm): ort ${s.mean} mg/dL, min ${s.min}, maks ${s.max}, std ${s.std}. TIR (70-180): ${s.tir}%. Düşük (<70): ${s.low}% (${s.lowCount}). Yüksek (>180): ${s.high}% (${s.highCount}). Sabah: ${s.morning}, Öğle: ${s.afternoon}, Akşam: ${s.evening}, Gece: ${s.night} mg/dL.\n\n1. paragraf: Genel glikoz kontrolü. 2. paragraf: Hedef aralık analizi. 3. paragraf: Gün içi örüntüler. 4. paragraf: Risk uyarıları ve somut öneriler. Destekleyici ve sade bir dil kullan.`,
  de: s => `Du bist ein klinischer Diabetes-Berater. Schreibe einen einfühlsamen 4-Absatz-Bericht ohne Aufzählungen.\n\nCGM (${s.days} Tage, ${s.total} Messungen): Ø ${s.mean} mg/dL, min ${s.min}, max ${s.max}. TIB: ${s.tir}%. Niedrig: ${s.low}%. Hoch: ${s.high}%. Morgen ${s.morning}, Nachmittag ${s.afternoon}, Abend ${s.evening}, Nacht ${s.night} mg/dL. Absatz 1: Überblick. 2: TIB. 3: Tagesverlauf. 4: Risiken & Tipps.`,
  fr: s => `Tu es éducateur diabétologue. Rédige un rapport de 4 paragraphes chaleureux sans puces.\n\nCGM (${s.days} jours, ${s.total} mesures): moy ${s.mean}, min ${s.min}, max ${s.max}. TIR: ${s.tir}%. Bas: ${s.low}%. Élevé: ${s.high}%. Matin ${s.morning}, Après-midi ${s.afternoon}, Soir ${s.evening}, Nuit ${s.night} mg/dL. §1: Aperçu. §2: TIR. §3: Patterns. §4: Risques & conseils.`,
  it: s => `Sei un educatore diabetologo. Scrivi un report empatico di 4 paragrafi senza elenchi.\n\nCGM (${s.days} giorni, ${s.total} misure): media ${s.mean}, min ${s.min}, max ${s.max}. TIR: ${s.tir}%. Basso: ${s.low}%. Alto: ${s.high}%. Mattina ${s.morning}, Pomeriggio ${s.afternoon}, Sera ${s.evening}, Notte ${s.night} mg/dL.`,
  es: s => `Eres educador diabetólogo. Escribe un informe empático de 4 párrafos sin viñetas.\n\nCGM (${s.days} días, ${s.total} lecturas): prom ${s.mean}, min ${s.min}, max ${s.max}. TIR: ${s.tir}%. Bajo: ${s.low}%. Alto: ${s.high}%. Mañana ${s.morning}, Tarde ${s.afternoon}, Noche ${s.evening}, Madrugada ${s.night} mg/dL.`,
};

export default function SettingsPage({ lang, setLang, isPremium, darkMode, onToggleDark, onSignOut, onOpenInfo }) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  // CGM Report
  const [cgmFile, setCgmFile] = useState(null);
  const [cgmStats, setCgmStats] = useState(null);
  const [cgmReport, setCgmReport] = useState("");
  const [cgmLoading, setCgmLoading] = useState(false);
  const [cgmError, setCgmError] = useState("");
  const [cgmParseError, setCgmParseError] = useState("");
  const cgmInputRef = useRef();

  const L = {
    en: {
      title: "Settings",
      appearance: "Appearance",
      language: "Language",
      languageDesc: "Choose app language",
      darkMode: "Dark Mode",
      darkModeDesc: "Switch between dark and light theme",
      data: "Data",
      exportPDF: "Export to PDF",
      exportDesc: "Download your glucose history as PDF",
      deleteAll: "Delete All Data",
      deleteDesc: "Permanently remove all glucose readings",
      deleteConfirmMsg: "Are you sure? This cannot be undone.",
      deleteYes: "Yes, delete everything",
      deleteNo: "Cancel",
      subscription: "Subscription",
      upgrade: "Upgrade to Premium",
      upgradeDesc: "Unlock full history for a one-time payment of ₺75",
      alreadyPremium: "✓ You are a Premium member",
      community: "Community",
      rateUs: "Rate & Review Us",
      rateDesc: "Support us on the App Store",
      share: "Share with Friends",
      shareDesc: "Tell your friends about Glikova",
      feedback: "Send Feedback",
      feedbackDesc: "Share ideas or report issues",
      feedbackPlaceholder: "Your message...",
      send: "Send",
      sent: "✓ Message sent!",
      exporting: "Generating PDF…",
    },
    tr: {
      title: "Ayarlar",
      appearance: "Görünüm",
      language: "Dil",
      languageDesc: "Uygulama dilini seç",
      darkMode: "Karanlık Mod",
      darkModeDesc: "Karanlık ve aydınlık tema arasında geçiş yap",
      data: "Veriler",
      exportPDF: "PDF Olarak Dışa Aktar",
      exportDesc: "Glikoz geçmişini PDF olarak indir",
      deleteAll: "Tüm Verileri Sil",
      deleteDesc: "Tüm glikoz ölçümlerini kalıcı olarak sil",
      deleteConfirmMsg: "Emin misin? Bu işlem geri alınamaz.",
      deleteYes: "Evet, her şeyi sil",
      deleteNo: "İptal",
      subscription: "Abonelik",
      upgrade: "Premium'a Yükselt",
      upgradeDesc: "Tek seferlik ₺75 ödemeyle tüm geçmişin kilidini aç",
      alreadyPremium: "✓ Premium üyesiniz",
      community: "Topluluk",
      rateUs: "Bizi Oylayın ve Yorum Yapın",
      rateDesc: "App Store'da bize destek verin",
      share: "Arkadaşlarınla Paylaş",
      shareDesc: "Glikova'i arkadaşlarına anlat",
      feedback: "İstek ve Öneri",
      feedbackDesc: "Fikir paylaş veya sorun bildir",
      feedbackPlaceholder: "Mesajınız...",
      send: "Gönder",
      sent: "✓ Mesaj gönderildi!",
      exporting: "PDF oluşturuluyor…",
    },
    de: {
      title: "Einstellungen", appearance: "Erscheinungsbild", language: "Sprache", languageDesc: "App-Sprache wählen", darkMode: "Dunkelmodus", darkModeDesc: "Zwischen hellem und dunklem Design wechseln", data: "Daten", exportPDF: "Als PDF exportieren", exportDesc: "Glukose-Verlauf als PDF herunterladen", deleteAll: "Alle Daten löschen", deleteDesc: "Alle Glukosemessungen dauerhaft entfernen", deleteConfirmMsg: "Bist du sicher? Dies kann nicht rückgängig gemacht werden.", deleteYes: "Ja, alles löschen", deleteNo: "Abbrechen", subscription: "Abonnement", upgrade: "Auf Premium upgraden", upgradeDesc: "Vollständigen Verlauf für einmalig ₺75 freischalten", alreadyPremium: "✓ Sie sind Premium-Mitglied", community: "Community", rateUs: "Bewerten & Rezension schreiben", rateDesc: "Im App Store unterstützen", share: "Mit Freunden teilen", shareDesc: "Erzähle Freunden von Glikova", feedback: "Feedback senden", feedbackDesc: "Ideen teilen oder Probleme melden", feedbackPlaceholder: "Ihre Nachricht...", send: "Senden", sent: "✓ Nachricht gesendet!", exporting: "PDF wird erstellt…",
    },
    fr: {
      title: "Paramètres", appearance: "Apparence", language: "Langue", languageDesc: "Choisir la langue de l'application", darkMode: "Mode sombre", darkModeDesc: "Basculer entre thème sombre et clair", data: "Données", exportPDF: "Exporter en PDF", exportDesc: "Télécharger l'historique en PDF", deleteAll: "Supprimer toutes les données", deleteDesc: "Supprimer définitivement toutes les mesures", deleteConfirmMsg: "Êtes-vous sûr ? Impossible d'annuler.", deleteYes: "Oui, tout supprimer", deleteNo: "Annuler", subscription: "Abonnement", upgrade: "Passer à Premium", upgradeDesc: "Débloquer tout l'historique pour ₺75 unique", alreadyPremium: "✓ Vous êtes membre Premium", community: "Communauté", rateUs: "Noter & Commenter", rateDesc: "Soutenez-nous sur l'App Store", share: "Partager avec des amis", shareDesc: "Parlez de Glikova à vos amis", feedback: "Envoyer des commentaires", feedbackDesc: "Partagez des idées ou signalez des problèmes", feedbackPlaceholder: "Votre message...", send: "Envoyer", sent: "✓ Message envoyé !", exporting: "Génération du PDF…",
    },
    it: {
      title: "Impostazioni", appearance: "Aspetto", language: "Lingua", languageDesc: "Scegli la lingua dell'app", darkMode: "Modalità scura", darkModeDesc: "Passa tra tema scuro e chiaro", data: "Dati", exportPDF: "Esporta in PDF", exportDesc: "Scarica la cronologia come PDF", deleteAll: "Elimina tutti i dati", deleteDesc: "Rimuovi definitivamente tutte le misurazioni", deleteConfirmMsg: "Sei sicuro? Non può essere annullato.", deleteYes: "Sì, elimina tutto", deleteNo: "Annulla", subscription: "Abbonamento", upgrade: "Passa a Premium", upgradeDesc: "Sblocca tutta la cronologia per ₺75 una tantum", alreadyPremium: "✓ Sei membro Premium", community: "Community", rateUs: "Valuta e Recensisci", rateDesc: "Supportaci sull'App Store", share: "Condividi con gli amici", shareDesc: "Parla di Glikova ai tuoi amici", feedback: "Invia feedback", feedbackDesc: "Condividi idee o segnala problemi", feedbackPlaceholder: "Il tuo messaggio...", send: "Invia", sent: "✓ Messaggio inviato!", exporting: "Generazione PDF…",
    },
    es: {
      title: "Configuración", appearance: "Apariencia", language: "Idioma", languageDesc: "Elige el idioma de la app", darkMode: "Modo oscuro", darkModeDesc: "Cambiar entre tema oscuro y claro", data: "Datos", exportPDF: "Exportar a PDF", exportDesc: "Descargar historial de glucosa como PDF", deleteAll: "Eliminar todos los datos", deleteDesc: "Eliminar permanentemente todas las lecturas", deleteConfirmMsg: "¿Estás seguro? No se puede deshacer.", deleteYes: "Sí, eliminar todo", deleteNo: "Cancelar", subscription: "Suscripción", upgrade: "Actualizar a Premium", upgradeDesc: "Desbloquea todo el historial por ₺75 único", alreadyPremium: "✓ Eres miembro Premium", community: "Comunidad", rateUs: "Valorar y Reseñar", rateDesc: "Apóyanos en la App Store", share: "Compartir con amigos", shareDesc: "Cuéntales a tus amigos sobre Glikova", feedback: "Enviar sugerencias", feedbackDesc: "Comparte ideas o reporta problemas", feedbackPlaceholder: "Tu mensaje...", send: "Enviar", sent: "✓ ¡Mensaje enviado!", exporting: "Generando PDF…",
    },
  };

  const t = L[lang] || L.en;

  const handleExportPDF = () => {
    const readings = mockStore.getReadings();
    const lines = readings.map(r => `${new Date(r.recorded_at).toLocaleString()} | ${r.value_mgdl} mg/dL | ${r.meal_context}`).join("\n");
    const blob = new Blob([`Glikova - Glucose History\n${"=".repeat(40)}\n\n${lines}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "glikova-export.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAll = () => {
    mockStore.deleteAll();
    setDeleteConfirm(false);
    window.location.reload();
  };

  const handleShare = async () => {
    const shareData = { title: "Glikova", text: "I'm tracking my blood sugar with Glikova! 🩸", url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleFeedback = () => {
    const subject = encodeURIComponent("Glikova Feedback");
    const body = encodeURIComponent(feedbackText);
    window.location.href = `mailto:info@umob.app?subject=${subject}&body=${body}`;
    setFeedbackSent(true);
    setFeedbackText("");
    setTimeout(() => { setFeedbackSent(false); setFeedbackOpen(false); }, 2000);
  };

  const handleUpgrade = () => {
    if (typeof window.__mockSetPremium === "function") {
      window.__mockSetPremium(true);
      alert("✨ Premium activated! (Mock mode)");
    }
  };

  const handleCgmFile = async (f) => {
    setCgmFile(f); setCgmStats(null); setCgmReport(""); setCgmError(""); setCgmParseError("");
    try { setCgmStats(calcStats(await parseExcel(f))); } catch (err) { setCgmParseError(err.message); }
  };

  const generateCgmReport = async () => {
    if (!cgmStats) return;
    setCgmLoading(true); setCgmReport(""); setCgmError("");
    try {
      const groqKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!groqKey) throw new Error("VITE_GROQ_API_KEY eksik (.env dosyasına ekleyin).");
      const prompt = (PROMPTS[lang] || PROMPTS.en)(cgmStats);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      if (!text) throw new Error("Yanıt alınamadı.");
      setCgmReport(text);
    } catch (err) { setCgmError(err.message); }
    finally { setCgmLoading(false); }
  };

  const CGM_LABELS = {
    en: { section: "CGM Report", upload: "Upload CGM Excel", dragHint: "Tap to select file (.xlsx)", generate: "Generate Doctor's Report", generating: "Analysing…", copy: "Copy", disclaimer: "⚠️ For informational purposes only. Always consult your doctor." },
    tr: { section: "CGM Raporu", upload: "CGM Excel Yükle", dragHint: "Dosya seçmek için dokun (.xlsx)", generate: "Doktor Yorumu Oluştur", generating: "Analiz ediliyor…", copy: "Kopyala", disclaimer: "⚠️ Yalnızca bilgilendirme amaçlıdır. Her zaman doktorunuza danışın." },
    de: { section: "CGM-Bericht", upload: "CGM Excel hochladen", dragHint: "Datei auswählen (.xlsx)", generate: "Arztbericht erstellen", generating: "Analyse läuft…", copy: "Kopieren", disclaimer: "⚠️ Nur zur Information. Konsultieren Sie immer Ihren Arzt." },
    fr: { section: "Rapport CGM", upload: "Charger Excel CGM", dragHint: "Sélectionner un fichier (.xlsx)", generate: "Générer le rapport médical", generating: "Analyse en cours…", copy: "Copier", disclaimer: "⚠️ À titre informatif uniquement. Consultez toujours votre médecin." },
    it: { section: "Report CGM", upload: "Carica Excel CGM", dragHint: "Seleziona file (.xlsx)", generate: "Genera referto medico", generating: "Analisi in corso…", copy: "Copia", disclaimer: "⚠️ Solo a scopo informativo. Consulta sempre il tuo medico." },
    es: { section: "Informe CGM", upload: "Cargar Excel CGM", dragHint: "Seleccionar archivo (.xlsx)", generate: "Generar informe médico", generating: "Analizando…", copy: "Copiar", disclaimer: "⚠️ Solo informativo. Consulta siempre a tu médico." },
  };
  const cl = CGM_LABELS[lang] || CGM_LABELS.en;

  return (
    <div className="settings-page">
      <h2 className="settings-title">{t.title}</h2>

      {/* Appearance */}
      <div className="settings-section">
        <div className="settings-section-label">{t.appearance}</div>
        <div className="settings-row">
          <div className="settings-row-left">
            <div className="settings-icon">🌐</div>
            <div>
              <div className="settings-row-title">{t.language}</div>
              <div className="settings-row-desc">{t.languageDesc}</div>
            </div>
          </div>
          <select
            className="settings-lang-select"
            value={lang}
            onChange={(e) => setLang?.(e.target.value)}
            aria-label={t.language}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>
        </div>
        <div className="settings-row">
          <div className="settings-row-left">
            <div className="settings-icon">🌙</div>
            <div>
              <div className="settings-row-title">{t.darkMode}</div>
              <div className="settings-row-desc">{t.darkModeDesc}</div>
            </div>
          </div>
          <button className={`toggle-btn ${darkMode ? "on" : ""}`} onClick={onToggleDark}>
            <div className="toggle-thumb" />
          </button>
        </div>
      </div>

      {/* CGM Report */}
      <div className="settings-section">
        <div className="settings-section-label">{cl.section}</div>
        <input ref={cgmInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={e => e.target.files[0] && handleCgmFile(e.target.files[0])} />
        <div className={`upload-zone compact ${cgmFile ? "has-file" : ""}`} onClick={() => cgmInputRef.current?.click()}>
          {cgmFile ? (
            <>
              <span className="upload-icon">✅</span>
              <span className="upload-filename">{cgmFile.name}</span>
              {cgmStats && <span className="upload-hint">{cgmStats.total} ölçüm · {cgmStats.days} gün</span>}
            </>
          ) : (
            <>
              <span className="upload-icon">📊</span>
              <span className="upload-label">{cl.upload}</span>
              <span className="upload-hint">{cl.dragHint}</span>
            </>
          )}
        </div>
        {cgmParseError && <div className="alert error">{cgmParseError}</div>}
        {cgmStats && (
          <>
            <div className="cgm-mini-stats">
              <div className="cgm-stat"><span className="cgm-val">{cgmStats.mean}</span><span className="cgm-lbl">Ort.</span></div>
              <div className="cgm-stat"><span className="cgm-val text-green">{cgmStats.tir}%</span><span className="cgm-lbl">TIR</span></div>
              <div className="cgm-stat"><span className="cgm-val text-amber">{cgmStats.low}%</span><span className="cgm-lbl">Düşük</span></div>
              <div className="cgm-stat"><span className="cgm-val text-red">{cgmStats.high}%</span><span className="cgm-lbl">Yüksek</span></div>
            </div>
            <button className="btn-primary" onClick={generateCgmReport} disabled={cgmLoading}>
              {cgmLoading ? cl.generating : cl.generate}
            </button>
          </>
        )}
        {cgmError && <div className="alert error">{cgmError}</div>}
        {cgmReport && (
          <div className="cgm-report-box">
            <div className="cgm-report-header">
              <span>🩺 {cl.section}</span>
              <button className="btn-copy" onClick={() => navigator.clipboard.writeText(cgmReport)}>{cl.copy}</button>
            </div>
            <div className="cgm-report-text">
              {cgmReport.split("\n\n").filter(p => p.trim()).map((p, i) => <p key={i}>{p.trim()}</p>)}
            </div>
            <div className="report-disclaimer">{cl.disclaimer}</div>
          </div>
        )}
      </div>

      {/* Data */}
      <div className="settings-section">
        <div className="settings-section-label">{t.data}</div>
        <div className="settings-row clickable" onClick={handleExportPDF}>
          <div className="settings-row-left">
            <div className="settings-icon">📄</div>
            <div>
              <div className="settings-row-title">{t.exportPDF}</div>
              <div className="settings-row-desc">{t.exportDesc}</div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron-right"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div className="settings-row clickable danger" onClick={() => setDeleteConfirm(true)}>
          <div className="settings-row-left">
            <div className="settings-icon">🗑️</div>
            <div>
              <div className="settings-row-title">{t.deleteAll}</div>
              <div className="settings-row-desc">{t.deleteDesc}</div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron-right"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      {/* Subscription */}
      <div className="settings-section">
        <div className="settings-section-label">{t.subscription}</div>
        {isPremium ? (
          <div className="settings-row">
            <div className="settings-row-left">
              <div className="settings-icon">⭐</div>
              <div><div className="settings-row-title text-green">{t.alreadyPremium}</div></div>
            </div>
          </div>
        ) : (
          <div className="settings-row clickable premium-row" onClick={handleUpgrade}>
            <div className="settings-row-left">
              <div className="settings-icon">👑</div>
              <div>
                <div className="settings-row-title">{t.upgrade}</div>
                <div className="settings-row-desc">{t.upgradeDesc}</div>
              </div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron-right"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        )}
      </div>

      {/* Community */}
      <div className="settings-section">
        <div className="settings-section-label">{t.community}</div>
        <div className="settings-row clickable" onClick={() => window.open("https://apps.apple.com", "_blank")}>
          <div className="settings-row-left">
            <div className="settings-icon">⭐</div>
            <div>
              <div className="settings-row-title">{t.rateUs}</div>
              <div className="settings-row-desc">{t.rateDesc}</div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron-right"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div className="settings-row clickable" onClick={handleShare}>
          <div className="settings-row-left">
            <div className="settings-icon">🔗</div>
            <div>
              <div className="settings-row-title">{t.share}</div>
              <div className="settings-row-desc">{t.shareDesc}</div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron-right"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div className="settings-row clickable" onClick={() => setFeedbackOpen(o => !o)}>
          <div className="settings-row-left">
            <div className="settings-icon">💬</div>
            <div>
              <div className="settings-row-title">{t.feedback}</div>
              <div className="settings-row-desc">{t.feedbackDesc}</div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron-right"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        {feedbackOpen && (
          <div className="feedback-box">
            <textarea placeholder={t.feedbackPlaceholder} value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={4} />
            {feedbackSent ? (
              <div className="alert success">{t.sent}</div>
            ) : (
              <button className="btn-primary" onClick={handleFeedback} disabled={!feedbackText.trim()}>{t.send}</button>
            )}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(false)}>
          <div className="modal-card confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h3>{t.deleteConfirmMsg}</h3>
            <div className="confirm-btns">
              <button className="btn-danger" onClick={handleDeleteAll}>{t.deleteYes}</button>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(false)}>{t.deleteNo}</button>
            </div>
          </div>
        </div>
      )}

      {/* Articles */}
      <div className="settings-section">
        <div className="settings-row clickable" onClick={onOpenInfo}>
          <div className="settings-row-left">
            <div className="settings-icon">📚</div>
            <div>
              <div className="settings-row-title">{lang === "tr" ? "Sağlık Makaleleri" : lang === "de" ? "Gesundheitsartikel" : lang === "fr" ? "Articles santé" : lang === "it" ? "Articoli salute" : lang === "es" ? "Artículos salud" : "Health Articles"}</div>
              <div className="settings-row-desc">{lang === "tr" ? "Diyabet ve kan şekeri hakkında bilgiler" : "Learn about diabetes & blood sugar"}</div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron-right"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      {/* Sign Out */}
      <div className="settings-section">
        <button className="btn-signout" onClick={onSignOut}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          {lang === "tr" ? "Çıkış Yap" : lang === "de" ? "Abmelden" : lang === "fr" ? "Se déconnecter" : lang === "it" ? "Esci" : lang === "es" ? "Cerrar sesión" : "Sign Out"}
        </button>
        <div className="settings-version">Glikova v1.0.0</div>
      </div>
    </div>
  );
}
