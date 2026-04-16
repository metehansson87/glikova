import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useSubscription(session) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", session.user.id)
        .single();
      setIsPremium(data?.is_premium || false);
      setLoading(false);
    };
    fetch();
  }, [session]);

  return { isPremium, loading };
}
