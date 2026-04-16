import { useState } from "react";
import { ARTICLES } from "../lib/articles";

function ArticleCard({ article, lang, onOpen }) {
  const title = lang === "tr" ? article.titleTr : article.title;
  const category = lang === "tr" ? article.categoryTr : article.category;

  return (
    <div className="article-card" onClick={() => onOpen(article)}>
      <div className="article-img-wrap">
        <img src={article.image} alt={title} loading="lazy" />
        <span className="article-category">{category}</span>
      </div>
      <div className="article-body">
        <div className="article-date">{article.date}</div>
        <h3 className="article-title">{title}</h3>
        <div className="article-read-more">
          {lang === "tr" ? "Devamını oku →" : lang === "de" ? "Weiterlesen →" : lang === "fr" ? "Lire la suite →" : lang === "it" ? "Continua a leggere →" : lang === "es" ? "Leer más →" : "Read more →"}
        </div>
      </div>
    </div>
  );
}

function ArticleModal({ article, lang, onClose }) {
  if (!article) return null;
  const title = lang === "tr" ? article.titleTr : article.title;
  const summary = lang === "tr" ? article.summaryTr : article.summary;
  const readMore = { en: "Read Full Article", tr: "Tam Makaleyi Oku", de: "Vollständigen Artikel lesen", fr: "Lire l'article complet", it: "Leggi l'articolo completo", es: "Leer el artículo completo" };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card article-modal">
        <div className="modal-header">
          <button className="btn-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <img src={article.image} alt={title} className="article-modal-img" />
        <div className="article-modal-body">
          <div className="article-date">{article.date}</div>
          <h2 className="article-modal-title">{title}</h2>
          <div className="article-modal-text">
            {summary.split(". ").reduce((acc, sentence, i, arr) => {
              if (i % 3 === 0 && i > 0) acc.push(<br key={i} />);
              acc.push(sentence + (i < arr.length - 1 ? ". " : ""));
              return acc;
            }, [])}
          </div>
          <a href={article.source} target="_blank" rel="noopener noreferrer" className="btn-source">
            {readMore[lang] || readMore.en} — {article.sourceName} ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export default function InfoPage({ lang }) {
  const [selected, setSelected] = useState(null);
  const heading = { en: "Diabetes in 2026", tr: "2026'da Diyabet", de: "Diabetes 2026", fr: "Diabète en 2026", it: "Diabete nel 2026", es: "Diabetes en 2026" };
  const sub = { en: "Latest research, breakthroughs & lifestyle insights", tr: "En güncel araştırmalar, atılımlar ve yaşam tarzı önerileri", de: "Neueste Forschung & Lifestyle-Tipps", fr: "Dernières recherches & conseils de vie", it: "Ultime ricerche & stili di vita", es: "Últimas investigaciones & consejos de vida" };

  return (
    <div className="info-page">
      <div className="info-header">
        <h2>{heading[lang] || heading.en}</h2>
        <p>{sub[lang] || sub.en}</p>
      </div>
      <div className="articles-list">
        {ARTICLES.map(a => <ArticleCard key={a.id} article={a} lang={lang} onOpen={setSelected} />)}
      </div>
      {selected && <ArticleModal article={selected} lang={lang} onClose={() => setSelected(null)} />}
    </div>
  );
}
