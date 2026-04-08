export function PageFrame({ title, subtitle, children }) {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <span className="eyebrow">Rapiclip</span>
        <h1>{title}</h1>
        <p className="hero-copy">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
