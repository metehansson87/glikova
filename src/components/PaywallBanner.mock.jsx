export default function PaywallBanner({ t }) {
  const handleUpgrade = () => {
    if (typeof window.__mockSetPremium === "function") {
      window.__mockSetPremium(true);
    }
  };

  return (
    <div className="paywall-banner">
      <div className="paywall-icon">🔒</div>
      <div className="paywall-content">
        <h3>{t.unlockTitle}</h3>
        <p>{t.unlockDesc}</p>
        <ul className="paywall-features">
          <li>{t.feature1}</li>
          <li>{t.feature2}</li>
          <li>{t.feature3}</li>
          <li>{t.feature4}</li>
        </ul>
        <button className="btn-upgrade" onClick={handleUpgrade}>{t.simulateBtn}</button>
        <p className="paywall-note">{t.noPayment}</p>
      </div>
    </div>
  );
}
