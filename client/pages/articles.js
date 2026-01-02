import { useEffect, useState } from "react";
import api from "../lib/api";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/articles");
      setArticles(data.articles || []);
      if (data.articles && data.articles.length > 0) {
        setSelected(data.articles[0]);
      }
    };
    load();
  }, []);

  const handleSelect = (article) => {
    setSelected(article);
  };

  const pageStyle = {
    maxWidth: 1100,
    margin: "0 auto",
    paddingTop: "1rem"
  };

  const columnsWrapper = {
    display: "flex",
    gap: "2rem",
    alignItems: "flex-start"
  };

  const leftColStyle = {
    flexBasis: "35%",
    maxWidth: 380,
    display: "flex",
    flexDirection: "column"
  };

  const rightColStyle = {
    flex: 1,
    minWidth: 0
  };

  const listStyle = {
    marginTop: "0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    maxHeight: "calc(100vh - 190px)",
    overflowY: "auto",
    paddingRight: "0.25rem"
  };

  const articleCardBase = {
    position: "relative",
    borderRadius: 8, // small radius: rectangle with soft corners
    border: "1px solid #1f2937",
    padding: "0.9rem 1rem",
    textAlign: "left",
    cursor: "pointer",
    overflow: "hidden",
    color: "#e5e7eb",
    minHeight: 120 // taller than before, but not pill-shaped
  };

  return (
    <div style={pageStyle}>
      {/* FULL-WIDTH HEADER */}
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginBottom: "0.3rem" }}>News &amp; Articles</h1>
        <p style={{ opacity: 0.8, marginTop: 0 }}>
          Curated from real authors using AI sentiment &amp; emotion analysis.
          Tap an item on the left to read it in full.
        </p>
      </header>

      <div style={columnsWrapper}>
        {/* LEFT COLUMN: list */}
        <section style={leftColStyle}>
          <div style={listStyle} className="scroll-column">
            {articles.map((a) => {
              const isActive = selected && selected._id === a._id;

              const hasImage = Boolean(a.imageUrl);
              const bgStyle = hasImage
                ? {
                  backgroundImage: `linear-gradient(to right, rgba(15,23,42,0.85), rgba(15,23,42,0.5)), url(${a.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }
                : {
                  background:
                    "linear-gradient(to right, #020617, #111827)"
                };

              return (
                <button
                  key={a._id}
                  type="button"
                  onClick={() => handleSelect(a)}
                  style={{
                    ...articleCardBase,
                    ...bgStyle,
                    borderColor: isActive ? "#f97316" : "#1f2937",
                    outline: "none"
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.15rem"
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "0.95rem",
                        lineHeight: 1.3,
                        wordWrap: "break-word"
                      }}
                    >
                      {a.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.8rem",
                        opacity: 0.9,
                        lineHeight: 1.3,
                        wordWrap: "break-word"
                      }}
                    >
                      {a.author && <>{a.author} · </>}
                      {a.source && <>{a.source}</>}
                      {a.publishedAt && (
                        <>
                          {" "}
                          ·{" "}
                          {new Date(a.publishedAt).toLocaleDateString()}
                        </>
                      )}
                    </p>
                    {/* Summary removed as requested */}
                  </div>
                </button>
              );
            })}

            {articles.length === 0 && (
              <p>No curated articles yet. Run the RSS AI curator script.</p>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: detail */}
        <section style={rightColStyle}>
          {selected ? (
            <div style={{ textAlign: "center" }}>
              {selected.imageUrl && (
                <div style={{ marginBottom: "1rem" }}>
                  <img
                    src={selected.imageUrl}
                    alt={selected.title}
                    style={{
                      width: "100%",
                      maxWidth: 640,
                      borderRadius: 12,
                      maxHeight: 320,
                      objectFit: "cover",
                      border: "1px solid #1f2937",
                      margin: "0 auto",
                      display: "block"
                    }}
                  />
                </div>
              )}

              <h2 style={{ marginTop: 0 }}>{selected.title}</h2>
              <p style={{ opacity: 0.8, marginTop: 0 }}>
                {selected.author && <>By {selected.author} · </>}
                {selected.source && <>{selected.source} · </>}
                {selected.publishedAt &&
                  new Date(selected.publishedAt).toLocaleDateString()}
              </p>

              {/* Full content (HTML) or fallback summary; body kept left-aligned for readability */}
              {selected.contentHtml ? (
                <div
                  style={{
                    marginTop: "1rem",
                    lineHeight: 1.6,
                    fontSize: "0.95rem",
                    textAlign: "left",
                    maxWidth: 700,
                    marginInline: "auto"
                  }}
                  dangerouslySetInnerHTML={{
                    __html: selected.contentHtml
                  }}
                />
              ) : selected.summary ? (
                <p
                  style={{
                    marginTop: "1rem",
                    lineHeight: 1.6,
                    fontSize: "0.95rem",
                    textAlign: "left",
                    maxWidth: 700,
                    marginInline: "auto"
                  }}
                >
                  {selected.summary}
                </p>
              ) : (
                <p style={{ marginTop: "1rem", opacity: 0.8 }}>
                  No preview text available for this article.
                </p>
              )}

              {selected.url && (
                <p style={{ marginTop: "1.5rem" }}>
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    Open original article on{" "}
                    {selected.source || "the source site"} →
                  </a>
                </p>
              )}
            </div>
          ) : (
            <p>Select an article from the left to read it.</p>
          )}
        </section>
      </div>
    </div>
  );
}
