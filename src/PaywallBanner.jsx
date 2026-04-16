import { useState } from "react";
import { purchasePremium } from "../lib/revenuecat";
import { supabase } from "../lib/supabase";
import { Capacitor } from "@capacitor/core";

export default function PaywallBanner({ session, t }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    if (!Capacitor.isNativePlatform()) {
      setError("Satın alma sadece Android uygulamasında çalışır.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const premium = await purchasePremium();
      if (premium && session) {
        await supabase
          .from("profiles")
          .update({ is_premium: true })
          .eq("id", session.user.id);
        window.location.reload();
      }
    } catch (e) {
      setError("Ödeme başarısız. Lütfen tekrar dene.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paywall-banner">
      <div className="paywall-icon">🔒</div>
      <div className="paywall-content">
        <h3>{t?.paywallTitle || "Premium'a Geç"}</h3>
        <p>{t?.paywallDesc || "3 günden eski verilere erişmek için Premium'a geç."}</p>
        <ul className="paywall-features">
          <li>✓ Sınırsız geçmiş</li>
          <li>✓ AI analiz raporu</li>
          <li>✓ PDF export</li>
          <li>✓ Öncelikli destek</li>
        </ul>
        {error && (
          <div style={{ color: "#ef4444", fontSize: "13px", margin: "8px 0" }}>{error}</div>
        )}
        <button className="btn-upgrade" onClick={handleUpgrade} disabled={loading}>
          {loading ? "⏳ İşleniyor..." : "₺75 — Tek Seferlik Premium"}
        </button>
        <p className="paywall-note">Tek seferlik ödeme • Google Play güvencesi</p>
      </div>
    </div>
  );
}
