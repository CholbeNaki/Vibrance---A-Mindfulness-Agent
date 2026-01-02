
import { useEffect, useState } from "react";
import api from "../lib/api";

function renderStars(value) {
  const v = Number(value) || 0;
  const max = 5;
  let out = "";
  for (let i = 1; i <= max; i++) {
    out += i <= v ? "★" : "☆";
  }
  return out;
}

// Base emotion tags (always shown in picker)
const EMOTION_TAGS = [
  // Emotion / state
  "anxiety",
  "stress",
  "overwhelm",
  "low-mood",
  "irritability",
  "loneliness",
  "calm",
  "grounded",
  "hopeful",
  "grateful",
  "confident",
  "energized",
  // Challenges
  "sleep-issues",
  "focus-trouble",
  "burnout",
  "self-criticism",
  "negative-thoughts",
  "social-anxiety",
  "procrastination",
  "perfectionism",
  "anger-management",
  "motivation",
  "habits-and-routines",
  "work-stress",
  "study-stress",
  // Growth / goals
  "self-compassion",
  "mindfulness",
  "emotional-awareness",
  "resilience",
  "acceptance",
  "relationships",
  "productivity",
  "purpose-and-meaning"
];

export default function JournalPage() {
  // form state
  const [mood, setMood] = useState(3);
  const [emotionLabel, setEmotionLabel] = useState("");
  const [title, setTitle] = useState("");
  const [entryText, setEntryText] = useState("");

  // data state
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [mode, setMode] = useState("new"); // "new" or "view"

  // emotion tags (base list + any extra from profile)
  const [availableLabels, setAvailableLabels] = useState(EMOTION_TAGS);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // 1) optionally enrich tags with user focus tags
        try {
          const meRes = await api.get("/auth/me");
          const focusTags = meRes.data.focusTags || [];
          const merged = Array.from(
            new Set([...EMOTION_TAGS, ...focusTags])
          );
          setAvailableLabels(merged);
        } catch (err) {
          console.error("Failed to load focus tags", err);
        }

        // 2) get journal entries
        const res = await api.get("/journal");
        const list = res.data.entries || res.data || [];
        setEntries(list);
        if (list.length > 0) {
          setSelectedEntry(list[0]);
          setMode("view");
        }
      } catch (err) {
        console.error("Failed to load journal entries", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setMood(3);
    setEmotionLabel("");
    setTitle("");
    setEntryText("");
  };

  const openNewEntry = () => {
    resetForm();
    setMode("new");
    setSelectedEntry(null);
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setMode("view");
  };

  const reloadEntries = async () => {
    const res = await api.get("/journal");
    const list = res.data.entries || res.data || [];
    setEntries(list);
    if (list.length > 0) {
      setSelectedEntry(list[0]);
      setMode("view");
    } else {
      setSelectedEntry(null);
      setMode("new");
    }
  };

  const saveEntry = async () => {
    const numericMood = Math.min(5, Math.max(1, Number(mood) || 1));

    const payload = {
      mood: numericMood,
      emotionLabel,
      title,
      text: entryText
    };

    setSaving(true);
    try {
      await api.post("/journal", payload);
      await reloadEntries();
      resetForm();
      alert("Journal entry saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save journal entry");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async () => {
    if (!selectedEntry) return;
    const id = selectedEntry._id || selectedEntry.id;
    if (!id) return;

    const confirmDelete = window.confirm(
      "Delete this journal entry? This cannot be undone."
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/journal/${id}`);
      await reloadEntries();
      alert("Journal entry deleted");
    } catch (err) {
      console.error(err);
      alert("Failed to delete journal entry");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>
        Loading your journal...
      </div>
    );
  }

  const selectedId = selectedEntry && (selectedEntry._id || selectedEntry.id);

  return (
    <div className="animate-enter" style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: "2rem" }}>
      {/* FULL-WIDTH HEADER */}
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }} className="text-gradient">Daily Mood Journal</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 0, fontSize: "1.05rem" }}>
          Track how you feel over time. Create new entries or revisit
          previous ones to reflect on your emotional wellbeing.
        </p>
      </header>

      <div style={{ display: "flex", gap: "2rem", flexDirection: "row", alignItems: "flex-start" }}>
        {/* LEFT COLUMN */}
        <section style={{ flexBasis: "35%", maxWidth: 380, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* New entry button card */}
          <button
            type="button"
            className="btn-primary"
            onClick={openNewEntry}
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              padding: "1rem"
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "1rem" }}>
              + Enter New Journal
            </span>
          </button>

          {/* Previous entries list */}
          <div className="scroll-column" style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            maxHeight: "calc(100vh - 250px)",
            overflowY: "auto",
            paddingRight: "0.5rem"
          }}>
            {entries.map((e) => {
              const id = e._id || e.id;
              const isActive = selectedId === id;
              const moodValue = e.mood || e.rating || e.score || 0;
              const emotion = e.emotionLabel || e.emotion || e.label || "";

              const createdAt = e.createdAt || e.date;
              const dateStr = createdAt
                ? new Date(createdAt).toLocaleDateString()
                : "";

              const entryTitle =
                e.title ||
                (emotion
                  ? emotion.charAt(0).toUpperCase() + emotion.slice(1)
                  : "Journal entry");

              return (
                <button
                  key={id}
                  type="button"
                  className="glass-card"
                  onClick={() => handleSelectEntry(e)}
                  style={{
                    border: isActive ? "1px solid var(--accent)" : "1px solid var(--border-color)",
                    backgroundColor: isActive ? "rgba(16, 185, 129, 0.1)" : "var(--bg-card)",
                    textAlign: 'left',
                    padding: '1rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, lineHeight: 1.3, color: isActive ? "var(--accent)" : "var(--text-main)" }}>
                      {entryTitle}
                    </h3>

                    <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.8, color: "var(--text-muted)" }}>
                      <strong>{dateStr}</strong>
                      {emotion && <> · {emotion}</>}
                    </p>

                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--primary-light)", marginTop: "0.25rem" }}>
                      {renderStars(moodValue)}{" "}
                      <span style={{ fontSize: "0.8rem", marginLeft: 4, color: "var(--text-muted)" }}>
                        {moodValue}/5
                      </span>
                    </p>
                  </div>
                </button>
              );
            })}

            {entries.length === 0 && (
              <p style={{ color: "var(--text-muted)" }}>
                No entries yet. Start by creating your first journal entry.
              </p>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <section style={{ flex: 1, minWidth: 0 }}>
          {mode === "new" ? (
            <section className="glass-card" style={{ padding: "2rem" }}>
              <h2 style={{ marginTop: 0, fontSize: "1.5rem" }}>New journal entry</h2>

              {/* Mood + Emotion row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", marginTop: "1.5rem" }}>
                {/* Mood row */}
                <div>
                  <label>Mood (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    style={{ textAlign: "center", fontSize: "1.1rem" }}
                  />
                </div>

                {/* Emotion row */}
                <div>
                  <label>Emotion label <span style={{ opacity: 0.6, fontWeight: 400 }}>(e.g. Calm, Anxious)</span></label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="text"
                      value={emotionLabel}
                      onChange={(e) => setEmotionLabel(e.target.value)}
                      placeholder="Type an emotion…"
                    />
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setTagPickerOpen(true)}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Pick tag
                    </button>
                  </div>
                </div>
              </div>


              {/* Title */}
              <div style={{ marginTop: "1.5rem" }}>
                <label>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this entry a title…"
                />
              </div>

              {/* Journal text */}
              <div style={{ marginTop: "1.5rem" }}>
                <label>Journal entry</label>
                <textarea
                  value={entryText}
                  onChange={(e) => setEntryText(e.target.value)}
                  style={{ minHeight: 250, resize: "vertical", lineHeight: "1.6" }}
                  placeholder="Write whatever is on your mind. This is private to you."
                />
              </div>

              <div style={{ marginTop: "2rem", textAlign: "right" }}>
                <button
                  className="btn-primary"
                  onClick={saveEntry}
                  disabled={saving}
                  style={{ padding: "0.8rem 2rem", fontSize: "1rem" }}
                >
                  {saving ? "Saving..." : "Save Entry"}
                </button>
              </div>

              {/* Tag picker overlay */}
              {tagPickerOpen && (
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 999
                  }}
                  onClick={() => setTagPickerOpen(false)}
                >
                  <div
                    className="glass-card"
                    style={{
                      backgroundColor: "var(--bg-dark)", /* Opaque fallback */
                      padding: "2rem",
                      width: "100%",
                      maxWidth: 500,
                      border: "1px solid var(--primary)"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.25rem" }}>
                      Pick an emotion label
                    </h3>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", maxHeight: "60vh", overflowY: "auto" }} className="scroll-column">
                      {availableLabels.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="chip"
                          onClick={() => {
                            setEmotionLabel(tag.replace(/-/g, " "));
                            setTagPickerOpen(false);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {tag.replace(/-/g, " ")}
                        </button>
                      ))}
                    </div>

                    <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setTagPickerOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          ) : selectedEntry ? (
            // VIEW EXISTING ENTRY
            <section className="glass-card" style={{ padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div>
                  <h2 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1.75rem", lineHeight: 1.2 }}>
                    {selectedEntry.title || selectedEntry.emotionLabel || "Journal entry"}
                  </h2>

                  <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
                    {selectedEntry.createdAt && (
                      <strong>
                        {new Date(selectedEntry.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </strong>
                    )}
                    {selectedEntry.emotionLabel && (
                      <> · <span className="chip" style={{ padding: "0.1rem 0.5rem", fontSize: "0.8rem", verticalAlign: "middle" }}>{selectedEntry.emotionLabel}</span></>
                    )}
                  </p>

                  <p style={{ marginTop: "0.5rem", color: "var(--primary-light)", fontSize: "1.1rem" }}>
                    {renderStars(selectedEntry.mood)}{" "}
                    <span style={{ fontSize: "0.9rem", marginLeft: 4, color: "var(--text-muted)" }}>
                      {selectedEntry.mood}/5
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-outline"
                  onClick={deleteEntry}
                  disabled={deleting}
                  style={{
                    borderColor: "var(--secondary)",
                    color: "var(--secondary)",
                  }}
                >
                  {deleting ? "Deleting..." : "Delete Entry"}
                </button>
              </div>

              <div style={{ height: 1, background: "var(--border-color)", margin: "1.5rem 0" }} />

              <div style={{ lineHeight: 1.8, fontSize: "1.05rem", color: "var(--text-main)", whiteSpace: "pre-wrap" }}>
                {selectedEntry.text || selectedEntry.note}
              </div>
            </section>
          ) : (
            <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
              <p>Select an entry from the left to view perfectly formatted details.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
