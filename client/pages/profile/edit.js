import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function EditProfilePage() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
        setUsername(data.username || "");
        setEmail(data.email || "");
        setDisplayName(data.displayName || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        username,
        email,
        displayName
      };
      if (newPassword) {
        payload.newPassword = newPassword;
      }

      await api.put("/users/me", payload);
      alert("Profile updated");
      window.location.href = "/profile";
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to update profile";
      setError(msg);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setAvatarUploading(true);
    setError("");
    try {
      const { data } = await api.post("/users/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setUser((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
      alert("Avatar updated");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to upload avatar";
      setError(msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Edit Profile</h1>

      <form
        onSubmit={handleSave}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          maxWidth: 400
        }}
      >
        {/* Avatar */}
        <div>
          <p>Avatar</p>
          {user.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt="Avatar preview"
              style={{
                width: 72,
                height: 72,
                borderRadius: "9999px",
                objectFit: "cover",
                border: "1px solid #1f2937",
                marginBottom: "0.5rem"
              }}
            />
          )}
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
          {avatarUploading && <p>Uploading avatar...</p>}
        </div>

        {/* Username */}
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        {/* Email */}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        {/* Display name */}
        <label>
          Display name
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>

        {/* Password change */}
        <label>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
        </label>

        {error && <p style={{ color: "#f97316" }}>{error}</p>}

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button type="submit">Save changes</button>
          <button
            type="button"
            onClick={() => (window.location.href = "/profile")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
