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
  ocr?: Record<string, unknown>;
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

declare global {
  class IdCapture {
    init(config: Record<string, unknown>): void;
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
    init(config: Record<string, unknown>): void;
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
