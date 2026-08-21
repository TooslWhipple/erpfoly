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
 * Resolves when the dialog closes (`afterprint`) or when `print()` returns.
 * Browsers cannot report whether the user selected a specific printer.
 */
export function printPdfBlob(
  blob: Blob,
  options: PrintJobOptions = {},
): Promise<PrintJobResult> {
  const timeoutMs = options.timeoutMs ?? 120_000;
  const blobUrl = window.URL.createObjectURL(blob);
  const iframe = attachHiddenIframe();

  return new Promise<PrintJobResult>((resolve, reject) => {
    let settled = false;
    let printed = false;
    let timer: number | undefined;

    const cleanup = () => {
      if (timer != null) window.clearTimeout(timer);
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      try {
        iframe.contentWindow?.removeEventListener("beforeprint", onBeforePrint);
        iframe.contentWindow?.removeEventListener("afterprint", onAfterPrint);
      } catch {
        // iframe may already be detached
      }
      iframe.remove();
      window.URL.revokeObjectURL(blobUrl);
    };

    const finish = (result: PrintJobResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const onBeforePrint = () => {
      printed = true;
      options.onProgress?.(70);
    };

    const onAfterPrint = () => {
      options.onProgress?.(100);
      finish({ success: true, printed: true });
    };

    timer = window.setTimeout(() => {
      finish({ success: true, printed, timedOut: true });
    }, timeoutMs);

    iframe.onload = () => {
      try {
        window.addEventListener("beforeprint", onBeforePrint);
        window.addEventListener("afterprint", onAfterPrint);
        iframe.contentWindow?.addEventListener("beforeprint", onBeforePrint);
        iframe.contentWindow?.addEventListener("afterprint", onAfterPrint);
        options.onProgress?.(50);
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        // Blocking print() (Chromium) returns after the dialog closes.
        // If beforeprint already ran and afterprint never did, finish shortly.
        if (!settled && printed) {
          window.setTimeout(() => {
            if (settled) return;
            options.onProgress?.(100);
            finish({ success: true, printed: true });
          }, 500);
        }
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
