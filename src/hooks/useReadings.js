import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { isWithin3Days } from "../lib/bloodSugar";

export function useReadings(session, isPremium) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("readings")
        .select("*")
        .eq("user_id", session.user.id)
        .order("recorded_at", { ascending: false });
      const all = data || [];
      const visible = isPremium ? all : all.filter(r => isWithin3Days(r.recorded_at));
      setReadings(visible);
      setShowPaywall(!isPremium && all.length > visible.length);
      setLoading(false);
    };
    fetch();
  }, [session, isPremium]);

  const addReading = useCallback(async (r) => {
    if (!session) return;
    const { data } = await supabase
      .from("readings")
      .insert([{ ...r, user_id: session.user.id }])
      .select()
      .single();
    if (data) setReadings(prev => [data, ...prev]);
  }, [session]);

  const deleteReading = useCallback(async (id) => {
    await supabase.from("readings").delete().eq("id", id);
    setReadings(prev => prev.filter(r => r.id !== id));
  }, []);

  return { readings, loading, showPaywall, addReading, deleteReading };
}
