export const FACE_MATCH_FAILURE_MESSAGE =
  "El rostro capturado no coincide con la identificación. Asegúrate de que la INE y la selfie correspondan a la misma persona e intenta de nuevo.";

export function formatFaceMatchScoreHint(
  score: number,
  threshold?: number,
): string | null {
  if (!(score > 0)) return null;
  const required = threshold ?? 60;
  const displayScore = score > 1 ? score : score * 100;
  const rounded =
    displayScore >= 10
      ? Math.round(displayScore)
      : Math.round(displayScore * 10) / 10;
  return `Similitud: ${rounded}% (requerido: ${required}%)`;
}

export async function imageUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("No se pudo cargar la imagen del INE frontal para verificar la identidad.");
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("No se pudo convertir la imagen del INE frontal."));
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen del INE frontal."));
    reader.readAsDataURL(blob);
  });
}
