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
        subtitle="El enlace del clip no es válido."
      >
        <section className="error-card">
          <h2>Enlace inválido</h2>
          <p>{parsedClip.error}</p>
        </section>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="Rapiclip"
      subtitle="Reproduce clips de YouTube desde un enlace."
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
