import { useCallback, useEffect, useState } from "react";
import { getSignedDocumentFileUrl } from "@/services/files.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type { RemoteDocumentFile } from "@/types/document-file.types";
import { openResolvedUrlInNewTab } from "@/utils/open-resolved-url";

const OPEN_FILE_ERROR_MESSAGE = "No se pudo abrir el archivo. Intenta nuevamente.";

/**
 * URL firmada de un archivo almacenado, pedida solo mientras `enabled` sea
 * `true`. Devuelve `undefined` hasta tenerla (o si la firma falla).
 */
export function useSignedDocumentFileUrl(
  file: RemoteDocumentFile | undefined,
  enabled: boolean,
): string | undefined {
  const [resolved, setResolved] = useState<{ downloadPath: string; url: string } | null>(null);

  useEffect(() => {
    if (!file || !enabled) return;
    let cancelled = false;
    getSignedDocumentFileUrl(file)
      .then((url) => {
        if (!cancelled) setResolved({ downloadPath: file.downloadPath, url });
      })
      .catch((error: unknown) => {
        console.error("[useSignedDocumentFileUrl] Unable to sign file URL", error);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, file]);

  return resolved && file && resolved.downloadPath === file.downloadPath
    ? resolved.url
    : undefined;
}

/**
 * Igual que `useSignedDocumentFileUrl`, pero la URL se pide la primera vez que
 * el elemento observado entra en pantalla (miniaturas perezosas): una vista
 * genera como mucho una petición por miniatura visible.
 */
export function useLazySignedDocumentFileUrl(file: RemoteDocumentFile | undefined): {
  observeRef: (node: Element | null) => void;
  url: string | undefined;
} {
  const [node, setNode] = useState<Element | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!node || visible) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, visible]);

  return { observeRef: setNode, url: useSignedDocumentFileUrl(file, visible) };
}

/**
 * Abre un archivo almacenado pidiendo su URL firmada en el momento de abrirlo
 * (caduca a los 300 s, así que no se guarda al cargar la vista).
 */
export function useDocumentFileOpener() {
  const showError = useSnackbarStore((state) => state.showError);

  const openWithUrl = useCallback(
    async (file: RemoteDocumentFile, onUrl: (url: string) => void) => {
      try {
        onUrl(await getSignedDocumentFileUrl(file));
      } catch (error) {
        console.error("[useDocumentFileOpener] Unable to open file", error);
        showError(OPEN_FILE_ERROR_MESSAGE);
      }
    },
    [showError],
  );

  const openInNewTab = useCallback(
    async (file: RemoteDocumentFile) => {
      try {
        await openResolvedUrlInNewTab(() => getSignedDocumentFileUrl(file));
      } catch (error) {
        console.error("[useDocumentFileOpener] Unable to open file", error);
        showError(OPEN_FILE_ERROR_MESSAGE);
      }
    },
    [showError],
  );

  return { openWithUrl, openInNewTab };
}
