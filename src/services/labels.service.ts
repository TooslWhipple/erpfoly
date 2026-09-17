import axios from "axios";
import { api, get } from "@/lib/axios";
import type { AxiosConfigWithSkipToast } from "@/lib/axios";
import type { LabelPrintMode } from "@/lib/printing";

export interface LabelTypeInfo {
  type: string;
  version: string;
  dimensions: {
    widthMm: number;
    heightMm: number;
    orientation: string;
    dpi: number;
  };
}

export async function getLabelTypes(): Promise<LabelTypeInfo[]> {
  const result = await get<LabelTypeInfo[]>("/labels/types");
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data ?? [];
}

async function blobFromPdfResponse(data: unknown, fallbackMessage: string): Promise<Blob> {
  if (data instanceof Blob) {
    const looksJson =
      data.type.includes("application/json") || data.type.includes("text/plain");
    if (looksJson) {
      const text = await data.text();
      try {
        const json = JSON.parse(text) as {
          error?: { message?: string };
          message?: string;
        };
        throw new Error(json.error?.message ?? json.message ?? fallbackMessage);
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error(fallbackMessage);
        }
        throw error;
      }
    }
    return data.type.includes("pdf")
      ? data
      : new Blob([data], { type: "application/pdf" });
  }

  return new Blob([data as BlobPart], { type: "application/pdf" });
}

export async function fetchLabelPdf(
  labelType: string,
  payload: Record<string, unknown>,
): Promise<Blob> {
  try {
    const response = await api.post(`/labels/${labelType}/pdf`, payload, {
      params: { disposition: "inline" },
      responseType: "blob",
      skipGlobalErrorToast: true,
    } as AxiosConfigWithSkipToast);
    return blobFromPdfResponse(response.data, "Error al generar la etiqueta");
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      return blobFromPdfResponse(error.response.data, "Error al generar la etiqueta");
    }
    throw error instanceof Error
      ? error
      : new Error("Error al generar la etiqueta");
  }
}

export interface FetchEtiquetaVentaPdfPayload {
  productId: number;
  quantity: number;
  promotionId?: number | null;
}

/** Product-driven sale labels (`etiqueta-venta`). */
export async function fetchEtiquetaVentaPdf(
  payload: FetchEtiquetaVentaPdfPayload,
): Promise<Blob> {
  return fetchLabelPdf("etiqueta-venta", {
    productId: payload.productId,
    quantity: payload.quantity,
    ...(payload.promotionId != null
      ? { promotionId: payload.promotionId }
      : { promotionId: null }),
  });
}

export async function fetchReceptionLabelsPdf(
  receptionId: number,
  options: { mode?: LabelPrintMode; skip?: number } = {},
): Promise<Blob> {
  try {
    const response = await api.post(
      `/merchandise-receptions/${receptionId}/labels/pdf`,
      undefined,
      {
        params: {
          mode: options.mode ?? "all",
          ...(options.skip != null ? { skip: options.skip } : {}),
        },
        responseType: "blob",
        skipGlobalErrorToast: true,
      } as AxiosConfigWithSkipToast,
    );
    return blobFromPdfResponse(
      response.data,
      "Error al generar las etiquetas de la recepción",
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      return blobFromPdfResponse(
        error.response.data,
        "Error al generar las etiquetas de la recepción",
      );
    }
    if (axios.isAxiosError(error)) {
      throw new Error(
        "No se pudieron generar las etiquetas. Intenta de nuevo.",
      );
    }
    throw error instanceof Error
      ? error
      : new Error("Error al generar las etiquetas de la recepción");
  }
}
