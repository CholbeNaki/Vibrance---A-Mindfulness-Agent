
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="layout-container" style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "2rem",
        minHeight: "calc(100vh - 64px)" // Ensure full height for background
      }}>
        {children}
      </main>
    </div>
  );
}