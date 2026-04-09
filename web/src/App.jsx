import { ClipPage } from "./pages/ClipPage";
import { PageFrame } from "./components/PageFrame";

function App() {
  const path = window.location.pathname;

  if (path === "/clip") {
    return <ClipPage />;
  }

  return (
    <PageFrame
      title="Rapiclip"
      subtitle="Esta app espera links públicos con la ruta /clip."
    >
      <section className="error-card">
        <h2>Ruta no encontrada</h2>
        <p>Por favor asegúrate de ingresar una ruta válida de videoclip.</p>
      </section>
    </PageFrame>
  );
}

export default App;
