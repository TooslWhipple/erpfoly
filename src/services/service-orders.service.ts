import {
  api,
  get,
  patch,
  post,
  unwrapOrThrow,
  type ApiResult,
} from "@/lib/axios";
import type {
  CreateServiceOrderPayload,
  ServiceOrder,
  ServiceOrderStatus,
  UpdateServiceOrderPayload,
} from "@/types/atencion-cliente.types";

const BASE = "/service-orders";

async function uploadRelatedFile(
  orderId: number,
  file: File,
  type: "PHOTO" | "DOCUMENT" = "PHOTO",
): Promise<number | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  formData.append("related_entity", "ServiceOrder");
  formData.append("related_entity_id", String(orderId));
  const uploaded = unwrapOrThrow(
    await post<{ id: number }>("/driver-files/upload", formData, {
      skipGlobalErrorToast: true,
      transformRequest: (data, headers) => {
        if (data instanceof FormData && headers) {
          delete headers["Content-Type"];
        }
        return data;
      },
    }),
  );
  return uploaded.id ?? null;
}

function flattenUpdate(payload: UpdateServiceOrderPayload) {
  return {
    title: payload.title,
    complaint: payload.queja?.complaint,
    observations: payload.queja?.observations,
    serialNumber: payload.queja?.serialNumber,
    quantity: payload.queja?.quantity,
    action: payload.indicaciones?.action,
    repairBy: payload.indicaciones?.repairBy,
    repairSupplierId: payload.indicaciones?.repairSupplierId,
    addCost: payload.indicaciones?.addCost,
    hours: payload.indicaciones?.hours,
    cost: payload.indicaciones?.cost,
    costAssignedTo: payload.indicaciones?.costAssignedTo,
    repairPlace: payload.indicaciones?.repairPlace,
    warehouseIntake: payload.indicaciones?.warehouseIntake || null,
    address: payload.indicaciones?.address,
    scheduledDate: payload.indicaciones?.scheduledDate,
    damageTypeId: payload.indicaciones?.damageTypeId,
    damageDescription: payload.indicaciones?.damageDescription,
    authorizedById: payload.indicaciones?.authorizedById,
    instructionsObservations: payload.indicaciones?.observations,
    replacementBy: payload.indicaciones?.replacementBy,
    branchId: payload.indicaciones?.branchId,
    recoveryReceiver: payload.indicaciones?.recoveryReceiver,
    assignedDriverId: payload.indicaciones?.assignedDriverId,
    assignedEmployeeId: payload.indicaciones?.assignedEmployeeId,
    repairTechnicianId: payload.indicaciones?.repairTechnicianId,
    isSolved: payload.solucion?.isSolved,
    solvedDate: payload.solucion?.solvedDate,
    approvalMethod: payload.solucion?.approvalMethod,
    deliveredSolutionId: payload.solucion?.deliveredSolutionId,
    solutionObservations: payload.solucion?.observations,
    solutionAuthorizedById: payload.solucion?.authorizedById,
  };
}

export async function createServiceOrder(
  payload: CreateServiceOrderPayload,
): Promise<ServiceOrder> {
  const created = unwrapOrThrow(
    await post<ServiceOrder>(BASE, {
      saleId: Number(payload.invoiceId),
      saleItemId: Number(payload.articleId),
      quantity: payload.quantity,
      serialNumber: payload.serialNumber,
      complaint: payload.complaint,
      observations: payload.observations,
    }),
  );
  const orderId = Number(created.id);
  for (const file of payload.evidenceFiles) {
    await uploadRelatedFile(orderId, file);
  }
  return (await getServiceOrderById(created.id)) ?? created;
}

export async function getServiceOrderById(
  serviceOrderId: string,
): Promise<ServiceOrder | null> {
  const result = await get<ServiceOrder>(`${BASE}/${serviceOrderId}`);
  if (result.error || !result.data) return null;
  return result.data;
}

export async function getServiceOrderByArticleId(
  articleId: string,
): Promise<ServiceOrder | null> {
  const result = await get<ServiceOrder | null>(
    `${BASE}?saleItemId=${encodeURIComponent(articleId)}`,
  );
  if (result.error || !result.data) return null;
  return result.data;
}

export async function updateServiceOrder(
  serviceOrderId: string,
  payload: UpdateServiceOrderPayload,
  options?: { requestCancellation?: boolean },
): Promise<ApiResult<ServiceOrder>> {
  const body = flattenUpdate(payload);
  const letter = payload.solucion?.acceptanceLetterFile;
  if (letter) {
    const fileId = await uploadRelatedFile(
      Number(serviceOrderId),
      letter,
      letter.type === "application/pdf" ? "DOCUMENT" : "PHOTO",
    );
    if (fileId != null) {
      (body as { acceptanceLetterFileId?: number }).acceptanceLetterFileId =
        fileId;
    }
  }

  const supplierAuth = payload.indicaciones?.supplierAuthorizationFile;
  if (supplierAuth) {
    const fileId = await uploadRelatedFile(
      Number(serviceOrderId),
      supplierAuth,
      supplierAuth.type === "application/pdf" ? "DOCUMENT" : "PHOTO",
    );
    if (fileId != null) {
      (
        body as { supplierAuthorizationFileId?: number }
      ).supplierAuthorizationFileId = fileId;
    }
  }

  const updated = await patch<ServiceOrder>(`${BASE}/${serviceOrderId}`, body, {
    skipGlobalErrorToast: true,
  });
  if (updated.error || !updated.data) {
    return { data: null, error: updated.error };
  }

  if (options?.requestCancellation) {
    const requested = await post<ServiceOrder>(
      `${BASE}/${serviceOrderId}/request-cancellation`,
      undefined,
      { skipGlobalErrorToast: true },
    );
    if (requested.error) {
      return { data: null, error: requested.error };
    }
  } else if (payload.indicaciones?.action === "reemplazar") {
    const applied = await post<ServiceOrder>(
      `${BASE}/${serviceOrderId}/apply-instructions`,
      undefined,
      { skipGlobalErrorToast: true },
    );
    if (applied.error) {
      return { data: null, error: applied.error };
    }
  }

  if (payload.solucion?.isSolved || payload.status === "finalizada") {
    const closed = await post<ServiceOrder>(
      `${BASE}/${serviceOrderId}/close`,
      undefined,
      { skipGlobalErrorToast: true },
    );
    if (closed.error) {
      return { data: null, error: closed.error };
    }
  }

  const refreshed = await getServiceOrderById(updated.data.id);
  return { data: refreshed ?? updated.data, error: null };
}

export async function updateServiceOrderStatus(
  serviceOrderId: string,
  status: ServiceOrderStatus,
): Promise<ApiResult<ServiceOrder>> {
  return patch<ServiceOrder>(`${BASE}/${serviceOrderId}/status`, { status }, {
    skipGlobalErrorToast: true,
  });
}

export async function downloadServiceOrderPdf(
  serviceOrderId: string,
): Promise<void> {
  const response = await api.get(`${BASE}/${serviceOrderId}/pdf`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `OS-${serviceOrderId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
