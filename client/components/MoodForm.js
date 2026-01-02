import { useState } from "react";
import api from "../lib/api";

export default function MoodForm({ onSaved }) {
  const [mood, setMood] = useState(3);
  const [emotion, setEmotion] = useState("");
  const [note, setNote] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/journal", { mood, emotion, note });
    setNote("");
    setEmotion("");
    onSaved && onSaved(data.entry);
  };

  return (
    <form
      onSubmit={submit}
      style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
    >
      <label>
        Mood (1–5):
        <input
          type="number"
          min="1"
          max="5"
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
        />
      </label>
      <input
        placeholder="Emotion label (e.g. Calm, Anxious)"
        value={emotion}
        onChange={(e) => setEmotion(e.target.value)}
      />
      <textarea
        placeholder="Private journal entry..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button type="submit">Save mood</button>
    </form>
  );
}