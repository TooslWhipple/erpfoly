export interface NubariumSdkEvaluationResult {
  score?: number;
  evaluation?: string;
  retro?: string[];
}

export interface NubariumIdCaptureSuccessData {
  id: string;
  front?: string;
  back?: string;
  result?: NubariumSdkEvaluationResult;
  resources?: {
    front?: string;
    back?: string;
  };
}

export interface NubariumIdCaptureFailData {
  id?: string;
  reason?: string;
  result?: NubariumSdkEvaluationResult;
  resources?: {
    front?: string;
    back?: string;
  };
}

export interface NubariumFaceCaptureSuccessData {
  id: string;
  face?: string;
  frame?: string;
  result?: NubariumSdkEvaluationResult;
  resources?: {
    face?: string;
    frame?: string;
  };
}

export interface NubariumFaceCaptureFailData {
  id?: string;
  reason?: string;
  result?: NubariumSdkEvaluationResult;
  resources?: {
    face?: string;
    frame?: string;
  };
}

export interface NubariumSdkErrorData {
  code?: string | number;
  msg?: string;
  message?: string;
}

/** Preferencia / opciones de cámara del SDK web de Nubarium. */
export type NubariumCameraFacing = "front" | "back" | "default";

export interface NubariumIdCaptureInitConfig {
  rootElement: string;
  /** Orden de preferencia y opciones mostradas al usuario (FaceCapture / IdCapture). */
  cameras?: NubariumCameraFacing[] | NubariumCameraFacing;
  [key: string]: unknown;
}

export interface NubariumFaceCaptureInitConfig {
  rootElement: string;
  /** Orden de preferencia y opciones mostradas al usuario. */
  cameras?: NubariumCameraFacing[] | NubariumCameraFacing;
  [key: string]: unknown;
}

declare global {
  class IdCapture {
    init(config: NubariumIdCaptureInitConfig): void;
    setToken(token: string): void;
    load(onLoaded?: () => void): void;
    start(): void;
    retry(): void;
    clear(): void;
    getVersion(): string;
    onSuccess(callback: (data: NubariumIdCaptureSuccessData) => void): IdCapture;
    onFail(callback: (data: NubariumIdCaptureFailData) => void): IdCapture;
    onError(callback: (error: NubariumSdkErrorData) => void): IdCapture;
  }

  class FaceCapture {
    init(config: NubariumFaceCaptureInitConfig): void;
    setToken(token: string): void;
    load(onLoaded?: () => void): void;
    start(): void;
    retry(): void;
    clear(): void;
    getVersion(): string;
    onSuccess(callback: (data: NubariumFaceCaptureSuccessData) => void): FaceCapture;
    onFail(callback: (data: NubariumFaceCaptureFailData) => void): FaceCapture;
    onError(callback: (error: NubariumSdkErrorData) => void): FaceCapture;
  }
}

export {};
