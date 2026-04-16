import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { initRevenueCat, checkPremiumStatus } from "../lib/revenuecat";
import { Capacitor } from "@capacitor/core";

export function useSubscription(session) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { setLoading(false); return; }

    const check = async () => {
      setLoading(true);
      try {
        if (Capacitor.isNativePlatform()) {
          // Native: RevenueCat'ten kontrol et
          await initRevenueCat(session.user.id);
          const premium = await checkPremiumStatus();
          setIsPremium(premium);

          // Supabase'e de sync et
          if (premium) {
            await supabase
              .from("profiles")
              .update({ is_premium: true })
              .eq("id", session.user.id);
          }
        } else {
          // Web: Supabase'den kontrol et
          const { data } = await supabase
            .from("profiles")
            .select("is_premium")
            .eq("id", session.user.id)
            .single();
          setIsPremium(data?.is_premium || false);
        }
      } catch (e) {
        console.error("Subscription check error:", e);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [session]);

  return { isPremium, setIsPremium, loading };
}
