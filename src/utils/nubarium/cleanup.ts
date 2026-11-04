interface NubariumClearable {
  clear(): void;
}

/** Evita errores del SDK cuando React ya desmontó el contenedor root. */
export function safeClearNubariumCapture(
  capture: NubariumClearable | null | undefined,
  _rootElementId?: string,
): void {
  if (!capture) return;

  try {
    capture.clear();
  } catch {
    // The SDK may throw if the DOM was removed before cleanup.
  }
}
