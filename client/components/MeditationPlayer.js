// client/components/MeditationPlayer.js
import { useEffect, useRef, useState } from "react";
import api from "../lib/api";

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function MeditationPlayer({
  meditation,
  isFavorite,
  onFavorite
}) {
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // avoid double-saving per session
  const [sessionRecorded, setSessionRecorded] = useState(false);

  // When meditation changes, reset player + recording flag
  useEffect(() => {
    const audio = audioRef.current;
    setDuration(0);
    setCurrentTime(0);
    setRemaining(0);
    setIsPlaying(false);
    setSessionRecorded(false);

    if (!audio || !meditation?.audioUrl) return;

    const handleLoadedMetadata = () => {
      if (!isFinite(audio.duration)) return;
      setDuration(audio.duration);
      setRemaining(audio.duration);
      setCurrentTime(0);
    };

    const handleTimeUpdate = () => {
      if (!isFinite(audio.duration)) return;
      setCurrentTime(audio.currentTime);
      setRemaining(Math.max(0, audio.duration - audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration || 0);
      setRemaining(0);
      recordSession("ended");
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    // reload new source
    audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [meditation?._id]); // run whenever a new meditation is selected

  const recordSession = async (reason) => {
    const audio = audioRef.current;
    if (!audio || !meditation) return;
    if (sessionRecorded) return; // already tracked this run

    const listenedSeconds =
      audio.currentTime && !Number.isNaN(audio.currentTime)
        ? audio.currentTime
        : duration || 0;

    // ignore super-short accidental plays
    if (listenedSeconds < 30) return;

    const minutes = Math.max(1, Math.round(listenedSeconds / 60));

    try {
      setSessionRecorded(true);
      await api.post("/stats/session", {
        durationMinutes: minutes,
        meditationId: meditation._id,
        source: "guided"
      });
      console.log(
        `Recorded guided session (${reason}):`,
        minutes,
        "minutes on",
        meditation.title
      );
    } catch (err) {
      console.error("Failed to record session", err);
      // do not reset sessionRecorded here, to avoid spamming the API
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // user is pausing – record partial session if long enough
      await recordSession("paused");
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Failed to play audio", err);
      }
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setRemaining(Math.max(0, duration - newTime));
  };

  if (!meditation) return null;

  const bgImage = meditation.imageUrl;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        borderTop: "1px solid #111827",
        backgroundColor: "rgba(15,23,42,0.96)",
        backdropFilter: "blur(6px)",
        zIndex: 50,
        overflow: "hidden"
      }}
    >
      {/* blurred background */}
      {bgImage && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.22,
            pointerEvents: "none"
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(20px)",
              transform: "scale(1.1)"
            }}
          />
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "0.55rem 1.5rem"
        }}
      >
        {/* Left: cover + text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            minWidth: 0
          }}
        >
          {bgImage && (
            <img
              src={bgImage}
              alt={meditation.title}
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                objectFit: "cover",
                flexShrink: 0
              }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden"
              }}
            >
              {meditation.title}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                opacity: 0.85,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden"
              }}
            >
              {meditation.coachName || "Vibrance Team"}
            </div>
          </div>
        </div>

        {/* Center: custom controls */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            minWidth: 0
          }}
        >
          <button
            type="button"
            onClick={togglePlay}
            style={{
              width: 36,
              height: 36,
              borderRadius: "999px",
              border: "1px solid rgba(249,250,251,0.6)",
              backgroundColor: "rgba(15,23,42,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1rem",
              color: "#f9fafb"
            }}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flex: 1,
              maxWidth: 420
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                opacity: 0.85,
                minWidth: 40
              }}
            >
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              style={{
                flex: 1,
                accentColor: "#f97316",
                background: "transparent"
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                opacity: 0.85,
                minWidth: 40
              }}
            >
              -{formatTime(remaining)}
            </span>
          </div>
        </div>

        {/* Right: favorite + remaining text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
            minWidth: 0
          }}
        >
          <button
            type="button"
            onClick={() =>
              onFavorite && onFavorite(meditation._id)
            }
            style={{
              width: 32,
              height: 32,
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(249,250,251,0.4)",
              cursor: "pointer"
            }}
          >
            <img
              src={isFavorite ? "/heart-filled.svg" : "/heart-outline.svg"}
              alt={isFavorite ? "Unfavorite" : "Favorite"}
              style={{
                width: 18,
                height: 18,
                display: "block"
              }}
            />
          </button>
          <span
            style={{
              fontSize: "0.75rem",
              opacity: 0.8
            }}
          >
            Remaining: {Math.round(remaining)}s
          </span>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} style={{ display: "none" }}>
        {meditation.audioUrl && (
          <source src={meditation.audioUrl} type="audio/mpeg" />
        )}
      </audio>
    </div>
  );
}
