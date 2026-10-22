export const NUBARIUM_ID_CAPTURE_CONFIG = {
  timeouts: { front: 180000, back: 180000 },
  captureMode: {
    front: { enabled: true, after: 5000 },
    back: { enabled: true, after: 5000 },
  },
  guide: {
    front: { enabled: true },
    back: { enabled: true, until: 10000 },
  },
  // Visor Foly siempre 4:3 landscape — no rotar el JPEG post-captura.
  autorotate: false,
  antispoofing: {
    enabled: true,
    level: 1,
  },
  custom: { document: "MEX_IdCard" },
} as const;

export const NUBARIUM_FACE_CAPTURE_CONFIG = {
  maxValidations: 10,
  features: {
    disabled: [],
    enabled: ["glasses", "facemask"],
  },
  antispoofing: {
    enabled: false,
  },
  timeout: 180000,
} as const;
