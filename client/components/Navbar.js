import Link from "next/link";
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function NavBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (err) {
        console.error("Navbar: failed to load user", err);
      }
    };
    loadUser();
  }, []);

  const avatarSrc = user?.avatarUrl || "/default-avatar.png";
  const displayName =
    user?.displayName || user?.username || user?.email || "Your profile";

  return (
    <header className="top-nav">
      <div className="top-nav-left">
        <Link href="/">
          <div className="top-nav-brand-wrapper">
            <img
              src="/LOGO.png"
              alt="Vibrance logo"
              className="top-nav-logo"
            />
            <span className="top-nav-brand">Vibrance</span>
          </div>
        </Link>
      </div>

      <nav className="top-nav-right">
        <Link href="/meditations" className="top-nav-link">
          Meditations
        </Link>
        <Link href="/journal" className="top-nav-link">
          Journal
        </Link>
        <Link href="/articles" className="top-nav-link">
          Articles
        </Link>

        <Link href="/profile" className="top-nav-avatar-link">
          <div className="nav-avatar-wrapper">
            <img
              src={avatarSrc}
              alt="Profile"
              className="nav-avatar-img"
            />
            <span className="nav-avatar-tooltip">{displayName}</span>
          </div>
        </Link>
      </nav>
    </header>
  );
}
