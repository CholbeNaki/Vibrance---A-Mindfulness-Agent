import { useEffect, useState } from "react";
import api from "../lib/api";
import StatsSummary from "../components/StatsSummary";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/stats/dashboard");
        setDashboard(data);
        const quoteRes = await api.get("/integrations/quote");
        setQuote(quoteRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h1>Personal Dashboard</h1>
      {quote && (
        <div style={{ marginBottom: "1rem", padding: "1rem", borderRadius: 8, background: "#0f172a" }}>
          <p>
            "{quote.quote}" — <strong>{quote.author}</strong>
          </p>
        </div>
      )}
      <StatsSummary stats={dashboard?.stats} />
      {dashboard && (
        <p style={{ marginTop: "1rem", fontStyle: "italic" }}>
          Recommendation: {dashboard.suggestion}
        </p>
      )}
    </div>
  );
}