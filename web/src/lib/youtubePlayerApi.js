let youtubePlayerApiPromise = null;

export function loadYouTubePlayerApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("La API de YouTube solo puede cargarse en el navegador."));
  }

  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubePlayerApiPromise) {
    return youtubePlayerApiPromise;
  }

  youtubePlayerApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-rapiclip-youtube-api="true"]');

    const finalize = () => {
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
        return;
      }

      reject(new Error("No se pudo inicializar la API de YouTube."));
    };

    const previousReadyHandler = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReadyHandler === "function") {
        previousReadyHandler();
      }

      finalize();
    };

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.defer = true;
    script.dataset.rapiclipYoutubeApi = "true";
    script.onerror = () => {
      reject(new Error("No se pudo cargar la API de YouTube."));
    };

    document.head.appendChild(script);
  });

  return youtubePlayerApiPromise;
}
