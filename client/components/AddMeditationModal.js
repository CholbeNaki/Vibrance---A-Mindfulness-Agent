
import { useState } from "react";
import api from "../lib/api";

export default function AddMeditationModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        audioUrl: "",
        imageUrl: "",
        coachName: "",
        durationMinutes: "",
        category: "Other",
        tags: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const categories = ["Sleep", "Anxiety", "Focus", "Beginners", "Other"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Process tags
            const tagsArray = formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t);

            await api.post("/meditations", {
                ...formData,
                tags: tagsArray,
                durationMinutes: Number(formData.durationMinutes)
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError("Failed to create meditation. Please check inputs.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "0.75rem",
        borderRadius: "0.5rem",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        border: "1px solid var(--border-color)",
        color: "var(--text-main)",
        outline: "none",
        fontSize: "0.95rem",
        marginBottom: "1rem"
    };

    const labelStyle = {
        display: "block",
        marginBottom: "0.4rem",
        fontSize: "0.9rem",
        color: "var(--text-muted)"
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 50,
                backgroundColor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem"
            }}
            onClick={onClose}
        >
            <div
                className="glass-card"
                style={{
                    width: "100%",
                    maxWidth: 500,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    padding: "2rem",
                    backgroundColor: "#0f172a", // fallback
                    border: "1px solid var(--border-color)"
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ marginTop: 0, fontSize: "1.5rem" }}>Add New Meditation</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                    Fill in the details below to add a new session to the library.
                </p>

                {error && (
                    <div
                        style={{
                            padding: "0.75rem",
                            backgroundColor: "rgba(239, 68, 68, 0.2)",
                            border: "1px solid rgba(239, 68, 68, 0.5)",
                            borderRadius: "0.5rem",
                            marginBottom: "1rem",
                            color: "#fca5a5"
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={labelStyle}>Title *</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="e.g. Morning Clarity"
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            {categories.map((c) => (
                                <option key={c} value={c} style={{ backgroundColor: "#1e293b" }}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Duration (mins) *</label>
                            <input
                                type="number"
                                name="durationMinutes"
                                required
                                min="1"
                                value={formData.durationMinutes}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Coach Name</label>
                            <input
                                type="text"
                                name="coachName"
                                value={formData.coachName}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="Vibrance Team"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Audio URL *</label>
                        <input
                            type="text"
                            name="audioUrl"
                            required
                            value={formData.audioUrl}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Image URL</label>
                        <input
                            type="text"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Tags (comma separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="calm, sleep, nature"
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            style={{ ...inputStyle, resize: "vertical" }}
                            placeholder="Short description of the session..."
                        />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                border: "1px solid var(--border-color)",
                                background: "transparent",
                                color: "var(--text-muted)",
                                cursor: "pointer"
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                border: "none",
                                background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                                color: "white",
                                fontWeight: "600",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? "Adding..." : "Add Meditation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
