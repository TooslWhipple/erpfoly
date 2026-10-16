import type {
  CreditApplicationDocumentFile,
  DocumentationTabValues,
} from "@/types/credit-application-form.types";
import type { DocumentFileSource, RemoteDocumentFile } from "@/types/document-file.types";
import { hasImageExtension, hasPdfExtension } from "@/utils/file-types";

/** Referencia de archivo tal como la espera el guardado de una sección. */
export interface DocumentFileReferencePayload {
  fileId: number;
  source: DocumentFileSource;
}

export function toStoredDocumentFile(remote: RemoteDocumentFile): CreditApplicationDocumentFile {
  return {
    id: `${remote.reference.source}-${remote.reference.fileId}`,
    name: remote.reference.filename,
    remote,
    uploadedAt: "Cargado",
  };
}

/** Referencias de los archivos ya almacenados de una lista (los locales aún no tienen id). */
export function toDocumentFileReferencePayload(
  files: CreditApplicationDocumentFile[],
): DocumentFileReferencePayload[] {
  return files.flatMap((file) =>
    file.remote
      ? [{ fileId: file.remote.reference.fileId, source: file.remote.reference.source }]
      : [],
  );
}

/** Ids de las listas que pertenecen a la tabla propia de la sección. */
export function collectOwnFileIds(
  lists: CreditApplicationDocumentFile[][],
  ownSource: DocumentFileSource,
): number[] {
  return lists.flatMap((files) =>
    files.flatMap((file) =>
      file.remote?.reference.source === ownSource ? [file.remote.reference.fileId] : [],
    ),
  );
}

/**
 * `removeFileIds` de una sección: los ids cargados de su tabla propia que ya no
 * están en ninguna de sus listas. Es la única vía de borrado del guardado.
 */
export function collectRemovedFileIds(
  persistedFileIds: number[],
  lists: CreditApplicationDocumentFile[][],
  ownSource: DocumentFileSource,
): number[] {
  const keptFileIds = new Set(collectOwnFileIds(lists, ownSource));
  return persistedFileIds.filter((fileId) => !keptFileIds.has(fileId));
}

/** Listas que reconcilia el guardado de documentación del cliente (sus 4 tipos). */
export function getClientDocumentationLists(
  documentation: DocumentationTabValues,
): CreditApplicationDocumentFile[][] {
  return [
    documentation.incomeProofFiles,
    documentation.employmentProofLetterFiles,
    documentation.ineFrontFiles,
    documentation.ineBackFiles,
  ];
}

export function isImageDocument(
  file: CreditApplicationDocumentFile,
  options?: { imageOnlySlot?: boolean },
): boolean {
  if (file.file) {
    if (file.file.type === "application/pdf") {
      return false;
    }
    if (file.file.type.startsWith("image/")) {
      return true;
    }
  }

  const reference = [file.remote?.reference.filename, file.name].filter(Boolean).join(" ");
  if (hasPdfExtension(reference)) {
    return false;
  }
  if (hasImageExtension(reference)) {
    return true;
  }

  return options?.imageOnlySlot ?? false;
}
