export type { NubariumCameraOption } from "./media";
export {
  ensureNavigatorMediaDevices,
  getCameraAccessErrorMessage,
  getNubariumCameraOptions,
} from "./media";

export {
  NUBARIUM_FACE_CAPTURE_CONFIG,
  NUBARIUM_ID_CAPTURE_CONFIG,
} from "./config";

export {
  translateNubariumError,
  translateNubariumFailReason,
} from "./messages";

export {
  base64ToDataUrl,
  extractFaceCaptureImage,
  extractIdCaptureImages,
  extractNubariumExecutionId,
  extractSdkImageDataUrl,
  inferImageMimeType,
} from "./results";

export { safeClearNubariumCapture } from "./cleanup";

export type NubariumCaptureKind = "id" | "face";
