// client/pages/_app.js
import "../styles.css"; // or "../styles/style.css" if that’s your actual file
import Layout from "../components/Layout";
import { PlayerProvider } from "../context/PlayerContext";
import { useRouter } from "next/router";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Hide player on login page
  const hidePlayer = router.pathname === "/login";

  return (
    <PlayerProvider hidePlayer={hidePlayer}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </PlayerProvider>
  );
}
