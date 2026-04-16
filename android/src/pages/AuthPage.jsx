import { useState } from "react";

const COPY = {
  tr: {
    headline: "Kan şekerini takip et.", sub: "Daha iyi yaşa.",
    desc: "Akıllı glikoz izleme, senin için tasarlandı.",
    getStarted: "Başla — Ücretsiz",
    haveAccount: "Zaten hesabım var",
    signIn: "Giriş Yap",
    createAccount: "Hesap Oluştur",
    orWith: "veya",
    continueGoogle: "Google ile devam et",
    name: "Ad Soyad", email: "E-posta", password: "Şifre",
    forgotPass: "Şifremi unuttum",
    noAccount: "Hesabın yok mu?", signUp: "Kayıt ol",
    yesAccount: "Zaten hesabın var mı?",
    terms: "Devam ederek Gizlilik Politikası ve Kullanım Koşulları'nı kabul etmiş olursunuz.",
    feat1: "✦ Ücretsiz başla", feat2: "✦ CGM raporu", feat3: "✦ 6 dil",
  },
  en: {
    headline: "Track your glucose.", sub: "Live better.",
    desc: "Smart blood sugar monitoring designed for your life.",
    getStarted: "Get Started — It's Free",
    haveAccount: "I already have an account",
    signIn: "Sign In",
    createAccount: "Create Account",
    orWith: "or",
    continueGoogle: "Continue with Google",
    name: "Full Name", email: "Email", password: "Password",
    forgotPass: "Forgot password?",
    noAccount: "Don't have an account?", signUp: "Sign up",
    yesAccount: "Already have an account?",
    terms: "By continuing you agree to our Privacy Policy and Terms of Service.",
    feat1: "✦ Free to start", feat2: "✦ CGM report", feat3: "✦ 6 languages",
  },
  de: {
    headline: "Glukose tracken.", sub: "Besser leben.",
    desc: "Intelligentes Blutzucker-Monitoring für dein Leben.",
    getStarted: "Jetzt starten — Kostenlos",
    haveAccount: "Ich habe bereits ein Konto",
    signIn: "Anmelden", createAccount: "Konto erstellen", orWith: "oder",
    continueGoogle: "Mit Google fortfahren",
    name: "Vollständiger Name", email: "E-Mail", password: "Passwort",
    forgotPass: "Passwort vergessen?", noAccount: "Kein Konto?", signUp: "Registrieren",
    yesAccount: "Bereits ein Konto?", terms: "Mit der Nutzung stimmen Sie unseren Datenschutzrichtlinien zu.",
    feat1: "✦ Kostenlos starten", feat2: "✦ CGM-Bericht", feat3: "✦ 6 Sprachen",
  },
  fr: {
    headline: "Suivez votre glycémie.", sub: "Vivez mieux.",
    desc: "Surveillance intelligente de la glycémie pour votre vie.",
    getStarted: "Commencer — Gratuit",
    haveAccount: "J'ai déjà un compte",
    signIn: "Se connecter", createAccount: "Créer un compte", orWith: "ou",
    continueGoogle: "Continuer avec Google",
    name: "Nom complet", email: "E-mail", password: "Mot de passe",
    forgotPass: "Mot de passe oublié?", noAccount: "Pas de compte?", signUp: "S'inscrire",
    yesAccount: "Déjà un compte?", terms: "En continuant, vous acceptez notre politique de confidentialité.",
    feat1: "✦ Gratuit", feat2: "✦ Rapport CGM", feat3: "✦ 6 langues",
  },
  it: {
    headline: "Monitora il glucosio.", sub: "Vivi meglio.",
    desc: "Monitoraggio intelligente della glicemia per la tua vita.",
    getStarted: "Inizia — Gratis",
    haveAccount: "Ho già un account",
    signIn: "Accedi", createAccount: "Crea account", orWith: "o",
    continueGoogle: "Continua con Google",
    name: "Nome completo", email: "Email", password: "Password",
    forgotPass: "Password dimenticata?", noAccount: "Non hai un account?", signUp: "Registrati",
    yesAccount: "Hai già un account?", terms: "Continuando accetti la nostra Informativa sulla privacy.",
    feat1: "✦ Gratuito", feat2: "✦ Report CGM", feat3: "✦ 6 lingue",
  },
  es: {
    headline: "Controla tu glucosa.", sub: "Vive mejor.",
    desc: "Monitoreo inteligente del azúcar en sangre para tu vida.",
    getStarted: "Empezar — Gratis",
    haveAccount: "Ya tengo una cuenta",
    signIn: "Iniciar sesión", createAccount: "Crear cuenta", orWith: "o",
    continueGoogle: "Continuar con Google",
    name: "Nombre completo", email: "Correo electrónico", password: "Contraseña",
    forgotPass: "¿Olvidaste tu contraseña?", noAccount: "¿No tienes cuenta?", signUp: "Regístrate",
    yesAccount: "¿Ya tienes cuenta?", terms: "Al continuar aceptas nuestra Política de privacidad.",
    feat1: "✦ Gratis", feat2: "✦ Informe CGM", feat3: "✦ 6 idiomas",
  },
};

export default function AuthPage({ onAuth, lang = "en" }) {
  const c = COPY[lang] || COPY.en;
  const [mode, setMode] = useState("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onAuth && onAuth({ email, name }); }, 900);
  };

  const handleGoogle = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onAuth && onAuth({ email: "user@gmail.com", name: "Google User" }); }, 800);
  };

  return (
    <div className="auth-shell">
      <div className="auth-glow" />

      {/* Logo */}
      <div className="auth-logo">
        <svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-logo-pulse">
          <defs>
            <linearGradient id="alg-wave" x1="0" y1="0" x2="96" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fca5a5" stopOpacity="0"/>
              <stop offset="0.2" stopColor="#f87171"/>
              <stop offset="0.8" stopColor="#ef4444"/>
              <stop offset="1" stopColor="#ef4444" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="alg-dot" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#fca5a5"/><stop offset="1" stopColor="#dc2626"/>
            </linearGradient>
            <filter id="auth-glow-f">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <path className="auth-wave-path" d="M4 32 H22 L28 14 L36 50 L42 24 L48 38 L54 32 H92"
            stroke="url(#alg-wave)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <circle cx="48" cy="32" r="12" fill="url(#alg-dot)" filter="url(#auth-glow-f)" className="auth-dot-anim"/>
          <text x="48" y="37" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily="'Outfit',sans-serif">G</text>
        </svg>
        <span>Glikova</span>
      </div>

      {mode === "landing" && (
        <div className="auth-landing">
          <h1 className="auth-headline">{c.headline}<br/><span className="text-red">{c.sub}</span></h1>
          <p className="auth-sub">{c.desc}</p>
          <div className="auth-features">
            <span className="auth-feat">{c.feat1}</span>
            <span className="auth-feat">{c.feat2}</span>
            <span className="auth-feat">{c.feat3}</span>
          </div>
          <div className="auth-actions">
            <button className="btn-primary" onClick={() => setMode("signup")}>{c.getStarted}</button>
            <button className="btn-ghost" onClick={() => setMode("login")}>{c.haveAccount}</button>
          </div>
        </div>
      )}

      {mode === "signup" && (
        <div className="auth-card">
          <div className="auth-card-title">{c.createAccount}</div>
          {/* Google button */}
          <div className="social-btns">
            <button className="social-btn google" onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              {c.continueGoogle}
            </button>
          </div>
          <div className="auth-divider"><span>{c.orWith}</span></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input type="text" placeholder={c.name} value={name} onChange={e => setName(e.target.value)} required/>
            <input type="email" placeholder={c.email} value={email} onChange={e => setEmail(e.target.value)} required/>
            <input type="password" placeholder={c.password} value={password} onChange={e => setPassword(e.target.value)} required/>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? "..." : c.createAccount}</button>
          </form>
          <p className="auth-switch">{c.yesAccount} <button onClick={() => setMode("login")}>{c.signIn}</button></p>
          <p className="auth-terms">{c.terms}</p>
        </div>
      )}

      {mode === "login" && (
        <div className="auth-card">
          <div className="auth-card-title">{c.signIn}</div>
          <div className="social-btns">
            <button className="social-btn google" onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              {c.continueGoogle}
            </button>
          </div>
          <div className="auth-divider"><span>{c.orWith}</span></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input type="email" placeholder={c.email} value={email} onChange={e => setEmail(e.target.value)} required/>
            <input type="password" placeholder={c.password} value={password} onChange={e => setPassword(e.target.value)} required/>
            <button type="button" className="auth-forgot" onClick={() => {}}>{c.forgotPass}</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? "..." : c.signIn}</button>
          </form>
          <p className="auth-switch">{c.noAccount} <button onClick={() => setMode("signup")}>{c.signUp}</button></p>
        </div>
      )}
    </div>
  );
}
