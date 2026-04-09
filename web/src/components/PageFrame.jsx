export function PageFrame({ title, subtitle, children }) {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="title-row">
          <img src="/rapiclip-logo.png" alt="Rapiclip Logo" className="main-logo" />
          <h1>{title}</h1>
        </div>
        <p className="hero-copy">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
