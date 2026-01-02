// client/context/PlayerContext.js
import { createContext, useContext, useEffect, useState } from "react";
import MeditationPlayer from "../components/MeditationPlayer";
import api from "../lib/api";

const PlayerContext = createContext(null);

export function PlayerProvider({ children, hidePlayer }) {
  const [currentMeditation, setCurrentMeditation] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Load favorites once (if logged in)
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const { data } = await api.get("/meditations/favorites/list");
        setFavorites(data.favorites.map((f) => f._id));
      } catch (err) {
        // not logged in / 401 – ignore
        console.error("Failed to load favorites in player context", err);
      }
    };
    loadFavorites();
  }, []);

  const isFavorite = (id) => favorites.includes(id);

  const toggleFavorite = async (id) => {
    try {
      await api.post(`/meditations/${id}/favorite`);
      setFavorites((prev) =>
        prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      );
    } catch (err) {
      console.error("Failed to toggle favorite from player context", err);
    }
  };

  const value = {
    currentMeditation,
    setCurrentMeditation,
    favorites,
    isFavorite,
    toggleFavorite
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {!hidePlayer && currentMeditation && (
        <MeditationPlayer
          meditation={currentMeditation}
          isFavorite={isFavorite(currentMeditation._id)}
          onFavorite={toggleFavorite}
        />
      )}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return ctx;
}
