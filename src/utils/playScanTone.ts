export type ScanToneKind = "success" | "error";

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  sharedContext ??= new Ctor();
  return sharedContext;
}

const TONES: Record<ScanToneKind, { frequency: number; durationMs: number; type: OscillatorType }> = {
  success: { frequency: 1040, durationMs: 90, type: "sine" },
  error: { frequency: 220, durationMs: 380, type: "sawtooth" },
};

/** Tono corto de retroalimentación del escaneo (Web Audio). Nunca lanza. */
export function playScanTone(kind: ScanToneKind): void {
  try {
    const context = getAudioContext();
    if (!context) return;
    if (context.state === "suspended") void context.resume();
    const { frequency, durationMs, type } = TONES[kind];
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    const now = context.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + durationMs / 1000 + 0.02);
  } catch {
    // El audio es solo retroalimentación: un fallo no debe afectar la entrega.
  }
}
