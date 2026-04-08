import { ClipInfoCard } from "../components/ClipInfoCard";
import { ClipPlayer } from "../components/ClipPlayer";
import { PageFrame } from "../components/PageFrame";
import { parseClipParams } from "../lib/clipParams";

export function ClipPage() {
  const parsedClip = parseClipParams(window.location.search);

  if (!parsedClip.isValid) {
    return (
      <PageFrame
        title="Rapiclip"
        subtitle="No pudimos interpretar el link del clip."
      >
        <section className="error-card">
          <h2>Link inv\u00e1lido</h2>
          <p>{parsedClip.error}</p>
        </section>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="Rapiclip"
      subtitle="Vista previa inicial del clip generado desde la extensi\u00f3n."
    >
      <div className="content-stack">
        <ClipPlayer
          videoId={parsedClip.data.video}
          start={parsedClip.data.start}
          end={parsedClip.data.end}
        />
        <ClipInfoCard clip={parsedClip.data} />
      </div>
    </PageFrame>
  );
}
