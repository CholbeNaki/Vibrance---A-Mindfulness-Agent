// client/components/UnguidedTimer.js
import { useEffect, useRef, useState } from "react";
import api from "../lib/api";

export default function UnguidedTimer() {
  // user-configured minutes (1–60)
  const [configMinutes, setConfigMinutes] = useState(5);
  // remaining countdown seconds
  const [remainingSeconds, setRemainingSeconds] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // audio for chime when timer ends
  const chimeRef = useRef(null);

  // init audio once on mount
  useEffect(() => {
    if (typeof Audio !== "undefined") {
      chimeRef.current = new Audio("/timerend.mp3");
    }
  }, []);

  // helper: format seconds as MM:SS
  const formatTime = (totalSeconds) => {
    const s = Math.max(0, totalSeconds || 0);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  // save a session to backend
  const saveSession = async (durationMinutes) => {
    if (durationMinutes < 1) return;

    setSaving(true);
    setStatusMessage("");

    try {
      await api.post("/stats/session", {
        durationMinutes
        // optionally: source: "unguided-timer"
      });
      setStatusMessage(
        `Saved ${durationMinutes} minute session.`
      );
    } catch (err) {
      console.error("Failed to save session", err);
      setStatusMessage(
        "Could not save this session. Are you logged in?"
      );
    } finally {
      setSaving(false);
    }
  };

  // countdown effect
  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setIsRunning(false);
          const fullMinutes = configMinutes;

          // play chime
          if (chimeRef.current) {
            try {
              chimeRef.current.currentTime = 0;
              chimeRef.current.play();
            } catch (err) {
              console.error("Chime failed to play", err);
            }
          }

          // auto-save full session length
          saveSession(fullMinutes);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, configMinutes]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMinutesChange = (e) => {
    const raw = e.target.value;
    const n = Number(raw);
    if (Number.isNaN(n)) return;

    const clamped = Math.max(1, Math.min(60, n));
    setConfigMinutes(clamped);
    setStatusMessage("");

    // only reset remaining time if timer is not running
    if (!isRunning) {
      setRemainingSeconds(clamped * 60);
    }
  };

  const handleStartPause = () => {
    setStatusMessage("");
    // if starting and time is 0, reset to configured minutes
    if (!isRunning && remainingSeconds <= 0) {
      setRemainingSeconds(configMinutes * 60);
    }
    setIsRunning((r) => !r);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(configMinutes * 60);
    setStatusMessage("");
  };

  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
        gap: "0.5rem"
      }}>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Timer length</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <input
            type="number"
            min={1}
            max={60}
            value={configMinutes}
            onChange={handleMinutesChange}
            disabled={isRunning}
            style={{
              width: 70,
              padding: "0.4rem 0.5rem",
              textAlign: "center"
            }}
          />
          <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>minutes</span>
        </div>
      </div>

      <div style={{
        fontSize: "2.5rem",
        fontVariantNumeric: "tabular-nums",
        marginBottom: "0.25rem",
        color: "var(--text-main)",
        textAlign: "center",
        fontFamily: "var(--font-heading)",
        fontWeight: 600,
        letterSpacing: "0.05em"
      }}>
        {formatTime(remainingSeconds)}
      </div>
      <div style={{
        fontSize: "0.85rem",
        color: "var(--text-muted)",
        textAlign: "center",
        marginBottom: "1.5rem"
      }}>
        Silent countdown for unguided practice. We&apos;ll log
        the session when the timer ends.
      </div>

      <div style={{
        display: "flex",
        gap: "0.75rem",
        marginTop: "0.5rem",
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        <button
          type="button"
          className="btn-primary"
          onClick={handleStartPause}
          disabled={saving}
          style={{ minWidth: 100 }}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={handleReset}
          disabled={saving}
        >
          Reset
        </button>
      </div>

      {statusMessage && (
        <p style={{
          fontSize: "0.85rem",
          color: "var(--accent)",
          marginTop: "1rem",
          textAlign: "center"
        }}>{statusMessage}</p>
      )}
    </div>
  );
}
