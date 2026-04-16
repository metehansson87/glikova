import { useState } from "react";
import { purchasePremium, restorePurchases } from "../lib/revenuecat";
import { supabase } from "../lib/supabase";
import { Capacitor } from "@capacitor/core";

// ... COPY objesi aynı kalacak ...

export default function PremiumPage({ lang = "en", isPremium, session, onPremiumChange }) {
  const c = COPY[lang] || COPY.en;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePurchase = async () => {
    if (!Capacitor.isNativePlatform()) {
      setError(lang === "tr"
        ? "Satın alma sadece Android uygulamasında çalışır."
        : "Purchase only works in the Android app.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const premium = await purchasePremium();
      if (premium) {
        // Supabase'e yaz
        if (session) {
          await supabase
            .from("profiles")
            .update({ is_premium: true })
            .eq("id", session.user.id);
        }
        setSuccess(lang === "tr" ? "🎉 Premium aktif edildi!" : "🎉 Premium activated!");
        onPremiumChange && onPremiumChange(true);
      }
    } catch (e) {
      setError(lang === "tr"
        ? "Ödeme başarısız. Lütfen tekrar dene."
        : "Purchase failed. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!Capacitor.isNativePlatform()) {
      setError(lang === "tr"
        ? "Geri yükleme sadece Android uygulamasında çalışır."
        : "Restore only works in the Android app.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const premium = await restorePurchases();
      if (premium) {
        if (session) {
          await supabase
            .from("profiles")
            .update({ is_premium: true })
            .eq("id", session.user.id);
        }
        setSuccess(lang === "tr" ? "✅ Satın alma geri yüklendi!" : "✅ Purchase restored!");
        onPremiumChange && onPremiumChange(true);
      } else {
        setError(lang === "tr"
          ? "Aktif satın alma bulunamadı."
          : "No active purchase found.");
      }
    } catch (e) {
      setError(lang === "tr" ? "Geri yükleme başarısız." : "Restore failed.");
    } finally {
      setLoading(false);
    }
  };