import { useState, useCallback } from "react";
import { mockStore } from "../lib/mock";
import { isWithin3Days } from "../lib/bloodSugar";

export function useReadings(_session, isPremium) {
  const buildState = useCallback(() => {
    const all = mockStore.getReadings();
    const oldest = all[all.length - 1];
    const isOld = oldest ? !isWithin3Days(oldest.recorded_at) : false;
    const show = isOld && !isPremium;
    return {
      readings: show ? all.filter(r => isWithin3Days(r.recorded_at)) : all,
      allReadings: all,
      showPaywall: show,
      loading: false,
      firstEntryDate: oldest?.recorded_at ?? null,
    };
  }, [isPremium]);

  const [state, setState] = useState(buildState);

  const refresh = useCallback(() => setState(buildState()), [buildState]);

  const addReading = async (reading) => {
    const item = mockStore.addReading(reading);
    setState(buildState());
    return item;
  };

  const deleteReading = async (id) => {
    mockStore.deleteReading(id);
    setState(buildState());
  };

  return { ...state, addReading, deleteReading, refetch: refresh };
}
