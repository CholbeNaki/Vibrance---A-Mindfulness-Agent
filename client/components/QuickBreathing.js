// client/components/QuickBreathing.js
import { useEffect, useState } from "react";

// Popular, named breathing patterns
const BREATH_PATTERNS = {
  box: {
    key: "box",
    label: "Box breathing (4–4–4–4)",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Hold", duration: 4 },
      { name: "Exhale", duration: 4 },
      { name: "Hold", duration: 4 }
    ]
  },
  fourSevenEight: {
    key: "fourSevenEight",
    label: "4–7–8 breathing",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Hold", duration: 7 },
      { name: "Exhale", duration: 8 }
    ]
  },
  coherent: {
    key: "coherent",
    label: "Coherent breathing (5–5)",
    phases: [
      { name: "Inhale", duration: 5 },
      { name: "Exhale", duration: 5 }
    ]
  },
  relaxing: {
    key: "relaxing",
    label: "Relaxing pattern (4–2–6)",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Hold", duration: 2 },
      { name: "Exhale", duration: 6 }
    ]
  },
  energizing: {
    key: "energizing",
    label: "Energizing pattern (3–3–3)",
    phases: [
      { name: "Inhale", duration: 3 },
      { name: "Hold", duration: 3 },
      { name: "Exhale", duration: 3 }
    ]
  }
};

export default function QuickBreathing() {
  const [patternKey, setPatternKey] = useState("box");
  const phases = BREATH_PATTERNS[patternKey].phases || [];

  const initialDuration = phases[0]?.duration || 4;

  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(initialDuration);

  // Reset when pattern changes
  useEffect(() => {
    const firstDuration = phases[0]?.duration || 4;
    setIsRunning(false);
    setPhaseIndex(0);
    setSecondsLeft(firstDuration);
  }, [patternKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer logic (simplified & safe)
  useEffect(() => {
    if (!isRunning || phases.length === 0) return;

    let currentIndex = phaseIndex;
    let currentSeconds =
      secondsLeft || phases[currentIndex]?.duration || 4;

    const interval = setInterval(() => {
      currentSeconds -= 1;

      if (currentSeconds <= 0) {
        // advance phase
        currentIndex = (currentIndex + 1) % phases.length;
        const nextDuration =
          phases[currentIndex]?.duration || 4;
        currentSeconds = nextDuration;
        setPhaseIndex(currentIndex);
      }

      setSecondsLeft(currentSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isRunning,
    patternKey,
    phaseIndex,
    secondsLeft,
    phases.length
  ]);

  const safeIndex =
    phases.length > 0 ? phaseIndex % phases.length : 0;
  const currentPhase = phases[safeIndex];

  const progress = currentPhase
    ? 1 - (secondsLeft - 1) / currentPhase.duration
    : 0;

  return (
    <div style={{
      /* Inherit container style from parent or apply clean div */
    }}>
      {/* pattern selector */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
        gap: "0.5rem"
      }}>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Pattern</div>
        <select
          value={patternKey}
          onChange={(e) => setPatternKey(e.target.value)}
          style={{
            flex: 1,
            maxWidth: 240,
            padding: "0.4rem 0.6rem"
          }}
        >
          {Object.values(BREATH_PATTERNS).map((p) => (
            <option key={p.key} value={p.key} style={{ color: "black" }}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* current phase + timer */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: "var(--text-main)" }}>
          <strong>{currentPhase?.name || "Inhale"}</strong>
        </div>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          {secondsLeft}s ·{" "}
          {currentPhase?.duration || initialDuration}s phase
        </div>
      </div>

      <div style={{
        marginTop: "0.6rem",
        width: "100%",
        height: 80,
        borderRadius: "999px",
        border: "1px solid var(--border-color)",
        background: "radial-gradient(circle, rgba(15, 23, 42, 0.4), rgba(2, 6, 23, 0.4))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)"
      }}>
        <div style={{
          width: `${40 + progress * 40}%`,
          height: `${40 + progress * 40}%`,
          borderRadius: "999px",
          transition: "all 0.3s linear",
          background: "radial-gradient(circle, var(--accent), #059669)",
          boxShadow: "0 0 15px var(--accent)"
        }} />
      </div>

      {/* controls */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "1.25rem",
        gap: "0.5rem"
      }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsRunning((v) => !v)}
          style={{ minWidth: 80 }}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            const firstDuration = phases[0]?.duration || 4;
            setIsRunning(false);
            setPhaseIndex(0);
            setSecondsLeft(firstDuration);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
