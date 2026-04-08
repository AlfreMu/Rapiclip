(function rapiclipBootstrap() {
  "use strict";

  const RAPICLIP_PUBLIC_CLIP_BASE_URL = "https://rapiclip.vercel.app/clip";
  // const RAPICLIP_PUBLIC_CLIP_BASE_URL = "http://localhost:5173/clip";
  const RAPICLIP_PANEL_ID = "rapiclip-panel";
  const RAPICLIP_PANEL_CLASS = "rapiclip-panel";
  const RAPICLIP_TITLE_CLASS = "rapiclip-title";
  const RAPICLIP_ACTIONS_CLASS = "rapiclip-actions";
  const RAPICLIP_BUTTON_CLASS = "rapiclip-button";
  const RAPICLIP_DETAILS_CLASS = "rapiclip-details";
  const RAPICLIP_DETAIL_ROW_CLASS = "rapiclip-detail-row";
  const RAPICLIP_DETAIL_LABEL_CLASS = "rapiclip-detail-label";
  const RAPICLIP_DETAIL_VALUE_CLASS = "rapiclip-detail-value";
  const RAPICLIP_STATUS_CLASS = "rapiclip-status";
  const RAPICLIP_LINK_SECTION_CLASS = "rapiclip-link-section";
  const RAPICLIP_LINK_LABEL_CLASS = "rapiclip-link-label";
  const RAPICLIP_LINK_VALUE_CLASS = "rapiclip-link-value";
  const RAPICLIP_LINK_VALUE_EMPTY_CLASS = "rapiclip-link-value-empty";
  const RAPICLIP_LINK_HINT_CLASS = "rapiclip-link-hint";
  const RAPICLIP_START_BUTTON_ID = "rapiclip-mark-start";
  const RAPICLIP_END_BUTTON_ID = "rapiclip-mark-end";
  const RAPICLIP_RESET_BUTTON_ID = "rapiclip-reset";
  const RAPICLIP_GENERATE_BUTTON_ID = "rapiclip-generate-clip";
  const RAPICLIP_START_VALUE_ID = "rapiclip-start-value";
  const RAPICLIP_END_VALUE_ID = "rapiclip-end-value";
  const RAPICLIP_STATUS_VALUE_ID = "rapiclip-status-value";
  const RAPICLIP_LINK_VALUE_ID = "rapiclip-link-value";
  const RAPICLIP_DEFAULT_STATUS = "Extensi\u00f3n activa";
  const RAPICLIP_MOUNT_RETRY_LIMIT = 40;

  const APP_STATE = {
    lastUrl: window.location.href,
    lastVideoKey: getCurrentVideoKey(),
    startTime: null,
    endTime: null,
    generatedClipUrl: "",
    mountObserver: null,
    pendingMountFrame: null,
    mountRetryCount: 0,
    historyPatched: false
  };

  function isYouTubeWatchPage() {
    return window.location.hostname === "www.youtube.com" && window.location.pathname === "/watch";
  }

  function getCurrentVideoKey() {
    return `${window.location.pathname}${window.location.search}`;
  }

  function getExistingPanel() {
    return document.getElementById(RAPICLIP_PANEL_ID);
  }

  function getVideoElement() {
    return document.querySelector("video");
  }

  function getCurrentVideoId() {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get("v");

    if (!videoId) {
      return null;
    }

    return videoId;
  }

  function formatTime(seconds) {
    if (typeof seconds !== "number" || Number.isNaN(seconds) || seconds < 0) {
      return "--:--";
    }

    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  function createDetailRow(labelText, valueId, initialValue, extraClassName) {
    const row = document.createElement("p");
    row.className = RAPICLIP_DETAIL_ROW_CLASS;

    if (extraClassName) {
      row.classList.add(extraClassName);
    }

    const label = document.createElement("span");
    label.className = RAPICLIP_DETAIL_LABEL_CLASS;
    label.textContent = labelText;

    const value = document.createElement("span");
    value.id = valueId;
    value.className = RAPICLIP_DETAIL_VALUE_CLASS;
    value.textContent = initialValue;

    row.append(label, value);
    return row;
  }

  function createActionButton(id, label, isDisabled) {
    const button = document.createElement("button");
    button.id = id;
    button.className = RAPICLIP_BUTTON_CLASS;
    button.type = "button";
    button.textContent = label;
    button.disabled = Boolean(isDisabled);
    return button;
  }

  function createPanelElement() {
    const panel = document.createElement("section");
    panel.id = RAPICLIP_PANEL_ID;
    panel.className = RAPICLIP_PANEL_CLASS;

    const title = document.createElement("h2");
    title.className = RAPICLIP_TITLE_CLASS;
    title.textContent = "Rapiclip";

    const actions = document.createElement("div");
    actions.className = RAPICLIP_ACTIONS_CLASS;
    actions.append(
      createActionButton(RAPICLIP_START_BUTTON_ID, "▶"),
      createActionButton(RAPICLIP_END_BUTTON_ID, "⏹"),
      createActionButton(RAPICLIP_RESET_BUTTON_ID, "↺"),
      createActionButton(RAPICLIP_GENERATE_BUTTON_ID, "Clip")
    );

    const details = document.createElement("div");
    details.className = RAPICLIP_DETAILS_CLASS;
    details.append(
      createDetailRow("Inicio:", RAPICLIP_START_VALUE_ID, "--:--"),
      createDetailRow("Fin:", RAPICLIP_END_VALUE_ID, "--:--"),
      createDetailRow("Estado:", RAPICLIP_STATUS_VALUE_ID, RAPICLIP_DEFAULT_STATUS, RAPICLIP_STATUS_CLASS)
    );

    const linkSection = document.createElement("div");
    linkSection.className = RAPICLIP_LINK_SECTION_CLASS;

    const linkLabel = document.createElement("p");
    linkLabel.className = RAPICLIP_LINK_LABEL_CLASS;
    linkLabel.textContent = "Link";

    const linkValue = document.createElement("code");
    linkValue.id = RAPICLIP_LINK_VALUE_ID;
    linkValue.className = `${RAPICLIP_LINK_VALUE_CLASS} ${RAPICLIP_LINK_VALUE_EMPTY_CLASS}`;
    linkValue.textContent = "Todav\u00eda no hay un clip generado";
    linkValue.tabIndex = 0;
    linkValue.setAttribute("role", "button");
    linkValue.setAttribute("aria-label", "Copiar link generado");

    const linkHint = document.createElement("p");
    linkHint.className = RAPICLIP_LINK_HINT_CLASS;
    linkHint.textContent = "Click para copiar";

    linkSection.append(linkLabel, linkValue, linkHint);
    panel.append(title, actions, details, linkSection);
    bindPanelEvents(panel);
    return panel;
  }

  function findMountTarget() {
    // Priorizamos zonas estables de la interfaz de YouTube cercanas al reproductor.
    const selectors = [
      "#secondary #secondary-inner",
      "#below",
      "#meta",
      "#columns"
    ];

    for (const selector of selectors) {
      const target = document.querySelector(selector);
      if (target) {
        return target;
      }
    }

    return null;
  }

  function getUiElements() {
    const panel = getExistingPanel();
    if (!panel) {
      return null;
    }

    return {
      startValue: panel.querySelector(`#${RAPICLIP_START_VALUE_ID}`),
      endValue: panel.querySelector(`#${RAPICLIP_END_VALUE_ID}`),
      statusValue: panel.querySelector(`#${RAPICLIP_STATUS_VALUE_ID}`),
      linkValue: panel.querySelector(`#${RAPICLIP_LINK_VALUE_ID}`)
    };
  }

  function renderPanel() {
    const ui = getUiElements();
    if (!ui) {
      return;
    }

    ui.startValue.textContent = formatTime(APP_STATE.startTime);
    ui.endValue.textContent = formatTime(APP_STATE.endTime);

    if (APP_STATE.generatedClipUrl) {
      ui.linkValue.textContent = APP_STATE.generatedClipUrl;
      ui.linkValue.classList.remove(RAPICLIP_LINK_VALUE_EMPTY_CLASS);
      ui.linkValue.setAttribute("aria-disabled", "false");
      return;
    }

    ui.linkValue.textContent = "Todav\u00eda no hay un clip generado";
    ui.linkValue.classList.add(RAPICLIP_LINK_VALUE_EMPTY_CLASS);
    ui.linkValue.setAttribute("aria-disabled", "true");
  }

  function setStatusMessage(message) {
    const ui = getUiElements();
    if (!ui) {
      return;
    }

    ui.statusValue.textContent = message;
  }

  function clearGeneratedClipUrl() {
    APP_STATE.generatedClipUrl = "";
  }

  function resetClipState(statusMessage) {
    APP_STATE.startTime = null;
    APP_STATE.endTime = null;
    clearGeneratedClipUrl();
    renderPanel();
    setStatusMessage(statusMessage || RAPICLIP_DEFAULT_STATUS);
  }

  function getCurrentVideoTime() {
    const video = getVideoElement();
    if (!video) {
      return null;
    }

    return video.currentTime;
  }

  function hasValidClipRange() {
    return (
      typeof APP_STATE.startTime === "number" &&
      typeof APP_STATE.endTime === "number" &&
      APP_STATE.endTime > APP_STATE.startTime
    );
  }

  function buildClipUrl(videoId, startSeconds, endSeconds) {
    const url = new URL(RAPICLIP_PUBLIC_CLIP_BASE_URL);
    url.searchParams.set("video", videoId);
    url.searchParams.set("start", String(startSeconds));
    url.searchParams.set("end", String(endSeconds));
    return url.toString();
  }

  function handleMarkStart() {
    const currentTime = getCurrentVideoTime();
    if (currentTime === null) {
      setStatusMessage("No se encontr\u00f3 el video activo");
      return;
    }

    APP_STATE.startTime = currentTime;
    APP_STATE.endTime = null;
    clearGeneratedClipUrl();
    renderPanel();
    setStatusMessage(`Inicio marcado en ${formatTime(currentTime)}`);
  }

  function handleMarkEnd() {
    if (APP_STATE.startTime === null) {
      setStatusMessage("Primero marc\u00e1 un inicio");
      return;
    }

    const currentTime = getCurrentVideoTime();
    if (currentTime === null) {
      setStatusMessage("No se encontr\u00f3 el video activo");
      return;
    }

    if (currentTime <= APP_STATE.startTime) {
      APP_STATE.endTime = null;
      clearGeneratedClipUrl();
      renderPanel();
      setStatusMessage("El fin debe ser mayor al inicio");
      return;
    }

    APP_STATE.endTime = currentTime;
    clearGeneratedClipUrl();
    renderPanel();
    setStatusMessage(`Fin marcado en ${formatTime(currentTime)}`);
  }

  function handleGenerateClip() {
    if (!hasValidClipRange()) {
      clearGeneratedClipUrl();
      renderPanel();
      setStatusMessage("Primero marc\u00e1 inicio y fin");
      return;
    }

    const videoId = getCurrentVideoId();
    if (!videoId) {
      clearGeneratedClipUrl();
      renderPanel();
      setStatusMessage("No se pudo obtener el video actual");
      return;
    }

    const startSeconds = Math.floor(APP_STATE.startTime);
    const endSeconds = Math.floor(APP_STATE.endTime);

    if (endSeconds <= startSeconds) {
      clearGeneratedClipUrl();
      renderPanel();
      setStatusMessage("Primero marc\u00e1 inicio y fin");
      return;
    }

    APP_STATE.generatedClipUrl = buildClipUrl(videoId, startSeconds, endSeconds);
    renderPanel();
    setStatusMessage("Clip generado correctamente");
  }

  async function handleCopyGeneratedLink() {
    if (!APP_STATE.generatedClipUrl) {
      setStatusMessage("No hay un link generado para copiar");
      return;
    }

    const openedWindow = window.open(APP_STATE.generatedClipUrl, "_blank", "noopener,noreferrer");
    if (openedWindow) {
      openedWindow.opener = null;
    }

    let copied = false;

    try {
      await navigator.clipboard.writeText(APP_STATE.generatedClipUrl);
      copied = true;
    } catch (error) {
      copied = false;
    }

    if (copied && openedWindow) {
      setStatusMessage("Link copiado y abierto");
      return;
    }

    if (copied) {
      setStatusMessage("Link copiado");
      return;
    }

    if (openedWindow) {
      setStatusMessage("Link abierto, pero no se pudo copiar");
      return;
    }

    setStatusMessage("No hay un link generado para copiar");
  }

  function handleReset() {
    resetClipState("Valores reiniciados");
  }

  function bindPanelEvents(panel) {
    if (panel.dataset.rapiclipBound === "true") {
      return;
    }

    panel.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.id === RAPICLIP_START_BUTTON_ID) {
        handleMarkStart();
        return;
      }

      if (target.id === RAPICLIP_END_BUTTON_ID) {
        handleMarkEnd();
        return;
      }

      if (target.id === RAPICLIP_RESET_BUTTON_ID) {
        handleReset();
        return;
      }

      if (target.id === RAPICLIP_GENERATE_BUTTON_ID) {
        handleGenerateClip();
        return;
      }

      if (target.id === RAPICLIP_LINK_VALUE_ID) {
        void handleCopyGeneratedLink();
      }
    });

    panel.addEventListener("keydown", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.id !== RAPICLIP_LINK_VALUE_ID) {
        return;
      }

      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      void handleCopyGeneratedLink();
    });

    panel.dataset.rapiclipBound = "true";
  }

  function removePanelIfPresent() {
    const panel = getExistingPanel();
    if (panel) {
      panel.remove();
    }
  }

  function stopMountObserver() {
    if (APP_STATE.mountObserver) {
      APP_STATE.mountObserver.disconnect();
      APP_STATE.mountObserver = null;
    }
  }

  function ensurePanelMounted() {
    if (!isYouTubeWatchPage()) {
      removePanelIfPresent();
      stopMountObserver();
      return false;
    }

    const mountTarget = findMountTarget();
    if (!mountTarget) {
      return false;
    }

    const existingPanel = getExistingPanel();
    if (existingPanel) {
      bindPanelEvents(existingPanel);

      if (existingPanel.parentElement !== mountTarget) {
        mountTarget.prepend(existingPanel);
      }

      renderPanel();
      stopMountObserver();
      return true;
    }

    const panel = createPanelElement();
    mountTarget.prepend(panel);
    renderPanel();
    stopMountObserver();
    return true;
  }

  function schedulePanelMount() {
    if (APP_STATE.pendingMountFrame !== null) {
      return;
    }

    APP_STATE.pendingMountFrame = window.requestAnimationFrame(() => {
      APP_STATE.pendingMountFrame = null;
      const mounted = ensurePanelMounted();

      if (mounted) {
        APP_STATE.mountRetryCount = 0;
        return;
      }

      if (isYouTubeWatchPage()) {
        APP_STATE.mountRetryCount += 1;
        if (APP_STATE.mountRetryCount < RAPICLIP_MOUNT_RETRY_LIMIT) {
          startMountObserver();
        }
      }
    });
  }

  function startMountObserver() {
    if (APP_STATE.mountObserver || !document.body || !isYouTubeWatchPage()) {
      return;
    }

    APP_STATE.mountObserver = new MutationObserver((mutations) => {
      const hasRelevantMutation = mutations.some((mutation) => {
        return Array.from(mutation.addedNodes).some((node) => {
          if (!(node instanceof HTMLElement)) {
            return false;
          }

          return Boolean(
            node.matches?.("#below, #meta, #columns, ytd-watch-flexy, ytd-page-manager, ytd-app") ||
            node.querySelector?.("#below, #meta, #columns, #secondary #secondary-inner")
          );
        });
      });

      if (hasRelevantMutation) {
        schedulePanelMount();
      }
    });

    // Observamos solo mientras esperamos que YouTube termine de armar el layout del video.
    APP_STATE.mountObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function handleNavigationChange() {
    const currentUrl = window.location.href;
    if (currentUrl === APP_STATE.lastUrl) {
      return;
    }

    APP_STATE.lastUrl = currentUrl;
    APP_STATE.mountRetryCount = 0;

    const currentVideoKey = getCurrentVideoKey();
    if (currentVideoKey !== APP_STATE.lastVideoKey) {
      APP_STATE.lastVideoKey = currentVideoKey;
      resetClipState();
    }

    if (!isYouTubeWatchPage()) {
      removePanelIfPresent();
      stopMountObserver();
      return;
    }

    schedulePanelMount();
    startMountObserver();
  }

  function patchHistoryMethods() {
    if (APP_STATE.historyPatched) {
      return;
    }

    const wrapHistoryMethod = (methodName) => {
      const originalMethod = window.history[methodName];

      window.history[methodName] = function rapiclipHistoryWrapper(...args) {
        const result = originalMethod.apply(this, args);
        window.dispatchEvent(new Event("rapiclip:urlchange"));
        return result;
      };
    };

    wrapHistoryMethod("pushState");
    wrapHistoryMethod("replaceState");
    APP_STATE.historyPatched = true;
  }

  function registerNavigationListeners() {
    document.addEventListener("yt-navigate-finish", handleNavigationChange);
    window.addEventListener("popstate", handleNavigationChange);
    window.addEventListener("rapiclip:urlchange", handleNavigationChange);
  }

  function initializeRapiclip() {
    patchHistoryMethods();
    registerNavigationListeners();
    schedulePanelMount();
    startMountObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeRapiclip, { once: true });
  } else {
    initializeRapiclip();
  }
})();
