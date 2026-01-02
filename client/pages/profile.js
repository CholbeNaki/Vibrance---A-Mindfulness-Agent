import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../lib/api";

const ALL_TAGS = [
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

export default function Profile() {
  const [user, setUser] = useState(null);
  const [reminder, setReminder] = useState({
    enabled: false,
    time: "20:00",
    type: "meditation"
  });
  const [focusTags, setFocusTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(true);
  const [savingTags, setSavingTags] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
        setFocusTags(data.focusTags || []);

        const reminderRes = await api.get("/reminder");
        if (reminderRes.data && reminderRes.data.reminder) {
          setReminder((prev) => ({
            ...prev,
            ...reminderRes.data.reminder
          }));
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveReminder = async () => {
    try {
      await api.post("/reminder", reminder);
      alert("Reminder updated");
    } catch (err) {
      console.error(err);
      alert("Failed to update reminder");
    }
  };

  const toggleTag = (tag) => {
    setFocusTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const saveFocusTags = async () => {
    setSavingTags(true);
    try {
      await api.put("/users/me", { focusTags });
      setUser((prev) => (prev ? { ...prev, focusTags } : prev));
      alert("Focus areas updated");
    } catch (err) {
      console.error(err);
      alert("Failed to update focus areas");
    } finally {
      setSavingTags(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  };

  if (loading) return <div style={{ marginTop: "5rem", textAlign: "center", color: "var(--text-muted)" }}>Loading profile...</div>;
  if (!user) return <div style={{ marginTop: "5rem", textAlign: "center" }}>Could not load user.</div>;

  const displayName = user.displayName || user.username || user.email;
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : null;

  const reminderSummary = reminder.enabled
    ? `On at ${reminder.time} · ${reminder.type === "meditation" ? "Meditation" : "Journal"
    }`
    : "Off";

  const focusSummary =
    focusTags.length === 0
      ? "No focus areas selected yet"
      : focusTags.length <= 3
        ? focusTags.map((t) => t.replace(/-/g, " ")).join(", ")
        : `${focusTags
          .slice(0, 3)
          .map((t) => t.replace(/-/g, " "))
          .join(", ")} + ${focusTags.length - 3} more`;

  return (
    <div className="animate-enter" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: "4rem" }}>
      {/* Header with avatar + name + username/email + Edit + Logout buttons */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              style={{
                width: 80,
                height: 80,
                borderRadius: "9999px",
                objectFit: "cover",
                border: "2px solid var(--primary)",
                boxShadow: "0 0 20px var(--primary-glow)"
              }}
            />
          ) : (
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "9999px",
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 700,
              color: "white"
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: "1.75rem", lineHeight: 1.2 }}>{displayName}</h1>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
              @{user.username} · {user.email}
            </p>
            {memberSince && (
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Member since {memberSince}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/profile/edit">
            <button className="btn-outline">Edit</button>
          </Link>
          <button
            onClick={handleLogout}
            className="btn-outline"
            style={{
              borderColor: "rgba(220, 38, 38, 0.5)",
              color: "#fb7185" // refined red
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Favorites card */}
      <section className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Favorites</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              View and manage your favorite meditations.
            </p>
          </div>
          <Link href="/profile/favorites">
            <button className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>Open Favorites</button>
          </Link>
        </div>
      </section>

      {/* Focus tags selector card (dropdown) */}
      <section className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={() => setFocusOpen((o) => !o)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            textAlign: "left",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            color: "inherit"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>What are you working on?</h3>
              <p style={{ margin: 0, marginTop: "0.25rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Current: <span style={{ color: "var(--text-main)" }}>{focusSummary}</span></p>
            </div>
            <span style={{ fontSize: "1.25rem", color: "var(--text-muted)" }}>
              {focusOpen ? "▴" : "▾"}
            </span>
          </div>
        </button>

        {focusOpen && (
          <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
              Select the areas you&apos;re currently focusing on. This helps
              tailor your experience to your mental wellbeing goals.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem"
              }}
            >
              {ALL_TAGS.map((tag) => {
                const active = focusTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="chip"
                    style={{
                      borderColor: active ? "var(--accent)" : "var(--border-color)",
                      backgroundColor: active ? "rgba(16, 185, 129, 0.15)" : "transparent",
                      color: active ? "var(--accent)" : "var(--text-muted)",
                      cursor: "pointer"
                    }}
                  >
                    {tag.replace(/-/g, " ")}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
              <button
                className="btn-primary"
                onClick={saveFocusTags}
                disabled={savingTags}
              >
                {savingTags ? "Saving..." : "Save Focus Areas"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Reminder card (dropdown style) */}
      <section className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={() => setReminderOpen((o) => !o)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            textAlign: "left",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            color: "inherit"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Daily Reminder</h3>
              <p style={{ margin: 0, marginTop: "0.25rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Current: <span style={{ color: "var(--text-main)" }}>{reminderSummary}</span>
              </p>
            </div>
            <span style={{ fontSize: "1.25rem", color: "var(--text-muted)" }}>
              {reminderOpen ? "▴" : "▾"}
            </span>
          </div>
        </button>

        {reminderOpen && (
          <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1rem",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                checked={reminder.enabled}
                onChange={(e) =>
                  setReminder({ ...reminder, enabled: e.target.checked })
                }
                style={{ width: "auto", margin: 0, accentColor: "var(--primary)" }}
              />
              <span style={{ fontSize: "0.95rem" }}>Enable daily reminder</span>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label>Time</label>
                <input
                  type="time"
                  value={reminder.time}
                  onChange={(e) =>
                    setReminder({ ...reminder, time: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Type</label>
                <select
                  value={reminder.type}
                  onChange={(e) =>
                    setReminder({ ...reminder, type: e.target.value })
                  }
                >
                  <option value="meditation" style={{ color: "black" }}>Meditation</option>
                  <option value="journal" style={{ color: "black" }}>Journal</option>
                </select>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <button className="btn-primary" onClick={saveReminder}>Save Reminder</button>
            </div>
          </div>
        )}
      </section>

      {/* Insights card */}
      <section className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ marginTop: 0, fontSize: "1.1rem" }}>Mindfulness Insights (coming soon)</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: 0, fontSize: "0.9rem" }}>
          This section will show personalized analytics and AI-based insights
          about your practice once analysis features are enabled.
        </p>
      </section>
    </div>
  );
}
