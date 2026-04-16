const COPY = {
  tr: {
    title: "Premium'a Geç",
    subtitle: "Bir kez öde, sonsuza kadar kullan",
    price: "₺75",
    period: "tek seferlik ödeme",
    features: [
      { icon: "📊", title: "Sınırsız Geçmiş", desc: "Tüm kan şekeri geçmişine eriş" },
      { icon: "🤖", title: "AI CGM Raporu", desc: "Yapay zeka ile detaylı analiz" },
      { icon: "📄", title: "PDF Export", desc: "Doktorunla paylaş" },
      { icon: "🔔", title: "Akıllı Hatırlatıcı", desc: "Ölçüm zamanı bildirimleri" },
      { icon: "🌍", title: "6 Dil Desteği", desc: "Tüm dillerde tam destek" },
      { icon: "⭐", title: "Öncelikli Destek", desc: "Hızlı müşteri desteği" },
    ],
    cta: "Google Play ile ₺75 Öde",
    ctaSub: "Güvenli ödeme — Google Play tarafından işlenir",
    restore: "Satın almayı geri yükle",
    alreadyPremium: "✓ Premium Üyesiniz",
    premiumDesc: "Tüm özelliklere erişiminiz var.",
    freeLabel: "Ücretsiz",
    premiumLabel: "Premium",
  },
  en: {
    title: "Go Premium",
    subtitle: "Pay once, use forever",
    price: "₺75",
    period: "one-time payment",
    features: [
      { icon: "📊", title: "Unlimited History", desc: "Access all your glucose data" },
      { icon: "🤖", title: "AI CGM Report", desc: "Detailed AI-powered analysis" },
      { icon: "📄", title: "PDF Export", desc: "Share with your doctor" },
      { icon: "🔔", title: "Smart Reminders", desc: "Never miss a measurement" },
      { icon: "🌍", title: "6 Languages", desc: "Full multilingual support" },
      { icon: "⭐", title: "Priority Support", desc: "Fast customer service" },
    ],
    cta: "Pay ₺75 via Google Play",
    ctaSub: "Secure payment — processed by Google Play",
    restore: "Restore purchase",
    alreadyPremium: "✓ You're a Premium Member",
    premiumDesc: "You have access to all features.",
    freeLabel: "Free",
    premiumLabel: "Premium",
  },
};

export default function PremiumPage({ lang = "en", isPremium }) {
  const c = COPY[lang] || COPY.en;

  const handlePurchase = () => {
    // Google Play In-App Purchase trigger
    // In production: window.glikova?.launchBillingFlow?.() or Android WebView bridge
    if (window.Android?.launchPremiumPurchase) {
      window.Android.launchPremiumPurchase("glikova_premium_75");
    } else {
      alert("Google Play ödeme sistemi yakında aktif olacak!\n\nTest modunda: Premium aktif edildi.");
      window.__mockSetPremium && window.__mockSetPremium(true);
      window.location.reload();
    }
  };

  const handleRestore = () => {
    if (window.Android?.restorePurchases) {
      window.Android.restorePurchases();
    } else {
      alert("Satın alma geri yükleme Google Play üzerinden yapılır.");
    }
  };

  if (isPremium) return (
    <div className="premium-page">
      <div className="premium-active-card">
        <div className="premium-active-icon">👑</div>
        <div className="premium-active-title">{c.alreadyPremium}</div>
        <div className="premium-active-desc">{c.premiumDesc}</div>
        <div className="premium-features-grid">
          {c.features.map((f, i) => (
            <div key={i} className="premium-feat-item premium-feat-unlocked">
              <span className="pf-icon">{f.icon}</span>
              <div><div className="pf-title">{f.title}</div><div className="pf-desc">{f.desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="premium-page">
      {/* Header */}
      <div className="premium-header">
        <div className="premium-crown">👑</div>
        <h1 className="premium-title">{c.title}</h1>
        <p className="premium-subtitle">{c.subtitle}</p>
      </div>

      {/* Price card */}
      <div className="premium-price-card">
        <div className="premium-compare">
          <div className="compare-col">
            <div className="compare-label">{c.freeLabel}</div>
            <div className="compare-val muted">3 gün</div>
            <div className="compare-val muted">—</div>
            <div className="compare-val muted">—</div>
          </div>
          <div className="compare-divider"/>
          <div className="compare-col premium-col">
            <div className="compare-label gold">{c.premiumLabel} 👑</div>
            <div className="compare-val">∞ Sınırsız</div>
            <div className="compare-val">✓ AI Rapor</div>
            <div className="compare-val">✓ PDF Export</div>
          </div>
        </div>
        <div className="premium-price-row">
          <span className="premium-price">{c.price}</span>
          <span className="premium-period">{c.period}</span>
        </div>
      </div>

      {/* Features */}
      <div className="premium-features-grid">
        {c.features.map((f, i) => (
          <div key={i} className="premium-feat-item">
            <span className="pf-icon">{f.icon}</span>
            <div><div className="pf-title">{f.title}</div><div className="pf-desc">{f.desc}</div></div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="premium-cta-section">
        <button className="btn-premium-cta" onClick={handlePurchase}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          {c.cta}
        </button>
        <p className="premium-cta-sub">{c.ctaSub}</p>
        <button className="premium-restore-btn" onClick={handleRestore}>{c.restore}</button>
      </div>
    </div>
  );
}
