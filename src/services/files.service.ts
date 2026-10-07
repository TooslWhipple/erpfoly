import { get } from "@/lib/axios";
import type {
  DocumentFileOwner,
  DocumentFileReference,
  RemoteDocumentFile,
  SignedDocumentFileUrlResponse,
} from "@/types/document-file.types";

/**
 * Una URL firmada se reutiliza mientras le quede al menos este margen de vida,
 * para que el visor nunca reciba una que caduque mientras la carga.
 */
const SIGNED_URL_REUSE_MARGIN_MS = 60_000;

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();
const inFlightSignedUrlRequests = new Map<string, Promise<string>>();

/**
 * Ruta del endpoint que firma la URL de un archivo: `files/client/...` para
 * `ClientDocument` y `files/credit-application/...` para las tablas de crédito.
 */
export function buildDocumentFileDownloadPath(
  reference: DocumentFileReference,
  owner: DocumentFileOwner,
): string {
  if (reference.source === "client") {
    if (!("clientId" in owner)) {
      throw new Error("Un archivo de cliente necesita el id del cliente para descargarse.");
    }
    return `/files/client/${owner.clientId}/${reference.fileId}`;
  }

  const applicationId =
    reference.applicationId ?? ("applicationId" in owner ? owner.applicationId : undefined);
  if (applicationId == null) {
    throw new Error("Un archivo de solicitud necesita el id de la solicitud para descargarse.");
  }
  return `/files/credit-application/${applicationId}/${reference.source}/${reference.fileId}`;
}

export function toRemoteDocumentFile(
  reference: DocumentFileReference,
  owner: DocumentFileOwner,
): RemoteDocumentFile {
  return { reference, downloadPath: buildDocumentFileDownloadPath(reference, owner) };
}

async function requestSignedDocumentFileUrl(downloadPath: string): Promise<string> {
  const result = await get<SignedDocumentFileUrlResponse>(downloadPath, {
    skipGlobalErrorToast: true,
  });
  if (result.error || !result.data) {
    throw new Error(result.error?.message ?? "No se pudo obtener el archivo.");
  }
  signedUrlCache.set(downloadPath, {
    url: result.data.url,
    expiresAt: Date.now() + result.data.expiresInSeconds * 1000,
  });
  return result.data.url;
}

/**
 * URL firmada (300 s) de un archivo almacenado. Reutiliza la última mientras le
 * quede margen y comparte la petición en curso, así varias vistas del mismo
 * archivo generan una sola descarga auditada.
 */
export function getSignedDocumentFileUrl(file: RemoteDocumentFile): Promise<string> {
  const { downloadPath } = file;
  const cached = signedUrlCache.get(downloadPath);
  if (cached && cached.expiresAt - Date.now() > SIGNED_URL_REUSE_MARGIN_MS) {
    return Promise.resolve(cached.url);
  }

  const inFlight = inFlightSignedUrlRequests.get(downloadPath);
  if (inFlight) {
    return inFlight;
  }

  const request = requestSignedDocumentFileUrl(downloadPath).finally(() => {
    inFlightSignedUrlRequests.delete(downloadPath);
  });
  inFlightSignedUrlRequests.set(downloadPath, request);
  return request;
}
