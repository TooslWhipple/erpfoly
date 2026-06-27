import type { CreditApplicationDocumentFile } from "@/types/credit-application-form.types";

const IMAGE_EXTENSION_PATTERN = /\.(jpe?g|png|gif|webp)(\?|#|$)/i;
const PDF_EXTENSION_PATTERN = /\.pdf(\?|#|$)/i;

function hasImageExtension(value: string): boolean {
  return IMAGE_EXTENSION_PATTERN.test(value);
}

function hasPdfExtension(value: string): boolean {
  return PDF_EXTENSION_PATTERN.test(value);
}

export function resolveDocumentPreviewUrl(
  file: CreditApplicationDocumentFile | undefined,
): string | undefined {
  if (!file) {
    return undefined;
  }

  const remoteUrl = file.url?.trim();
  if (remoteUrl) {
    return remoteUrl;
  }

  const remotePath = file.filePath?.trim();
  if (remotePath?.startsWith("http")) {
    return remotePath;
  }

  return undefined;
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

  const reference = [file.url, file.filePath, file.name].filter(Boolean).join(" ");
  if (hasPdfExtension(reference)) {
    return false;
  }
  if (hasImageExtension(reference)) {
    return true;
  }

  return options?.imageOnlySlot ?? false;
}
