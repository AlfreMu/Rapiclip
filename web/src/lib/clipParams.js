function parseNumberParam(value) {
  if (value === null || value.trim() === "") {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return parsedValue;
}

function formatDuration(seconds) {
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function parseClipParams(search) {
  const params = new URLSearchParams(search);
  const video = params.get("video")?.trim() ?? "";
  const start = parseNumberParam(params.get("start"));
  const end = parseNumberParam(params.get("end"));

  if (!video) {
    return {
      isValid: false,
      error: "Falta el par\u00e1metro \"video\" o est\u00e1 vac\u00edo."
    };
  }

  if (start === null || end === null) {
    return {
      isValid: false,
      error: "Los par\u00e1metros \"start\" y \"end\" deben ser n\u00fameros v\u00e1lidos."
    };
  }

  if (start < 0 || end < 0) {
    return {
      isValid: false,
      error: "Los tiempos \"start\" y \"end\" no pueden ser negativos."
    };
  }

  if (end <= start) {
    return {
      isValid: false,
      error: "El par\u00e1metro \"end\" debe ser mayor que \"start\"."
    };
  }

  return {
    isValid: true,
    data: {
      video,
      start,
      end,
      duration: end - start,
      startLabel: formatDuration(start),
      endLabel: formatDuration(end),
      durationLabel: formatDuration(end - start)
    }
  };
}
