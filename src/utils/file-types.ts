/**
 * Detección del tipo de un archivo a partir de una referencia textual (nombre,
 * ruta o URL). Los patrones toleran el query-string y el fragmento porque las
 * URLs firmadas de GCS llegan siempre con parámetros (`?X-Goog-Signature=...`).
 *
 * Vive aparte de `credit-application-documents.ts` —su primer consumidor— para
 * que el visor de archivos pueda decidir entre imagen y PDF sin arrastrar los
 * tipos de solicitudes de crédito.
 */

const IMAGE_EXTENSION_PATTERN = /\.(jpe?g|png|gif|webp)(\?|#|$)/i;
const PDF_EXTENSION_PATTERN = /\.pdf(\?|#|$)/i;

export function hasImageExtension(value: string): boolean {
  return IMAGE_EXTENSION_PATTERN.test(value);
}

export function hasPdfExtension(value: string): boolean {
  return PDF_EXTENSION_PATTERN.test(value);
}
