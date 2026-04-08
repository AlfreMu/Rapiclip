import { useEffect, useRef, useState } from "react";
import { loadYouTubePlayerApi } from "../lib/youtubePlayerApi";

const PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
};

function getPlayerErrorMessage(errorCode) {
  switch (errorCode) {
    case 2:
      return "No se pudo abrir el video solicitado.";
    case 5:
      return "YouTube no pudo reproducir el video en este navegador.";
    case 100:
      return "El video no existe o fue removido.";
    case 101:
    case 150:
      return "Este video no permite reproducción embebida.";
    default:
      return "No se pudo cargar el reproductor de YouTube.";
  }
}

export function ClipPlayer({ videoId, start, end }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const monitorRef = useRef(null);
  const destroyedRef = useRef(false);
  const [status, setStatus] = useState({
    type: "loading",
    message: "Cargando reproductor..."
  });

  function stopMonitoring() {
    if (monitorRef.current !== null) {
      window.clearInterval(monitorRef.current);
      monitorRef.current = null;
    }
  }

  function destroyPlayer() {
    stopMonitoring();

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
  }

  function clampToClipStart(player) {
    const currentTime = player.getCurrentTime();

    if (currentTime < start || currentTime >= end) {
      player.seekTo(start, true);
    }
  }

  function startMonitoring(player) {
    stopMonitoring();

    monitorRef.current = window.setInterval(() => {
      if (destroyedRef.current || !playerRef.current) {
        return;
      }

      const currentTime = player.getCurrentTime();
      if (currentTime >= end) {
        player.pauseVideo();
        player.seekTo(end, true);
        stopMonitoring();
      }
    }, 200);
  }

  useEffect(() => {
    destroyedRef.current = false;
    setStatus({
      type: "loading",
      message: "Cargando reproductor..."
    });

    destroyPlayer();

    let cancelled = false;

    loadYouTubePlayerApi()
      .then((YT) => {
        if (cancelled || destroyedRef.current || !hostRef.current) {
          return;
        }

        playerRef.current = new YT.Player(hostRef.current, {
          videoId,
          playerVars: {
            origin: window.location.origin,
            playsinline: 1,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onReady: (event) => {
              if (destroyedRef.current) {
                return;
              }

              setStatus({
                type: "ready",
                message: ""
              });

              event.target.loadVideoById({
                videoId,
                startSeconds: start
              });
              event.target.playVideo();
            },
            onStateChange: (event) => {
              if (destroyedRef.current) {
                return;
              }

              if (event.data === PLAYER_STATE.PLAYING) {
                clampToClipStart(event.target);
                startMonitoring(event.target);
                return;
              }

              if (
                event.data === PLAYER_STATE.PAUSED ||
                event.data === PLAYER_STATE.ENDED ||
                event.data === PLAYER_STATE.CUED ||
                event.data === PLAYER_STATE.UNSTARTED
              ) {
                stopMonitoring();
              }
            },
            onError: (event) => {
              if (destroyedRef.current) {
                return;
              }

              stopMonitoring();
              setStatus({
                type: "error",
                message: getPlayerErrorMessage(event.data)
              });
            }
          }
        });
      })
      .catch((error) => {
        if (cancelled || destroyedRef.current) {
          return;
        }

        setStatus({
          type: "error",
          message: error instanceof Error ? error.message : "No se pudo cargar el reproductor."
        });
      });

    return () => {
      cancelled = true;
      destroyedRef.current = true;
      destroyPlayer();
    };
  }, [videoId, start, end]);

  return (
    <section className="player-card">
      <div className="player-frame">
        {status.type !== "ready" ? (
          <div className="player-copy">
            <span className="player-badge">Rapiclip</span>
            <h2>{status.type === "error" ? "No se pudo cargar el video" : "Cargando clip"}</h2>
            <p>{status.message || "Preparando el reproductor de YouTube..."}</p>
          </div>
        ) : null}
        <div
          ref={hostRef}
          className="clip-player-host"
          aria-label="Reproductor de YouTube"
        />
      </div>
    </section>
  );
}
