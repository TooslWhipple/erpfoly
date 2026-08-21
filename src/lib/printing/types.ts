export interface PrinterProfile {
  id: string;
  displayName: string;
  driverName: string;
  driverPatterns: string[];
  widthMm: number;
  heightMm: number;
  dpi: number;
  setupGuideUrl: string;
}

export type PrintJobStatus =
  | "idle"
  | "fetching"
  | "printing"
  | "success"
  | "error";

export interface PrintJobOptions {
  jobName?: string;
  timeoutMs?: number;
  onProgress?: (progress: number) => void;
}

export interface PrintJobResult {
  success: boolean;
  printed: boolean;
  timedOut?: boolean;
}

export type LabelPrintMode = "all" | "extra";

export interface PrintReceptionLabelsOptions {
  mode?: LabelPrintMode;
  skip?: number;
  onProgress?: (progress: number) => void;
}
