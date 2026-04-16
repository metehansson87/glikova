import { useState } from "react";
import { mockStore } from "../lib/mock";

export function useSubscription(_session) {
  const [isPremium, setIsPremium] = useState(mockStore.isPremium());

  // Expose a toggle so DevToolbar can flip premium status
  if (typeof window !== "undefined") {
    window.__mockSetPremium = (val) => {
      mockStore.setPremium(val);
      setIsPremium(val);
    };
  }

  return { isPremium, loading: false };
}
