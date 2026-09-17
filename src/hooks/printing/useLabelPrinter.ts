import { useCallback, useMemo, useState } from "react";
import {
  acknowledgePrinterSetup as persistPrinterSetup,
  getActivePrinterProfile,
  isPrinterConfigured as readPrinterConfigured,
  printPdfBlob,
  type LabelPrintMode,
  type PrintJobResult,
  type PrintJobStatus,
  type PrinterProfile,
  type PrintReceptionLabelsOptions,
} from "@/lib/printing";
import {
  fetchEtiquetaVentaPdf,
  fetchLabelPdf,
  fetchReceptionLabelsPdf,
  type FetchEtiquetaVentaPdfPayload,
} from "@/services/labels.service";

export class PrinterNotConfiguredError extends Error {
  constructor(profile: PrinterProfile) {
    super(`Configura la impresora ${profile.displayName} antes de imprimir`);
    this.name = "PrinterNotConfiguredError";
  }
}

export interface UseLabelPrinterResult {
  status: PrintJobStatus;
  progress: number | null;
  error: string | null;
  printerProfile: PrinterProfile;
  isConfigured: boolean;
  acknowledgePrinterSetup: () => void;
  printPdf: (blob: Blob) => Promise<PrintJobResult>;
  printLabel: (
    labelType: string,
    payload: Record<string, unknown>,
  ) => Promise<PrintJobResult>;
  printReceptionLabels: (
    receptionId: number,
    options?: PrintReceptionLabelsOptions,
  ) => Promise<PrintJobResult>;
  printEtiquetaVenta: (
    payload: FetchEtiquetaVentaPdfPayload,
  ) => Promise<PrintJobResult>;
}

export function useLabelPrinter(): UseLabelPrinterResult {
  const [status, setStatus] = useState<PrintJobStatus>("idle");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [configuredTick, setConfiguredTick] = useState(0);

  const printerProfile = useMemo(() => getActivePrinterProfile(), [configuredTick]);
  const isConfigured = useMemo(
    () => readPrinterConfigured(printerProfile.id),
    [printerProfile.id, configuredTick],
  );

  const acknowledgePrinterSetup = useCallback(() => {
    persistPrinterSetup(printerProfile.id);
    setConfiguredTick((tick) => tick + 1);
  }, [printerProfile.id]);

  const printPdf = useCallback(async (blob: Blob): Promise<PrintJobResult> => {
    setStatus("printing");
    setProgress((current) => (current == null ? 50 : Math.max(current, 50)));
    setError(null);
    try {
      const result = await printPdfBlob(blob, {
        onProgress: (value) => setProgress(value),
      });
      setProgress(100);
      setStatus("success");
      return result;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo abrir el diálogo de impresión";
      setError(message);
      setStatus("error");
      throw err;
    } finally {
      setProgress(null);
    }
  }, []);

  const printLabel = useCallback(
    async (
      labelType: string,
      payload: Record<string, unknown>,
    ): Promise<PrintJobResult> => {
      if (!readPrinterConfigured(printerProfile.id)) {
        throw new PrinterNotConfiguredError(printerProfile);
      }
      setStatus("fetching");
      setProgress(8);
      setError(null);
      try {
        const blob = await fetchLabelPdf(labelType, payload);
        setProgress(30);
        return await printPdf(blob);
      } catch (err) {
        if (err instanceof PrinterNotConfiguredError) throw err;
        const message =
          err instanceof Error ? err.message : "Error al imprimir la etiqueta";
        setError(message);
        setStatus("error");
        setProgress(null);
        throw err;
      }
    },
    [printPdf, printerProfile],
  );

  const printReceptionLabels = useCallback(
    async (
      receptionId: number,
      options: PrintReceptionLabelsOptions = {},
    ): Promise<PrintJobResult> => {
      if (!readPrinterConfigured(printerProfile.id)) {
        throw new PrinterNotConfiguredError(printerProfile);
      }
      const mode: LabelPrintMode = options.mode ?? "all";
      setStatus("fetching");
      setProgress(8);
      setError(null);
      options.onProgress?.(8);
      try {
        const blob = await fetchReceptionLabelsPdf(receptionId, {
          mode,
          skip: options.skip,
        });
        setProgress(30);
        options.onProgress?.(30);
        return await printPdf(blob);
      } catch (err) {
        if (err instanceof PrinterNotConfiguredError) throw err;
        const message =
          err instanceof Error
            ? err.message
            : "Error al imprimir las etiquetas";
        setError(message);
        setStatus("error");
        setProgress(null);
        throw err;
      }
    },
    [printPdf, printerProfile],
  );

  const printEtiquetaVenta = useCallback(
    async (payload: FetchEtiquetaVentaPdfPayload): Promise<PrintJobResult> => {
      if (!readPrinterConfigured(printerProfile.id)) {
        throw new PrinterNotConfiguredError(printerProfile);
      }
      setStatus("fetching");
      setProgress(8);
      setError(null);
      try {
        const blob = await fetchEtiquetaVentaPdf(payload);
        setProgress(30);
        return await printPdf(blob);
      } catch (err) {
        if (err instanceof PrinterNotConfiguredError) throw err;
        const message =
          err instanceof Error
            ? err.message
            : "Error al imprimir las etiquetas";
        setError(message);
        setStatus("error");
        setProgress(null);
        throw err;
      }
    },
    [printPdf, printerProfile],
  );

  return {
    status,
    progress,
    error,
    printerProfile,
    isConfigured,
    acknowledgePrinterSetup,
    printPdf,
    printLabel,
    printReceptionLabels,
    printEtiquetaVenta,
  };
}
