/**
 * Tabla de origen de un archivo de PII. `document` y `supporting` son las dos
 * tablas de la solicitud de crédito; `client` es `ClientDocument`.
 */
export type DocumentFileSource = "document" | "supporting" | "client";

/**
 * Referencia a un archivo tal como la devuelve el API (contrato H4). No trae
 * URL: la URL firmada se pide aparte, al mostrar o abrir el archivo.
 */
export interface DocumentFileReference {
  fileId: number;
  source: DocumentFileSource;
  /** Código del tipo de documento (p. ej. `INE_FRONT`). */
  type: string;
  /** Nombre de descarga `<tipo>.<ext>`. */
  filename: string;
  /** Solo en las referencias de crédito servidas desde el detalle de cliente. */
  applicationId?: number;
}

/** Respuesta de los endpoints de descarga de archivos. */
export interface SignedDocumentFileUrlResponse {
  url: string;
  expiresInSeconds: number;
}

/**
 * Archivo ya almacenado, listo para descargarse: la referencia del API más la
 * ruta del endpoint que firma su URL, resuelta al mapear la respuesta.
 */
export interface RemoteDocumentFile {
  reference: DocumentFileReference;
  downloadPath: string;
}

/** Dueño del archivo, necesario para construir la ruta de descarga. */
export type DocumentFileOwner =
  | { applicationId: number }
  | { clientId: number };
