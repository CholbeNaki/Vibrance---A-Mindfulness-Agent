import { useState } from "react";
import api from "../lib/api";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    displayName: ""
  });
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 360 }}>
        <input name="username" placeholder="Username" onChange={onChange} />
        <input name="email" placeholder="Email" onChange={onChange} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={onChange}
        />
        <input
          name="displayName"
          placeholder="Display Name (optional)"
          onChange={onChange}
        />
        <button type="submit">Create account</button>
        {error && <p style={{ color: "#f97316" }}>{error}</p>}
      </form>
    </div>
  );
}