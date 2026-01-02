
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../lib/api";
import MeditationCard from "../../components/MeditationCard";
import AddMeditationModal from "../../components/AddMeditationModal";
import { usePlayer } from "../../context/PlayerContext";

export default function MeditationsPage() {
  const router = useRouter();
  const {
    currentMeditation,
    setCurrentMeditation,
    isFavorite,
    toggleFavorite
  } = usePlayer();

  const [allMeditations, setAllMeditations] = useState([]);
  const [meditations, setMeditations] = useState([]);
  const [selected, setSelected] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadMeditations();
  }, []);

  const loadMeditations = async () => {
    const { data } = await api.get("/meditations");
    const list = data.meditations || [];
    setAllMeditations(list);
    setMeditations(list);

    // derive available tags
    const tagSet = new Set();
    list.forEach((m) => {
      (m.tags || []).forEach((t) => tagSet.add(t));
    });
    setAvailableTags(Array.from(tagSet));

    if (!selected && list.length > 0) {
      setSelected(list[0]);
    }
    if (!currentMeditation && list.length > 0) {
      setCurrentMeditation(list[0]);
    }
  };

  // client-side filtering
  useEffect(() => {
    let list = [...allMeditations];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((m) => {
        const tags = (m.tags || []).join(" ").toLowerCase();
        const coach = (m.coachName || "").toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          (m.description || "").toLowerCase().includes(q) ||
          tags.includes(q) ||
          coach.includes(q)
        );
      });
    }

    if (selectedTags.length > 0) {
      list = list.filter((m) => {
        const tags = m.tags || [];
        return tags.some((t) => selectedTags.includes(t));
      });
    }

    setMeditations(list);
  }, [searchTerm, selectedTags, allMeditations]);

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectMeditation = (m) => {
    setSelected(m);
    setCurrentMeditation(m);
  };

  const goToFavorites = () => {
    router.push("/profile/favorites");
  };

  const pageStyle = {
    maxWidth: 1200,
    margin: "0 auto",
    paddingBottom: "110px"
  };

  const layoutStyle = {
    display: "flex",
    gap: "2rem",
    alignItems: "flex-start"
  };

  const columnsHeight = "calc(100vh - 200px)";

  const leftColStyle = {
    flexBasis: "20%",
    minWidth: 220,
    maxWidth: 280,
    height: columnsHeight,
    overflowY: "auto",
    paddingRight: "0.5rem"
  };

  const middleColStyle = {
    flexGrow: 1,
    height: columnsHeight,
    overflowY: "auto",
    paddingRight: "0.5rem"
  };

  const rightColStyle = {
    flexBasis: "25%",
    minWidth: 280,
    maxWidth: 340,
    height: columnsHeight,
    overflowY: "auto",
    paddingLeft: "0.5rem"
  };

  return (
    <div className="animate-enter" style={pageStyle}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.3rem" }} className="text-gradient">Mindfulness Meditation Library</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
          Explore guided sessions for sleep, focus, and emotional balance. Pick a
          meditation and drop into a calmer state of mind.
        </p>
      </header>

      <div style={layoutStyle}>
        {/* LEFT COLUMN */}
        <section style={leftColStyle} className="scroll-column">
          <h2 style={{ fontSize: "1.1rem", marginTop: 0, marginBottom: "0.75rem", color: "var(--text-main)" }}>
            Your Library
          </h2>

          <button
            type="button"
            className="glass-card"
            onClick={goToFavorites}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "1rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              border: "1px solid var(--border-color)",
              transition: "border-color 0.2s"
            }}
          >
            <span style={{ fontWeight: 500, color: "var(--text-main)" }}>Your Favourites</span>
            <span style={{ opacity: 0.8, fontSize: "0.9rem", color: "var(--text-muted)" }}>➜</span>
          </button>

          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Soon this section can show your recently played sessions and
            personalized collections.
          </p>
        </section>

        {/* MIDDLE COLUMN */}
        <section style={middleColStyle} className="scroll-column">
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              paddingBottom: "1rem",
            }}
          >
            {/* Search */}
            <div
              className="glass-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 1rem",
                borderRadius: 999,
                backgroundColor: "rgba(2, 6, 23, 0.8)",
                backdropFilter: "blur(12px)"
              }}
            >
              <span style={{ fontSize: "1rem", opacity: 0.6 }}>🔍</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, coach, or tag"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "var(--text-main)",
                  fontSize: "0.95rem",
                  padding: 0,
                  boxShadow: "none"
                }}
              />
              <button
                type="button"
                className="chip"
                onClick={() => setFiltersOpen((open) => !open)}
                style={{
                  padding: "0.3rem 0.8rem",
                  cursor: "pointer",
                  backgroundColor: filtersOpen ? "var(--primary-glow)" : "transparent"
                }}
              >
                Filters
              </button>
            </div>

            {/* Tag filters */}
            {filtersOpen && availableTags.length > 0 && (
              <div
                className="glass-card"
                style={{
                  marginTop: "0.75rem",
                  padding: "1rem",
                  backgroundColor: "rgba(15, 23, 42, 0.95)"
                }}
              >
                <p
                  style={{
                    margin: 0,
                    marginBottom: "0.75rem",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)"
                  }}
                >
                  Filter by emotion or focus tags:
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem"
                  }}
                >
                  {availableTags.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className="chip"
                        style={{
                          borderColor: active
                            ? "var(--accent)"
                            : "var(--border-color)",
                          backgroundColor: active ? "rgba(16, 185, 129, 0.15)" : "transparent",
                          color: active ? "var(--accent)" : "var(--text-muted)",
                          fontSize: "0.8rem"
                        }}
                      >
                        {tag.replace(/-/g, " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Recommended placeholder */}
          <section style={{ marginBottom: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1rem",
                marginBottom: "0.5rem",
                color: "var(--text-main)"
              }}
            >
              Recommended from Vibrance
            </h2>
            <div
              className="glass-card"
              style={{
                padding: "1rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                borderStyle: "dashed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 80
              }}
            >
              AI-powered recommendations will appear here in a future update.
            </div>
          </section>

          {/* Library list */}
          <section style={{ paddingBottom: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                marginBottom: "0.75rem",
                color: "var(--text-main)"
              }}
            >
              Meditation Library
            </h2>

            {meditations.map((m) => (
              <div key={m._id} style={{ marginBottom: "0.75rem" }}>
                <MeditationCard
                  meditation={m}
                  onSelect={() => handleSelectMeditation(m)}
                  onFavorite={toggleFavorite}
                  isFavorite={isFavorite(m._id)}
                />
              </div>
            ))}

            {meditations.length === 0 && (
              <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", margin: 0 }}>
                  No meditations match your search. Try clearing filters.
                </p>
              </div>
            )}
          </section>
        </section>

        {/* RIGHT COLUMN – Details */}
        <section style={rightColStyle} className="scroll-column">
          {selected ? (
            <div className="glass-card" style={{ padding: "1.5rem", height: "fit-content" }}>
              {selected.imageUrl && (
                <div
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    marginBottom: "1rem"
                  }}
                >
                  <img
                    src={selected.imageUrl}
                    alt={selected.title}
                    style={{
                      width: "100%",
                      display: "block",
                      objectFit: "cover",
                      aspectRatio: "16/9"
                    }}
                  />
                </div>
              )}

              <h2
                style={{
                  fontSize: "1.25rem",
                  marginTop: 0,
                  marginBottom: "0.25rem",
                  lineHeight: 1.3
                }}
              >
                {selected.title}
              </h2>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--text-muted)",
                  marginTop: 0
                }}
              >
                {selected.coachName || "Vibrance Team"} ·{" "}
                <span style={{ color: "var(--primary-light)" }}>{selected.durationMinutes} min</span>
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.4rem",
                  marginTop: "0.75rem",
                  marginBottom: "1.25rem"
                }}
              >
                {(selected.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="chip"
                    style={{
                      padding: "0.2rem 0.6rem",
                      fontSize: "0.7rem",
                      color: "var(--text-muted)"
                    }}
                  >
                    {tag.replace(/-/g, " ")}
                  </span>
                ))}
              </div>

              <div style={{ height: 1, background: "var(--border-color)", margin: "1rem 0" }} />

              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "0.5rem"
                }}
              >
                About this session
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  color: "var(--text-muted)"
                }}
              >
                {selected.description}
              </p>

              <h3
                style={{
                  fontSize: "1rem",
                  marginTop: "1.5rem",
                  marginBottom: "0.5rem"
                }}
              >
                About the mindfulness coach
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  color: "var(--text-muted)"
                }}
              >
                {selected.coachName || "Vibrance Team"} creates short,
                science-informed meditations designed to help you build a
                consistent, gentle practice for focus, sleep, and emotional
                balance.
              </p>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                Select a meditation from the library to see details here.
              </p>
            </div>
          )}
        </section>
      </div>


      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: "fixed",
          top: "2rem",
          right: "2rem",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "var(--accent)",
          color: "white",
          border: "none",
          boxShadow: "0 4px 14px rgba(0,0,0,0.3), 0 0 20px rgba(var(--accent-rgb), 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          cursor: "pointer",
          zIndex: 40,
          transition: "transform 0.2s"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Add Meditation"
      >
        +
      </button>

      {
        showAddModal && (
          <AddMeditationModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              loadMeditations();
            }}
          />
        )
      }
    </div >
  );
}
