import type { PrintJobOptions, PrintJobResult } from "./types";

function attachHiddenIframe(): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);
  return iframe;
}

/**
 * Opens the browser print dialog for a PDF blob via a hidden iframe.
 * Resolves as soon as `print()` is called. The iframe stays until
 * `afterprint` or a cleanup timeout, so the dialog is not blanked.
 * Browsers cannot report whether the user selected a specific printer.
 */
export function printPdfBlob(
  blob: Blob,
  options: PrintJobOptions = {},
): Promise<PrintJobResult> {
  const blobUrl = window.URL.createObjectURL(blob);
  const iframe = attachHiddenIframe();

  return new Promise<PrintJobResult>((resolve, reject) => {
    let settled = false;
    let cleaned = false;
    let cleanupTimer: number | undefined;

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      if (cleanupTimer != null) window.clearTimeout(cleanupTimer);
      window.removeEventListener("afterprint", onAfterPrint);
      try {
        iframe.contentWindow?.removeEventListener("afterprint", onAfterPrint);
      } catch {
        // iframe may already be detached
      }
      iframe.remove();
      window.URL.revokeObjectURL(blobUrl);
    };

    const onAfterPrint = () => {
      options.onProgress?.(100);
      cleanup();
    };

    const fail = (error: Error) => {
      cleanup();
      if (settled) return;
      settled = true;
      reject(error);
    };

    iframe.onload = () => {
      try {
        window.addEventListener("afterprint", onAfterPrint);
        iframe.contentWindow?.addEventListener("afterprint", onAfterPrint);
        options.onProgress?.(50);
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        options.onProgress?.(100);
        cleanupTimer = window.setTimeout(cleanup, options.timeoutMs ?? 120_000);
        if (settled) return;
        settled = true;
        resolve({ success: true, printed: true });
      } catch (error) {
        fail(
          error instanceof Error
            ? error
            : new Error("No se pudo abrir el diálogo de impresión"),
        );
      }
    };

    iframe.onerror = () => {
      fail(new Error("No se pudo cargar el PDF para imprimir"));
    };

    iframe.src = blobUrl;
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
