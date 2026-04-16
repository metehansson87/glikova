import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function PaywallBanner({ session }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      // Call your backend/edge function to create a Stripe Checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          user_id: session.user.id,
          email: session.user.email,
          success_url: `${window.location.origin}?upgraded=true`,
          cancel_url: window.location.origin,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch (err) {
      setError("Could not start checkout. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paywall-banner">
      <div className="paywall-icon">🔒</div>
      <div className="paywall-content">
        <h3>Unlock Full History</h3>
        <p>You've been tracking for more than 3 days. Upgrade to Premium to access your complete history, advanced insights, and unlimited data retention.</p>
        <ul className="paywall-features">
          <li>✓ Full tracking history</li>
          <li>✓ Advanced trend analysis</li>
          <li>✓ Data export (CSV)</li>
          <li>✓ Priority support</li>
        </ul>
        {error && <div className="alert error">{error}</div>}
        <button className="btn-upgrade" onClick={handleUpgrade} disabled={loading}>
          {loading ? "Redirecting…" : "Upgrade to Premium — $4.99/mo"}
        </button>
        <p className="paywall-note">Cancel anytime. Secure payment via Stripe.</p>
      </div>
    </div>
  );
}
