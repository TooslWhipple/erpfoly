export type { NubariumCameraOption } from "./media";
export {
  ensureNavigatorMediaDevices,
  getCameraAccessErrorMessage,
  getNubariumCameraOptions,
  isTouchCaptureDevice,
} from "./media";

export {
  NUBARIUM_FACE_CAPTURE_CONFIG,
  NUBARIUM_ID_CAPTURE_CONFIG,
} from "./config";

export {
  mapFramingFailMessageKey,
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

export type { CoverCropRect, NubariumCaptureKind } from "./patches";
export {
  applyNubariumCapturePatches,
  computeObjectFitCoverCrop,
  safeClearNubariumCapture,
} from "./patches";
