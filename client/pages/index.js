// client/pages/index.js
import { useEffect, useState } from "react";
import api from "../lib/api";
import QuickBreathing from "../components/QuickBreathing";
import UnguidedTimer from "../components/UnguidedTimer";
import { usePlayer } from "../context/PlayerContext";

function getGreeting(hour) {
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function mapWeatherCode(code) {
  if (code === undefined || code === null) return "weather unavailable";
  if (code === 0) return "clear sky";
  if (code === 1 || code === 2) return "mostly clear";
  if (code === 3) return "overcast";
  if (code >= 45 && code <= 48) return "foggy";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "showers";
  if (code >= 95 && code <= 99) return "thunderstorms";
  return "mixed conditions";
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [now, setNow] = useState(new Date());

  // home summary from backend
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // quote from backend
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState(false);

  // weather from Open-Meteo
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(false);

  // global player context (for potential future use)
  const { currentMeditation } = usePlayer() || {};

  // feedback for meditations
  const [feedbackMeditations, setFeedbackMeditations] = useState([]);
  const [feedbackMeditationId, setFeedbackMeditationId] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(null); // 1,2,3
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState("");

  // ---------- MINI CHART STYLES ----------
  const BAR_MAX_HEIGHT = 52;

  const miniChartRow = {
    display: "flex",
    gap: "0.3rem",
    alignItems: "flex-end",
    height: BAR_MAX_HEIGHT + 8,
    marginTop: "0.8rem"
  };

  const miniChartBarWrapper = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  };

  const miniChartBar = {
    width: "60%",
    borderRadius: 999,
    background: "var(--accent)",
    transition: "height 0.2s ease",
    boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)" // Neon glow
  };

  const miniChartBarMuted = {
    width: "60%",
    borderRadius: 999,
    background: "rgba(255, 255, 255, 0.1)",
    transition: "height 0.2s ease"
  };

  const miniChartLabel = {
    marginTop: "0.25rem",
    fontSize: "0.65rem",
    color: "var(--text-muted)"
  };

  const miniChartLegendRow = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginTop: "0.8rem",
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    flexWrap: "wrap"
  };

  const miniChartLegendItem = {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem"
  };

  const miniChartLegendSwatch = {
    width: 8,
    height: 8,
    borderRadius: 999
  };

  // ---------- LOADERS ----------
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { data } = await api.get("/home/summary");
        setSummary(data);
      } catch (err) {
        console.error("Failed to load home summary", err);
      } finally {
        setLoadingSummary(false);
      }
    };
    loadSummary();
  }, []);

  useEffect(() => {
    const loadQuote = async () => {
      try {
        const { data } = await api.get("/quotes/today");
        const q = data.quote || data;
        setQuote(q);
      } catch (err) {
        console.error("Failed to load quote", err);
        setQuoteError(true);
      }
    };
    loadQuote();
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=23.81&longitude=90.41&current=temperature_2m,weather_code&timezone=auto"
        );
        if (!res.ok) {
          throw new Error("Weather response not ok");
        }
        const data = await res.json();
        const temp = data.current?.temperature_2m;
        const code = data.current?.weather_code;
        const description = mapWeatherCode(code);
        if (typeof temp === "number") {
          setWeather({
            temperature: temp,
            description
          });
        } else {
          setWeatherError(true);
        }
      } catch (err) {
        console.error("Failed to load weather", err);
        setWeatherError(true);
      }
    };
    loadWeather();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const loadFeedbackMeditations = async () => {
      try {
        const { data } = await api.get("/meditations");
        const list = data.meditations || [];
        setFeedbackMeditations(list);
        if (!feedbackMeditationId && list.length > 0) {
          setFeedbackMeditationId(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to load meditations for feedback", err);
      }
    };
    loadFeedbackMeditations();
  }, []);

  // ---------- DERIVED VALUES ----------
  const displayName = user?.displayName || user?.username || "there";

  const hour = now.getHours();
  const greeting = getGreeting(hour);
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
  const timeStr = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  });

  const todaySummary = summary?.todaySummary || {
    didJournal: false,
    didMeditation: false,
    meditationMinutes: 0,
    targetMinutes: 5
  };

  const streakDays = summary?.streakDays || 0;
  const weekMinutes = summary?.weekMinutes || 0;
  const avgMood = summary?.avgMood ?? null;
  const calendarDays = summary?.calendarDays || [];
  const weekJournalCount = summary?.weekJournalCount || 0;
  const weekFullPracticeDays = summary?.weekFullPracticeDays || 0;

  const avgMoodDisplay = avgMood != null ? avgMood.toFixed(1) : "–";

  const recommended = [
    {
      id: "1",
      title: "Deep Forest Meditation",
      duration: 4,
      tags: ["focus", "calm"]
    },
    {
      id: "2",
      title: "Rain Sleep Meditation",
      duration: 5,
      tags: ["sleep", "evening"]
    },
    {
      id: "3",
      title: "Self-Compassion Break",
      duration: 8,
      tags: ["self-compassion", "kindness"]
    }
  ];

  const fallbackQuote = {
    text: "You do not have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman"
  };

  const quoteToShow = (() => {
    if (!quote || quoteError) return fallbackQuote;
    const text = quote.text || quote.q || quote.quote;
    const author = quote.author || quote.a || "Unknown";
    return {
      text: text || fallbackQuote.text,
      author: author || fallbackQuote.author
    };
  })();

  const last7Days = calendarDays.slice(-7);

  const maxMinutes =
    last7Days.length > 0
      ? Math.max(...last7Days.map((d) => d.meditationMinutes || 0), 1)
      : 1;

  const completedTasks =
    (todaySummary.didJournal ? 1 : 0) + (todaySummary.didMeditation ? 1 : 0);

  let heroSubline = `${dateStr} · ${timeStr}`;
  if (weather && !weatherError) {
    heroSubline += ` · ${Math.round(weather.temperature)}°C, ${weather.description}`;
  } else {
    heroSubline += " · Weather unavailable";
  }

  // ---------- FEEDBACK HANDLER ----------
  const handleSubmitFeedback = async () => {
    setFeedbackStatus("");

    if (!feedbackMeditationId) {
      setFeedbackStatus("Select a meditation first.");
      return;
    }
    if (!feedbackRating) {
      setFeedbackStatus("Pick how helpful it felt.");
      return;
    }

    setFeedbackSaving(true);
    try {
      await api.post(`/meditations/${feedbackMeditationId}/feedback`, {
        rating: feedbackRating,
        note: feedbackNote
      });
      setFeedbackStatus("Thanks — your feedback was saved.");
      setFeedbackNote("");
    } catch (err) {
      console.error("Failed to save feedback", err);
      setFeedbackStatus("Could not save feedback. Are you logged in?");
    } finally {
      setFeedbackSaving(false);
    }
  };

  // ---------- RENDER ----------
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: "90px" }} className="animate-enter">
      {/* HERO */}
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.2rem", fontSize: "2.5rem" }} className="text-gradient">
          {greeting}, {displayName}
        </h1>
        <p style={{ marginTop: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
          {heroSubline}
        </p>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <span className="chip">🔥 {streakDays}-day streak</span>
          <span className="chip">🧘 {weekMinutes} min meditated this week</span>
          <span className="chip">🙂 Avg mood {avgMoodDisplay}/5</span>
        </div>
      </header>

      {/* MAIN GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
        gap: "2rem",
        alignItems: "flex-start"
      }}
      >
        {/* LEFT COLUMN */}
        <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Today’s Practice */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>Today&apos;s Practice</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
              Two tiny wins to keep your streak alive.
            </p>

            <div style={{ height: 1, backgroundColor: "var(--border-color)", margin: "1rem 0" }} />

            {/* Task 1: Journal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <strong style={{ fontSize: "1.05rem" }}>Write a journal entry</strong>
                <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: "0.9rem" }}>
                  Capture how you&apos;re feeling today.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="chip" style={{
                  borderColor: todaySummary.didJournal ? "var(--accent)" : "var(--border-color)",
                  color: todaySummary.didJournal ? "var(--accent)" : "var(--text-muted)",
                  background: todaySummary.didJournal ? "rgba(16, 185, 129, 0.1)" : "transparent"
                }}>
                  {todaySummary.didJournal ? "Done" : "Not done"}
                </span>
                <div style={{ marginTop: "0.5rem" }}>
                  <a href="/journal">
                    <button className="btn-primary" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>Open Journal</button>
                  </a>
                </div>
              </div>
            </div>

            {/* Task 2: Meditation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "1.05rem" }}>
                  Meditate for at least {todaySummary.targetMinutes} minutes
                </strong>
                <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: "0.9rem" }}>
                  Any guided or unguided session counts.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="chip" style={{
                  borderColor: todaySummary.didMeditation ? "var(--accent)" : "var(--border-color)",
                  color: todaySummary.didMeditation ? "var(--accent)" : "var(--text-muted)",
                  background: todaySummary.didMeditation ? "rgba(16, 185, 129, 0.1)" : "transparent"
                }}>
                  {todaySummary.didMeditation ? "Done" : `${todaySummary.meditationMinutes}/${todaySummary.targetMinutes} min`}
                </span>
                <div style={{ marginTop: "0.5rem" }}>
                  <a href="/meditations">
                    <button className="btn-primary" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>Open Meditations</button>
                  </a>
                </div>
              </div>
            </div>

            {completedTasks === 1 && (
              <p style={{ color: "var(--text-muted)", marginTop: "1rem", fontSize: "0.9rem" }}>
                You&apos;ve already completed 1 of 2 tiny wins today. Finish the other to keep your streak glowing.
              </p>
            )}

            {completedTasks === 2 && (
              <p style={{ color: "var(--accent)", marginTop: "1rem", fontSize: "0.9rem" }}>
                Nice work – you&apos;ve completed today&apos;s practice. Anything extra is a bonus.
              </p>
            )}
          </div>

          {/* Streak calendar */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>Last 14 days</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
              Green = both tasks done, amber = one done, dim = none.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
              {calendarDays.map((d, idx) => {
                let bg = "rgba(255, 255, 255, 0.05)";
                let border = "var(--border-color)";
                let shadow = "none";

                if (d.status === "full") {
                  bg = "var(--accent)";
                  border = "var(--accent)";
                  shadow = "0 0 10px rgba(16, 185, 129, 0.4)";
                } else if (d.status === "partial") {
                  bg = "rgba(245, 158, 11, 0.3)"; // Amber with opacity
                  border = "#f59e0b";
                }

                return (
                  <div
                    key={`${d.date || d.label}-${idx}`}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      cursor: "default",
                      backgroundColor: bg,
                      borderColor: border,
                      borderWidth: 1,
                      borderStyle: "solid",
                      boxShadow: shadow,
                      color: d.status === "full" ? "#000" : "var(--text-main)"
                    }}
                    title={
                      d.status === "full"
                        ? "Both tasks completed"
                        : d.status === "partial"
                          ? "One task completed"
                          : "No tasks completed"
                    }
                  >
                    {d.label}
                  </div>
                );
              })}
              {calendarDays.length === 0 && !loadingSummary && (
                <p style={{ color: "var(--text-muted)" }}>
                  No activity yet. Your recent days will appear here as you start journaling and meditating.
                </p>
              )}
            </div>
          </div>

          {/* Recommended meditations */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>Recommended for you</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
              Based on your focus tags and recent mood. (Placeholder for now.)
            </p>

            <div style={{ height: 1, backgroundColor: "var(--border-color)", margin: "1rem 0" }} />

            {recommended.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid rgba(255,255,255,0.03)"
                }}
              >
                <div>
                  <strong style={{ fontSize: "1.05rem" }}>{m.title}</strong>
                  <p style={{ color: "var(--text-muted)", marginTop: 2, fontSize: "0.9rem" }}>
                    {m.duration} min session
                  </p>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    {m.tags.map((t) => (
                      <span key={t} className="chip" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                        {t.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <a href="/meditations">
                    <button className="btn-outline">Play</button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Mood summary + mood trend chart */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>How you&apos;ve been feeling</h2>

            {avgMood != null ? (
              <>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Average mood this week: <strong style={{ color: "var(--text-main)" }}>{avgMood.toFixed(1)}/5</strong>
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  This is based on your journal entries in the last 7 days.
                </p>
              </>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>
                We don&apos;t have enough data yet. Try adding a few journal entries with mood ratings.
              </p>
            )}

            {last7Days.length > 0 ? (
              <>
                <p style={{ color: "var(--text-muted)", marginTop: "1rem", fontSize: "0.85rem" }}>
                  Mood trend (last 7 days)
                </p>
                <div style={miniChartRow}>
                  {last7Days.map((d) => {
                    const v = typeof d.moodAvg === "number" ? d.moodAvg : null;
                    const barHeight = v ? (v / 5) * BAR_MAX_HEIGHT : 4;

                    const barStyle = v
                      ? { ...miniChartBar, height: `${barHeight}px` }
                      : { ...miniChartBarMuted, height: `${barHeight}px` };

                    return (
                      <div
                        key={d.date}
                        style={miniChartBarWrapper}
                        title={v ? `Mood ${v.toFixed(1)}/5 on ${d.date}` : `No mood recorded on ${d.date}`}
                      >
                        <div style={barStyle} />
                        <div style={miniChartLabel}>{d.label}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={miniChartLegendRow}>
                  <div style={miniChartLegendItem}>
                    <span style={{ ...miniChartLegendSwatch, backgroundColor: "var(--accent)" }} />
                    <span>Day with mood entry (higher bar = better mood)</span>
                  </div>
                  <div style={miniChartLegendItem}>
                    <span style={{ ...miniChartLegendSwatch, backgroundColor: "rgba(255,255,255,0.1)" }} />
                    <span>No mood recorded</span>
                  </div>
                </div>
              </>
            ) : (
              <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
                Your mood chart will appear here after a few days of journaling.
              </p>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Today’s quote */}
          <div className="glass-card" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
            {/* Decorative quote mark */}
            <div style={{ position: "absolute", top: -10, left: 10, fontSize: "6rem", opacity: 0.1, fontFamily: "serif", pointerEvents: "none" }}>“</div>

            <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>Today&apos;s quote</h2>
            <p style={{ fontStyle: "italic", marginBottom: "1rem", fontSize: "1.1rem", lineHeight: "1.6" }}>
              “{quoteToShow.text}”
            </p>
            <p style={{ color: "var(--text-muted)", textAlign: "right", marginTop: 0, fontSize: "0.9rem" }}>
              — {quoteToShow.author}
            </p>
          </div>

          {/* Quick practice */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>Quick practice</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
              Use a short breathing exercise or an unguided timer when you don&apos;t want a full guided session.
            </p>
            <div style={{ height: 1, backgroundColor: "var(--border-color)", margin: "1rem 0" }} />

            <div style={{ marginTop: "0.5rem" }}>
              <h3 style={{ fontSize: "1rem", margin: "0 0 0.5rem" }}>Guided Breathing</h3>
              <QuickBreathing />
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", margin: "0 0 0.5rem" }}>Unguided Meditation Timer</h3>
              <UnguidedTimer />
            </div>
          </div>

          {/* Session feedback */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>Today&apos;s session feedback</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
              Tell us how helpful your recent meditation felt. This helps Vibrance learn what works best for you.
            </p>

            {/* Meditation selector */}
            <div style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                Meditation
              </div>
              <select
                value={feedbackMeditationId}
                onChange={(e) => setFeedbackMeditationId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: 12,
                  border: "1px solid var(--border-color)",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  color: "var(--text-main)",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              >
                {feedbackMeditations.length === 0 && (
                  <option value="">No meditations available yet</option>
                )}
                {feedbackMeditations.map((m) => (
                  <option key={m._id} value={m._id} style={{ backgroundColor: "#111827" }}>
                    {m.title} · {m.category} · {m.durationMinutes} min
                  </option>
                ))}
              </select>
            </div>

            {/* Rating buttons */}
            <p style={{ marginTop: "1rem", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
              How helpful was your last session?
            </p>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              {[
                { value: 1, label: "Not really" },
                { value: 2, label: "Somewhat" },
                { value: 3, label: "Very helpful" }
              ].map((opt) => {
                const active = feedbackRating === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFeedbackRating(opt.value)}
                    style={{
                      borderRadius: 999,
                      padding: "0.4rem 1rem",
                      border: active ? "1px solid var(--accent)" : "1px solid var(--border-color)",
                      backgroundColor: active ? "rgba(16, 185, 129, 0.2)" : "transparent",
                      color: active ? "var(--accent)" : "var(--text-muted)",
                      fontSize: "0.85rem",
                      transition: "all 0.2s"
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Note */}
            <textarea
              placeholder="Anything you'd like to note about this session?"
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              style={{
                width: "100%",
                minHeight: 100,
                borderRadius: 12,
                border: "1px solid var(--border-color)",
                backgroundColor: "rgba(0,0,0,0.3)",
                color: "var(--text-main)",
                padding: "0.75rem",
                fontSize: "0.9rem",
                resize: "vertical",
                fontFamily: "inherit",
                outline: "none"
              }}
            />

            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmitFeedback}
                disabled={feedbackSaving || !feedbackMeditationId || !feedbackRating}
                style={{ opacity: (feedbackSaving || !feedbackMeditationId || !feedbackRating) ? 0.7 : 1 }}
              >
                {feedbackSaving ? "Saving..." : "Save feedback"}
              </button>
              {feedbackStatus && (
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {feedbackStatus}
                </span>
              )}
            </div>
          </div>

          {/* Weekly progress summary */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>This week at a glance</h2>
            <ul style={{ color: "var(--text-muted)", paddingLeft: "1.1rem", marginTop: "1rem", lineHeight: "1.8" }}>
              <li><strong style={{ color: "var(--text-main)" }}>{weekMinutes}</strong> minutes meditated</li>
              <li><strong style={{ color: "var(--text-main)" }}>{weekJournalCount}</strong> journal entries</li>
              <li><strong style={{ color: "var(--text-main)" }}>{weekFullPracticeDays}</strong> days with both tasks completed</li>
            </ul>

            {last7Days.length > 0 ? (
              <>
                <p style={{ color: "var(--text-muted)", marginTop: "1.5rem", fontSize: "0.9rem" }}>
                  Minutes meditated each day (last 7 days)
                </p>
                <div style={miniChartRow}>
                  {last7Days.map((d) => {
                    const v = d.meditationMinutes || 0;
                    const barHeight = v > 0 ? (v / maxMinutes) * BAR_MAX_HEIGHT : 4;

                    const barStyle = v > 0
                      ? { ...miniChartBar, height: `${barHeight}px` }
                      : { ...miniChartBarMuted, height: `${barHeight}px` };

                    return (
                      <div
                        key={d.date}
                        style={miniChartBarWrapper}
                        title={`${v} min on ${d.date}`}
                      >
                        <div style={barStyle} />
                        <div style={miniChartLabel}>{d.label}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={miniChartLegendRow}>
                  <div style={miniChartLegendItem}>
                    <span style={{ ...miniChartLegendSwatch, backgroundColor: "var(--accent)" }} />
                    <span>Minutes meditated (taller bar = more)</span>
                  </div>
                  <div style={miniChartLegendItem}>
                    <span style={{ ...miniChartLegendSwatch, backgroundColor: "rgba(255,255,255,0.1)" }} />
                    <span>No meditation logged</span>
                  </div>
                </div>
              </>
            ) : (
              <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
                Once you start meditating, we&apos;ll show your minutes per day here.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
