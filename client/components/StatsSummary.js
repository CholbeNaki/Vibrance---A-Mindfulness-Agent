export default function StatsSummary({ stats }) {
  if (!stats) return null;
  return (
    <div style={{ border: "1px solid #1f2937", borderRadius: 8, padding: "1rem" }}>
      <h3>Your Progress</h3>
      <p>Total minutes: {stats.totalMeditationMinutes}</p>
      <p>Total sessions: {stats.totalSessions}</p>
      <p>Current streak: {stats.currentStreak} days</p>
      <p>Longest streak: {stats.longestStreak} days</p>
    </div>
  );
}