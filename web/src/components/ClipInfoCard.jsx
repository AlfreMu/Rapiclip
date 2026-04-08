export function ClipInfoCard({ clip }) {
  return (
    <section className="info-card">
      <h2>Datos del clip</h2>
      <dl className="info-grid">
        <div className="info-row">
          <dt>Video ID</dt>
          <dd>
            <code>{clip.video}</code>
          </dd>
        </div>
        <div className="info-row">
          <dt>Inicio</dt>
          <dd>
            {clip.startLabel} <span className="muted">({clip.start}s)</span>
          </dd>
        </div>
        <div className="info-row">
          <dt>Fin</dt>
          <dd>
            {clip.endLabel} <span className="muted">({clip.end}s)</span>
          </dd>
        </div>
        <div className="info-row">
          <dt>Duraci\u00f3n</dt>
          <dd>
            {clip.durationLabel} <span className="muted">({clip.duration}s)</span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
