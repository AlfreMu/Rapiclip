import { ClipPage } from "./pages/ClipPage";

function App() {
  const path = window.location.pathname;

  if (path === "/clip") {
    return <ClipPage />;
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <span className="eyebrow">Rapiclip</span>
        <h1>Ruta no encontrada</h1>
        <p className="hero-copy">
          Esta app espera links públicos con la ruta <code>/clip</code>.
        </p>
      </section>
    </main>
  );
}

export default App;
