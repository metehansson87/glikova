import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { isWithin3Days } from "../lib/bloodSugar";

export function useReadings(session, isPremium) {
  const [readings, setReadings] = useState([]);
  const [allReadings, setAllReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstEntryDate, setFirstEntryDate] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const fetchReadings = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blood_sugar_readings")
        .select("*")
        .eq("user_id", session.user.id)
        .order("recorded_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const oldest = data[data.length - 1];
        setFirstEntryDate(oldest.recorded_at);
        const isOld = !isWithin3Days(oldest.recorded_at);
        if (isOld && !isPremium) {
          setShowPaywall(true);
          setReadings(data.filter(r => isWithin3Days(r.recorded_at)));
        } else {
          setShowPaywall(false);
          setReadings(data);
        }
        setAllReadings(data);
      } else {
        setReadings([]);
        setAllReadings([]);
        setShowPaywall(false);
      }
    } catch (err) {
      console.error("Error fetching readings:", err);
    } finally {
      setLoading(false);
    }
  }, [session, isPremium]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const addReading = async (reading) => {
    const { data, error } = await supabase
      .from("blood_sugar_readings")
      .insert([{ ...reading, user_id: session.user.id }])
      .select()
      .single();
    if (error) throw error;
    await fetchReadings();
    return data;
  };

  const deleteReading = async (id) => {
    const { error } = await supabase
      .from("blood_sugar_readings")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);
    if (error) throw error;
    await fetchReadings();
  };

  return { readings, allReadings, loading, firstEntryDate, showPaywall, addReading, deleteReading, refetch: fetchReadings };
}
