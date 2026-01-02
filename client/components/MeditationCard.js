export default function MeditationCard({
  meditation,
  onSelect,
  onFavorite,
  isFavorite
}) {
  const bgImage = meditation.imageUrl;

  const handleCardClick = () => {
    if (onSelect) onSelect();
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onFavorite) onFavorite(meditation._id);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        height: 140,
        backgroundColor: "#111827",
        border: "1px solid #1f2937"
      }}
    >
      {/* Background image */}
      {bgImage && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.9)"
          }}
        />
      )}


      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "0.85rem 1rem 0.85rem"
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "1rem",
              marginBottom: "0.2rem"
            }}
          >
            {meditation.title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.8rem",
              opacity: 0.9
            }}
          >
            {meditation.coachName || "Vibrance Team"} ·{" "}
            {meditation.durationMinutes} min
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.35rem",
            marginTop: "0.5rem"
          }}
        >
          {(meditation.tags || []).map((tag) => (
            <span
              key={tag}
              style={{
                padding: "0.2rem 0.6rem",
                borderRadius: 999,
                border: "1px solid rgba(249,250,251,0.3)",
                backgroundColor: "rgba(15,23,42,0.7)",
                fontSize: "0.75rem"
              }}
            >
              {tag.replace(/-/g, " ")}
            </span>
          ))}
        </div>
      </div>

      {/* Favorite heart */}
      <button
        type="button"
        onClick={handleFavoriteClick}
        style={{
          position: "absolute",
          right: 10,
          bottom: 10,
          width: 30,
          height: 30,
          borderRadius: "999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(15,23,42,0.7)",
          border: "1px solid rgba(249,250,251,0.4)",
          cursor: "pointer"
        }}
      >
        {/* Update these paths to your actual heart icons */}
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
    </div>
  );
}
