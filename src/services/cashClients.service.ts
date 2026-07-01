import { post } from "@/lib/axios";
import type { ApiResult } from "@/lib/axios";

import type { Client } from "./clients.service";

export interface CreateCashClientPayload {
  firstName: string;
  lastSurname: string;
  secondSurname?: string;
  email?: string;
  phoneNumber?: string;
  postalCode?: string;
  neighborhoodFullCode?: string;
  street?: string;
  externalNumber?: string;
  internalNumber?: string;
  betweenStreets?: string;
  receiverPhone?: string;
  receiverName?: string;
  useClientPhone?: boolean;
  latitude?: string;
  longitude?: string;
  requiresInvoice?: boolean;
  rfc?: string;
  businessName?: string;
  taxRegimeId?: number;
  cfdiUseId?: number;
  fiscalPostalCode?: string;
  fiscalNeighborhoodFullCode?: string;
  fiscalStreet?: string;
  fiscalExternalNumber?: string;
  sendInvoiceByEmail?: boolean;
  invoiceEmail?: string;
  invoiceWhatsappNumber?: string;
}

export interface CreateCashClientResponse extends Client {
  message: string;
}

const BASE = "/clients";

export async function createCashClient(
  payload: CreateCashClientPayload
): Promise<ApiResult<CreateCashClientResponse>> {
  return post<CreateCashClientResponse>(BASE, payload);
}
