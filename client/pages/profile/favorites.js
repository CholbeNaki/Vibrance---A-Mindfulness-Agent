import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import MeditationCard from "../../components/MeditationCard";

export default function FavoriteMeditationsPage() {
  const [favorites, setFavorites] = useState([]);

  const loadFavorites = async () => {
    try {
      const { data } = await api.get("/meditations/favorites/list");
      setFavorites(data.favorites || []);
    } catch (err) {
      console.error("Failed to load favorites", err);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const toggleFavorite = async (id) => {
    try {
      await api.post(`/meditations/${id}/favorite`);
      await loadFavorites();
    } catch (err) {
      console.error("Failed to update favorite", err);
    }
  };

  const isFavorite = (id) => favorites.some((m) => m._id === id);

  return (
    <div>
      <h1>Your Favorite Meditations</h1>
      <p style={{ marginBottom: "1rem" }}>
        These are the meditations you have starred. You can manage them here.
      </p>

      {favorites.length === 0 && (
        <p>
          You have no favorites yet. Go to{" "}
          <Link href="/meditations">Meditation Library</Link> to add some.
        </p>
      )}

      {favorites.map((m) => (
        <MeditationCard
          key={m._id}
          meditation={m}
          onFavorite={toggleFavorite}
          isFavorite={isFavorite(m._id)}
        />
      ))}
    </div>
  );
}
