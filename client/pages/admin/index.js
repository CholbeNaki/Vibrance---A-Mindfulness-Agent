import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [meditationForm, setMeditationForm] = useState({
    title: "",
    description: "",
    audioUrl: "",
    category: "Beginners",
    durationMinutes: 10
  });

  const loadUsers = async () => {
    const { data } = await api.get("/admin/users");
    setUsers(data.users);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createMeditation = async () => {
    await api.post("/admin/meditations", meditationForm);
    alert("Meditation created");
  };

  const updateRole = async (id, role) => {
    await api.put(`/admin/users/${id}/role`, { role });
    loadUsers();
  };

  return (
    <div>
      <h1>Admin Panel</h1>

      <section>
        <h2>Create Meditation</h2>
        <input
          placeholder="Title"
          value={meditationForm.title}
          onChange={(e) =>
            setMeditationForm({ ...meditationForm, title: e.target.value })
          }
        />
        <textarea
          placeholder="Description"
          value={meditationForm.description}
          onChange={(e) =>
            setMeditationForm({
              ...meditationForm,
              description: e.target.value
            })
          }
        />
        <input
          placeholder="Audio URL"
          value={meditationForm.audioUrl}
          onChange={(e) =>
            setMeditationForm({ ...meditationForm, audioUrl: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Duration minutes"
          value={meditationForm.durationMinutes}
          onChange={(e) =>
            setMeditationForm({
              ...meditationForm,
              durationMinutes: Number(e.target.value)
            })
          }
        />
        <button onClick={createMeditation}>Create</button>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button onClick={() => updateRole(u._id, "user")}>
                    User
                  </button>
                  <button onClick={() => updateRole(u._id, "admin")}>
                    Admin
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
